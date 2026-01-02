// src/supabaseClient.js
import { createClient } from '@supabase/supabase-js'

// ============================================
// PRODUCTION READY - Using Environment Variables
// ============================================

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables!')
  console.error('Local development: Create .env.local with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY')
  console.error('Production: Set environment variables in your hosting platform')
  throw new Error('Missing Supabase environment variables')
}

console.log('✅ Supabase client initialized')

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})