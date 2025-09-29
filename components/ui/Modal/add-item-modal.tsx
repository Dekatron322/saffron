// components/Modals/AddBusinessModal.tsx
"use client"

import React, { useState } from "react"
import Modal from "react-modal"
import CloseIcon from "public/close-icon"
import { ButtonModule } from "../Button/Button"
import { FormInputModule } from "../Input/Input"

interface AddBusinessModalProps {
  isOpen: boolean
  onRequestClose: () => void
  onSubmit: (data: { name: string; email: string; phone: string; address: string }) => void
  loading: boolean
}

const AddBusinessModal: React.FC<AddBusinessModalProps> = ({ isOpen, onRequestClose, onSubmit, loading }) => {
  const [businessData, setBusinessData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setBusinessData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = () => onSubmit(businessData)

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      className="mt-20 min-w-[700px] max-w-md overflow-hidden rounded-md bg-white shadow-lg outline-none"
      overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
    >
      <div className="flex w-full items-center justify-between bg-[#F5F8FA] p-4">
        <h2 className="text-lg font-bold">Add New Business</h2>
        <div onClick={onRequestClose} className="cursor-pointer">
          <CloseIcon />
        </div>
      </div>
      <div className="flex w-full flex-col px-4 pb-6 pt-4">
        <div className="grid grid-cols-2 gap-4">
          <FormInputModule
            label="Business Name"
            type="text"
            name="name"
            placeholder="Enter business name"
            value={businessData.name}
            onChange={handleChange}
          />
          <FormInputModule
            label="Email"
            type="email"
            name="email"
            placeholder="Enter business email"
            value={businessData.email}
            onChange={handleChange}
          />
          <FormInputModule
            label="Phone"
            type="tel"
            name="phone"
            placeholder="Enter business phone"
            value={businessData.phone}
            onChange={handleChange}
          />
          <FormInputModule
            label="Address"
            type="text"
            name="address"
            placeholder="Enter business address"
            value={businessData.address}
            onChange={handleChange}
          />
        </div>
        <div className="flex w-full justify-end">
          <ButtonModule className="mt-4 flex" variant="primary" size="lg" onClick={handleSubmit}>
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
              "Add Business"
            )}
          </ButtonModule>
        </div>
      </div>
    </Modal>
  )
}

export default AddBusinessModal
