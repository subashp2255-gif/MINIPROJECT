import { getSupabase, isSupabaseConfigured } from '../lib/supabaseClient';
import type { StorageFacilityRow, StorageFacilityInsert, StorageFacilityUpdate } from '../types/database.types';
import type { Facility } from '../types';

export const facilityService = {
  /**
   * Fetch all storage facilities with optional filtering by district, crop, or owner
   */
  async getFacilities(filters?: {
    district?: string;
    crop?: string;
    ownerId?: string;
    isActiveOnly?: boolean;
  }): Promise<StorageFacilityRow[]> {
    if (!isSupabaseConfigured()) {
      return [];
    }

    const supabase = getSupabase();
    let query = supabase
      .from('storage_facilities')
      .select('*, profiles:owner_id(id, full_name, phone, role)')
      .order('created_at', { ascending: false });

    if (filters?.isActiveOnly !== false) {
      query = query.eq('is_active', true);
    }

    if (filters?.district && filters.district !== 'all') {
      query = query.ilike('district', `%${filters.district}%`);
    }

    if (filters?.ownerId) {
      query = query.eq('owner_id', filters.ownerId);
    }

    const { data, error } = await query;
    if (error) {
      console.error('[facilityService] getFacilities error:', error);
      throw error;
    }

    let results = data || [];
    if (filters?.crop) {
      const searchCrop = filters.crop.toLowerCase();
      results = results.filter((f) =>
        (f.supported_crops || []).some((c: string) => c.toLowerCase().includes(searchCrop))
      );
    }

    return results;
  },

  /**
   * Fetch a single facility by ID
   */
  async getFacilityById(id: string): Promise<StorageFacilityRow | null> {
    if (!isSupabaseConfigured()) return null;

    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('storage_facilities')
      .select('*, profiles:owner_id(id, full_name, phone, role)')
      .eq('id', id)
      .single();

    if (error) {
      console.error('[facilityService] getFacilityById error:', error);
      return null;
    }
    return data;
  },

  /**
   * Create a new facility (Owners only)
   */
  async createFacility(facility: StorageFacilityInsert): Promise<StorageFacilityRow> {
    if (!isSupabaseConfigured()) throw new Error('Supabase not configured.');

    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('storage_facilities')
      .insert(facility)
      .select()
      .single();

    if (error) {
      console.error('[facilityService] createFacility error:', error);
      throw error;
    }
    return data;
  },

  /**
   * Update an existing facility
   */
  async updateFacility(id: string, updates: StorageFacilityUpdate): Promise<StorageFacilityRow> {
    if (!isSupabaseConfigured()) throw new Error('Supabase not configured.');

    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('storage_facilities')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('[facilityService] updateFacility error:', error);
      throw error;
    }
    return data;
  },

  /**
   * Toggle facility active status
   */
  async toggleActive(id: string, isActive: boolean): Promise<boolean> {
    if (!isSupabaseConfigured()) return false;

    const supabase = getSupabase();
    const { error } = await supabase
      .from('storage_facilities')
      .update({ is_active: isActive })
      .eq('id', id);

    if (error) {
      console.error('[facilityService] toggleActive error:', error);
      throw error;
    }
    return true;
  },

  /**
   * Convert a DB row to the frontend Facility domain model for components
   */
  mapRowToFacility(row: StorageFacilityRow): Facility {
    return {
      id: row.id,
      name: row.name,
      nameTa: row.name,
      location: `${row.village || ''}, ${row.district || ''}`.replace(/^,\s*|,\s*$/g, ''),
      locationTa: `${row.village || ''}, ${row.district || ''}`.replace(/^,\s*|,\s*$/g, ''),
      district: row.district || 'Dindigul',
      distanceKm: 4.8,
      coordinates: {
        lat: row.latitude || 10.4851,
        lng: row.longitude || 77.7472,
      },
      rating: 4.9,
      reviewCount: 38,
      verified: true,
      solarPowered: true,
      imageUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80',
      pricePerCrateDay: Math.round(row.price_per_kg_per_day * 25 * 100) / 100 || 3.0,
      pricePerKgDay: Number(row.price_per_kg_per_day),
      chambers: [
        {
          id: `${row.id}-cham-1`,
          name: 'Chamber 1 (Chilled)',
          type: 'chilled',
          tempMin: 2,
          tempMax: 10,
          currentTemp: 4.2,
          humidity: 88,
          totalCapacityCrates: Math.floor(row.capacity_kg / 25),
          availableCapacityCrates: Math.floor(row.available_capacity_kg / 25),
          totalCapacityKg: Number(row.capacity_kg),
          availableCapacityKg: Number(row.available_capacity_kg),
          isMaintenance: false,
        },
      ],
      supportedCrops: row.supported_crops && row.supported_crops.length > 0 ? row.supported_crops : ['Tomato', 'Potato', 'Onion'],
      supportedCropsTa: row.supported_crops || ['தக்காளி', 'உருளைக்கிழங்கு', 'வெங்காயம்'],
      contactPhone: row.profiles?.phone || '+91 94431 82910',
      operatingHours: '06:00 AM - 10:00 PM',
      lastUpdatedMinutesAgo: 5,
      managerName: row.profiles?.full_name || 'Arumugam P.',
      managerImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    };
  },
};
