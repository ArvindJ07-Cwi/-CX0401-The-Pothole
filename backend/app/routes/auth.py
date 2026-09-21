"""
CX0401 Backend – Authentication Routes.
"""
from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app import models, schemas, auth
from app.database import get_db

router = APIRouter(prefix="/api/auth", tags=["auth"])

@router.post("/register", response_model=schemas.UserResponse)
def register_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    # Validate role
    if user.role not in ["citizen", "contractor"]:
        if user.role == "authority":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Municipal Authority registration is restricted."
            )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid role selected."
        )

    # Check if email exists
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered."
        )

    try:
        hashed_password = auth.get_password_hash(user.password)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        ) from exc

    # Create new user
    new_user = models.User(
        name=user.name,
        email=user.email,
        password_hash=hashed_password,
        role=user.role,
        service_area=None, # Legacy field
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # Process structured geographic service areas for contractors
    if user.role == "contractor" and user.service_area_ids:
        for area_id in user.service_area_ids:
            # Verify area exists
            area = db.query(models.GeographicArea).filter(models.GeographicArea.id == area_id).first()
            if area:
                svc_area = models.ContractorServiceArea(
                    contractor_id=new_user.id,
                    area_id=area_id
                )
                db.add(svc_area)
        db.commit()
        db.refresh(new_user)
    
    return new_user

@router.post("/login", response_model=schemas.Token)
def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    try:
        user = db.query(models.User).filter(models.User.email == form_data.username).first()
        if not user or not auth.verify_password(form_data.password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        ) from exc

    # Create token
    access_token = auth.create_access_token(data={"sub": str(user.id)})

    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=schemas.UserResponse)
def read_users_me(current_user: models.User = Depends(auth.get_current_user)):
    return current_user
