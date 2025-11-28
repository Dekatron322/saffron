"use client"
import { ChangeEvent, useEffect, useRef, useState } from "react"
import { useAppDispatch, useAppSelector } from "app/api/store/store"
import {
  createPromoCode,
  updatePromoCode,
  removeCustomerFromPromo,
  fetchAllPromos,
  getPromoCodeByCode,
  getPromoCodeById,
  selectPromos,
  selectCurrentPromoCode,
  selectCurrentPromoLoading,
  selectCurrentPromoError,
  selectPromoCodeById,
  selectPromoCodeByIdLoading,
  selectPromoCodeByIdError,
  selectRemoveCustomerLoading,
  selectRemoveCustomerError,
  clearCurrentPromo,
  clearPromoCodeById,
  clearRemoveCustomerError,
} from "app/api/store/promoCodeSlice"
import { fetchAllCustomers, selectCustomers } from "app/api/store/customerSlice"
import DashboardNav from "components/Navbar/DashboardNav"
import { ButtonModule } from "components/ui/Button/Button"
import { FormInputModule } from "components/ui/Input/Input"
import { DropdownPopoverModule } from "components/ui/Input/DropdownModule"
import {
  RiCoupon3Fill,
  RiCalendarLine,
  RiUserLine,
  RiPercentLine,
  RiSearchLine,
  RiHashtag,
  RiEditLine,
  RiCloseLine,
  RiUserUnfollowLine,
  RiCheckLine,
  RiArrowDownSLine,
} from "react-icons/ri"
import { BiBarcode, BiCategory, BiDetail, BiRefresh } from "react-icons/bi"
import { AnimatePresence, motion } from "framer-motion"
import { notify } from "components/ui/Notification/Notification"
import Image from "next/image"
import { RxCross2 } from "react-icons/rx"

interface PromoCode {
  promoCodeId: number
  promoCode: string
  promoCodeType: string
  percentage: number
  expireDate: string
  useType: string
  eligibleCustomers: string
}

interface AddPromoModalProps {
  isOpen: boolean
  onClose: () => void
  onPromoAdded?: () => void
  editingPromo?: PromoCode | null
  mode?: "create" | "edit"
}

interface RemoveCustomerModalProps {
  isOpen: boolean
  onClose: () => void
  onCustomerRemoved?: () => void
  promoCode: PromoCode | null
}

interface Customer {
  customerProfileId: number
  customerName: string
  customerEmail: string
  customerPhone: string
  customerAddress: string
  customerLoyaltyPoints: number
  customerPassword: string
  gstin: string | null
  subscriptionValidation: any | null
  subscriptionOpt: any | null
  subscriptionDuration: any | null
  status?: string
  subscriptionAmt?: number | null
  gstAmt?: number | null
  totalAmt?: number | null
  walletAmt?: number | null
}

// Customer Selection Component
interface CustomerSelectionProps {
  selectedCustomers: Customer[]
  onCustomersChange: (customers: Customer[]) => void
  disabled?: boolean
}

