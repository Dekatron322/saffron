import React, { useEffect, useState } from "react"
import { FormInputModule } from "../Input/Input"
import { ButtonModule } from "../Button/Button"
import { useAppDispatch } from "app/api/store/store"
import { updateCustomerWithoutToken } from "app/api/store/customerSlice"
import { notify } from "../Notification/Notification"
import { AnimatePresence, motion } from "framer-motion"

interface EditCustomerModalProps {
  isOpen: boolean
  onClose: () => void
  customer: {
    customerProfileId: number
    customerName: string
    customerEmail: string
    customerPhone: string
    customerAddress: string
    customerPassword: string
  } | null
  onCustomerUpdated?: () => void // Optional callback when customer is updated
}

const EditCustomerModal: React.FC<EditCustomerModalProps> = ({ isOpen, onClose, customer, onCustomerUpdated }) => {
  const dispatch = useAppDispatch()
  const [isLoading, setIsLoading] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  // Form state - only fields needed for API request
  const [formData, setFormData] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    customerAddress: "",
    customerPassword: "",
  })

  useEffect(() => {
    setIsMounted(true)
    return () => setIsMounted(false)
  }, [])

  // Initialize form with customer data when modal opens
  useEffect(() => {
    if (customer) {
      setFormData({
        customerName: customer.customerName,
        customerEmail: customer.customerEmail,
        customerPhone: customer.customerPhone,
        customerAddress: customer.customerAddress,
        customerPassword: customer.customerPassword,
      })
    }
  }, [customer])

  const handleInputChange = (field: keyof typeof formData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [field]: e.target.value,
    }))
  }

  const handleSubmit = async () => {
    if (!formData.customerName || !formData.customerPhone) {
      notify("error", "Please fill all required fields", {
        title: "Validation Error",
        description: "Name and Phone are required fields",
      })
      return
    }

    setIsLoading(true)

    try {
      await dispatch(
        updateCustomerWithoutToken(customer!.customerProfileId, {
          customerName: formData.customerName,
          customerEmail: formData.customerEmail,
          customerPhone: formData.customerPhone,
          customerAddress: formData.customerAddress,
          customerPassword: formData.customerPassword,
        })
      )
      notify("success", "Customer updated successfully!", {
        title: "Success",
        description: "The customer has been updated in the system.",
      })

      // Animate out before closing
      await new Promise((resolve) => setTimeout(resolve, 500))
      onClose()
      if (onCustomerUpdated) onCustomerUpdated()
    } catch (error) {
      notify("error", "Failed to update customer", {
        title: "Error",
        description: "There was an issue updating the customer. Please try again.",
      })
      console.error("Update customer error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && customer && (
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
                      Edit Customer
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
                          transition={{ delay: 0.5 }}
                        >
                          <FormInputModule
                            label="Full Name*"
                            type="text"
                            placeholder="Enter Full Name"
                            value={formData.customerName}
                            onChange={handleInputChange("customerName")}
                            className="w-full"
                          />
                        </motion.div>

                        <motion.div
                          initial={{ y: 20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: 0.55 }}
                        >
                          <FormInputModule
                            label="Phone Number*"
                            type="tel"
                            placeholder="Enter Phone Number"
                            value={formData.customerPhone}
                            onChange={handleInputChange("customerPhone")}
                            className="w-full"
                          />
                        </motion.div>

                        <motion.div
                          initial={{ y: 20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: 0.6 }}
                        >
                          <FormInputModule
                            label="Email Address"
                            type="email"
                            placeholder="Enter Email Address"
                            value={formData.customerEmail}
                            onChange={handleInputChange("customerEmail")}
                            className="w-full"
                          />
                        </motion.div>

                        <motion.div
                          initial={{ y: 20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: 0.65 }}
                        >
                          <FormInputModule
                            label="Address"
                            type="text"
                            placeholder="Enter Address"
                            value={formData.customerAddress}
                            onChange={handleInputChange("customerAddress")}
                            className="w-full"
                          />
                        </motion.div>

                        <motion.div
                          initial={{ y: 20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: 0.7 }}
                        >
                          <FormInputModule
                            label="Password*"
                            type="password"
                            placeholder="Enter Password"
                            value={formData.customerPassword}
                            onChange={handleInputChange("customerPassword")}
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
                  transition={{ delay: 0.8 }}
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
                            Updating...
                          </motion.div>
                        ) : (
                          <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                            Update Customer
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

export default EditCustomerModal
