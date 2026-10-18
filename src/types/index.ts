export type UserRole = 'farmer' | 'owner' | 'admin';
export type Language = 'en' | 'ta';
export type ServiceMode = 'cold' | 'inventory';

export interface UserProfile {
  id: string;
  name: string;
  role: UserRole;
  phone: string;
  location: string;
  farmerId?: string;
  facilityId?: string;
  avatarUrl: string;
}

export interface Chamber {
  id: string;
  name: string;
  type: 'chilled' | 'cool' | 'controlled_atmosphere' | 'dry_ventilated';
  tempMin: number;
  tempMax: number;
  currentTemp: number;
  humidity: number;
  totalCapacityCrates: number;
  availableCapacityCrates: number;
  totalCapacityKg: number;
  availableCapacityKg: number;
  isMaintenance: boolean;
  maintenanceReason?: string;
}

export interface Facility {
  id: string;
  name: string;
  nameTa: string;
  location: string;
  locationTa: string;
  district: string;
  distanceKm: number;
  coordinates: { lat: number; lng: number };
  rating: number;
  reviewCount: number;
  verified: boolean;
  solarPowered: boolean;
  imageUrl: string;
  pricePerCrateDay: number;
  pricePerKgDay: number;
  chambers: Chamber[];
  supportedCrops: string[];
  supportedCropsTa: string[];
  contactPhone: string;
  operatingHours: string;
  lastUpdatedMinutesAgo: number;
  managerName: string;
  managerImage: string;
}

export type BookingStatus =
  | 'pending'
  | 'confirmed'
  | 'en_route'
  | 'gate_arrived'
  | 'verified_intake'
  | 'in_storage'
  | 'partially_collected'
  | 'completed'
  | 'cancelled'
  | 'needs_resolution';

export interface Booking {
  id: string;
  bookingCode: string; // e.g. #SRS-TN-8492
  farmerId: string;
  farmerName: string;
  farmerPhone: string;
  facilityId: string;
  facilityName: string;
  chamberId: string;
  chamberName: string;
  cropName: string;
  cropNameTa: string;
  variety: string;
  grade: 'Grade A' | 'Grade B' | 'Standard';
  bookedCrates: number;
  bookedKg: number;
  verifiedKg?: number;
  verifiedCrates?: number;
  startDate: string;
  durationDays: number;
  endDate: string;
  dailyRateCrate: number;
  totalEstimatedCost: number;
  status: BookingStatus;
  batchPin: string;
  createdAt: string;
  hasConflict?: boolean;
  conflictDetails?: ConflictNotice;
  cropImageUrl: string;
}

export interface InventoryBatch {
  id: string;
  batchCode: string; // e.g. #TN-DDG-088
  bookingId: string;
  farmerId: string;
  farmerName: string;
  facilityId: string;
  facilityName: string;
  chamberName: string;
  cropName: string;
  cropNameTa: string;
  grade: string;
  cropImageUrl: string;
  currentStockKg: number;
  currentStockCrates: number;
  initialStockKg: number;
  withdrawnKg: number;
  dayCurrent: number;
  dayTotal: number;
  intakeDate: string;
  targetCollectDate: string;
  currentTemp: number;
  currentHumidity: number;
  status: 'in_storage' | 'in_transit' | 'ready_to_collect' | 'withdrawn';
  qualityScore: number;
  condition?: 'good' | 'fair' | 'damaged' | 'spoiled' | string;
  notes?: string;
}

export interface InventoryMovement {
  id: string;
  batchId: string;
  batchCode: string;
  timestamp: string;
  type: 'intake' | 'partial_withdrawal' | 'full_dispatch' | 'spoilage_writeoff' | 'chamber_relocation';
  quantityKg: number;
  quantityCrates: number;
  authorizedBy: string;
  recipientName?: string;
  recipientPhone?: string;
  reason: string;
  receiptNumber: string;
}

export interface ConflictNotice {
  id: string;
  bookingCode: string;
  facilityId: string;
  facilityName: string;
  chamberName: string;
  bookedKg: number;
  availableKg: number;
  deficitKg: number;
  spaceCutPercentage: number;
  managerName: string;
  managerNote: string;
  managerImage: string;
  gateInTime: string;
  resolved: boolean;
  selectedOption?: 'accept_partial' | 'reroute' | 'reschedule' | 'cancel_refund';
  resolutionTimestamp?: string;
}

