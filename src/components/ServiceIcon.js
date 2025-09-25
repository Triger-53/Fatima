import React from 'react';
import { Stethoscope, Shield, Heart } from 'lucide-react';

const ServiceIcon = ({ icon }) => {
  const icons = {
    Stethoscope: (
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="40" height="40" rx="10" fill="#E0EFFE"/>
        <Stethoscope stroke="#3A7AD6" size={24} style={{ transform: 'translate(8px, 8px)' }} />
      </svg>
    ),
    Shield: (
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="40" height="40" rx="10" fill="#E0EFFE"/>
        <Shield stroke="#3A7AD6" size={24} style={{ transform: 'translate(8px, 8px)' }} />
      </svg>
    ),
    Heart: (
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="40" height="40" rx="10" fill="#E0EFFE"/>
        <Heart stroke="#3A7AD6" size={24} style={{ transform: 'translate(8px, 8px)' }} />
      </svg>
    ),
  };

  return icons[icon] || icons['Stethoscope'];
};

export default ServiceIcon;