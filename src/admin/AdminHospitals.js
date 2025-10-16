import React, { useState, useEffect } from "react"
import {
	getAllHospitalsAsync,
	createHospital,
	updateHospitalById,
	deleteHospitalById,
} from "../data/hospitals"
import { Plus, Edit, Trash2, Clock } from "lucide-react"

const AdminHospitals = () => {
	const [hospitals, setHospitals] = useState([])
	const [loading, setLoading] = useState(true)
	const [editingHospital, setEditingHospital] = useState(null)
	const [showForm, setShowForm] = useState(false)
	const [error, setError] = useState(null)

	useEffect(() => {
		fetchHospitals()
	}, [])

	const fetchHospitals = async () => {
		setLoading(true)
		setError(null)
		try {
			const data = await getAllHospitalsAsync()
			setHospitals(data)
		} catch (error) {
			console.error("Error fetching hospitals:", error)
			setError("Failed to fetch hospitals. Please check the console for details.")
		} finally {
			setLoading(false)
		}
	}

	const handleSave = async (hospital) => {
		try {
			if (hospital.id) {
				// Update
				await updateHospitalById(hospital.id, hospital)
			} else {
				// Create
				const { id, ...newHospitalData } = hospital
				await createHospital(newHospitalData)
			}
			setShowForm(false)
			setEditingHospital(null)
			fetchHospitals()
		} catch (error) {
			console.error("Error saving hospital:", error)
			setError("Failed to save hospital. Please check the console for details.")
		}
	}

	const handleDelete = async (hospitalId) => {
		if (window.confirm("Are you sure you want to delete this hospital?")) {
			try {
				await deleteHospitalById(hospitalId)
				fetchHospitals()
			} catch (error) {
				console.error("Error deleting hospital:", error)
				setError(
					"Failed to delete hospital. Please check the console for details."
				)
			}
		}
	}

	if (loading) {
		return <div>Loading hospitals...</div>
	}

	return (
		<div className="p-6 bg-gray-50 min-h-screen">
			<h1 className="text-3xl font-bold mb-6">Hospital Management</h1>

			{error && (
				<div
					className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
					role="alert">
					<strong className="font-bold">Error:</strong>
					<span className="block sm:inline"> {error}</span>
				</div>
			)}

			<div className="bg-white rounded-lg shadow-md p-6">
				<div className="flex justify-end mb-4">
					<button
						onClick={() => {
							setEditingHospital(null)
							setShowForm(true)
						}}
						className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center hover:bg-blue-700 transition-colors">
						<Plus className="w-4 h-4 mr-2" />
						Add Hospital
					</button>
				</div>
				<div className="overflow-x-auto">
					<table className="w-full">
						<thead>
							<tr className="border-b">
								<th className="text-left p-3 font-semibold text-gray-600">
									Name
								</th>
								<th className="text-left p-3 font-semibold text-gray-600">
									Address
								</th>
								<th className="text-left p-3 font-semibold text-gray-600">
									Phone
								</th>
								<th className="text-left p-3 font-semibold text-gray-600">
									Actions
								</th>
							</tr>
						</thead>
						<tbody>
							{hospitals.map((hospital) => (
								<tr
									key={hospital.id}
									className="border-b hover:bg-gray-50 transition-colors">
									<td className="p-3">{hospital.name}</td>
									<td className="p-3">{hospital.address}</td>
									<td className="p-3">{hospital.phone}</td>
									<td className="p-3 flex items-center space-x-4">
										<button
											onClick={() => {
												setEditingHospital(hospital)
												setShowForm(true)
											}}
											className="text-blue-600 hover:text-blue-800 transition-colors"
											aria-label={`Edit ${hospital.name}`}>
											<Edit className="w-5 h-5" />
										</button>
										<button
											onClick={() => handleDelete(hospital.id)}
											className="text-red-600 hover:text-red-800 transition-colors"
											aria-label={`Delete ${hospital.name}`}>
											<Trash2 className="w-5 h-5" />
										</button>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>

			{showForm && (
				<HospitalForm
					hospital={editingHospital}
					onSave={handleSave}
					onCancel={() => {
						setShowForm(false)
						setEditingHospital(null)
					}}
				/>
			)}
		</div>
	)
}

const HospitalForm = ({ hospital, onSave, onCancel }) => {
	const [formData, setFormData] = useState(
		hospital || { name: "", address: "", phone: "", doctorSchedule: {} }
	)

	const handleChange = (e) => {
		const { name, value } = e.target
		setFormData((prev) => ({ ...prev, [name]: value }))
	}

	const handleSlotChange = (day, slotIndex, value) => {
		const newSchedule = { ...formData.doctorSchedule }
		if (!newSchedule[day]) {
			newSchedule[day] = { slots: [] }
		}
		newSchedule[day].slots[slotIndex] = value
		setFormData((prev) => ({ ...prev, doctorSchedule: newSchedule }))
	}

	const addSlot = (day) => {
		const newSchedule = { ...formData.doctorSchedule }
		if (!newSchedule[day]) {
			newSchedule[day] = { slots: [] }
		}
		newSchedule[day].slots.push("")
		setFormData((prev) => ({ ...prev, doctorSchedule: newSchedule }))
	}

	const removeSlot = (day, slotIndex) => {
		const newSchedule = { ...formData.doctorSchedule }
		newSchedule[day].slots.splice(slotIndex, 1)
		setFormData((prev) => ({ ...prev, doctorSchedule: newSchedule }))
	}

	const handleSubmit = (e) => {
		e.preventDefault()
		onSave(formData)
	}

	return (
		<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
			<div className="bg-white rounded-lg p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
				<h2 className="text-3xl font-bold mb-6">
					{hospital ? "Edit Hospital" : "Add Hospital"}
				</h2>
				<form onSubmit={handleSubmit}>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<div>
							<h3 className="text-xl font-bold mb-4">Hospital Details</h3>
							<div className="space-y-4">
								<div>
									<label className="block mb-2 font-semibold">Name</label>
									<input
										type="text"
										name="name"
										value={formData.name}
										onChange={handleChange}
										className="w-full p-2 border rounded"
										required
									/>
								</div>
								<div>
									<label className="block mb-2 font-semibold">Address</label>
									<input
										type="text"
										name="address"
										value={formData.address}
										onChange={handleChange}
										className="w-full p-2 border rounded"
										required
									/>
								</div>
								<div>
									<label className="block mb-2 font-semibold">Phone</label>
									<input
										type="text"
										name="phone"
										value={formData.phone}
										onChange={handleChange}
										className="w-full p-2 border rounded"
									/>
								</div>
							</div>
						</div>

						<div className="border-t md:border-t-0 md:border-l pl-6 pt-6 md:pt-0">
							<h3 className="text-xl font-bold mb-4">Manage Schedule</h3>
							<div className="space-y-4">
								{[
									"monday",
									"tuesday",
									"wednesday",
									"thursday",
									"friday",
									"saturday",
									"sunday",
								].map((day) => (
									<div key={day} className="border-b pb-4">
										<h4 className="capitalize font-semibold">{day}</h4>
										<div className="max-h-32 overflow-y-auto grid grid-cols-2 md:grid-cols-3 gap-2 mt-2 p-2 bg-gray-50 rounded">
											{(formData.doctorSchedule[day]?.slots || []).map(
												(slot, index) => (
													<div key={index} className="flex items-center">
														<input
															type="time"
															value={slot}
															onChange={(e) =>
																handleSlotChange(day, index, e.target.value)
															}
															className="w-full p-2 border rounded"
														/>
														<button
															type="button"
															onClick={() => removeSlot(day, index)}
															className="ml-2 text-red-500 hover:text-red-700">
															<Trash2 className="w-4 h-4" />
														</button>
													</div>
												)
											)}
										</div>
										<button
											type="button"
											onClick={() => addSlot(day)}
											className="mt-2 text-blue-600 hover:text-blue-800 font-semibold">
											+ Add Slot
										</button>
									</div>
								))}
							</div>
						</div>
					</div>

					<div className="flex justify-end space-x-4 mt-8">
						<button
							type="button"
							onClick={onCancel}
							className="bg-gray-300 px-6 py-2 rounded font-semibold hover:bg-gray-400">
							Cancel
						</button>
						<button
							type="submit"
							className="bg-blue-600 text-white px-6 py-2 rounded font-semibold hover:bg-blue-700">
							Save
						</button>
					</div>
				</form>
			</div>
		</div>
	)
}