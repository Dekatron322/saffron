"use client"
import { ChangeEvent, useEffect, useRef, useState } from "react"
import { useAppDispatch, useAppSelector } from "app/api/store/store"
import {
  createExpenseCategory,
  fetchAllExpenseCategories,
  fetchAllExpenseTypes,
  selectExpenses,
} from "app/api/store/financeSlice"
// Import the product slice actions and selectors
import { fetchAllBranches, selectBranches } from "app/api/store/productSlice"
import DashboardNav from "components/Navbar/DashboardNav"
import { ButtonModule } from "components/ui/Button/Button"
import { FormInputModule } from "components/ui/Input/Input"
import { DropdownPopoverModule } from "components/ui/Input/DropdownModule"
import { RiBuilding2Fill, RiUploadCloud2Line } from "react-icons/ri"
import { BiBarcode, BiCategory, BiMap, BiMapPin, BiDetail } from "react-icons/bi"
import { AnimatePresence, motion } from "framer-motion"
import { notify } from "components/ui/Notification/Notification"
import Image from "next/image"
import { RxCross2 } from "react-icons/rx"

interface ExpenseCategory {
  categoryId: number
  name: string
  description: string
  expenseTypeId: number
  branchId: number
}

interface ExpenseType {
  expenseTypeId: number
  expenseType: string
  expenseCategories: ExpenseCategory[] | null
}

interface AddCategoryModalProps {
  isOpen: boolean
  onClose: () => void
  onCategoryAdded?: () => void
}

