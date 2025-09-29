"use client"

import React, { useRef } from "react"
import Modal from "react-modal"
import { MdClose } from "react-icons/md"
import { ButtonModule } from "components/ui/Button/Button"
import PdfFile from "public/pdf-file"
import { jsPDF } from "jspdf"
import html2canvas from "html2canvas"

export type Order = {
  sn: number
  orderId: string
  customer: string
  doorModel: string
  bank: string
  type: string
  payment70: string
  orderStatus: string
  date: string
}

export type Account = {
  accountId: string
  customer: string
  accountNo: string
  accountType: string
  accountBalance: string
  points: string
  dateCreated: string
  accountStatus: string
  gmail: string
  date: string
}

interface TransactionDetailModalProps {
  isOpen: boolean
  order: Order | null
  onRequestClose: () => void
}

const TransactionDetailModal: React.FC<TransactionDetailModalProps> = ({ isOpen, order, onRequestClose }) => {
  const modalRef = useRef<HTMLDivElement>(null)

  if (!order) return null

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "Paid":
      case "Completed":
        return {
          backgroundColor: "#EEF5F0",
          color: "#589E67",
          padding: "0.25rem 0.5rem",
          borderRadius: "0.375rem",
          fontSize: "0.875rem",
          fontWeight: "500",
        }
      case "Pending":
        return {
          backgroundColor: "#FBF4EC",
          color: "#D28E3D",
          padding: "0.25rem 0.5rem",
          borderRadius: "0.375rem",
          fontSize: "0.875rem",
          fontWeight: "500",
        }
      case "Not Paid":
        return {
          backgroundColor: "#F7EDED",
          color: "#AF4B4B",
          padding: "0.25rem 0.5rem",
          borderRadius: "0.375rem",
          fontSize: "0.875rem",
          fontWeight: "500",
        }
      case "Confirmed":
        return {
          backgroundColor: "#EDF2FE",
          color: "#4976F4",
          padding: "0.25rem 0.5rem",
          borderRadius: "0.375rem",
          fontSize: "0.875rem",
          fontWeight: "500",
        }
      case "Reverted":
        return {
          backgroundColor: "#F4EDF7",
          color: "#954BAF",
          padding: "0.25rem 0.5rem",
          borderRadius: "0.375rem",
          fontSize: "0.875rem",
          fontWeight: "500",
        }
      case "Cancelled":
        return {
          backgroundColor: "#F7EDED",
          color: "#AF4B4B",
          padding: "0.25rem 0.5rem",
          borderRadius: "0.375rem",
          fontSize: "0.875rem",
          fontWeight: "500",
        }
      default:
        return {}
    }
  }

  const handleDownloadPDF = async () => {
    if (!modalRef.current) return

    try {
      const canvas = await html2canvas(modalRef.current, {
        scale: 2,
        logging: false,
        useCORS: true,
        allowTaint: true,
      })

      const imgData = canvas.toDataURL("image/png")
      const pdf = new jsPDF("p", "mm", "a4")
      const imgWidth = 210 // A4 width in mm
      const pageHeight = 297 // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      let heightLeft = imgHeight
      let position = 0

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight
        pdf.addPage()
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight)
        heightLeft -= pageHeight
      }

      pdf.save(`Otech_Transaction_${order.orderId}.pdf`)
    } catch (error) {
      console.error("Error generating PDF:", error)
      alert("Failed to generate PDF. Please try again.")
    }
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      className="flex h-auto w-[481px] overflow-hidden rounded-md bg-white shadow-lg outline-none max-sm:w-full max-sm:max-w-[380px]"
      overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
      ariaHideApp={false}
    >
      <div ref={modalRef} className="w-full">
        <div className="flex items-center justify-between bg-[#ffe8d1] p-4">
          <div className="flex items-center justify-center gap-2">
            <img src="/otech logo.svg" alt="logo" className="h-7 w-7" />
            <p className="text-xl font-semibold text-[#2a2f4b]">Otech MFB</p>
          </div>
          <button onClick={onRequestClose} className="cursor-pointer text-gray-600 hover:text-gray-800">
            <MdClose size={24} />
          </button>
        </div>

        <div className="flex w-full flex-col items-center justify-center bg-gray-50 p-4">
          <p className="text-sm text-gray-800">
            <span className="font-bold">NGN {order.payment70}</span> to {order.doorModel} from {order.customer}
          </p>
          <p className="mt-1 text-sm text-gray-500">
            Initiated on{" "}
            {new Date(order.date).toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
          <div style={getStatusStyle(order.orderStatus)} className="mt-2 inline-block text-sm font-medium">
            {order.orderStatus}
          </div>
        </div>

        <div className="space-y-4 p-6">
          <div className="flex w-full justify-between text-sm">
            <p className="font-medium text-gray-600">Order ID:</p>
            <p className="text-gray-800">{order.orderId}</p>
          </div>
          <div className="flex w-full justify-between text-sm">
            <p className="font-medium text-gray-600">Customer:</p>
            <p className="text-gray-800">{order.customer}</p>
          </div>
          <div className="flex w-full justify-between text-sm">
            <p className="font-medium text-gray-600">Recipient:</p>
            <p className="text-gray-800">{order.doorModel}</p>
          </div>
          <div className="flex w-full justify-between text-sm">
            <p className="font-medium text-gray-600">Account No.:</p>
            <p className="text-gray-800">23456*****3455</p>
          </div>
          <div className="flex w-full justify-between text-sm">
            <p className="font-medium text-gray-600">Bank:</p>
            <p className="text-gray-800">{order.bank}</p>
          </div>
          <div className="flex w-full justify-between text-sm">
            <p className="font-medium text-gray-600">Type:</p>
            <p className="text-gray-800">{order.type}</p>
          </div>
          <div className="flex w-full justify-between text-sm">
            <p className="font-medium text-gray-600">Amount:</p>
            <p className="text-gray-800">NGN {order.payment70}</p>
          </div>

          <div className="mt-8 flex justify-between">
            <ButtonModule
              variant="outline"
              size="md"
              icon={<PdfFile />}
              iconPosition="start"
              onClick={handleDownloadPDF}
              className="border-gray-300 hover:bg-gray-50"
            >
              Download Pdf
            </ButtonModule>
            <ButtonModule
              variant="outline"
              size="md"
              icon={<PdfFile />}
              iconPosition="start"
              onClick={handlePrint}
              className="border-gray-300 hover:bg-gray-50"
            >
              Print
            </ButtonModule>
          </div>
        </div>
      </div>
    </Modal>
  )
}

export default TransactionDetailModal
