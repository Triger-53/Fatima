// src/pages/Appointment.jsx
import React, { useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"
import { Calendar, CheckCircle, ChevronRight, ChevronLeft } from "lucide-react"
import { supabase } from "../supabase"
import { checkUserExists, deleteUserById } from "../utils/supabaseAdmin"
import servicesData from "../data/services.json"

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
		appointmentType: "",
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
	const [isLoading, setIsLoading] = useState(false)

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

	// IMPORTANT: only real authenticated session allows proceeding
	const canProceed = Boolean(isAuthenticated)
	const effectiveStep = canProceed ? currentStep : 0

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
					setCurrentStep(1)
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
		setFormData((p) => ({ ...p, [name]: value }))
		if (error) setError(null)
	}

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
		const { firstName, lastName, email, phone } = formData
		if (!firstName?.trim()) return "First name is required"
		if (!lastName?.trim()) return "Last name is required"
		if (!email?.trim()) return "Email is required"
		if (!phone?.trim()) return "Phone number is required"

		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
		if (!emailRegex.test(email)) return "Please enter a valid email address"

		const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/
		if (!phoneRegex.test(phone.replace(/\s/g, "")))
			return "Please enter a valid phone number"

		return null
	}

	const validateAppointmentDetails = () => {
		const { appointmentType, preferredDate, preferredTime } = formData
		if (!appointmentType) return "Please select an appointment type"
		if (!preferredDate) return "Please select a preferred date"
		if (!preferredTime) return "Please select a preferred time"

		const selectedDate = new Date(preferredDate)
		const today = new Date()
		today.setHours(0, 0, 0, 0)
		if (selectedDate < today) return "Please select a future date"

		return null
	}

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
		if (selectedService && selectedService.price) {
			const price = selectedService.price.inr || selectedService.price
			paymentAmount = price.min * 100 // Convert to paise
		}

		const options = {
			key: "rzp_test_REORU4W2JT2Anw",
			amount: paymentAmount,
			currency: "INR",
			name: "Dr. Fatima Kasamnath Clinic",
			description: `Appointment Payment - ${selectedService?.title || formData.appointmentType}`,
			prefill: {
				name: `${formData.firstName} ${formData.lastName}`,
				email: formData.email,
				contact: formData.phone,
			},
			handler: async function (response) {
				console.log("✅ Payment success:", response)
				let appointmentRow = null

				try {
					const appointmentData = {
						firstName: formData.firstName,
						lastName: formData.lastName,
						email: formData.email,
						phone: formData.phone,
						dateOfBirth: formData.dateOfBirth,
						gender: formData.gender,
						appointmentType: formData.appointmentType,
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

	const appointmentTypes = servicesData.services.map(service => ({
		value: service.appointmentType,
		label: service.title
	}))

	const timeSlots = [
		"8:00 AM",
		"8:30 AM",
		"9:00 AM",
		"9:30 AM",
		"10:00 AM",
		"10:30 AM",
		"11:00 AM",
		"11:30 AM",
		"2:00 PM",
		"2:30 PM",
		"3:00 PM",
		"3:30 PM",
		"4:00 PM",
		"4:30 PM",
		"5:00 PM",
		"5:30 PM",
	]

	const renderStepIndicator = () => (
		<div className="flex items-center justify-center mb-8">
			{[0, 1, 2, 3, 4].map((step) => (
				<div key={step} className="flex items-center">
					<div
						className={`w-10 h-10 rounded-full flex items-center justify-center ${
							step <= effectiveStep
								? "bg-primary-600 text-white"
								: "bg-gray-200 text-gray-600"
						}`}>
						{step === 0 ? (
							"🔒"
						) : step < effectiveStep ? (
							<CheckCircle className="w-5 h-5" />
						) : (
							step
						)}
					</div>
					{step < 4 && (
						<div
							className={`w-16 h-1 mx-2 ${
								step < effectiveStep ? "bg-primary-600" : "bg-gray-200"
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
					<label className="block text-gray-700">Date of Birth</label>
					<input
						type="date"
						name="dateOfBirth"
						value={formData.dateOfBirth}
						onChange={handleChange}
						className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
					/>
				</div>

				<div>
					<label className="block text-gray-700">Gender</label>
					<select
						name="gender"
						value={formData.gender}
						onChange={handleChange}
						className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500">
						<option value="">Select</option>
						<option value="male">Male</option>
						<option value="female">Female</option>
						<option value="other">Other</option>
					</select>
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
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				<div>
					<label className="block text-gray-700">Preferred Date</label>
					<input
						type="date"
						name="preferredDate"
						value={formData.preferredDate}
						onChange={handleChange}
						min={new Date().toISOString().split("T")[0]}
						className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
						required
					/>
					<p className="text-xs text-gray-500 mt-1">
						Select a future date for your appointment
					</p>
				</div>

				<div>
					<label className="block text-gray-700">Preferred Time</label>
					<select
						name="preferredTime"
						value={formData.preferredTime}
						onChange={handleChange}
						className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
						required>
						<option value="">Select Time</option>
						{timeSlots.map((time) => (
							<option key={time} value={time}>
								{time}
							</option>
						))}
					</select>
				</div>
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
					<strong>Appointment Type:</strong> {formData.appointmentType}
				</p>
				<p>
					<strong>Date:</strong> {formData.preferredDate}
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
								{effectiveStep === 0 && renderAuthStep()}
								{effectiveStep === 1 && renderPersonalInfo()}
								{effectiveStep === 2 && renderAppointmentDetails()}
								{effectiveStep === 3 && renderMedicalInfo()}
								{effectiveStep === 4 && renderConfirmation()}

								<div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
									{effectiveStep > 0 && (
										<button
											type="button"
											onClick={() => {
												if (effectiveStep === 1 && !canProceed) return
												prevStep()
											}}
											className="btn-secondary flex items-center">
											<ChevronLeft className="w-5 h-5 mr-2" /> Previous
										</button>
									)}

									{effectiveStep < 4 ? (
										<button
											type="button"
											disabled={!canProceed}
											onClick={() => {
												let validationError = null
												if (effectiveStep === 1)
													validationError = validatePersonalInfo()
												else if (effectiveStep === 2)
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
														Pay ₹{selectedService?.price?.inr?.min || selectedService?.price?.min || 500} & Confirm
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
										{error.includes("Payment") && effectiveStep === 4 && (
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
