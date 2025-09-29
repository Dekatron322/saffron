import React from "react"

export interface IconProps {
  className?: string
}

const DownIcon: React.FC<IconProps> = ({ className = "" }) => {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M13.4168 10.5L7.5835 4.66667L4.66683 7.58333L0.583496 3.5M13.4168 10.5H9.3335M13.4168 10.5V6.41667"
        stroke="#EB2426"
        stroke-width="1.16667"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  )
}

export default DownIcon
