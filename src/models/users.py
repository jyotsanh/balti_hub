from typing import Annotated
from datetime import datetime, timezone

from uuid import UUID
from uuid6 import uuid7
from beanie import (
    Document,
    Indexed,
    Replace,
    Update,
    SaveChanges,
    Insert,
    before_event,
)
from pydantic import EmailStr, Field


class UserDocument(Document):
    uuid: Annotated[UUID, Field(default_factory=uuid7), Indexed(unique=True)]
    email: Annotated[EmailStr, Indexed(unique=True)]
    first_name: str | None = None
    last_name: str | None = None
    hashed_password: str | None = None
    provider: str | None = None
    picture: str | None = None
    blob_count:int = 0
    is_active: bool = True
    is_superuser: bool = False
    
    # timestamps
    created_date: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_date: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    # set created_date on insert
    @before_event(Insert)
    def set_created_date(self):
        self.created_date = datetime.now(timezone.utc)

    # update updated_date on every write
    @before_event([Replace, Update, SaveChanges])
    def set_updated_date(self):
        self.updated_date = datetime.now(timezone.utc)
