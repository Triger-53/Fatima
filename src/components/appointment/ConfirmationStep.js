import React from 'react';
import { motion } from 'framer-motion';
import { MEDICAL_CENTERS } from '../../data/appointmentData';

const ConfirmationStep = ({ formData, selectedService }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6">
      <h3 className="text-2xl font-semibold text-gray-900 mb-6">
        Confirm Your Appointment
      </h3>

      {/* Selected Service Information */}
      {selectedService && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
          <h4 className="text-lg font-semibold text-blue-900 mb-3">Selected Service</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p><strong>Service:</strong> {selectedService.title}</p>
              <p><strong>Price:</strong> ₹{selectedService.price?.inr?.min || selectedService.price?.min || 500}</p>
            </div>
            <div>
              <p><strong>Duration:</strong> {selectedService.duration || '45-60 minutes'}</p>
              <p><strong>Type:</strong> {formData.appointmentType}</p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white shadow rounded-lg p-6 space-y-4">
        <p>
          <strong>Name:</strong> {formData.firstName} {formData.lastName}
        </p>
        <p>
          <strong>Email:</strong> {formData.email}
        </p>
        <p>
          <strong>Phone:</strong> {formData.phone}
        </p>
        <p>
          <strong>Date of Birth:</strong> {formData.dateOfBirth}
        </p>
        <p>
          <strong>Gender:</strong> {formData.gender}
        </p>
        <p>
          <strong>Service:</strong> {selectedService?.title || formData.appointmentType}
        </p>
        {selectedService && (
          <p>
            <strong>Price:</strong> ₹{selectedService.price?.inr?.min || selectedService.price?.min || 500}
          </p>
        )}
        <p>
          <strong>Consultation Method:</strong> {formData.consultationMethod === 'online' ? '💻 Online Consultation' : '🏥 In-Person Visit'}
        </p>
        {formData.consultationMethod === 'offline' && formData.medicalCenter && (
          <p>
            <strong>Medical Center:</strong> {MEDICAL_CENTERS[formData.medicalCenter]?.name}
          </p>
        )}
        <p>
          <strong>Date:</strong> {new Date(formData.preferredDate).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </p>
        <p>
          <strong>Time:</strong> {formData.preferredTime}
        </p>
        <p>
          <strong>Reason:</strong> {formData.reason}
        </p>
        <p>
          <strong>Symptoms:</strong> {formData.symptoms}
        </p>
        <p>
          <strong>New Patient:</strong> {formData.isNewPatient}
        </p>
        <p>
          <strong>Medications:</strong> {formData.currentMedications}
        </p>
        <p>
          <strong>Allergies:</strong> {formData.allergies}
        </p>
        <p>
          <strong>Medical History:</strong> {formData.medicalHistory}
        </p>
      </div>
    </motion.div>
  );
};

export default ConfirmationStep;