"""
CX0401 Backend - Complaints Routes.

Endpoints:
  POST   /api/complaints                     – citizen creates a complaint
  GET    /api/complaints                     – get complaints (role-scoped)
  GET    /api/complaints/{id}                – get single complaint
  PATCH  /api/complaints/{id}/status         – authority updates status
  POST   /api/complaints/{id}/assign         – authority assigns contractor
  GET    /api/contractors                    – list registered contractors (authority only)
"""
import os
import uuid
import shutil
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app import models, schemas, auth
from app.database import get_db

router = APIRouter(tags=["complaints"])

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".heic"}
MAX_FILE_BYTES = 10 * 1024 * 1024  # 10 MB


# ── Pydantic bodies ────────────────────────────────────────────────────────────

class StatusUpdateBody(BaseModel):
    status: str


class AssignContractorBody(BaseModel):
    contractor_id: int


# ── Helpers ───────────────────────────────────────────────────────────────────

VALID_STATUSES = {
    "pending", "assigned", "in_progress", "submitted",
    "verified", "flagged", "rejected",
}


def _require_authority(user: models.User) -> None:
    if user.role != "authority":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only municipal authorities can perform this action.",
        )


def _map_complaint(c: models.Complaint) -> dict:
    """Convert ORM Complaint to dict for the Pydantic schema."""
    return {
        "id": c.id,
        "title": c.title,
        "description": c.description,
        "address": c.address,
        "latitude": c.latitude,
        "longitude": c.longitude,
        "severity": c.severity,
        "status": c.status,
        "before_image_path": c.before_image_path,
        "created_at": c.created_at,
        "updated_at": c.updated_at,
        "citizen_id": c.citizen_id,
    }


# ── POST /api/complaints ───────────────────────────────────────────────────────

@router.post("/api/complaints", response_model=schemas.ComplaintResponse)
def create_complaint(
    title: str = Form(...),
    description: str = Form(...),
    address: str = Form(...),
    severity: str = Form(...),
    lat: Optional[float] = Form(None),
    lng: Optional[float] = Form(None),
    beforePhoto: Optional[UploadFile] = File(None),
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.role != "citizen":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only citizens can create complaints.",
        )

    if severity not in {"low", "medium", "high", "critical"}:
        raise HTTPException(status_code=400, detail="Invalid severity value.")

    image_path: Optional[str] = None
    if beforePhoto and beforePhoto.filename:
        ext = os.path.splitext(beforePhoto.filename)[1].lower()
        if ext not in ALLOWED_EXTENSIONS:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid image format '{ext}'. Accepted: JPEG, PNG, WebP, HEIC.",
            )
        # Read & size-check
        contents = beforePhoto.file.read()
        if len(contents) > MAX_FILE_BYTES:
            raise HTTPException(status_code=413, detail="Image must be under 10 MB.")

        filename = f"{uuid.uuid4()}{ext}"
        filepath = os.path.join(UPLOAD_DIR, filename)
        with open(filepath, "wb") as f:
            f.write(contents)
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
        before_image_path=image_path,
    )
    db.add(new_complaint)
    db.commit()
    db.refresh(new_complaint)
    return new_complaint


# ── GET /api/complaints ────────────────────────────────────────────────────────

@router.get("/api/complaints", response_model=List[schemas.ComplaintResponse])
def get_complaints(
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.role == "citizen":
        return (
            db.query(models.Complaint)
            .filter(models.Complaint.citizen_id == current_user.id)
            .order_by(models.Complaint.created_at.desc())
            .all()
        )
    # Authority and contractor see all
    return (
        db.query(models.Complaint)
        .order_by(models.Complaint.created_at.desc())
        .all()
    )


# ── GET /api/complaints/{id} ───────────────────────────────────────────────────

@router.get("/api/complaints/{complaint_id}", response_model=schemas.ComplaintResponse)
def get_complaint(
    complaint_id: int,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db),
):
    complaint = db.query(models.Complaint).filter(models.Complaint.id == complaint_id).first()
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found.")
    if current_user.role == "citizen" and complaint.citizen_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to view this complaint.")
    return complaint


# ── PATCH /api/complaints/{id}/status ─────────────────────────────────────────

@router.patch("/api/complaints/{complaint_id}/status", response_model=schemas.ComplaintResponse)
def update_complaint_status(
    complaint_id: int,
    body: StatusUpdateBody,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db),
):
    _require_authority(current_user)

    if body.status not in VALID_STATUSES:
        raise HTTPException(status_code=400, detail=f"Invalid status '{body.status}'.")

    complaint = db.query(models.Complaint).filter(models.Complaint.id == complaint_id).first()
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found.")

    complaint.status = body.status
    db.commit()
    db.refresh(complaint)
    return complaint


# ── POST /api/complaints/{id}/assign ──────────────────────────────────────────

@router.post("/api/complaints/{complaint_id}/assign", response_model=schemas.ComplaintResponse)
def assign_complaint(
    complaint_id: int,
    body: AssignContractorBody,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db),
):
    _require_authority(current_user)

    complaint = db.query(models.Complaint).filter(models.Complaint.id == complaint_id).first()
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found.")

    contractor = db.query(models.User).filter(
        models.User.id == body.contractor_id,
        models.User.role == "contractor",
    ).first()
    if not contractor:
        raise HTTPException(status_code=404, detail="Contractor not found.")

    # Create or update Assignment
    assignment = (
        db.query(models.Assignment)
        .filter(models.Assignment.complaint_id == complaint_id)
        .first()
    )
    if assignment:
        assignment.contractor_id = body.contractor_id
        assignment.authority_id = current_user.id
    else:
        assignment = models.Assignment(
            complaint_id=complaint_id,
            contractor_id=body.contractor_id,
            authority_id=current_user.id,
        )
        db.add(assignment)

    complaint.status = "assigned"
    db.commit()
    db.refresh(complaint)
    return complaint


# ── GET /api/contractors ───────────────────────────────────────────────────────

@router.get("/api/contractors", response_model=List[schemas.ContractorListItem])
def list_contractors(
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db),
):
    _require_authority(current_user)
    contractors = (
        db.query(models.User)
        .filter(models.User.role == "contractor")
        .order_by(models.User.name)
        .all()
    )
    return contractors
