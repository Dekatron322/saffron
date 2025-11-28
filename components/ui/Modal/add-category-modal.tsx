"use client"

import React, { useState } from "react"
import Modal from "react-modal"
import CloseIcon from "public/close-icon"
import { ButtonModule } from "../Button/Button"
import { FormInputModule } from "../Input/Input"
import { useDispatch } from "react-redux"
import { createCategory } from "app/api/store/productSlice"
import { notify } from "../Notification/Notification"
import { motion } from "framer-motion"

interface AddCategoryModalProps {
  isOpen: boolean
  onClose: () => void
}

const AddCategoryModal: React.FC<AddCategoryModalProps> = ({ isOpen, onClose }) => {
  const dispatch = useDispatch()
  const [categoryName, setCategoryName] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCategoryName(e.target.value)
  }

  const handleSubmit = async () => {
    if (!categoryName.trim()) {
      notify("error", "Please enter a category name", {
        title: "Validation Error",
        duration: 3000,
      })
      return
    }

    try {
      setIsLoading(true)
      // Dispatch the createCategory action and wait for it to complete
      await dispatch(createCategory(categoryName) as any)
      notify("success", "Category created successfully!", {
        title: "Success",
        duration: 4000,
      })
      setCategoryName("")
      onClose()
    } catch (error: any) {
      notify("error", error.message || "Failed to create category", {
        title: "Error",
        duration: 5000,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      className="mt-20 w-[350px] max-w-md overflow-hidden rounded-md bg-white shadow-lg outline-none"
      overlayClassName="fixed inset-0 bg-black bg-opacity-50 overflow-hidden flex items-center justify-center"
      ariaHideApp={false}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="flex w-full flex-col"
      >
        <div className="flex w-full items-center justify-between bg-[#F5F8FA] p-4">
          <motion.h2
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg font-bold"
          >
            Add New Category
          </motion.h2>
          <motion.div
            onClick={onClose}
            className="cursor-pointer"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <CloseIcon />
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-4 px-4 pb-6"
        >
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <FormInputModule
              label="Category Name"
              type="text"
              placeholder="Enter Category Name"
              value={categoryName}
              onChange={handleNameChange}
              className="mb-4"
            />
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <ButtonModule
              variant="primary"
              className="w-full rounded-md"
              size="lg"
              onClick={handleSubmit}
              disabled={!categoryName.trim() || isLoading}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
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
                  Add Category
                </motion.span>
              )}
            </ButtonModule>
          </motion.div>
        </motion.div>
      </motion.div>
    </Modal>
  )
}

export default AddCategoryModal
