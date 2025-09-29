// components/Modals/DeleteCustomerModal.tsx
"use client"

import React, { useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import CloseIcon from "public/close-icon"
import { ButtonModule } from "../Button/Button"
import { FormInputModule } from "../Input/Input"

interface DeleteCustomerModalProps {
  isOpen: boolean
  onRequestClose: () => void
  onConfirm: (reason: string) => Promise<void>
  loading: boolean
  customerName: string
}

const DeleteCustomerModal: React.FC<DeleteCustomerModalProps> = ({
  isOpen,
  onRequestClose,
  onConfirm,
  loading,
  customerName,
}) => {
  const [deleteReason, setDeleteReason] = useState("")

  const handleReasonChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDeleteReason(e.target.value)
  }

  const handleConfirm = async () => {
    await onConfirm(deleteReason)
    setDeleteReason("")
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50"
            onClick={onRequestClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
          />

          <motion.div
            className="relative w-[350px] max-w-md rounded-md bg-white shadow-lg outline-none"
            initial={{ scale: 0.9, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 20, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 400 }}
          >
            <motion.div
              className="flex w-full items-center justify-between bg-[#F5F8FA] p-4"
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              <h2 className="text-lg font-bold">Deactivate Customer</h2>
              <motion.div
                onClick={onRequestClose}
                className="cursor-pointer"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <CloseIcon />
              </motion.div>
            </motion.div>

            <motion.div
              className="px-4 pb-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <motion.p
                className="my-4 text-red-600"
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                Warning: This action cannot be undone. Are you sure you want to delete <strong>{customerName}</strong>?
              </motion.p>

              <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }}>
                <FormInputModule
                  label="Reason for Deletion (Optional)"
                  type="text"
                  placeholder="Enter reason for deletion"
                  value={deleteReason}
                  onChange={handleReasonChange}
                  className="mb-4 w-full"
                />
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <ButtonModule
                  variant="danger"
                  className="w-full rounded-md"
                  size="lg"
                  onClick={handleConfirm}
                  disabled={loading}
                >
                  {loading ? (
                    <motion.div
                      className="flex items-center justify-center"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <svg
                        className="mr-2 h-5 w-5 animate-spin"
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
                      Deleting...
                    </motion.div>
                  ) : (
                    <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      Delete Customer
                    </motion.span>
                  )}
                </ButtonModule>
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default DeleteCustomerModal
