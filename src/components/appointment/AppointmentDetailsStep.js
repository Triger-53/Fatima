import React from 'react';
import { motion } from 'framer-motion';
import { getServicePrice } from '../../data/services';

const AppointmentDetailsStep = ({
  formData,
  handleChange,
  appointmentTypes,
  selectedService,
  availableDates,
  medicalCenters,
  loadingSlots,
  availableSlots,
  bookingRange,
}) => {
  // Helper to find medical center name by ID from the dynamic list
  const getMedicalCenterName = (id) => {
    return medicalCenters.find(c => String(c.id) === String(id))?.name || 'Medical Center';
  };

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
                  ₹{getServicePrice(selectedService)}
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
          <label className={`cursor-pointer p-4 border-2 rounded-lg transition-all ${formData.consultationMethod === 'online'
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

          <label className={`cursor-pointer p-4 border-2 rounded-lg transition-all ${formData.consultationMethod === 'offline'
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
            {medicalCenters.map((center) => (
              <label key={center.id} className={`cursor-pointer group relative overflow-hidden rounded-2xl border-2 transition-all duration-300 hover:shadow-lg ${String(formData.medicalCenter) === String(center.id)
                ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-lg ring-2 ring-blue-200'
                : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50'
                }`}>
                <input
                  type="radio"
                  name="medicalCenter"
                  value={center.id}
                  checked={String(formData.medicalCenter) === String(center.id)}
                  onChange={handleChange}
                  className="sr-only"
                />
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <div className={`w-3 h-3 rounded-full border-2 mr-3 flex-shrink-0 ${String(formData.medicalCenter) === String(center.id)
                          ? 'border-blue-500 bg-blue-500'
                          : 'border-gray-300 group-hover:border-blue-400'
                          }`}></div>
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
                    {String(formData.medicalCenter) === String(center.id) && (
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
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="block text-gray-700 font-medium text-lg flex items-center">
            <span className="mr-2">📅</span> Select Preferred Date
          </label>
          <span className="text-xs font-medium px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
            Next {bookingRange || 30} Days
          </span>
        </div>

        <div className="relative group">
          <div className="flex overflow-x-auto pb-4 gap-3 scrollbar-hide snap-x">
            {availableDates.map((date) => {
              const dateObj = new Date(date);
              const isSelected = formData.preferredDate === date;

              return (
                <button
                  key={date}
                  type="button"
                  onClick={() => handleChange({ target: { name: 'preferredDate', value: date } })}
                  className={`flex-shrink-0 w-24 h-28 rounded-2xl border-2 transition-all duration-300 snap-start flex flex-col items-center justify-center space-y-1 ${isSelected
                    ? 'border-blue-500 bg-blue-500 text-white shadow-lg scale-105'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-blue-300 hover:bg-blue-50'
                    }`}>
                  <span className={`text-xs font-bold uppercase ${isSelected ? 'text-blue-100' : 'text-gray-400'}`}>
                    {dateObj.toLocaleDateString('en-US', { weekday: 'short' })}
                  </span>
                  <span className="text-2xl font-black">
                    {dateObj.getDate()}
                  </span>
                  <span className={`text-xs font-medium ${isSelected ? 'text-blue-100' : 'text-gray-500'}`}>
                    {dateObj.toLocaleDateString('en-US', { month: 'short' })}
                  </span>
                  {/* Removed today indicator */}
                </button>
              );
            })}
          </div>
          {/* Subtle gradient edges for scroll indicators */}
          <div className="absolute left-0 top-0 bottom-4 w-8 bg-gradient-to-r from-gray-50/50 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="absolute right-0 top-0 bottom-4 w-8 bg-gradient-to-l from-gray-50/50 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"></div>
        </div>
      </div>

      {/* Time Selection */}
      <div className="space-y-4">
        <label className="block text-gray-700 font-medium text-lg flex items-center">
          <span className="mr-2">🕐</span> Select Reference Time
        </label>

        {loadingSlots ? (
          <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse bg-gray-100 h-14 rounded-xl"></div>
            ))}
          </div>
        ) : availableSlots.length > 0 ? (
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {availableSlots.map((time) => {
              const isSelected = formData.preferredTime === time;
              return (
                <button
                  key={time}
                  type="button"
                  onClick={() => handleChange({ target: { name: 'preferredTime', value: time } })}
                  className={`py-3 px-2 rounded-xl text-sm font-semibold border-2 transition-all duration-200 text-center ${isSelected
                    ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-md ring-2 ring-blue-100 scale-105'
                    : 'border-gray-100 bg-white text-gray-600 hover:border-blue-200 hover:bg-blue-50'
                    }`}>
                  {time}
                </button>
              );
            })}
          </div>
        ) : formData.consultationMethod && formData.preferredDate ? (
          <div className="p-8 text-center rounded-2xl border-2 border-dashed border-red-200 bg-red-50">
            <div className="text-3xl mb-2">😭</div>
            <p className="text-red-800 font-semibold">No slots available</p>
            <p className="text-red-600 text-sm mt-1">Please try selecting another date or consultation method</p>
          </div>
        ) : (
          <div className="p-8 text-center rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50">
            <div className="text-3xl mb-2">🗓️</div>
            <p className="text-gray-500 font-medium">Select a date first</p>
            <p className="text-gray-400 text-xs mt-1">Available slots will appear here</p>
          </div>
        )}

        {availableSlots.length > 0 && (
          <p className="text-xs text-center text-gray-400 mt-2 italic font-medium">
            {formData.consultationMethod === 'online'
              ? '✨ Virtual session via Secure Video'
              : `📍 In-person visit at ${getMedicalCenterName(formData.medicalCenter)}`
            }
          </p>
        )}
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