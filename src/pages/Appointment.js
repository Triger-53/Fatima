// src/pages/Appointment.jsx
import React, { useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"
import { Calendar, CheckCircle, ChevronRight, ChevronLeft } from "lucide-react"
import { supabase } from "../supabase"
import { checkUserExists, deleteUserById } from "../utils/supabaseAdmin"
import { getAllServices, getServiceByAppointmentType as getServiceByType } from "../data/services"

/**
 * Appointment page
 *
 * - Requires a real Supabase session to proceed (fresh browser blocked unless logged in;
 *   old browser with only stale local storage is blocked unless there's an active session).
 * - Sign-up uses email+password and then attempts to sign in immediately.
 * - Toggle between "Sign up" and "Login".
 * - If account was created in this flow and booking fails or is abandoned, delete the account.
 * - No placeholder attributes used in inputs.
 */

const DELETE_GRACE_PERIOD_MS = 15 * 60 * 1000 // 15 minutes grace period (client-side)

// Medical Centers Data
const MEDICAL_CENTERS = {
	SAIFEE_HOSPITAL: {
		id: 'saifee',
		name: 'Saifee Hospital',
		address: '15/17, Maharshi Karve Road, Marine Lines, Mumbai',
		phone: '+91 22 2200 0000',
		doctorSchedule: {
			monday: { start: '09:00', end: '12:00', slots: ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30'] },
			tuesday: { start: '09:00', end: '12:00', slots: ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30'] },
			wednesday: { start: '09:00', end: '12:00', slots: ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30'] },
			thursday: { start: '09:00', end: '12:00', slots: ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30'] },
			friday: { start: '09:00', end: '12:00', slots: ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30'] },
			saturday: { start: '09:00', end: '12:00', slots: ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30'] },
			sunday: null
		}
	},
	LILAVATI_HOSPITAL: {
		id: 'lilavati',
		name: 'Lilavati Hospital',
		address: 'A-791, Bandra Reclamation, Bandra West, Mumbai',
		phone: '+91 22 2675 1000',
		doctorSchedule: {
			monday: { start: '14:00', end: '17:00', slots: ['14:00', '14:30', '15:00', '15:30', '16:00', '16:30'] },
			tuesday: { start: '14:00', end: '17:00', slots: ['14:00', '14:30', '15:00', '15:30', '16:00', '16:30'] },
			wednesday: { start: '14:00', end: '17:00', slots: ['14:00', '14:30', '15:00', '15:30', '16:00', '16:30'] },
			thursday: { start: '14:00', end: '17:00', slots: ['14:00', '14:30', '15:00', '15:30', '16:00', '16:30'] },
			friday: { start: '14:00', end: '17:00', slots: ['14:00', '14:30', '15:00', '15:30', '16:00', '16:30'] },
			saturday: null,
			sunday: null
		}
	},
	KOKILABEN_HOSPITAL: {
		id: 'kokilaben',
		name: 'Kokilaben Dhirubhai Ambani Hospital',
		address: 'Rao Saheb Achutrao Patwardhan Marg, Four Bungalows, Andheri West, Mumbai',
		phone: '+91 22 3099 9999',
		doctorSchedule: {
			monday: { start: '10:00', end: '13:00', slots: ['10:00', '10:30', '11:00', '11:30', '12:00', '12:30'] },
			tuesday: { start: '10:00', end: '13:00', slots: ['10:00', '10:30', '11:00', '11:30', '12:00', '12:30'] },
			wednesday: { start: '10:00', end: '13:00', slots: ['10:00', '10:30', '11:00', '11:30', '12:00', '12:30'] },
			thursday: { start: '10:00', end: '13:00', slots: ['10:00', '10:30', '11:00', '11:30', '12:00', '12:30'] },
			friday: { start: '10:00', end: '13:00', slots: ['10:00', '10:30', '11:00', '11:30', '12:00', '12:30'] },
			saturday: null,
			sunday: null
		}
	}
}

// Online appointment slots
const ONLINE_SLOTS = {
	monday: { start: '09:00', end: '18:00', slots: ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'] },
	tuesday: { start: '09:00', end: '18:00', slots: ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'] },
	wednesday: { start: '09:00', end: '18:00', slots: ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'] },
	thursday: { start: '09:00', end: '18:00', slots: ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'] },
	friday: { start: '09:00', end: '18:00', slots: ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'] },
	saturday: { start: '09:00', end: '14:00', slots: ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30'] },
	sunday: null
}

// Helper functions
const getDayOfWeek = (dateString) => {
	const date = new Date(dateString)
	const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
	return days[date.getDay()]
}

const getAvailableSlots = (dateString, appointmentType, medicalCenter = null) => {
	const dayOfWeek = getDayOfWeek(dateString)
	
	if (appointmentType === 'online') {
		return ONLINE_SLOTS[dayOfWeek]?.slots || []
	} else if (appointmentType === 'offline' && medicalCenter) {
		const center = MEDICAL_CENTERS[medicalCenter]
		return center?.doctorSchedule[dayOfWeek]?.slots || []
	}
	
	return []
}

const isSlotAvailable = async (dateString, timeSlot, appointmentType, medicalCenter = null) => {
	const slotKey = `${dateString}_${timeSlot}_${appointmentType}_${medicalCenter || 'online'}`
	const bookedSlots = JSON.parse(localStorage.getItem('bookedSlots') || '[]')
	return !bookedSlots.includes(slotKey)
}

const bookSlot = async (dateString, timeSlot, appointmentType, medicalCenter = null) => {
	const slotKey = `${dateString}_${timeSlot}_${appointmentType}_${medicalCenter || 'online'}`
	const bookedSlots = JSON.parse(localStorage.getItem('bookedSlots') || '[]')
	
	if (bookedSlots.includes(slotKey)) {
		throw new Error('Slot is already booked')
	}
	
	bookedSlots.push(slotKey)
	localStorage.setItem('bookedSlots', JSON.stringify(bookedSlots))
	return true
}

const getAvailableDates = () => {
	const dates = []
	const today = new Date()
	const maxDate = new Date()
	maxDate.setDate(today.getDate() + 30) // Only allow booking up to 30 days in advance
	
	for (let d = new Date(today); d <= maxDate; d.setDate(d.getDate() + 1)) {
		dates.push(d.toISOString().split('T')[0])
	}
	
	return dates
}

const Appointment = () => {
	// Steps: 0 = Auth required, 1..4 = appointment steps
	const [currentStep, setCurrentStep] = useState(0)

	// Selected service from URL parameters
	const [selectedService, setSelectedService] = useState(null)

	const [formData, setFormData] = useState({
		firstName: "",
		lastName: "",
		email: "",
		phone: "",
		dateOfBirth: "",
		gender: "",
		appointmentType: "", // 'speech', 'articulation', 'language', etc.
		consultationMethod: "", // 'online' or 'offline'
		medicalCenter: "", // for offline appointments
		preferredDate: "",
		preferredTime: "",
		reason: "",
		symptoms: "",
		isNewPatient: "",
		currentMedications: "",
		allergies: "",
		medicalHistory: "",
	})

	const [isSubmitting, setIsSubmitting] = useState(false)
	const [isSubmitted, setIsSubmitted] = useState(false)
	const [error, setError] = useState(null)
	// Removed unused isLoading state
	
	// New state for enhanced appointment system
	const [availableSlots, setAvailableSlots] = useState([])
	const [availableDates, setAvailableDates] = useState([])
	const [loadingSlots, setLoadingSlots] = useState(false)

	// Holds appointment row returned after insert
	const [confirmationData, setConfirmationData] = useState(null)

	// AUTH / account creation state for Step 0
	const [authMode, setAuthMode] = useState("signup") // "signup" | "login"

	// Signup fields
	const [signupEmail, setSignupEmail] = useState("")
	const [signupPassword, setSignupPassword] = useState("")
	const [signupConfirmPassword, setSignupConfirmPassword] = useState("")

	// Login fields
	const [loginEmail, setLoginEmail] = useState("")
	const [loginPassword, setLoginPassword] = useState("")

	const [authMessage, setAuthMessage] = useState(null)
	const [authLoading, setAuthLoading] = useState(false)

	// track whether the account was created in this flow (so we can rollback if needed)
	const [createdInFlow, setCreatedInFlow] = useState(false)
	const [createdUserId, setCreatedUserId] = useState(null)

	// auth session
	const [user, setUser] = useState(null)
	const [isAuthenticated, setIsAuthenticated] = useState(false)

	// Local storage keys
	const LS_FORM_KEY = 'appointmentFormData'
	const LS_STEP_KEY = 'appointmentCurrentStep'
	const LS_FLAGS_KEY = 'appointmentCompletionFlags'
	// History caches (used to allow skipping without prefilling UI)
	const [historyPersonal, setHistoryPersonal] = useState(null)
	const [historyMedical, setHistoryMedical] = useState(null)

	// IMPORTANT: only real authenticated session allows proceeding
	const canProceed = Boolean(isAuthenticated)
	const effectiveStep = canProceed ? currentStep : 0

	// Completion flags helper and computed view step (skip 1 and 3 if complete)
	const getCompletionFlags = () => {
		try { return JSON.parse(localStorage.getItem(LS_FLAGS_KEY) || '{}') } catch (_) { return {} }
	}
	const viewStep = (() => {
		const flags = getCompletionFlags()
		if (!canProceed) return 0
		if (effectiveStep === 1 && flags?.personalComplete) return 2
		if (effectiveStep === 3 && flags?.medicalComplete) return 4
		return effectiveStep
	})()

	// grace timer ref so we can clear it if appointment confirmed
	const graceTimerRef = useRef(null)

	// ------------------- Parse URL parameters for selected service -------------------
	useEffect(() => {
		const urlParams = new URLSearchParams(window.location.search)
		const serviceParam = urlParams.get('service')
		
		if (serviceParam) {
			try {
				const service = JSON.parse(decodeURIComponent(serviceParam))
				setSelectedService(service)
				// Auto-fill appointment type if service is selected
				if (service.appointmentType) {
					setFormData(prev => ({
						...prev,
						appointmentType: service.appointmentType
					}))
				}
			} catch (error) {
				console.error('Error parsing service parameter:', error)
			}
		}
	}, [])

	// ------------------- Restore persisted form and step -------------------
	useEffect(() => {
		try {
			const savedForm = localStorage.getItem(LS_FORM_KEY)
			if (savedForm) {
				const parsed = JSON.parse(savedForm)
				setFormData((prev) => ({ ...prev, ...parsed }))
				// keep selectedService in sync below in the appointmentType effect
			}
		} catch (e) {
			console.warn('Could not restore appointment form from storage')
		}
	}, [])

	// ------------------- Load available dates on component mount -------------------
	useEffect(() => {
		setAvailableDates(getAvailableDates())
	}, [])

	// ------------------- Keep selected service synced with appointment type -------------------
	useEffect(() => {
		if (formData.appointmentType) {
			const service = getServiceByAppointmentType(formData.appointmentType)
			if (service) setSelectedService(service)
			else setSelectedService(null)
		} else {
			setSelectedService(null)
		}
	}, [formData.appointmentType])

	// ------------------- Load available slots when consultation method, date, or medical center changes -------------------
	useEffect(() => {
		const loadAvailableSlots = async () => {
			const { consultationMethod, preferredDate, medicalCenter } = formData
			
			if (!consultationMethod || !preferredDate) {
				setAvailableSlots([])
				return
			}

			setLoadingSlots(true)
			
			try {
				// Get all possible slots for this date and consultation method
				const allSlots = getAvailableSlots(preferredDate, consultationMethod, medicalCenter)
				
				// Check which slots are actually available (not booked)
				const availableSlotsList = []
				for (const slot of allSlots) {
					const isAvailable = await isSlotAvailable(preferredDate, slot, consultationMethod, medicalCenter)
					if (isAvailable) {
						availableSlotsList.push(slot)
					}
				}
				
				setAvailableSlots(availableSlotsList)
			} catch (error) {
				console.error('Error loading available slots:', error)
				setAvailableSlots([])
			} finally {
				setLoadingSlots(false)
			}
		}

		loadAvailableSlots()
	}, [formData.consultationMethod, formData.preferredDate, formData.medicalCenter])

	// ------------------- Session handling -------------------
	useEffect(() => {
		let mounted = true

		const init = async () => {
			try {
				// use getSession to obtain a live session (don't rely on old state)
				const {
					data: { session },
				} = await supabase.auth.getSession()
				if (session && mounted) {
					setUser(session.user)
					setIsAuthenticated(true)
					// Decide initial step based on stored step (if any). Flags will be computed below.
					try {
						const savedStep = parseInt(localStorage.getItem(LS_STEP_KEY) || 'NaN', 10)
						if (!Number.isNaN(savedStep)) {
							setCurrentStep(Math.min(4, Math.max(0, savedStep)))
						} else {
							setCurrentStep(1)
						}
					} catch (_) {
						setCurrentStep(1)
					}
				} else if (mounted) {
					setUser(null)
					setIsAuthenticated(false)
					setCurrentStep(0)
				}
			} catch (err) {
				console.error("getSession error", err)
				if (mounted) {
					setUser(null)
					setIsAuthenticated(false)
					setCurrentStep(0)
				}
			}
		}

		init()

		const { data: authListener } = supabase.auth.onAuthStateChange(
			(_event, session) => {
				if (session) {
					setUser(session.user)
					setIsAuthenticated(true)
					setCurrentStep(1)
				} else {
					setUser(null)
					setIsAuthenticated(false)
					setCurrentStep(0)
				}
			}
		)

		return () => {
			try {
				authListener?.subscription?.unsubscribe?.()
			} catch (e) {}
			mounted = false
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	// ------------------- Load user's previous appointments to set completion flags and prefill -------------------
	useEffect(() => {
		const loadUserHistory = async () => {
			if (!isAuthenticated || !user) return
			try {
				const email = user.email
				const { data, error } = await supabase
					.from('Appointment')
					.select('*')
					.or(`user_id.eq.${user.id},email.eq.${email}`)
					.order('id', { ascending: true })
				if (error) {
					console.error('history load error', error)
					return
				}
				const hasPersonal = Array.isArray(data) && data.some((d) => (
					(d?.firstName && d?.lastName && d?.email && d?.phone)
				))
				const hasMedical = Array.isArray(data) && data.some((d) => (
					(d?.isNewPatient || d?.currentMedications || d?.allergies || d?.medicalHistory)
				))
				const flags = { personalComplete: Boolean(hasPersonal), medicalComplete: Boolean(hasMedical) }
				try { localStorage.setItem(LS_FLAGS_KEY, JSON.stringify(flags)) } catch (_) {}

				// Cache the latest values, do not prefill UI
				const latest = Array.isArray(data) && data.length > 0 ? data[data.length - 1] : null
				if (latest) {
					setHistoryPersonal({
						firstName: latest.firstName || '',
						lastName: latest.lastName || '',
						email: latest.email || '',
						phone: latest.phone || '',
						dateOfBirth: latest.dateOfBirth || '',
						gender: latest.gender || ''
					})
					setHistoryMedical({
						isNewPatient: latest.isNewPatient || '',
						currentMedications: latest.currentMedications || '',
						allergies: latest.allergies || '',
						medicalHistory: latest.medicalHistory || ''
					})
				}
			} catch (e) {
				console.error('history computation failed', e)
			}
		}
		loadUserHistory()
	}, [isAuthenticated, user])

	// HARD GUARD: Force currentStep back to 0 when user cannot proceed.
	// Prevents cases where previous state or mutation left currentStep > 0.
	useEffect(() => {
		if (!canProceed && currentStep !== 0) {
			setCurrentStep(0)
		}
	}, [canProceed, currentStep])

	// If createdInFlow becomes true, start the client grace timer that will delete the created user
	useEffect(() => {
		if (createdInFlow && createdUserId) {
			if (graceTimerRef.current) {
				clearTimeout(graceTimerRef.current)
			}

			graceTimerRef.current = setTimeout(async () => {
				if (!isSubmitted) {
					await deleteCreatedUser(createdUserId, signupEmail || formData.email)
					setCreatedInFlow(false)
					setCreatedUserId(null)
					setAuthMessage(
						"Account removed because appointment wasn't completed."
					)
				}
			}, DELETE_GRACE_PERIOD_MS)
		}

		return () => {
			if (graceTimerRef.current) {
				clearTimeout(graceTimerRef.current)
				graceTimerRef.current = null
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [createdInFlow, createdUserId, isSubmitted])

	// If appointment completes successfully, cancel grace deletion
	useEffect(() => {
		if (isSubmitted && graceTimerRef.current) {
			clearTimeout(graceTimerRef.current)
			graceTimerRef.current = null
		}
	}, [isSubmitted])

	// If user closes / navigates away and the account was created in this flow but appointment not confirmed -> delete
	useEffect(() => {
		const handleBeforeUnload = async (e) => {
			if (createdInFlow && createdUserId && !isSubmitted) {
				try {
					await deleteCreatedUser(createdUserId, signupEmail || formData.email)
				} catch (err) {
					console.error("beforeunload deletion error", err)
				}
			}
		}

		window.addEventListener("beforeunload", handleBeforeUnload)
		return () => {
			window.removeEventListener("beforeunload", handleBeforeUnload)
		}
	}, [createdInFlow, createdUserId, isSubmitted, formData.email, signupEmail])

	// ---------------- Utility ----------------
	const handleChange = (e) => {
		const { name, value } = e.target
		setFormData((p) => {
			const next = { ...p, [name]: value }
			// Clear dependent fields
			if (name === 'consultationMethod' && value === 'online') {
				next.medicalCenter = ''
			}
			return next
		})
		if (error) setError(null)
	}

	// Persist form and current step
	useEffect(() => {
		try {
			localStorage.setItem(LS_FORM_KEY, JSON.stringify(formData))
		} catch (_) {}
	}, [formData])

	useEffect(() => {
		try {
			localStorage.setItem(LS_STEP_KEY, String(currentStep))
		} catch (_) {}
	}, [currentStep])

	// ---------------- Step navigation ----------------
	const nextStep = () => {
		if (!canProceed) {
			setAuthMessage("Please sign in before proceeding.")
			setCurrentStep(0)
			return
		}
		// read completion flags to determine skipping
		let flags
		try { flags = JSON.parse(localStorage.getItem(LS_FLAGS_KEY) || '{}') } catch (_) { flags = {} }
		setCurrentStep((prev) => {
			// If moving from step 1 and personal is complete, skip to 2
			if (prev === 1 && flags?.personalComplete) return 2
			// If moving from step 2 and medical is complete, skip to 4
			if (prev === 2 && flags?.medicalComplete) return 4
			return Math.min(4, prev + 1)
		})
	}

	const prevStep = () => {
		// prevent stepping back onto form if they didn't authenticate
		if (currentStep === 1 && !canProceed) return
		setCurrentStep((prev) => Math.max(0, prev - 1))
	}

	// ---------------- Validation ----------------
	const validatePersonalInfo = () => {
		let flags
		try { flags = JSON.parse(localStorage.getItem(LS_FLAGS_KEY) || '{}') } catch (_) { flags = {} }
		if (flags?.personalComplete) return null
		const firstName = String(formData.firstName || '').trim()
		const lastName = String(formData.lastName || '').trim()
		const email = String(formData.email || '').trim()
		const phone = String(formData.phone || '').trim()
		if (!firstName) return "First name is required"
		if (!lastName) return "Last name is required"
		if (!email) return "Email is required"
		if (!phone) return "Phone number is required"

		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
		if (!emailRegex.test(email)) return "Please enter a valid email address"

		const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/
		if (!phoneRegex.test(phone.replace(/\s/g, "")))
			return "Please enter a valid phone number"

		return null
	}

	const validateAppointmentDetails = () => {
		const { appointmentType, consultationMethod, preferredDate, preferredTime, medicalCenter } = formData
		
		if (!appointmentType) return "Please select appointment type (Speech Therapy, Voice Therapy, etc.)"
		if (!consultationMethod) return "Please select consultation method (Online or Offline)"
		if (!preferredDate) return "Please select a preferred date"
		if (!preferredTime) return "Please select a preferred time"
		
		if (consultationMethod === 'offline' && !medicalCenter) {
			return "Please select a medical center for offline appointment"
		}

		const selectedDate = new Date(preferredDate)
		const today = new Date()
		today.setHours(0, 0, 0, 0)
		if (selectedDate < today) return "Please select a future date"
		
		// Check if date is not too far in future (30 days max)
		const maxDate = new Date()
		maxDate.setDate(today.getDate() + 30)
		if (selectedDate > maxDate) return "Please select a date within the next 30 days"

		return null
	}

	// mark completion flags when validations succeed and user moves forward
	useEffect(() => {
		// whenever we move beyond a step, set flags
		try {
			const flags = JSON.parse(localStorage.getItem(LS_FLAGS_KEY) || '{}')
			if (currentStep > 1) {
				const personalError = validatePersonalInfo()
				if (!personalError) flags.personalComplete = true
			}
			if (currentStep > 3) {
				// consider medical complete if any of the fields have been touched, or simply on passing step 3
				flags.medicalComplete = true
			}
			localStorage.setItem(LS_FLAGS_KEY, JSON.stringify(flags))
		} catch (_) {}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [currentStep])

	// ----------------- Helper functions -----------------
	const checkEmailExists = async (email) => {
		try {
			const { exists, error } = await checkUserExists(email)
			if (error) {
				console.error("checkEmailExists error", error)
				return null
			}
			return exists
		} catch (err) {
			console.error("checkEmailExists error", err)
			return null
		}
	}

	const deleteCreatedUser = async (userId, email) => {
		try {
			const { success, error } = await deleteUserById(userId)
			if (!success) {
				console.error("deleteCreatedUser error:", error)
			}
		} catch (err) {
			console.error("deleteCreatedUser error:", err)
		}
	}

	const signOutNow = async () => {
		try {
			await supabase.auth.signOut()
		} catch (err) {
			console.error("Sign out error", err)
		} finally {
			setUser(null)
			setIsAuthenticated(false)
			setCurrentStep(0)
			// keep createdInFlow as-is; if account was created elsewhere it's not safe to auto-delete here
		}
	}

	// ----------------- Auth actions -----------------
	// Sign up (email + password) then attempt immediate sign-in
	const signUpNow = async () => {
		setAuthMessage(null)

		if (!signupEmail || !signupPassword || !signupConfirmPassword) {
			setAuthMessage("Please fill the email and both password fields.")
			return
		}
		if (signupPassword !== signupConfirmPassword) {
			setAuthMessage("Passwords do not match.")
			return
		}
		if (signupPassword.length < 8) {
			setAuthMessage("Password must be at least 8 characters.")
			return
		}

		setAuthLoading(true)

		try {
			const exists = await checkEmailExists(signupEmail)
			if (exists === true) {
				setAuthMessage(
					"An account already exists for this email. Please log in."
				)
				setAuthLoading(false)
				return
			}
		} catch (err) {
			console.error("email exists check failed", err)
		}

		try {
			// create account
			const { data, error } = await supabase.auth.signUp({
				email: signupEmail,
				password: signupPassword,
				options: {
					data: {
						full_name: `${formData.firstName} ${formData.lastName}`.trim(),
					},
				},
			})

			if (error) {
				const msg = error.message || "Could not create account."
				console.error("signUp error:", error)
				if (
					/already registered|already exists|User already registered/i.test(msg)
				) {
					setAuthMessage(
						"An account already exists for this email. Please log in."
					)
				} else {
					setAuthMessage(msg)
				}
				setAuthLoading(false)
				return
			}

			// mark created in-flow
			const uid = data?.user?.id ?? null
			setCreatedInFlow(true)
			setCreatedUserId(uid)
			setFormData((p) => ({ ...p, email: signupEmail }))

			// attempt immediate sign-in using provided password (so new browsers also get a live session)
			try {
				const { data: signInData, error: signInError } =
					await supabase.auth.signInWithPassword({
						email: signupEmail,
						password: signupPassword,
					})

				if (signInError) {
					// Not fatal — user can log in manually; but we must not allow advancing until signed in.
					console.warn(
						"Immediate sign-in failed (you may need to log in):",
						signInError
					)
					setAuthMessage(
						"Account created. Please log in to continue (we attempted to sign you in automatically)."
					)
					// keep createdInFlow true for possible cleanup if they abandon, but cannot proceed until they sign in.
					setIsAuthenticated(false)
					setUser(null)
					setCurrentStep(0)
				} else {
					// sign-in success
					setAuthMessage("Account created and signed in. Proceed to booking.")
					setIsAuthenticated(Boolean(signInData?.user))
					setUser(signInData?.user ?? null)
					setCurrentStep(1)
				}
			} catch (err) {
				console.error("Immediate sign-in unexpected error:", err)
				setAuthMessage("Account created. Please log in to continue.")
				setIsAuthenticated(false)
				setUser(null)
				setCurrentStep(0)
			}
		} catch (err) {
			console.error("Unexpected signUp error:", err)
			setAuthMessage("Unexpected error while creating account.")
		} finally {
			setAuthLoading(false)
		}
	}

	// Login (email + password)
	const loginNow = async () => {
		setAuthMessage(null)
		if (!loginEmail || !loginPassword) {
			setAuthMessage("Please fill both email and password.")
			return
		}

		setAuthLoading(true)
		try {
			const { data, error } = await supabase.auth.signInWithPassword({
				email: loginEmail,
				password: loginPassword,
			})
			if (error) {
				console.error("login error", error)
				setAuthMessage(error.message || "Login failed. Check credentials.")
				setAuthLoading(false)
				return
			}
			setUser(data.user ?? null)
			setIsAuthenticated(true)
			setCurrentStep(1)
			setAuthMessage("Logged in. Proceed to booking.")
		} catch (err) {
			console.error("unexpected login error", err)
			setAuthMessage("Unexpected error while logging in.")
		} finally {
			setAuthLoading(false)
		}
	}

	// ----------------- Payment & Appointment -----------------
	const openRazorpay = async () => {
		// HARD guard: don't allow payment flow unless user is allowed to proceed
		if (!canProceed) {
			setError("Please sign in before making a payment.")
			setCurrentStep(0)
			return
		}

		setIsSubmitting(true)
		setError(null)

		const personalError = validatePersonalInfo()
		const appointmentError = validateAppointmentDetails()

		if (personalError || appointmentError) {
			setError(personalError || appointmentError)
			setIsSubmitting(false)
			return
		}

		// Calculate payment amount based on selected service
		let paymentAmount = 50000 // Default 500 INR in paise
		let currentService = selectedService
		
		// If no selectedService but appointmentType is selected, get service by type
		if (!currentService && formData.appointmentType) {
			currentService = getServiceByAppointmentType(formData.appointmentType)
		}
		
		if (currentService && currentService.price) {
			// Handle both old format (price object) and new format (single number)
			if (typeof currentService.price === 'number') {
				paymentAmount = currentService.price * 100 // Convert to paise
			} else {
				const price = currentService.price.inr || currentService.price
				paymentAmount = price.min * 100 // Convert to paise
			}
		}

		const options = {
			key: "rzp_live_RL4t8lq29IQAcb",
			amount: paymentAmount,
			currency: "INR",
			name: "Dr. Fatima Kasamnath Clinic",
			description: `Appointment Payment - ${
				selectedService?.title || formData.appointmentType
			}`,
			prefill: {
				name: `${formData.firstName} ${formData.lastName}`,
				email: formData.email,
				contact: formData.phone,
			},
			handler: async function (response) {
				console.log("✅ Payment success:", response)
				let appointmentRow = null

				try {
					// Book the slot first to prevent double booking
					await bookSlot(
						formData.preferredDate,
						formData.preferredTime,
						formData.consultationMethod,
						formData.medicalCenter
					)

					const appointmentData = {
						firstName: formData.firstName,
						lastName: formData.lastName,
						email: formData.email,
						phone: formData.phone,
						dateOfBirth: formData.dateOfBirth,
						gender: formData.gender,
						appointmentType: formData.appointmentType,
						consultationMethod: formData.consultationMethod,
						medicalCenter: formData.medicalCenter,
						preferredDate: formData.preferredDate,
						preferredTime: formData.preferredTime,
						reason: formData.reason,
						symptoms: formData.symptoms,
						isNewPatient: formData.isNewPatient,
						currentMedications: formData.currentMedications,
						allergies: formData.allergies,
						medicalHistory: formData.medicalHistory,
						paymentId: response.razorpay_payment_id,
					}

					const { data, error: insertError } = await supabase
						.from("Appointment")
						.insert([appointmentData])
						.select()
						.single()

					if (insertError) {
						console.error("❌ Supabase insert error:", insertError)
						throw new Error(`Database error: ${insertError.message}`)
					}

					appointmentRow = data
					console.log("✅ Appointment saved successfully:", appointmentRow)
				} catch (err) {
					console.error("❌ Appointment save error:", err)
					setError(`Failed to save appointment: ${err.message}`)

					if (createdInFlow) {
						await deleteCreatedUser(
							createdUserId,
							signupEmail || formData.email
						)
						setCreatedInFlow(false)
						setCreatedUserId(null)
					}
					setIsSubmitting(false)
					return
				}

				setConfirmationData({ appointment: appointmentRow })

				try {
					if (user?.id) {
						await supabase
							.from("Appointment")
							.update({ user_id: user.id })
							.eq("id", appointmentRow.id)
					}
				} catch (err) {
					console.error("Failed to attach user_id:", err)
				}

				setIsSubmitted(true)
				setIsSubmitting(false)
			},
			theme: { color: "#3399cc" },
		}

		try {
			const rzp = new window.Razorpay(options)
			rzp.on("payment.failed", async (err) => {
				console.error("❌ Payment failed:", err.error)
				setError(
					`Payment failed: ${err.error.description || "Please try again"}`
				)

				if (createdInFlow) {
					await deleteCreatedUser(createdUserId, signupEmail || formData.email)
					setCreatedInFlow(false)
					setCreatedUserId(null)
				}
				setIsSubmitting(false)
			})

			rzp.on("payment.cancel", () => {
				console.log("Payment cancelled by user")
				setError("Payment was cancelled. You can try again.")
				setIsSubmitting(false)
			})

			rzp.open()
		} catch (err) {
			console.error("❌ Razorpay initialization error:", err)
			setError("Payment system error. Please try again later.")
			setIsSubmitting(false)
		}
	}

	// ----------------- UI Renderers -----------------
	const LoadingSpinner = () => (
		<div className="flex items-center justify-center">
			<div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
			<span className="ml-2 text-sm text-gray-600">Loading...</span>
		</div>
	)

    const appointmentTypes = getAllServices().map(service => ({
		value: service.appointmentType,
		label: service.title
	}))

	// Function to get service details by appointment type
    const getServiceByAppointmentType = (appointmentType) => getServiceByType(appointmentType)

	// Removed static timeSlots - now using dynamic availableSlots based on appointment type and medical center

	const renderStepIndicator = () => (
		<div className="flex items-center justify-center mb-8">
			{[0, 1, 2, 3, 4].map((step) => (
				<div key={step} className="flex items-center">
					<div
						className={`w-10 h-10 rounded-full flex items-center justify-center ${
							step <= viewStep
								? "bg-primary-600 text-white"
								: "bg-gray-200 text-gray-600"
						}` }>
						{step === 0 ? (
							"🔒"
						) : step < viewStep ? (
							<CheckCircle className="w-5 h-5" />
						) : (
							step
						)}
					</div>
					{step < 4 && (
						<div
							className={`w-16 h-1 mx-2 ${
								step < viewStep ? "bg-primary-600" : "bg-gray-200"
							}`}
						/>
					)}
				</div>
			))}
		</div>
	)

	const renderAuthStep = () => {
		return (
			<motion.div
				initial={{ opacity: 0, x: 20 }}
				animate={{ opacity: 1, x: 0 }}
				transition={{ duration: 0.4 }}
				className="space-y-6">
				<h3 className="text-2xl font-semibold text-gray-900 mb-2">
					Create an account or log in
				</h3>
				<p className="text-sm text-gray-600">
					You must sign up or log in before booking. If you sign up here and the
					booking fails we will delete the created account.
				</p>

				{/* If user is already signed in, show a compact panel with ability to use that account or switch */}
				{isAuthenticated && user ? (
					<div className="bg-white rounded-lg shadow p-6">
						<h4 className="font-semibold mb-3">You are signed in</h4>
						<p className="text-sm text-gray-700 mb-3">
							Signed in as <strong>{user.email}</strong>
						</p>

						<div className="flex gap-3">
							<button
								type="button"
								onClick={() => {
									// continue as this user
									setAuthMessage(null)
									setCurrentStep(1)
								}}
								className="px-4 py-2 bg-indigo-600 text-white rounded-lg">
								Continue as {user.email}
							</button>

							<button
								type="button"
								onClick={() => {
									// sign out to allow booking from another account
									signOutNow()
									setAuthMode("login")
									setAuthMessage(null)
								}}
								className="px-4 py-2 bg-white border rounded-lg">
								Book with another account
							</button>
						</div>

						<p className="text-xs text-gray-500 mt-3">
							If you want to book using a different account, choose "Book with
							another account".
						</p>
					</div>
				) : (
					<>
						<div className="mt-4 flex items-center gap-4">
							<button
								type="button"
								onClick={() => {
									setAuthMode("signup")
									setAuthMessage(null)
									setAuthLoading(false)
									setLoginEmail("")
									setLoginPassword("")
								}}
								className={`px-4 py-2 rounded-lg ${
									authMode === "signup"
										? "bg-indigo-600 text-white"
										: "bg-white border"
								}`}>
								Sign up
							</button>
							<button
								type="button"
								onClick={() => {
									setAuthMode("login")
									setAuthMessage(null)
									setAuthLoading(false)
									setSignupEmail("")
									setSignupPassword("")
									setSignupConfirmPassword("")
								}}
								className={`px-4 py-2 rounded-lg ${
									authMode === "login"
										? "bg-indigo-600 text-white"
										: "bg-white border"
								}`}>
								Log in
							</button>
						</div>

						{authMode === "signup" && (
							<div className="bg-white rounded-lg shadow p-6">
								<h4 className="font-semibold mb-3">New? Create an account</h4>

								<label className="block text-sm text-gray-700">Email</label>
								<input
									type="email"
									value={signupEmail}
									onChange={(e) => setSignupEmail(e.target.value)}
									className="mt-1 block w-full rounded-lg border border-gray-300 shadow-sm p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
									required
								/>

								<label className="block text-sm text-gray-700 mt-3">
									Password
								</label>
								<input
									type="password"
									value={signupPassword}
									onChange={(e) => setSignupPassword(e.target.value)}
									className="mt-1 block w-full rounded-lg border border-gray-300 shadow-sm p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
									required
								/>

								<label className="block text-sm text-gray-700 mt-3">
									Confirm Password
								</label>
								<input
									type="password"
									value={signupConfirmPassword}
									onChange={(e) => setSignupConfirmPassword(e.target.value)}
									className="mt-1 block w-full rounded-lg border border-gray-300 shadow-sm p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
									required
								/>

								<button
									onClick={signUpNow}
									disabled={authLoading}
									className="mt-4 w-full py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200">
									{authLoading ? "Creating account..." : "Create account"}
								</button>

								<p className="text-xs text-gray-500 mt-2">
									If that email already exists, you will be prompted to log in
									instead.
								</p>
							</div>
						)}

						{authMode === "login" && (
							<div className="bg-white rounded-lg shadow p-6">
								<h4 className="font-semibold mb-3">Already have an account?</h4>

								<label className="block text-sm text-gray-700">Email</label>
								<input
									type="email"
									value={loginEmail}
									onChange={(e) => setLoginEmail(e.target.value)}
									className="mt-1 block w-full rounded-lg border border-gray-300 shadow-sm p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
									required
								/>

								<label className="block text-sm text-gray-700 mt-3">
									Password
								</label>
								<input
									type="password"
									value={loginPassword}
									onChange={(e) => setLoginPassword(e.target.value)}
									className="mt-1 block w-full rounded-lg border border-gray-300 shadow-sm p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
									required
								/>

								<button
									onClick={loginNow}
									disabled={authLoading}
									className="mt-4 w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200">
									{authLoading ? "Signing in..." : "Log in"}
								</button>
							</div>
						)}
					</>
				)}

				{authMessage && (
					<div
						className={`mt-3 p-3 rounded-lg text-sm ${
							authMessage.toLowerCase().includes("error") ||
							authMessage.toLowerCase().includes("failed") ||
							authMessage.toLowerCase().includes("invalid")
								? "bg-red-50 text-red-700 border border-red-200"
								: "bg-green-50 text-green-700 border border-green-200"
						}`}>
						{authMessage}
					</div>
				)}
			</motion.div>
		)
	}

	const renderPersonalInfo = () => (
		<motion.div
			initial={{ opacity: 0, x: 20 }}
			animate={{ opacity: 1, x: 0 }}
			transition={{ duration: 0.5 }}
			className="space-y-6">
			<h3 className="text-2xl font-semibold text-gray-900 mb-6">
				Personal Information
			</h3>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				<div>
					<label className="block text-gray-700">First Name</label>
					<input
						type="text"
						name="firstName"
						value={formData.firstName}
						onChange={handleChange}
						className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
						required
					/>
				</div>

				<div>
					<label className="block text-gray-700">Last Name</label>
					<input
						type="text"
						name="lastName"
						value={formData.lastName}
						onChange={handleChange}
						className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
						required
					/>
				</div>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				<div>
					<label className="block text-gray-700">Email</label>
					<input
						type="email"
						name="email"
						value={formData.email}
						onChange={handleChange}
						className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
						required
					/>
				</div>

				<div>
					<label className="block text-gray-700">Phone</label>
					<input
						type="tel"
						name="phone"
						value={formData.phone}
						onChange={handleChange}
						className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
						required
					/>
				</div>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				<div>
					<label className="block text-gray-700 mb-2 font-medium">Date of Birth</label>
					<div className="relative">
						<input
							type="date"
							name="dateOfBirth"
							value={formData.dateOfBirth}
							onChange={handleChange}
							className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white shadow-sm hover:border-gray-300"
							style={{
								appearance: 'none',
								WebkitAppearance: 'none',
								MozAppearance: 'none'
							}}
						/>
					</div>
					<p className="text-xs text-gray-500 mt-1">Select your date of birth</p>
				</div>

				<div>
					<label className="block text-gray-700 mb-2 font-medium">Gender</label>
					<div className="relative">
						<select
							name="gender"
							value={formData.gender}
							onChange={handleChange}
							className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white shadow-sm hover:border-gray-300 appearance-none cursor-pointer">
							<option value="">Select Gender</option>
							<option value="male">Male</option>
							<option value="female">Female</option>
							<option value="other">Other</option>
						</select>
						<div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
							<svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
							</svg>
						</div>
					</div>
					<p className="text-xs text-gray-500 mt-1">Select your gender</p>
				</div>
			</div>
		</motion.div>
	)

	const renderAppointmentDetails = () => (
		<motion.div
			initial={{ opacity: 0, x: 20 }}
			animate={{ opacity: 1, x: 0 }}
			transition={{ duration: 0.5 }}
			className="space-y-6">
			<h3 className="text-2xl font-semibold text-gray-900 mb-6">
				Appointment Details
			</h3>

			{/* Service Selection */}
			<div>
				<label className="block text-gray-700">Type of Appointment</label>
				<select
					name="appointmentType"
					value={formData.appointmentType}
					onChange={handleChange}
					className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
					required>
					<option value="">Select Appointment Type</option>
					{appointmentTypes.map((type) => (
						<option key={type.value} value={type.value}>
							{type.label}
						</option>
					))}
				</select>
				
				{/* Show selected service details */}
				{selectedService && (
					<div className="mt-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
						<div className="flex justify-between items-center">
							<div>
								<h4 className="font-semibold text-blue-900">{selectedService.title}</h4>
								<p className="text-sm text-blue-700">{selectedService.description}</p>
								<p className="text-sm text-blue-600">Duration: {selectedService.duration}</p>
							</div>
							<div className="text-right">
								<p className="text-2xl font-bold text-blue-900">
									₹{selectedService.price?.inr?.min || selectedService.price?.min || 500}
								</p>
								<p className="text-sm text-blue-600">per session</p>
							</div>
						</div>
					</div>
				)}
			</div>

			{/* Consultation Method Selection */}
				<div>
				<label className="block text-gray-700 mb-3">Consultation Method</label>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<label className={`cursor-pointer p-4 border-2 rounded-lg transition-all ${
						formData.consultationMethod === 'online' 
							? 'border-primary-500 bg-primary-50' 
							: 'border-gray-300 hover:border-gray-400'
					}`}>
					<input
							type="radio"
							name="consultationMethod"
							value="online"
							checked={formData.consultationMethod === 'online'}
							onChange={handleChange}
							className="sr-only"
						/>
						<div className="text-center">
							<div className="text-2xl mb-2">💻</div>
							<div className="font-semibold text-gray-900">Online Consultation</div>
							<div className="text-sm text-gray-600">Video call via Zoom</div>
						</div>
					</label>
					
					<label className={`cursor-pointer p-4 border-2 rounded-lg transition-all ${
						formData.consultationMethod === 'offline' 
							? 'border-primary-500 bg-primary-50' 
							: 'border-gray-300 hover:border-gray-400'
					}`}>
						<input
							type="radio"
							name="consultationMethod"
							value="offline"
							checked={formData.consultationMethod === 'offline'}
							onChange={handleChange}
							className="sr-only"
						/>
						<div className="text-center">
							<div className="text-2xl mb-2">🏥</div>
							<div className="font-semibold text-gray-900">In-Person Visit</div>
							<div className="text-sm text-gray-600">Visit at medical center</div>
						</div>
					</label>
				</div>
			</div>

			{/* Medical Center Selection (only for offline appointments) */}
			{formData.consultationMethod === 'offline' && (
				<div className="mt-6">
					<label className="block text-gray-700 mb-4 font-medium text-lg">🏥 Select Medical Center</label>
					<div className="grid grid-cols-1 md:grid-cols-1 gap-4">
						{Object.values(MEDICAL_CENTERS).map((center) => (
							<label key={center.id} className={`cursor-pointer group relative overflow-hidden rounded-2xl border-2 transition-all duration-300 hover:shadow-lg ${
								formData.medicalCenter === center.id 
									? 'border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-lg ring-2 ring-blue-200' 
									: 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50'
							}`}>
								<input
									type="radio"
									name="medicalCenter"
									value={center.id}
									checked={formData.medicalCenter === center.id}
									onChange={handleChange}
									className="sr-only"
								/>
								<div className="p-6">
									<div className="flex items-start justify-between">
										<div className="flex-1">
											<div className="flex items-center mb-2">
												<div className="w-3 h-3 rounded-full border-2 mr-3 flex-shrink-0 ${
													formData.medicalCenter === center.id 
														? 'border-blue-500 bg-blue-500' 
														: 'border-gray-300 group-hover:border-blue-400'
												}"></div>
												<h3 className="font-bold text-gray-900 text-lg">{center.name}</h3>
											</div>
											<div className="ml-6 space-y-2">
												<div className="flex items-start text-sm text-gray-600">
													<svg className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
														<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
														<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
													</svg>
													<span className="leading-relaxed">{center.address}</span>
												</div>
												<div className="flex items-center text-sm text-gray-500">
													<svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
														<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
													</svg>
													<span>{center.phone}</span>
												</div>
											</div>
										</div>
										{formData.medicalCenter === center.id && (
											<div className="ml-4 flex-shrink-0">
												<div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
													<svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
														<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
													</svg>
												</div>
											</div>
										)}
									</div>
								</div>
							</label>
						))}
					</div>
					<p className="text-xs text-gray-500 mt-3 flex items-center">
						<span className="mr-1">🏥</span>
						Choose the medical center where you'd like to have your in-person appointment
					</p>
				</div>
			)}

			{/* Date Selection */}
			<div>
				<label className="block text-gray-700 mb-2 font-medium">Preferred Date</label>
				<div className="relative">
					<select
						name="preferredDate"
						value={formData.preferredDate}
						onChange={handleChange}
						className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white shadow-sm hover:border-gray-300 appearance-none cursor-pointer"
						required>
						<option value="">📅 Select your preferred date</option>
						{availableDates.map((date) => (
							<option key={date} value={date}>
								{new Date(date).toLocaleDateString('en-US', { 
									weekday: 'long', 
									year: 'numeric', 
									month: 'long', 
									day: 'numeric' 
								})}
							</option>
						))}
					</select>
					<div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
						<svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
						</svg>
					</div>
				</div>
				<p className="text-xs text-gray-500 mt-1 flex items-center">
					<span className="mr-1">📅</span>
					Available dates for the next 30 days
				</p>
			</div>

			{/* Time Selection */}
			<div>
				<label className="block text-gray-700 mb-2 font-medium">Preferred Time</label>
				{loadingSlots ? (
					<div className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 flex items-center justify-center">
						<div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-3"></div>
						<span className="text-blue-700 font-medium">Loading available slots...</span>
					</div>
				) : availableSlots.length > 0 ? (
					<div className="relative">
						<select
							name="preferredTime"
							value={formData.preferredTime}
							onChange={handleChange}
							className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white shadow-sm hover:border-gray-300 appearance-none cursor-pointer"
							required>
							<option value="">🕐 Select your preferred time</option>
							{availableSlots.map((time) => (
								<option key={time} value={time}>
									🕐 {time}
								</option>
							))}
						</select>
						<div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
							<svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
							</svg>
						</div>
					</div>
				) : formData.consultationMethod && formData.preferredDate ? (
					<div className="w-full px-4 py-3 border-2 border-red-200 rounded-xl bg-red-50 text-red-700 flex items-center">
						<svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
						</svg>
						No available slots for this date and consultation method. Please select a different date.
					</div>
				) : (
					<div className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-50 text-gray-500 flex items-center">
						<svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
						</svg>
						Please select consultation method and date first
					</div>
				)}
				<p className="text-xs text-gray-500 mt-1 flex items-center">
					<span className="mr-1">🕐</span>
					{formData.consultationMethod === 'online' 
						? 'Available time slots for online consultation'
						: formData.medicalCenter 
							? `Available time slots at ${MEDICAL_CENTERS[formData.medicalCenter]?.name}`
							: 'Select a medical center to see available slots'
					}
				</p>
			</div>

			<div>
				<label className="block text-gray-700">Reason for Visit</label>
				<textarea
					name="reason"
					value={formData.reason}
					onChange={handleChange}
					rows="3"
					className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
				/>
			</div>

			<div>
				<label className="block text-gray-700">Symptoms</label>
				<textarea
					name="symptoms"
					value={formData.symptoms}
					onChange={handleChange}
					rows="3"
					className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
				/>
			</div>
		</motion.div>
	)

	const renderMedicalInfo = () => (
		<motion.div
			initial={{ opacity: 0, x: 20 }}
			animate={{ opacity: 1, x: 0 }}
			transition={{ duration: 0.5 }}
			className="space-y-6">
			<h3 className="text-2xl font-semibold text-gray-900 mb-6">
				Medical History
			</h3>

			<div>
				<label className="block text-gray-700">Are you a new patient?</label>
				<select
					name="isNewPatient"
					value={formData.isNewPatient}
					onChange={handleChange}
					className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500">
					<option value="">Select</option>
					<option value="yes">Yes</option>
					<option value="no">No</option>
				</select>
			</div>

			<div>
				<label className="block text-gray-700">Current Medications</label>
				<textarea
					name="currentMedications"
					value={formData.currentMedications}
					onChange={handleChange}
					rows="3"
					className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
				/>
			</div>

			<div>
				<label className="block text-gray-700">Allergies</label>
				<textarea
					name="allergies"
					value={formData.allergies}
					onChange={handleChange}
					rows="3"
					className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
				/>
			</div>

			<div>
				<label className="block text-gray-700">Past Medical History</label>
				<textarea
					name="medicalHistory"
					value={formData.medicalHistory}
					onChange={handleChange}
					rows="3"
					className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
				/>
			</div>
		</motion.div>
	)

	const renderConfirmation = () => (
		<motion.div
			initial={{ opacity: 0, x: 20 }}
			animate={{ opacity: 1, x: 0 }}
			transition={{ duration: 0.5 }}
			className="space-y-6">
			<h3 className="text-2xl font-semibold text-gray-900 mb-6">
				Confirm Your Appointment
			</h3>
			
			{/* Selected Service Information */}
			{selectedService && (
				<div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
					<h4 className="text-lg font-semibold text-blue-900 mb-3">Selected Service</h4>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div>
							<p><strong>Service:</strong> {selectedService.title}</p>
							<p><strong>Price:</strong> ₹{selectedService.price?.inr?.min || selectedService.price?.min || 500}</p>
						</div>
						<div>
							<p><strong>Duration:</strong> {selectedService.duration || '45-60 minutes'}</p>
							<p><strong>Type:</strong> {formData.appointmentType}</p>
						</div>
					</div>
				</div>
			)}

			<div className="bg-white shadow rounded-lg p-6 space-y-4">
				<p>
					<strong>Name:</strong> {formData.firstName} {formData.lastName}
				</p>
				<p>
					<strong>Email:</strong> {formData.email}
				</p>
				<p>
					<strong>Phone:</strong> {formData.phone}
				</p>
				<p>
					<strong>Date of Birth:</strong> {formData.dateOfBirth}
				</p>
				<p>
					<strong>Gender:</strong> {formData.gender}
				</p>
				<p>
					<strong>Service:</strong> {selectedService?.title || formData.appointmentType}
				</p>
				{selectedService && (
					<p>
						<strong>Price:</strong> ₹{selectedService.price?.inr?.min || selectedService.price?.min || 500}
					</p>
				)}
				<p>
					<strong>Consultation Method:</strong> {formData.consultationMethod === 'online' ? '💻 Online Consultation' : '🏥 In-Person Visit'}
				</p>
				{formData.consultationMethod === 'offline' && formData.medicalCenter && (
					<p>
						<strong>Medical Center:</strong> {MEDICAL_CENTERS[formData.medicalCenter]?.name}
					</p>
				)}
				<p>
					<strong>Date:</strong> {new Date(formData.preferredDate).toLocaleDateString('en-US', { 
						weekday: 'long', 
						year: 'numeric', 
						month: 'long', 
						day: 'numeric' 
					})}
				</p>
				<p>
					<strong>Time:</strong> {formData.preferredTime}
				</p>
				<p>
					<strong>Reason:</strong> {formData.reason}
				</p>
				<p>
					<strong>Symptoms:</strong> {formData.symptoms}
				</p>
				<p>
					<strong>New Patient:</strong> {formData.isNewPatient}
				</p>
				<p>
					<strong>Medications:</strong> {formData.currentMedications}
				</p>
				<p>
					<strong>Allergies:</strong> {formData.allergies}
				</p>
				<p>
					<strong>Medical History:</strong> {formData.medicalHistory}
				</p>
			</div>
		</motion.div>
	)

	const renderSuccessScreen = () => {
		const appt = confirmationData?.appointment
		return (
			<motion.div
				initial={{ opacity: 0, scale: 0.98 }}
				animate={{ opacity: 1, scale: 1 }}
				className="py-12">
				<div className="text-center">
					<CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
					<h2 className="text-3xl font-bold text-gray-900 mb-4">
						Appointment Confirmed! 🎉
					</h2>
					<p className="text-xl text-gray-600 mb-6">
						Thank you, {formData.firstName}! Your appointment has been
						successfully booked.
					</p>
					<div className="bg-green-50 border border-green-200 rounded-lg p-4 max-w-md mx-auto mb-6">
						<p className="text-sm text-green-700">
							📧 A confirmation email has been sent to {formData.email}
						</p>
					</div>
				</div>

				<div className="max-w-3xl mx-auto mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
					<div className="bg-white rounded-lg shadow p-6">
						<h4 className="font-semibold mb-4">Appointment Details</h4>
						<p>
							<strong>Booking ID:</strong> {appt?.id || "—"}
						</p>
						<p>
							<strong>Name:</strong> {appt?.firstName} {appt?.lastName}
						</p>
						<p>
							<strong>Email:</strong> {appt?.email}
						</p>
						<p>
							<strong>Phone:</strong> {appt?.phone}
						</p>
						<p>
							<strong>Type:</strong> {appt?.appointmentType}
						</p>
						<p>
							<strong>Date:</strong> {appt?.preferredDate}
						</p>
						<p>
							<strong>Time:</strong> {appt?.preferredTime}
						</p>
						<p>
							<strong>Payment ID:</strong> {appt?.paymentId}
						</p>
					</div>

					<div className="bg-white rounded-lg shadow p-6">
						<h4 className="font-semibold mb-4">Account</h4>
						<p>
							<strong>Email:</strong>{" "}
							{signupEmail || loginEmail || formData.email}
						</p>
						<p className="text-sm text-gray-600">
							You can log in to view your appointments (if not already signed
							in).
						</p>
					</div>
				</div>
			</motion.div>
		)
	}

	// ----------------- Main render -----------------
	return (
		<div className="min-h-screen bg-gray-50">
			<section className="bg-gradient-to-br from-primary-50 to-blue-50 section-padding">
				<div className="max-w-7xl mx-auto text-center">
					<motion.div
						initial={{ opacity: 0, y: 30 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.8 }}>
						<h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
							Book Your Appointment
						</h1>
						<p className="text-xl text-gray-600 max-w-3xl mx-auto">
							Schedule your visit with Dr. Fatima Kasamnath. Our online booking
							system makes it easy to find a time that works for you.
						</p>
					</motion.div>
				</div>
			</section>

			<section className="section-padding">
				<div className="max-w-4xl mx-auto">
					<div className="card">
						{renderStepIndicator()}

						{isSubmitted ? (
							renderSuccessScreen()
						) : (
							<>
								{viewStep === 0 && renderAuthStep()}
								{viewStep === 1 && renderPersonalInfo()}
								{viewStep === 2 && renderAppointmentDetails()}
								{viewStep === 3 && renderMedicalInfo()}
								{viewStep === 4 && renderConfirmation()}

								<div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
									{viewStep > 0 && (
										<button
											type="button"
											onClick={() => {
												if (viewStep === 1 && !canProceed) return
												prevStep()
											}}
											className="btn-secondary flex items-center">
											<ChevronLeft className="w-5 h-5 mr-2" /> Previous
										</button>
									)}

									{viewStep < 4 ? (
										<button
											type="button"
											disabled={!canProceed}
											onClick={() => {
												let validationError = null
												if (viewStep === 1)
													validationError = validatePersonalInfo()
												else if (viewStep === 2)
													validationError = validateAppointmentDetails()

												if (validationError) {
													setError(validationError)
													return
												}

												setError(null)
												nextStep()
											}}
											className={`btn-primary flex items-center ml-auto ${
												!canProceed ? "opacity-50 cursor-not-allowed" : ""
											}`}>
											Next <ChevronRight className="w-5 h-5 ml-2" />
										</button>
									) : (
										<div className="flex flex-col items-end space-y-3">
											<button
												type="button"
												disabled={isSubmitting || !canProceed}
												onClick={openRazorpay}
												className="btn-primary flex items-center disabled:opacity-50 disabled:cursor-not-allowed">
												{isSubmitting ? (
													<>
														<LoadingSpinner />
														<span className="ml-2">Processing Payment...</span>
													</>
												) : (
													<>
														<Calendar className="w-5 h-5 mr-2" /> 
														Pay ₹{(() => {
															const currentService = selectedService || getServiceByAppointmentType(formData.appointmentType)
															// Handle both old format (price object) and new format (single number)
															if (typeof currentService?.price === 'number') {
																return currentService.price
															}
															return currentService?.price?.inr?.min || currentService?.price?.min || 500
														})()} & Confirm
													</>
												)}
											</button>
											<p className="text-xs text-gray-500 text-right">
												Secure payment powered by Razorpay
											</p>
										</div>
									)}
								</div>
							</>
						)}

						{error && (
							<div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
								<div className="flex items-start">
									<div className="flex-shrink-0">
										<svg
											className="h-5 w-5 text-red-400"
											viewBox="0 0 20 20"
											fill="currentColor">
											<path
												fillRule="evenodd"
												d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
												clipRule="evenodd"
											/>
										</svg>
									</div>
									<div className="ml-3 flex-1">
										<p className="text-sm text-red-700">{error}</p>
										{error.includes("Payment") && viewStep === 4 && (
											<button
												onClick={() => {
													setError(null)
													openRazorpay()
												}}
												className="mt-2 text-sm bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition-colors">
												Try Again
											</button>
										)}
									</div>
								</div>
							</div>
						)}
					</div>
				</div>
			</section>
		</div>
	)
}

export default Appointment
