"use client"

import React, { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { useAppDispatch, useAppSelector } from "app/api/store/store"
import { FormInputModule } from "components/ui/Input/Input"
import { DropdownPopoverModule } from "components/ui/Input/DropdownModule"
import { ButtonModule } from "components/ui/Button/Button"
import { notify } from "components/ui/Notification/Notification"
import { RiUploadCloud2Line } from "react-icons/ri"
import Image from "next/image"
import {
  createExpense,
  CreateExpensePayload,
  CreateExpenseItem,
  fetchAllExpenseCategories,
  selectExpenses,
  createExpenseCategory,
  fetchAllExpenseTypes,
} from "app/api/store/financeSlice"
import { fetchAllBranches, selectBranches } from "app/api/store/productSlice"
import DashboardNav from "components/Navbar/DashboardNav"
import { AnimatePresence } from "framer-motion"

// Add Category Modal Component
interface AddCategoryModalProps {
  isOpen: boolean
  onClose: () => void
  onCategoryAdded?: () => void
}

const AddCategoryModal: React.FC<AddCategoryModalProps> = ({ isOpen, onClose, onCategoryAdded }) => {
  const dispatch = useAppDispatch()
  const { createCategoryLoading, createCategoryError, expenseTypes, expenseTypesLoading } =
    useAppSelector(selectExpenses)
  // Get branches from product slice
  const { branches, loading: branchesLoading } = useAppSelector(selectBranches)

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    expenseTypeId: 0,
    branchId: 0,
  })

  const handleInputChange =
    (field: keyof typeof formData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const value = e.target.value
      setFormData((prev) => ({
        ...prev,
        [field]: field === "expenseTypeId" || field === "branchId" ? parseInt(value) : value,
      }))
    }

  const handleExpenseTypeChange = (value: string) => {
    const selectedExpenseType = expenseTypes.find((type) => type.expenseType === value)
    if (selectedExpenseType) {
      setFormData((prev) => ({
        ...prev,
        expenseTypeId: selectedExpenseType.expenseTypeId,
      }))
    }
  }

  const handleBranchChange = (value: string) => {
    const selectedBranch = branches.find((branch) => branch.branchName === value)
    if (selectedBranch) {
      setFormData((prev) => ({
        ...prev,
        branchId: selectedBranch.branchId,
      }))
    }
  }

  const handleSubmit = async () => {
    // Validate required fields
    const requiredFields: (keyof typeof formData)[] = ["name", "description", "expenseTypeId", "branchId"]
    const missingFields = requiredFields.filter((field) => !formData[field])

    if (missingFields.length > 0) {
      notify("error", "Please fill all required fields", {
        title: "Validation Error",
        description: `Missing: ${missingFields.join(", ")}`,
      })
      return
    }

    try {
      await dispatch(createExpenseCategory(formData))

      notify("success", "Category added successfully!", {
        title: "Success",
        description: "The expense category has been added to the system.",
      })

      // Reset form and close modal
      setFormData({
        name: "",
        description: "",
        expenseTypeId: 0,
        branchId: 0,
      })

      onClose()
      if (onCategoryAdded) onCategoryAdded()
    } catch (error: any) {
      notify("error", "Category creation failed", {
        title: "Error",
        description: error?.message || "An unexpected error occurred",
      })
    }
  }

  // Clear form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        name: "",
        description: "",
        expenseTypeId: 0,
        branchId: 0,
      })
    }
  }, [isOpen])

  // Get display values for dropdowns
  const selectedExpenseTypeName =
    expenseTypes.find((type) => type.expenseTypeId === formData.expenseTypeId)?.expenseType || ""
  const selectedBranchName = branches.find((branch) => branch.branchId === formData.branchId)?.branchName || ""

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
                      Add New Expense Categorys
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

                  {/* Show error from Redux state */}
                  {createCategoryError && (
                    <motion.div
                      className="mt-4 rounded-lg bg-red-100 p-4 text-red-700"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      {createCategoryError}
                    </motion.div>
                  )}

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
                            label="Category Name*"
                            type="text"
                            placeholder="Enter Category Name"
                            value={formData.name}
                            onChange={handleInputChange("name")}
                            className="w-full"
                          />
                        </motion.div>

                        <motion.div
                          initial={{ y: 20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: 0.55 }}
                        >
                          <label className="mb-1 block text-sm font-medium text-gray-700">Description*</label>
                          <textarea
                            value={formData.description}
                            onChange={handleInputChange("description")}
                            placeholder="Enter category description"
                            rows={3}
                            className="w-full rounded-md border border-gray-300 bg-transparent p-2 text-sm focus:border-blue-500 focus:ring-blue-500"
                            disabled={createCategoryLoading}
                          />
                        </motion.div>

                        <motion.div
                          initial={{ y: 20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: 0.6 }}
                        >
                          <DropdownPopoverModule
                            label="Expense Type*"
                            options={expenseTypes.map((type) => ({
                              value: type.expenseType,
                              label: type.expenseType,
                            }))}
                            placeholder="Select Expense Type"
                            value={selectedExpenseTypeName}
                            onChange={handleExpenseTypeChange}
                            className="w-full"
                          />
                          {expenseTypesLoading && (
                            <div className="mt-1 flex items-center space-x-2 text-sm text-gray-500">
                              <div className="size-3 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"></div>
                              <span>Loading expense types...</span>
                            </div>
                          )}
                        </motion.div>

                        <motion.div
                          initial={{ y: 20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: 0.65 }}
                        >
                          <DropdownPopoverModule
                            label="Branch*"
                            options={branches.map((branch) => ({
                              value: branch.branchName,
                              label: `${branch.branchName} - ${branch.location}`,
                            }))}
                            placeholder="Select Branch"
                            value={selectedBranchName}
                            onChange={handleBranchChange}
                            className="w-full"
                          />
                          {branchesLoading && (
                            <div className="mt-1 flex items-center space-x-2 text-sm text-gray-500">
                              <div className="size-3 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"></div>
                              <span>Loading branches...</span>
                            </div>
                          )}
                        </motion.div>
                      </div>
                    </div>
                  </motion.div>
                </div>

                <motion.div
                  className="border-t border-gray-200 p-6"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.7 }}
                >
                  <div className="flex justify-end space-x-3">
                    <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                      <ButtonModule
                        variant="outline"
                        size="md"
                        onClick={onClose}
                        className="rounded-md"
                        disabled={createCategoryLoading}
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
                        disabled={createCategoryLoading}
                      >
                        {createCategoryLoading ? (
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
                            Creating...
                          </motion.div>
                        ) : (
                          <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                            Add Category
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

// Collapsible Expense Item Component
interface CollapsibleExpenseItemProps {
  item: CreateExpenseItem
  index: number
  onItemChange: (index: number, field: keyof CreateExpenseItem, value: any) => void
  onRemove: (index: number) => void
  categories: any[]
  categoriesLoading: boolean
  onAddCategory: () => void
  isLastItem: boolean
}

const CollapsibleExpenseItem: React.FC<CollapsibleExpenseItemProps> = ({
  item,
  index,
  onItemChange,
  onRemove,
  categories,
  categoriesLoading,
  onAddCategory,
  isLastItem,
}) => {
  const [isExpanded, setIsExpanded] = useState(isLastItem)

  const toggleExpand = () => {
    setIsExpanded(!isExpanded)
  }

  const isFormValid = () => {
    return item.description.trim() !== "" && item.categoryId > 0 && item.price > 0
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="overflow-hidden rounded-lg border border-gray-200"
    >
      <div
        className="flex cursor-pointer items-center justify-between bg-gray-50 p-4 transition-colors hover:bg-gray-100"
        onClick={toggleExpand}
      >
        <div className="flex items-center space-x-3">
          <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <svg className="size-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </motion.div>
          <h4 className="font-medium text-gray-900">Item {index + 1}</h4>
          {!isFormValid() && <span className="rounded bg-red-50 px-2 py-1 text-xs text-red-500">Incomplete</span>}
        </div>

        <div className="flex items-center space-x-2">
          {isFormValid() && <span className="rounded bg-green-50 px-2 py-1 text-xs text-green-600">Complete</span>}
          {index > 0 && (
            <motion.button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onRemove(index)
              }}
              className="rounded-full p-1 text-red-600 hover:bg-red-50"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </motion.button>
          )}
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="border-t border-gray-200 p-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormInputModule
                  label="Description *"
                  type="text"
                  placeholder="Enter item description"
                  value={item.description}
                  onChange={(e) => onItemChange(index, "description", e.target.value)}
                  className="w-full"
                />

                <div>
                  <div className="flex w-full items-center justify-between">
                    <label className="mb-1 block text-sm font-medium text-gray-700">Category *</label>
                    <button
                      type="button"
                      className="rounded-md text-xs font-medium text-[#00a4a6] hover:text-[#00a4a6]"
                      onClick={onAddCategory}
                    >
                      Add Category
                    </button>
                  </div>
                  {categoriesLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="size-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"></div>
                      <span className="text-sm text-gray-500">Loading categories...</span>
                    </div>
                  ) : categories.length > 0 ? (
                    <DropdownPopoverModule
                      options={categories.map((cat) => ({
                        value: cat.name,
                        label: cat.name,
                      }))}
                      placeholder="Select category"
                      value={categories.find((c) => c.categoryId === item.categoryId)?.name || ""}
                      onChange={(value) => {
                        const selectedCategory = categories.find((cat) => cat.name === value)
                        if (selectedCategory) {
                          onItemChange(index, "categoryId", selectedCategory.categoryId)
                        }
                      }}
                      className="w-full"
                      label=""
                    />
                  ) : (
                    <div className="text-sm text-red-600">No categories available</div>
                  )}
                </div>

                <FormInputModule
                  label="Price *"
                  type="number"
                  placeholder="0.00"
                  value={item.price}
                  onChange={(e) => onItemChange(index, "price", parseFloat(e.target.value) || 0)}
                  className="w-full"
                />

                <FormInputModule
                  label="HSN Code"
                  type="number"
                  placeholder="Enter HSN code"
                  value={item.hsn}
                  onChange={(e) => onItemChange(index, "hsn", parseInt(e.target.value) || 0)}
                  className="w-full"
                />

                <FormInputModule
                  label="Tax (%)"
                  type="number"
                  placeholder="0"
                  value={item.tax}
                  onChange={(e) => onItemChange(index, "tax", parseFloat(e.target.value) || 0)}
                  className="w-full"
                />

                <div className="flex items-center">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={item.taxIncluded}
                      onChange={(e) => onItemChange(index, "taxIncluded", e.target.checked)}
                      className="mr-2 rounded border-gray-300"
                    />
                    <span className="text-sm font-medium text-gray-700">Tax Included</span>
                  </label>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

const CreateExpensePage = () => {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { categories, categoriesLoading, createExpenseLoading, createExpenseError, expenseTypes } =
    useAppSelector(selectExpenses)
  const { branches } = useAppSelector(selectBranches)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null)
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false)

  const [formData, setFormData] = useState<CreateExpensePayload>({
    expenseDate: "",
    branchId: 0,
    partyName: "",
    paymentMethod: "",
    status: "",
    approvedBy: "",
    expenseItems: [
      {
        price: 0,
        hsn: 0,
        tax: 0,
        taxIncluded: false,
        description: "",
        categoryId: 0,
      },
    ],
  })

  // Fetch categories, expense types and branches when component mounts
  useEffect(() => {
    dispatch(fetchAllExpenseCategories())
    dispatch(fetchAllExpenseTypes())
    dispatch(fetchAllBranches())
  }, [dispatch])

  // Clean up preview URL to avoid memory leaks
  useEffect(() => {
    return () => {
      if (previewImage) {
        URL.revokeObjectURL(previewImage)
      }
    }
  }, [previewImage])

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleExpenseItemChange = (index: number, field: keyof CreateExpenseItem, value: any) => {
    setFormData((prev) => ({
      ...prev,
      expenseItems: prev.expenseItems.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
    }))
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Check file type
    if (!file.type.match("image.*") && !file.type.match("application/pdf")) {
      notify("error", "Invalid file type", {
        title: "Error",
        description: "Please upload an image file (JPEG, PNG, etc.) or PDF",
      })
      return
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      notify("error", "File too large", {
        title: "Error",
        description: "Please upload a file smaller than 5MB",
      })
      return
    }

    // Keep the File object for FormData submission
    setAttachmentFile(file)

    // Create preview for images
    if (file.type.match("image.*")) {
      const previewUrl = URL.createObjectURL(file)
      setPreviewImage(previewUrl)
    } else {
      setPreviewImage(null)
    }
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  const addExpenseItem = () => {
    setFormData((prev) => ({
      ...prev,
      expenseItems: [
        {
          price: 0,
          hsn: 0,
          tax: 0,
          taxIncluded: false,
          description: "",
          categoryId: 0,
        },
        ...prev.expenseItems,
      ],
    }))
  }

  const removeExpenseItem = (index: number) => {
    if (formData.expenseItems.length > 1) {
      setFormData((prev) => ({
        ...prev,
        expenseItems: prev.expenseItems.filter((_, i) => i !== index),
      }))
    }
  }

  const handleCategoryAdded = () => {
    // Refresh categories list
    dispatch(fetchAllExpenseCategories())
    setIsCategoryModalOpen(false)
  }

  const isAddItemButtonDisabled = () => {
    const lastItem = formData.expenseItems[0] // Check the first item (newest)
    if (!lastItem) return true
    return !lastItem.description.trim() || lastItem.categoryId === 0 || lastItem.price <= 0
  }

  const handleSubmit = async () => {
    // Validate required fields
    if (!formData.expenseDate) {
      notify("error", "Expense date is required", { title: "Validation Error" })
      return
    }
    if (!formData.branchId) {
      notify("error", "Branch is required", { title: "Validation Error" })
      return
    }
    if (!formData.partyName.trim()) {
      notify("error", "Party name is required", { title: "Validation Error" })
      return
    }
    if (!formData.paymentMethod) {
      notify("error", "Payment method is required", { title: "Validation Error" })
      return
    }
    if (!formData.status) {
      notify("error", "Status is required", { title: "Validation Error" })
      return
    }
    if (!formData.approvedBy.trim()) {
      notify("error", "Approved by is required", { title: "Validation Error" })
      return
    }
    if (formData.expenseItems.some((item) => !item.description.trim())) {
      notify("error", "All expense items must have a description", { title: "Validation Error" })
      return
    }
    if (formData.expenseItems.some((item) => !item.categoryId)) {
      notify("error", "All expense items must have a category", { title: "Validation Error" })
      return
    }
    if (!attachmentFile) {
      notify("error", "Attachment file is required", { title: "Validation Error" })
      return
    }

    try {
      const result = await dispatch(
        createExpense({
          expenseData: formData,
          file: attachmentFile,
        })
      )

      // Check success based on the custom thunk's return shape
      if (result.success) {
        const message = "Expense created successfully!"
        notify("success", message, {
          title: "Success",
          description: message,
        })

        // Reset form and redirect to expenses list
        setFormData({
          expenseDate: "",
          branchId: 0,
          partyName: "",
          paymentMethod: "",
          status: "",
          approvedBy: "",
          expenseItems: [
            {
              price: 0,
              hsn: 0,
              tax: 0,
              taxIncluded: false,
              description: "",
              categoryId: 0,
            },
          ],
        })
        setPreviewImage(null)
        setAttachmentFile(null)

        // Redirect back to expenses list
        router.push("/finance")
      } else {
        // Show error from the thunk
        notify("error", "Expense creation failed", {
          title: "Error",
          description: createExpenseError || "An unexpected error occurred",
        })
      }
    } catch (error: any) {
      // Fallback error handling
      notify("error", "Expense creation failed", {
        title: "Error",
        description: error?.message || "An unexpected error occurred",
      })
    }
  }

  const handleCancel = () => {
    router.back()
  }

  const paymentMethods = [
    { value: "CASH", label: "Cash" },
    { value: "CARD", label: "Card" },
    { value: "UPI", label: "UPI" },
    { value: "BANK_TRANSFER", label: "Bank Transfer" },
  ]

  const statusOptions = [
    { value: "DRAFT", label: "Draft" },
    { value: "PENDING", label: "Pending" },
    { value: "APPROVED", label: "Approved" },
    { value: "PAID", label: "Paid" },
  ]

  const selectedBranchName = branches.find((b) => b.branchId === formData.branchId)?.branchName || ""

  return (
    <>
      <DashboardNav />
      <div className="min-h-screen bg-gray-50 p-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 flex items-center justify-between"
        >
          <div className="flex gap-4">
            <motion.button
              type="button"
              onClick={() => router.back()}
              className="flex size-9 items-center justify-center rounded-md border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2 }}
              aria-label="Go back"
              title="Go back"
            >
              <svg
                width="1em"
                height="1em"
                viewBox="0 0 17 17"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="new-arrow-right rotate-180 transform"
              >
                <path
                  d="M9.1497 0.80204C9.26529 3.95101 13.2299 6.51557 16.1451 8.0308L16.1447 9.43036C13.2285 10.7142 9.37889 13.1647 9.37789 16.1971L7.27855 16.1978C7.16304 12.8156 10.6627 10.4818 13.1122 9.66462L0.049716 9.43565L0.0504065 7.33631L13.1129 7.56528C10.5473 6.86634 6.93261 4.18504 7.05036 0.80273L9.1497 0.80204Z"
                  fill="currentColor"
                ></path>
              </svg>
            </motion.button>
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
              <h1 className="text-2xl font-bold text-gray-900">Create New Expense</h1>
              <p className="mt-1 text-sm text-gray-600">Fill in the details below to create a new expense record</p>
            </motion.div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-lg bg-white p-6 shadow-sm"
            >
              {/* Show error from Redux state */}
              {createExpenseError && (
                <motion.div
                  className="mb-6 rounded-lg bg-red-100 p-4 text-red-700"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {createExpenseError}
                </motion.div>
              )}

              <div className="space-y-8">
                {/* Basic Information */}
                <div>
                  <h3 className="mb-4 text-lg font-medium text-gray-900">Basic Information</h3>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <FormInputModule
                      label="Expense Date *"
                      type="date"
                      value={formData.expenseDate}
                      onChange={(e) => handleInputChange("expenseDate", e.target.value)}
                      className="w-full"
                      placeholder=""
                    />

                    <DropdownPopoverModule
                      label="Branch *"
                      options={branches.map((branch) => ({
                        value: branch.branchName,
                        label: `${branch.branchName} - ${branch.location}`,
                      }))}
                      placeholder="Select Branch"
                      value={selectedBranchName}
                      onChange={(value) => {
                        const selectedBranch = branches.find((branch) => branch.branchName === value)
                        if (selectedBranch) {
                          handleInputChange("branchId", selectedBranch.branchId)
                        }
                      }}
                      className="w-full"
                    />

                    <FormInputModule
                      label="Party Name *"
                      type="text"
                      placeholder="Enter party name"
                      value={formData.partyName}
                      onChange={(e) => handleInputChange("partyName", e.target.value)}
                      className="w-full"
                    />

                    <DropdownPopoverModule
                      label="Payment Method *"
                      options={paymentMethods}
                      placeholder="Select payment method"
                      value={formData.paymentMethod}
                      onChange={(value) => handleInputChange("paymentMethod", value)}
                      className="w-full"
                    />

                    <DropdownPopoverModule
                      label="Status *"
                      options={statusOptions}
                      placeholder="Select status"
                      value={formData.status}
                      onChange={(value) => handleInputChange("status", value)}
                      className="w-full"
                    />

                    <FormInputModule
                      label="Approved By *"
                      type="text"
                      placeholder="Enter approver name"
                      value={formData.approvedBy}
                      onChange={(e) => handleInputChange("approvedBy", e.target.value)}
                      className="w-full"
                    />
                  </div>
                </div>

                {/* Expense Items */}
                <div>
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-lg font-medium text-gray-900">Expense Items</h3>
                    <motion.button
                      type="button"
                      onClick={addExpenseItem}
                      disabled={isAddItemButtonDisabled()}
                      className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium ${
                        isAddItemButtonDisabled()
                          ? "cursor-not-allowed bg-gray-300 text-gray-500"
                          : "bg-[#00a4a6] text-white hover:bg-[#00a4a6]"
                      }`}
                      whileHover={!isAddItemButtonDisabled() ? { scale: 1.05 } : {}}
                      whileTap={!isAddItemButtonDisabled() ? { scale: 0.95 } : {}}
                    >
                      <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Add Item
                    </motion.button>
                  </div>

                  <div className="space-y-4">
                    {formData.expenseItems.map((item, index) => (
                      <CollapsibleExpenseItem
                        key={index}
                        item={item}
                        index={index}
                        onItemChange={handleExpenseItemChange}
                        onRemove={removeExpenseItem}
                        categories={categories}
                        categoriesLoading={categoriesLoading}
                        onAddCategory={() => setIsCategoryModalOpen(true)}
                        isLastItem={index === 0} // First item in the array is the newest (top)
                      />
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Attachment Upload Section */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="rounded-lg bg-white p-6 shadow-sm"
            >
              <h3 className="mb-4 text-lg font-medium text-gray-900">Attachment *</h3>
              <div className="mb-4">
                <label className="mb-1 block text-sm font-medium text-gray-700">Upload Receipt/Invoice</label>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*,application/pdf"
                  className="hidden"
                />
                <div
                  className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-6 transition-colors hover:border-[#00a4a6]"
                  onClick={triggerFileInput}
                >
                  {previewImage ? (
                    <div className="relative mb-4 h-32 w-32">
                      <Image src={previewImage} alt="Attachment preview" fill className="rounded-md object-contain" />
                    </div>
                  ) : attachmentFile ? (
                    <div className="mb-4 flex flex-col items-center">
                      <RiUploadCloud2Line className="mb-2 size-12 text-green-500" />
                      <p className="text-sm text-green-600">{attachmentFile.name}</p>
                    </div>
                  ) : (
                    <>
                      <RiUploadCloud2Line className="mb-2 size-12 text-gray-400" />
                      <p className="text-center text-sm text-gray-600">
                        Drag & drop your receipt or invoice here or click to browse
                      </p>
                    </>
                  )}
                  <p className="mt-1 text-xs text-gray-500">PNG, JPG, PDF up to 5MB</p>
                </div>
              </div>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="rounded-lg bg-white p-6 shadow-sm"
            >
              <div className="space-y-4">
                <ButtonModule
                  variant="primary"
                  size="md"
                  onClick={handleSubmit}
                  disabled={createExpenseLoading || categoriesLoading || !attachmentFile}
                  className="w-full"
                >
                  {createExpenseLoading ? (
                    <div className="flex items-center justify-center">
                      <svg className="mr-2 size-4 animate-spin" viewBox="0 0 24 24">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                        />
                      </svg>
                      Creating...
                    </div>
                  ) : (
                    "Create Expense"
                  )}
                </ButtonModule>

                <ButtonModule
                  variant="outline"
                  size="md"
                  onClick={handleCancel}
                  disabled={createExpenseLoading}
                  className="w-full"
                >
                  Cancel
                </ButtonModule>
              </div>
            </motion.div>

            {/* Validation Summary */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="rounded-lg bg-[#00a4a6] bg-opacity-10 p-6 shadow-sm"
            >
              <h4 className="mb-3 text-sm font-medium text-[#00a4a6]">Required Fields</h4>
              <ul className="space-y-2 text-sm text-[#00a4a6]">
                <li className="flex items-center">
                  <svg className="mr-2 size-4" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Attachment file
                </li>
                <li className="flex items-center">
                  <svg className="mr-2 size-4" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Expense date
                </li>
                <li className="flex items-center">
                  <svg className="mr-2 size-4" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Branch selection
                </li>
                <li className="flex items-center">
                  <svg className="mr-2 size-4" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Party name
                </li>
                <li className="flex items-center">
                  <svg className="mr-2 size-4" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Payment method
                </li>
                <li className="flex items-center">
                  <svg className="mr-2 size-4" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Status
                </li>
                <li className="flex items-center">
                  <svg className="mr-2 size-4" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Approved by
                </li>
                <li className="flex items-center">
                  <svg className="mr-2 size-4" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Item descriptions and categories
                </li>
              </ul>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Add Category Modal */}
      <AddCategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        onCategoryAdded={handleCategoryAdded}
      />
    </>
  )
}

export default CreateExpensePage
