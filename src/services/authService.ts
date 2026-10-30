import { getSupabase, isSupabaseConfigured } from '../lib/supabaseClient';
import type { UserRole } from '../types';
import type { ProfileRow } from '../types/database.types';

export const authService = {
  /**
   * Register a new user with Supabase Auth and save profile attributes
   */
  async signUp(params: {
    email?: string;
    phone: string;
    password?: string;
    fullName: string;
    role: UserRole;
    village?: string;
    district?: string;
  }): Promise<{ user: any; profile: ProfileRow | null; error: Error | null }> {
    if (!isSupabaseConfigured()) {
      return { user: null, profile: null, error: new Error('Supabase credentials not configured in environment or settings.') };
    }

    const supabase = getSupabase();

    // Generate a valid email format if only phone was entered
    const cleanPhone = params.phone.replace(/\D/g, '');
    const userEmail = params.email || `user_${cleanPhone || Date.now()}@agrisync.tn.gov.in`;
    const userPassword = params.password || 'AgriSync@2025';

    // Prevent public self-assignment to admin
    const safeRole: UserRole = params.role === 'admin' ? 'farmer' : params.role;

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: userEmail,
      password: userPassword,
      options: {
        data: {
          full_name: params.fullName,
          phone: params.phone,
          role: safeRole,
          village: params.village || 'Oddanchatram',
          district: params.district || 'Dindigul',
        },
      },
    });

    if (authError) {
      return { user: null, profile: null, error: authError };
    }

    if (!authData.user) {
      return { user: null, profile: null, error: new Error('Signup completed but user record not returned.') };
    }

    // Upsert into public.profiles
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: authData.user.id,
        full_name: params.fullName,
        phone: params.phone,
        role: safeRole,
        village: params.village || 'Oddanchatram',
        district: params.district || 'Dindigul',
      })
      .select()
      .single();

    if (profileError) {
      console.warn('[authService] Profile upsert warning:', profileError);
    }

    return { user: authData.user, profile: profileData, error: null };
  },

  /**
   * Sign in with email or phone + password
   */
  async signIn(emailOrPhone: string, password = 'agri123'): Promise<{ user: any; profile: ProfileRow | null; error: Error | null }> {
    if (!isSupabaseConfigured()) {
      return { user: null, profile: null, error: new Error('Supabase credentials not configured.') };
    }

    const supabase = getSupabase();
    let email = emailOrPhone.trim();
    if (!email.includes('@')) {
      const clean = emailOrPhone.replace(/\D/g, '');
      email = `user_${clean}@agrisync.tn.gov.in`;
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { user: null, profile: null, error };
    }

    let profile: ProfileRow | null = null;
    if (data.user) {
      const { data: pData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();
      profile = pData;
    }

    return { user: data.user, profile, error: null };
  },

  /**
   * Sign out current user
   */
  async signOut(): Promise<void> {
    if (!isSupabaseConfigured()) return;
    const supabase = getSupabase();
    await supabase.auth.signOut();
  },

  /**
   * Get current authenticated user session
   */
  async getCurrentSession() {
    if (!isSupabaseConfigured()) return null;
    const supabase = getSupabase();
    const { data } = await supabase.auth.getSession();
    return data.session;
  },

  /**
   * Get profile by user ID
   */
  async getProfile(userId: string): Promise<ProfileRow | null> {
    if (!isSupabaseConfigured()) return null;
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.warn('[authService] Failed to load profile:', error.message);
      return null;
    }
    return data;
  },

  /**
   * Update profile details (Name, phone, village, district - cannot elevate role)
   */
  async updateProfile(userId: string, updates: { full_name?: string; phone?: string; village?: string; district?: string }) {
    if (!isSupabaseConfigured()) throw new Error('Supabase not configured.');
    const supabase = getSupabase();

    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Subscribe to auth state changes
   */
  onAuthStateChange(callback: (event: string, session: any) => void) {
    if (!isSupabaseConfigured()) return { unsubscribe: () => {} };
    const supabase = getSupabase();
    const { data } = supabase.auth.onAuthStateChange(callback);
    return { unsubscribe: () => data.subscription.unsubscribe() };
  },
};
