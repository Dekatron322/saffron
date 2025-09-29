// IncomingIcon.tsx
import React from "react"

export interface IconProps {
  className?: string
}

const IncomingIcon: React.FC<IconProps> = ({ className = "" }) => {
  return (
    <svg width="27" height="26" viewBox="0 0 27 26" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="0.799988" width="26" height="26" rx="13" fill="#E6F9EE" />
      <path
        d="M18.3525 14.8223L13.8 19.3748L9.24749 14.8223"
        stroke="#27AE60"
        stroke-width="1.5"
        stroke-miterlimit="10"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M13.8 6.625V19.2475"
        stroke="#27AE60"
        stroke-width="1.5"
        stroke-miterlimit="10"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  )
}

export default IncomingIcon
