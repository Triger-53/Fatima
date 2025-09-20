// utils/supabaseAdmin.js
import { createClient } from "@supabase/supabase-js"

// Admin client for server-side operations (only use in secure environments)
const supabaseAdmin = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_SERVICE_ROLE_KEY
)

// Check if user exists by email
export const checkUserExists = async (email) => {
  try {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers()
    if (error) throw error
    
    const exists = data.users.some((user) => user.email === email)
    return { exists, error: null }
  } catch (error) {
    console.error("Error checking user existence:", error)
    return { exists: null, error: error.message }
  }
}

// Delete user by ID
export const deleteUserById = async (userId) => {
  try {
    const { error } = await supabaseAdmin.auth.admin.deleteUser(userId)
    if (error) throw error
    
    return { success: true, error: null }
  } catch (error) {
    console.error("Error deleting user:", error)
    return { success: false, error: error.message }
  }
}

export { supabaseAdmin }
