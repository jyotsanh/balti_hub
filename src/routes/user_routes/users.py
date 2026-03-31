from typing import Any
from uuid import UUID

from beanie.exceptions import RevisionIdWasChanged
from fastapi import APIRouter, Body, Depends, HTTPException
from pydantic.networks import EmailStr
from pymongo import errors

from src.schemas import User, UserUpdate
from src.auth import (
    get_current_active_user,
    get_hashed_password,
)
from src.models import User

router = APIRouter()


@router.post("", response_model=User)
async def register_user(
    password: str = Body(...),
    email: EmailStr = Body(...),
    first_name: str = Body(None),
    last_name: str = Body(None),
):
    """
    Register a new user.
    """
    hashed_password = get_hashed_password(password)
    user = User(
        email=email,
        hashed_password=hashed_password,
        first_name=first_name,
        last_name=last_name,
    )
    try:
        await user.create()
        return user
    except errors.DuplicateKeyError:
        raise HTTPException(
            status_code=400, detail="User with that email already exists."
        )


@router.get("/me", response_model=User)
async def get_profile(
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Get current user.
    """
    return current_user


@router.patch("/me", response_model=User)
async def update_profile(
    update: UserUpdate,
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Update current user.
    """
    update_data = update.model_dump(
        exclude={"is_active", "is_superuser"}, exclude_unset=True
    )
    try:
        if update_data["password"]:
            update_data["hashed_password"] = get_hashed_password(update_data["password"])
            del update_data["password"]
    except KeyError:
        pass
    current_user = current_user.model_copy(update=update_data)
    try:
        await current_user.save()
        return current_user
    except (errors.DuplicateKeyError, RevisionIdWasChanged):
        raise HTTPException(
            status_code=400, detail="User with that email already exists."
        )


@router.delete("/me", response_model=User)
async def delete_me(user: User = Depends(get_current_active_user)):
    await user.delete()
    return user

