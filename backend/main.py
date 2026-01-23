from fastapi import FastAPI, HTTPException , Depends
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from datetime import datetime
from database import users_collection
from schemas.user import UserRegister, UserLogin, TokenResponse, UserResponse
from auth import hash_password, verify_password, create_access_token, decode_token
from models import user_model
from routes.attendance import router as attendance_router
from routes.subjects import router as subjects_router
from deps import get_current_user

app = FastAPI(title="BunkTracker API")

from fastapi.middleware.cors import CORSMiddleware

origins = [
    "http://localhost:5173",
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow all origins for Vercel/Render connection
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/login")

@app.post("/register")
def register(user : UserRegister):
    if users_collection.find_one({"email" : user.email}):
        raise HTTPException(status_code=401 , detail="Email already registered!")

    new_user = {
        "name" : user.name,
        "email" : user.email,
        "password" : hash_password(user.password),
        "min_attendance" : user.min_attendance,
        "created_at" : datetime.utcnow()
    }

    users_collection.insert_one(new_user)
    return { "message" : "User Registered Successfully"}    


@app.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends()):
    db_user = users_collection.find_one({"email": form_data.username})

    if not db_user or not verify_password(form_data.password, db_user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_access_token({"sub": db_user["email"]})
    return {
        "access_token": token,
        "token_type": "bearer"
    }

@app.get("/me", response_model=UserResponse)
def get_profile(current_user: dict = Depends(get_current_user)):
    return current_user


app.include_router(subjects_router)
app.include_router(attendance_router)