import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase environment variables are not set: NEXT_PUBLIC_SUPABASE_URL and/or NEXT_PUBLIC_SUPABASE_ANON_KEY')
}

export const supabase = (supabaseUrl && supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  global: {
    headers: {
      'x-application-name': 'presentation-app'
    }
  }
  })
  : (null as any)

export const isSupabaseConfigured = (): boolean => {
  return !!(supabaseUrl && supabaseAnonKey)
}

export const getStorageUrl = (path: string): string => {
  const { data: { publicUrl } } = supabase.storage
    .from('slides-images')
    .getPublicUrl(path)
  return publicUrl
}