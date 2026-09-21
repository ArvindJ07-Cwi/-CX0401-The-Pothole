"""
CX0401 Backend - Geographic Areas Routes.
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app import models, schemas
from app.database import get_db

router = APIRouter(prefix="/api/geo", tags=["geo"])

@router.get("/areas", response_model=List[schemas.GeographicAreaResponse])
def get_all_areas(db: Session = Depends(get_db)):
    """Return the full hierarchy tree (all areas) for building UI dropdowns."""
    areas = db.query(models.GeographicArea).all()
    return areas

@router.get("/areas/{area_id}/ancestors", response_model=List[schemas.GeographicAreaResponse])
def get_area_ancestors(area_id: int, db: Session = Depends(get_db)):
    """Return the area and its ancestor chain."""
    area = db.query(models.GeographicArea).filter(models.GeographicArea.id == area_id).first()
    if not area:
        raise HTTPException(status_code=404, detail="Area not found.")
    
    ancestors = []
    current = area
    while current:
        ancestors.append(current)
        if current.parent_id:
            current = db.query(models.GeographicArea).filter(models.GeographicArea.id == current.parent_id).first()
        else:
            current = None
            
    return ancestors
