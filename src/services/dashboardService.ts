import { getSupabase, isSupabaseConfigured } from '../lib/supabaseClient';

export interface OwnerDashboardStats {
  totalFacilities: number;
  totalCapacityKg: number;
  availableCapacityKg: number;
  occupiedCapacityKg: number;
  utilizationPercentage: number;
  activeBookingsCount: number;
  pendingBookingsCount: number;
  activeBatchesCount: number;
  recentTransactionsCount: number;
}

export interface FarmerDashboardStats {
  activeBookingsCount: number;
  totalStoredKg: number;
  estimatedStorageSpend: number;
  nextPickupDate: string | null;
}

export const dashboardService = {
  /**
   * Calculate live metrics from database tables for storage owner
   */
  async getOwnerStats(ownerId?: string): Promise<OwnerDashboardStats | null> {
    if (!isSupabaseConfigured()) return null;

    const supabase = getSupabase();

    try {
      // 1. Storage facilities query
      let facQuery = supabase.from('storage_facilities').select('capacity_kg, available_capacity_kg');
      if (ownerId) facQuery = facQuery.eq('owner_id', ownerId);
      const { data: facilities } = await facQuery;

      const totalFacilities = facilities?.length || 0;
      const totalCapacityKg = facilities?.reduce((sum, f) => sum + Number(f.capacity_kg), 0) || 0;
      const availableCapacityKg = facilities?.reduce((sum, f) => sum + Number(f.available_capacity_kg), 0) || 0;
      const occupiedCapacityKg = Math.max(0, totalCapacityKg - availableCapacityKg);
      const utilizationPercentage = totalCapacityKg > 0 ? Math.round((occupiedCapacityKg / totalCapacityKg) * 100) : 0;

      // 2. Bookings query
      const { data: bookings } = await supabase.from('bookings').select('status');
      const activeBookingsCount = bookings?.filter((b) => b.status === 'approved' || b.status === 'completed').length || 0;
      const pendingBookingsCount = bookings?.filter((b) => b.status === 'pending').length || 0;

      // 3. Batches query
      let batchQuery = supabase.from('crop_batches').select('status');
      if (ownerId) batchQuery = batchQuery.eq('owner_id', ownerId);
      const { data: batches } = await batchQuery;
      const activeBatchesCount = batches?.filter((b) => b.status === 'stored').length || 0;

      // 4. Transactions query
      let txQuery = supabase.from('inventory_transactions').select('id');
      if (ownerId) txQuery = txQuery.eq('owner_id', ownerId);
      const { data: txs } = await txQuery;
      const recentTransactionsCount = txs?.length || 0;

      return {
        totalFacilities,
        totalCapacityKg,
        availableCapacityKg,
        occupiedCapacityKg,
        utilizationPercentage,
        activeBookingsCount,
        pendingBookingsCount,
        activeBatchesCount,
        recentTransactionsCount,
      };
    } catch (err) {
      console.error('[dashboardService] getOwnerStats error:', err);
      return null;
    }
  },

  /**
   * Calculate live metrics from database tables for farmer
   */
  async getFarmerStats(farmerId?: string): Promise<FarmerDashboardStats | null> {
    if (!isSupabaseConfigured()) return null;

    const supabase = getSupabase();

    try {
      let query = supabase.from('bookings').select('*');
      if (farmerId) query = query.eq('farmer_id', farmerId);
      const { data: bookings } = await query;

      if (!bookings) return null;

      const active = bookings.filter((b) => b.status === 'approved' || b.status === 'pending');
      const totalStoredKg = active.reduce((sum, b) => sum + Number(b.quantity_kg), 0);
      const estimatedStorageSpend = active.reduce((sum, b) => sum + Number(b.estimated_cost), 0);

      const endDates = active.map((b) => b.end_date).sort();
      const nextPickupDate = endDates.length > 0 ? endDates[0] : null;

      return {
        activeBookingsCount: active.length,
        totalStoredKg,
        estimatedStorageSpend,
        nextPickupDate,
      };
    } catch (err) {
      console.error('[dashboardService] getFarmerStats error:', err);
      return null;
    }
  },
};
