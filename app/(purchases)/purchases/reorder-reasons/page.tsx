"use client"

import React, { useEffect, useState } from "react"
import { useAppDispatch, useAppSelector } from "app/api/store/store"
import {
  createPurchaseReturnReason,
  fetchPurchaseReturnReasons,
  selectPurchaseReturnReasons,
  selectPurchaseReturnReasonsError,
  selectPurchaseReturnReasonsLoading,
  selectCreatedReturnReason,
  selectCreateReturnReasonError,
  selectCreatingReturnReason,
} from "app/api/store/purchaseSlice"
import DashboardNav from "components/Navbar/DashboardNav"
import { FiAlertCircle, FiArrowLeft, FiBox, FiCalendar, FiXCircle } from "react-icons/fi"
import { ButtonModule } from "components/ui/Button/Button"
import Modal from "react-modal"
import CloseIcon from "public/close-icon"

import { motion } from "framer-motion"
import { notify } from "components/ui/Notification/Notification"
import { FormInputModule } from "components/ui/Input/Input"

interface PurchaseReturnReason {
  purchaseReturnReasonId: number
  reasonType: string
  description: string
}

interface AddReturnReasonModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

const AddReturnReasonModal: React.FC<AddReturnReasonModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const dispatch = useAppDispatch()
  const creating = useAppSelector(selectCreatingReturnReason)
  const error = useAppSelector(selectCreateReturnReasonError)
  const createdReason = useAppSelector(selectCreatedReturnReason)

  const [reasonData, setReasonData] = useState({
    reasonType: "",
    description: "",
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setReasonData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async () => {
    // Validate all fields
    if (!reasonData.reasonType.trim() || !reasonData.description.trim()) {
      notify("error", "Please fill in all fields", {
        title: "Validation Error",
        duration: 3000,
      })
      return
    }

    try {
      await dispatch(
        createPurchaseReturnReason({
          reasonType: reasonData.reasonType.trim(),
          description: reasonData.description.trim(),
        }) as any
      )

      if (!error) {
        notify("success", "Return reason created successfully!", {
          title: "Success",
          duration: 4000,
        })

        // Reset form and close modal
        setReasonData({
          reasonType: "",
          description: "",
        })
        onSuccess()
        onClose()
      }
    } catch (error: any) {
      notify("error", error.message || "Failed to create return reason", {
        title: "Error",
        duration: 5000,
      })
    }
  }

  // Handle error notifications
  useEffect(() => {
    if (error) {
      notify("error", error, {
        title: "Error Creating Return Reason",
        duration: 5000,
      })
    }
  }, [error])

  // Handle success notifications
  useEffect(() => {
    if (createdReason) {
      notify("success", "Return reason created successfully!", {
        title: "Success",
        duration: 4000,
      })
    }
  }, [createdReason])

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
            Add New Return Reason
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
              label="Reason Type"
              name="reasonType"
              type="text"
              placeholder="Enter reason type (e.g., Expired Product)"
              value={reasonData.reasonType}
              onChange={handleInputChange}
              className="mb-4"
            />
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <label className="mb-2 block text-sm font-medium text-gray-700">Description</label>
            <textarea
              name="description"
              placeholder="Enter detailed description of the return reason"
              value={reasonData.description}
              onChange={handleInputChange}
              className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 placeholder-gray-400 focus:border-[#00A4A6] focus:outline-none focus:ring-1 focus:ring-[#00A4A6] sm:text-sm"
              rows={3}
            />
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
            <ButtonModule
              variant="primary"
              className="mt-4 w-full rounded-md"
              size="lg"
              onClick={handleSubmit}
              disabled={!reasonData.reasonType.trim() || !reasonData.description.trim() || creating}
            >
              {creating ? (
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
                  Add Return Reason
                </motion.span>
              )}
            </ButtonModule>
          </motion.div>
        </motion.div>
      </motion.div>
    </Modal>
  )
}

const PurchaseReturnReasons = () => {
  const dispatch = useAppDispatch()
  const returnReasons = useAppSelector(selectPurchaseReturnReasons)
  const loading = useAppSelector(selectPurchaseReturnReasonsLoading)
  const error = useAppSelector(selectPurchaseReturnReasonsError)

  const [searchTerm, setSearchTerm] = useState("")
  const [filteredReasons, setFilteredReasons] = useState<PurchaseReturnReason[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    dispatch(fetchPurchaseReturnReasons())
  }, [dispatch])

  useEffect(() => {
    if (returnReasons && returnReasons.length > 0) {
      if (searchTerm) {
        const filtered = returnReasons.filter(
          (reason) =>
            reason.reasonType.toLowerCase().includes(searchTerm.toLowerCase()) ||
            reason.description.toLowerCase().includes(searchTerm.toLowerCase())
        )
        setFilteredReasons(filtered)
      } else {
        setFilteredReasons(returnReasons)
      }
    }
  }, [returnReasons, searchTerm])

  const getReasonTypeColor = (reasonType: string) => {
    const type = reasonType.toLowerCase()
    if (type.includes("expir")) return "bg-red-100 text-red-800"
    if (type.includes("damag")) return "bg-yellow-100 text-yellow-800"
    if (type.includes("broken")) return "bg-orange-100 text-orange-800"
    if (type.includes("leak")) return "bg-purple-100 text-purple-800"
    if (type.includes("duplicate")) return "bg-blue-100 text-blue-800"
    if (type.includes("substitut")) return "bg-indigo-100 text-indigo-800"
    if (type.includes("overcharg")) return "bg-pink-100 text-pink-800"
    return "bg-gray-100 text-gray-800"
  }

  const getReasonIcon = (reasonType: string) => {
    const type = reasonType.toLowerCase()
    if (type.includes("expir")) return <FiCalendar className="h-5 w-5 text-red-500" />
    if (type.includes("damag")) return <FiXCircle className="h-5 w-5 text-yellow-500" />
    if (type.includes("broken")) return <FiXCircle className="h-5 w-5 text-orange-500" />
    if (type.includes("leak")) return <FiAlertCircle className="h-5 w-5 text-purple-500" />
    if (type.includes("duplicate")) return <FiBox className="h-5 w-5 text-blue-500" />
    if (type.includes("substitut")) return <FiAlertCircle className="h-5 w-5 text-indigo-500" />
    if (type.includes("overcharg")) return <FiAlertCircle className="h-5 w-5 text-pink-500" />
    return <FiBox className="h-5 w-5 text-gray-500" />
  }

  const handleAddSuccess = () => {
    // Refresh the list after successful addition
    dispatch(fetchPurchaseReturnReasons())
  }

  if (loading) {
    return (
      <>
        <DashboardNav />
        <div className="min-h-screen bg-[#F4F9F8] p-3 md:p-8">
          <div className="mx-auto w-full ">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Purchase Return Reasons</h1>
                <p className="text-gray-600">Loading return reasons...</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="animate-pulse rounded-lg bg-white p-6 shadow-sm">
                  <div className="mb-3 h-5 w-32 rounded bg-gray-200"></div>
                  <div className="h-4 w-48 rounded bg-gray-200"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </>
    )
  }

  if (error) {
    return (
      <>
        <DashboardNav />
        <div className="flex min-h-screen items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-red-100 p-4 text-red-600">
              <FiXCircle className="h-8 w-8" />
            </div>
            <h2 className="mb-2 text-xl font-semibold text-gray-800">Error Loading Return Reasons</h2>
            <p className="mb-4 text-gray-600">{error}</p>
            <button
              onClick={() => window.history.back()}
              className="flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <FiArrowLeft className="mr-2" />
              Go Back
            </button>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <DashboardNav />
      <div className="min-h-screen bg-[#F4F9F8] p-3 md:p-8">
        <div className="mx-auto w-full">
          {/* Header */}
          <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div className="flex gap-4">
              <button
                onClick={() => window.history.back()}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-300 bg-white text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <FiArrowLeft />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Purchase Return Reasons</h1>
                <p className="text-gray-600">Manage reasons for returning purchased items</p>
              </div>
            </div>

            <ButtonModule type="button" variant="primary" size="sm" onClick={() => setIsModalOpen(true)}>
              Add Return Reason
            </ButtonModule>
          </div>

          {/* Search Box */}
          <div className="relative max-w-lg">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <svg
                className="h-5 w-5 text-gray-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search return reasons..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full rounded-full border border-gray-300 bg-[#f4f9f8] py-2 pl-10 pr-3 leading-5 placeholder-gray-500 focus:border-[#00A4A6] focus:placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#00A4A6] sm:text-sm"
            />
          </div>

          {/* Results Count */}
          <div className="my-4 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              {filteredReasons.length} {filteredReasons.length === 1 ? "reason" : "reasons"} found
            </p>
          </div>

          {/* Return Reasons Grid */}
          {filteredReasons.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredReasons.map((reason) => (
                <div
                  key={reason.purchaseReturnReasonId}
                  className="flex flex-col rounded-lg bg-white p-6 shadow-sm transition-all hover:shadow-md"
                >
                  <div className="flex items-start">
                    <div className="flex-shrink-0">{getReasonIcon(reason.reasonType)}</div>
                    <div className="ml-4 flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-900">{reason.reasonType}</h3>
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getReasonTypeColor(
                            reason.reasonType
                          )}`}
                        >
                          ID: {reason.purchaseReturnReasonId}
                        </span>
                      </div>
                      <p className="mt-2 text-gray-600">{reason.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-lg bg-white py-12 shadow-sm">
              <FiBox className="h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-semibold text-gray-900">No return reasons found</h3>
              <p className="mt-2 text-gray-600">Try adjusting your search term</p>
            </div>
          )}

          {/* Add Return Reason Modal */}
          <AddReturnReasonModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSuccess={handleAddSuccess}
          />
        </div>
      </div>
    </>
  )
}

export default PurchaseReturnReasons
