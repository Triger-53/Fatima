import React, { useState, useEffect } from 'react';

const EditProfileModal = ({ profile, onClose, onSave, isSaving }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    allergies: '',
    medicalHistory: '',
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        phone: profile.phone || '',
        dateOfBirth: profile.dateOfBirth || '',
        gender: profile.gender || '',
        allergies: profile.allergies || '',
        medicalHistory: profile.medicalHistory || '',
      });
    }
  }, [profile]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isSaving) return;
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 transition-opacity duration-300">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-3xl w-full m-4 transform transition-all duration-300 scale-95 hover:scale-100">
        <div className="flex justify-between items-center mb-6 border-b pb-4">
          <h2 className="text-3xl font-bold text-gray-800">Edit Profile</h2>
          <button onClick={onClose} disabled={isSaving} className="text-gray-500 hover:text-gray-800 text-3xl disabled:opacity-50">&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 max-h-[70vh] overflow-y-auto pr-4">
          <fieldset disabled={isSaving}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField label="First Name" name="firstName" value={formData.firstName} onChange={handleChange} />
              <InputField label="Last Name" name="lastName" value={formData.lastName} onChange={handleChange} />
            </div>

            <InputField label="Phone Number" name="phone" type="tel" value={formData.phone} onChange={handleChange} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <InputField label="Date of Birth" name="dateOfBirth" type="date" value={formData.dateOfBirth} onChange={handleChange} />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-shadow disabled:bg-gray-100"
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                  <option value="prefer_not_to_say">Prefer not to say</option>
                </select>
              </div>
            </div>

            <div className="mt-6">
              <TextAreaField label="Allergies" name="allergies" value={formData.allergies} onChange={handleChange} placeholder="e.g., Peanuts, Penicillin" />
            </div>
            <div className="mt-6">
              <TextAreaField label="Past Medical History" name="medicalHistory" value={formData.medicalHistory} onChange={handleChange} placeholder="e.g., Asthma, Hypertension" />
            </div>
          </fieldset>

          <div className="flex justify-end gap-4 pt-6 border-t mt-8">
            <button type="button" onClick={onClose} disabled={isSaving} className="px-6 py-2.5 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition-colors disabled:opacity-50">Cancel</button>
            <button type="submit" disabled={isSaving} className="px-6 py-2.5 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors shadow-md flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed">
              {isSaving && <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>}
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const InputField = ({ label, name, type = 'text', value, onChange }) => (
  <div>
    <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <input
      type={type}
      id={name}
      name={name}
      value={value}
      onChange={onChange}
      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-shadow disabled:bg-gray-100"
    />
  </div>
);

const TextAreaField = ({ label, name, value, onChange, placeholder }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <textarea
            id={name}
            name={name}
            value={value}
            onChange={onChange}
            rows="4"
            placeholder={placeholder}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-shadow disabled:bg-gray-100"
        />
    </div>
);

export default EditProfileModal;