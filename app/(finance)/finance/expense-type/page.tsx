// src/app/expense-types/page.tsx
"use client"
import { useEffect, useState } from "react"
import { useAppDispatch, useAppSelector } from "app/api/store/store"
import { createExpenseType, deleteExpenseType, fetchAllExpenseTypes, selectExpenses } from "app/api/store/financeSlice"
import DashboardNav from "components/Navbar/DashboardNav"
import { ButtonModule } from "components/ui/Button/Button"
import { FormInputModule } from "components/ui/Input/Input"
import { RiAddLine, RiEditLine } from "react-icons/ri"
import { BiCategory, BiDetail } from "react-icons/bi"
import { AnimatePresence, motion } from "framer-motion"
import { notify } from "components/ui/Notification/Notification"
import Image from "next/image"
import { RxCross2 } from "react-icons/rx"

interface ExpenseType {
  expenseTypeId: number
  expenseType: string
  expenseCategories: ExpenseCategory[] | null
}

interface ExpenseCategory {
  categoryId: number
  name: string
  description: string
  expenseTypeId: number
  branchId: number
}

interface AddExpenseTypeModalProps {
  isOpen: boolean
  onClose: () => void
  onExpenseTypeAdded?: () => void
  editExpenseType?: ExpenseType | null
}

