"""
CX0401 Backend – Pydantic Schemas.

Used for request validation and response serialization.
"""
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class UserBase(BaseModel):
    name: str
    email: EmailStr

class UserCreate(UserBase):
    password: str
    role: str

class UserResponse(UserBase):
    id: int
    role: str
    created_at: datetime
    
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    user_id: Optional[int] = None

class ComplaintResponse(BaseModel):
    id: int
    title: str
    description: str
    address: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    severity: str
    status: str
    before_image_path: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    citizen_id: int

    class Config:
        from_attributes = True
