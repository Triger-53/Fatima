
import React, { useEffect, useState } from "react"
import { supabase } from "../supabase"
import {
	Calendar,
	Clock,
	MapPin,
	Settings,
	Plus,
	Trash2,
	Edit3,
	Save,
	X,
} from "lucide-react"
import { slotManager } from "../utils/slotManager"

const AppointmentSlotManager = () => {
	const [loading, setLoading] = useState(true)
	const [appointments, setAppointments] = useState([])
	const [bookingRange, setBookingRange] = useState(null)
	const [editingSlots, setEditingSlots] = useState(null)
	const [showSlotEditor, setShowSlotEditor] = useState(false)
	const [slotConfig, setSlotConfig] = useState({
		online: {},
		offline: [],
	})
	const [availability, setAvailability] = useState({})
	const [summary, setSummary] = useState({
		totalSlots: 0,
		bookedSlots: 0,
		availableSlots: 0,
	})
	const [visibleDatesCount, setVisibleDatesCount] = useState(14)
	const [successMessage, setSuccessMessage] = useState("")
	const [errorMessage, setErrorMessage] = useState("")

	// Initialize and fetch data
	useEffect(() => {
		const initialize = async () => {
			await slotManager.initialized
			setBookingRange(slotManager.bookingRange)
			setSlotConfig({
				online: slotManager.onlineSlots,
				offline: slotManager.medicalCenters,
			})
		}

		initialize()
	}, [])

	// Fetch data when bookingRange is set
	useEffect(() => {
		if (bookingRange === null) return

		const fetchData = async () => {
			setLoading(true)

			// Fetch appointments
			const { data, error } = await supabase
				.from("Appointment")
				.select("*")
				.order("preferredDate", { ascending: true })

			if (error) {
				console.error("Error fetching appointments:", error)
			} else {
				setAppointments(data || [])
			}

			// Get slot availability summary
			try {
				const availabilitySummary =
					await slotManager.getSlotAvailabilitySummary(bookingRange)
				setSummary({
					totalSlots: availabilitySummary.totalSlots,
					bookedSlots: availabilitySummary.bookedSlots,
					availableSlots: availabilitySummary.availableSlots,
				})
				setAvailability(availabilitySummary.byDate)
			} catch (error) {
				console.error("Error fetching slot availability:", error)
			}

			setLoading(false)
		}

		fetchData()
	}, [bookingRange])

	// Use enhanced slot manager for better slot management
	const getAvailableDates = () => {
		return slotManager.getAvailableDates(bookingRange)
	}

	// Get day of week from date string
	const getDayOfWeek = (dateString) => {
		return slotManager.getDayOfWeek(dateString)
	}

	// Get available slots for a specific date and consultation method
	const getAvailableSlots = (
		date,
		consultationMethod,
		medicalCenter = null
	) => {
		return slotManager.getAvailableSlots(
			date,
			consultationMethod,
			medicalCenter
		)
	}

	// Calculate slot availability for a date range using enhanced slot manager
	const getSlotAvailability = async () => {
		const summary = await slotManager.getSlotAvailabilitySummary(bookingRange)
		return summary.byDate
	}

	// Update booking range
	const handleBookingRangeChange = async (newRange) => {
		setSuccessMessage("")
		setErrorMessage("")
		setBookingRange(newRange)
		const result = await slotManager.setBookingRange(newRange)
		if (result.success) {
			setSuccessMessage("Booking range updated successfully.")
		} else {
			setErrorMessage(`Failed to update booking range: ${result.error}`)
		}
		setTimeout(() => {
			setSuccessMessage("")
			setErrorMessage("")
		}, 3000)
	}

	// Edit slot configuration
	const handleEditSlots = (type, centerId = null) => {
		setEditingSlots({ type, centerId })
		setShowSlotEditor(true)
	}

	// Save slot configuration
	const handleSaveSlots = async (newSlots) => {
		setSuccessMessage("")
		setErrorMessage("")
		let result

		if (editingSlots.type === "online") {
			result = await slotManager.setOnlineSlots(newSlots)
			if (result.success) {
				setSlotConfig((prev) => ({
					...prev,
					online: newSlots,
				}))
			}
		} else {
			result = await slotManager.setHospitalSchedule(
				editingSlots.centerId,
				newSlots
			)
			if (result.success) {
				setSlotConfig((prev) => ({
					...prev,
					offline: prev.offline.map((center) => {
						if (center.id === editingSlots.centerId) {
							return { ...center, doctorSchedule: newSlots }
						}
						return center
					}),
				}))
			}
		}

		if (result.success) {
			setSuccessMessage("Slot configuration saved successfully.")
			setShowSlotEditor(false)
			setEditingSlots(null)
		} else {
			setErrorMessage(`Failed to save slot configuration: ${result.error}`)
		}
		setTimeout(() => {
			setSuccessMessage("")
			setErrorMessage("")
		}, 3000)
	}

	// Format date for display
	const formatDate = (dateString) => {
		const date = new Date(dateString)
		return date.toLocaleDateString("en-US", {
			weekday: "short",
			month: "short",
			day: "numeric",
		})
	}

	// Get availability summary (now using state)
	const getAvailabilitySummary = () => {
		return summary
	}

	if (loading) {
		return (
			<div className="p-6 bg-gray-50 min-h-screen">
				<div className="flex items-center justify-center h-64">
					<div className="text-lg text-gray-600">
						Loading appointment data...
					</div>
				</div>
			</div>
		)
	}

	const availabilitySummary = getAvailabilitySummary()

	return (
		<div className="p-6 bg-gray-50 min-h-screen">
			{/* Header */}
			<div className="mb-6 p-6 rounded-lg text-white bg-gradient-to-r from-blue-600 to-purple-600 shadow-md">
				<h1 className="text-3xl font-bold text-center mb-2">
					Appointment Slot Manager
				</h1>
				<p className="text-center text-blue-100">
					Manage booking ranges and slot availability
				</p>
			</div>

			{/* Feedback Messages */}
			{successMessage && (
				<div className="mb-4 p-4 rounded-md bg-green-100 text-green-700 flex justify-between items-center">
					<span>{successMessage}</span>
					<button onClick={() => setSuccessMessage("")} className="text-green-700">
						<X className="w-5 h-5" />
					</button>
				</div>
			)}
			{errorMessage && (
				<div className="mb-4 p-4 rounded-md bg-red-100 text-red-700 flex justify-between items-center">
					<span>{errorMessage}</span>
					<button onClick={() => setErrorMessage("")} className="text-red-700">
						<X className="w-5 h-5" />
					</button>
				</div>
			)}

			{/* Booking Range Control */}
			<div className="bg-white rounded-lg shadow-md p-6 mb-6">
				<div className="flex items-center justify-between mb-4">
					<h2 className="text-xl font-semibold flex items-center">
						<Calendar className="w-5 h-5 mr-2" />
						Booking Range Configuration
					</h2>
				</div>
				<div className="flex items-center space-x-4">
					<label className="text-sm font-medium text-gray-700">
						Booking Range (days):
					</label>
					<select
						value={bookingRange}
						onChange={(e) => handleBookingRangeChange(parseInt(e.target.value))}
						className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
						<option value={15}>15 days</option>
						<option value={30}>30 days</option>
						<option value={45}>45 days</option>
						<option value={60}>60 days</option>
						<option value={90}>90 days</option>
					</select>
					<span className="text-sm text-gray-600">
						Currently showing {bookingRange} days from today
					</span>
				</div>
			</div>

			{/* Availability Summary */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
				<div className="bg-white rounded-lg shadow-md p-6">
					<div className="flex items-center">
						<div className="p-3 rounded-full bg-blue-100 text-blue-600">
							<Calendar className="w-6 h-6" />
						</div>
						<div className="ml-4">
							<p className="text-sm font-medium text-gray-600">Total Slots</p>
							<p className="text-2xl font-bold text-gray-900">
								{availabilitySummary.totalSlots}
							</p>
						</div>
					</div>
				</div>
				<div className="bg-white rounded-lg shadow-md p-6">
					<div className="flex items-center">
						<div className="p-3 rounded-full bg-green-100 text-green-600">
							<Clock className="w-6 h-6" />
						</div>
						<div className="ml-4">
							<p className="text-sm font-medium text-gray-600">
								Available Slots
							</p>
							<p className="text-2xl font-bold text-gray-900">
								{availabilitySummary.availableSlots}
							</p>
						</div>
					</div>
				</div>
				<div className="bg-white rounded-lg shadow-md p-6">
					<div className="flex items-center">
						<div className="p-3 rounded-full bg-red-100 text-red-600">
							<Settings className="w-6 h-6" />
						</div>
						<div className="ml-4">
							<p className="text-sm font-medium text-gray-600">Booked Slots</p>
							<p className="text-2xl font-bold text-gray-900">
								{availabilitySummary.bookedSlots}
							</p>
						</div>
					</div>
				</div>
			</div>

			{/* Slot Configuration */}
			<div className="bg-white rounded-lg shadow-md p-6 mb-6">
				<h2 className="text-xl font-semibold mb-4 flex items-center">
					<Settings className="w-5 h-5 mr-2" />
					Slot Configuration
				</h2>

				{/* Online Slots */}
				<div className="mb-6">
					<div className="flex items-center justify-between mb-3">
						<h3 className="text-lg font-medium text-gray-800">
							Online Consultation Slots
						</h3>
						<button
							onClick={() => handleEditSlots("online")}
							className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
							<Edit3 className="w-4 h-4 mr-1" />
							Edit Slots
						</button>
					</div>
					<div className="grid grid-cols-7 gap-2 text-sm">
						{Object.entries(slotConfig.online).map(([day, schedule]) => (
							<div key={day} className="text-center">
								<div className="font-medium text-gray-700 capitalize mb-1">
									{day}
								</div>
								<div className="text-xs text-gray-500">
									{schedule ? `${schedule.slots.length} slots` : "Closed"}
								</div>
							</div>
						))}
					</div>
				</div>

				{/* Offline Slots */}
				<div>
					<h3 className="text-lg font-medium text-gray-800 mb-3">
						Offline Consultation Slots
					</h3>
					<div className="space-y-4">
						{Object.values(slotConfig.offline).map((center) => (
							<div
								key={center.id}
								className="border border-gray-200 rounded-lg p-4">
								<div className="flex items-center justify-between mb-3">
									<div className="flex items-center">
										<MapPin className="w-4 h-4 mr-2 text-gray-600" />
										<div>
											<h4 className="font-medium text-gray-800">
												{center.name}
											</h4>
											<p className="text-sm text-gray-600">{center.address}</p>
										</div>
									</div>
									<button
										onClick={() => handleEditSlots("offline", center.id)}
										className="flex items-center px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors">
										<Edit3 className="w-4 h-4 mr-1" />
										Edit Slots
									</button>
								</div>
								<div className="grid grid-cols-7 gap-2 text-sm">
									{Object.entries(center.doctorSchedule).map(
										([day, schedule]) => (
											<div key={day} className="text-center">
												<div className="font-medium text-gray-700 capitalize mb-1">
													{day}
												</div>
												<div className="text-xs text-gray-500">
													{schedule
														? `${schedule.slots.length} slots`
														: "Closed"}
												</div>
											</div>
										)
									)}
								</div>
							</div>
						))}
					</div>
				</div>
			</div>

			{/* Detailed Availability View */}
			<div className="bg-white rounded-lg shadow-md p-6">
				<h2 className="text-xl font-semibold mb-4 flex items-center">
					<Calendar className="w-5 h-5 mr-2" />
					Detailed Slot Availability ({bookingRange} days)
				</h2>

				<div className="overflow-x-auto">
					<div className="min-w-full">
						{/* Header */}
						<div className="grid grid-cols-8 gap-2 mb-4 p-3 bg-gray-100 rounded-lg">
							<div className="font-medium text-gray-700">Date</div>
							<div className="font-medium text-gray-700">Day</div>
							<div className="font-medium text-gray-700">Online</div>
							{Object.values(slotConfig.offline).map((center) => (
								<div
									key={center.id}
									className="font-medium text-gray-700 text-center">
									{center.name.split(" ")[0]}
								</div>
							))}
						</div>

						{/* Availability Rows */}
						{Object.entries(availability)
							.slice(0, visibleDatesCount)
							.map(([date, dateData]) => {
								const dayOfWeek = getDayOfWeek(date)

								return (
									<div
										key={date}
										className="grid grid-cols-8 gap-2 p-3 border-b border-gray-200 hover:bg-gray-50">
										<div className="text-sm font-medium text-gray-800">
											{formatDate(date)}
										</div>
										<div className="text-sm text-gray-600 capitalize">
											{dayOfWeek}
										</div>
										<div className="text-sm">
											<span
												className={`px-2 py-1 rounded-full text-xs ${
													dateData.online.available === 0
														? "bg-red-100 text-red-800"
														: dateData.online.available <
														  dateData.online.total * 0.5
														? "bg-yellow-100 text-yellow-800"
														: "bg-green-100 text-green-800"
												}`}>
												{dateData.online.available}/{dateData.online.total}
											</span>
										</div>
										{Object.values(slotConfig.offline).map((center) => {
											const centerData = dateData.offline[center.id] || {
												total: 0,
												available: 0,
												booked: 0,
											}

											return (
												<div key={center.id} className="text-sm text-center">
													<span
														className={`px-2 py-1 rounded-full text-xs ${
															centerData.available === 0
																? "bg-red-100 text-red-800"
																: centerData.available < centerData.total * 0.5
																? "bg-yellow-100 text-yellow-800"
																: "bg-green-100 text-green-800"
														}`}>
														{centerData.available}/{centerData.total}
													</span>
												</div>
											)
										})}
									</div>
								)
							})}
					</div>
				</div>

				{/* Show more button if there are more dates */}
				{Object.keys(availability).length > visibleDatesCount && (
					<div className="mt-4 text-center">
						<button
							onClick={() =>
								setVisibleDatesCount(Object.keys(availability).length)
							}
							className="text-blue-600 hover:text-blue-800 font-medium">
							Show More Dates (
							{Object.keys(availability).length - visibleDatesCount} remaining)
						</button>
					</div>
				)}
			</div>

			{/* Slot Editor Modal */}
			{showSlotEditor && (
				<SlotEditor
					editingSlots={editingSlots}
					slotConfig={slotConfig}
					onSave={handleSaveSlots}
					onClose={() => {
						setShowSlotEditor(false)
						setEditingSlots(null)
					}}
				/>
			)}
		</div>
	)
}

// Slot Editor Component
const SlotEditor = ({ editingSlots, slotConfig, onSave, onClose }) => {
	const [editedSlots, setEditedSlots] = useState({})
	const [newSlot, setNewSlot] = useState("")

	useEffect(() => {
		if (editingSlots.type === "online") {
			setEditedSlots(slotConfig.online)
		} else {
			const center = Object.values(slotConfig.offline).find(
				(c) => c.id === editingSlots.centerId
			)
			setEditedSlots(center?.doctorSchedule || {})
		}
	}, [editingSlots, slotConfig])

	const handleDayToggle = (day) => {
		setEditedSlots((prev) => ({
			...prev,
			[day]: prev[day] ? null : { start: "09:00", end: "17:00", slots: [] },
		}))
	}

	const handleAddSlot = (day) => {
		if (!newSlot) return

		setEditedSlots((prev) => ({
			...prev,
			[day]: {
				...prev[day],
				slots: [...(prev[day]?.slots || []), newSlot],
			},
		}))
		setNewSlot("")
	}

	const handleRemoveSlot = (day, slot) => {
		setEditedSlots((prev) => ({
			...prev,
			[day]: {
				...prev[day],
				slots: prev[day].slots.filter((s) => s !== slot),
			},
		}))
	}

	const handleSave = () => {
		onSave(editedSlots)
	}

	const days = [
		"monday",
		"tuesday",
		"wednesday",
		"thursday",
		"friday",
		"saturday",
		"sunday",
	]

	return (
		<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
			<div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
				<div className="flex items-center justify-between mb-6">
					<h3 className="text-xl font-semibold">
						Edit {editingSlots.type === "online" ? "Online" : "Offline"} Slots
					</h3>
					<button
						onClick={onClose}
						className="text-gray-500 hover:text-gray-700">
						<X className="w-6 h-6" />
					</button>
				</div>

				<div className="space-y-6">
					{days.map((day) => (
						<div key={day} className="border border-gray-200 rounded-lg p-4">
							<div className="flex items-center justify-between mb-3">
								<div className="flex items-center">
									<input
										type="checkbox"
										checked={!!editedSlots[day]}
										onChange={() => handleDayToggle(day)}
										className="mr-3"
									/>
									<span className="font-medium capitalize">{day}</span>
								</div>
								{editedSlots[day] && (
									<div className="text-sm text-gray-600">
										{editedSlots[day].slots.length} slots
									</div>
								)}
							</div>

							{editedSlots[day] && (
								<div className="ml-6">
									<div className="flex items-center space-x-2 mb-3">
										<input
											type="time"
											value={newSlot}
											onChange={(e) => setNewSlot(e.target.value)}
											className="border border-gray-300 rounded px-3 py-1"
											placeholder="Add new slot"
										/>
										<button
											onClick={() => handleAddSlot(day)}
											className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700">
											<Plus className="w-4 h-4" />
										</button>
									</div>
									<div className="flex flex-wrap gap-2">
										{editedSlots[day].slots.map((slot) => (
											<div
												key={slot}
												className="flex items-center bg-gray-100 rounded px-3 py-1">
												<span className="text-sm">{slot}</span>
												<button
													onClick={() => handleRemoveSlot(day, slot)}
													className="ml-2 text-red-600 hover:text-red-800">
													<Trash2 className="w-3 h-3" />
												</button>
											</div>
										))}
									</div>
								</div>
							)}
						</div>
					))}
				</div>

				<div className="flex justify-end space-x-3 mt-6">
					<button
						onClick={onClose}
						className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
						Cancel
					</button>
					<button
						onClick={handleSave}
						className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center">
						<Save className="w-4 h-4 mr-2" />
						Save Changes
					</button>
				</div>
			</div>
		</div>
	)
}

export default AppointmentSlotManager