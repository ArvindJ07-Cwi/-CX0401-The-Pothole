"""
CX0401 Backend – SQLAlchemy ORM models.

Tables
------
users              – citizen / contractor / authority accounts
complaints         – pothole reports filed by citizens
assignments        – links a complaint to a contractor (by an authority)
repair_evidence    – after-photo + notes submitted by contractor
verification_results – AI check outcomes + municipal review
"""

import datetime
from sqlalchemy import (
    Column, Integer, String, Text, Float, DateTime, Boolean,
    ForeignKey, Index, Enum as SAEnum,
)
from sqlalchemy.orm import relationship

from app.database import Base


# ── Users ──────────────────────────────────────────────────────────────────────

class User(Base):
    __tablename__ = "users"

    id         = Column(Integer, primary_key=True, index=True)
    name       = Column(String(120), nullable=False)
    email      = Column(String(255), nullable=False, unique=True, index=True)
    password_hash = Column(String(255), nullable=False)
    role       = Column(
        SAEnum("citizen", "contractor", "authority", name="user_role"),
        nullable=False,
        default="citizen",
    )
    service_area = Column(String(120), nullable=True)  # e.g. "Pune", "Mumbai" — used for contractors
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # relationships
    complaints  = relationship("Complaint", back_populates="citizen", foreign_keys="Complaint.citizen_id")
    assignments_as_contractor = relationship("Assignment", back_populates="contractor", foreign_keys="Assignment.contractor_id")
    assignments_as_authority  = relationship("Assignment", back_populates="authority", foreign_keys="Assignment.authority_id")
    repair_evidence = relationship("RepairEvidence", back_populates="contractor")

    def __repr__(self) -> str:
        return f"<User id={self.id} email={self.email!r} role={self.role}>"


# ── Complaints ─────────────────────────────────────────────────────────────────

class Complaint(Base):
    __tablename__ = "complaints"

    id          = Column(Integer, primary_key=True, index=True)
    citizen_id  = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    title       = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    address     = Column(String(300), nullable=False)
    latitude    = Column(Float, nullable=True)
    longitude   = Column(Float, nullable=True)
    severity    = Column(
        SAEnum("low", "medium", "high", "critical", name="severity_level"),
        nullable=False,
        default="medium",
    )
    status      = Column(
        SAEnum(
            "pending", "assigned", "in_progress", "submitted",
            "verified", "flagged", "rejected",
            name="complaint_status",
        ),
        nullable=False,
        default="pending",
    )
    before_image_path = Column(String(500), nullable=True)
    created_at  = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at  = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    # relationships
    citizen     = relationship("User", back_populates="complaints", foreign_keys=[citizen_id])
    assignment  = relationship("Assignment", back_populates="complaint", uselist=False)
    repair_evidence    = relationship("RepairEvidence", back_populates="complaint", uselist=False)
    verification_result = relationship("VerificationResult", back_populates="complaint", uselist=False)

    __table_args__ = (
        Index("ix_complaints_status", "status"),
    )

    def __repr__(self) -> str:
        return f"<Complaint id={self.id} status={self.status}>"


# ── Assignments ────────────────────────────────────────────────────────────────

class Assignment(Base):
    __tablename__ = "assignments"

    id              = Column(Integer, primary_key=True, index=True)
    complaint_id    = Column(Integer, ForeignKey("complaints.id"), nullable=False, unique=True, index=True)
    contractor_id   = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    authority_id    = Column(Integer, ForeignKey("users.id"), nullable=False)
    assigned_at     = Column(DateTime, default=datetime.datetime.utcnow)

    # relationships
    complaint   = relationship("Complaint", back_populates="assignment")
    contractor  = relationship("User", back_populates="assignments_as_contractor", foreign_keys=[contractor_id])
    authority   = relationship("User", back_populates="assignments_as_authority", foreign_keys=[authority_id])

    def __repr__(self) -> str:
        return f"<Assignment id={self.id} complaint={self.complaint_id}>"


# ── Repair Evidence ────────────────────────────────────────────────────────────

class RepairEvidence(Base):
    __tablename__ = "repair_evidence"

    id              = Column(Integer, primary_key=True, index=True)
    complaint_id    = Column(Integer, ForeignKey("complaints.id"), nullable=False, unique=True, index=True)
    contractor_id   = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    after_image_path = Column(String(500), nullable=True)
    repair_notes    = Column(Text, nullable=True)
    latitude        = Column(Float, nullable=True)
    longitude       = Column(Float, nullable=True)
    submitted_at    = Column(DateTime, default=datetime.datetime.utcnow)

    # relationships
    complaint   = relationship("Complaint", back_populates="repair_evidence")
    contractor  = relationship("User", back_populates="repair_evidence")

    def __repr__(self) -> str:
        return f"<RepairEvidence id={self.id} complaint={self.complaint_id}>"


# ── Verification Results ───────────────────────────────────────────────────────

class VerificationResult(Base):
    __tablename__ = "verification_results"

    id              = Column(Integer, primary_key=True, index=True)
    complaint_id    = Column(Integer, ForeignKey("complaints.id"), nullable=False, unique=True, index=True)
    gps_check       = Column(Boolean, nullable=True)
    visual_check    = Column(Boolean, nullable=True)
    perspective_check = Column(Boolean, nullable=True)
    background_check  = Column(Boolean, nullable=True)
    confidence      = Column(Float, nullable=True)     # 0.0–100.0
    outcome         = Column(
        SAEnum("verified", "flagged", "inconclusive", name="verification_outcome"),
        nullable=True,
    )
    flag_reason     = Column(Text, nullable=True)
    review_notes    = Column(Text, nullable=True)
    reviewed_by_id  = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at      = Column(DateTime, default=datetime.datetime.utcnow)

    # relationships
    complaint   = relationship("Complaint", back_populates="verification_result")
    reviewed_by = relationship("User")

    def __repr__(self) -> str:
        return f"<VerificationResult id={self.id} outcome={self.outcome}>"
