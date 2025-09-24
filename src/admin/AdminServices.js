import React, { useEffect, useMemo, useState } from "react"
import {
	getAllServices,
	getAllServicesAsync,
	saveAllServices,
	resetServicesToDefault,
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
} from "lucide-react"

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
	const [draft, setDraft] = useState(emptyService)
	const [isEditorOpen, setIsEditorOpen] = useState(false)
	const [featuresText, setFeaturesText] = useState("")
	const isEditing = useMemo(() => editingIndex >= 0, [editingIndex])

	useEffect(() => {
		let mounted = true
		;(async () => {
			const fresh = await getAllServicesAsync()
			if (mounted) setServices(fresh)
		})()
		return () => {
			mounted = false
		}
	}, [])

	const startAdd = () => {
		setEditingIndex(-1)
		setDraft(emptyService)
		setIsEditorOpen(true)
		setFeaturesText("")
	}
	const startEdit = (index) => {
		setEditingIndex(index)
		setDraft(JSON.parse(JSON.stringify(services[index] || emptyService)))
		setIsEditorOpen(true)
		const ft = (services[index]?.features || []).join("\n")
		setFeaturesText(ft)
	}
	const cancelEdit = () => {
		setEditingIndex(-1)
		setDraft(emptyService)
		setIsEditorOpen(false)
		setFeaturesText("")
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
			const freshServices = await getAllServicesAsync()
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
		setFeaturesText(value)
	}
	const saveDraft = async () => {
		const sanitized = { ...draft }
		// Normalize features from raw multiline text
		const lines = (featuresText || "")
			.split("\n")
			.map((s) => s.trim())
			.filter(Boolean)
		sanitized.features = lines

		if (
			isEditing &&
			services[editingIndex]?.id &&
			/^[0-9a-fA-F-]{36}$/.test(services[editingIndex].id)
		) {
			try {
				await updateServiceById(services[editingIndex].id, sanitized)
				const freshServices = await getAllServicesAsync()
				setServices(freshServices)
				setEditingIndex(-1)
				setDraft(emptyService)
				setIsEditorOpen(false)
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
		setIsEditorOpen(false)
		setFeaturesText("")
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
			const fresh = await getAllServicesAsync()
			setServices(fresh)
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
					<h2 className="text-2xl font-semibold text-gray-900">
						Manage Services
					</h2>
					<div className="space-x-3">
						<button
							onClick={startAdd}
							className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
							Add Service
						</button>
						<button
							onClick={resetToDefault}
							className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
							Reset to Default
						</button>
						<button
							onClick={publishNow}
							className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
							Publish
						</button>
					</div>
				</div>

				{/* Two-column layout: left = list, right = editor */}
				<div className="mb-8">
					<div className="flex gap-5 lg:flex-row flex-col">
						{/* Left: Services List as cards (matching public UI) */}
						<div className="w-full lg:w-2/3">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-5">
								{services.map((s, i) => {
									const iconMap = {
										Heart,
										Stethoscope,
										Shield,
										Syringe,
										Activity,
										Eye,
									}
									const IconComp = iconMap[s.icon] || Heart
									return (
										<div
											key={s.id || i}
											className="card hover:shadow-xl w-[350px] transition-all duration-300">
											<div className="flex items-center justify-between">
												<div className="w-14 h-14 bg-primary-100 rounded-lg flex items-center justify-center text-primary-600 mb-4">
													{IconComp
														? React.createElement(IconComp, {
																className: "w-8 h-8",
														  })
														: null}
												</div>
												<div className="flex space-x-2 self-start">
													<button
														onClick={() => startEdit(i)}
														className="px-3 py-1 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 text-sm">
														Edit
													</button>
													<button
														onClick={() => removeAt(i)}
														className="px-3 py-1 bg-red-600 text-white rounded-2xl hover:bg-red-700 text-sm">
														Delete
													</button>
												</div>
											</div>
											<div className="flex items-start justify-between mb-2">
												<div>
													<h3 className="text-xl font-semibold text-gray-900">
														{s.title}
													</h3>
													<p className="text-sm text-gray-600">
														{s.appointmentType}
													</p>
												</div>
											</div>
											<p className="text-gray-600 mb-3">{s.description}</p>
											<div className="space-y-2 mb-3">
												<h4 className="font-semibold text-gray-900">
													What's Included:
												</h4>
												<ul className="space-y-1">
													{(s.features || []).map((f, idx) => (
														<li key={idx} className="flex items-start">
															<CheckCircle className="w-4 h-4 text-medical-500 mr-2 mt-0.5 flex-shrink-0" />
															<span className="text-gray-600 text-sm">{f}</span>
														</li>
													))}
												</ul>
											</div>
											<div className="border-t border-gray-200 pt-3 flex items-center justify-between text-gray-600">
												<div className="flex items-center text-sm">
													<Clock className="w-4 h-4 mr-2" />
													{s.duration}
												</div>
												<div className="flex items-center text-sm font-medium">
													<span className="">₹</span>
													{Number(s.price || 0).toLocaleString()}
												</div>
											</div>
										</div>
									)
								})}
							</div>
						</div>

						{/* Right: Editor */}
						<div className="w-full lg:w-1/3">
							{isEditorOpen && (
								<div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-xl transition-all duration-300">
									<div className="flex items-center justify-between mb-2">
										<div className="flex items-center space-x-3">
											<div className="w-16 h-16 bg-primary-100 rounded-lg flex items-center justify-center text-primary-600">
												{React.createElement(
													{
														Heart,
														Stethoscope,
														Shield,
														Syringe,
														Activity,
														Eye,
													}[draft.icon] || Heart,
													{ className: "w-8 h-8" }
												)}
											</div>
										</div>
									</div>

									{/* Icon and Title Row */}
									<div className="flex items-start mb-6">
										<div className="flex-1">
											<input
												name="title"
												value={draft.title}
												onChange={handleChange}
												className="w-full text-[17px] font-semibold text-gray-900 bg-transparent border-none outline-none"
												placeholder="Service Title"
											/>
											<input
												name="appointmentType"
												value={draft.appointmentType}
												onChange={handleChange}
												className="w-full text-sm text-gray-600 bg-transparent border-none outline-none"
												placeholder="Appointment Type (e.g., speech, articulation)"
											/>
										</div>
									</div>

									{/* Description */}
									<div className="mb-6">
										<textarea
											name="description"
											value={draft.description}
											onChange={handleChange}
											className="w-full text-gray-600 bg-transparent border-none outline-none resize-none"
											rows="2"
											placeholder="Service description"
										/>
									</div>
									<div className="-mb-[9px]" />

									{/* Features Section */}
									<div className="mb-6">
										<h4 className="font-semibold text-gray-900 mb-3">
											What's Included:
										</h4>
										<textarea
											value={featuresText}
											onChange={(e) => handleFeaturesChange(e.target.value)}
											className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
											rows="4"
											placeholder="Feature 1&#10;Feature 2&#10;Feature 3"
										/>
									</div>

									{/* Bottom Section with Duration, Price, and Icon Selector */}
									<div className="border-t border-gray-200 pt-4">
										<div className="flex justify-between items-center mb-4">
											<div className="flex items-center text-gray-600">
												<Clock className="w-4 h-4 mr-2" />
												<input
													name="duration"
													value={draft.duration}
													onChange={handleChange}
													className="bg-transparent border-none outline-none text-sm"
													placeholder="Duration (e.g., 45-60 minutes)"
												/>
											</div>
											<div className="flex items-center text-gray-600">
												<input
													type="number"
													value={draft.price || ""}
													onChange={(e) => handlePriceChange(e.target.value)}
													className="bg-transparent border-none outline-none text-sm font-medium w-20"
													placeholder={String(pricePlaceholder)}
												/>
											</div>
										</div>
										<div className="flex items-center justify-between space-x-4">
											<div>
												<span className="text-sm mr-1 text-gray-600">
													Icon:
												</span>
												<select
													name="icon"
													value={draft.icon}
													onChange={handleChange}
													className="border border-gray-300 rounded px-3 py-1 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
													<option value="Heart">Heart</option>
													<option value="Stethoscope">Stethoscope</option>
													<option value="Shield">Shield</option>
													<option value="Syringe">Syringe</option>
													<option value="Activity">Activity</option>
													<option value="Eye">Eye</option>
												</select>
											</div>
											<div className="flex space-x-3">
												<button
													onClick={cancelEdit}
													className="px-1 py-0.5 text-sm bg-gray-100 text-gray-700 rounded-3xl hover:bg-gray-200 transition-colors">
													Cancel
												</button>
												<button
													onClick={saveDraft}
													className="px-1 py-0 text-sm bg-green-600 text-white rounded-3xl hover:bg-green-700 transition-colors">
													Save
												</button>
											</div>
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
