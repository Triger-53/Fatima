// supabase.js
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL
const supabaseKey = process.env.REACT_APP_SUPABASE_SERVICE_ROLE_KEY

console.log("Supabase URL:", supabaseUrl)
console.log("Supabase Key:", supabaseKey ? "Loaded ✅" : "❌ Missing")

export const supabase = createClient(supabaseUrl, supabaseKey)
