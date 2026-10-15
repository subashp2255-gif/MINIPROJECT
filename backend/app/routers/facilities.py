from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date
from ..database import get_db
from ..models import Facility, StorageLocation
from ..schemas import (
    FacilitySchema,
    AvailabilityCheckResponse,
    CapacityLedgerResponse,
)
from ..capacity_engine import (
    calculate_facility_capacity_ledger,
    check_capacity_availability,
)

router = APIRouter(prefix="/api/facilities", tags=["Facilities"])

@router.get("", response_model=List[FacilitySchema])
def list_facilities(
    district: Optional[str] = None,
    solar_only: bool = False,
    db: Session = Depends(get_db),
):
    query = db.query(Facility)
    if district:
        query = query.filter(Facility.district.ilike(f"%{district}%"))
    if solar_only:
        query = query.filter(Facility.is_solar_powered == True)
    facilities = query.all()
    return facilities

@router.get("/{facility_id}", response_model=FacilitySchema)
def get_facility(facility_id: str, db: Session = Depends(get_db)):
    fac = db.query(Facility).filter(Facility.id == facility_id).first()
    if not fac:
        raise HTTPException(status_code=404, detail="Facility not found")
    return fac

@router.get("/{facility_id}/availability", response_model=AvailabilityCheckResponse)
def check_availability(
    facility_id: str,
    chamber_id: Optional[str] = None,
    start_date: date = Query(...),
    duration_days: int = Query(..., gt=0),
    crates: int = Query(..., gt=0),
    db: Session = Depends(get_db),
):
    try:
        return check_capacity_availability(
            db=db,
            facility_id=facility_id,
            chamber_id=chamber_id,
            start_date=start_date,
            duration_days=duration_days,
            requested_crates=crates,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{facility_id}/ledger", response_model=CapacityLedgerResponse)
def get_capacity_ledger(
    facility_id: str,
    query_date: Optional[date] = None,
    db: Session = Depends(get_db),
):
    try:
        return calculate_facility_capacity_ledger(
            db=db, facility_id=facility_id, query_date=query_date
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
