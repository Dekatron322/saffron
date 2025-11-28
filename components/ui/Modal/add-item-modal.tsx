// components/Modals/AddBusinessModal.tsx
"use client"

import React, { useState } from "react"
import Modal from "react-modal"
import CloseIcon from "public/close-icon"
import { ButtonModule } from "../Button/Button"
import { FormInputModule } from "../Input/Input"

interface AddItemModalProps {
  isOpen: boolean
  onRequestClose: () => void
  onSubmit: (data: {
    itemName: string
    manufacturer: string
    mfgdate: string
    expirydate: string
    unitPrice: string
    quantity: string
    discount: string
    subtotal: string
    tax: string
    totalPrice: string
  }) => void
  loading: boolean
}

const AddItemModal: React.FC<AddItemModalProps> = ({ isOpen, onRequestClose, onSubmit, loading }) => {
  const [itemData, setItemData] = useState({
    itemName: "",
    manufacturer: "",
    mfgdate: "",
    expirydate: "",
    unitPrice: "",
    quantity: "",
    discount: "",
    subtotal: "",
    tax: "",
    totalPrice: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setItemData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = () => onSubmit(itemData)

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      className="mt-20 min-w-[700px] max-w-md overflow-hidden rounded-md bg-white shadow-lg outline-none"
      overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
    >
      <div className="flex w-full items-center justify-between bg-[#F5F8FA] p-4">
        <h2 className="text-lg font-bold">Add New Item</h2>
        <div onClick={onRequestClose} className="cursor-pointer">
          <CloseIcon />
        </div>
      </div>
      <div className="flex w-full flex-col px-4 pb-6 pt-4">
        <div className="grid grid-cols-2 gap-4">
          <FormInputModule
            label="Product Name"
            type="text"
            name="itemName"
            placeholder="Enter product name"
            value={itemData.itemName}
            onChange={handleChange}
          />
          <FormInputModule
            label="Manufacturer"
            type="text"
            name="manufacturer"
            placeholder="Enter manufacturer"
            value={itemData.manufacturer}
            onChange={handleChange}
          />
          <FormInputModule
            label="MFG Date"
            type="text"
            name="mfgdate"
            placeholder="DD-MM-YYYY"
            value={itemData.mfgdate}
            onChange={handleChange}
          />
          <FormInputModule
            label="Expiry Date"
            type="text"
            name="expirydate"
            placeholder="DD-MM-YYYY"
            value={itemData.expirydate}
            onChange={handleChange}
          />
          <FormInputModule
            label="Unit Price"
            type="text"
            name="unitPrice"
            placeholder="Enter unit price"
            value={itemData.unitPrice}
            onChange={handleChange}
          />
          <FormInputModule
            label="Quantity"
            type="text"
            name="quantity"
            placeholder="Enter quantity"
            value={itemData.quantity}
            onChange={handleChange}
          />
          <FormInputModule
            label="Discount (%)"
            type="text"
            name="discount"
            placeholder="Enter discount"
            value={itemData.discount}
            onChange={handleChange}
          />
          <FormInputModule
            label="Subtotal"
            type="text"
            name="subtotal"
            placeholder="Enter subtotal"
            value={itemData.subtotal}
            onChange={handleChange}
          />
          <FormInputModule
            label="Tax (%)"
            type="text"
            name="tax"
            placeholder="Enter tax"
            value={itemData.tax}
            onChange={handleChange}
          />
          <FormInputModule
            label="Total Price"
            type="text"
            name="totalPrice"
            placeholder="Enter total price"
            value={itemData.totalPrice}
            onChange={handleChange}
          />
        </div>
        <div className="flex w-full justify-end">
          <ButtonModule className="mt-4 flex" variant="primary" size="lg" onClick={handleSubmit}>
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
                    d="M4 12a8 0 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  ></path>
                </svg>
              </div>
            ) : (
              "Add Item"
            )}
          </ButtonModule>
        </div>
      </div>
    </Modal>
  )
}

export default AddItemModal