export interface InspectionRequest {
  id: string;
  batchCode: string;
  cropName: string;
  farmerId: string;
  farmerName: string;
  facilityId: string;
  facilityName: string;
  chamberName: string;
  scheduledDate: string;
  scheduledTime: string;
  status: 'pending' | 'approved' | 'in_progress' | 'completed' | 'declined';
  notes?: string;
  discrepancyReported?: boolean;
  discrepancyDetails?: string;
}

export interface FeedbackReview {
  id: string;
  bookingCode: string;
  facilityId: string;
  facilityName: string;
  farmerName: string;
  rating: number; // 1-5
  comment: string;
  createdAt: string;
  isComplaint: boolean;
  complaintCategory?: string;
  complaintStatus?: 'open' | 'under_review' | 'resolved' | 'disputed';
  ownerResponse?: string;
  revisitBooked?: boolean;
}

export interface NotificationItem {
  id: string;
  title: string;
  titleTa: string;
  message: string;
  messageTa: string;
  timestamp: string;
  type: 'booking' | 'pickup' | 'conflict' | 'temperature' | 'inspection' | 'system';
  read: boolean;
  linkUrl?: string;
}

export interface AIPriceForecastPoint {
  day: string;
  date: string;
  spotPrice: number;
  projectedPrice: number;
  lowerConfidence: number;
  upperConfidence: number;
  cumulativeStorageCost: number;
  netArbitrageMargin: number;
}

export interface CapacityLedger {
  facilityId: string;
  facilityName: string;
  totalRatedCapacityKg: number;
  totalRatedCapacityCrates: number;
  currentPhysicalOccupancyKg: number;
  currentPhysicalOccupancyCrates: number;
  availablePhysicalCapacityKg: number;
  availablePhysicalCapacityCrates: number;
  reservedCapacityKgToday: number;
  reservedCapacityCratesToday: number;
  maintenanceBlockedKg: number;
  maintenanceBlockedCrates: number;
  utilizationPhysicalPercentage: number;
  utilizationReservedPercentage: number;
}

export interface AIInsight {
  id: string;
  category: 'demand_forecast' | 'capacity_warning' | 'near_expiry' | 'spoilage_risk' | 'arbitrage';
  title: string;
  description: string;
  severity: 'info' | 'warning' | 'critical';
  confidence: number;
  dataSource: string;
  recommendedAction: string;
  generatedAt?: string;
}

export interface InventoryAlert {
  id: string;
  facilityId?: string;
  alertType: 'low_stock' | 'near_expiry' | 'expired' | 'capacity_warning' | 'damage_detected';
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'critical';
  isResolved: boolean;
  createdAt: string;
  productId?: string;
}

export type DryCropCategory = 'rice' | 'wheat' | 'pulses' | 'grains' | 'oilseeds' | 'spices' | 'other';
export type DryCropUnit = 'kg' | 'quintal' | 'bag' | 'tonne';

export interface DryInventoryTransaction {
  id: string;
  productId: string;
  type: 'initial' | 'add' | 'remove' | 'adjust' | 'transfer';
  quantity: number;
  unit: DryCropUnit;
  previousBalance: number;
  newBalance: number;
  reason: string;
  date: string;
  authorizedBy: string;
  receiptNumber: string;
  sourceLocation?: string;
  destinationLocation?: string;
  notes?: string;
}

export interface DryProduct {
  id: string;
  productCode: string;
  name: string;
  nameTa: string;
  category: DryCropCategory;
  variety?: string;
  quantity: number;
  unit: DryCropUnit;
  storageLocation: string;
  batchLotId: string;
  harvestDate?: string;
  expiryDate?: string;
  supplier?: string;
  unitCost?: number;
  totalValue?: number;
  lowStockThreshold: number;
  isArchived: boolean;
  status: 'in_stock' | 'low_stock' | 'depleted' | 'archived';
  notes?: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
  transactions: DryInventoryTransaction[];
}

export interface PickupRequest {
  id: string;
  requestCode: string;
  bookingCode: string;
  batchCode: string;
  cropName: string;
  farmerName: string;
  facilityId: string;
  facilityName: string;
  requestedKg: number;
  requestedCrates: number;
  collectionDate: string;
  collectionTime: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  notes?: string;
  rejectionReason?: string;
  createdAt: string;
}
