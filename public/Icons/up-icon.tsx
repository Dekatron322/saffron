import React from "react"

export interface IconProps {
  className?: string
}

const UpIcon: React.FC<IconProps> = ({ className = "" }) => {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M7.39802 4.9068L12.25 3.5L11.0423 8.40534L9.53578 6.95905L7.10561 9.49048C7.02311 9.57642 6.90913 9.625 6.79 9.625C6.67087 9.625 6.55689 9.57642 6.47439 9.49048L4.69 7.63174L2.06561 10.3655C1.89827 10.5398 1.62132 10.5454 1.44702 10.3781C1.27271 10.2108 1.26706 9.93382 1.43439 9.75952L4.37439 6.69702C4.45689 6.61108 4.57087 6.5625 4.69 6.5625C4.80913 6.5625 4.92311 6.61108 5.00561 6.69702L6.79 8.55576L8.90457 6.35309L7.39802 4.9068Z"
        fill="#2ECC71"
      />
    </svg>
  )
}

export default UpIcon
