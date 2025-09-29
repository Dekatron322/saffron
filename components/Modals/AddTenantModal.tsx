"use client"
import React, { useEffect, useState } from "react"
import { IoClose } from "react-icons/io5"

import Image from "next/image"

interface AddEstateModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (estate: any) => void
}

const AddTenantModal: React.FC<AddEstateModalProps> = ({ isOpen, onClose, onSave }) => {
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
      <div className="relative rounded-md bg-white  xl:max-w-[783px]" data-aos="fade-up">
        <button onClick={onClose} className="absolute -right-7 -top-7 rounded-full bg-[#FFFFFF] p-2">
          <IoClose size={16} />
        </button>
        <h2 className="mb-4 px-10 pt-5 text-base font-medium">Link Property ID</h2>
        <div className="h-[1px] w-full bg-[#1c232b] opacity-5"></div>
        <div className="flex w-full items-center justify-center py-5">
          <Image src="/DashboardImages/linked.svg" width={116} height={112.97} alt="profile" />
        </div>

        <div className="px-10 pb-6">
          <div className="search-bg mb-3  h-[56px] items-center  justify-between  rounded-[10px] px-3 py-2 hover:border-[#EEC202] focus:border-[#EEC202] focus:bg-[#FBFAFC] max-sm:mb-2 xl:w-[328px]">
            <p className="text-xs text-[#9D99AC]">Estate Name</p>
            <div className="flex">
              <input
                type="text"
                id="username"
                placeholder="GADUWA1234"
                className="h-[24px] w-full bg-transparent text-base outline-none focus:outline-none"
                style={{ width: "100%", height: "24px" }}
              />
            </div>
          </div>

          <div className="search-bg mb-3  h-[56px] items-center  justify-between  rounded-[10px] px-3 py-2 hover:border-[#EEC202] focus:border-[#EEC202] focus:bg-[#FBFAFC] max-sm:mb-2 xl:w-[328px]">
            <p className="text-xs text-[#9D99AC]">Province</p>
            <div className="flex">
              <input
                type="text"
                id="username"
                placeholder="Apo"
                className="h-[24px] w-full bg-transparent text-base outline-none focus:outline-none"
                style={{ width: "100%", height: "24px" }}
              />
            </div>
          </div>
          <div className="my-4 flex justify-center">
            <button onClick={handleSave} className="button-rounded w-full rounded px-10 py-2 text-white">
              Link
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AddTenantModal
