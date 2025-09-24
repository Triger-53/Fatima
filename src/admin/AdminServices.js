import React, { useMemo, useState } from "react"
import { getAllServices, saveAllServices, resetServicesToDefault, publishAllServices, deleteServiceById, updateServiceById } from "../data/services"
import { Heart, Stethoscope, Shield, Syringe, Activity, Eye, Clock, DollarSign } from "lucide-react"

const emptyService = {
	id: "",
	title: "",
	description: "",
	features: [],
	duration: "",
	price: 0,
	icon: "Heart",
	appointmentType: "",
}

const AdminServices = () => {
	const [services, setServices] = useState(() => getAllServices())
	const [editingIndex, setEditingIndex] = useState(-1)
	const [draft, setDraft] = useState(emptyService)
	const isEditing = useMemo(() => editingIndex >= 0, [editingIndex])

	const startAdd = () => {
		setEditingIndex(-1)
		setDraft(emptyService)
	}
	const startEdit = (index) => {
		setEditingIndex(index)
		setDraft(JSON.parse(JSON.stringify(services[index] || emptyService)))
	}
	const cancelEdit = () => {
		setEditingIndex(-1)
		setDraft(emptyService)
	}
	const removeAt = async (index) => {
		const service = services[index]
		if (!service?.id) {
			const next = services.filter((_, i) => i !== index)
			setServices(next)
			saveAllServices(next)
			return
		}

		try {
			await deleteServiceById(service.id)
			const freshServices = getAllServices()
			setServices(freshServices)
			alert("Service deleted successfully.")
		} catch (e) {
			console.error(e)
			alert(e?.message || "Failed to delete service")
		}
	}
	const handleChange = (e) => {
		const { name, value } = e.target
		setDraft((p) => ({ ...p, [name]: value }))
	}
	const handlePriceChange = (value) => {
		setDraft((p) => ({ ...p, price: Number(value) || 0 }))
	}
	const handleFeaturesChange = (value) => {
		const lines = value.split("\n").map((s) => s.trim()).filter(Boolean)
		setDraft((p) => ({ ...p, features: lines }))
	}
	const saveDraft = async () => {
		const sanitized = { ...draft }

		if (isEditing && services[editingIndex]?.id && /^[0-9a-fA-F-]{36}$/.test(services[editingIndex].id)) {
			try {
				await updateServiceById(services[editingIndex].id, sanitized)
				const freshServices = getAllServices()
				setServices(freshServices)
				setEditingIndex(-1)
				setDraft(emptyService)
				alert("Service updated successfully.")
				return
			} catch (e) {
				console.error(e)
				alert(e?.message || "Failed to update service")
				return
			}
		}

		if (!sanitized.id || !/^[0-9a-fA-F-]{36}$/.test(sanitized.id)) {
			delete sanitized.id
		}

		let next
		if (isEditing) {
			next = services.map((s, i) => (i === editingIndex ? sanitized : s))
		} else {
			next = [...services, sanitized]
		}
		setServices(next)
		saveAllServices(next)
		setEditingIndex(-1)
		setDraft(emptyService)
	}
	const resetToDefault = () => {
		resetServicesToDefault()
		const base = getAllServices()
		setServices(base)
		setEditingIndex(-1)
		setDraft(emptyService)
	}

	const publishNow = async () => {
		try {
			await publishAllServices(services)
			alert("Services published successfully.")
		} catch (e) {
			console.error(e)
			alert(e?.message || "Failed to publish services")
		}
	}

	return (
		<div className="p-6">
			<div className="bg-white rounded-lg shadow p-6">
				<div className="flex justify-between items-center mb-6">
					<h2 className="text-2xl font-semibold text-gray-900">Manage Services</h2>
					<div className="space-x-3">
						<button onClick={startAdd} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">Add Service</button>
						<button onClick={resetToDefault} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">Reset to Default</button>
						<button onClick={publishNow} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">Publish</button>
					</div>
				</div>

				{/* Two-column layout: left = list, right = editor */}
				<div className="mb-8">
					<div className="flex gap-5 lg:flex-row flex-col">
						{/* Left: Services List */}
						<div className="w-full lg:w-2/3">
							<table className="w-full text-sm">
								<thead>
									<tr className="text-left border-b">
										<th className="py-3">Title</th>
										<th className="py-3">Type</th>
										<th className="py-3">Price</th>
										<th className="py-3">Actions</th>
									</tr>
								</thead>
								<tbody>
									{services.map((s, i) => (
										<tr key={s.id || i} className="border-b">
											<td className="py-3 pr-2">{s.title}</td>
											<td className="py-3 pr-2">{s.appointmentType}</td>
											<td className="py-3 pr-2">₹{s.price || 0}</td>
											<td className="py-3">
												<button onClick={() => startEdit(i)} className="px-3 py-1 bg-indigo-600 text-white rounded mr-2 hover:bg-indigo-700">Edit</button>
												<button onClick={() => removeAt(i)} className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700">Delete</button>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>

						{/* Right: Editor */}
						<div className="w-full lg:w-1/3">
							{isEditing && (
								<div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-xl transition-all duration-300">
									<div className="flex items-center justify-between mb-2">
										<div className="flex items-center space-x-3">
											<div className="w-16 h-16 bg-primary-100 rounded-lg flex items-center justify-center text-primary-600">
												{React.createElement(
													{ Heart, Stethoscope, Shield, Syringe, Activity, Eye }[draft.icon] || Heart,
													{ className: "w-8 h-8" }
												)}
											</div>
											<h3 className="text-2xl font-semibold text-gray-900">Service</h3>
										</div>
										<div className="flex space-x-3">
											<button onClick={cancelEdit} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">Cancel</button>
											<button onClick={saveDraft} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">Save</button>
										</div>
									</div>

									{/* Icon and Title Row */}
									<div className="flex items-start mb-6">
										<div className="flex-1">
											<input name="title" value={draft.title} onChange={handleChange} className="w-full text-[17px] font-semibold text-gray-900 bg-transparent border-none outline-none" placeholder="Service Title" />
											<input name="appointmentType" value={draft.appointmentType} onChange={handleChange} className="w-full text-sm text-gray-600 bg-transparent border-none outline-none" placeholder="Appointment Type (e.g., speech, articulation)" />
										</div>
									</div>

									{/* Description */}
									<div className="mb-6">
										<textarea name="description" value={draft.description} onChange={handleChange} className="w-full text-gray-600 bg-transparent border-none outline-none resize-none" rows="2" placeholder="Service description" />
									</div>
									<div className="-mb-[9px]" />

									{/* Features Section */}
									<div className="mb-6">
										<h4 className="font-semibold text-gray-900 mb-3">What's Included:</h4>
										<textarea value={(draft.features || []).join("\n")} onChange={(e) => handleFeaturesChange(e.target.value)} className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" rows="4" placeholder="Feature 1&#10;Feature 2&#10;Feature 3" />
									</div>

									{/* Bottom Section with Duration, Price, and Icon Selector */}
									<div className="border-t border-gray-200 pt-4">
										<div className="flex justify-between items-center mb-4">
											<div className="flex items-center text-gray-600"><Clock className="w-4 h-4 mr-2" /><input name="duration" value={draft.duration} onChange={handleChange} className="bg-transparent border-none outline-none text-sm" placeholder="Duration (e.g., 45-60 minutes)" /></div>
											<div className="flex items-center text-gray-600"><DollarSign className="w-4 h-4 mr-2" /><input type="number" value={draft.price || 0} onChange={(e) => handlePriceChange(e.target.value)} className="bg-transparent border-none outline-none text-sm font-medium w-20" placeholder="500" /></div>
										</div>
										<div className="flex items-center space-x-4">
											<span className="text-sm text-gray-600">Icon:</span>
											<select name="icon" value={draft.icon} onChange={handleChange} className="border border-gray-300 rounded px-3 py-1 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
												<option value="Heart">Heart</option>
												<option value="Stethoscope">Stethoscope</option>
												<option value="Shield">Shield</option>
												<option value="Syringe">Syringe</option>
												<option value="Activity">Activity</option>
												<option value="Eye">Eye</option>
											</select>
										</div>
									</div>
								</div>
							)}
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}

export default AdminServices
