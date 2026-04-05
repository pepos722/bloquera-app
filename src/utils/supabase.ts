import { createClient } from '@supabase/supabase-js';

// Reemplaza estas URLs y llaves con las de tu proyecto de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Cliente de Supabase para interactuar con la base de datos
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
