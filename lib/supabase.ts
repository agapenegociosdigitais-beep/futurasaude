import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Cliente público — para uso no frontend
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Cliente admin — para uso no backend (APIs)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Cliente para server components do Next.js
export const createServerClient = () =>
  createClient(supabaseUrl, supabaseAnonKey);