interface ApiError {
  errorMessage?: string
  message?: string
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
    branchId: 0, // Start with 0, will be set when branches load
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
                      Add New Expense Category
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
                        disabled={createCategoryLoading || expenseTypes.length === 0 || branches.length === 0}
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

export default function ExpenseCategoriesPage() {
  const dispatch = useAppDispatch()
  const {
    categories,
    categoriesLoading,
    categoriesError,
    createCategoryLoading,
    expenseTypes,
    expenseTypesLoading,
    expenseTypesError,
  } = useAppSelector(selectExpenses)
  // Get branches from product slice
  const { branches, loading: branchesLoading, error: branchesError } = useAppSelector(selectBranches)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    dispatch(fetchAllExpenseCategories())
    dispatch(fetchAllExpenseTypes())
    dispatch(fetchAllBranches()) // Fetch branches when component mounts
  }, [dispatch])

  const handleCategoryAdded = () => {
    setIsModalOpen(false)
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

  const handleClearSearch = () => {
    setSearchTerm("")
  }

  const filteredCategories = categories.filter((category: ExpenseCategory) => {
    const searchLower = searchTerm.toLowerCase()
    return (
      category.name.toLowerCase().includes(searchLower) ||
      category.description.toLowerCase().includes(searchLower) ||
      getExpenseTypeText(category.expenseTypeId).toLowerCase().includes(searchLower) ||
      getBranchText(category.branchId).toLowerCase().includes(searchLower)
    )
  })

  const getExpenseTypeText = (expenseTypeId: number) => {
    const expenseType = expenseTypes.find((type) => type.expenseTypeId === expenseTypeId)
    return expenseType ? expenseType.expenseType : "Unknown Type"
  }

  const getExpenseTypeColor = (expenseTypeId: number) => {
    const colors = [
      "bg-blue-100 text-blue-800",
      "bg-purple-100 text-purple-800",
      "bg-green-100 text-green-800",
      "bg-yellow-100 text-yellow-800",
      "bg-red-100 text-red-800",
      "bg-indigo-100 text-indigo-800",
      "bg-pink-100 text-pink-800",
      "bg-gray-100 text-gray-800",
    ]
    return colors[expenseTypeId % colors.length]
  }

  const getBranchText = (branchId: number) => {
    const branch = branches.find((b) => b.branchId === branchId)
    return branch ? `${branch.branchName} - ${branch.location}` : `Branch ${branchId}`
  }

  const getCategoryIcon = (category: ExpenseCategory) => {
    const icons = [
      <BiCategory className="min-h-5 min-w-5 text-blue-600" />,
      <BiDetail className="min-h-5 min-w-5 text-purple-600" />,
      <BiMap className="min-h-5 min-w-5 text-green-600" />,
      <BiMapPin className="min-h-5 min-w-5 text-yellow-600" />,
      <BiBarcode className="min-h-5 min-w-5 text-red-600" />,
      <RiBuilding2Fill className="min-h-5 min-w-5 text-indigo-600" />,
      <BiCategory className="min-h-5 min-w-5 text-pink-600" />,
      <BiDetail className="min-h-5 min-w-5 text-gray-600" />,
    ]
    return icons[category.expenseTypeId % icons.length]
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNav />

      <div className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-medium text-gray-900 md:text-2xl">Expense Categories</h1>
          <div className="flex items-center gap-4">
            <div className="flex h-[37px] w-[380px] items-center justify-between gap-3 rounded-full border bg-[#F4F9F8] px-3 py-1 text-[#707070] transition-all duration-200 focus-within:ring-2 focus-within:ring-[#00a4a6] focus-within:ring-offset-2 hover:border-[#00a4a6]">
              <Image src="/DashboardImages/Search.svg" width={16} height={16} alt="Search Icon" />
              <input
                type="text"
                id="search"
                placeholder="Search categories..."
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
              onClick={() => setIsModalOpen(true)}
              disabled={createCategoryLoading || expenseTypesLoading || branchesLoading}
            >
              <RiBuilding2Fill className="size-5 text-white" />
              Add Category
            </ButtonModule>
          </div>
        </div>

        {categoriesError && (
          <div className="mb-6 rounded-lg bg-red-100 p-4 text-red-700">Error loading categories: {categoriesError}</div>
        )}

        {expenseTypesError && (
          <div className="mb-6 rounded-lg bg-red-100 p-4 text-red-700">
            Error loading expense types: {expenseTypesError}
          </div>
        )}

        {branchesError && (
          <div className="mb-6 rounded-lg bg-red-100 p-4 text-red-700">Error loading branches: {branchesError}</div>
        )}

        {categoriesLoading || expenseTypesLoading || branchesLoading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 animate-pulse rounded-lg bg-white shadow-sm">
                <div className="h-40 rounded-t-lg bg-gray-200"></div>
                <div className="p-4">
                  <div className="h-5 w-3/4 rounded bg-gray-200"></div>
                  <div className="mt-2 h-4 w-1/2 rounded bg-gray-200"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredCategories.map((category: ExpenseCategory) => (
              <div
                key={category.categoryId}
                className="overflow-hidden rounded-lg bg-white shadow-sm transition-all hover:shadow-md"
              >
                <div className="border-b p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex min-h-10 min-w-10 items-center justify-center overflow-hidden rounded-md bg-gray-100">
                        {getCategoryIcon(category)}
                      </div>
                      <h3 className="font-medium text-gray-900">{category.name}</h3>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${getExpenseTypeColor(
                        category.expenseTypeId
                      )}`}
                    >
                      {getExpenseTypeText(category.expenseTypeId)}
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <div className="mb-4">
                    <p className="line-clamp-2 text-sm text-gray-600">{category.description}</p>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center text-sm text-gray-600">
                      <BiBarcode className="mr-2 size-4 shrink-0 text-gray-400" />
                      <span className="truncate">ID: {category.categoryId}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <BiMapPin className="mr-2 size-4 shrink-0 text-gray-400" />
                      <span className="truncate">Branch: {getBranchText(category.branchId)}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <BiCategory className="mr-2 size-4 shrink-0 text-gray-400" />
                      <span className="truncate">Type: {getExpenseTypeText(category.expenseTypeId)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!categoriesLoading && filteredCategories.length === 0 && searchTerm && (
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
            <h3 className="mb-2 text-lg font-medium text-gray-900">No categories found</h3>
            <p className="mb-4 text-gray-500">No expense categories match your search criteria.</p>
            <ButtonModule variant="outline" size="sm" onClick={handleClearSearch}>
              Clear search
            </ButtonModule>
          </div>
        )}

        {!categoriesLoading && categories.length === 0 && !searchTerm && (
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
            <h3 className="mb-2 text-lg font-medium text-gray-900">No expense categories</h3>
            <p className="mb-4 text-gray-500">Get started by creating your first expense category.</p>
            <ButtonModule
              variant="primary"
              size="sm"
              onClick={() => setIsModalOpen(true)}
              disabled={expenseTypesLoading || expenseTypes.length === 0 || branchesLoading || branches.length === 0}
            >
              {expenseTypesLoading || branchesLoading ? "Loading..." : "Add Your First Category"}
            </ButtonModule>
          </div>
        )}

        <AddCategoryModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onCategoryAdded={handleCategoryAdded}
        />
      </div>
    </div>
  )
}
