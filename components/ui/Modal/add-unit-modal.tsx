"use client"

import React, { useState } from "react"
import Modal from "react-modal"
import CloseIcon from "public/close-icon"
import { ButtonModule } from "../Button/Button"
import { FormInputModule } from "../Input/Input"
import { useDispatch } from "react-redux"
import { notify } from "../Notification/Notification"
import { addUnit } from "app/api/store/unitSlice"
import { AnimatePresence, motion } from "framer-motion"

interface AddUnitModalProps {
  isOpen: boolean
  onClose: () => void
}

const AddUnitModal: React.FC<AddUnitModalProps> = ({ isOpen, onClose }) => {
  const dispatch = useDispatch()
  const [unitData, setUnitData] = useState({
    baseUnit: "",
    secondaryUnit: "",
    shortName: "",
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setUnitData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async () => {
    // Validate all fields
    if (!unitData.baseUnit.trim() || !unitData.secondaryUnit.trim() || !unitData.shortName.trim()) {
      notify("error", "Please fill in all unit fields", {
        title: "Validation Error",
        duration: 3000,
      })
      return
    }

    // Validate short name length
    if (unitData.shortName.length > 3) {
      notify("error", "Short name must be 3 characters or less", {
        title: "Validation Error",
        duration: 3000,
      })
      return
    }

    try {
      setIsLoading(true)
      // Dispatch the addUnit action
      await dispatch(
        addUnit({
          baseUnit: unitData.baseUnit.trim(),
          secondaryUnit: unitData.secondaryUnit.trim(),
          shortName: unitData.shortName.trim().toUpperCase(), // Convert to uppercase
        }) as any
      )

      notify("success", "Unit created successfully!", {
        title: "Success",
        duration: 4000,
      })

      // Reset form and close modal
      setUnitData({
        baseUnit: "",
        secondaryUnit: "",
        shortName: "",
      })
      onClose()
    } catch (error: any) {
      notify("error", error.message || "Failed to create unit", {
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
      className="mt-20 w-[650px] max-w-md overflow-hidden rounded-md bg-white shadow-lg outline-none"
      overlayClassName="fixed inset-0 bg-black bg-opacity-50 overflow-hidden flex items-center justify-center"
      ariaHideApp={false}
    >
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -50 }}
        transition={{ duration: 0.3 }}
        className="flex w-full flex-col"
      >
        <div className="flex w-full items-center justify-between bg-[#F5F8FA] p-4">
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-lg font-bold"
          >
            Add New Unit
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
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <FormInputModule
              label="Base Unit"
              name="baseUnit"
              type="text"
              placeholder="Enter Base Unit (e.g., PACK)"
              value={unitData.baseUnit}
              onChange={handleInputChange}
              className="mb-4"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex w-full gap-3"
          >
            <motion.div
              className="w-full"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.35 }}
            >
              <FormInputModule
                label="Secondary Unit"
                name="secondaryUnit"
                type="text"
                placeholder="Enter Secondary Unit (e.g., BOTTLE)"
                value={unitData.secondaryUnit}
                onChange={handleInputChange}
                className="mb-4"
              />
            </motion.div>

            <motion.div
              className="w-full"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <FormInputModule
                label="Short Name"
                name="shortName"
                type="text"
                placeholder="Enter Short Name (e.g., PAC)"
                value={unitData.shortName}
                onChange={handleInputChange}
                className="mb-4"
              />
            </motion.div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
            <ButtonModule
              variant="primary"
              className="w-full rounded-md"
              size="lg"
              onClick={handleSubmit}
              disabled={
                !unitData.baseUnit.trim() || !unitData.secondaryUnit.trim() || !unitData.shortName.trim() || isLoading
              }
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
                  Add Unit
                </motion.span>
              )}
            </ButtonModule>
          </motion.div>
        </motion.div>
      </motion.div>
    </Modal>
  )
}

export default AddUnitModal
