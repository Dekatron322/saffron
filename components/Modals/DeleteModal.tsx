import React, { useEffect } from "react"
import { IoClose } from "react-icons/io5"

interface DeleteModalProps {
  isOpen: boolean
  onClose: () => void
  onDelete: () => void
}

const DeleteModal: React.FC<DeleteModalProps> = ({ isOpen, onClose, onDelete }) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="relative rounded-md bg-white xl:max-w-[783px]" data-aos="fade-up">
        <button onClick={onClose} className="absolute -right-7 -top-7 rounded-full bg-[#FFFFFF] p-2">
          <IoClose size={16} />
        </button>
        <div className="flex items-center gap-2 px-10 py-5">
          <p className="text-lg font-semibold text-black">Remove Estate</p>
        </div>
        <div className="h-[1px] w-full bg-[#1c232b] opacity-5"></div>
        <div className="px-10 py-5">
          {/* Add your form or invoice generation content here */}
          <div>
            <p className="mb-4 text-gray-600">Are you sure you want to delete this estate?</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={onDelete}
                className="w-full rounded-lg  bg-[#FF6A5A] px-4 py-2 text-white hover:bg-red-700"
              >
                Delete
              </button>
              <button onClick={onClose} className="button-rounded w-full rounded px-10 py-1 text-white">
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DeleteModal
