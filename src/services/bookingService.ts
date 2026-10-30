import { getSupabase, isSupabaseConfigured } from '../lib/supabaseClient';
import type { BookingRow, BookingStatus } from '../types/database.types';
import type { Booking } from '../types';

export const bookingService = {
  /**
   * Atomically create a booking using PostgreSQL RPC to prevent race conditions and overselling
   */
  async createBooking(params: {
    farmerId: string;
    facilityId: string;
    cropName: string;
    quantityKg: number;
    startDate: string;
    endDate: string;
    notes?: string;
  }): Promise<{ success: boolean; bookingId?: string; error?: string; remainingCapacityKg?: number }> {
    if (!isSupabaseConfigured()) {
      return { success: false, error: 'Supabase credentials not configured.' };
    }

    const supabase = getSupabase();

    // Call atomic RPC
    const { data: rpcData, error: rpcError } = await supabase.rpc('create_booking_atomic', {
      p_facility_id: params.facilityId,
      p_crop_name: params.cropName,
      p_quantity_kg: params.quantityKg,
      p_start_date: params.startDate,
      p_end_date: params.endDate,
      p_notes: params.notes || null,
    });

    if (rpcError) {
      console.warn('[bookingService] create_booking_atomic RPC error:', rpcError.message);
      // Fallback: If RPC not deployed or permissions issue, execute standard insert with capacity update
      return await this.createBookingFallback(params);
    }

    if (rpcData && !rpcData.success) {
      return { success: false, error: rpcData.error || 'Failed to reserve capacity' };
    }

    return {
      success: true,
      bookingId: rpcData?.booking_id,
      remainingCapacityKg: rpcData?.remaining_capacity_kg,
    };
  },

  /**
   * Fallback for direct database insert if RPC is unavailable
   */
  async createBookingFallback(params: {
    farmerId: string;
    facilityId: string;
    cropName: string;
    quantityKg: number;
    startDate: string;
    endDate: string;
    notes?: string;
  }): Promise<{ success: boolean; bookingId?: string; error?: string }> {
    const supabase = getSupabase();

    // 1. Check facility available capacity
    const { data: fac, error: facErr } = await supabase
      .from('storage_facilities')
      .select('capacity_kg, available_capacity_kg, price_per_kg_per_day')
      .eq('id', params.facilityId)
      .single();

    if (facErr || !fac) {
      return { success: false, error: 'Storage facility not found.' };
    }

    if (fac.available_capacity_kg < params.quantityKg) {
      return {
        success: false,
        error: `Insufficient capacity: only ${fac.available_capacity_kg} kg available (requested ${params.quantityKg} kg)`,
      };
    }

    const start = new Date(params.startDate);
    const end = new Date(params.endDate);
    const durationDays = Math.max(1, Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1);
    const cost = Math.round(params.quantityKg * fac.price_per_kg_per_day * durationDays);

    // 2. Insert booking
    const { data: newBooking, error: insErr } = await supabase
      .from('bookings')
      .insert({
        farmer_id: params.farmerId,
        facility_id: params.facilityId,
        crop_name: params.cropName,
        quantity_kg: params.quantityKg,
        start_date: params.startDate,
        end_date: params.endDate,
        duration_days: durationDays,
        estimated_cost: cost,
        status: 'pending',
        notes: params.notes || null,
      })
      .select()
      .single();

    if (insErr) {
      return { success: false, error: insErr.message };
    }

    // 3. Deduct available capacity
    await supabase
      .from('storage_facilities')
      .update({
        available_capacity_kg: Math.max(0, fac.available_capacity_kg - params.quantityKg),
      })
      .eq('id', params.facilityId);

    return { success: true, bookingId: newBooking.id };
  },

  /**
   * Update booking status (approve, reject, cancel, complete) with capacity restoration
   */
  async updateStatus(
    bookingId: string,
    newStatus: BookingStatus
  ): Promise<{ success: boolean; error?: string }> {
    if (!isSupabaseConfigured()) return { success: false, error: 'Supabase not configured' };

    const supabase = getSupabase();

    // Attempt RPC first
    const { data: rpcData, error: rpcError } = await supabase.rpc('update_booking_status_atomic', {
      p_booking_id: bookingId,
      p_new_status: newStatus,
    });

    if (rpcError) {
      console.warn('[bookingService] update_booking_status_atomic RPC warning:', rpcError.message);
      // Fallback update
      const { data: booking } = await supabase
        .from('bookings')
        .select('facility_id, quantity_kg, status')
        .eq('id', bookingId)
        .single();

      if (booking && (newStatus === 'cancelled' || newStatus === 'rejected') && (booking.status === 'pending' || booking.status === 'approved')) {
        const { data: fac } = await supabase
          .from('storage_facilities')
          .select('capacity_kg, available_capacity_kg')
          .eq('id', booking.facility_id)
          .single();
        if (fac) {
          await supabase
            .from('storage_facilities')
            .update({
              available_capacity_kg: Math.min(fac.capacity_kg, fac.available_capacity_kg + booking.quantity_kg),
            })
            .eq('id', booking.facility_id);
        }
      }

      const { error: updErr } = await supabase
        .from('bookings')
        .update({ status: newStatus })
        .eq('id', bookingId);

      if (updErr) return { success: false, error: updErr.message };
      return { success: true };
    }

    if (rpcData && !rpcData.success) {
      return { success: false, error: rpcData.error };
    }

    return { success: true };
  },

  /**
   * Fetch bookings created by a specific farmer
   */
  async getFarmerBookings(farmerId?: string): Promise<BookingRow[]> {
    if (!isSupabaseConfigured()) return [];

    const supabase = getSupabase();
    let query = supabase
      .from('bookings')
      .select('*, facility:facility_id(*), farmer_profile:farmer_id(*)')
      .order('created_at', { ascending: false });

    if (farmerId) {
      query = query.eq('farmer_id', farmerId);
    }

    const { data, error } = await query;
    if (error) {
      console.error('[bookingService] getFarmerBookings error:', error);
      throw error;
    }
    return data || [];
  },

  /**
   * Fetch bookings for facilities owned by a specific owner
   */
  async getOwnerBookings(ownerId?: string): Promise<BookingRow[]> {
    if (!isSupabaseConfigured()) return [];

    const supabase = getSupabase();
    let query = supabase
      .from('bookings')
      .select('*, facility:facility_id!inner(*), farmer_profile:farmer_id(*)')
      .order('created_at', { ascending: false });

    if (ownerId) {
      query = query.eq('facility.owner_id', ownerId);
    }

    const { data, error } = await query;
    if (error) {
      console.error('[bookingService] getOwnerBookings error:', error);
      throw error;
    }
    return data || [];
  },

  /**
   * Convert DB BookingRow to frontend domain model
   */
  mapRowToBooking(row: BookingRow): Booking {
    const bookingCode = `#SRS-TN-${row.id.slice(0, 4).toUpperCase()}`;
    return {
      id: row.id,
      bookingCode,
      farmerId: row.farmer_id,
      farmerName: row.farmer_profile?.full_name || 'Farmer',
      farmerPhone: row.farmer_profile?.phone || '+91 98421 77301',
      facilityId: row.facility_id,
      facilityName: row.facility?.name || 'Cold Storage Facility',
      chamberId: `${row.facility_id}-cham-1`,
      chamberName: 'Chamber 1 (Chilled)',
      cropName: row.crop_name,
      cropNameTa: row.crop_name,
      variety: 'Commercial Variety',
      grade: 'Grade A',
      bookedCrates: Math.ceil(row.quantity_kg / 25),
      bookedKg: Number(row.quantity_kg),
      startDate: row.start_date,
      durationDays: row.duration_days,
      endDate: row.end_date,
      dailyRateCrate: 3.0,
      totalEstimatedCost: Number(row.estimated_cost),
      status: row.status as any,
      batchPin: row.id.slice(-4).toUpperCase(),
      createdAt: row.created_at,
      cropImageUrl: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=400&q=80',
    };
  },
};
