"use client"
import React, { useState } from "react"
import Modal from "react-modal"
import CloseIcon from "public/close-icon"
import { ButtonModule } from "../Button/Button"
import { FormInputModule } from "../Input/Input"

interface EditModalProps {
  isOpen: boolean
  onRequestClose: () => void
  onSave: (data: {
    name: string
    description: string
    accountManagementPrice: string
    reportSigningPrice: string
  }) => void
  loading: boolean
  practitioner: {
    name: string
    description: string
    accountManagementPrice: string
    reportSigningPrice: string
  }
}

const EditModal: React.FC<EditModalProps> = ({ isOpen, onRequestClose, onSave, loading, practitioner }) => {
  const [formData, setFormData] = useState({
    name: practitioner.name,
    description: practitioner.description,
    accountManagementPrice: practitioner.accountManagementPrice,
    reportSigningPrice: practitioner.reportSigningPrice,
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      className="mt-20 w-[350px] max-w-md overflow-hidden rounded-md bg-white shadow-lg outline-none"
      overlayClassName="fixed inset-0 bg-black bg-opacity-50 overflow-hidden flex items-center justify-center"
    >
      <div className="flex w-full items-center justify-between bg-[#F5F8FA] p-4">
        <h2 className="text-lg font-bold">Edit Practitioner</h2>
        <div onClick={onRequestClose} className="cursor-pointer">
          <CloseIcon />
        </div>
      </div>
      <div className="px-4 pb-6">
        <form onSubmit={handleSubmit}>
          <FormInputModule
            label="Name"
            name="name"
            type="text"
            value={formData.name}
            onChange={handleChange}
            className="mb-4"
            placeholder={""}
          />
          <FormInputModule
            label="Description"
            name="description"
            type="text"
            value={formData.description}
            onChange={handleChange}
            className="mb-4"
            placeholder={""}
          />
          <FormInputModule
            label="Account Management Price (NGN)"
            name="accountManagementPrice"
            type="text"
            value={formData.accountManagementPrice}
            onChange={handleChange}
            className="mb-4"
            placeholder={""}
          />
          <FormInputModule
            label="Report Signing Price (NGN)"
            name="reportSigningPrice"
            type="text"
            value={formData.reportSigningPrice}
            onChange={handleChange}
            className="mb-4"
            placeholder={""}
          />

          <ButtonModule type="submit" variant="primary" className="w-full" size="lg" disabled={loading}>
            {loading ? (
              <div className="flex items-center justify-center">
                <svg
                  className="mr-2 size-5 animate-spin"
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
              "Save Changes"
            )}
          </ButtonModule>
        </form>
      </div>
    </Modal>
  )
}

export default EditModal
