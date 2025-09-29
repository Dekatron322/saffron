// components/Modals/DeleteBusinessModal.tsx
"use client"

import React, { useState } from "react"
import Modal from "react-modal"
import CloseIcon from "public/close-icon"
import { ButtonModule } from "../Button/Button"
import { FormInputModule } from "../Input/Input"

interface DeleteBusinessModalProps {
  isOpen: boolean
  onRequestClose: () => void
  onConfirm: (reason: string) => void
  loading: boolean
  businessName: string
}

const DeleteModal: React.FC<DeleteBusinessModalProps> = ({
  isOpen,
  onRequestClose,
  onConfirm,
  loading,
  businessName,
}) => {
  const [deleteReason, setDeleteReason] = useState("")

  const handleReasonChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDeleteReason(e.target.value)
  }

  const handleConfirm = () => {
    onConfirm(deleteReason)
  }

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      className="mt-20 w-[350px] max-w-md overflow-hidden rounded-md bg-white shadow-lg outline-none"
      overlayClassName="fixed inset-0 bg-black bg-opacity-50 overflow-hidden flex items-center justify-center"
    >
      <div className="flex w-full items-center justify-between bg-[#F5F8FA] p-4">
        <h2 className="text-lg font-bold">Delete Transaction</h2>
        <div onClick={onRequestClose} className="cursor-pointer">
          <CloseIcon />
        </div>
      </div>
      <div className="px-4 pb-6">
        <p className="my-4 text-red-600">
          Warning: This action cannot be undone. Are you sure you want to delete <strong>{businessName}</strong>?
        </p>

        <FormInputModule
          label="Reason for Deletion"
          type="text"
          placeholder="Enter reason for deleting business"
          value={deleteReason}
          onChange={handleReasonChange}
          className="mb-4"
        />

        <ButtonModule
          variant="danger"
          className="w-full rounded-md"
          size="lg"
          onClick={handleConfirm}
          disabled={!deleteReason.trim()}
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <svg
                className="mr-2 h-5 w-5 animate-spin"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
              </svg>
            </div>
          ) : (
            "Delete Business"
          )}
        </ButtonModule>
      </div>
    </Modal>
  )
}

export default DeleteModal
