// OtechPlusIcon.tsx
import React from "react"

export interface IconProps {
  className?: string
}

const ArrowIcon: React.FC<IconProps> = ({ className = "" }) => {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g clip-path="url(#clip0_1184_16618)">
        <path
          d="M12.4649 12.7078C12.8554 12.3173 12.8554 11.6841 12.4649 11.2936L8.92899 7.75772C8.53852 7.36725 8.53852 6.73418 8.92898 6.34372V6.34372C9.31945 5.95325 9.95252 5.95325 10.343 6.34372L15.2929 11.2936C15.6834 11.6841 15.6834 12.3173 15.2929 12.7078L10.343 17.6577C9.95252 18.0482 9.31945 18.0482 8.92898 17.6577V17.6577C8.53852 17.2673 8.53852 16.6342 8.92898 16.2437L12.4649 12.7078Z"
          fill="#F58634"
        />
      </g>
      <defs>
        <clipPath id="clip0_1184_16618">
          <rect width="24" height="24" fill="white" />
        </clipPath>
      </defs>
    </svg>
  )
}

export default ArrowIcon
