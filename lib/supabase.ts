import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://spjsuglnqjtdfwdzvkn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNwanN1Z2xucWp0ZGZ3ZHp2a24iLCJyb2xlIjoiYW5vbiIsImlhdCI6MTczNDk3ODc5MSwiZXhwIjoyMDUwNTU0NzkxfQ.wLUOLAUPNsI_BI2_fCZz_QMVV3s2rVx4Yzz_V4BnhGw';

export const supabase = createClient(supabaseUrl, supabaseKey);

// Types pour TypeScript
export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'ADMIN' | 'STAFF' | 'ATTENDEE';
  created_at: string;
  updated_at: string;
}

export interface Reservation {
  id: string;
  user_id: string;
  qrcode: string;
  status: 'CONFIRMED' | 'CANCELLED';
  checked_in?: boolean;
  checked_in_at?: string;
  created_at: string;
  // Relations
  user?: User;
}

// Fonctions utilitaires pour les requêtes
export const userQueries = {
  // Créer un utilisateur
  async create(userData: Omit<User, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('users')
      .insert([userData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Trouver un utilisateur par email
  async findByEmail(email: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  // Trouver un utilisateur par ID
  async findById(id: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  // Mettre à jour un utilisateur
  async update(id: string, updates: Partial<User>) {
    const { data, error } = await supabase
      .from('users')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Lister tous les utilisateurs (admin)
  async findAll() {
    const { data, error } = await supabase
      .from('users')
      .select(`
        *,
        reservations:reservations(*)
      `)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  }
};

export const reservationQueries = {
  // Créer une réservation
  async create(reservationData: Omit<Reservation, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('reservations')
      .insert([reservationData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Trouver les réservations d'un utilisateur
  async findByUserId(userId: string) {
    const { data, error } = await supabase
      .from('reservations')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // Trouver une réservation par QR code
  async findByQRCode(qrcode: string) {
    const { data, error } = await supabase
      .from('reservations')
      .select(`
        *,
        user:users(*)
      `)
      .eq('qrcode', qrcode)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  // Lister toutes les réservations avec utilisateurs
  async findAllWithUsers() {
    const { data, error } = await supabase
      .from('reservations')
      .select(`
        *,
        user:users(*)
      `)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // Mettre à jour une réservation
  async update(id: string, updates: Partial<Reservation>) {
    const { data, error } = await supabase
      .from('reservations')
      .update(updates)
      .eq('id', id)
      .select(`
        *,
        user:users(*)
      `)
      .single();
    
    if (error) throw error;
    return data;
  },

  // Statistiques
  async getStats() {
    const [
      { count: totalUsers },
      { count: totalReservations },
      { count: confirmedReservations },
      { count: cancelledReservations },
      { count: checkedInReservations }
    ] = await Promise.all([
      supabase.from('users').select('*', { count: 'exact', head: true }),
      supabase.from('reservations').select('*', { count: 'exact', head: true }),
      supabase.from('reservations').select('*', { count: 'exact', head: true }).eq('status', 'CONFIRMED'),
      supabase.from('reservations').select('*', { count: 'exact', head: true }).eq('status', 'CANCELLED'),
      supabase.from('reservations').select('*', { count: 'exact', head: true }).eq('checked_in', true)
    ]);

    return {
      totalUsers: totalUsers || 0,
      totalReservations: totalReservations || 0,
      confirmedReservations: confirmedReservations || 0,
      cancelledReservations: cancelledReservations || 0,
      checkedInReservations: checkedInReservations || 0
    };
  }
};
