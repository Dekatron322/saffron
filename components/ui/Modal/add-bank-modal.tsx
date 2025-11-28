"use client"

import React, { ChangeEvent, useRef, useState } from "react"
import Modal from "react-modal"
import CloseIcon from "public/close-icon"
import { ButtonModule } from "../Button/Button"
import { FormInputModule } from "../Input/Input"
import { BsFiletypeJpg, BsFiletypePng, BsFiletypeSvg } from "react-icons/bs"
import DocIcon from "public/doc-icon"
import Image from "next/image"

interface AddBusinessModalProps {
  isOpen: boolean
  onRequestClose: () => void
  onSubmit: (businessData: { bank: string; code: string; logo: File | null }) => void
  loading: boolean
}

const AddBankModal: React.FC<AddBusinessModalProps> = ({ isOpen, onRequestClose, onSubmit, loading }) => {
  const [businessData, setBusinessData] = useState({
    bank: "",
    code: "",
    logo: null as File | null,
  })
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setBusinessData((prev) => ({ ...prev, [name]: value }))
  }

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/svg+xml"]
    if (!validTypes.includes(file.type)) {
      alert("Please upload a valid image file (JPEG, PNG, or SVG)")
      return
    }

    // Validate file size (1MB)
    if (file.size > 1024 * 1024) {
      alert("File size should be less than 1MB")
      return
    }

    setBusinessData((prev) => ({ ...prev, logo: file }))

    // Create preview URL
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    const file = e.dataTransfer.files?.[0]
    if (file) {
      handleFileChange({ target: { files: [file] } } as any)
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  const getFileIcon = () => {
    if (!businessData.logo) return <DocIcon />

    const type = businessData.logo.type
    if (type.includes("svg")) return <BsFiletypeSvg className="text-xl" />
    if (type.includes("jpeg") || type.includes("jpg")) return <BsFiletypeJpg className="text-xl" />
    if (type.includes("png")) return <BsFiletypePng className="text-xl" />
    return <DocIcon />
  }

  const getFileName = () => {
    if (!businessData.logo) return "No file selected"
    return businessData.logo.name
  }

  const handleSubmit = () => {
    onSubmit(businessData)
  }

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      className="mt-20 w-[800px] max-w-md overflow-hidden rounded-md bg-white shadow-lg outline-none"
      overlayClassName="fixed inset-0 bg-black bg-opacity-50 overflow-hidden flex items-center justify-center"
    >
      <div className="flex w-full items-center justify-between bg-[#F5F8FA] p-4">
        <h2 className="text-lg font-bold">Add Bank</h2>
        <div onClick={onRequestClose} className="cursor-pointer">
          <CloseIcon />
        </div>
      </div>
      <div className="flex flex-col items-center gap-4 p-4">
        {/* File display area */}
        <div className="bg-accent flex w-full items-center justify-between rounded-lg bg-[#F8F9FA] px-3 py-4">
          <div className="flex items-center gap-2">
            <div className="rounded bg-[#E4FAED] p-1">{getFileIcon()}</div>
            <p className="text-sm font-bold">{getFileName()}</p>
          </div>
          {businessData.logo && (
            <button
              onClick={() => {
                setBusinessData((prev) => ({ ...prev, logo: null }))
                setPreviewUrl(null)
              }}
              className="text-sm text-red-500"
            >
              Remove
            </button>
          )}
        </div>

        {/* Form inputs */}
        <div className="flex w-full gap-2">
          <FormInputModule
            label="Bank Name / Alias"
            type="text"
            name="bank"
            placeholder="Enter Bank Name"
            value={businessData.bank}
            onChange={handleChange}
            className="w-full"
          />
          <FormInputModule
            label="Bank Code"
            type="text"
            name="code"
            placeholder="Enter Code"
            value={businessData.code}
            onChange={handleChange}
            className="w-full"
          />
        </div>

        {/* File upload area */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/jpeg,image/png,image/svg+xml"
          className="hidden"
        />
        <div
          className="flex w-full cursor-pointer flex-col rounded-md bg-[#F8F9FA] p-4 transition-all duration-300 ease-in-out hover:bg-transparent"
          onClick={triggerFileInput}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          <div className="flex h-[120px] w-full flex-col items-center justify-center gap-1 rounded-md border border-dashed border-[#CBD5E1] transition-all duration-300 ease-in-out hover:border-[#D82E2E] hover:bg-[#FDF3F3]">
            {previewUrl ? (
              <div className="relative size-full">
                <Image src={previewUrl} alt="Bank logo preview" layout="fill" objectFit="contain" className="p-2" />
              </div>
            ) : (
              <>
                <DocIcon />
                <h6 className="text-xs font-bold">Drag & drop image or select</h6>
                <p className="text-grey-400 text-[10px]">Supports .png, .svg, .jpg files up to 1MB (40px by 40px)</p>
              </>
            )}
          </div>
        </div>

        <ButtonModule
          className="flex w-full"
          variant="primary"
          size="lg"
          onClick={handleSubmit}
          disabled={!businessData.bank.trim() || !businessData.code.trim() || !businessData.logo}
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <svg
                className="mr-2 size-5 animate-spin"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
              </svg>
            </div>
          ) : (
            "Add Bank"
          )}
        </ButtonModule>
      </div>
    </Modal>
  )
}

export default AddBankModal
