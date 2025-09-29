export interface IconProps {
  className?: string
}

const EditIcon: React.FC<IconProps> = ({ className = "" }) => {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M9.75 8.25156L15.9 2.10156L9.75 8.25156Z" fill="#64748B" />
      <path
        d="M9.75 8.25156L15.9 2.10156"
        stroke="#64748B"
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path d="M16.5 5.1V1.5H12.9" stroke="#64748B" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
      <path
        d="M8.25 1.5H6.75C3 1.5 1.5 3 1.5 6.75V11.25C1.5 15 3 16.5 6.75 16.5H11.25C15 16.5 16.5 15 16.5 11.25V9.75"
        stroke="#64748B"
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  )
}

export default EditIcon
