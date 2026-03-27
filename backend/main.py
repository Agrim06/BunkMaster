from fastapi import FastAPI, HTTPException , Depends , Request, BackgroundTasks, Form
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from datetime import datetime , timedelta
from database import users_collection, otp_collection
from schemas.user import (
    UserRegister, UserLogin, TokenResponse, UserResponse, 
    GoogleLoginRequest, ForgotPasswordRequest, ResetPasswordRequest
)
from auth import hash_password, verify_password, create_access_token, decode_token
from models import user_model
from routes.attendance import router as attendance_router
from routes.subjects import router as subjects_router
from deps import get_current_user
from fastapi.middleware.cors import CORSMiddleware
from google.oauth2 import id_token
from google.auth.transport import requests
from otp import generate_otp
from smtp import send_otp_email
import os


app = FastAPI(title="BunkTracker API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "https://bunk-master-2026.vercel.app",
        "https://bunkmasterapp.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/login")

@app.middleware("http")
async def add_coop_header(request: Request, call_next):
    response = await call_next(request)
    response.headers["Cross-Origin-Opener-Policy"] = "same-origin-allow-popups"
    return response

@app.get("/ping")
def ping():
    return {"status": "ok", "message": "BunkTracker is awake!"}

@app.post("/register")
def register(user : UserRegister, background_tasks: BackgroundTasks):  
    if users_collection.find_one({"email" : user.email}):
        raise HTTPException(status_code=401 , detail="Email already registered!")

    otp = generate_otp()

    expiry = datetime.utcnow() + timedelta(minutes=5)

    otp_record = {
        "email": user.email,
        "otp": otp,
        "expires_at": expiry
    }
    
    otp_collection.update_one(
        {"email": user.email},
        {"$set": otp_record},
        upsert=True
    )

    # In production, sending synchronously helps surface SMTP failures
    # (many hosts block outbound SMTP or env vars may be missing).
    smtp_mode = (os.getenv("SMTP_SEND_MODE") or "").strip().lower()
    if smtp_mode == "sync":
        try:
            send_otp_email(user.email, otp)
        except Exception:
            otp_collection.delete_one({"email": user.email})
            raise HTTPException(
                status_code=500,
                detail="Failed to send OTP email. Please try again later."
            )
    else:
        background_tasks.add_task(send_otp_email, user.email, otp)

    new_user = {
        "name" : user.name,
        "email" : user.email,
        "password" : hash_password(user.password),
        "created_at" : datetime.utcnow(),
        "is_verified": False
    }

    users_collection.insert_one(new_user)
    return { "message" : "OTP sent successfully. Please check your email to verify your account."}    


@app.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends(), remember_me: bool = Form(False)):
    db_user = users_collection.find_one({"email": form_data.username})

    if not db_user or not verify_password(form_data.password, db_user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    if remember_me:
        expires = timedelta(days=30)
    else:
        expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)

    token = create_access_token({"sub": db_user["email"]}, expires_delta=expires)
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "name": db_user["name"],
            "email": db_user["email"]
        }
    }

@app.get("/me", response_model=UserResponse)
def get_profile(current_user: dict = Depends(get_current_user)):
    return current_user


app.include_router(subjects_router)
app.include_router(attendance_router)

@app.post("/google-login")
def google_login(request: GoogleLoginRequest):
    try:
        id_info = id_token.verify_oauth2_token(
            request.idToken,
            requests.Request(),
            os.getenv("VITE_GOOGLE_CLIENT_ID"),
            clock_skew_in_seconds = 10
        )
    
        email = id_info.get("email")
        name = id_info.get("name")

        if not email:
            raise HTTPException(status_code= 400, detail="Invalid Google Token")
        
        user = users_collection.find_one({"email" : email})

        if not user:
            new_user = {
                "name" : name,
                "email" : email,
                "password" : "",
                "created_at" : datetime.utcnow(),
                "is_verified": True
            }
            users_collection.insert_one(new_user)
    
        if remember_me:
            expires = timedelta(days=30)
        else:
            expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
        token = create_access_token({"sub" : email}, expires_delta=expires)

        return {
            "access_token":token,
            "token_type" : "bearer",
            "user":{
                "name":name,
                "email": email
            }
        }
    except ValueError as e:
        raise HTTPException(status_code= 401 , detail="Invalid Google Token")

from schemas.user import OTPVerify

@app.post("/verify-otp")
def verify_otp(data: OTPVerify):

    otp_record = otp_collection.find_one({
        "email": data.email.strip(),
        "otp": data.otp.strip()
    })

    if not otp_record:
        raise HTTPException(status_code=400, detail="Invalid OTP")

    if otp_record["expires_at"] < datetime.utcnow():
        raise HTTPException(status_code=400, detail="OTP expired")

    users_collection.update_one(
        {"email": data.email},
        {"$set": {"is_verified": True}}
    )

    otp_collection.delete_one({"_id": otp_record["_id"]})

    return {"message": "Email verified successfully"}

@app.post("/forgot-password")
def forgot_password(data: ForgotPasswordRequest, background_tasks: BackgroundTasks):
    user = users_collection.find_one({"email": data.email})
    if not user:
        # For security, we might not want to disclose if the email exists, 
        # but for this app's UX, we'll return a message suggesting it was sent if found.
        return {"message": "If an account with that email exists, an OTP has been sent."}

    otp = generate_otp()
    expiry = datetime.utcnow() + timedelta(minutes=5)

    otp_record = {
        "email": data.email,
        "otp": otp,
        "expires_at": expiry
    }

    otp_collection.update_one(
        {"email": data.email},
        {"$set": otp_record},
        upsert=True
    )

    background_tasks.add_task(
        send_otp_email, 
        data.email, 
        otp,
        subject="BunkMaster - Password Reset Request",
        body=f"Hello,\n\nWe received a request to reset your BunkMaster password. Your OTP is: {otp}\n\nIf you did not request this, you can safely ignore this email.\n\nThis code will expire in 5 minutes."
    )
    return {"message": "OTP sent successfully. Please check your email."}

@app.post("/reset-password")
def reset_password(data: ResetPasswordRequest):
    otp_record = otp_collection.find_one({
        "email": data.email.strip(),
        "otp": data.otp.strip()
    })

    if not otp_record:
        raise HTTPException(status_code=400, detail="Invalid OTP")

    if otp_record["expires_at"] < datetime.utcnow():
        raise HTTPException(status_code=400, detail="OTP expired")

    # Update user password
    result = users_collection.update_one(
        {"email": data.email},
        {"$set": {"password": hash_password(data.new_password)}}
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")

    # Clear OTP after successful reset
    otp_collection.delete_one({"_id": otp_record["_id"]})

    return {"message": "Password reset successfully"}