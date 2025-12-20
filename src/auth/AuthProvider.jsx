// src/auth/AuthProvider.jsx
import React, { createContext, useContext, useEffect, useState } from "react"
import { supabase } from "../supabase"

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
	const [user, setUser] = useState(null)
	const [session, setSession] = useState(null)
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		let mounted = true

		// Get current session (v2)
		supabase.auth.getSession().then(({ data }) => {
			if (!mounted) return
			setSession(data.session)
			setUser(data.session?.user ?? null)
			setLoading(false)
		})

		// Listen to auth changes
		const { data: subscription } = supabase.auth.onAuthStateChange(
			(_event, session) => {
				setSession(session)
				setUser(session?.user ?? null)
			}
		)

		return () => {
			mounted = false
			subscription?.subscription?.unsubscribe?.()
		}
	}, [])

	const signUp = async ({ email, password, full_name }) => {
		// Correct v2 syntax: put metadata under options.data
		const { data, error } = await supabase.auth.signUp({
			email,
			password,
			options: {
				data: { full_name },
			},
		})
		return { data, error }
	}

	const signIn = async ({ email, password }) => {
		const { data, error } = await supabase.auth.signInWithPassword({
			email,
			password,
		})
		return { data, error }
	}

	const signOut = async () => {
		const { error } = await supabase.auth.signOut()
		if (error) throw error
	}

	return (
		<AuthContext.Provider
			value={{ user, session, loading, signUp, signIn, signOut }}>
			{children}
		</AuthContext.Provider>
	)
}

export const useAuth = () => useContext(AuthContext)
