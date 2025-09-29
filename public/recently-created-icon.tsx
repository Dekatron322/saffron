// RecentlyCreatedIcon.tsx
import React from "react"

export interface IconProps {
  className?: string
}

const RecentlyCreatedIcon: React.FC<IconProps> = ({ className = "" }) => {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M16.9949 4H6.99488C3.16488 4 2.09488 4.92 2.00488 8.5C3.93488 8.5 5.49488 10.07 5.49488 12C5.49488 13.93 3.93488 15.49 2.00488 15.5C2.09488 19.08 3.16488 20 6.99488 20H16.9949C20.9949 20 21.9949 19 21.9949 15V9C21.9949 5 20.9949 4 16.9949 4Z"
        stroke="#292D32"
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path d="M8.99316 4V7.5" stroke="#292D32" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
      <path d="M8.99316 16.5V20" stroke="#292D32" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
      <path
        d="M15.025 9.33016L15.645 10.5801C15.705 10.7001 15.825 10.7901 15.955 10.8101L17.335 11.0101C17.675 11.0601 17.815 11.4801 17.565 11.7201L16.565 12.6901C16.465 12.7801 16.425 12.9201 16.445 13.0601L16.685 14.4301C16.745 14.7701 16.385 15.0301 16.085 14.8701L14.855 14.2201C14.735 14.1601 14.585 14.1601 14.465 14.2201L13.235 14.8701C12.925 15.0301 12.575 14.7701 12.635 14.4301L12.875 13.0601C12.895 12.9201 12.855 12.7901 12.755 12.6901L11.765 11.7201C11.515 11.4801 11.655 11.0601 11.995 11.0101L13.375 10.8101C13.515 10.7901 13.625 10.7101 13.685 10.5801L14.295 9.33016C14.435 9.02016 14.875 9.02016 15.025 9.33016Z"
        stroke="#292D32"
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  )
}

export default RecentlyCreatedIcon
