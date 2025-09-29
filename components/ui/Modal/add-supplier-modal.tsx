// components/PaymentSidebar/PaymentSidebar.tsx
import React, { useState } from "react"
import { FormInputModule } from "../Input/Input"
import { ButtonModule } from "../Button/Button"
import { useAppDispatch } from "app/api/store/store"
import { createSupplier } from "app/api/store/supplierSlice"
import { notify } from "../Notification/Notification"

interface PaymentSidebarProps {
  isOpen: boolean
  onClose: () => void
}

const AddSupplierModal: React.FC<PaymentSidebarProps> = ({ isOpen, onClose }) => {
  const dispatch = useAppDispatch()
  const [formData, setFormData] = useState({
    name: "",
    contactDetails: "",
    address: "",
    email: "",
    gstNumber: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  if (!isOpen) return null

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target

    // Convert GST number to uppercase
    const processedValue = name === "gstNumber" ? value.toUpperCase() : value

    setFormData((prev) => ({
      ...prev,
      [name]: processedValue,
    }))
  }

  const handleSubmit = async () => {
    if (!formData.name || !formData.contactDetails || !formData.address || !formData.email) {
      setError("Please fill all required fields")
      notify("error", "Validation Error", {
        description: "Please fill all required fields",
      })
      return
    }

    setIsSubmitting(true)
    setError("")

    try {
      const result = await dispatch(createSupplier(formData)).unwrap()

      notify("success", "Supplier Added", {
        description: `${result.name} has been successfully added`,
      })

      // Reset form and close on success
      setFormData({
        name: "",
        contactDetails: "",
        address: "",
        email: "",
        gstNumber: "",
      })
      onClose()
    } catch (err: any) {
      const errorMessage = err || "Failed to create supplier"
      setError(errorMessage)
      notify("error", "Error", {
        description: errorMessage,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose}></div>
      <div className="absolute inset-y-0 right-0 flex max-w-full pl-10">
        <div className="w-screen max-w-2xl">
          <div className="flex h-full flex-col bg-white shadow-xl">
            <div className="flex-1 overflow-y-auto p-6">
              <div className="flex items-start justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Add Supplier</h2>
                <button type="button" className="text-gray-400 hover:text-gray-500" onClick={onClose}>
                  <span className="sr-only">Close panel</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {error && (
                <div className="mt-4 rounded-md bg-red-50 p-4">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              <div className="mt-6">
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-3">
                    <FormInputModule
                      label="Supplier Name*"
                      name="name"
                      type="text"
                      placeholder="Enter Supplier Name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full"
                    />
                    <FormInputModule
                      label="Contact Number*"
                      name="contactDetails"
                      type="tel"
                      placeholder="Enter Contact Number"
                      value={formData.contactDetails}
                      onChange={handleInputChange}
                      className="w-full"
                    />
                    <FormInputModule
                      label="Email Address*"
                      name="email"
                      type="email"
                      placeholder="Enter Email Address"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full"
                    />
                    <FormInputModule
                      label="GST Number"
                      name="gstNumber"
                      type="text"
                      placeholder="Enter GST Number"
                      value={formData.gstNumber}
                      onChange={handleInputChange}
                      className="w-full"
                    />
                    <FormInputModule
                      label="Address*"
                      name="address"
                      type="text"
                      placeholder="Enter Full Address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className="col-span-2 w-full"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 p-6">
              <div className="flex justify-end space-x-3">
                <ButtonModule
                  variant="outline"
                  size="md"
                  onClick={onClose}
                  className="rounded-md"
                  disabled={isSubmitting}
                >
                  Cancel
                </ButtonModule>
                <ButtonModule
                  variant="primary"
                  size="md"
                  onClick={handleSubmit}
                  className="rounded-md"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Submitting..." : "Submit"}
                </ButtonModule>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AddSupplierModal
