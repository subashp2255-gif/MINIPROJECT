import { getSupabase, isSupabaseConfigured } from '../lib/supabaseClient';
import type {
  CropBatchRow,
  CropBatchInsert,
  InventoryTransactionRow,
  InventoryTransactionType,
} from '../types/database.types';
import type { InventoryBatch, InventoryMovement } from '../types';

export const inventoryService = {
  /**
   * Fetch all crop batches belonging to a storage owner
   */
  async getBatches(ownerId?: string): Promise<CropBatchRow[]> {
    if (!isSupabaseConfigured()) return [];

    const supabase = getSupabase();
    let query = supabase
      .from('crop_batches')
      .select('*, facility:facility_id(*)')
      .order('created_at', { ascending: false });

    if (ownerId) {
      query = query.eq('owner_id', ownerId);
    }

    const { data, error } = await query;
    if (error) {
      console.error('[inventoryService] getBatches error:', error);
      throw error;
    }
    return data || [];
  },

  /**
   * Independently create a new crop batch (No booking required)
   */
  async createBatch(batchData: CropBatchInsert): Promise<CropBatchRow> {
    if (!isSupabaseConfigured()) throw new Error('Supabase not configured.');

    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('crop_batches')
      .insert(batchData)
      .select()
      .single();

    if (error) {
      console.error('[inventoryService] createBatch error:', error);
      throw error;
    }

    // Automatically record an initial stock-in transaction
    if (batchData.quantity_kg > 0) {
      await supabase.from('inventory_transactions').insert({
        batch_id: data.id,
        owner_id: batchData.owner_id,
        transaction_type: 'stock_in',
        quantity_kg: batchData.quantity_kg,
        notes: batchData.notes || 'Initial batch intake registration',
      });
    }

    return data;
  },

  /**
   * Record inventory transaction (stock_in, stock_out, adjustment) atomically
   */
  async recordTransaction(params: {
    batchId: string;
    ownerId: string;
    type: InventoryTransactionType;
    quantityKg: number;
    notes?: string;
  }): Promise<{ success: boolean; newQuantityKg?: number; error?: string }> {
    if (!isSupabaseConfigured()) return { success: false, error: 'Supabase not configured.' };

    const supabase = getSupabase();

    // Call atomic RPC
    const { data: rpcData, error: rpcError } = await supabase.rpc('record_inventory_transaction_atomic', {
      p_batch_id: params.batchId,
      p_transaction_type: params.type,
      p_quantity_kg: params.quantityKg,
      p_notes: params.notes || null,
    });

    if (rpcError) {
      console.warn('[inventoryService] RPC warning, falling back to direct table update:', rpcError.message);
      return await this.recordTransactionFallback(params);
    }

    if (rpcData && !rpcData.success) {
      return { success: false, error: rpcData.error };
    }

    return {
      success: true,
      newQuantityKg: rpcData?.new_quantity_kg,
    };
  },

  /**
   * Fallback for recording inventory transaction if RPC is unavailable
   */
  async recordTransactionFallback(params: {
    batchId: string;
    ownerId: string;
    type: InventoryTransactionType;
    quantityKg: number;
    notes?: string;
  }): Promise<{ success: boolean; newQuantityKg?: number; error?: string }> {
    const supabase = getSupabase();

    // 1. Fetch current batch
    const { data: batch, error: bErr } = await supabase
      .from('crop_batches')
      .select('*')
      .eq('id', params.batchId)
      .single();

    if (bErr || !batch) return { success: false, error: 'Batch not found.' };

    let newQty = Number(batch.quantity_kg);
    if (params.type === 'stock_in') {
      newQty += params.quantityKg;
    } else if (params.type === 'stock_out') {
      if (newQty < params.quantityKg) {
        return {
          success: false,
          error: `Insufficient stock: current stock is ${newQty} kg, requested withdrawal is ${params.quantityKg} kg`,
        };
      }
      newQty -= params.quantityKg;
    } else if (params.type === 'adjustment') {
      newQty = params.quantityKg;
    }

    if (newQty < 0) {
      return { success: false, error: 'Inventory balance cannot be negative.' };
    }

    // 2. Update batch quantity
    const { error: uErr } = await supabase
      .from('crop_batches')
      .update({
        quantity_kg: newQty,
        status: newQty === 0 ? 'released' : 'stored',
      })
      .eq('id', params.batchId);

    if (uErr) return { success: false, error: uErr.message };

    // 3. Log transaction
    await supabase.from('inventory_transactions').insert({
      batch_id: params.batchId,
      owner_id: params.ownerId,
      transaction_type: params.type,
      quantity_kg: params.quantityKg,
      notes: params.notes || null,
    });

    return { success: true, newQuantityKg: newQty };
  },

  /**
   * Fetch inventory transactions for audit history
   */
  async getTransactions(ownerId?: string, batchId?: string): Promise<InventoryTransactionRow[]> {
    if (!isSupabaseConfigured()) return [];

    const supabase = getSupabase();
    let query = supabase
      .from('inventory_transactions')
      .select('*, batch:batch_id(*)')
      .order('created_at', { ascending: false });

    if (ownerId) {
      query = query.eq('owner_id', ownerId);
    }
    if (batchId) {
      query = query.eq('batch_id', batchId);
    }

    const { data, error } = await query;
    if (error) {
      console.error('[inventoryService] getTransactions error:', error);
      throw error;
    }
    return data || [];
  },

  /**
   * Map database row to frontend domain batch
   */
  mapRowToBatch(row: CropBatchRow): InventoryBatch {
    return {
      id: row.id,
      batchCode: row.batch_code,
      bookingId: row.id,
      farmerId: row.owner_id,
      farmerName: 'Warehouse Direct Intake',
      facilityId: row.facility_id || 'fac-1',
      facilityName: row.facility?.name || 'Agro Storage Hub',
      chamberName: row.storage_location || 'Chamber 1 (Chilled)',
      cropName: row.crop_name,
      cropNameTa: row.crop_name,
      grade: 'Grade A',
      cropImageUrl: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=400&q=80',
      currentStockKg: Number(row.quantity_kg),
      currentStockCrates: Math.ceil(Number(row.quantity_kg) / 25),
      initialStockKg: Number(row.quantity_kg),
      withdrawnKg: 0,
      dayCurrent: 4,
      dayTotal: 25,
      intakeDate: row.harvest_date || row.created_at.split('T')[0],
      targetCollectDate: row.expiry_date || new Date(Date.now() + 20 * 86400000).toISOString().split('T')[0],
      currentTemp: 4.2,
      currentHumidity: 88,
      status: row.status === 'released' ? 'withdrawn' : 'in_storage',
      qualityScore: 98,
      condition: 'good',
      notes: row.notes || undefined,
    };
  },

  /**
   * Map database transaction to frontend movement
   */
  mapRowToMovement(row: InventoryTransactionRow): InventoryMovement {
    const txTypeMap: Record<InventoryTransactionType, InventoryMovement['type']> = {
      stock_in: 'intake',
      stock_out: 'partial_withdrawal',
      adjustment: 'spoilage_writeoff',
    };

    return {
      id: row.id,
      batchId: row.batch_id,
      batchCode: row.batch?.batch_code || `#BAT-${row.batch_id.slice(0, 4).toUpperCase()}`,
      timestamp: row.created_at,
      type: txTypeMap[row.transaction_type] || 'intake',
      quantityKg: Number(row.quantity_kg),
      quantityCrates: Math.ceil(Number(row.quantity_kg) / 25),
      authorizedBy: 'Warehouse Manager',
      reason: row.notes || 'Standard inventory movement',
      receiptNumber: `REC-${row.id.slice(0, 6).toUpperCase()}`,
    };
  },
};
