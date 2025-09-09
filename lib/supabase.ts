import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://spjsuglnqjtdfwdkzvkn.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNwanN1Z2xucWp0ZGZ3ZGt6dmtuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTczMzA2NDYsImV4cCI6MjA3MjkwNjY0Nn0._gKb6yt1557Yj0Mv6rt0P5ttxR2NpNYFf4bx3tzKV0A'

export const supabase = createClient(supabaseUrl, supabaseKey)

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  company?: string;
  role: 'ADMIN' | 'STAFF' | 'ATTENDEE';
  created_at: string;
}

export interface Reservation {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  fonction?: string;
  qrcode: string;
  checked_in: boolean;
  checked_in_at?: string;
  created_at: string;
}
