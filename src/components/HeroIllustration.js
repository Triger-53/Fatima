import React from 'react';

const HeroIllustration = () => (
  <svg width="400" height="400" viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="400" height="400" rx="20" fill="#E0EFFE"/>
    <g transform="translate(50 50)">
        <path d="M150 50 C125 25, 75 25, 50 50 C25 75, 25 125, 50 150 C75 175, 125 175, 150 150 C175 125, 175 75, 150 50 Z" fill="#C2E0FF"/>
        <circle cx="100" cy="100" r="80" fill="#FFF"/>
        <path d="M100 120 C120 140, 80 140, 100 120" stroke="#3A7AD6" stroke-width="5" fill="none" />
        <circle cx="80" cy="90" r="5" fill="#3A7AD6"/>
        <circle cx="120" cy="90" r="5" fill="#3A7AD6"/>
        <path d="M70 200 C70 250, 130 250, 130 200" fill="#E0EFFE"/>
        <rect x="70" y="200" width="60" height="100" fill="#C2E0FF" />
        <path d="M50 220 L70 200" stroke="#3A7AD6" stroke-width="5" />
        <path d="M150 220 L130 200" stroke="#3A7AD6" stroke-width="5" />
    </g>
  </svg>
);

export default HeroIllustration;