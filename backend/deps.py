from fastapi import Request, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from datetime import datetime

from auth import decode_token
from database import users_collection
from models import user_model

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/login", auto_error=False)

def get_current_user(request: Request, token_header: str = Depends(oauth2_scheme)):
    # 1. Check HttpOnly cookie first
    token = request.cookies.get("access_token")

    # 2. Fall back to Authorization Bearer header if cookie not present
    if not token and token_header:
        token = token_header

    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required"
        )

    payload = decode_token(token)

    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token invalid or expired"
        )

    user_id = payload.get("id")
    email = payload.get("sub")
    name = payload.get("name")
    created_at_raw = payload.get("created_at")

    # Fast Path (0ms): In-memory resolution without database round-trip
    if user_id and email:
        try:
            created_at = datetime.fromisoformat(created_at_raw) if created_at_raw else datetime.utcnow()
        except Exception:
            created_at = datetime.utcnow()

        return {
            "id": user_id,
            "name": name or "User",
            "email": email,
            "created_at": created_at
        }

    # Fallback Path: Query MongoDB for legacy tokens without embedded user_id
    user = users_collection.find_one({"email": email})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return user_model(user)
