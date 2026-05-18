from typing import Any
from uuid import UUID

from beanie.exceptions import RevisionIdWasChanged
from fastapi import APIRouter, Body, Depends, HTTPException
from pydantic.networks import EmailStr
from pymongo import errors

from src.schemas import User, UserUpdate
from src.auth import (
    get_current_active_superuser,
    get_hashed_password,
)
from src.models import UserDocument

router = APIRouter()



@router.get("", response_model=list[User])
async def get_users(
    limit: int | None = 10,
    offset: int | None = 0,
    admin_user: User = Depends(get_current_active_superuser),
):
    users = await UserDocument.find_all().skip(offset).limit(limit).to_list()
    return users




@router.patch("/{userid}", response_model=User)
async def update_user(
    userid: UUID,
    update: UserUpdate,
    admin_user: User = Depends(get_current_active_superuser),
) -> Any:
    """
    Update a user.

    ** Restricted to superuser **

    Parameters
    ----------
    userid : UUID
        the user's UUID
    update : schemas.UserUpdate
        the update data
    current_user : User, optional
        the current superuser, by default Depends(get_current_active_superuser)
    """
    user = await UserDocument.find_one({"uuid": userid})
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    update_data = update.model_dump(exclude_unset=True)
    try:
        if update_data["password"]:
            update_data["hashed_password"] = get_hashed_password(update_data["password"])
            del update_data["password"]
    except KeyError:
        pass
    updated_user = user.model_copy(update=update_data)
    try:
        await updated_user.save()
        return updated_user
    except (errors.DuplicateKeyError, RevisionIdWasChanged):
        raise HTTPException(
            status_code=400, detail="User with that email already exists."
        )


@router.get("/{userid}", response_model=User)
async def get_user(
    userid: UUID, admin_user: User = Depends(get_current_active_superuser)
):
    """
    Get User Info

    ** Restricted to superuser **

    Parameters
    ----------
    userid : UUID
        the user's UUID

    Returns
    -------
    User
        User info
    """
    user = await UserDocument.find_one({"uuid": userid})
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.delete("/{userid}", response_model=User)
async def delete_user(
    userid: UUID, admin_user: User = Depends(get_current_active_superuser)
):
    user = await UserDocument.find_one({"uuid": userid})
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    await user.delete()
    return user
