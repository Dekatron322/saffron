// components/ui/Modal/wallet-modal.tsx
import React, { useEffect, useState } from "react"
import { FormInputModule } from "components/ui/Input/Input"
import { ButtonModule } from "components/ui/Button/Button"
import { useAppDispatch } from "app/api/store/store"
import { notify } from "components/ui/Notification/Notification"
import { AnimatePresence, motion } from "framer-motion"

interface WalletModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (walletData: any) => Promise<void>
  customer: any
  action: "create" | "update"
  existingWalletId?: number | null
}

interface WalletData {
  customerId: number
  date: string
  paymentType: string
  amount: number
  description: string
  receivedAmount: number
}

const WalletModal: React.FC<WalletModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  customer,
  action,
  existingWalletId = null,
}) => {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<WalletData>({
    customerId: customer?.customerProfileId || 0,
    date: new Date().toISOString().slice(0, 10), // Today's date in YYYY-MM-DD
    paymentType: "Credit Card",
    amount: 0,
    description: "Wallet top-up",
    receivedAmount: 0,
  })
  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  useEffect(() => {
    if (customer) {
      setFormData((prev) => ({
        ...prev,
        customerId: customer.customerProfileId,
        description: action === "create" ? "Wallet top-up" : "Wallet update",
      }))
    }
    // Clear errors when modal opens
    setErrors({})
  }, [customer, action, isOpen])

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {}

    if (!formData.customerId || formData.customerId <= 0) {
      newErrors.customerId = "Valid customer ID is required"
    }

    if (!formData.date) {
      newErrors.date = "Date is required"
    }

    if (!formData.paymentType) {
      newErrors.paymentType = "Payment type is required"
    }

    if (!formData.amount || formData.amount <= 0) {
      newErrors.amount = "Amount must be greater than 0"
    }

    if (!formData.receivedAmount || formData.receivedAmount <= 0) {
      newErrors.receivedAmount = "Received amount must be greater than 0"
    }

    if (formData.amount !== formData.receivedAmount) {
      newErrors.receivedAmount = "Amount and received amount should be equal for wallet top-up"
    }

    if (!formData.description) {
      newErrors.description = "Description is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field: keyof WalletData) => (value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  const handleNumberInputChange = (field: keyof WalletData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0
    setFormData((prev) => ({
      ...prev,
      [field]: value,
      // For amount fields, set receivedAmount equal to amount automatically
      ...(field === "amount" ? { receivedAmount: value } : {}),
    }))

    // Clear errors
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
    if (field === "amount" && errors.receivedAmount) {
      setErrors((prev) => ({ ...prev, receivedAmount: "" }))
    }
  }

  // In WalletModal component - update the handleSubmit function

  const handleSubmit = async () => {
    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      await onSubmit(formData)
      // REMOVED: notify call from here - let the parent component handle success notifications
      onClose()
    } catch (error: any) {
      console.error("Wallet submission error:", error)

      // Use the error message as-is without transformation
      let errorMessage = error.message || "Failed to process wallet operation"

      notify("error", errorMessage, {
        title: "Error",
        description: errorMessage,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const paymentTypes = ["Credit Card", "Debit Card", "UPI", "Net Banking", "Cash", "Wallet Transfer"]

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
                      {action === "create" ? "Create Wallet" : "Update Wallet"} for {customer?.customerName}
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
                            label="Customer ID"
                            type="text"
                            value={formData.customerId.toString()}
                            disabled
                            className="w-full"
                            error={!!errors.customerId}
                            helperText={errors.customerId}
                            placeholder={""}
                            onChange={function (e: React.ChangeEvent<HTMLInputElement>): void {
                              throw new Error("Function not implemented.")
                            }}
                          />
                        </motion.div>

                        <motion.div
                          initial={{ y: 20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: 0.55 }}
                        >
                          <FormInputModule
                            label="Date*"
                            type="date"
                            value={formData.date}
                            onChange={(e) => handleInputChange("date")(e.target.value)}
                            className="w-full"
                            error={!!errors.date}
                            helperText={errors.date}
                            placeholder={""}
                          />
                        </motion.div>

                        <motion.div
                          initial={{ y: 20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: 0.6 }}
                        >
                          <label className="mb-2 block text-sm font-medium text-gray-700">Payment Type*</label>
                          <select
                            value={formData.paymentType}
                            onChange={(e) => handleInputChange("paymentType")(e.target.value)}
                            className={`w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-1 ${
                              errors.paymentType
                                ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                                : "focus:border-primary focus:ring-primary border-gray-300"
                            }`}
                          >
                            {paymentTypes.map((type) => (
                              <option key={type} value={type}>
                                {type}
                              </option>
                            ))}
                          </select>
                          {errors.paymentType && <p className="mt-1 text-sm text-red-600">{errors.paymentType}</p>}
                        </motion.div>

                        <motion.div
                          initial={{ y: 20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: 0.65 }}
                        >
                          <FormInputModule
                            label="Amount*"
                            type="number"
                            placeholder="Enter amount"
                            value={formData.amount.toString()}
                            onChange={handleNumberInputChange("amount")}
                            className="w-full"
                            error={!!errors.amount}
                            helperText={errors.amount}
                          />
                        </motion.div>

                        <motion.div
                          initial={{ y: 20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: 0.7 }}
                        >
                          <FormInputModule
                            label="Received Amount*"
                            type="number"
                            placeholder="Enter received amount"
                            value={formData.receivedAmount.toString()}
                            onChange={handleNumberInputChange("receivedAmount")}
                            className="w-full"
                            error={!!errors.receivedAmount}
                            helperText={errors.receivedAmount}
                          />
                        </motion.div>

                        <motion.div
                          initial={{ y: 20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: 0.75 }}
                        >
                          <FormInputModule
                            label="Description*"
                            type="text"
                            placeholder="Enter description"
                            value={formData.description}
                            onChange={(e) => handleInputChange("description")(e.target.value)}
                            className="w-full"
                            error={!!errors.description}
                            helperText={errors.description}
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
                            {action === "create" ? "Creating..." : "Updating..."}
                          </motion.div>
                        ) : (
                          <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                            {action === "create" ? "Create Wallet" : "Update Wallet"}
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

export default WalletModal
