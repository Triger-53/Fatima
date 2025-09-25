import React from 'react';

const OnlineIllustration = () => (
  <svg width="400" height="400" viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="400" height="400" rx="20" fill="#F0F7FF"/>
    <g transform="translate(50 50)">
        <rect x="25" y="50" width="250" height="150" rx="10" fill="#FFF" stroke="#C2E0FF" stroke-width="2"/>
        <circle cx="150" cy="125" r="40" fill="#E0EFFE"/>
        <path d="M150 135 C160 145, 140 145, 150 135" stroke="#3A7AD6" stroke-width="3" fill="none" />
        <circle cx="140" cy="120" r="3" fill="#3A7AD6"/>
        <circle cx="160"cy="120" r="3" fill="#3A7AD6"/>
        <path d="M100 220 L120 200" stroke="#3A7AD6" stroke-width="3" />
        <path d="M200 220 L180 200" stroke="#3A7AD6" stroke-width="3" />
        <rect x="120" y="200" width="60" height="50" fill="#C2E0FF" />
    </g>
  </svg>
);

export default OnlineIllustration;