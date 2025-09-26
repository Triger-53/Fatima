import React, { useEffect, useMemo, useState } from "react"
import {
	getAllServicesAsync,
	saveAllServices,
	publishAllServices,
	deleteServiceById,
	updateServiceById,
} from "../data/services"
import {
	Heart,
	Stethoscope,
	Shield,
	Syringe,
	Activity,
	Eye,
	Clock,
	CheckCircle,
	PlusCircle,
} from "lucide-react"
import ServiceDetails from "../components/ServiceDetails"

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

const pricePlaceholder = 0

const AdminServices = () => {
	const [services, setServices] = useState([])
	const [editingIndex, setEditingIndex] = useState(-1)
	const [viewingService, setViewingService] = useState(null)
	const [draft, setDraft] = useState(emptyService)
	const [featuresText, setFeaturesText] = useState("")
	const isEditing = useMemo(() => editingIndex >= 0, [editingIndex])

	useEffect(() => {
		let mounted = true
		;(async () => {
			const fresh = await getAllServicesAsync()
			if (mounted) {
				setServices(fresh)
				// Start with the editor in "add new" mode
				startAdd()
			}
		})()
		return () => {
			mounted = false
		}
	}, [])

	const startAdd = () => {
		setEditingIndex(-1)
		setDraft(emptyService)
		setFeaturesText("")
	}

	const startEdit = (index) => {
		setEditingIndex(index)
		const serviceToEdit = services[index]
		setDraft(JSON.parse(JSON.stringify(serviceToEdit || emptyService)))
		setFeaturesText((serviceToEdit?.features || []).join("\n"))
	}

	const cancelEdit = () => {
		// "Cancel" now resets the form to "add new" mode
		startAdd()
	}

	const removeAt = async (index) => {
		const service = services[index]
		if (window.confirm(`Are you sure you want to delete "${service.title}"?`)) {
			try {
				await deleteServiceById(service.id)
				const freshServices = await getAllServicesAsync()
				setServices(freshServices)
				startAdd() // Reset form to "add new"
				alert("Service deleted successfully. Remember to publish your changes.")
			} catch (e) {
				console.error(e)
				alert(e?.message || "Failed to delete service")
			}
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
		setFeaturesText(value)
	}

	const saveDraft = async () => {
		const sanitized = { ...draft }
		sanitized.features = (featuresText || "")
			.split("\n")
			.map((s) => s.trim())
			.filter(Boolean)

		try {
			if (isEditing) {
				await updateServiceById(services[editingIndex].id, sanitized)
				alert("Service updated. Press 'Publish' to deploy your changes.")
			} else {
				// Create a temporary local ID for the new service
				const newService = { ...sanitized, id: `local-${Date.now()}` }
				const nextServices = [...services, newService]
				setServices(nextServices)
				saveAllServices(nextServices)
				alert("New service added. Press 'Publish' to deploy your changes.")
				startAdd()
				return
			}

			const freshServices = await getAllServicesAsync()
			setServices(freshServices)
			// Keep the editor open with the updated data
			if (isEditing) {
				setDraft(JSON.parse(JSON.stringify(freshServices[editingIndex] || emptyService)))
			}
		} catch (e) {
			console.error(e)
			alert(e?.message || "Failed to save service")
		}
	}

	const publishNow = async () => {
		try {
			await publishAllServices(services)
			const fresh = await getAllServicesAsync()
			setServices(fresh)
			alert("Services published successfully.")
		} catch (e) {
			console.error(e)
			alert(e?.message || "Failed to publish services")
		}
	}

	const iconMap = { Heart, Stethoscope, Shield, Syringe, Activity, Eye }

	return (
		<div className="p-6 bg-gray-50 min-h-full">
			<div className="bg-white rounded-lg shadow-md p-6">
				<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
					<h2 className="text-2xl font-semibold text-gray-900 mb-4 sm:mb-0">
						Manage Services
					</h2>
					<div className="flex flex-wrap gap-3">
						<button
							onClick={publishNow}
							className="btn-primary bg-green-600 hover:bg-green-700">
							Publish Changes
						</button>
					</div>
				</div>

				<div className="flex gap-8 lg:flex-row flex-col">
					{/* Left: Services List */}
					<div className="w-full lg:w-7/12">
						<div className="space-y-4 h-[70vh] overflow-y-auto pr-4 -mr-4">
							{services.map((s, i) => {
								const IconComp = iconMap[s.icon] || Heart
								const isActive = i === editingIndex
								return (
									<div
										key={s.id || i}
										className={`card transition-all duration-300 w-full ${
											isActive
												? "border-2 border-primary-500 shadow-lg"
												: "hover:shadow-xl hover:-translate-y-1"
										}`}
										onClick={() => startEdit(i)}>
										<div className="flex items-start justify-between">
											<div className="w-14 h-14 bg-primary-100 rounded-lg flex items-center justify-center text-primary-600 mb-4">
												<IconComp className="w-8 h-8" />
											</div>
											<div className="flex space-x-2 self-start">
												<button
													onClick={(e) => {
														e.stopPropagation()
														setViewingService(s)
													}}
													className="px-3 py-1 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 text-sm">
													View
												</button>
												<button
													onClick={(e) => {
														e.stopPropagation()
														startEdit(i)
													}}
													className="px-3 py-1 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 text-sm">
													Edit
												</button>
												<button
													onClick={(e) => {
														e.stopPropagation()
														removeAt(i)
													}}
													className="px-3 py-1 bg-red-600 text-white rounded-2xl hover:bg-red-700 text-sm">
													Delete
												</button>
											</div>
										</div>
										<h3 className="text-xl font-semibold text-gray-900">
											{s.title}
										</h3>
										<p className="text-sm text-gray-600 mb-3">
											{s.appointmentType}
										</p>
										<p className="text-gray-600 mb-4">{s.description}</p>
										<div className="border-t border-gray-200 pt-3 flex items-center justify-between">
											<div className="flex items-center text-sm text-blue-600">
												<Clock className="w-4 h-4 mr-2" />
												<span className="font-semibold">{s.duration}</span>
											</div>
											<div className="flex items-center text-sm font-medium text-gray-600">
												<span>₹</span>
												{Number(s.price || 0).toLocaleString()}
											</div>
										</div>
									</div>
								)
							})}
						</div>
					</div>

					{/* Right: Editor */}
					<div className="w-full lg:w-5/12">
						<div className="sticky top-24 bg-white border border-gray-200 rounded-lg p-6 shadow-lg">
							<div className="flex items-center justify-between mb-4">
								<h3 className="text-2xl font-bold text-gray-900">
									{isEditing ? "Edit Service" : "Add New Service"}
								</h3>
								{!isEditing && (
									<button
										onClick={startAdd}
										className="text-sm text-primary-600 hover:text-primary-800 flex items-center">
										<PlusCircle className="w-4 h-4 mr-1" />
										New Service
									</button>
								)}
							</div>

							{/* Form Fields */}
							<div className="space-y-4">
								<input
									name="title"
									value={draft.title}
									onChange={handleChange}
									className="form-input"
									placeholder="Service Title"
								/>
								<input
									name="appointmentType"
									value={draft.appointmentType}
									onChange={handleChange}
									className="form-input"
									placeholder="Appointment Type (e.g., speech, articulation)"
								/>
								<textarea
									name="description"
									value={draft.description}
									onChange={handleChange}
									className="form-input"
									rows="3"
									placeholder="Service description"
								/>
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-1">
										What's Included (one feature per line):
									</label>
									<textarea
										value={featuresText}
										onChange={(e) => handleFeaturesChange(e.target.value)}
										className="form-input"
										rows="4"
										placeholder="Feature 1&#10;Feature 2&#10;Feature 3"
									/>
								</div>
								<div className="flex gap-4">
									<input
										name="duration"
										value={draft.duration}
										onChange={handleChange}
										className="form-input"
										placeholder="Duration (e.g., 45-60 min)"
									/>
									<input
										type="number"
										value={draft.price || ""}
										onChange={(e) => handlePriceChange(e.target.value)}
										className="form-input"
										placeholder={`Price (e.g., ${pricePlaceholder})`}
									/>
								</div>
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-1">
										Icon:
									</label>
									<select
										name="icon"
										value={draft.icon}
										onChange={handleChange}
										className="form-input">
										{Object.keys(iconMap).map((iconName) => (
											<option key={iconName} value={iconName}>
												{iconName}
											</option>
										))}
									</select>
								</div>
							</div>

							{/* Action Buttons */}
							<div className="border-t border-gray-200 mt-6 pt-4 flex justify-end space-x-3">
								{isEditing && (
									<button onClick={cancelEdit} className="btn-secondary">
										Cancel
									</button>
								)}
								<button
									onClick={saveDraft}
									className="btn-primary">
									{isEditing ? "Save Changes" : "Add Service"}
								</button>
							</div>
						</div>
					</div>
				</div>
			</div>
			<ServiceDetails
				service={viewingService}
				onClose={() => setViewingService(null)}
			/>
		</div>
	)
}

export default AdminServices