"""
CX0401 Backend – Pydantic Schemas.

Used for request validation and response serialization.
"""
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class GeographicAreaResponse(BaseModel):
    id: int
    name: str
    level: str
    parent_id: Optional[int] = None
    full_path: str

    class Config:
        from_attributes = True

class UserBase(BaseModel):
    name: str
    email: EmailStr

class UserCreate(UserBase):
    password: str
    role: str
    service_area_ids: Optional[list[int]] = None

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

class RepairEvidenceResponse(BaseModel):
    id: int
    after_image_path: Optional[str] = None
    repair_notes: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    submitted_at: datetime
    contractor_name: Optional[str] = None

    class Config:
        from_attributes = True

class AssignmentResponse(BaseModel):
    contractor_id: int
    contractor_name: Optional[str] = None
    contractor_email: Optional[str] = None
    
    class Config:
        from_attributes = True

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
    repair_evidence: Optional[RepairEvidenceResponse] = None
    assignment: Optional[AssignmentResponse] = None
    location_area: Optional[GeographicAreaResponse] = None

    class Config:
        from_attributes = True

class ContractorListItem(BaseModel):
    id: int
    name: str
    email: str
    role: str
    service_areas: list[GeographicAreaResponse] = []

    class Config:
        from_attributes = True
