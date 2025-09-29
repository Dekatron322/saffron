"use client"
import React, { useEffect, useState } from "react"
import { IoClose } from "react-icons/io5"

import ExpandMoreIcon from "@mui/icons-material/ExpandMore"

interface AddEAdminModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (estate: any) => void
}

const AddAdminModal: React.FC<AddEAdminModalProps> = ({ isOpen, onClose, onSave }) => {
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
      <div className="relative rounded-md bg-white py-6 xl:max-w-[783px]" data-aos="fade-up">
        <button onClick={onClose} className="absolute -right-7 -top-7 rounded-full bg-[#FFFFFF] p-2">
          <IoClose size={16} />
        </button>
        <h2 className="mb-4 px-10 text-base font-medium">Add New Admin</h2>

        <div className="h-[1px] w-full bg-[#1c232b] opacity-5"></div>
        <div className="px-10">
          <div className="search-bg my-3  h-[56px] items-center  justify-between  rounded-[10px] px-3 py-2 hover:border-[#EEC202] focus:border-[#EEC202] focus:bg-[#FBFAFC] max-sm:mb-2 xl:w-[328px]">
            <p className="text-xs text-[#9D99AC]">Name</p>
            <div className="flex">
              <input
                type="text"
                id="username"
                placeholder="Engr. Malam Uzairu"
                className="h-[24px] w-full bg-transparent text-base outline-none focus:outline-none"
                style={{ width: "100%", height: "24px" }}
              />
            </div>
          </div>
          <div className="search-bg mb-3  h-[56px] items-center  justify-between  rounded-[10px] px-3 py-2 hover:border-[#EEC202] focus:border-[#EEC202] focus:bg-[#FBFAFC] max-sm:mb-2 xl:w-[328px]">
            <p className="text-xs text-[#9D99AC]">Email</p>
            <div className="flex">
              <input
                type="text"
                id="username"
                placeholder="Johndoe@gmail.com"
                className="h-[24px] w-full bg-transparent text-base outline-none focus:outline-none"
                style={{ width: "100%", height: "24px" }}
              />
            </div>
          </div>
          <div className="search-bg mb-3  h-[56px] items-center  justify-between  rounded-[10px] px-3 py-2 hover:border-[#EEC202] focus:border-[#EEC202] focus:bg-[#FBFAFC] max-sm:mb-2 xl:w-[328px]">
            <p className="text-xs text-[#9D99AC]">Set Password</p>
            <div className="flex">
              <input
                type="text"
                id="username"
                placeholder="OHNYTRAF45vbs"
                className="h-[24px] w-full bg-transparent text-base outline-none focus:outline-none"
                style={{ width: "100%", height: "24px" }}
              />
            </div>
          </div>
          <div className="search-bg mb-3  h-[56px] items-center  justify-between  rounded-[10px] px-3 py-2 hover:border-[#EEC202] focus:border-[#EEC202] focus:bg-[#FBFAFC] max-sm:mb-2 xl:w-[328px]">
            <p className="text-xs text-[#9D99AC]">Role</p>
            <div className="flex">
              <input
                type="text"
                id="username"
                placeholder="Super Admin"
                className="h-[24px] w-full bg-transparent text-base outline-none focus:outline-none"
                style={{ width: "100%", height: "24px" }}
              />
              <ExpandMoreIcon />
            </div>
          </div>
        </div>

        <div className="mt-4 flex justify-center px-10">
          <button onClick={handleSave} className="button-rounded w-full rounded px-10 py-2 text-white">
            Save
          </button>
        </div>
      </div>
    </div>
  )
}

export default AddAdminModal
