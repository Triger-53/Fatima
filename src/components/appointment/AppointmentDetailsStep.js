import React from 'react';
import { motion } from 'framer-motion';
import { MEDICAL_CENTERS } from '../../data/appointmentData';

const AppointmentDetailsStep = ({
  formData,
  handleChange,
  appointmentTypes,
  selectedService,
  availableDates,
  loadingSlots,
  availableSlots,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6">
      <h3 className="text-2xl font-semibold text-gray-900 mb-6">
        Appointment Details
      </h3>

      {/* Service Selection */}
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

        {/* Show selected service details */}
        {selectedService && (
          <div className="mt-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="font-semibold text-blue-900">{selectedService.title}</h4>
                <p className="text-sm text-blue-700">{selectedService.description}</p>
                <p className="text-sm text-blue-600">Duration: {selectedService.duration}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-blue-900">
                  ₹{selectedService.price?.inr?.min || selectedService.price?.min || 500}
                </p>
                <p className="text-sm text-blue-600">per session</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Consultation Method Selection */}
        <div>
        <label className="block text-gray-700 mb-3">Consultation Method</label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className={`cursor-pointer p-4 border-2 rounded-lg transition-all ${
            formData.consultationMethod === 'online'
              ? 'border-primary-500 bg-primary-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}>
          <input
              type="radio"
              name="consultationMethod"
              value="online"
              checked={formData.consultationMethod === 'online'}
              onChange={handleChange}
              className="sr-only"
            />
            <div className="text-center">
              <div className="text-2xl mb-2">💻</div>
              <div className="font-semibold text-gray-900">Online Consultation</div>
              <div className="text-sm text-gray-600">Video call via Zoom</div>
            </div>
          </label>

          <label className={`cursor-pointer p-4 border-2 rounded-lg transition-all ${
            formData.consultationMethod === 'offline'
              ? 'border-primary-500 bg-primary-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}>
            <input
              type="radio"
              name="consultationMethod"
              value="offline"
              checked={formData.consultationMethod === 'offline'}
              onChange={handleChange}
              className="sr-only"
            />
            <div className="text-center">
              <div className="text-2xl mb-2">🏥</div>
              <div className="font-semibold text-gray-900">In-Person Visit</div>
              <div className="text-sm text-gray-600">Visit at medical center</div>
            </div>
          </label>
        </div>
      </div>

      {/* Medical Center Selection (only for offline appointments) */}
      {formData.consultationMethod === 'offline' && (
        <div className="mt-6">
          <label className="block text-gray-700 mb-4 font-medium text-lg">🏥 Select Medical Center</label>
          <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
            {Object.values(MEDICAL_CENTERS).map((center) => (
              <label key={center.id} className={`cursor-pointer group relative overflow-hidden rounded-2xl border-2 transition-all duration-300 hover:shadow-lg ${
                formData.medicalCenter === center.id
                  ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-lg ring-2 ring-blue-200'
                  : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50'
              }`}>
                <input
                  type="radio"
                  name="medicalCenter"
                  value={center.id}
                  checked={formData.medicalCenter === center.id}
                  onChange={handleChange}
                  className="sr-only"
                />
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <div className="w-3 h-3 rounded-full border-2 mr-3 flex-shrink-0 ${
                          formData.medicalCenter === center.id
                            ? 'border-blue-500 bg-blue-500'
                            : 'border-gray-300 group-hover:border-blue-400'
                        }"></div>
                        <h3 className="font-bold text-gray-900 text-lg">{center.name}</h3>
                      </div>
                      <div className="ml-6 space-y-2">
                        <div className="flex items-start text-sm text-gray-600">
                          <svg className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span className="leading-relaxed">{center.address}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                          <span>{center.phone}</span>
                        </div>
                      </div>
                    </div>
                    {formData.medicalCenter === center.id && (
                      <div className="ml-4 flex-shrink-0">
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </label>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-3 flex items-center">
            <span className="mr-1">🏥</span>
            Choose the medical center where you'd like to have your in-person appointment
          </p>
        </div>
      )}

      {/* Date Selection */}
      <div>
        <label className="block text-gray-700 mb-2 font-medium">Preferred Date</label>
        <div className="relative">
          <select
            name="preferredDate"
            value={formData.preferredDate}
            onChange={handleChange}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white shadow-sm hover:border-gray-300 appearance-none cursor-pointer"
            required>
            <option value="">📅 Select your preferred date</option>
            {availableDates.map((date) => (
              <option key={date} value={date}>
                {new Date(date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-1 flex items-center">
          <span className="mr-1">📅</span>
          Available dates for the next 30 days
        </p>
      </div>

      {/* Time Selection */}
      <div>
        <label className="block text-gray-700 mb-2 font-medium">Preferred Time</label>
        {loadingSlots ? (
          <div className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 flex items-center justify-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-3"></div>
            <span className="text-blue-700 font-medium">Loading available slots...</span>
          </div>
        ) : availableSlots.length > 0 ? (
          <div className="relative">
            <select
              name="preferredTime"
              value={formData.preferredTime}
              onChange={handleChange}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white shadow-sm hover:border-gray-300 appearance-none cursor-pointer"
              required>
              <option value="">🕐 Select your preferred time</option>
              {availableSlots.map((time) => (
                <option key={time} value={time}>
                  🕐 {time}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        ) : formData.consultationMethod && formData.preferredDate ? (
          <div className="w-full px-4 py-3 border-2 border-red-200 rounded-xl bg-red-50 text-red-700 flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            No available slots for this date and consultation method. Please select a different date.
          </div>
        ) : (
          <div className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-50 text-gray-500 flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Please select consultation method and date first
          </div>
        )}
        <p className="text-xs text-gray-500 mt-1 flex items-center">
          <span className="mr-1">🕐</span>
          {formData.consultationMethod === 'online'
            ? 'Available time slots for online consultation'
            : formData.medicalCenter
              ? `Available time slots at ${MEDICAL_CENTERS[formData.medicalCenter]?.name}`
              : 'Select a medical center to see available slots'
          }
        </p>
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
  );
};

export default AppointmentDetailsStep;