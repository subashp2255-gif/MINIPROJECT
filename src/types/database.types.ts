export type UserRole = 'farmer' | 'owner' | 'admin';
export type BookingStatus = 'pending' | 'approved' | 'rejected' | 'cancelled' | 'completed';
export type CropBatchStatus = 'stored' | 'released' | 'spoiled';
export type InventoryTransactionType = 'stock_in' | 'stock_out' | 'adjustment';

export interface ProfileRow {
  id: string;
  full_name: string;
  phone: string | null;
  role: UserRole;
  village: string | null;
  district: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProfileInsert {
  id: string;
  full_name: string;
  phone?: string | null;
  role: UserRole;
  village?: string | null;
  district?: string | null;
}

export interface ProfileUpdate {
  full_name?: string;
  phone?: string | null;
  village?: string | null;
  district?: string | null;
}

export interface StorageFacilityRow {
  id: string;
  owner_id: string;
  name: string;
  description: string | null;
  village: string | null;
  district: string | null;
  state: string;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  capacity_kg: number;
  available_capacity_kg: number;
  price_per_kg_per_day: number;
  supported_crops: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // Join fields
  profiles?: ProfileRow;
}

export interface StorageFacilityInsert {
  owner_id: string;
  name: string;
  description?: string | null;
  village?: string | null;
  district?: string | null;
  state?: string;
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  capacity_kg: number;
  available_capacity_kg: number;
  price_per_kg_per_day: number;
  supported_crops?: string[];
  is_active?: boolean;
}

export interface StorageFacilityUpdate {
  name?: string;
  description?: string | null;
  village?: string | null;
  district?: string | null;
  address?: string | null;
  capacity_kg?: number;
  available_capacity_kg?: number;
  price_per_kg_per_day?: number;
  supported_crops?: string[];
  is_active?: boolean;
}

export interface BookingRow {
  id: string;
  farmer_id: string;
  facility_id: string;
  crop_name: string;
  quantity_kg: number;
  start_date: string;
  end_date: string;
  duration_days: number;
  estimated_cost: number;
  status: BookingStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
  // Join fields
  farmer_profile?: ProfileRow;
  facility?: StorageFacilityRow;
}

export interface BookingInsert {
  farmer_id: string;
  facility_id: string;
  crop_name: string;
  quantity_kg: number;
  start_date: string;
  end_date: string;
  duration_days: number;
  estimated_cost: number;
  status?: BookingStatus;
  notes?: string | null;
}

export interface CropBatchRow {
  id: string;
  owner_id: string;
  facility_id: string | null;
  crop_name: string;
  batch_code: string;
  quantity_kg: number;
  harvest_date: string | null;
  expiry_date: string | null;
  storage_location: string | null;
  status: CropBatchStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
  // Join fields
  facility?: StorageFacilityRow;
}

export interface CropBatchInsert {
  owner_id: string;
  facility_id?: string | null;
  crop_name: string;
  batch_code: string;
  quantity_kg: number;
  harvest_date?: string | null;
  expiry_date?: string | null;
  storage_location?: string | null;
  status?: CropBatchStatus;
  notes?: string | null;
}

export interface InventoryTransactionRow {
  id: string;
  batch_id: string;
  owner_id: string;
  transaction_type: InventoryTransactionType;
  quantity_kg: number;
  notes: string | null;
  created_at: string;
  // Join fields
  batch?: CropBatchRow;
}

export interface InventoryTransactionInsert {
  batch_id: string;
  owner_id: string;
  transaction_type: InventoryTransactionType;
  quantity_kg: number;
  notes?: string | null;
}
