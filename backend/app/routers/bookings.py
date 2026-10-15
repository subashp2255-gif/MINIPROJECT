from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from ..database import get_db
from ..models import Booking, Review
from ..schemas import (
    BookingCreate,
    BookingResponse,
    BookingCancelRequest,
    ReviewCreate,
    ReviewResponse,
    OwnerResponseCreate,
)
from ..crud import create_booking, cancel_booking

router = APIRouter(prefix="/api/bookings", tags=["Bookings"])

@router.post("", response_model=BookingResponse, status_code=status.HTTP_201_CREATED)
def make_booking(req: BookingCreate, db: Session = Depends(get_db)):
    """
    Reserves capacity on the reservation ledger for the specified time interval.
    CRITICAL RULE: NEVER creates an InventoryBatch or alters physical inventory!
    """
    try:
        return create_booking(db, req)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@router.get("", response_model=List[BookingResponse])
def list_bookings(
    farmer_id: Optional[str] = None,
    facility_id: Optional[str] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db),
):
    query = db.query(Booking)
    if farmer_id:
        query = query.filter(Booking.farmer_id == farmer_id)
    if facility_id:
        query = query.filter(Booking.facility_id == facility_id)
    if status:
        query = query.filter(Booking.status == status)
    return query.order_by(Booking.created_at.desc()).all()

@router.get("/{booking_ref}", response_model=BookingResponse)
def get_booking(booking_ref: str, db: Session = Depends(get_db)):
    booking = (
        db.query(Booking)
        .filter((Booking.id == booking_ref) | (Booking.booking_code == booking_ref))
        .first()
    )
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    return booking

@router.post("/{booking_ref}/cancel", response_model=BookingResponse)
def cancel_booking_endpoint(
    booking_ref: str, req: BookingCancelRequest, db: Session = Depends(get_db)
):
    try:
        return cancel_booking(db, booking_ref, req.reason, req.cancelled_by)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/{booking_ref}/reviews", response_model=ReviewResponse)
def submit_feedback(
    booking_ref: str, req: ReviewCreate, db: Session = Depends(get_db)
):
    booking = (
        db.query(Booking)
        .filter((Booking.id == booking_ref) | (Booking.booking_code == booking_ref))
        .first()
    )
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    existing_review = db.query(Review).filter(Review.booking_id == booking.id).first()
    if existing_review:
        raise HTTPException(
            status_code=400,
            detail="A review has already been submitted for this booking."
        )

    review = Review(
        booking_id=booking.id,
        facility_id=booking.facility_id,
        farmer_id=req.farmer_id,
        farmer_name=req.farmer_name,
        rating=req.rating,
        comment=req.comment,
        would_revisit=req.would_revisit,
        is_complaint=req.is_complaint,
        complaint_category=req.complaint_category,
        complaint_status="open" if req.is_complaint else None,
    )
    db.add(review)
    db.commit()
    db.refresh(review)
    return review

@router.post("/reviews/{review_id}/respond", response_model=ReviewResponse)
def respond_to_review(
    review_id: str, req: OwnerResponseCreate, db: Session = Depends(get_db)
):
    review = db.query(Review).filter(Review.id == review_id).first()
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    review.owner_response = req.owner_response
    if review.is_complaint:
        review.complaint_status = "resolved"
    db.commit()
    db.refresh(review)
    return review