const AddExpenseTypeModal: React.FC<AddExpenseTypeModalProps> = ({
  isOpen,
  onClose,
  onExpenseTypeAdded,
  editExpenseType,
}) => {
  const dispatch = useAppDispatch()
  const {
    expenseTypesLoading,
    expenseTypesError,
    createExpenseTypeLoading,
    createExpenseTypeError,
    updateExpenseTypeLoading,
    updateExpenseTypeError,
  } = useAppSelector(selectExpenses)

  const [formData, setFormData] = useState({
    expenseType: "",
  })

  useEffect(() => {
    if (editExpenseType) {
      setFormData({
        expenseType: editExpenseType.expenseType,
      })
    } else {
      setFormData({
        expenseType: "",
      })
    }
  }, [editExpenseType, isOpen])

  const handleInputChange =
    (field: keyof typeof formData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setFormData((prev) => ({
        ...prev,
        [field]: e.target.value,
      }))
    }

  const handleSubmit = async () => {
    if (!formData.expenseType.trim()) {
      notify("error", "Expense type name is required", {
        title: "Validation Error",
        description: "Please enter a name for the expense type.",
      })
      return
    }

    try {
      if (editExpenseType) {
        // await dispatch(
        //   updateExpenseType({
        //     expenseTypeId: editExpenseType.expenseTypeId,
        //     expenseTypeData: { expenseType: formData.expenseType },
        //   })
        // )

        notify("success", "Expense type updated successfully!", {
          title: "Success",
          description: `Expense type "${formData.expenseType}" has been updated.`,
        })
      } else {
        await dispatch(createExpenseType({ expenseType: formData.expenseType }))

        notify("success", "Expense type added successfully!", {
          title: "Success",
          description: `Expense type "${formData.expenseType}" has been added to the system.`,
        })
      }

      setFormData({ expenseType: "" })
      onClose()
      if (onExpenseTypeAdded) onExpenseTypeAdded()
    } catch (error: any) {
      // Error is already handled by the Redux slice, so we don't need to show another notification
      console.error("Expense type operation failed:", error)
    }
  }

  const isLoading = createExpenseTypeLoading || updateExpenseTypeLoading
  const error = createExpenseTypeError || updateExpenseTypeError

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
                      {editExpenseType ? "Edit Expense Type" : "Add New Expense Type"}
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

                  {error && (
                    <motion.div
                      className="mt-4 rounded-lg bg-red-100 p-4 text-red-700"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      {error}
                    </motion.div>
                  )}

                  <motion.div
                    className="mt-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    <div className="space-y-4">
                      <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.5 }}
                      >
                        <FormInputModule
                          label="Expense Type Name*"
                          type="text"
                          placeholder="Enter Expense Type Name"
                          value={formData.expenseType}
                          onChange={handleInputChange("expenseType")}
                          className="w-full"
                        />
                      </motion.div>
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
                        disabled={isLoading || !formData.expenseType.trim()}
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
                            {editExpenseType ? "Updating..." : "Creating..."}
                          </motion.div>
                        ) : (
                          <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                            {editExpenseType ? "Update Type" : "Add Type"}
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

export default function ExpenseTypesPage() {
  const dispatch = useAppDispatch()
  const { expenseTypes, expenseTypesLoading, expenseTypesError, deleteExpenseTypeLoading, deleteExpenseTypeError } =
    useAppSelector(selectExpenses)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [expandedTypes, setExpandedTypes] = useState<number[]>([])
  const [editExpenseType, setEditExpenseType] = useState<ExpenseType | null>(null)

  useEffect(() => {
    dispatch(fetchAllExpenseTypes())
  }, [dispatch])

  const handleExpenseTypeAdded = () => {
    setIsModalOpen(false)
    setEditExpenseType(null)
    // Refresh the list
    dispatch(fetchAllExpenseTypes())
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

  const handleClearSearch = () => {
    setSearchTerm("")
  }

  const toggleExpanded = (expenseTypeId: number) => {
    setExpandedTypes((prev) =>
      prev.includes(expenseTypeId) ? prev.filter((id) => id !== expenseTypeId) : [...prev, expenseTypeId]
    )
  }

  const handleEdit = (expenseType: ExpenseType) => {
    setEditExpenseType(expenseType)
    setIsModalOpen(true)
  }

  const handleAddNew = () => {
    setEditExpenseType(null)
    setIsModalOpen(true)
  }

  const handleDelete = async (expenseType: ExpenseType) => {
    if (window.confirm(`Are you sure you want to delete "${expenseType.expenseType}"? This action cannot be undone.`)) {
      try {
        await dispatch(deleteExpenseType(expenseType.expenseTypeId))

        notify("success", "Expense type deleted successfully!", {
          title: "Success",
          description: `Expense type "${expenseType.expenseType}" has been deleted.`,
        })

        // Refresh the list
        dispatch(fetchAllExpenseTypes())
      } catch (error: any) {
        // Error is already handled by the Redux slice
        console.error("Delete failed:", error)
      }
    }
  }

  const filteredExpenseTypes = expenseTypes.filter((type: ExpenseType) => {
    const searchLower = searchTerm.toLowerCase()
    return (
      type.expenseType.toLowerCase().includes(searchLower) ||
      type.expenseCategories?.some(
        (category) =>
          category.name.toLowerCase().includes(searchLower) || category.description.toLowerCase().includes(searchLower)
      ) ||
      false
    )
  })

  const getExpenseTypeColor = (expenseTypeId: number) => {
    const colors = [
      "bg-blue-100 text-blue-800 border-blue-200",
      "bg-purple-100 text-purple-800 border-purple-200",
      "bg-green-100 text-green-800 border-green-200",
      "bg-yellow-100 text-yellow-800 border-yellow-200",
      "bg-red-100 text-red-800 border-red-200",
      "bg-indigo-100 text-indigo-800 border-indigo-200",
      "bg-pink-100 text-pink-800 border-pink-200",
      "bg-gray-100 text-gray-800 border-gray-200",
    ]
    return colors[expenseTypeId % colors.length]
  }

  const getCategoryCount = (expenseType: ExpenseType) => {
    return expenseType.expenseCategories?.length || 0
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNav />

      <div className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-medium text-gray-900 md:text-2xl">Expense Types</h1>
          <div className="flex items-center gap-4">
            <div className="flex h-[37px] w-[380px] items-center justify-between gap-3 rounded-full border bg-[#F4F9F8] px-3 py-1 text-[#707070] transition-all duration-200 focus-within:ring-2 focus-within:ring-[#00a4a6] focus-within:ring-offset-2 hover:border-[#00a4a6]">
              <Image src="/DashboardImages/Search.svg" width={16} height={16} alt="Search Icon" />
              <input
                type="text"
                id="search"
                placeholder="Search expense types..."
                className="h-[50px] w-full bg-transparent outline-none"
                value={searchTerm}
                onChange={handleSearchChange}
              />
              {searchTerm && (
                <RxCross2 onClick={handleClearSearch} className="cursor-pointer text-gray-400 hover:text-gray-600" />
              )}
            </div>
            <ButtonModule
              variant="primary"
              size="md"
              className="flex items-center gap-2"
              onClick={handleAddNew}
              disabled={expenseTypesLoading}
            >
              <RiAddLine className="size-5 text-white" />
              Add Expense Type
            </ButtonModule>
          </div>
        </div>

        {expenseTypesError && (
          <div className="mb-6 rounded-lg bg-red-100 p-4 text-red-700">
            Error loading expense types: {expenseTypesError}
          </div>
        )}

        {deleteExpenseTypeError && (
          <div className="mb-6 rounded-lg bg-red-100 p-4 text-red-700">
            Error deleting expense type: {deleteExpenseTypeError}
          </div>
        )}

        {expenseTypesLoading ? (
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 animate-pulse rounded-lg bg-white shadow-sm">
                <div className="h-full rounded-lg bg-gray-200"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredExpenseTypes.map((expenseType: ExpenseType) => (
              <motion.div
                key={expenseType.expenseTypeId}
                className="overflow-hidden rounded-lg bg-white shadow-sm transition-all hover:shadow-md"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="border-b p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div
                        className={`flex min-h-12 min-w-12 items-center justify-center rounded-lg ${getExpenseTypeColor(
                          expenseType.expenseTypeId
                        )}`}
                      >
                        <BiCategory className="text-xl" />
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">{expenseType.expenseType}</h3>
                        <p className="text-sm text-gray-600">
                          {getCategoryCount(expenseType)} categor{getCategoryCount(expenseType) === 1 ? "y" : "ies"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <ButtonModule
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2"
                        onClick={() => handleEdit(expenseType)}
                        disabled={deleteExpenseTypeLoading}
                      >
                        <RiEditLine className="size-4" />
                        Edit
                      </ButtonModule>
                      <ButtonModule
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2 text-red-600 hover:bg-red-50"
                        onClick={() => handleDelete(expenseType)}
                        disabled={deleteExpenseTypeLoading}
                      >
                        Delete
                      </ButtonModule>
                      {/* <ButtonModule
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2"
                        onClick={() => toggleExpanded(expenseType.expenseTypeId)}
                      >
                        {expandedTypes.includes(expenseType.expenseTypeId) ? (
                          <BiChevronUp className="size-4" />
                        ) : (
                          <BiChevronDown className="size-4" />
                        )}
                        {expandedTypes.includes(expenseType.expenseTypeId) ? "Hide" : "Show"} Categories
                      </ButtonModule> */}
                    </div>
                  </div>
                </div>

                <AnimatePresence>
                  {expandedTypes.includes(expenseType.expenseTypeId) && expenseType.expenseCategories && (
                    <motion.div
                      className="border-t bg-gray-50"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="p-6">
                        <h4 className="mb-4 font-medium text-gray-900">Associated Categories</h4>
                        {expenseType.expenseCategories.length > 0 ? (
                          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                            {expenseType.expenseCategories.map((category: ExpenseCategory) => (
                              <div key={category.categoryId} className="rounded-lg border bg-white p-4">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <h5 className="font-medium text-gray-900">{category.name}</h5>
                                    <p className="text-sm text-gray-600">{category.description}</p>
                                  </div>
                                  <span className="text-xs text-gray-500">ID: {category.categoryId}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="py-8 text-center text-gray-500">
                            <BiDetail className="mx-auto mb-2 text-4xl text-gray-300" />
                            <p>No categories associated with this expense type</p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        )}

        {!expenseTypesLoading && filteredExpenseTypes.length === 0 && searchTerm && (
          <div className="flex flex-col items-center justify-center rounded-lg bg-white p-12 text-center shadow-sm">
            <div className="mb-4 text-gray-400">
              <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="mb-2 text-lg font-medium text-gray-900">No expense types found</h3>
            <p className="mb-4 text-gray-500">No expense types match your search criteria.</p>
            <ButtonModule variant="outline" size="sm" onClick={handleClearSearch}>
              Clear search
            </ButtonModule>
          </div>
        )}

        {!expenseTypesLoading && expenseTypes.length === 0 && !searchTerm && (
          <div className="flex flex-col items-center justify-center rounded-lg bg-white p-12 text-center shadow-sm">
            <div className="mb-4 text-gray-400">
              <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
            </div>
            <h3 className="mb-2 text-lg font-medium text-gray-900">No expense types</h3>
            <p className="mb-4 text-gray-500">Get started by creating your first expense type.</p>
            <ButtonModule variant="primary" size="sm" onClick={handleAddNew}>
              Add Your First Expense Type
            </ButtonModule>
          </div>
        )}

        <AddExpenseTypeModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false)
            setEditExpenseType(null)
          }}
          onExpenseTypeAdded={handleExpenseTypeAdded}
          editExpenseType={editExpenseType}
        />
      </div>
    </div>
  )
}
