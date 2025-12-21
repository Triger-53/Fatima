import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';

const SuccessScreen = ({ formData, confirmationData, signupEmail, loginEmail }) => {
  const appt = confirmationData?.appointment;
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="py-8 sm:py-12">
      <div className="text-center px-2">
        <CheckCircle className="w-16 h-16 sm:w-20 sm:h-20 text-green-500 mx-auto mb-4 sm:mb-6" />
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">
          Appointment Confirmed! 🎉
        </h2>
        <p className="text-lg sm:text-xl text-gray-600 mb-6">
          Thank you, {formData.firstName}! Your appointment has been
          successfully booked.
        </p>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4 max-w-md mx-auto mb-6">
          <p className="text-xs sm:text-sm text-blue-700">
            ✅ Your appointment details are shown below. Please take a screenshot for your records. You can also view your appointment history in your account dashboard.
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <div className="bg-white rounded-lg shadow p-4 sm:p-6">
          <h4 className="font-semibold mb-4 text-lg">Appointment Details</h4>
          <div className="space-y-2 text-sm text-gray-700">
            <p>
              <strong>Booking ID:</strong> {appt?.id || "—"}
            </p>
            <p>
              <strong>Name:</strong> {appt?.firstName} {appt?.lastName}
            </p>
            <p>
              <strong>Email:</strong> {appt?.email}
            </p>
            <p>
              <strong>Phone:</strong> {appt?.phone}
            </p>
            <p>
              <strong>Type:</strong> {appt?.appointmentType}
            </p>
            <p>
              <strong>Date:</strong> {appt?.preferredDate}
            </p>
            <p>
              <strong>Time:</strong> {appt?.preferredTime}
            </p>
            <p>
              <strong>Payment ID:</strong> {appt?.paymentId}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4 sm:p-6">
          <h4 className="font-semibold mb-4 text-lg">Account</h4>
          <div className="space-y-2 text-sm text-gray-700">
            <p>
              <strong>Email:</strong>{" "}
              {signupEmail || loginEmail || formData.email}
            </p>
            <p className="text-sm text-gray-600">
              You can log in to view your appointments (if not already signed
              in).
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default SuccessScreen;