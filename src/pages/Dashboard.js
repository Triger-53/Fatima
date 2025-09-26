// src/pages/Dashboard.jsx
import React, { useEffect, useState } from "react"
import { useAuth } from "../auth/AuthProvider"
import { supabase } from "../supabase"
import {
	FaUserCircle,
	FaCalendarAlt,
	FaPencilAlt,
	FaEnvelope,
	FaPhone,
	FaBirthdayCake,
	FaVenusMars,
	FaAllergies,
	FaNotesMedical,
	FaCheckCircle,
} from "react-icons/fa"
import EditProfileModal from "../components/EditProfileModal"
import { motion, AnimatePresence } from "framer-motion"

export default function Dashboard() {
	const { user, signOut } = useAuth()
	const [profile, setProfile] = useState(null)
	const [appointments, setAppointments] = useState([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState(null)
	const [isModalOpen, setIsModalOpen] = useState(false)
	const [isSaving, setIsSaving] = useState(false)
	const [notification, setNotification] = useState(null)

	const fetchProfileAndAppointments = async () => {
		if (!user) return
		setLoading(true)
		try {
			const { data, error } = await supabase
				.from("Appointment")
				.select("*")
				.eq("user_id", user.id)
				.order("created_at", { ascending: false })

			if (error) throw error

			setAppointments(data || [])

			if (data && data.length > 0) {
				const aggregatedProfile = data.reduce((acc, curr) => {
					Object.keys(curr).forEach(key => {
						if (curr[key] !== null && curr[key] !== '') acc[key] = curr[key]
					});
					return acc
				}, {})
				setProfile(aggregatedProfile)
			} else {
				setProfile({ email: user.email, firstName: user.email.split('@')[0] })
			}
		} catch (error) {
			setError(error.message)
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => {
		fetchProfileAndAppointments()
	}, [user])

	useEffect(() => {
		if (notification) {
			const timer = setTimeout(() => setNotification(null), 5000)
			return () => clearTimeout(timer)
		}
	}, [notification])

	const handleSaveProfile = async (updatedProfile) => {
		if (!user) {
			setError("You must be logged in to update your profile.")
			return
		}
		setIsSaving(true)
		setError(null)
		try {
			const recordToUpdate = { ...updatedProfile, user_id: user.id, email: user.email };

			if (profile && profile.id) {
				const { error } = await supabase.from('Appointment').update(recordToUpdate).eq('id', profile.id)
				if (error) throw error
			} else {
				const { error } = await supabase.from('Appointment').insert([recordToUpdate])
				if (error) throw error
			}
			setIsModalOpen(false)
			await fetchProfileAndAppointments()
			setNotification("Profile updated successfully!")
		} catch (error) {
			setError(`Failed to save profile: ${error.message}`)
		} finally {
			setIsSaving(false)
		}
	}

	if (loading) return <div className="flex justify-center items-center h-screen"><div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary-600"></div></div>
	if (error) return <div className="max-w-6xl mx-auto px-4 py-10 text-center text-red-500"><p>Error: {error}</p></div>
	if (!user) return <p className="text-center mt-10 text-gray-600">Please log in to view your dashboard.</p>

	const fullName = profile ? [profile.firstName, profile.lastName].filter(Boolean).join(" ") : user.email.split('@')[0]

	return (
		<>
			<Notification msg={notification} />
			<div className="min-h-screen bg-gray-50">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
					<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="bg-white shadow-2xl rounded-3xl p-6 sm:p-10">
						<header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10">
							<div className="flex items-center gap-4 mb-4 sm:mb-0">
								<FaUserCircle className="text-6xl text-primary-500" />
								<div>
									<h1 className="text-3xl font-bold text-gray-900">Welcome, {fullName}</h1>
									<p className="text-gray-600">Here's your personal health overview.</p>
								</div>
							</div>
							<div className="flex items-center gap-3">
								<button onClick={() => setIsModalOpen(true)} className="px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-semibold shadow-md transition-all hover:shadow-lg flex items-center gap-2"><FaPencilAlt /> Edit Profile</button>
								<button onClick={() => signOut().catch((err) => console.error(err))} className="px-5 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold shadow-md transition-all hover:shadow-lg">Log out</button>
							</div>
						</header>

						<div className="space-y-12">
							<Section title="Personal Information" icon={<FaUserCircle className="text-primary-600"/>}>
								<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
									<InfoCard icon={<FaEnvelope />} label="Email" value={profile.email || user.email} />
									<InfoCard icon={<FaPhone />} label="Phone" value={profile.phone} />
									<InfoCard icon={<FaBirthdayCake />} label="Date of Birth" value={profile.dateOfBirth} />
									<InfoCard icon={<FaVenusMars />} label="Gender" value={profile.gender} />
								</div>
							</Section>
							<Section title="Medical History" icon={<FaNotesMedical className="text-green-600" />}>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
									<InfoCard icon={<FaAllergies />} label="Allergies" value={profile.allergies} fullWidth />
									<InfoCard icon={<FaNotesMedical />} label="Past Medical History" value={profile.medicalHistory} fullWidth />
								</div>
							</Section>
							<Section title="Recent Appointments" icon={<FaCalendarAlt className="text-purple-600" />}>
								<AppointmentList appointments={appointments} />
							</Section>
						</div>
					</motion.div>
				</div>
				<AnimatePresence>
					{isModalOpen && <EditProfileModal profile={profile} onClose={() => setIsModalOpen(false)} onSave={handleSaveProfile} isSaving={isSaving} />}
				</AnimatePresence>
			</div>
		</>
	)
}

const Section = ({ title, icon, children }) => (
	<motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
		<h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center gap-3">{icon} {title}</h2>
		{children}
	</motion.section>
)

const InfoCard = ({ icon, label, value, fullWidth }) => (
	<motion.div whileHover={{ y: -5, boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)' }} className={`bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-start gap-4 ${fullWidth ? 'col-span-1 md:col-span-2' : ''}`}>
		<div className="text-2xl text-primary-500 mt-1">{icon}</div>
		<div>
			<p className="text-sm text-gray-500 font-medium">{label}</p>
			<p className="text-lg font-semibold text-gray-900 break-words">{value || <span className="text-gray-400">Not provided</span>}</p>
		</div>
	</motion.div>
)

const AppointmentList = ({ appointments }) => {
	if (appointments.length === 0) {
		return (
			<div className="text-center py-12 bg-gray-100 rounded-2xl">
				<FaCalendarAlt className="text-5xl text-gray-400 mx-auto mb-4" />
				<h3 className="text-xl font-semibold text-gray-800">No appointments found</h3>
				<p className="text-gray-500 mt-2">Book your first appointment to see it here.</p>
			</div>
		)
	}
	return (
		<div className="space-y-4">
			{appointments.map((appt, index) => (
				<motion.div key={appt.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.1 }} className="bg-white p-5 rounded-xl border border-gray-200 flex justify-between items-center">
					<div>
						<p className="font-bold text-lg text-primary-700">{appt.appointmentType}</p>
						<p className="text-gray-600">{new Date(appt.preferredDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} at {appt.preferredTime}</p>
						<p className={`capitalize font-semibold ${appt.consultationMethod === 'online' ? 'text-blue-600' : 'text-green-600'}`}>{appt.consultationMethod}</p>
					</div>
					<div className="text-right">
						<span className="text-sm bg-green-100 text-green-800 px-3 py-1 rounded-full font-medium">Confirmed</span>
					</div>
				</motion.div>
			))}
		</div>
	)
}

const Notification = ({ msg }) => (
	<AnimatePresence>
		{msg && (
			<motion.div initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -50 }} className="fixed top-5 right-5 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 z-50">
				<FaCheckCircle /> {msg}
			</motion.div>
		)}
	</AnimatePresence>
)
