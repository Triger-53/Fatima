// src/pages/Appointment.jsx
import React, { useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"
import { Calendar, CheckCircle, ChevronRight, ChevronLeft } from "lucide-react"
import { supabase } from "../supabase"
// Import the async fetcher and remove sync dependencies
import { getAllServicesAsync, getServicePrice } from "../data/services"
import { MEDICAL_CENTERS, ONLINE_SLOTS } from '../data/appointmentData';
import { slotManager } from '../utils/slotManager';

import AuthStep from '../components/appointment/AuthStep';
import PersonalInfoStep from '../components/appointment/PersonalInfoStep';
import AppointmentDetailsStep from '../components/appointment/AppointmentDetailsStep';
import MedicalInfoStep from '../components/appointment/MedicalInfoStep';
import ConfirmationStep from '../components/appointment/ConfirmationStep';
import SuccessScreen from '../components/appointment/SuccessScreen';

const DELETE_GRACE_PERIOD_MS = 15 * 60 * 1000 // 15 minutes grace period (client-side)


const Appointment = () => {
	// Steps: 0 = Auth required, 1..4 = appointment steps
	const [currentStep, setCurrentStep] = useState(0)

	// Selected service from URL parameters
	const [selectedService, setSelectedService] = useState(null)

	// State for services list, loading, and error handling
	const [services, setServices] = useState([])
	const [loadingServices, setLoadingServices] = useState(true)
	const [servicesError, setServicesError] = useState(null)

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

	// New state for enhanced appointment system
	const [availableSlots, setAvailableSlots] = useState([])
	const [availableDates, setAvailableDates] = useState([])
	const [medicalCenters, setMedicalCenters] = useState([])
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
	const viewStep = canProceed ? currentStep : 0

	// grace timer ref so we can clear it if appointment confirmed
	const graceTimerRef = useRef(null)

	// ------------------- Fetch services on component mount -------------------
	useEffect(() => {
		const fetchServices = async () => {
			try {
				setLoadingServices(true)
				const data = await getAllServicesAsync()
				setServices(data || [])
				setServicesError(null)
			} catch (err) {
				console.error("Failed to fetch services:", err)
				setServicesError("Could not load services. Please try again later.")
				setServices([]) // Set to empty array on error
			} finally {
				setLoadingServices(false)
			}
		}
		fetchServices()
	}, [])

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

				// If authenticated, maybe we can skip Step 0? 
				// The existing useEffect for authentication handles setting currentStep.
			} catch (error) {
				console.error('Error parsing service parameter:', error)
			}
		}
	}, [services]) // Add services as dependency to re-sync if needed

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

	// ------------------- Load available dates and medical centers on component mount -------------------
	useEffect(() => {
		const loadInitialData = async () => {
			await slotManager.initialized;
			setMedicalCenters(slotManager.medicalCenters || []);
			// Initially load dates with no filters if no method selected, 
			// otherwise use current selection.
			const dates = await slotManager.getAvailableDates(
				formData.consultationMethod,
				formData.medicalCenter
			);
			setAvailableDates(dates);
		};
		loadInitialData();
	}, []);

	// ------------------- Refresh available dates when method or center changes -------------------
	useEffect(() => {
		const refreshDates = async () => {
			if (slotManager.initialized) {
				const dates = await slotManager.getAvailableDates(
					formData.consultationMethod,
					formData.medicalCenter
				);
				setAvailableDates(dates);

				// If the currently selected date is no longer in the available dates, clear it
				if (formData.preferredDate && !dates.includes(formData.preferredDate)) {
					setFormData(prev => ({
						...prev,
						preferredDate: '',
						preferredTime: ''
					}));
				}
			}
		};
		refreshDates();
	}, [formData.consultationMethod, formData.medicalCenter]);

	// ------------------- Keep selected service synced with appointment type -------------------
	// This now depends on the `services` state as well.
	useEffect(() => {
		if (formData.appointmentType && services.length > 0) {
			const service = services.find(s => s.appointmentType === formData.appointmentType)
			if (service) setSelectedService(service)
			else setSelectedService(null)
		} else {
			setSelectedService(null)
		}
	}, [formData.appointmentType, services])

	// ------------------- Load available slots when consultation method, date, or medical center changes -------------------
	useEffect(() => {
		const loadAvailableSlots = async () => {
			const { consultationMethod, preferredDate, medicalCenter } = formData;

			if (!consultationMethod || !preferredDate) {
				setAvailableSlots([]);
				return;
			}

			setLoadingSlots(true);

			try {
				const availableSlotsList = await slotManager.getAvailableSlotsForDate(
					preferredDate,
					consultationMethod,
					medicalCenter
				);
				setAvailableSlots(availableSlotsList);
			} catch (error) {
				console.error('Error loading available slots:', error);
				setAvailableSlots([]);
			} finally {
				setLoadingSlots(false);
			}
		};

		loadAvailableSlots();
	}, [formData.consultationMethod, formData.preferredDate, formData.medicalCenter]);

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
							// Default to 0 to ensure AuthStep is seen
							setCurrentStep(0)
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
					// Removed auto-jump to step 1 to respect user choice on AuthStep
				} else {
					setUser(null)
					setIsAuthenticated(false)
					setCurrentStep(0)

					// Clear local storage on sign out from anywhere
					localStorage.removeItem(LS_FORM_KEY)
					localStorage.removeItem(LS_STEP_KEY)
					localStorage.removeItem(LS_FLAGS_KEY)
				}
			}
		)

		return () => {
			try {
				authListener?.subscription?.unsubscribe?.()
			} catch (e) { }
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
				try { localStorage.setItem(LS_FLAGS_KEY, JSON.stringify(flags)) } catch (_) { }

				// Prefill UI with latest values if those fields are currently empty
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

					setFormData(prev => ({
						...prev,
						firstName: latest.firstName || prev.firstName || '',
						lastName: latest.lastName || prev.lastName || '',
						email: latest.email || prev.email || '',
						phone: latest.phone || prev.phone || '',
						dateOfBirth: latest.dateOfBirth || prev.dateOfBirth || '',
						gender: latest.gender || prev.gender || '',
						isNewPatient: latest.isNewPatient || prev.isNewPatient || '',
						currentMedications: latest.currentMedications || prev.currentMedications || '',
						allergies: latest.allergies || prev.allergies || '',
						medicalHistory: latest.medicalHistory || prev.medicalHistory || ''
					}))
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
					// The automatic deletion logic has been removed due to security concerns.
					// A server-side cron job would be a more appropriate solution.
					console.warn("User account cleanup for abandoned booking is disabled.");
					setAuthMessage(
						"Your session has expired. Please log in again to complete your booking."
					);
				}
			}, DELETE_GRACE_PERIOD_MS);
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
				// The automatic deletion logic has been removed due to security concerns.
				console.warn("User account cleanup for abandoned booking is disabled.");
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
		} catch (_) { }
	}, [formData])

	useEffect(() => {
		try {
			localStorage.setItem(LS_STEP_KEY, String(currentStep))
		} catch (_) { }
	}, [currentStep])

	// ---------------- Step navigation ----------------
	const nextStep = () => {
		if (!canProceed) {
			setAuthMessage("Please sign in before proceeding.")
			setCurrentStep(0)
			return
		}
		setCurrentStep((prev) => Math.min(4, prev + 1))
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

		const [year, month, day] = preferredDate.split('-').map(Number);
		const selectedDate = new Date(year, month - 1, day);

		const today = new Date();
		const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());

		if (selectedDate < todayOnly) return "Please select a future date"

		// Parse time and check if it's in the past if the date is today
		const timeMatch = preferredTime.match(/(\d+):(\d+)\s*(AM|PM)/i);
		if (timeMatch) {
			let hours = parseInt(timeMatch[1]);
			const minutes = parseInt(timeMatch[2]);
			const modifier = timeMatch[3].toUpperCase();
			if (modifier === 'PM' && hours < 12) hours += 12;
			if (modifier === 'AM' && hours === 12) hours = 0;
			selectedDate.setHours(hours, minutes, 0, 0);
		}

		if (selectedDate < today) return "Please select a future time"

		// Check if date is not too far in future (dynamic range)
		const maxDate = new Date(todayOnly);
		maxDate.setDate(todayOnly.getDate() + (slotManager.bookingRange || 30));
		// Reset selectedDate hours for the range check or compare with maxDate
		const selectedDateOnly = new Date(year, month - 1, day);
		if (selectedDateOnly > maxDate) return `Please select a date within the next ${slotManager.bookingRange || 30} days`

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
		} catch (_) { }
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [currentStep])

	// ----------------- Helper functions -----------------
	const deleteCreatedUser = async (userId, email) => {
		// This function is being deprecated as it relies on an insecure admin client.
		// The logic will be removed in subsequent steps.
		console.warn("deleteCreatedUser is deprecated and should not be used.");
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
			// Clear local storage on sign out
			localStorage.removeItem(LS_FORM_KEY)
			localStorage.removeItem(LS_STEP_KEY)
			localStorage.removeItem(LS_FLAGS_KEY)
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
		let currentService = selectedService;
		if (!currentService && formData.appointmentType) {
			currentService = getServiceByAppointmentType(formData.appointmentType);
		}
		const paymentAmount = getServicePrice(currentService) * 100; // Price in paise

		try {
			// Final check to prevent race conditions.
			const isStillAvailable = await slotManager.isSlotAvailable(
				formData.preferredDate,
				formData.preferredTime,
				formData.consultationMethod,
				formData.medicalCenter,
				true // bypass cache
			);

			if (!isStillAvailable) {
				setError("Sorry, this slot was just booked by someone else. Please select a different slot.");
				setIsSubmitting(false);
				// also reload the slots for the user
				const updatedSlots = await slotManager.getAvailableSlotsForDate(
					formData.preferredDate,
					formData.consultationMethod,
					formData.medicalCenter
				);
				setAvailableSlots(updatedSlots);
				return;
			}

			// Step 1: Create order on backend
			const orderRes = await fetch("/api/payment/create-order", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ amount: paymentAmount }),
			});
			const orderData = await orderRes.json();

			if (!orderRes.ok) {
				throw new Error(orderData.error || "Failed to initiate payment");
			}

			const options = {
				key: "rzp_test_RuDFkTYjCnE1e4",
				amount: orderData.amount,
				currency: orderData.currency,
				name: "Dr. Fatima Kasamnath Clinic",
				description: `Appointment Payment - ${selectedService?.title || formData.appointmentType
					}`,
				order_id: orderData.id,
				prefill: {
					name: `${formData.firstName} ${formData.lastName}`,
					email: formData.email,
					contact: formData.phone,
				},
				handler: async function (response) {
					console.log("✅ Payment success, verifying signature:", response)
					setIsSubmitting(true);

					try {
						// Step 2: Verify payment on backend
						const verifyRes = await fetch("/api/payment/verify", {
							method: "POST",
							headers: { "Content-Type": "application/json" },
							body: JSON.stringify({
								razorpay_order_id: response.razorpay_order_id,
								razorpay_payment_id: response.razorpay_payment_id,
								razorpay_signature: response.razorpay_signature,
							}),
						});
						const verifyData = await verifyRes.json();

						if (!verifyRes.ok || verifyData.status !== "ok") {
							throw new Error(verifyData.error || "Payment verification failed");
						}

						// Step 3: Create calendar event & optional meet link
						try {
							const parseTime = (timeStr) => {
								const timeMatch = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
								if (!timeMatch) return "10:00:00"; // Fallback
								let hours = parseInt(timeMatch[1]);
								const minutes = timeMatch[2];
								const modifier = timeMatch[3].toUpperCase();
								if (modifier === 'PM' && hours < 12) hours += 12;
								if (modifier === 'AM' && hours === 12) hours = 0;
								return `${String(hours).padStart(2, '0')}:${minutes}:00`;
							};

							const isoStartTime = `${formData.preferredDate}T${parseTime(formData.preferredTime)}`;
							const start = new Date(isoStartTime);
							const end = new Date(start.getTime() + 30 * 60000); // Default 30 min

							const calendarRes = await fetch("/create-meeting", {
								method: "POST",
								headers: { "Content-Type": "application/json" },
								body: JSON.stringify({
									patientEmail: formData.email,
									startDateTime: start.toISOString(),
									endDateTime: end.toISOString(),
									consultationMethod: formData.consultationMethod,
									appointmentType: formData.appointmentType
								}),
							});

							if (calendarRes.ok) {
								const calendarData = await calendarRes.json();
								meetLink = calendarData.meetLink;
							}
						} catch (calendarErr) {
							console.error("Error creating calendar event:", calendarErr);
						}

						const appointmentData = {
							firstName: formData.firstName,
							lastName: formData.lastName,
							email: formData.email,
							phone: formData.phone,
							dateOfBirth: formData.dateOfBirth || null,
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
							orderId: response.razorpay_order_id,
							user_id: user.id,
							meet_link: meetLink,
						}

						const { data, error: insertError } = await supabase
							.from("Appointment")
							.insert([appointmentData])
							.select()
							.single()

						if (insertError) {
							console.error("❌ Supabase insert error:", insertError)
							throw new Error(`Payment verified but booking failed: ${insertError.message}. Please contact support with payment ID: ${response.razorpay_payment_id}`)
						}

						setConfirmationData({ appointment: data })
						setIsSubmitted(true)
						// Clear local storage on successful booking
						localStorage.removeItem(LS_FORM_KEY)
						localStorage.removeItem(LS_STEP_KEY)
						localStorage.removeItem(LS_FLAGS_KEY)
					} catch (err) {
						console.error("❌ Verification/Save error:", err)
						setError(err.message)
					} finally {
						setIsSubmitting(false)
					}
				},
				theme: { color: "#3399cc" },
				modal: {
					ondismiss: function () {
						console.log("Payment modal closed by user");
						setIsSubmitting(false);
						setError("Payment was cancelled. You can try again whenever you're ready.");
					}
				}
			}

			const rzp = new window.Razorpay(options)
			rzp.on("payment.failed", function (err) {
				console.error("❌ Payment failed:", err.error)
				setError(
					`Payment failed: ${err.error.description || "The transaction could not be completed"}. (Error Code: ${err.error.code})`
				)
				setIsSubmitting(false)
			})

			rzp.open()
		} catch (err) {
			console.error("❌ Payment Initialization error:", err)
			setError(err.message || "Payment system error. Please try again later.")
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

	// Appointment types are now derived from the services state
	const appointmentTypes = services.map(service => ({
		value: service.appointmentType,
		label: service.title
	}))

	// Function to get service details by appointment type from the state
	const getServiceByAppointmentType = (appointmentType) => {
		if (!services || services.length === 0) return null
		return services.find((s) => s.appointmentType === appointmentType)
	}

	const renderStepIndicator = () => (
		<div className="flex items-center justify-center mb-8 flex-wrap">
			{[0, 1, 2, 3, 4].map((step) => (
				<div key={step} className="flex items-center">
					<div
						className={`w-10 h-10 rounded-full flex items-center justify-center ${step <= viewStep
							? "bg-primary-600 text-white"
							: "bg-gray-200 text-gray-600"
							}`}>
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
							className={`w-8 sm:w-12 md:w-16 h-1 mx-1 sm:mx-2 ${step < viewStep ? "bg-primary-600" : "bg-gray-200"
								}`}
						/>
					)}
				</div>
			))}
		</div>
	)

	// ----------------- Main render -----------------
	return (
		<div className="min-h-screen bg-gray-50">
			{!isSubmitted && (
				<section className="bg-gradient-to-br from-primary-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
					<div className="max-w-7xl mx-auto text-center">
						<motion.div
							initial={{ opacity: 0, y: 30 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.8 }}>
							<h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
								Book Your Appointment
							</h1>
							<p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
								Schedule your visit with Dr. Fatima Kasamnath. Our online booking
								system makes it easy to find a time that works for you.
							</p>
						</motion.div>
					</div>
				</section>
			)}

			<section className="py-12 px-4 sm:px-6 lg:px-8">
				<div className="max-w-4xl mx-auto">
					<div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
						{renderStepIndicator()}

						{isSubmitted ? (
							<SuccessScreen
								formData={formData}
								confirmationData={confirmationData}
								signupEmail={signupEmail}
								loginEmail={loginEmail}
							/>
						) : (
							<>
								{viewStep === 0 && (
									<AuthStep
										authMode={authMode}
										setAuthMode={setAuthMode}
										authMessage={authMessage}
										setAuthMessage={setAuthMessage}
										authLoading={authLoading}
										setAuthLoading={setAuthLoading}
										signupEmail={signupEmail}
										setSignupEmail={setSignupEmail}
										signupPassword={signupPassword}
										setSignupPassword={setSignupPassword}
										signupConfirmPassword={signupConfirmPassword}
										setSignupConfirmPassword={setSignupConfirmPassword}
										loginEmail={loginEmail}
										setLoginEmail={setLoginEmail}
										loginPassword={loginPassword}
										setLoginPassword={setLoginPassword}
										signUpNow={signUpNow}
										loginNow={loginNow}
										signOutNow={signOutNow}
										isAuthenticated={isAuthenticated}
										user={user}
										setCurrentStep={setCurrentStep}
									/>
								)}
								{viewStep === 1 && <PersonalInfoStep formData={formData} handleChange={handleChange} />}
								{viewStep === 2 && (
									<>
										{loadingServices && <LoadingSpinner />}
										{servicesError && (
											<div className="text-red-600 bg-red-50 p-3 rounded-md">
												{servicesError}
											</div>
										)}
										{!loadingServices && !servicesError && (
											<AppointmentDetailsStep
												formData={formData}
												handleChange={handleChange}
												appointmentTypes={appointmentTypes}
												selectedService={selectedService}
												availableDates={availableDates}
												medicalCenters={medicalCenters}
												loadingSlots={loadingSlots}
												availableSlots={availableSlots}
												bookingRange={slotManager.bookingRange}
											/>
										)}
									</>
								)}
								{viewStep === 3 && <MedicalInfoStep formData={formData} handleChange={handleChange} />}
								{viewStep === 4 && <ConfirmationStep formData={formData} selectedService={selectedService} />}

								<div className="flex flex-col sm:flex-row justify-between mt-8 pt-6 border-t border-gray-200 space-y-4 sm:space-y-0">
									{viewStep > 0 && (
										<button
											type="button"
											onClick={() => {
												if (viewStep === 1 && !canProceed) return
												prevStep()
											}}
											className="btn-secondary flex items-center justify-center w-full sm:w-auto">
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
											className={`btn-primary flex items-center justify-center w-full sm:w-auto ml-auto ${!canProceed ? "opacity-50 cursor-not-allowed" : ""
												}`}>
											Next <ChevronRight className="w-5 h-5 ml-2" />
										</button>
									) : (
										<div className="flex flex-col items-stretch sm:items-end space-y-3 ml-auto">
											<button
												type="button"
												disabled={isSubmitting || !canProceed}
												onClick={openRazorpay}
												className="btn-primary flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto">
												{isSubmitting ? (
													<LoadingSpinner />
												) : (
													<>
														<Calendar className="w-5 h-5 mr-2" />
														Pay ₹{getServicePrice(selectedService || getServiceByAppointmentType(formData.appointmentType))} & Confirm
													</>
												)}
											</button>
											<p className="text-xs text-gray-500 text-center sm:text-right">
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