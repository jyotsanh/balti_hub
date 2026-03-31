from typing import Any
from datetime import timedelta, timezone, datetime
from jose import jwt, JWTError

from fastapi.security import OAuth2PasswordBearer
from fastapi import Depends, HTTPException , status
from passlib.context import CryptContext
from uuid import UUID

from src.models import User
from src.schemas import TokenPayload
from src.config import settings

ALGORITHM = "HS256"
oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/login/access-token")
password_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def get_hashed_password(password: str) -> str:
    return password_context.hash(password)


def verify_password(password: str, hashed_pass: str) -> bool:
    return password_context.verify(password, hashed_pass)


async def authenticate_user(email: str, password: str) -> User | None:
    user = await User.find_one({"email": email})
    if not user:
        return None
    if user.hashed_password is None or not verify_password(
        password, user.hashed_password
    ):
        return None
    return user

def create_access_token(subject: str | Any, expires_delta: timedelta | None = None):
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=15)
    to_encode = {"exp": expire, "sub": str(subject)}
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def _get_current_user(token):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[ALGORITHM])
        userid: UUID | None = payload.get("sub")
        if userid is None:
            raise credentials_exception
        token_data = TokenPayload(uuid=userid)
    except JWTError:
        raise credentials_exception
    user = await User.find_one({"uuid": token_data.uuid})
    if user is None:
        raise credentials_exception
    return user

async def get_current_user(token:str = Depends(oauth2_scheme)):
    return await _get_current_user(token)


def get_current_active_user(
    current_user: User = Depends(get_current_user),
) -> User:
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user

def get_current_active_superuser(
    current_user: User = Depends(get_current_user),
) -> User:
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=400, detail="The user doesn't have enough privileges"
        )
    return current_user