// supabase.js
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error("Supabase URL is missing. Please set REACT_APP_SUPABASE_URL environment variable.");
}

if (!supabaseAnonKey) {
  throw new Error("Supabase anon key is missing. Please set REACT_APP_SUPABASE_ANON_KEY environment variable.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
