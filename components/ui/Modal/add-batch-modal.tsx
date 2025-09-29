"use client"

import React, { useState } from "react"
import Modal from "react-modal"
import CloseIcon from "public/close-icon"
import { ButtonModule } from "../Button/Button"
import { FormInputModule } from "../Input/Input"
import { useDispatch } from "react-redux"
import { notify } from "../Notification/Notification"
import { createBatch } from "app/api/store/batchSlice"
import { motion } from "framer-motion"

interface AddBatchModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (batchData: { batchNo: string; mfg: string; mfgDate: string; expDate: string; mrp: number }) => void
}

const AddBatchModal: React.FC<AddBatchModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const dispatch = useDispatch()
  const [batchData, setBatchData] = useState({
    batchNo: "",
    mfg: "",
    mfgDate: "",
    expDate: "",
    mrp: 0,
    packing: "Box",
    productId: 1,
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setBatchData((prev) => ({
      ...prev,
      [name]: name === "mrp" ? Number(value) : value,
    }))
  }

  const handleSubmit = async () => {
    if (
      !batchData.batchNo.trim() ||
      !batchData.mfg.trim() ||
      !batchData.mfgDate ||
      !batchData.expDate ||
      batchData.mrp <= 0
    ) {
      notify("error", "Please fill in all required batch fields", {
        title: "Validation Error",
        duration: 3000,
      })
      return
    }

    if (new Date(batchData.expDate) <= new Date(batchData.mfgDate)) {
      notify("error", "Expiry date must be after manufacturing date", {
        title: "Validation Error",
        duration: 3000,
      })
      return
    }

    try {
      setIsLoading(true)

      const apiData = {
        mrp: batchData.mrp,
        batchNo: batchData.batchNo,
        mfg: batchData.mfg,
        mfgDate: batchData.mfgDate,
        expDate: batchData.expDate,
        packing: batchData.packing,
        product: {
          productId: batchData.productId,
        },
      }

      const result = await dispatch(createBatch(apiData) as any)

      if (result.error) {
        throw new Error(result.error.message || "Failed to create batch")
      }

      notify("success", "Batch created successfully!", {
        title: "Success",
        duration: 4000,
      })

      onSubmit({
        batchNo: batchData.batchNo,
        mfg: batchData.mfg,
        mfgDate: batchData.mfgDate,
        expDate: batchData.expDate,
        mrp: batchData.mrp,
      })

      setBatchData({
        batchNo: "",
        mfg: "",
        mfgDate: "",
        expDate: "",
        mrp: 0,
        packing: "Box",
        productId: 1,
      })
      onClose()
    } catch (error: any) {
      notify("error", error.message || "Failed to create batch", {
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
            Add New Batch
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
          <div className="grid grid-cols-2 gap-4">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <FormInputModule
                label="Batch Number *"
                name="batchNo"
                type="text"
                placeholder="Enter batch number"
                value={batchData.batchNo}
                onChange={handleInputChange}
                className="mb-4"
              />
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
              <FormInputModule
                label="Manufacturer (MFG) *"
                name="mfg"
                type="text"
                placeholder="Enter manufacturer"
                value={batchData.mfg}
                onChange={handleInputChange}
                className="mb-4"
              />
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <FormInputModule
                label="Manufacturing Date *"
                name="mfgDate"
                type="date"
                placeholder="Select date"
                value={batchData.mfgDate}
                onChange={handleInputChange}
                className="mb-4"
              />
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
              <FormInputModule
                label="Expiry Date *"
                name="expDate"
                type="date"
                placeholder="Select date"
                value={batchData.expDate}
                onChange={handleInputChange}
                className="mb-4"
              />
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <FormInputModule
                label="MRP *"
                name="mrp"
                type="number"
                placeholder="Enter MRP"
                value={batchData.mrp}
                onChange={handleInputChange}
                className="mb-4"
              />
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
              <FormInputModule
                label="Packing"
                name="packing"
                type="text"
                placeholder="Enter packing type"
                value={batchData.packing}
                onChange={handleInputChange}
                className="mb-4"
              />
            </motion.div>
          </div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <ButtonModule
              variant="primary"
              className="w-full rounded-md"
              size="lg"
              onClick={handleSubmit}
              disabled={
                !batchData.batchNo.trim() ||
                !batchData.mfg.trim() ||
                !batchData.mfgDate ||
                !batchData.expDate ||
                batchData.mrp <= 0 ||
                isLoading
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
                  Processing...
                </motion.div>
              ) : (
                <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  Add Batch
                </motion.span>
              )}
            </ButtonModule>
          </motion.div>
        </motion.div>
      </motion.div>
    </Modal>
  )
}

export default AddBatchModal
