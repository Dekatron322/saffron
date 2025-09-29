import React from "react"

export interface IconProps {
  className?: string
}

const ArrowIcon: React.FC<IconProps> = ({ className = "" }) => {
  return (
    <svg
      width="1em"
      height="1em"
      viewBox="0 0 17 17"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="new-arrow-right "
    >
      <path
        d="M9.1497 0.80204C9.26529 3.95101 13.2299 6.51557 16.1451 8.0308L16.1447 9.43036C13.2285 10.7142 9.37889 13.1647 9.37789 16.1971L7.27855 16.1978C7.16304 12.8156 10.6627 10.4818 13.1122 9.66462L0.049716 9.43565L0.0504065 7.33631L13.1129 7.56528C10.5473 6.86634 6.93261 4.18504 7.05036 0.80273L9.1497 0.80204Z"
        fill="currentColor"
      ></path>
    </svg>
  )
}

export default ArrowIcon