const CustomerSelection: React.FC<CustomerSelectionProps> = ({
  selectedCustomers,
  onCustomersChange,
  disabled = false,
}) => {
  const dispatch = useAppDispatch()
  const { customers, loading, pagination } = useAppSelector(selectCustomers)
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [allCustomers, setAllCustomers] = useState<Customer[]>([])
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Fetch all customers when dropdown opens
  useEffect(() => {
    if (isOpen && customers.length === 0) {
      dispatch(fetchAllCustomers(0, 1000)) // Fetch large number to get all customers
    }
  }, [isOpen, dispatch, customers.length])

  // Combine existing customers with newly fetched ones
  useEffect(() => {
    if (customers.length > 0) {
      setAllCustomers(customers)
    }
  }, [customers])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const filteredCustomers = allCustomers.filter(
    (customer) =>
      customer.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.customerPhone.includes(searchTerm)
  )

  const toggleCustomer = (customer: Customer) => {
    const isSelected = selectedCustomers.some((c) => c.customerProfileId === customer.customerProfileId)

    if (isSelected) {
      onCustomersChange(selectedCustomers.filter((c) => c.customerProfileId !== customer.customerProfileId))
    } else {
      onCustomersChange([...selectedCustomers, customer])
    }
  }

  const selectAllCustomers = () => {
    onCustomersChange([...allCustomers])
  }

  const clearAllCustomers = () => {
    onCustomersChange([])
  }

  const removeSelectedCustomer = (customerId: number) => {
    onCustomersChange(selectedCustomers.filter((c) => c.customerProfileId !== customerId))
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="mb-2 block text-sm font-medium text-gray-700">Eligible Customers</label>

      {/* Selected Customers Display */}
      <div className="mb-2 flex flex-wrap gap-2">
        {selectedCustomers.map((customer) => (
          <div
            key={customer.customerProfileId}
            className="flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-800"
          >
            <span>{customer.customerName}</span>
            <button
              type="button"
              onClick={() => removeSelectedCustomer(customer.customerProfileId)}
              className="text-blue-600 hover:text-blue-800"
              disabled={disabled}
            >
              <RiCloseLine className="size-3" />
            </button>
          </div>
        ))}
        {selectedCustomers.length === 0 && (
          <span className="text-sm text-gray-500">No customers selected (will be available to all customers)</span>
        )}
      </div>

      {/* Dropdown Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
        className={`flex w-full items-center justify-between rounded-md border bg-transparent p-2 text-left text-sm focus:border-blue-500 focus:ring-blue-500 ${
          disabled ? "cursor-not-allowed bg-gray-100" : "cursor-pointer"
        } ${isOpen ? "border-blue-500 ring-1 ring-blue-500" : "border-gray-300"}`}
      >
        <span className="truncate">
          {selectedCustomers.length === 0
            ? "Select customers..."
            : `${selectedCustomers.length} customer${selectedCustomers.length === 1 ? "" : "s"} selected`}
        </span>
        <RiArrowDownSLine className={`size-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border border-gray-200 bg-white shadow-lg"
          >
            {/* Search Input */}
            <div className="sticky top-0 border-b border-gray-200 bg-white p-2">
              <div className="flex items-center gap-2 rounded-md border border-gray-300 bg-gray-50 px-3 py-2">
                <RiSearchLine className="size-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search customers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-transparent text-sm outline-none"
                />
                {searchTerm && (
                  <button type="button" onClick={() => setSearchTerm("")} className="text-gray-400 hover:text-gray-600">
                    <RiCloseLine className="size-3" />
                  </button>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex border-b border-gray-200 bg-gray-50">
              <button
                type="button"
                onClick={selectAllCustomers}
                className="flex-1 border-r border-gray-200 px-3 py-2 text-left text-xs font-medium text-blue-600 hover:bg-blue-50"
              >
                Select All
              </button>
              <button
                type="button"
                onClick={clearAllCustomers}
                className="flex-1 px-3 py-2 text-left text-xs font-medium text-red-600 hover:bg-red-50"
              >
                Clear All
              </button>
            </div>

            {/* Customer List */}
            <div className="max-h-48 overflow-y-auto">
              {loading ? (
                <div className="p-4 text-center text-sm text-gray-500">Loading customers...</div>
              ) : filteredCustomers.length === 0 ? (
                <div className="p-4 text-center text-sm text-gray-500">
                  {searchTerm ? "No customers found" : "No customers available"}
                </div>
              ) : (
                filteredCustomers.map((customer) => {
                  const isSelected = selectedCustomers.some((c) => c.customerProfileId === customer.customerProfileId)
                  return (
                    <div
                      key={customer.customerProfileId}
                      onClick={() => toggleCustomer(customer)}
                      className={`flex cursor-pointer items-center justify-between border-b border-gray-100 px-3 py-2 last:border-b-0 hover:bg-gray-50 ${
                        isSelected ? "bg-blue-50" : ""
                      }`}
                    >
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900">{customer.customerName}</div>
                        <div className="text-xs text-gray-500">{customer.customerEmail}</div>
                        <div className="text-xs text-gray-500">{customer.customerPhone}</div>
                      </div>
                      {isSelected && <RiCheckLine className="size-4 text-blue-600" />}
                    </div>
                  )
                })
              )}
            </div>

            {/* Selected Count */}
            <div className="sticky bottom-0 border-t border-gray-200 bg-gray-50 px-3 py-2">
              <div className="text-xs text-gray-600">
                {selectedCustomers.length} customer{selectedCustomers.length === 1 ? "" : "s"} selected
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <p className="mt-1 text-xs text-gray-500">
        Select specific customers or leave empty to make promo code available to all customers
      </p>
    </div>
  )
}

// Customer Removal Selection Component
interface CustomerRemovalSelectionProps {
  selectedCustomers: Customer[]
  onCustomersChange: (customers: Customer[]) => void
  disabled?: boolean
  eligibleCustomerIds: string
}

const CustomerRemovalSelection: React.FC<CustomerRemovalSelectionProps> = ({
  selectedCustomers,
  onCustomersChange,
  disabled = false,
  eligibleCustomerIds,
}) => {
  const dispatch = useAppDispatch()
  const { customers, loading } = useAppSelector(selectCustomers)
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [eligibleCustomers, setEligibleCustomers] = useState<Customer[]>([])
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Parse eligible customer IDs and fetch customer data
  useEffect(() => {
    if (eligibleCustomerIds && eligibleCustomerIds !== "ALL" && eligibleCustomerIds !== "" && customers.length > 0) {
      const customerIdArray = eligibleCustomerIds.split(",").map((id) => id.trim())
      const matchedCustomers = customers.filter((customer) =>
        customerIdArray.includes(customer.customerProfileId.toString())
      )
      setEligibleCustomers(matchedCustomers)
    } else if (eligibleCustomerIds === "ALL") {
      // If promo code is for all customers, show all customers
      setEligibleCustomers(customers)
    } else if (eligibleCustomerIds === "") {
      // If promo code is for no customers, show empty list
      setEligibleCustomers([])
    }
  }, [eligibleCustomerIds, customers])

  // Fetch all customers when dropdown opens if needed
  useEffect(() => {
    if (isOpen && customers.length === 0) {
      dispatch(fetchAllCustomers(0, 1000))
    }
  }, [isOpen, dispatch, customers.length])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const filteredCustomers = eligibleCustomers.filter(
    (customer) =>
      customer.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.customerPhone.includes(searchTerm)
  )

  const toggleCustomer = (customer: Customer) => {
    const isSelected = selectedCustomers.some((c) => c.customerProfileId === customer.customerProfileId)

    if (isSelected) {
      onCustomersChange(selectedCustomers.filter((c) => c.customerProfileId !== customer.customerProfileId))
    } else {
      onCustomersChange([...selectedCustomers, customer])
    }
  }

  const selectAllCustomers = () => {
    onCustomersChange([...eligibleCustomers])
  }

  const clearAllCustomers = () => {
    onCustomersChange([])
  }

  const removeSelectedCustomer = (customerId: number) => {
    onCustomersChange(selectedCustomers.filter((c) => c.customerProfileId !== customerId))
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="mb-2 block text-sm font-medium text-gray-700">Select Customers to Remove</label>

      {/* Selected Customers Display */}
      <div className="mb-2 flex flex-wrap gap-2">
        {selectedCustomers.map((customer) => (
          <div
            key={customer.customerProfileId}
            className="flex items-center gap-1 rounded-full bg-red-100 px-3 py-1 text-sm text-red-800"
          >
            <span>{customer.customerName}</span>
            <button
              type="button"
              onClick={() => removeSelectedCustomer(customer.customerProfileId)}
              className="text-red-600 hover:text-red-800"
              disabled={disabled}
            >
              <RiCloseLine className="size-3" />
            </button>
          </div>
        ))}
        {selectedCustomers.length === 0 && (
          <span className="text-sm text-gray-500">No customers selected for removal</span>
        )}
      </div>

      {/* Dropdown Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled || eligibleCustomers.length === 0}
        className={`flex w-full items-center justify-between rounded-md border bg-transparent p-2 text-left text-sm focus:border-blue-500 focus:ring-blue-500 ${
          disabled || eligibleCustomers.length === 0 ? "cursor-not-allowed bg-gray-100" : "cursor-pointer"
        } ${isOpen ? "border-blue-500 ring-1 ring-blue-500" : "border-gray-300"}`}
      >
        <span className="truncate">
          {eligibleCustomers.length === 0
            ? "No eligible customers found"
            : selectedCustomers.length === 0
            ? "Select customers to remove..."
            : `${selectedCustomers.length} customer${selectedCustomers.length === 1 ? "" : "s"} selected for removal`}
        </span>
        <RiArrowDownSLine className={`size-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && eligibleCustomers.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border border-gray-200 bg-white shadow-lg"
          >
            {/* Search Input */}
            <div className="sticky top-0 border-b border-gray-200 bg-white p-2">
              <div className="flex items-center gap-2 rounded-md border border-gray-300 bg-gray-50 px-3 py-2">
                <RiSearchLine className="size-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search customers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-transparent text-sm outline-none"
                />
                {searchTerm && (
                  <button type="button" onClick={() => setSearchTerm("")} className="text-gray-400 hover:text-gray-600">
                    <RiCloseLine className="size-3" />
                  </button>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex border-b border-gray-200 bg-gray-50">
              <button
                type="button"
                onClick={selectAllCustomers}
                className="flex-1 border-r border-gray-200 px-3 py-2 text-left text-xs font-medium text-blue-600 hover:bg-blue-50"
              >
                Select All
              </button>
              <button
                type="button"
                onClick={clearAllCustomers}
                className="flex-1 px-3 py-2 text-left text-xs font-medium text-red-600 hover:bg-red-50"
              >
                Clear All
              </button>
            </div>

            {/* Customer List */}
            <div className="max-h-48 overflow-y-auto">
              {loading ? (
                <div className="p-4 text-center text-sm text-gray-500">Loading customers...</div>
              ) : filteredCustomers.length === 0 ? (
                <div className="p-4 text-center text-sm text-gray-500">
                  {searchTerm ? "No customers found" : "No eligible customers available"}
                </div>
              ) : (
                filteredCustomers.map((customer) => {
                  const isSelected = selectedCustomers.some((c) => c.customerProfileId === customer.customerProfileId)
                  return (
                    <div
                      key={customer.customerProfileId}
                      onClick={() => toggleCustomer(customer)}
                      className={`flex cursor-pointer items-center justify-between border-b border-gray-100 px-3 py-2 last:border-b-0 hover:bg-gray-50 ${
                        isSelected ? "bg-red-50" : ""
                      }`}
                    >
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900">{customer.customerName}</div>
                        <div className="text-xs text-gray-500">{customer.customerEmail}</div>
                        <div className="text-xs text-gray-500">{customer.customerPhone}</div>
                      </div>
                      {isSelected && <RiCheckLine className="size-4 text-red-600" />}
                    </div>
                  )
                })
              )}
            </div>

            {/* Selected Count */}
            <div className="sticky bottom-0 border-t border-gray-200 bg-gray-50 px-3 py-2">
              <div className="text-xs text-gray-600">
                {selectedCustomers.length} customer{selectedCustomers.length === 1 ? "" : "s"} selected for removal
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {eligibleCustomerIds === "ALL" ? (
        <p className="mt-1 text-xs text-gray-500">
          This promo code is available to all customers. Select customers to remove from eligibility.
        </p>
      ) : eligibleCustomerIds === "" ? (
        <p className="mt-1 text-xs text-gray-500">
          This promo code is not available to any customers. No customers to remove.
        </p>
      ) : (
        <p className="mt-1 text-xs text-gray-500">Select customers to remove from this promo code's eligibility list</p>
      )}
    </div>
  )
}

const AddPromoModal: React.FC<AddPromoModalProps> = ({
  isOpen,
  onClose,
  onPromoAdded,
  editingPromo,
  mode = "create",
}) => {
  const dispatch = useAppDispatch()
  const { createLoading, createError, updateLoading, updateError } = useAppSelector(selectPromos)
  const { customers } = useAppSelector(selectCustomers)

  const [formData, setFormData] = useState({
    promoCode: "",
    promoCodeType: "SEASONAL",
    percentage: 0,
    expireDate: "",
    useType: "SINGLE",
    eligibleCustomers: "ALL",
  })

  const [selectedCustomers, setSelectedCustomers] = useState<Customer[]>([])
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  const promoCodeTypes = [
    { value: "SEASONAL", label: "Seasonal" },
    { value: "WELCOME", label: "Welcome" },
    { value: "LOYALTY", label: "Loyalty" },
    { value: "SPECIAL", label: "Special" },
  ]

  const useTypes = [
    { value: "SINGLE", label: "Single Use" },
    { value: "MULTIPLE", label: "Multiple Use" },
  ]

  // Initialize form with editing promo data
  useEffect(() => {
    if (mode === "edit" && editingPromo) {
      setFormData({
        promoCode: editingPromo.promoCode,
        promoCodeType: editingPromo.promoCodeType,
        percentage: editingPromo.percentage,
        expireDate: editingPromo.expireDate,
        useType: editingPromo.useType,
        eligibleCustomers: editingPromo.eligibleCustomers,
      })

      // Parse eligible customers for edit mode
      if (editingPromo.eligibleCustomers !== "ALL" && editingPromo.eligibleCustomers !== "") {
        const customerIds = editingPromo.eligibleCustomers.split(",").map((id) => id.trim())
        // We need to match these IDs with actual customer objects
        const matchedCustomers = customers.filter((customer) =>
          customerIds.includes(customer.customerProfileId.toString())
        )
        setSelectedCustomers(matchedCustomers)
      } else {
        setSelectedCustomers([])
      }
    } else {
      // Reset form for create mode
      setFormData({
        promoCode: "",
        promoCodeType: "SEASONAL",
        percentage: 0,
        expireDate: "",
        useType: "SINGLE",
        eligibleCustomers: "ALL",
      })
      setSelectedCustomers([])
    }
    setValidationErrors({})
  }, [editingPromo, mode, isOpen, customers])

  // Update eligibleCustomers string when selectedCustomers changes
  useEffect(() => {
    if (selectedCustomers.length === 0) {
      setFormData((prev) => ({ ...prev, eligibleCustomers: "ALL" }))
    } else {
      const customerIds = selectedCustomers.map((customer) => customer.customerProfileId).join(",")
      setFormData((prev) => ({ ...prev, eligibleCustomers: customerIds }))
    }
  }, [selectedCustomers])

  const validateForm = () => {
    const errors: Record<string, string> = {}

    if (!formData.promoCode.trim()) {
      errors.promoCode = "Promo code is required"
    } else if (!/^[A-Z0-9]+$/.test(formData.promoCode)) {
      errors.promoCode = "Promo code should contain only uppercase letters and numbers"
    }

    if (!formData.percentage || formData.percentage <= 0 || formData.percentage > 100) {
      errors.percentage = "Percentage must be between 1 and 100"
    }

    if (!formData.expireDate) {
      errors.expireDate = "Expiry date is required"
    } else if (new Date(formData.expireDate) <= new Date()) {
      errors.expireDate = "Expiry date must be in the future"
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleInputChange =
    (field: keyof typeof formData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const value = e.target.value
      setFormData((prev) => ({
        ...prev,
        [field]: field === "percentage" ? parseFloat(value) || 0 : value,
      }))

      // Clear validation error for this field when user starts typing
      if (validationErrors[field]) {
        setValidationErrors((prev) => ({
          ...prev,
          [field]: "",
        }))
      }
    }

  const handlePromoTypeChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      promoCodeType: value,
    }))
  }

  const handleUseTypeChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      useType: value,
    }))
  }

  const handleCustomersChange = (customers: Customer[]) => {
    setSelectedCustomers(customers)
  }

  const handleSubmit = async () => {
    if (!validateForm()) {
      return
    }

    try {
      let result

      if (mode === "edit" && editingPromo) {
        // Update existing promo code
        result = await dispatch(
          updatePromoCode({
            promoCodeId: editingPromo.promoCodeId,
            promoData: {
              promoCode: formData.promoCode.toUpperCase(),
              promoCodeType: formData.promoCodeType,
              percentage: formData.percentage,
              expireDate: formData.expireDate,
              useType: formData.useType,
              eligibleCustomers: formData.eligibleCustomers,
            },
          })
        )

        if (updatePromoCode.fulfilled.match(result)) {
          notify("success", "Promo code updated successfully", {
            title: "Success",
            description: `Promo code "${formData.promoCode}" has been updated.`,
          })
        }
      } else {
        // Create new promo code
        result = await dispatch(
          createPromoCode({
            promoCode: formData.promoCode.toUpperCase(),
            promoCodeType: formData.promoCodeType,
            percentage: formData.percentage,
            expireDate: formData.expireDate,
            useType: formData.useType,
            eligibleCustomers: formData.eligibleCustomers,
          })
        )

        if (createPromoCode.fulfilled.match(result)) {
          notify("success", "Promo code created successfully", {
            title: "Success",
            description: `Promo code "${formData.promoCode}" has been created.`,
          })
        }
      }

      // Check if the promise was fulfilled
      if (
        (mode === "create" && createPromoCode.fulfilled.match(result)) ||
        (mode === "edit" && updatePromoCode.fulfilled.match(result))
      ) {
        // Reset form and close modal
        setFormData({
          promoCode: "",
          promoCodeType: "SEASONAL",
          percentage: 0,
          expireDate: "",
          useType: "SINGLE",
          eligibleCustomers: "ALL",
        })
        setSelectedCustomers([])
        setValidationErrors({})

        onClose()
        if (onPromoAdded) onPromoAdded()
      } else if (
        (mode === "create" && createPromoCode.rejected.match(result)) ||
        (mode === "edit" && updatePromoCode.rejected.match(result))
      ) {
        // Error is already handled in the slice
        const errorMessage = result.error?.message || "An unexpected error occurred"
        notify("error", `Failed to ${mode} promo code`, {
          title: "Error",
          description: errorMessage,
        })
      }
    } catch (error: any) {
      notify("error", `Promo ${mode} failed`, {
        title: "Error",
        description: error?.message || "An unexpected error occurred",
      })
    }
  }

  const isLoading = mode === "create" ? createLoading : updateLoading
  const currentError = mode === "create" ? createError : updateError

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
                      {mode === "edit" ? "Edit Promo Code" : "Add New Promo Code"}
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
                  {currentError && (
                    <motion.div
                      className="mt-4 rounded-lg bg-red-100 p-4 text-red-700"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      {currentError}
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
                            label="Promo Code*"
                            type="text"
                            placeholder="Enter Promo Code (e.g., DEEPAVALISALE10)"
                            value={formData.promoCode}
                            onChange={handleInputChange("promoCode")}
                            className="w-full"
                          />
                          {mode === "edit" && (
                            <p className="mt-1 text-xs text-gray-500">Promo code cannot be changed after creation</p>
                          )}
                        </motion.div>

                        <motion.div
                          initial={{ y: 20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: 0.55 }}
                        >
                          <FormInputModule
                            label="Discount Percentage*"
                            type="number"
                            placeholder="Enter discount percentage"
                            value={formData.percentage.toString()}
                            onChange={handleInputChange("percentage")}
                            className="w-full"
                          />
                        </motion.div>

                        <motion.div
                          initial={{ y: 20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: 0.6 }}
                        >
                          <FormInputModule
                            label="Expiry Date*"
                            type="date"
                            placeholder="Select expiry date"
                            value={formData.expireDate}
                            onChange={handleInputChange("expireDate")}
                            className="w-full"
                          />
                        </motion.div>

                        <motion.div
                          initial={{ y: 20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: 0.65 }}
                        >
                          <DropdownPopoverModule
                            label="Promo Code Type*"
                            options={promoCodeTypes}
                            placeholder="Select Promo Type"
                            value={formData.promoCodeType}
                            onChange={handlePromoTypeChange}
                            className="w-full"
                          />
                        </motion.div>

                        <motion.div
                          initial={{ y: 20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: 0.7 }}
                        >
                          <DropdownPopoverModule
                            label="Usage Type*"
                            options={useTypes}
                            placeholder="Select Usage Type"
                            value={formData.useType}
                            onChange={handleUseTypeChange}
                            className="w-full"
                          />
                        </motion.div>

                        <motion.div
                          initial={{ y: 20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: 0.75 }}
                        >
                          <CustomerSelection
                            selectedCustomers={selectedCustomers}
                            onCustomersChange={handleCustomersChange}
                            disabled={isLoading}
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
                            {mode === "edit" ? "Updating..." : "Creating..."}
                          </motion.div>
                        ) : (
                          <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                            {mode === "edit" ? "Update Promo Code" : "Create Promo Code"}
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

const RemoveCustomerModal: React.FC<RemoveCustomerModalProps> = ({ isOpen, onClose, onCustomerRemoved, promoCode }) => {
  const dispatch = useAppDispatch()
  const removeCustomerLoading = useAppSelector(selectRemoveCustomerLoading)
  const removeCustomerError = useAppSelector(selectRemoveCustomerError)
  const { customers } = useAppSelector(selectCustomers)

  const [selectedCustomers, setSelectedCustomers] = useState<Customer[]>([])
  const [validationError, setValidationError] = useState("")

  useEffect(() => {
    if (!isOpen) {
      setSelectedCustomers([])
      setValidationError("")
      dispatch(clearRemoveCustomerError())
    }
  }, [isOpen, dispatch])

  const handleRemoveCustomers = async () => {
    if (selectedCustomers.length === 0) {
      setValidationError("Please select at least one customer to remove")
      return
    }

    if (!promoCode) {
      setValidationError("No promo code selected")
      return
    }

    try {
      // Remove each selected customer
      const removalPromises = selectedCustomers.map((customer) =>
        dispatch(
          removeCustomerFromPromo({
            promoCodeId: promoCode.promoCodeId,
            customerId: customer.customerProfileId,
          })
        )
      )

      const results = await Promise.all(removalPromises)

      const successfulRemovals = results.filter((result) => removeCustomerFromPromo.fulfilled.match(result))
      const failedRemovals = results.filter((result) => removeCustomerFromPromo.rejected.match(result))

      if (successfulRemovals.length > 0) {
        notify("success", "Customers removed successfully", {
          title: "Success",
          description: `${successfulRemovals.length} customer${
            successfulRemovals.length === 1 ? "" : "s"
          } removed from promo code "${promoCode.promoCode}".`,
        })
      }

      if (failedRemovals.length > 0) {
        notify("warning", "Some customers could not be removed", {
          title: "Partial Success",
          description: `${failedRemovals.length} customer${
            failedRemovals.length === 1 ? "" : "s"
          } could not be removed.`,
        })
      }

      if (successfulRemovals.length > 0) {
        setSelectedCustomers([])
        setValidationError("")
        onClose()
        if (onCustomerRemoved) onCustomerRemoved()
      }
    } catch (error: any) {
      notify("error", "Remove customers failed", {
        title: "Error",
        description: error?.message || "An unexpected error occurred",
      })
    }
  }

  const handleCustomersChange = (customers: Customer[]) => {
    setSelectedCustomers(customers)
    setValidationError("")
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 overflow-y-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
          />

          <div className="flex min-h-full items-center justify-center p-4">
            <motion.div
              className="relative w-full max-w-2xl rounded-lg bg-white shadow-xl"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", damping: 30, stiffness: 400 }}
            >
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Remove Customers from Promo Code</h3>
                  <button type="button" className="text-gray-400 hover:text-gray-500" onClick={onClose}>
                    <RiCloseLine className="size-6" />
                  </button>
                </div>

                {promoCode && (
                  <div className="mt-4 rounded-lg bg-gray-50 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{promoCode.promoCode}</p>
                        <p className="text-sm text-gray-500">ID: {promoCode.promoCodeId}</p>
                        <p className="text-sm text-gray-500">
                          Eligible Customers:{" "}
                          {promoCode.eligibleCustomers === "ALL"
                            ? "All Customers"
                            : promoCode.eligibleCustomers === ""
                            ? "No Customers"
                            : `${promoCode.eligibleCustomers.split(",").length} specific customers`}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">{promoCode.percentage}% off</p>
                        <p className="text-sm text-gray-500">{promoCode.promoCodeType}</p>
                        <p className="text-sm text-gray-500">{promoCode.useType} use</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="mt-6">
                  <CustomerRemovalSelection
                    selectedCustomers={selectedCustomers}
                    onCustomersChange={handleCustomersChange}
                    disabled={removeCustomerLoading}
                    eligibleCustomerIds={promoCode?.eligibleCustomers || "ALL"}
                  />

                  {validationError && <p className="mt-2 text-sm text-red-600">{validationError}</p>}
                  {removeCustomerError && <p className="mt-2 text-sm text-red-600">{removeCustomerError}</p>}
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  <ButtonModule variant="outline" size="sm" onClick={onClose} disabled={removeCustomerLoading}>
                    Cancel
                  </ButtonModule>
                  <ButtonModule
                    variant="primary"
                    size="sm"
                    onClick={handleRemoveCustomers}
                    disabled={removeCustomerLoading || selectedCustomers.length === 0}
                    className="flex items-center gap-2"
                  >
                    {removeCustomerLoading ? (
                      <>
                        <svg
                          className="mr-2 size-4 animate-spin"
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
                        Removing...
                      </>
                    ) : (
                      <>
                        <RiUserUnfollowLine className="size-4" />
                        Remove {selectedCustomers.length > 0 ? `${selectedCustomers.length} ` : ""}Customer
                        {selectedCustomers.length !== 1 ? "s" : ""}
                      </>
                    )}
                  </ButtonModule>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default function PromoCodesPage() {
  const dispatch = useAppDispatch()
  const { promoCodes, loading, error, createLoading, createError, updateLoading, updateError } =
    useAppSelector(selectPromos)
  const currentPromoCode = useAppSelector(selectCurrentPromoCode)
  const currentPromoLoading = useAppSelector(selectCurrentPromoLoading)
  const currentPromoError = useAppSelector(selectCurrentPromoError)
  const promoCodeById = useAppSelector(selectPromoCodeById)
  const promoCodeByIdLoading = useAppSelector(selectPromoCodeByIdLoading)
  const promoCodeByIdError = useAppSelector(selectPromoCodeByIdError)
  const removeCustomerLoading = useAppSelector(selectRemoveCustomerLoading)
  const removeCustomerError = useAppSelector(selectRemoveCustomerError)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isRemoveCustomerModalOpen, setIsRemoveCustomerModalOpen] = useState(false)
  const [editingPromo, setEditingPromo] = useState<PromoCode | null>(null)
  const [selectedPromoForRemoval, setSelectedPromoForRemoval] = useState<PromoCode | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [searchByCodeTerm, setSearchByCodeTerm] = useState("")
  const [searchByIdTerm, setSearchByIdTerm] = useState("")
  const [searchMode, setSearchMode] = useState<"all" | "byCode" | "byId">("all")
  const [hasSearchedByCode, setHasSearchedByCode] = useState(false)
  const [hasSearchedById, setHasSearchedById] = useState(false)

  // Always fetch all promos when component mounts and when search mode changes
  useEffect(() => {
    dispatch(fetchAllPromos())
  }, [dispatch])

  // Reset search flags when switching modes
  useEffect(() => {
    if (searchMode === "all") {
      setHasSearchedByCode(false)
      setHasSearchedById(false)
    }
  }, [searchMode])

  const handlePromoAdded = () => {
    dispatch(fetchAllPromos())
    setIsModalOpen(false)
    setIsEditModalOpen(false)
  }

  const handleCustomerRemoved = () => {
    dispatch(fetchAllPromos())
    setIsRemoveCustomerModalOpen(false)
    setSelectedPromoForRemoval(null)
  }

  const handleEditPromo = (promo: PromoCode) => {
    setEditingPromo(promo)
    setIsEditModalOpen(true)
  }

  const handleRemoveCustomer = (promo: PromoCode) => {
    setSelectedPromoForRemoval(promo)
    setIsRemoveCustomerModalOpen(true)
  }

  const handleRefresh = () => {
    dispatch(fetchAllPromos())
    if (searchMode === "byCode" && searchByCodeTerm && hasSearchedByCode) {
      handleSearchByCode()
    } else if (searchMode === "byId" && searchByIdTerm && hasSearchedById) {
      handleSearchById()
    }
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

  const handleSearchByCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchByCodeTerm(e.target.value.toUpperCase())
  }

  const handleSearchByIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow numbers for ID search
    const value = e.target.value.replace(/[^0-9]/g, "")
    setSearchByIdTerm(value)
  }

  const handleClearSearch = () => {
    setSearchTerm("")
    setSearchMode("all")
    dispatch(clearCurrentPromo())
    dispatch(clearPromoCodeById())
    setHasSearchedByCode(false)
    setHasSearchedById(false)
  }

  const handleClearSearchByCode = () => {
    setSearchByCodeTerm("")
    dispatch(clearCurrentPromo())
    setHasSearchedByCode(false)
  }

  const handleClearSearchById = () => {
    setSearchByIdTerm("")
    dispatch(clearPromoCodeById())
    setHasSearchedById(false)
  }

  const handleSearchByCode = async () => {
    if (!searchByCodeTerm.trim()) {
      notify("warning", "Please enter a promo code to search", {
        title: "Search Required",
      })
      return
    }

    setHasSearchedByCode(true)
    try {
      const result = await dispatch(getPromoCodeByCode(searchByCodeTerm))
      if (getPromoCodeByCode.fulfilled.match(result)) {
        notify("success", "Promo code found", {
          title: "Search Success",
          description: `Promo code "${searchByCodeTerm}" has been found.`,
        })
      } else if (getPromoCodeByCode.rejected.match(result)) {
        if (result.error?.message?.includes("not found")) {
          notify("warning", "Promo code not found", {
            title: "Search Result",
            description: `No promo code found with code "${searchByCodeTerm}".`,
          })
        }
      }
    } catch (error: any) {
      notify("error", "Search failed", {
        title: "Error",
        description: error?.message || "An unexpected error occurred",
      })
    }
  }

  const handleSearchById = async () => {
    if (!searchByIdTerm.trim()) {
      notify("warning", "Please enter a promo code ID to search", {
        title: "Search Required",
      })
      return
    }

    const promoCodeId = parseInt(searchByIdTerm, 10)
    if (isNaN(promoCodeId) || promoCodeId <= 0) {
      notify("warning", "Please enter a valid promo code ID", {
        title: "Invalid ID",
      })
      return
    }

    setHasSearchedById(true)
    try {
      const result = await dispatch(getPromoCodeById(promoCodeId))
      if (getPromoCodeById.fulfilled.match(result)) {
        notify("success", "Promo code found", {
          title: "Search Success",
          description: `Promo code with ID "${promoCodeId}" has been found.`,
        })
      } else if (getPromoCodeById.rejected.match(result)) {
        if (result.error?.message?.includes("not found")) {
          notify("warning", "Promo code not found", {
            title: "Search Result",
            description: `No promo code found with ID "${promoCodeId}".`,
          })
        }
      }
    } catch (error: any) {
      notify("error", "Search failed", {
        title: "Error",
        description: error?.message || "An unexpected error occurred",
      })
    }
  }

  const handleSearchByCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleSearchByCode()
  }

  const handleSearchByIdSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleSearchById()
  }

  const filteredPromoCodes = promoCodes.filter((promo: PromoCode) => {
    const searchLower = searchTerm.toLowerCase()
    return (
      promo.promoCode.toLowerCase().includes(searchLower) ||
      promo.promoCodeType.toLowerCase().includes(searchLower) ||
      promo.useType.toLowerCase().includes(searchLower) ||
      promo.eligibleCustomers.toLowerCase().includes(searchLower)
    )
  })

  const getPromoTypeColor = (promoType: string) => {
    const colors: { [key: string]: string } = {
      SEASONAL: "bg-blue-100 text-blue-800",
      WELCOME: "bg-green-100 text-green-800",
      LOYALTY: "bg-purple-100 text-purple-800",
      SPECIAL: "bg-orange-100 text-orange-800",
    }
    return colors[promoType] || "bg-gray-100 text-gray-800"
  }

  const getUseTypeColor = (useType: string) => {
    return useType === "SINGLE" ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"
  }

  const getPromoIcon = (promo: PromoCode) => {
    const icons = [
      <RiCoupon3Fill className="min-h-5 min-w-5 text-blue-600" />,
      <RiPercentLine className="min-h-5 min-w-5 text-green-600" />,
      <RiCalendarLine className="min-h-5 min-w-5 text-purple-600" />,
      <RiUserLine className="min-h-5 min-w-5 text-orange-600" />,
    ]
    return icons[promo.promoCodeId % icons.length]
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const isExpired = (expireDate: string) => {
    return new Date(expireDate) < new Date()
  }

  // Determine which promoCodes to display based on search mode
  const getDisplayPromoCodes = () => {
    switch (searchMode) {
      case "byCode":
        // If user has searched by code, show only that result
        if (hasSearchedByCode && currentPromoCode) {
          return [currentPromoCode]
        }
        // Otherwise show all promo codes
        return promoCodes
      case "byId":
        // If user has searched by ID, show only that result
        if (hasSearchedById && promoCodeById) {
          return [promoCodeById]
        }
        // Otherwise show all promo codes
        return promoCodes
      default:
        return filteredPromoCodes
    }
  }

  const displayPromoCodes = getDisplayPromoCodes()
  const isLoading = loading || currentPromoLoading || promoCodeByIdLoading || removeCustomerLoading

  // Show empty search state only when user has actually performed a search
  const showEmptySearchState = {
    all: searchMode === "all" && searchTerm && displayPromoCodes.length === 0,
    byCode: searchMode === "byCode" && hasSearchedByCode && !currentPromoCode && searchByCodeTerm,
    byId: searchMode === "byId" && hasSearchedById && !promoCodeById && searchByIdTerm,
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNav />

      <div className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-medium text-gray-900 md:text-2xl">Promo Codes</h1>
          <div className="flex items-center gap-4">
            {/* Search Toggle Buttons */}
            <div className="flex rounded-lg border border-gray-200 bg-white p-1">
              <button
                onClick={() => setSearchMode("all")}
                className={`rounded-md px-3 py-1 text-sm font-medium transition-colors ${
                  searchMode === "all" ? "bg-blue-100 text-blue-700" : "text-gray-600 hover:text-gray-900"
                }`}
              >
                All Promos
              </button>
              <button
                onClick={() => setSearchMode("byCode")}
                className={`rounded-md px-3 py-1 text-sm font-medium transition-colors ${
                  searchMode === "byCode" ? "bg-blue-100 text-blue-700" : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Search by Code
              </button>
              <button
                onClick={() => setSearchMode("byId")}
                className={`rounded-md px-3 py-1 text-sm font-medium transition-colors ${
                  searchMode === "byId" ? "bg-blue-100 text-blue-700" : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Search by ID
              </button>
            </div>

            {/* Search Input */}
            {searchMode === "all" ? (
              <div className="flex h-[37px] w-[380px] items-center justify-between gap-3 rounded-full border bg-[#F4F9F8] px-3 py-1 text-[#707070] transition-all duration-200 focus-within:ring-2 focus-within:ring-[#00a4a6] focus-within:ring-offset-2 hover:border-[#00a4a6]">
                <img src="/DashboardImages/Search.svg" alt="Search Icon" />
                <input
                  type="text"
                  id="search"
                  placeholder="Search promo codes..."
                  className="h-[50px] w-full bg-transparent outline-none"
                  value={searchTerm}
                  onChange={handleSearchChange}
                />
                {searchTerm && (
                  <RxCross2 onClick={handleClearSearch} className="cursor-pointer text-gray-400 hover:text-gray-600" />
                )}
              </div>
            ) : searchMode === "byCode" ? (
              <form onSubmit={handleSearchByCodeSubmit} className="flex items-center gap-2">
                <div className="flex h-[37px] w-[300px] items-center justify-between gap-3 rounded-full border bg-[#F4F9F8] px-3 py-1 text-[#707070] transition-all duration-200 focus-within:ring-2 focus-within:ring-[#00a4a6] focus-within:ring-offset-2 hover:border-[#00a4a6]">
                  <RiSearchLine className="text-gray-400" />
                  <input
                    type="text"
                    placeholder="Enter promo code (e.g., BEAUTY2025)"
                    className="h-[50px] w-full bg-transparent uppercase outline-none"
                    value={searchByCodeTerm}
                    onChange={handleSearchByCodeChange}
                  />
                  {searchByCodeTerm && (
                    <RxCross2
                      onClick={handleClearSearchByCode}
                      className="cursor-pointer text-gray-400 hover:text-gray-600"
                    />
                  )}
                </div>
                <ButtonModule
                  variant="primary"
                  size="sm"
                  type="submit"
                  disabled={currentPromoLoading || !searchByCodeTerm.trim()}
                  className="flex items-center gap-2"
                >
                  <RiSearchLine className="size-4" />
                  {currentPromoLoading ? "Searching..." : "Search"}
                </ButtonModule>
              </form>
            ) : (
              <form onSubmit={handleSearchByIdSubmit} className="flex items-center gap-2">
                <div className="flex h-[37px] w-[250px] items-center justify-between gap-3 rounded-full border bg-[#F4F9F8] px-3 py-1 text-[#707070] transition-all duration-200 focus-within:ring-2 focus-within:ring-[#00a4a6] focus-within:ring-offset-2 hover:border-[#00a4a6]">
                  <RiHashtag className="text-gray-400" />
                  <input
                    type="text"
                    placeholder="Enter promo ID (e.g., 1)"
                    className="h-[50px] w-full bg-transparent outline-none"
                    value={searchByIdTerm}
                    onChange={handleSearchByIdChange}
                  />
                  {searchByIdTerm && (
                    <RxCross2
                      onClick={handleClearSearchById}
                      className="cursor-pointer text-gray-400 hover:text-gray-600"
                    />
                  )}
                </div>
                <ButtonModule
                  variant="primary"
                  size="sm"
                  type="submit"
                  disabled={promoCodeByIdLoading || !searchByIdTerm.trim()}
                  className="flex items-center gap-2"
                >
                  <RiSearchLine className="size-4" />
                  {promoCodeByIdLoading ? "Searching..." : "Search"}
                </ButtonModule>
              </form>
            )}

            <div className="flex gap-2">
              <ButtonModule
                variant="outline"
                size="md"
                className="flex items-center gap-2"
                onClick={handleRefresh}
                disabled={isLoading}
              >
                <BiRefresh className="size-5" />
                Refresh
              </ButtonModule>
              <ButtonModule
                variant="primary"
                size="md"
                className="flex items-center gap-2"
                onClick={() => setIsModalOpen(true)}
                disabled={loading || createLoading || isLoading}
              >
                <RiCoupon3Fill className="size-5 text-white" />
                Add Promo Code
              </ButtonModule>
            </div>
          </div>
        </div>

        {/* Error Messages */}
        {error && <div className="mb-6 rounded-lg bg-red-100 p-4 text-red-700">Error loading promo codes: {error}</div>}
        {currentPromoError && searchMode === "byCode" && hasSearchedByCode && (
          <div className="mb-6 rounded-lg bg-yellow-100 p-4 text-yellow-700">Search error: {currentPromoError}</div>
        )}
        {promoCodeByIdError && searchMode === "byId" && hasSearchedById && (
          <div className="mb-6 rounded-lg bg-yellow-100 p-4 text-yellow-700">Search error: {promoCodeByIdError}</div>
        )}

        {/* Loading States */}
        {isLoading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
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
          <>
            {/* Show promo codes when we have results */}
            {displayPromoCodes.length > 0 && (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
                {displayPromoCodes.map((promo: PromoCode) => (
                  <div
                    key={promo.promoCodeId}
                    className={`overflow-hidden rounded-lg bg-white shadow-sm transition-all hover:shadow-md ${
                      isExpired(promo.expireDate) ? "opacity-70" : ""
                    }`}
                  >
                    <div className="border-b p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="flex min-h-10 min-w-10 items-center justify-center overflow-hidden rounded-md bg-gray-100">
                            {getPromoIcon(promo)}
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">{promo.promoCode}</h3>
                            <p className="text-sm text-gray-500">{promo.percentage}% off</p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <span
                            className={`rounded-full px-2 py-1 text-xs font-medium ${getPromoTypeColor(
                              promo.promoCodeType
                            )}`}
                          >
                            {promo.promoCodeType}
                          </span>
                          <span
                            className={`rounded-full px-2 py-1 text-xs font-medium ${getUseTypeColor(promo.useType)}`}
                          >
                            {promo.useType}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-center text-sm text-gray-600">
                          <RiCalendarLine className="mr-2 size-4 shrink-0 text-gray-400" />
                          <span className="truncate">
                            Expires: {formatDate(promo.expireDate)}
                            {isExpired(promo.expireDate) && (
                              <span className="ml-2 rounded-full bg-red-100 px-2 py-1 text-xs text-red-800">
                                Expired
                              </span>
                            )}
                          </span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <RiUserLine className="mr-2 size-4 shrink-0 text-gray-400" />
                          <span className="truncate">
                            Customers:{" "}
                            {promo.eligibleCustomers === "ALL"
                              ? "All Customers"
                              : promo.eligibleCustomers === ""
                              ? "No Customers"
                              : `${promo.eligibleCustomers.split(",").length} specific customers`}
                          </span>
                        </div>
                        {/* <div className="flex items-center text-sm text-gray-600">
                          <BiBarcode className="mr-2 size-4 shrink-0 text-gray-400" />
                          <span className="truncate">ID: {promo.promoCodeId}</span>
                        </div> */}
                      </div>

                      {/* Action Buttons */}
                      <div className="mt-4 flex justify-end gap-2">
                        {promo.eligibleCustomers !== "" && (
                          <ButtonModule
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-2"
                            onClick={() => handleRemoveCustomer(promo)}
                            disabled={removeCustomerLoading}
                          >
                            <RiUserUnfollowLine className="size-4" />
                            Remove Customer
                          </ButtonModule>
                        )}
                        <ButtonModule
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-2"
                          onClick={() => handleEditPromo(promo)}
                          disabled={updateLoading}
                        >
                          <RiEditLine className="size-4" />
                          Edit
                        </ButtonModule>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Empty States (only show after actual search) */}
        {showEmptySearchState.all && (
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
            <h3 className="mb-2 text-lg font-medium text-gray-900">No promo codes found</h3>
            <p className="mb-4 text-gray-500">No promo codes match your search criteria.</p>
            <ButtonModule variant="outline" size="sm" onClick={handleClearSearch}>
              Clear search
            </ButtonModule>
          </div>
        )}

        {showEmptySearchState.byCode && (
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
            <h3 className="mb-2 text-lg font-medium text-gray-900">Promo code not found</h3>
            <p className="mb-4 text-gray-500">No promo code found with code "{searchByCodeTerm}".</p>
            <div className="flex gap-2">
              <ButtonModule variant="outline" size="sm" onClick={handleClearSearchByCode}>
                Clear search
              </ButtonModule>
              <ButtonModule variant="primary" size="sm" onClick={() => setSearchMode("all")}>
                View All Promos
              </ButtonModule>
            </div>
          </div>
        )}

        {showEmptySearchState.byId && (
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
            <h3 className="mb-2 text-lg font-medium text-gray-900">Promo code not found</h3>
            <p className="mb-4 text-gray-500">No promo code found with ID "{searchByIdTerm}".</p>
            <div className="flex gap-2">
              <ButtonModule variant="outline" size="sm" onClick={handleClearSearchById}>
                Clear search
              </ButtonModule>
              <ButtonModule variant="primary" size="sm" onClick={() => setSearchMode("all")}>
                View All Promos
              </ButtonModule>
            </div>
          </div>
        )}

        {/* No promo codes state (only in all mode with no search term) */}
        {!isLoading && promoCodes.length === 0 && searchMode === "all" && !searchTerm && (
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
            <h3 className="mb-2 text-lg font-medium text-gray-900">No promo codes</h3>
            <p className="mb-4 text-gray-500">Get started by creating your first promo code.</p>
            <ButtonModule variant="primary" size="sm" onClick={() => setIsModalOpen(true)}>
              Add Your First Promo Code
            </ButtonModule>
          </div>
        )}

        <AddPromoModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onPromoAdded={handlePromoAdded}
          mode="create"
        />

        <AddPromoModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onPromoAdded={handlePromoAdded}
          editingPromo={editingPromo}
          mode="edit"
        />

        <RemoveCustomerModal
          isOpen={isRemoveCustomerModalOpen}
          onClose={() => setIsRemoveCustomerModalOpen(false)}
          onCustomerRemoved={handleCustomerRemoved}
          promoCode={selectedPromoForRemoval}
        />
      </div>
    </div>
  )
}
