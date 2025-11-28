"use client"
import { ChangeEvent, useEffect, useRef, useState } from "react"
import { useAppDispatch, useAppSelector } from "app/api/store/store"
import { createOrganisation, fetchOrganisations } from "app/api/store/userManagementSlice"
import { createLoyaltyConversion } from "app/api/store/loyaltySlice"
import DashboardNav from "components/Navbar/DashboardNav"
import { ButtonModule } from "components/ui/Button/Button"
import { FormInputModule } from "components/ui/Input/Input"
import { RiBuilding2Fill, RiUploadCloud2Line, RiCoinsLine } from "react-icons/ri"
import { BiBarcode, BiMailSend, BiMap, BiMapPin, BiPhone } from "react-icons/bi"
import { AnimatePresence, motion } from "framer-motion"
import { notify } from "components/ui/Notification/Notification"
import Image from "next/image"
import { RxCross2 } from "react-icons/rx"

interface OrganisationModalProps {
  isOpen: boolean
  onClose: () => void
  onOrganisationAdded?: () => void
}

interface LoyaltyModalProps {
  isOpen: boolean
  onClose: () => void
  onLoyaltyAdded?: () => void
}

interface ApiError {
  errorMessage?: string
  message?: string
}

const AddOrganisationModal: React.FC<OrganisationModalProps> = ({ isOpen, onClose, onOrganisationAdded }) => {
  const dispatch = useAppDispatch()
  const [isLoading, setIsLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [logoFile, setLogoFile] = useState<File | null>(null)

  const [formData, setFormData] = useState({
    companyName: "",
    gstin: "",
    cin: "",
    address: "",
    shortName: "",
    emailId: "",
    phoneNumber: "",
    businessType: "Retail",
    businessCategory: "Pharmacy Medical",
  })

  useEffect(() => {
    // Clean up preview URL to avoid memory leaks
    return () => {
      if (previewImage) {
        URL.revokeObjectURL(previewImage)
      }
    }
  }, [previewImage])

  const handleInputChange = (field: keyof typeof formData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [field]: e.target.value,
    }))
  }

  const handleSelectChange = (field: keyof typeof formData) => (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData((prev) => ({
      ...prev,
      [field]: e.target.value,
    }))
  }

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Check file type
    if (!file.type.match("image.*")) {
      notify("error", "Invalid file type", {
        title: "Error",
        description: "Please upload an image file (JPEG, PNG, etc.)",
      })
      return
    }

    // Check file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      notify("error", "File too large", {
        title: "Error",
        description: "Please upload an image smaller than 2MB",
      })
      return
    }

    // Keep the File object for FormData submission
    setLogoFile(file)

    // Also read as base64 for preview and potential alternative submission
    const reader = new FileReader()
    reader.onload = (event) => {
      const base64String = event.target?.result as string
      // You can store this in state if needed elsewhere
    }
    reader.readAsDataURL(file)

    // Create preview
    const previewUrl = URL.createObjectURL(file)
    setPreviewImage(previewUrl)
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  const handleSubmit = async () => {
    // Validate required fields
    const requiredFields: (keyof typeof formData)[] = ["companyName", "gstin", "shortName", "emailId", "phoneNumber"]
    const missingFields = requiredFields.filter((field) => !formData[field])

    if (missingFields.length > 0) {
      notify("error", "Please fill all required fields", {
        title: "Validation Error",
        description: `Missing: ${missingFields.join(", ")}`,
      })
      return
    }

    // Validate GSTIN format (basic check)
    if (formData.gstin.length !== 15) {
      notify("error", "Invalid GSTIN", {
        title: "Validation Error",
        description: "GSTIN must be 15 characters long",
      })
      return
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.emailId)) {
      notify("error", "Invalid Email", {
        title: "Validation Error",
        description: "Please enter a valid email address",
      })
      return
    }

    setIsLoading(true)

    // Prepare the payload
    const payload = {
      companyName: formData.companyName,
      gstin: formData.gstin,
      cin: formData.cin,
      address: formData.address,
      shortName: formData.shortName,
      emailId: formData.emailId,
      phoneNumber: formData.phoneNumber,
      businessType: formData.businessType,
      businessCategory: formData.businessCategory,
      logo: logoFile,
    }

    // Dispatch the action
    const result = await dispatch(createOrganisation(payload))

    if (result.meta?.requestStatus === "rejected") {
      const errorPayload = result.payload as ApiError
      const errorMessage = errorPayload?.errorMessage || errorPayload?.message || "Failed to add organization"

      notify("error", "Organization creation failed", {
        title: "Error",
        description: errorMessage,
      })
    } else {
      // Success case
      notify("success", "Organization added successfully!", {
        title: "Success",
        description: "The organization has been added to the system.",
      })

      // Reset form and close modal
      setFormData({
        companyName: "",
        gstin: "",
        cin: "",
        address: "",
        shortName: "",
        emailId: "",
        phoneNumber: "",
        businessType: "Retail",
        businessCategory: "Pharmacy Medical",
      })
      setPreviewImage(null)
      setLogoFile(null)

      onClose()
      if (onOrganisationAdded) onOrganisationAdded()
    }

    setIsLoading(false)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
          />

          <motion.div
            className="absolute inset-y-0 right-0 flex max-w-full pl-10"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 400 }}
          >
            <div className="w-screen max-w-2xl">
              <motion.div
                className="flex h-full flex-col bg-white shadow-xl"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
              >
                <div className="flex-1 overflow-y-auto p-6">
                  <div className="flex items-start justify-between">
                    <motion.h2
                      className="text-lg font-semibold text-gray-900"
                      initial={{ y: -20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      Add New Organization
                    </motion.h2>
                    <motion.button
                      type="button"
                      className="text-gray-400 hover:text-gray-500"
                      onClick={onClose}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <span className="sr-only">Close panel</span>
                      <svg className="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </motion.button>
                  </div>

                  <motion.div
                    className="mt-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 gap-4">
                        {/* Logo Upload Section */}
                        <motion.div
                          initial={{ y: 20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: 0.45 }}
                        >
                          <div className="mb-4">
                            <label className="mb-1 block text-sm font-medium text-gray-700">Logo</label>
                            <input
                              type="file"
                              ref={fileInputRef}
                              onChange={handleFileChange}
                              accept="image/*"
                              className="hidden"
                            />
                            <div
                              className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-6 transition-colors hover:border-blue-500"
                              onClick={triggerFileInput}
                            >
                              {previewImage ? (
                                <div className="relative mb-4 h-32 w-32">
                                  <Image
                                    src={previewImage}
                                    alt="Logo preview"
                                    fill
                                    className="rounded-md object-contain"
                                  />
                                </div>
                              ) : (
                                <RiUploadCloud2Line className="mb-2 size-12 text-gray-400" />
                              )}
                              <p className="text-center text-sm text-gray-600">
                                {previewImage
                                  ? "Click to change logo"
                                  : "Drag & drop your logo here or click to browse"}
                              </p>
                              <p className="mt-1 text-xs text-gray-500">PNG, JPG up to 2MB</p>
                            </div>
                          </div>
                        </motion.div>

                        <motion.div
                          initial={{ y: 20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: 0.5 }}
                        >
                          <FormInputModule
                            label="Company Name*"
                            type="text"
                            placeholder="Enter Company Name"
                            value={formData.companyName}
                            onChange={handleInputChange("companyName")}
                            className="w-full"
                          />
                        </motion.div>

                        <motion.div
                          initial={{ y: 20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: 0.55 }}
                        >
                          <FormInputModule
                            label="Short Name*"
                            type="text"
                            placeholder="Enter Short Name"
                            value={formData.shortName}
                            onChange={handleInputChange("shortName")}
                            className="w-full"
                          />
                        </motion.div>

                        <motion.div
                          initial={{ y: 20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: 0.6 }}
                        >
                          <FormInputModule
                            label="GSTIN*"
                            type="text"
                            placeholder="Enter GSTIN"
                            value={formData.gstin}
                            onChange={handleInputChange("gstin")}
                            className="w-full"
                          />
                        </motion.div>

                        <motion.div
                          initial={{ y: 20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: 0.65 }}
                        >
                          <FormInputModule
                            label="CIN"
                            type="text"
                            placeholder="Enter CIN"
                            value={formData.cin}
                            onChange={handleInputChange("cin")}
                            className="w-full"
                          />
                        </motion.div>

                        <motion.div
                          initial={{ y: 20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: 0.7 }}
                        >
                          <FormInputModule
                            label="Address"
                            type="text"
                            placeholder="Enter Address"
                            value={formData.address}
                            onChange={handleInputChange("address")}
                            className="w-full"
                          />
                        </motion.div>

                        <motion.div
                          initial={{ y: 20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: 0.75 }}
                        >
                          <FormInputModule
                            label="Email*"
                            type="email"
                            placeholder="Enter Email"
                            value={formData.emailId}
                            onChange={handleInputChange("emailId")}
                            className="w-full"
                          />
                        </motion.div>

                        <motion.div
                          initial={{ y: 20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: 0.8 }}
                        >
                          <FormInputModule
                            label="Phone Number*"
                            type="tel"
                            placeholder="Enter Phone Number"
                            value={formData.phoneNumber}
                            onChange={handleInputChange("phoneNumber")}
                            className="w-full"
                          />
                        </motion.div>

                        <motion.div
                          initial={{ y: 20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: 0.85 }}
                        >
                          <label className="mb-1 block text-sm font-medium text-gray-700">Business Type*</label>
                          <select
                            value={formData.businessType}
                            onChange={handleSelectChange("businessType")}
                            className="w-full rounded-md border border-gray-300 bg-transparent p-2 text-sm focus:border-blue-500 focus:ring-blue-500"
                          >
                            <option value="Retail">Retail</option>
                            <option value="Wholesale">Wholesale</option>
                            <option value="Manufacturer">Manufacturer</option>
                          </select>
                        </motion.div>

                        <motion.div
                          initial={{ y: 20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: 0.9 }}
                        >
                          <label className="mb-1 block text-sm font-medium text-gray-700">Business Category*</label>
                          <select
                            value={formData.businessCategory}
                            onChange={handleSelectChange("businessCategory")}
                            className="w-full rounded-md border border-gray-300 bg-transparent p-2 text-sm focus:border-blue-500 focus:ring-blue-500"
                          >
                            <option value="Pharmacy Medical">Pharmacy Medical</option>
                            <option value="Hospital">Hospital</option>
                            <option value="Clinic">Clinic</option>
                            <option value="Diagnostic Center">Diagnostic Center</option>
                          </select>
                        </motion.div>
                      </div>
                    </div>
                  </motion.div>
                </div>

                <motion.div
                  className="border-t border-gray-200 p-6"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.95 }}
                >
                  <div className="flex justify-end space-x-3">
                    <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                      <ButtonModule
                        variant="outline"
                        size="md"
                        onClick={onClose}
                        className="rounded-md"
                        disabled={isLoading}
                      >
                        Cancel
                      </ButtonModule>
                    </motion.div>

                    <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                      <ButtonModule
                        variant="primary"
                        size="md"
                        onClick={handleSubmit}
                        className="rounded-md"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <motion.div
                            className="flex items-center justify-center"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                          >
                            <svg
                              className="mr-2 size-5 animate-spin"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                              ></path>
                            </svg>
                            Processing...
                          </motion.div>
                        ) : (
                          <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                            Add Organization
                          </motion.span>
                        )}
                      </ButtonModule>
                    </motion.div>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

