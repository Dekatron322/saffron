import Image from "next/image"
import React, { useEffect } from "react"
import { IoClose } from "react-icons/io5"

interface ReceiptModalProps {
  isOpen: boolean
  onClose: () => void
  receiptData: any
}

const ReceiptModal: React.FC<ReceiptModalProps> = ({ isOpen, onClose, receiptData }) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50  flex items-center justify-center bg-black bg-opacity-50">
      <div className="relative rounded-md bg-white max-sm:mx-8 max-sm:w-full xl:max-w-[783px]" data-aos="fade-up">
        <button onClick={onClose} className="absolute -right-7 -top-7 rounded-full bg-[#FFFFFF] p-2">
          <IoClose size={16} />
        </button>
        <div className="flex items-center gap-2 p-5">
          <Image src="/DashboardImages/Tenant.svg" width={30} height={30} alt="profile" />
          <p>{receiptData.tenant}</p>
        </div>
        <div className="h-[1px] w-full bg-[#1c232b] opacity-5"></div>
        <div className="px-10 py-5 max-sm:px-4">
          <div className="flex w-full items-center justify-center">
            <Image src="/DashboardImages/Success.svg" width={148} height={143.79} alt="profile" />
          </div>
          <Image className="py-3" src="/DashboardImages/dotted-line.svg" width={292} height={143.79} alt="profile" />
          <div className="flex w-full items-center justify-center ">
            <h5 className="text-2xl font-medium text-[#22266A]">NGN 2,500,000</h5>
          </div>
          <Image className="py-3" src="/DashboardImages/dotted-line.svg" width={292} height={143.79} alt="profile" />
          <div className="mb-4 flex justify-between">
            <p className="text-sm text-[#707070]">Reference No:</p>
            <p className="text-sm font-medium text-[#212121]">AB23-823864701c7</p>
          </div>
          <div className="mb-4 flex justify-between">
            <p className="text-sm text-[#707070]">Property ID:</p>
            <p className="text-sm font-medium text-[#212121]">{receiptData.propertyId}</p>
          </div>
          <div className="mb-4 flex justify-between">
            <p className="text-sm text-[#707070]">Payment Status:</p>
            <p className="text-sm font-medium text-[#212121]">Success</p>
          </div>
          <div className="mb-4 flex justify-between">
            <p className="text-sm text-[#707070]">Payment Purpose:</p>
            <p className="text-sm font-medium text-[#212121]">House Rent</p>
          </div>

          <div className="mb-4 flex justify-between">
            <p className="text-sm text-[#707070]">Paid Amount:</p>
            <p className="text-sm font-medium text-[#212121]">NGN 1,500,000</p>
          </div>

          <div className="mb-4 flex justify-between">
            <p className="text-sm text-[#707070]">Payment Date:</p>
            <p className="text-sm font-medium text-[#212121]">June 14, 2023 6:30pm</p>
          </div>

          <div className="mb-4 flex justify-between">
            <p className="text-sm text-[#707070]">Period of Payment:</p>
            <p className="text-sm font-medium text-[#212121]">June</p>
          </div>
          <Image className="py-3" src="/DashboardImages/dotted-line.svg" width={292} height={143.79} alt="profile" />
          <div className=" flex justify-center">
            <p className="text-xs text-[#707070]">June 14, 2023 6:30pm</p>
          </div>

          {/* Add more receipt details as needed */}
        </div>
        <div className="mb-4 flex w-full justify-center px-10">
          <button className="button-rounded w-full rounded py-2  text-white max-sm:w-full">Download</button>
        </div>
      </div>
    </div>
  )
}

export default ReceiptModal
