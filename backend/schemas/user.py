from pydantic import BaseModel, EmailStr

class UserRegister(BaseModel):
    name : str
    email : EmailStr
    password : str

class UserLogin(BaseModel):
    email : EmailStr
    password : str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"

class UserResponse(BaseModel):
    name: str
    email: EmailStr

class GoogleLoginRequest(BaseModel):
    idToken:str