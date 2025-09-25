import React from 'react';

const CtaIllustration = () => (
  <svg
    className="absolute top-0 left-0 w-full h-full"
    style={{ zIndex: 0 }}
    preserveAspectRatio="none"
  >
    <defs>
      <pattern
        id="cta-pattern"
        x="0"
        y="0"
        width="100"
        height="100"
        patternUnits="userSpaceOnUse"
      >
        <circle cx="20" cy="20" r="2" fill="#E0EFFE" />
        <circle cx="80" cy="60" r="3" fill="#C2E0FF" />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#cta-pattern)" opacity="0.3" />
  </svg>
);

export default CtaIllustration;