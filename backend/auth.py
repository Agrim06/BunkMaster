from passlib.context import CryptContext
from jose import jwt, JWTError
from datetime import datetime, timedelta
from config import SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES

pwd_context  = CryptContext(schemes=["bcrypt"] , deprecated = "auto")

def hash_password(password : str)->str:
    return pwd_context.hash(password)

def verify_password(password:str , hashed: str )->bool:
    return pwd_context.verify(password , hashed)

def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes = ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp" : expire})
    return jwt.encode(to_encode , SECRET_KEY ,algorithm=ALGORITHM)

def decode_token(token: str):

    try:
        payload = jwt.decode(token , SECRET_KEY , algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None