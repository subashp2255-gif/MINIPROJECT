from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List, Dict, Any
from datetime import date, datetime

# --- Auth Schemas ---
class RegisterRequest(BaseModel):
    name: str
    phone: str
    role: str = "farmer"  # 'farmer', 'owner', 'admin'
    location: str
    password: Optional[str] = "agri123"

class LoginRequest(BaseModel):
    phone: str
    password: Optional[str] = "agri123"

class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    name: str
    phone: str
    role: str
    location: str
    avatar_url: Optional[str] = None
    created_at: Optional[datetime] = None

# --- Facility & Storage Location Schemas ---
class StorageLocationSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    facility_id: str
    name: str
    chamber_type: str
    temp_min: float
    temp_max: float
    current_temp: float
    humidity: int
    total_capacity_crates: int
    total_capacity_kg: float
    is_maintenance: bool = False
    maintenance_reason: Optional[str] = None

class FacilitySchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    owner_id: Optional[str]
    name: str
    name_ta: Optional[str]
    location: str
    location_ta: Optional[str]
    district: str
    latitude: float
    longitude: float
    rating: float
    review_count: int
    is_verified: bool
    is_solar_powered: bool
    price_per_crate_day: float
    price_per_kg_day: float
    operating_hours: str
    contact_phone: str
    manager_name: Optional[str]
    manager_image: Optional[str]
    chambers: List[StorageLocationSchema] = []

# --- Capacity Availability Engine Schemas ---
class AvailabilityCheckRequest(BaseModel):
    facility_id: str
    chamber_id: Optional[str] = None
    start_date: date
    duration_days: int
    requested_crates: int
    requested_kg: Optional[float] = None

class AlternativeOption(BaseModel):
    facility_id: str
    facility_name: str
    chamber_id: str
    chamber_name: str
    available_crates: int
    available_kg: float
    suggested_start_date: Optional[date] = None
    reason: str

class AvailabilityCheckResponse(BaseModel):
    is_available: bool
    facility_id: str
    chamber_id: str
    chamber_name: str
    requested_crates: int
    requested_kg: float
    start_date: date
    end_date: date
    duration_days: int
    min_available_crates_in_period: int
    min_available_kg_in_period: float
    deficit_crates: int = 0
    estimated_cost: float
    message: str
    alternatives: List[AlternativeOption] = []

# --- Booking Schemas ---
class BookingCreate(BaseModel):
    farmer_id: str
    facility_id: str
    chamber_id: str
    crop_name: str
    crop_name_ta: Optional[str] = None
    variety: Optional[str] = "Standard Hybrid"
    grade: Optional[str] = "Grade A"
    booked_crates: int = Field(gt=0)
    booked_kg: Optional[float] = None
    start_date: date
    duration_days: int = Field(gt=0)
    notes: Optional[str] = None

class BookingResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    booking_code: str
    farmer_id: str
    facility_id: str
    chamber_id: str
    crop_name: str
    crop_name_ta: Optional[str]
    variety: Optional[str]
    grade: str
    booked_crates: int
    booked_kg: float
    start_date: date
    duration_days: int
    end_date: date
    daily_rate_crate: float
    total_estimated_cost: float
    status: str
    batch_pin: str
    crop_image_url: Optional[str]
    created_at: datetime
    notes: Optional[str]

class BookingCancelRequest(BaseModel):
    reason: str
    cancelled_by: str = "farmer"

# --- Independent Inventory Schemas ---
class ProductCreate(BaseModel):
    facility_id: str
    name: str
    category: str
    measurement_unit: str = "kg"

class ProductResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    facility_id: str
    product_code: str
    name: str
    category: str
    measurement_unit: str
    is_archived: bool
    created_at: datetime

class BatchCreate(BaseModel):
    """
    Register a new product / crop batch.
    Notice: booking_id is strictly OPTIONAL.
    An initial quantity > 0 creates an initial intake transaction and updates physical occupancy.
    """
    facility_id: str
    chamber_id: str
    crop_name: str
    crop_name_ta: Optional[str] = None
    grade: Optional[str] = "Grade A"
    initial_stock_kg: float = Field(ge=0)
    initial_stock_crates: int = Field(ge=0)
    intake_date: Optional[date] = None
    expiry_date: Optional[date] = None
    expected_storage_end: Optional[date] = None
    farmer_name: Optional[str] = None
    farmer_id: Optional[str] = None
    supplier_name: Optional[str] = None
    condition: Optional[str] = "good"
    booking_id: Optional[str] = None
    notes: Optional[str] = None
    authorized_by: str = "Warehouse Manager"

class BatchResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    batch_code: str
    facility_id: str
    chamber_id: str
    product_id: Optional[str]
    booking_id: Optional[str]
    farmer_name: Optional[str]
    supplier_name: Optional[str]
    crop_name: str
    crop_name_ta: Optional[str]
    grade: str
    initial_stock_kg: float
    initial_stock_crates: int
    current_stock_kg: float
    current_stock_crates: int
    withdrawn_kg: float
    intake_date: date
    expiry_date: Optional[date]
    expected_storage_end: Optional[date]
    condition: str
    quality_score: int
    status: str
    notes: Optional[str]
    created_at: datetime

