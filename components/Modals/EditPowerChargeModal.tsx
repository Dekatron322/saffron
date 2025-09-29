"use client"
import React, { useEffect, useState } from "react"
import { IoClose } from "react-icons/io5"

interface AddEstateModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (estate: any) => void
}

const EditPowerChargeModal: React.FC<AddEstateModalProps> = ({ isOpen, onClose, onSave }) => {
  const [estate, setEstate] = useState({
    name: "",
    location: "",
    noOfHouses: 0,
    percentageOccupied: "",
    date: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setEstate((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSave = () => {
    onSave(estate)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50  flex items-center justify-center bg-black bg-opacity-50">
      <div
        className="relative rounded-md bg-white p-10 max-sm:mx-8 max-sm:w-full max-sm:p-4  xl:max-w-[783px]"
        data-aos="fade-up"
      >
        <button onClick={onClose} className="absolute -right-7 -top-7 rounded-full bg-[#FFFFFF] p-2">
          <IoClose size={16} />
        </button>
        <h2 className="my-4  text-base font-medium lg:px-10">Power Charges</h2>
        <div className="my-4 h-[1px] w-full bg-[#1c232b] opacity-5"></div>
        <div className="pb-6 lg:px-10">
          <div className="search-bg mb-3 flex h-[56px]  items-center   rounded-[10px]  px-3  hover:border-[#EEC202] focus:border-[#EEC202] focus:bg-[#FBFAFC] max-sm:mb-2 xl:w-[328px]">
            <p className="text-lg font-bold text-[#4D4D4D]">1 unit = NGN 700</p>
          </div>
          <div className="search-bg mb-3 h-[56px] items-center justify-between  rounded-[10px]  px-3  py-2 hover:border-[#EEC202] focus:border-[#EEC202] focus:bg-[#FBFAFC] max-sm:mb-2 xl:w-[328px]">
            <p className="text-xs text-[#9D99AC]">New Price</p>
            <div className="flex">
              <input
                type="text"
                id="username"
                placeholder="200"
                className="h-[24px] w-full bg-transparent text-base outline-none focus:outline-none"
                style={{ width: "100%", height: "24px" }}
              />
            </div>
          </div>

          <div className="my-4 flex justify-center">
            <button onClick={handleSave} className="button-rounded w-full rounded px-10 py-2 text-white">
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EditPowerChargeModal
