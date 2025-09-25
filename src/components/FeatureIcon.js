import React from 'react';
import { Heart, Clock, Shield } from 'lucide-react';

const FeatureIcon = ({ icon }) => {
  const icons = {
    Heart: (
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="48" height="48" rx="12" fill="#E0EFFE"/>
        <Heart stroke="#3A7AD6" size={24} style={{ transform: 'translate(12px, 12px)' }} />
      </svg>
    ),
    Clock: (
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="48" height="48" rx="12" fill="#E0EFFE"/>
        <Clock stroke="#3A7AD6" size={24} style={{ transform: 'translate(12px, 12px)' }} />
      </svg>
    ),
    Shield: (
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="48" height="48" rx="12" fill="#E0EFFE"/>
        <Shield stroke="#3A7AD6" size={24} style={{ transform: 'translate(12px, 12px)' }} />
      </svg>
    ),
  };

  return icons[icon] || null;
};

export default FeatureIcon;