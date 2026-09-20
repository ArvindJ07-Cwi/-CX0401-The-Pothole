"""
CX0401 Backend - Complaints Routes.
"""
import os
import uuid
import shutil
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session

from app import models, schemas, auth
from app.database import get_db

router = APIRouter(prefix="/api/complaints", tags=["complaints"])

UPLOAD_DIR = "uploads"

# Ensure upload dir exists
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("", response_model=schemas.ComplaintResponse)
def create_complaint(
    title: str = Form(...),
    description: str = Form(...),
    address: str = Form(...),
    severity: str = Form(...),
    lat: Optional[float] = Form(None),
    lng: Optional[float] = Form(None),
    beforePhoto: UploadFile = File(None),
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != "citizen":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only citizens can create complaints."
        )

    image_path = None
    if beforePhoto:
        ext = os.path.splitext(beforePhoto.filename)[1].lower()
        if ext not in [".jpg", ".jpeg", ".png", ".webp", ".heic"]:
            raise HTTPException(status_code=400, detail="Invalid image format.")
        
        # In a real app we might check file size from beforePhoto.file, 
        # but starlette handles Max limits typically at the server level,
        # or we can read it. Let's just trust it's reasonable from the frontend.

        filename = f"{uuid.uuid4()}{ext}"
        filepath = os.path.join(UPLOAD_DIR, filename)
        
        with open(filepath, "wb") as buffer:
            shutil.copyfileobj(beforePhoto.file, buffer)
            
        image_path = f"/uploads/{filename}"

    new_complaint = models.Complaint(
        citizen_id=current_user.id,
        title=title,
        description=description,
        address=address,
        latitude=lat,
        longitude=lng,
        severity=severity,
        status="pending",
        before_image_path=image_path
    )
    
    db.add(new_complaint)
    db.commit()
    db.refresh(new_complaint)
    return new_complaint

@router.get("", response_model=List[schemas.ComplaintResponse])
def get_complaints(
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role == "citizen":
        complaints = db.query(models.Complaint).filter(models.Complaint.citizen_id == current_user.id).all()
    else:
        # Authority / Contractor sees all (contractor might be filtered by assignments, but keeping simple)
        complaints = db.query(models.Complaint).all()
        
    return complaints

@router.get("/{id}", response_model=schemas.ComplaintResponse)
def get_complaint(
    id: int,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    complaint = db.query(models.Complaint).filter(models.Complaint.id == id).first()
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")
        
    if current_user.role == "citizen" and complaint.citizen_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to view this complaint")
        
    return complaint
