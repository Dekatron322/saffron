import React, { useEffect, useState } from "react"
import { IoClose } from "react-icons/io5"

import Image from "next/image"
import GenerateInvoiceModal from "./GenerateInvoiceModal" // Adjust the import path as necessary

interface ReceiptModalProps {
  isOpen: boolean
  onClose: () => void
  receiptData: any
}

const ViewMaintenanceModal: React.FC<ReceiptModalProps> = ({ isOpen, onClose, receiptData }) => {
  const [isGenerateInvoiceModalOpen, setIsGenerateInvoiceModalOpen] = useState(false)

  if (!isOpen) return null

  const handleGenerateInvoice = () => {
    console.log("Opening Generate Invoice Modal")
    setIsGenerateInvoiceModalOpen(true)
    onClose()
  }

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="relative rounded-md bg-white xl:max-w-[783px]" data-aos="fade-up">
          <button onClick={onClose} className="absolute -right-7 -top-7 rounded-full bg-[#FFFFFF] p-2">
            <IoClose size={16} />
          </button>
          <div className="flex items-center gap-2 px-10 py-5">
            <p className="text-lg font-semibold text-black">Maintenance Request</p>
          </div>
          <div className="h-[1px] w-full bg-[#1c232b] opacity-5"></div>
          <div className="px-10 py-5">
            <div className="mb-4 flex justify-between">
              <p className="text-sm text-[#707070]">Maintenance Request</p>
              <p className="text-sm font-medium text-[#212121]">#02845932</p>
            </div>
            <div className="mb-4 flex justify-between">
              <p className="text-sm text-[#707070]">Property ID:</p>
              <p className="text-sm font-medium text-[#212121]">{receiptData.propertyId}</p>
            </div>
            <div className="mb-4 flex justify-between">
              <p className="text-sm text-[#707070]">Type:</p>
              <p className="text-sm font-medium text-[#212121]">{receiptData.type}</p>
            </div>
            <div className="mb-4 flex justify-between">
              <p className="text-sm text-[#707070]">Description:</p>
              <p className="w-[158px] text-right text-sm font-medium text-[#212121]">
                Loud fridge noises, not cooling, food spoiling
              </p>
            </div>
            <div className="mb-4 flex justify-between">
              <p className="text-sm text-[#707070]">Date Submitted</p>
              <p className="text-sm font-medium text-[#212121]">{receiptData.dateSubmitted}</p>
            </div>
            <div className="mb-4 flex justify-between">
              <p className="text-sm text-[#707070]">Work Status</p>
              <p className="text-sm font-medium text-[#212121]">Pending</p>
            </div>
            <div className="mb-4 flex justify-between">
              <p className="text-sm text-[#707070]">Payment Status</p>
              <p className="text-sm font-medium text-[#212121]">{receiptData.paymentStatus}</p>
            </div>
            <Image className="py-3" src="/DashboardImages/dotted-line.svg" width={292} height={143.79} alt="profile" />
            <div className="flex justify-center">
              <p className="text-xs text-[#707070]">No Invoice Yet</p>
            </div>
          </div>
          <div className="mb-4 flex justify-center px-10">
            <button onClick={handleGenerateInvoice} className="button-rounded w-full rounded py-2 text-white">
              Generate Invoice
            </button>
          </div>
        </div>
      </div>
      {isGenerateInvoiceModalOpen && (
        <GenerateInvoiceModal
          isOpen={isGenerateInvoiceModalOpen}
          onClose={() => setIsGenerateInvoiceModalOpen(false)}
          receiptData={receiptData}
        />
      )}
    </>
  )
}

export default ViewMaintenanceModal