const AddLoyaltyModal: React.FC<LoyaltyModalProps> = ({ isOpen, onClose, onLoyaltyAdded }) => {
  const dispatch = useAppDispatch()
  const organisations = useAppSelector((state) => state.userManagement.organisations)
  const [isLoading, setIsLoading] = useState(false)

  const [formData, setFormData] = useState({
    organisationId: "",
    currencyCode: "QAR",
    points: "",
    rateValue: "",
  })

  const handleInputChange =
    (field: keyof typeof formData) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setFormData((prev) => ({
        ...prev,
        [field]: e.target.value,
      }))
    }

  const handleSubmit = async () => {
    // Validate required fields
    const requiredFields: (keyof typeof formData)[] = ["organisationId", "currencyCode", "points", "rateValue"]
    const missingFields = requiredFields.filter((field) => !formData[field])

    if (missingFields.length > 0) {
      notify("error", "Please fill all required fields", {
        title: "Validation Error",
        description: `Missing: ${missingFields.join(", ")}`,
      })
      return
    }

    // Validate numeric fields
    if (isNaN(Number(formData.points)) || Number(formData.points) <= 0) {
      notify("error", "Invalid points value", {
        title: "Validation Error",
        description: "Points must be a positive number",
      })
      return
    }

    if (isNaN(Number(formData.rateValue)) || Number(formData.rateValue) <= 0) {
      notify("error", "Invalid rate value", {
        title: "Validation Error",
        description: "Rate value must be a positive number",
      })
      return
    }

    setIsLoading(true)

    // Prepare the payload
    const payload = {
      organisationId: Number(formData.organisationId),
      currencyCode: formData.currencyCode,
      points: Number(formData.points),
      rateValue: Number(formData.rateValue),
    }

    // Dispatch the action
    const result = await dispatch(createLoyaltyConversion(payload))

    if (result.error) {
      notify("error", "Loyalty points creation failed", {
        title: "Error",
        description: result.error,
      })
    } else {
      // Success case
      notify("success", "Loyalty points added successfully!", {
        title: "Success",
        description: "The loyalty points conversion has been created.",
      })

      // Reset form and close modal
      setFormData({
        organisationId: "",
        currencyCode: "QAR",
        points: "",
        rateValue: "",
      })

      onClose()
      if (onLoyaltyAdded) onLoyaltyAdded()
    }

    setIsLoading(false)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
          />

          <motion.div
            className="absolute inset-y-0 right-0 flex max-w-full pl-10"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 400 }}
          >
            <div className="w-screen max-w-md">
              <motion.div
                className="flex h-full flex-col bg-white shadow-xl"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
              >
                <div className="flex-1 overflow-y-auto p-6">
                  <div className="flex items-start justify-between">
                    <motion.h2
                      className="text-lg font-semibold text-gray-900"
                      initial={{ y: -20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      Add Loyalty Points Conversion
                    </motion.h2>
                    <motion.button
                      type="button"
                      className="text-gray-400 hover:text-gray-500"
                      onClick={onClose}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <span className="sr-only">Close panel</span>
                      <svg className="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </motion.button>
                  </div>

                  <motion.div
                    className="mt-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 gap-4">
                        <motion.div
                          initial={{ y: 20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: 0.45 }}
                        >
                          <label className="mb-1 block text-sm font-medium text-gray-700">Organization*</label>
                          <select
                            value={formData.organisationId}
                            onChange={handleInputChange("organisationId")}
                            className="w-full rounded-md border border-gray-300 bg-transparent p-2 text-sm focus:border-blue-500 focus:ring-blue-500"
                          >
                            <option value="">Select Organization</option>
                            {organisations.map((org) => (
                              <option key={org.id} value={org.id}>
                                {org.companyName}
                              </option>
                            ))}
                          </select>
                        </motion.div>

                        <motion.div
                          initial={{ y: 20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: 0.5 }}
                        >
                          <label className="mb-1 block text-sm font-medium text-gray-700">Currency Code*</label>
                          <select
                            value={formData.currencyCode}
                            onChange={handleInputChange("currencyCode")}
                            className="w-full rounded-md border border-gray-300 bg-transparent p-2 text-sm focus:border-blue-500 focus:ring-blue-500"
                          >
                            <option value="QAR">QAR</option>
                            <option value="USD">USD</option>
                            <option value="EUR">EUR</option>
                            <option value="GBP">GBP</option>
                          </select>
                        </motion.div>

                        <motion.div
                          initial={{ y: 20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: 0.55 }}
                        >
                          <FormInputModule
                            label="Points*"
                            type="number"
                            placeholder="Enter points"
                            value={formData.points}
                            onChange={handleInputChange("points")}
                            className="w-full"
                          />
                        </motion.div>

                        <motion.div
                          initial={{ y: 20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: 0.6 }}
                        >
                          <FormInputModule
                            label="Rate Value*"
                            type="number"
                            placeholder="Enter rate value"
                            value={formData.rateValue}
                            onChange={handleInputChange("rateValue")}
                            className="w-full"
                          />
                        </motion.div>
                      </div>
                    </div>
                  </motion.div>
                </div>

                <motion.div
                  className="border-t border-gray-200 p-6"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.65 }}
                >
                  <div className="flex justify-end space-x-3">
                    <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                      <ButtonModule
                        variant="outline"
                        size="md"
                        onClick={onClose}
                        className="rounded-md"
                        disabled={isLoading}
                      >
                        Cancel
                      </ButtonModule>
                    </motion.div>

                    <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                      <ButtonModule
                        variant="primary"
                        size="md"
                        onClick={handleSubmit}
                        className="rounded-md"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <motion.div
                            className="flex items-center justify-center"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                          >
                            <svg
                              className="mr-2 size-5 animate-spin"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                              ></path>
                            </svg>
                            Processing...
                          </motion.div>
                        ) : (
                          <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                            Add Loyalty Points
                          </motion.span>
                        )}
                      </ButtonModule>
                    </motion.div>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default function OrganizationsPage() {
  const dispatch = useAppDispatch()
  const organisations = useAppSelector((state) => state.userManagement.organisations)
  const loading = useAppSelector((state) => state.userManagement.organisationsLoading)
  const error = useAppSelector((state) => state.userManagement.organisationsError)
  const [isOrgModalOpen, setIsOrgModalOpen] = useState(false)
  const [isLoyaltyModalOpen, setIsLoyaltyModalOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    dispatch(fetchOrganisations())
  }, [dispatch])

  const handleOrganisationAdded = () => {
    dispatch(fetchOrganisations())
  }

  const handleLoyaltyAdded = () => {
    // Refresh data if needed
    dispatch(fetchOrganisations())
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

  const handleClearSearch = () => {
    setSearchTerm("")
  }

  const filteredOrganisations = organisations.filter((org) => {
    const searchLower = searchTerm.toLowerCase()
    return (
      org.companyName.toLowerCase().includes(searchLower) ||
      org.shortName.toLowerCase().includes(searchLower) ||
      org.gstin.toLowerCase().includes(searchLower) ||
      org.emailId.toLowerCase().includes(searchLower) ||
      (org.address && org.address.toLowerCase().includes(searchLower))
    )
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNav />

      <div className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-medium text-gray-900 md:text-2xl">Organizations</h1>
          <div className="flex items-center gap-4">
            <div className="flex h-[37px] w-[380px] items-center justify-between gap-3 rounded-full border bg-[#F4F9F8] px-3 py-1 text-[#707070] transition-all duration-200 focus-within:ring-2 focus-within:ring-[#00a4a6] focus-within:ring-offset-2 hover:border-[#00a4a6]">
              <Image src="/DashboardImages/Search.svg" width={16} height={16} alt="Search Icon" />
              <input
                type="text"
                id="search"
                placeholder="Search organizations..."
                className="h-[50px] w-full bg-transparent outline-none"
                value={searchTerm}
                onChange={handleSearchChange}
              />
              {searchTerm && (
                <RxCross2 onClick={handleClearSearch} className="cursor-pointer text-gray-400 hover:text-gray-600" />
              )}
            </div>
            <div className="flex gap-2">
              <ButtonModule
                variant="outline"
                size="md"
                className="flex items-center gap-2"
                onClick={() => setIsOrgModalOpen(true)}
              >
                <RiBuilding2Fill className="size-5 text-[#00a4a6]" />
                Add Organization
              </ButtonModule>
              <ButtonModule
                variant="primary"
                size="md"
                className="flex items-center gap-2"
                onClick={() => setIsLoyaltyModalOpen(true)}
              >
                <RiCoinsLine className="size-5 text-white" />
                Add Loyalty Bonus
              </ButtonModule>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-lg bg-red-100 p-4 text-red-700">Error loading organizations: {error}</div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 animate-pulse rounded-lg bg-white shadow-sm">
                <div className="h-40 rounded-t-lg bg-gray-200"></div>
                <div className="p-4">
                  <div className="h-5 w-3/4 rounded bg-gray-200"></div>
                  <div className="mt-2 h-4 w-1/2 rounded bg-gray-200"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredOrganisations.map((org) => (
              <div
                key={org.id}
                className="overflow-hidden rounded-lg bg-white shadow-sm transition-all hover:shadow-md"
              >
                <div className="border-b p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex min-h-10 min-w-10 items-center justify-center overflow-hidden rounded-md bg-blue-100">
                        {org.logo ? (
                          org.logo.startsWith("data:image") ? (
                            // If it's already a proper data URL
                            <img
                              src={org.logo}
                              alt={`${org.companyName} logo`}
                              width={40}
                              height={40}
                              className="object-contain"
                            />
                          ) : (
                            // If it's raw base64 data, detect PNG vs JPEG
                            <img
                              src={
                                // Check if the string looks like PNG data (PNG magic number in base64)
                                org.logo.startsWith("iVBORw0KGgo") || org.logo.startsWith("/9j/4AAQSkZJRg") // Example JPEG header
                                  ? `data:image/png;base64,${org.logo}`
                                  : `data:image/jpeg;base64,${org.logo}`
                              }
                              alt=""
                              width={40}
                              height={40}
                              className="object-contain"
                            />
                          )
                        ) : (
                          <RiBuilding2Fill className="min-h-5 min-w-5 text-[#00a4a6]" />
                        )}
                      </div>
                      <h3 className="font-medium text-gray-900">{org.companyName}</h3>
                    </div>
                    <span className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600">{org.shortName}</span>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex  text-sm text-gray-600">
                    <BiMap className="mr-2 size-4 shrink-0 text-gray-400" />
                    <p className="mb-4 line-clamp-2 text-sm text-gray-600">{org.address}</p>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center text-sm text-gray-600">
                      <BiBarcode className="mr-2 size-4 shrink-0 text-gray-400" />
                      <span className="truncate">GSTIN: {org.gstin}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <BiMapPin className="mr-2 size-4 shrink-0 text-gray-400" />
                      <span className="truncate">CIN: {org.cin}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <BiMailSend className="mr-2 size-4 shrink-0 text-gray-400" />
                      <span className="truncate">Email: {org.emailId}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <BiPhone className="mr-2 size-4 shrink-0 text-gray-400" />
                      <span className="truncate">Phone: {org.phoneNumber}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <AddOrganisationModal
          isOpen={isOrgModalOpen}
          onClose={() => setIsOrgModalOpen(false)}
          onOrganisationAdded={handleOrganisationAdded}
        />

        <AddLoyaltyModal
          isOpen={isLoyaltyModalOpen}
          onClose={() => setIsLoyaltyModalOpen(false)}
          onLoyaltyAdded={handleLoyaltyAdded}
        />
      </div>
    </div>
  )
}
