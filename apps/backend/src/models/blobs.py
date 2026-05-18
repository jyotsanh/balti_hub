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
from pydantic import  Field

class BlobDocument(Document):
    blob_id: Annotated[UUID, Field(default_factory=uuid7), Indexed(unique=True)]
    owner_uuid:Annotated[UUID, Indexed()]
    file_name:str
    file_size:int
    content_type:str
    created_at:str

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