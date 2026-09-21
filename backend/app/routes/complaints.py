"""
CX0401 Backend - Complaints Routes.

Endpoints:
  POST   /api/complaints                     – citizen creates a complaint
  GET    /api/complaints                     – get complaints (role-scoped)
  GET    /api/complaints/{id}                – get single complaint
  PATCH  /api/complaints/{id}/status         – authority updates status
  POST   /api/complaints/{id}/assign         – authority assigns contractor
  GET    /api/contractors                    – list contractors (authority, with optional area filter)
  POST   /api/complaints/{id}/evidence       – contractor submits repair evidence
"""
import os
import uuid
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form, Query
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


def _get_ancestor_ids(db: Session, area_id: int) -> set[int]:
    """Return the set of IDs for the given area and all its ancestors."""
    ancestors = set()
    current_id = area_id
    while current_id:
        ancestors.add(current_id)
        area = db.query(models.GeographicArea).filter(models.GeographicArea.id == current_id).first()
        if not area:
            break
        current_id = area.parent_id
    return ancestors


def _enrich_complaint(complaint: models.Complaint) -> dict:
    """Build a dict from a Complaint ORM object with nested contractor and location details."""
    result = {
        "id": complaint.id,
        "title": complaint.title,
        "description": complaint.description,
        "address": complaint.address,
        "latitude": complaint.latitude,
        "longitude": complaint.longitude,
        "severity": complaint.severity,
        "status": complaint.status,
        "before_image_path": complaint.before_image_path,
        "created_at": complaint.created_at,
        "updated_at": complaint.updated_at,
        "citizen_id": complaint.citizen_id,
        "assignment": None,
        "repair_evidence": None,
        "location_area": complaint.location_area,
    }

    if complaint.assignment:
        contractor = complaint.assignment.contractor
        result["assignment"] = {
            "contractor_id": complaint.assignment.contractor_id,
            "contractor_name": contractor.name if contractor else None,
            "contractor_email": contractor.email if contractor else None,
        }

    if complaint.repair_evidence:
        contractor = complaint.repair_evidence.contractor
        result["repair_evidence"] = {
            "id": complaint.repair_evidence.id,
            "after_image_path": complaint.repair_evidence.after_image_path,
            "repair_notes": complaint.repair_evidence.repair_notes,
            "latitude": complaint.repair_evidence.latitude,
            "longitude": complaint.repair_evidence.longitude,
            "submitted_at": complaint.repair_evidence.submitted_at,
            "contractor_name": contractor.name if contractor else None,
        }

    return result


# ── POST /api/complaints ───────────────────────────────────────────────────────

@router.post("/api/complaints", response_model=schemas.ComplaintResponse)
def create_complaint(
    title: str = Form(...),
    description: str = Form(...),
    address: str = Form(...),
    severity: str = Form(...),
    lat: Optional[float] = Form(None),
    lng: Optional[float] = Form(None),
    location_area_id: Optional[int] = Form(None),
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
        location_area_id=location_area_id,
    )
    db.add(new_complaint)
    db.commit()
    db.refresh(new_complaint)
    return _enrich_complaint(new_complaint)


# ── GET /api/complaints ────────────────────────────────────────────────────────

@router.get("/api/complaints", response_model=List[schemas.ComplaintResponse])
def get_complaints(
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.role == "citizen":
        complaints = (
            db.query(models.Complaint)
            .filter(models.Complaint.citizen_id == current_user.id)
            .order_by(models.Complaint.created_at.desc())
            .all()
        )
    elif current_user.role == "contractor":
        complaints = (
            db.query(models.Complaint)
            .join(models.Assignment)
            .filter(models.Assignment.contractor_id == current_user.id)
            .order_by(models.Complaint.created_at.desc())
            .all()
        )
    else:
        # Authority sees all
        complaints = (
            db.query(models.Complaint)
            .order_by(models.Complaint.created_at.desc())
            .all()
        )
    return [_enrich_complaint(c) for c in complaints]


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
    elif current_user.role == "contractor":
        if not complaint.assignment or complaint.assignment.contractor_id != current_user.id:
            raise HTTPException(status_code=403, detail="Not authorized to view this assigned complaint.")
            
    return _enrich_complaint(complaint)


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
    return _enrich_complaint(complaint)


class ClassifyLocationBody(BaseModel):
    location_area_id: int

@router.patch("/api/complaints/{complaint_id}/location", response_model=schemas.ComplaintResponse)
def classify_complaint_location(
    complaint_id: int,
    body: ClassifyLocationBody,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db),
):
    _require_authority(current_user)

    complaint = db.query(models.Complaint).filter(models.Complaint.id == complaint_id).first()
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found.")

    area = db.query(models.GeographicArea).filter(models.GeographicArea.id == body.location_area_id).first()
    if not area:
        raise HTTPException(status_code=400, detail="Invalid location area.")

    complaint.location_area_id = body.location_area_id
    db.commit()
    db.refresh(complaint)
    return _enrich_complaint(complaint)

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

    if not complaint.location_area_id:
        raise HTTPException(
            status_code=400,
            detail="Complaint location is unclassified. Please set the location area first."
        )

    contractor = db.query(models.User).filter(
        models.User.id == body.contractor_id,
        models.User.role == "contractor",
    ).first()
    if not contractor:
        raise HTTPException(status_code=404, detail="Contractor not found.")

    # ── Service-area hierarchical validation ──
    complaint_ancestor_ids = _get_ancestor_ids(db, complaint.location_area_id)
    contractor_area_ids = {sa.area_id for sa in contractor.service_areas}
    
    if not contractor_area_ids:
        raise HTTPException(
            status_code=400,
            detail="Contractor has no configured service areas."
        )

    # Check if ANY of the contractor's service areas is in the complaint's ancestors
    if not complaint_ancestor_ids.intersection(contractor_area_ids):
        raise HTTPException(
            status_code=400,
            detail="Contractor's service areas do not cover the complaint location."
        )

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
    return _enrich_complaint(complaint)


