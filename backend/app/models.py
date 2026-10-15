import uuid
from datetime import datetime, date
from sqlalchemy import (
    Column,
    String,
    Integer,
    Float,
    Boolean,
    Date,
    DateTime,
    ForeignKey,
    Text,
    CheckConstraint
)
from sqlalchemy.orm import relationship
from .database import Base

def generate_uuid():
    return str(uuid.uuid4())

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=generate_uuid)
    email = Column(String, unique=True, index=True, nullable=True)
    phone = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    role = Column(String, nullable=False)  # 'farmer', 'owner', 'admin'
    location = Column(String, nullable=False)
    avatar_url = Column(String, nullable=True)
    hashed_password = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    facilities = relationship("Facility", back_populates="owner")
    bookings = relationship("Booking", back_populates="farmer")

class Facility(Base):
    __tablename__ = "facilities"

    id = Column(String, primary_key=True, default=generate_uuid)
    owner_id = Column(String, ForeignKey("users.id"), nullable=True)
    name = Column(String, nullable=False)
    name_ta = Column(String, nullable=True)
    location = Column(String, nullable=False)
    location_ta = Column(String, nullable=True)
    district = Column(String, nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    rating = Column(Float, default=4.9)
    review_count = Column(Integer, default=0)
    is_verified = Column(Boolean, default=True)
    is_solar_powered = Column(Boolean, default=True)
    price_per_crate_day = Column(Float, nullable=False, default=2.90)
    price_per_kg_day = Column(Float, nullable=False, default=0.12)
    operating_hours = Column(String, default="06:00 AM - 10:00 PM")
    contact_phone = Column(String, nullable=False)
    manager_name = Column(String, default="Warehouse Operations In-Charge")
    manager_image = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    owner = relationship("User", back_populates="facilities")
    chambers = relationship("StorageLocation", back_populates="facility", cascade="all, delete-orphan")
    bookings = relationship("Booking", back_populates="facility")
    batches = relationship("InventoryBatch", back_populates="facility")
    reviews = relationship("Review", back_populates="facility")

class StorageLocation(Base):
    """Storage units / chambers inside a cold storage facility."""
    __tablename__ = "storage_locations"

    id = Column(String, primary_key=True, default=generate_uuid)
    facility_id = Column(String, ForeignKey("facilities.id"), nullable=False)
    name = Column(String, nullable=False)
    chamber_type = Column(String, nullable=False)  # 'chilled', 'cool', 'controlled_atmosphere', 'dry_ventilated'
    temp_min = Column(Float, nullable=False)
    temp_max = Column(Float, nullable=False)
    current_temp = Column(Float, nullable=False)
    humidity = Column(Integer, nullable=False)
    total_capacity_crates = Column(Integer, nullable=False)
    total_capacity_kg = Column(Float, nullable=False)
    is_maintenance = Column(Boolean, default=False)
    maintenance_reason = Column(String, nullable=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    facility = relationship("Facility", back_populates="chambers")
    bookings = relationship("Booking", back_populates="chamber")
    batches = relationship("InventoryBatch", back_populates="chamber")

class Booking(Base):
    """Capacity reservations made by farmers for a specified duration."""
    __tablename__ = "bookings"

    id = Column(String, primary_key=True, default=generate_uuid)
    booking_code = Column(String, unique=True, index=True, nullable=False)
    farmer_id = Column(String, ForeignKey("users.id"), nullable=False)
    facility_id = Column(String, ForeignKey("facilities.id"), nullable=False)
    chamber_id = Column(String, ForeignKey("storage_locations.id"), nullable=False)
    crop_name = Column(String, nullable=False)
    crop_name_ta = Column(String, nullable=True)
    variety = Column(String, nullable=True)
    grade = Column(String, default="Grade A")
    booked_crates = Column(Integer, nullable=False)
    booked_kg = Column(Float, nullable=False)
    start_date = Column(Date, nullable=False)
    duration_days = Column(Integer, nullable=False)
    end_date = Column(Date, nullable=False)
    daily_rate_crate = Column(Float, nullable=False)
    total_estimated_cost = Column(Float, nullable=False)
    status = Column(
        String,
        default="confirmed",
        nullable=False
    )  # 'pending', 'confirmed', 'in_storage', 'completed', 'cancelled', 'rejected'
    batch_pin = Column(String, nullable=False)
    crop_image_url = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    notes = Column(Text, nullable=True)

    farmer = relationship("User", back_populates="bookings")
    facility = relationship("Facility", back_populates="bookings")
    chamber = relationship("StorageLocation", back_populates="bookings")
    reviews = relationship("Review", back_populates="booking")
    status_history = relationship("BookingStatusHistory", back_populates="booking", cascade="all, delete-orphan")

class BookingStatusHistory(Base):
    __tablename__ = "booking_status_history"

    id = Column(String, primary_key=True, default=generate_uuid)
    booking_id = Column(String, ForeignKey("bookings.id"), nullable=False)
    previous_status = Column(String, nullable=False)
    new_status = Column(String, nullable=False)
    reason = Column(String, nullable=True)
    changed_by = Column(String, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)

    booking = relationship("Booking", back_populates="status_history")

class InventoryProduct(Base):
    """Product catalog metadata - distinct from stock quantities."""
    __tablename__ = "inventory_products"

    id = Column(String, primary_key=True, default=generate_uuid)
    facility_id = Column(String, ForeignKey("facilities.id"), nullable=False)
    product_code = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    category = Column(String, nullable=False)  # 'Vegetables', 'Fruits', 'Tubers', 'Grains'
    measurement_unit = Column(String, default="kg")
    is_archived = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class InventoryBatch(Base):
    """
    Physical product batch physically present in a storage location.
    CRITICAL ARCHITECTURAL RULE:
    - This represents goods physically in cold storage.
    - Creating a booking DOES NOT create an InventoryBatch!
    - booking_id is strictly OPTIONAL (e.g. for walk-in stock, supplier delivery, preexisting stock).
    """
    __tablename__ = "inventory_batches"

    id = Column(String, primary_key=True, default=generate_uuid)
    batch_code = Column(String, unique=True, index=True, nullable=False)
    facility_id = Column(String, ForeignKey("facilities.id"), nullable=False)
    chamber_id = Column(String, ForeignKey("storage_locations.id"), nullable=False)
    product_id = Column(String, ForeignKey("inventory_products.id"), nullable=True)
    booking_id = Column(String, ForeignKey("bookings.id"), nullable=True)  # Optional reference only!
    farmer_id = Column(String, ForeignKey("users.id"), nullable=True)
    farmer_name = Column(String, nullable=True)
    supplier_name = Column(String, nullable=True)
    crop_name = Column(String, nullable=False)
    crop_name_ta = Column(String, nullable=True)
    grade = Column(String, default="Grade A")
    initial_stock_kg = Column(Float, nullable=False)
    initial_stock_crates = Column(Integer, nullable=False)
    current_stock_kg = Column(Float, nullable=False)
    current_stock_crates = Column(Integer, nullable=False)
    withdrawn_kg = Column(Float, default=0.0)
    intake_date = Column(Date, nullable=False)
    expiry_date = Column(Date, nullable=True)
    expected_storage_end = Column(Date, nullable=True)
    condition = Column(String, default="good")  # 'good', 'fair', 'damaged', 'spoiled'
    quality_score = Column(Integer, default=98)
    status = Column(String, default="in_storage")  # 'in_storage', 'withdrawn', 'archived'
    crop_image_url = Column(String, nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    __table_args__ = (
        CheckConstraint("current_stock_kg >= 0", name="non_negative_stock_kg"),
        CheckConstraint("current_stock_crates >= 0", name="non_negative_stock_crates"),
    )

    facility = relationship("Facility", back_populates="batches")
    chamber = relationship("StorageLocation", back_populates="batches")
    transactions = relationship("InventoryTransaction", back_populates="batch", cascade="all, delete-orphan")

class InventoryTransaction(Base):
    """
    Immutable append-only ledger of every physical stock movement:
    intake, withdrawal, transfer, adjustment.
    """
    __tablename__ = "inventory_transactions"

    id = Column(String, primary_key=True, default=generate_uuid)
    batch_id = Column(String, ForeignKey("inventory_batches.id"), nullable=False)
    batch_code = Column(String, nullable=False)
    facility_id = Column(String, ForeignKey("facilities.id"), nullable=False)
    transaction_type = Column(String, nullable=False)  # 'intake', 'withdrawal', 'transfer', 'adjustment'
    quantity_kg = Column(Float, nullable=False)
    quantity_crates = Column(Integer, nullable=False)
    previous_balance_kg = Column(Float, nullable=False)
    new_balance_kg = Column(Float, nullable=False)
    source_location_id = Column(String, nullable=True)
    destination_location_id = Column(String, nullable=True)
    authorized_by = Column(String, nullable=False)
    reason = Column(String, nullable=False)
    receipt_number = Column(String, unique=True, nullable=False)
    booking_id = Column(String, nullable=True)  # Optional reference
    timestamp = Column(DateTime, default=datetime.utcnow)

    batch = relationship("InventoryBatch", back_populates="transactions")

class InventoryAlert(Base):
    __tablename__ = "inventory_alerts"

    id = Column(String, primary_key=True, default=generate_uuid)
    facility_id = Column(String, ForeignKey("facilities.id"), nullable=False)
    alert_type = Column(String, nullable=False)  # 'low_stock', 'near_expiry', 'expired', 'capacity_warning', 'damage_detected'
    title = Column(String, nullable=False)
    message = Column(String, nullable=False)
    severity = Column(String, default="warning")  # 'info', 'warning', 'critical'
    is_resolved = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class Review(Base):
    __tablename__ = "reviews"

    id = Column(String, primary_key=True, default=generate_uuid)
    booking_id = Column(String, ForeignKey("bookings.id"), nullable=True)
    facility_id = Column(String, ForeignKey("facilities.id"), nullable=False)
    farmer_id = Column(String, ForeignKey("users.id"), nullable=False)
    farmer_name = Column(String, nullable=False)
    rating = Column(Integer, nullable=False)
    comment = Column(Text, nullable=True)
    would_revisit = Column(Boolean, default=True)
    is_complaint = Column(Boolean, default=False)
    complaint_category = Column(String, nullable=True)
    complaint_status = Column(String, nullable=True)  # 'open', 'under_review', 'resolved', 'disputed'
    owner_response = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    facility = relationship("Facility", back_populates="reviews")
    booking = relationship("Booking", back_populates="reviews")

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False)
    title_ta = Column(String, nullable=True)
    message = Column(String, nullable=False)
    message_ta = Column(String, nullable=True)
    notification_type = Column(String, nullable=False)  # 'booking', 'intake', 'pickup', 'conflict', 'temperature', 'system'
    is_read = Column(Boolean, default=False)
    link_url = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, nullable=True)
    user_role = Column(String, nullable=True)
    action = Column(String, nullable=False)
    resource_type = Column(String, nullable=False)
    resource_id = Column(String, nullable=True)
    details = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
