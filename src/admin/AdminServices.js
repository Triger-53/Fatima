import React, { useMemo, useState } from "react"
import { getAllServices, saveAllServices, resetServicesToDefault } from "../utils/servicesProvider"

const emptyService = {
	id: "",
	title: "",
	description: "",
	features: [],
	duration: "", 
	price: { min: 0, max: 0, currency: "USD", inr: { min: 0, max: 0 } },
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
	const removeAt = (index) => {
		const next = services.filter((_, i) => i !== index)
		setServices(next)
		saveAllServices(next)
	}
	const handleChange = (e) => {
		const { name, value } = e.target
		setDraft((p) => ({ ...p, [name]: value }))
	}
	const handlePriceChange = (currency, field, value) => {
		setDraft((p) => ({
			...p,
			price: {
				...p.price,
				[currency]: {
					...p.price?.[currency],
					[field]: Number(value) || 0,
				},
			},
		}))
	}
	const handleFeaturesChange = (value) => {
		const lines = value.split("\n").map((s) => s.trim()).filter(Boolean)
		setDraft((p) => ({ ...p, features: lines }))
	}
	const saveDraft = () => {
		const sanitized = { ...draft }
		if (!sanitized.id) sanitized.id = sanitized.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
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

	return (
		<div className="">
			<div className="bg-white rounded-lg shadow p-4">
				<div className="flex justify-between items-center mb-4">
					<h2 className="text-xl font-semibold">Manage Services</h2>
					<div className="space-x-2">
						<button onClick={startAdd} className="px-3 py-2 bg-blue-600 text-white rounded">Add Service</button>
						<button onClick={resetToDefault} className="px-3 py-2 bg-gray-100 rounded">Reset to Default</button>
					</div>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
					<div className="md:col-span-2">
						<table className="w-full text-sm">
							<thead>
								<tr className="text-left border-b">
									<th className="py-2">Title</th>
									<th className="py-2">Type</th>
									<th className="py-2">INR</th>
									<th className="py-2">Actions</th>
								</tr>
							</thead>
							<tbody>
								{services.map((s, i) => (
									<tr key={s.id || i} className="border-b">
										<td className="py-2 pr-2">{s.title}</td>
										<td className="py-2 pr-2">{s.appointmentType}</td>
										<td className="py-2 pr-2">₹{(s.price?.inr?.min || s.price?.min || 0)} - ₹{(s.price?.inr?.max || s.price?.max || 0)}</td>
										<td className="py-2">
											<button onClick={() => startEdit(i)} className="px-2 py-1 bg-indigo-600 text-white rounded mr-2">Edit</button>
											<button onClick={() => removeAt(i)} className="px-2 py-1 bg-red-600 text-white rounded">Delete</button>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>

					<div className="md:col-span-1">
						<div className="border rounded p-3">
							<h3 className="font-semibold mb-3">{isEditing ? "Edit" : "Add"} Service</h3>
							<label className="block text-sm">Title</label>
							<input name="title" value={draft.title} onChange={handleChange} className="w-full border rounded p-2 mb-2" />
							<label className="block text-sm">Appointment Type (key)</label>
							<input name="appointmentType" value={draft.appointmentType} onChange={handleChange} className="w-full border rounded p-2 mb-2" />
							<label className="block text-sm">Icon (Heart, Stethoscope, Shield, Syringe, Activity, Eye)</label>
							<input name="icon" value={draft.icon} onChange={handleChange} className="w-full border rounded p-2 mb-2" />
							<label className="block text-sm">Duration</label>
							<input name="duration" value={draft.duration} onChange={handleChange} className="w-full border rounded p-2 mb-2" />
							<label className="block text-sm">Description</label>
							<textarea name="description" value={draft.description} onChange={handleChange} className="w-full border rounded p-2 mb-2" rows="3" />
							<label className="block text-sm">Features (one per line)</label>
							<textarea value={(draft.features || []).join("\n")} onChange={(e) => handleFeaturesChange(e.target.value)} className="w-full border rounded p-2 mb-2" rows="4" />
							<div className="grid grid-cols-2 gap-2">
								<div>
									<label className="block text-sm">INR Min</label>
									<input type="number" value={draft.price?.inr?.min || 0} onChange={(e) => handlePriceChange("inr", "min", e.target.value)} className="w-full border rounded p-2 mb-2" />
								</div>
								<div>
									<label className="block text-sm">INR Max</label>
									<input type="number" value={draft.price?.inr?.max || 0} onChange={(e) => handlePriceChange("inr", "max", e.target.value)} className="w-full border rounded p-2 mb-2" />
								</div>
							</div>
							<div className="flex justify-end space-x-2 mt-2">
								<button onClick={cancelEdit} className="px-3 py-2 bg-gray-100 rounded">Cancel</button>
								<button onClick={saveDraft} className="px-3 py-2 bg-green-600 text-white rounded">Save</button>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}

export default AdminServices