# ── GET /api/contractors ───────────────────────────────────────────────────────

@router.get("/api/contractors", response_model=List[schemas.ContractorListItem])
def list_contractors(
    complaint_id: Optional[int] = Query(None, description="Filter contractors by complaint's service area"),
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db),
):
    _require_authority(current_user)

    query = db.query(models.User).filter(models.User.role == "contractor").order_by(models.User.name)
    all_contractors = query.all()

    def format_contractor(c: models.User) -> dict:
        return {
            "id": c.id,
            "name": c.name,
            "email": c.email,
            "role": c.role,
            "service_areas": [sa.area for sa in c.service_areas if sa.area]
        }

    # If complaint_id is provided, filter by hierarchical service area match
    if complaint_id is not None:
        complaint = db.query(models.Complaint).filter(models.Complaint.id == complaint_id).first()
        if complaint and complaint.location_area_id:
            complaint_ancestor_ids = _get_ancestor_ids(db, complaint.location_area_id)
            
            eligible_contractors = []
            for contractor in all_contractors:
                contractor_area_ids = {sa.area_id for sa in contractor.service_areas}
                if complaint_ancestor_ids.intersection(contractor_area_ids):
                    eligible_contractors.append(format_contractor(contractor))
            
            return eligible_contractors
        else:
            # If complaint has no location_area_id, no contractors are eligible
            return []

    return [format_contractor(c) for c in all_contractors]


# ── POST /api/complaints/{id}/evidence ────────────────────────────────────────

@router.post("/api/complaints/{complaint_id}/evidence", response_model=schemas.ComplaintResponse)
def submit_evidence(
    complaint_id: int,
    repair_notes: Optional[str] = Form(None),
    lat: Optional[float] = Form(None),
    lng: Optional[float] = Form(None),
    afterPhoto: UploadFile = File(...),
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.role != "contractor":
        raise HTTPException(status_code=403, detail="Only contractors can submit evidence.")

    complaint = db.query(models.Complaint).filter(models.Complaint.id == complaint_id).first()
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found.")

    if not complaint.assignment or complaint.assignment.contractor_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to submit evidence for this complaint.")
        
    if complaint.repair_evidence:
        raise HTTPException(status_code=400, detail="Evidence already submitted for this complaint.")

    # Validate and save image
    ext = os.path.splitext(afterPhoto.filename)[1].lower() if afterPhoto.filename else ""
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail=f"Invalid image format '{ext}'. Accepted: JPEG, PNG, WebP, HEIC.")
        
    contents = afterPhoto.file.read()
    if len(contents) > MAX_FILE_BYTES:
        raise HTTPException(status_code=413, detail="Image must be under 10 MB.")

    filename = f"{uuid.uuid4()}{ext}"
    filepath = os.path.join(UPLOAD_DIR, filename)
    with open(filepath, "wb") as f:
        f.write(contents)
    
    image_path = f"/uploads/{filename}"

    # Create evidence
    evidence = models.RepairEvidence(
        complaint_id=complaint_id,
        contractor_id=current_user.id,
        after_image_path=image_path,
        repair_notes=repair_notes,
        latitude=lat,
        longitude=lng,
    )
    db.add(evidence)
    
    # Update status
    complaint.status = "submitted"
    db.commit()
    db.refresh(complaint)
    
    return _enrich_complaint(complaint)
