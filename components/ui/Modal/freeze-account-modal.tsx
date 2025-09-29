// components/Modals/FreezeAccountModal.tsx
"use client"

import React, { useState } from "react"
import Modal from "react-modal"
import CloseIcon from "public/close-icon"
import { ButtonModule } from "../Button/Button"
import { FormInputModule } from "../Input/Input"

interface FreezeAccountModalProps {
  isOpen: boolean
  onRequestClose: () => void
  onConfirm: (reason: string) => void // Updated to accept reason parameter
  loading: boolean
}

const FreezeAccountModal: React.FC<FreezeAccountModalProps> = ({ isOpen, onRequestClose, onConfirm, loading }) => {
  const [freezeReason, setFreezeReason] = useState("")

  const handleReasonChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFreezeReason(e.target.value)
  }

  const handleConfirm = () => {
    onConfirm(freezeReason)
  }

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      className="mt-20 w-[350px] max-w-md overflow-hidden rounded-md bg-white shadow-lg outline-none"
      overlayClassName="fixed inset-0 bg-black bg-opacity-50 overflow-hidden flex items-center justify-center"
    >
      <div className="flex w-full items-center justify-between bg-[#F5F8FA] p-4">
        <h2 className="text-lg font-bold">Confirm Freeze Account</h2>
        <div onClick={onRequestClose} className="cursor-pointer">
          <CloseIcon />
        </div>
      </div>
      <div className="px-4 pb-6">
        <p className="my-4">Are you sure you want to freeze this account?</p>

        <FormInputModule
          label="Reason for Freeze"
          type="text"
          placeholder="Enter reason for freezing account"
          value={freezeReason}
          onChange={handleReasonChange}
          className="mb-4"
        />

        <div className="flex justify-end gap-4">
          <ButtonModule
            variant="danger"
            size="lg"
            className="w-full"
            onClick={handleConfirm}
            disabled={!freezeReason.trim()} // Disable if no reason provided
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
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  ></path>
                </svg>
              </div>
            ) : (
              "Freeze Account"
            )}
          </ButtonModule>
        </div>
      </div>
    </Modal>
  )
}

export default FreezeAccountModal
