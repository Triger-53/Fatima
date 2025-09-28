import React, { useEffect, useState, useCallback } from "react"
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
	Building,
	Globe,
} from "lucide-react"
import { slotManager } from "../utils/slotManager"

const AppointmentSlotManager = () => {
	const [loading, setLoading] = useState(true)
	const [bookingRange, setBookingRange] = useState(30)
	const [editingSchedule, setEditingSchedule] = useState(null) // { locationId, schedules }
	const [showSlotEditor, setShowSlotEditor] = useState(false)
	const [locations, setLocations] = useState([])
	const [availability, setAvailability] = useState({})
	const [summary, setSummary] = useState({
		totalSlots: 0,
		bookedSlots: 0,
		availableSlots: 0,
	})

	const fetchData = useCallback(async () => {
		setLoading(true)
		await slotManager.ensureInitialized()

		setLocations(slotManager.locations)

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
	}, [bookingRange])

	useEffect(() => {
		fetchData()
	}, [fetchData])

	const handleBookingRangeChange = (newRange) => {
		setBookingRange(newRange)
		slotManager.setBookingRange(newRange)
	}

	const handleEditSchedule = (locationId) => {
		const locationSchedules = slotManager.schedules.get(locationId) || {}
		setEditingSchedule({ locationId, schedules: locationSchedules })
		setShowSlotEditor(true)
	}

	const handleSaveSchedule = async (locationId, newSchedules) => {
		try {
			for (const day in newSchedules) {
				const schedule = newSchedules[day]
				await supabase
					.from("availability_schedules")
					.update({
						start_time: schedule.start_time,
						end_time: schedule.end_time,
						slots: schedule.slots,
						is_active: schedule.is_active,
					})
					.eq("location_id", locationId)
					.eq("day_of_week", day)
			}

			// Re-initialize slot manager and fetch data to reflect changes
			await slotManager.initialize()
			await fetchData()

			setShowSlotEditor(false)
			setEditingSchedule(null)
			alert("Schedule updated successfully!")
		} catch (error) {
			console.error("Error saving schedule:", error)
			alert("Failed to save schedule.")
		}
	}

	const formatDate = (dateString) => {
		const date = new Date(dateString)
		return date.toLocaleDateString("en-US", {
			weekday: "short",
			month: "short",
			day: "numeric",
		})
	}

	const getDayOfWeek = (dateString) => {
		return slotManager.getDayOfWeek(dateString)
	}

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
	const onlineLocation = locations.find((loc) => loc.type === "online")
	const offlineLocations = locations.filter((loc) => loc.type === "offline")

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
					Location & Schedule Configuration
				</h2>

				{/* Online Location */}
				{onlineLocation && (
					<div className="mb-6 border border-gray-200 rounded-lg p-4">
						<div className="flex items-center justify-between mb-3">
							<div className="flex items-center">
								<Globe className="w-5 h-5 mr-3 text-blue-600" />
								<h3 className="text-lg font-medium text-gray-800">
									{onlineLocation.name}
								</h3>
							</div>
							<button
								onClick={() => handleEditSchedule(onlineLocation.id)}
								className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
								<Edit3 className="w-4 h-4 mr-1" />
								Edit Schedule
							</button>
						</div>
					</div>
				)}

				{/* Offline Locations */}
				<div>
					<h3 className="text-lg font-medium text-gray-800 mb-3 flex items-center">
						<Building className="w-5 h-5 mr-3 text-green-600" />
						Medical Centers (Offline)
					</h3>
					<div className="space-y-4">
						{offlineLocations.map((center) => (
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
										onClick={() => handleEditSchedule(center.id)}
										className="flex items-center px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors">
										<Edit3 className="w-4 h-4 mr-1" />
										Edit Schedule
									</button>
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
						<div
							className="grid gap-2 mb-4 p-3 bg-gray-100 rounded-lg"
							style={{
								gridTemplateColumns: `repeat(${
									3 + offlineLocations.length
								}, minmax(0, 1fr))`,
							}}>
							<div className="font-medium text-gray-700">Date</div>
							<div className="font-medium text-gray-700">Day</div>
							<div className="font-medium text-gray-700 text-center">Online</div>
							{offlineLocations.map((center) => (
								<div
									key={center.id}
									className="font-medium text-gray-700 text-center">
									{center.name.split(" ")[0]}
								</div>
							))}
						</div>

						{/* Availability Rows */}
						{Object.entries(availability)
							.slice(0, 14)
							.map(([date, dateData]) => {
								const dayOfWeek = getDayOfWeek(date)

								return (
									<div
										key={date}
										className="grid gap-2 p-3 border-b border-gray-200 hover:bg-gray-50"
										style={{
											gridTemplateColumns: `repeat(${
												3 + offlineLocations.length
											}, minmax(0, 1fr))`,
										}}>
										<div className="text-sm font-medium text-gray-800">
											{formatDate(date)}
										</div>
										<div className="text-sm text-gray-600 capitalize">
											{dayOfWeek}
										</div>
										<div className="text-sm text-center">
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
										{offlineLocations.map((center) => {
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
				{Object.keys(availability).length > 14 && (
					<div className="mt-4 text-center">
						<button className="text-blue-600 hover:text-blue-800 font-medium">
							Show More Dates ({Object.keys(availability).length - 14}{" "}
							remaining)
						</button>
					</div>
				)}
			</div>

			{/* Slot Editor Modal */}
			{showSlotEditor && (
				<SlotEditor
					editingSchedule={editingSchedule}
					locations={locations}
					onSave={handleSaveSchedule}
					onClose={() => {
						setShowSlotEditor(false)
						setEditingSchedule(null)
					}}
				/>
			)}
		</div>
	)
}

// Slot Editor Component
const SlotEditor = ({ editingSchedule, locations, onSave, onClose }) => {
	const [editedSchedules, setEditedSchedules] = useState({})
	const [newSlotTime, setNewSlotTime] = useState("")

	useEffect(() => {
		const initialSchedules = {}
		const days = [
			"monday",
			"tuesday",
			"wednesday",
			"thursday",
			"friday",
			"saturday",
			"sunday",
		]
		days.forEach((day) => {
			initialSchedules[day] = editingSchedule.schedules[day] || {
				start_time: "09:00",
				end_time: "17:00",
				slots: [],
				is_active: false,
			}
		})
		setEditedSchedules(initialSchedules)
	}, [editingSchedule])

	const handleDayToggle = (day) => {
		setEditedSchedules((prev) => ({
			...prev,
			[day]: { ...prev[day], is_active: !prev[day].is_active },
		}))
	}

	const handleAddSlot = (day) => {
		if (!newSlotTime || !/^\d{2}:\d{2}$/.test(newSlotTime)) {
			alert("Please enter a valid time in HH:MM format.")
			return
		}

		setEditedSchedules((prev) => {
			const newSlots = [...(prev[day].slots || []), newSlotTime].sort()
			return {
				...prev,
				[day]: {
					...prev[day],
					slots: newSlots,
				},
			}
		})
		setNewSlotTime("")
	}

	const handleRemoveSlot = (day, slotToRemove) => {
		setEditedSchedules((prev) => ({
			...prev,
			[day]: {
				...prev[day],
				slots: prev[day].slots.filter((s) => s !== slotToRemove),
			},
		}))
	}

	const handleSave = () => {
		onSave(editingSchedule.locationId, editedSchedules)
	}

	const location = locations.find((loc) => loc.id === editingSchedule.locationId)
	const days = Object.keys(editedSchedules)

	return (
		<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
			<div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
				<div className="flex items-center justify-between mb-6">
					<div>
						<h3 className="text-xl font-semibold">
							Edit Schedule for {location?.name}
						</h3>
						<p className="text-sm text-gray-500">
							Manage daily availability and time slots
						</p>
					</div>
					<button
						onClick={onClose}
						className="text-gray-500 hover:text-gray-700">
						<X className="w-6 h-6" />
					</button>
				</div>

				<div className="space-y-6">
					{days.map((day) => (
						<div
							key={day}
							className={`border rounded-lg p-4 ${
								editedSchedules[day]?.is_active
									? "border-blue-300 bg-blue-50"
									: "border-gray-200"
							}`}>
							<div className="flex items-center justify-between mb-3">
								<div className="flex items-center">
									<label className="flex items-center cursor-pointer">
										<input
											type="checkbox"
											checked={editedSchedules[day]?.is_active || false}
											onChange={() => handleDayToggle(day)}
											className="form-checkbox h-5 w-5 text-blue-600 rounded"
										/>
										<span className="ml-3 font-medium capitalize">{day}</span>
									</label>
								</div>
								{editedSchedules[day]?.is_active && (
									<div className="text-sm text-gray-600">
										{editedSchedules[day].slots.length} slots
									</div>
								)}
							</div>

							{editedSchedules[day]?.is_active && (
								<div className="ml-8 mt-4">
									<div className="flex items-center space-x-2 mb-3">
										<input
											type="time"
											value={newSlotTime}
											onChange={(e) => setNewSlotTime(e.target.value)}
											className="border border-gray-300 rounded px-3 py-1 w-32"
										/>
										<button
											onClick={() => handleAddSlot(day)}
											className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center">
											<Plus className="w-4 h-4 mr-1" /> Add Slot
										</button>
									</div>
									<div className="flex flex-wrap gap-2">
										{editedSchedules[day].slots.map((slot) => (
											<div
												key={slot}
												className="flex items-center bg-gray-200 rounded px-3 py-1">
												<span className="text-sm font-mono">{slot}</span>
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