class IntakeRequest(BaseModel):
    batch_id: Optional[str] = None
    batch_code: Optional[str] = None
    facility_id: str
    chamber_id: str
    crop_name: Optional[str] = None
    quantity_kg: float = Field(gt=0)
    quantity_crates: int = Field(gt=0)
    source: Optional[str] = "Farm Gate Walk-in"
    booking_id: Optional[str] = None  # Optional reference only!
    authorized_by: str = "Scale Operator"
    reason: Optional[str] = "Physical Inbound Intake"

class WithdrawalRequest(BaseModel):
    batch_code: str
    quantity_kg: float = Field(gt=0)
    quantity_crates: int = Field(ge=0)
    recipient_name: Optional[str] = None
    reason: str
    authorized_by: str = "Warehouse Dispatch In-Charge"

class TransferRequest(BaseModel):
    batch_code: str
    source_chamber_id: str
    destination_chamber_id: str
    quantity_kg: float = Field(gt=0)
    quantity_crates: int = Field(ge=0)
    reason: str = "Chamber re-balancing / temperature optimization"
    authorized_by: str = "Operations Supervisor"

class AdjustmentRequest(BaseModel):
    batch_code: str
    adjusted_stock_kg: float = Field(ge=0)
    adjusted_stock_crates: int = Field(ge=0)
    reason: str  # Mandatory: discrepancy, damage, spoilage, data correction, loss
    condition: Optional[str] = None
    authorized_by: str = "Auditor / Quality Inspector"

class TransactionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    batch_id: str
    batch_code: str
    facility_id: str
    transaction_type: str
    quantity_kg: float
    quantity_crates: int
    previous_balance_kg: float
    new_balance_kg: float
    source_location_id: Optional[str]
    destination_location_id: Optional[str]
    authorized_by: str
    reason: str
    receipt_number: str
    booking_id: Optional[str]
    timestamp: datetime

class InventoryAlertResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    facility_id: str
    alert_type: str
    title: str
    message: str
    severity: str
    is_resolved: bool
    created_at: datetime

# --- Review & Feedback Schemas ---
class ReviewCreate(BaseModel):
    booking_id: Optional[str] = None
    facility_id: str
    farmer_id: str
    farmer_name: str
    rating: int = Field(ge=1, le=5)
    comment: Optional[str] = None
    would_revisit: bool = True
    is_complaint: bool = False
    complaint_category: Optional[str] = None

class ReviewResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    booking_id: Optional[str]
    facility_id: str
    farmer_id: str
    farmer_name: str
    rating: int
    comment: Optional[str]
    would_revisit: bool
    is_complaint: bool
    complaint_category: Optional[str]
    complaint_status: Optional[str]
    owner_response: Optional[str]
    created_at: datetime

class OwnerResponseCreate(BaseModel):
    owner_response: str

# --- Notification Schemas ---
class NotificationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    user_id: str
    title: str
    title_ta: Optional[str]
    message: str
    message_ta: Optional[str]
    notification_type: str
    is_read: bool
    link_url: Optional[str]
    created_at: datetime


# --- Dashboard & Capacity Ledgers Analytics Schemas ---
class CapacityLedgerResponse(BaseModel):
    facility_id: str
    facility_name: str
    total_rated_capacity_kg: float
    total_rated_capacity_crates: int
    current_physical_occupancy_kg: float
    current_physical_occupancy_crates: int
    available_physical_capacity_kg: float
    available_physical_capacity_crates: int
    reserved_capacity_kg_today: float
    reserved_capacity_crates_today: int
    maintenance_blocked_kg: float
    maintenance_blocked_crates: int
    utilization_physical_percentage: float
    utilization_reserved_percentage: float

class OwnerDashboardAnalyticsResponse(BaseModel):
    capacity_ledger: CapacityLedgerResponse
    total_active_bookings: int
    total_active_batches: int
    total_stock_movements_today: int
    recent_transactions: List[TransactionResponse]
    active_alerts: List[InventoryAlertResponse]
    low_stock_count: int
    near_expiry_count: int
    damaged_stock_kg: float

# --- AI Insights & Forecast Schemas ---
class PriceForecastRequest(BaseModel):
    crop: str
    mandi: str = "Oddanchatram APMC"
    horizon_days: int = 7

class ForecastPoint(BaseModel):
    day: str
    projected_price: float
    lower_confidence_95: float
    upper_confidence_95: float
    storage_cost_accumulated: float

class PriceForecastResponse(BaseModel):
    crop: str
    mandi: str
    spot_price: float
    horizon_days: int
    forecast_points: List[ForecastPoint]
    recommended_action: str

class ArbitrageRequest(BaseModel):
    weight_kg: float
    spot_price_per_kg: float
    forecast_price_per_kg: float
    daily_crate_fee: float = 2.90
    crates_per_tonne: int = 40
    duration_days: int = 7

class ArbitrageResponse(BaseModel):
    crates_count: int
    revenue_today: float
    revenue_future: float
    total_holding_cost: float
    net_gain: float
    roi_percentage: float
    is_profitable: bool

class AIInsightItem(BaseModel):
    id: str
    category: str  # 'demand_forecast', 'capacity_warning', 'near_expiry', 'spoilage_risk', 'arbitrage'
    title: str
    description: str
    severity: str  # 'info', 'warning', 'critical'
    confidence: float
    data_source: str
    recommended_action: str
    generated_at: datetime
