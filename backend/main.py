from fastapi import FastAPI, HTTPException , Depends , Request, BackgroundTasks
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from datetime import datetime , timedelta
from database import users_collection, otp_collection
from schemas.user import UserRegister, UserLogin, TokenResponse, UserResponse, GoogleLoginRequest
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
def login(form_data: OAuth2PasswordRequestForm = Depends()):
    db_user = users_collection.find_one({"email": form_data.username})

    if not db_user or not verify_password(form_data.password, db_user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_access_token({"sub": db_user["email"]})
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
                "created_at" : datetime.utcnow()
            }
            users_collection.insert_one(new_user)
    
        token = create_access_token({"sub" : email})

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