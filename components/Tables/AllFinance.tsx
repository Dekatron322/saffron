import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { RxCaretSort, RxDotsVertical } from "react-icons/rx"
import { MdOutlineArrowBackIosNew, MdOutlineArrowForwardIos, MdOutlineCheckBoxOutlineBlank } from "react-icons/md"
import { ButtonModule } from "components/ui/Button/Button"
import ExportIcon from "public/export-icon"
import { SearchModule } from "components/ui/Search/search-module"
import EmptyState from "public/empty-state"
import AddBusiness from "public/add-business"
import { useAppDispatch, useAppSelector } from "app/api/store/store"
import { useRouter } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"
import ArrowIcon from "public/Icons/arrowIcon"
import {
  createExpense,
  CreateExpenseItem,
  CreateExpensePayload,
  Expense,
  fetchAllExpenseCategories,
  fetchAllExpenses,
  selectExpenses,
} from "app/api/store/financeSlice"
import { fetchAllBranches, selectBranches } from "app/api/store/productSlice"
import { FormInputModule } from "components/ui/Input/Input"
import { DropdownPopoverModule } from "components/ui/Input/DropdownModule"
import { notify } from "components/ui/Notification/Notification"
import { RiUploadCloud2Line } from "react-icons/ri"
import Image from "next/image"

type SortOrder = "asc" | "desc" | null
type FinanceOrder = {
  sn: number
  expenseId: number
  expenseDate: string
  partyName: string
  referenceNo: string
  totalAmount: number
  paymentMethod: string
  status: string
  approvedBy: string
}

// Expense Details Modal Component
const ExpenseDetailsModal = ({
  isOpen,
  onClose,
  expense,
}: {
  isOpen: boolean
  onClose: () => void
  expense: Expense | null
}) => {
  const modalRef = useRef<HTMLDivElement>(null)

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
      document.body.style.overflow = "hidden" // Prevent background scrolling
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.body.style.overflow = "unset"
    }
  }, [isOpen, onClose])

  // Close modal on Escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener("keydown", handleEscape)
    }

    return () => {
      document.removeEventListener("keydown", handleEscape)
    }
  }, [isOpen, onClose])

  if (!isOpen || !expense) return null

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getStatusStyle = (status: string) => {
    switch (status.toLowerCase()) {
      case "paid":
      case "approved":
      case "completed":
        return { backgroundColor: "#EEF5F0", color: "#589E67" }
      case "pending":
      case "draft":
        return { backgroundColor: "#FFF3CD", color: "#856404" }
      case "cancelled":
      case "rejected":
      case "failed":
        return { backgroundColor: "#F7EDED", color: "#AF4B4B" }
      default:
        return { backgroundColor: "#F3F4F6", color: "#6B7280" }
    }
  }

  const getPaymentMethodStyle = (method: string) => {
    switch (method.toLowerCase()) {
      case "cash":
        return { backgroundColor: "#E8F5E8", color: "#2E7D32" }
      case "card":
        return { backgroundColor: "#E3F2FD", color: "#1565C0" }
      case "upi":
        return { backgroundColor: "#F3E5F5", color: "#7B1FA2" }
      case "bank transfer":
        return { backgroundColor: "#FFF3E0", color: "#EF6C00" }
      default:
        return { backgroundColor: "#F3F4F6", color: "#6B7280" }
    }
  }

  // Fixed attachment handling
  const attachment = expense.attachment || ""

  // Check if attachment is base64 encoded data
  const isBase64Data = (str: string) => {
    if (typeof str !== "string") return false
    // Check for base64 pattern or data URL pattern
    return (
      /^data:[\w+/.-]+;base64,/.test(str) ||
      /^[A-Za-z0-9+/]*={0,2}$/.test(str) ||
      str.startsWith("PHN2Zy") || // SVG base64 often starts with this
      str.length > 1000
    ) // Assume long strings are base64
  }

  // Check if attachment is a valid URL
  const isValidUrl = (str: string) => {
    try {
      new URL(str)
      return true
    } catch {
      return false
    }
  }

  // Get attachment type and URL
  const getAttachmentInfo = (attachment: string) => {
    if (!attachment) return { type: "none", url: "" }

    // If it's already a data URL
    if (attachment.startsWith("data:")) {
      const isImage = attachment.startsWith("data:image/")
      const isPdf = attachment.startsWith("data:application/pdf")
      const isJson = attachment.startsWith("data:application/json")

      return {
        type: isImage ? "image" : isPdf ? "pdf" : isJson ? "json" : "file",
        url: attachment,
      }
    }

    // If it's base64 encoded data without data URL prefix
    if (isBase64Data(attachment)) {
      // Try to detect the type from the content
      if (attachment.startsWith("PHN2Zy") || attachment.includes("svg")) {
        return {
          type: "image",
          url: `data:image/svg+xml;base64,${attachment}`,
        }
      } else if (attachment.startsWith("JVBERi") || attachment.includes("PDF")) {
        return {
          type: "pdf",
          url: `data:application/pdf;base64,${attachment}`,
        }
      } else {
        // Default to image for base64 data
        return {
          type: "image",
          url: `data:image/png;base64,${attachment}`,
        }
      }
    }

    // If it's a valid URL
    if (isValidUrl(attachment)) {
      const lowerUrl = attachment.toLowerCase()
      const isImage = /\.(png|jpe?g|gif|webp|bmp|svg)(\?.*)?$/i.test(lowerUrl)
      const isPdf = /\.pdf(\?.*)?$/i.test(lowerUrl)

      return {
        type: isImage ? "image" : isPdf ? "pdf" : "file",
        url: attachment,
      }
    }

    // If it's JSON content, treat as text
    if (attachment.trim().startsWith("{") || attachment.trim().startsWith("[")) {
      return {
        type: "json",
        url: "",
      }
    }

    // Unknown type
    return {
      type: "unknown",
      url: attachment,
    }
  }

  const attachmentInfo = getAttachmentInfo(attachment)
  const { type: attachmentType, url: attachmentUrl } = attachmentInfo

  const openOrDownloadAttachment = async () => {
    try {
      if (!attachment) return

      const filenameFromUrl = (url: string, fallbackType: string) => {
        try {
          const u = new URL(url)
          const pathname = u.pathname
          const name = pathname.substring(pathname.lastIndexOf("/") + 1) || "attachment"
          return name.includes(".")
            ? name
            : `attachment.${fallbackType === "image" ? "png" : fallbackType === "pdf" ? "pdf" : "txt"}`
        } catch {
          return `attachment.${fallbackType === "image" ? "png" : fallbackType === "pdf" ? "pdf" : "txt"}`
        }
      }

      // For data URLs or base64 data
      if (attachmentUrl.startsWith("data:")) {
        const a = document.createElement("a")
        a.href = attachmentUrl
        a.download = filenameFromUrl(attachmentUrl, attachmentType)
        document.body.appendChild(a)
        a.click()
        a.remove()
        return
      }

      // For JSON content
      if (attachmentType === "json") {
        const blob = new Blob([attachment], { type: "application/json;charset=utf-8" })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = "attachment.json"
        document.body.appendChild(a)
        a.click()
        a.remove()
        URL.revokeObjectURL(url)
        return
      }

      // For external URLs that require auth
      const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken")
      const response = await fetch(attachmentUrl, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      })

      if (!response.ok) {
        // Fallback: try opening in new tab
        window.open(attachmentUrl, "_blank", "noopener,noreferrer")
        return
      }

      const contentType = response.headers.get("content-type") || "application/octet-stream"
      const blob = await response.blob()
      const blobUrl = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = blobUrl
      a.download = filenameFromUrl(attachmentUrl, attachmentType)
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(blobUrl)
    } catch (e) {
      console.error("Error handling attachment:", e)
      // Last resort - try to open whatever we have
      if (attachmentUrl) {
        window.open(attachmentUrl, "_blank", "noopener,noreferrer")
      }
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <motion.div
        ref={modalRef}
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ duration: 0.3 }}
        className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-lg bg-white shadow-xl"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b p-6">
          <h2 className="text-xl font-semibold text-gray-900">Expense Details</h2>
          <button onClick={onClose} className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6">
          {/* Basic Information */}
          <div className="mb-8">
            <h3 className="mb-4 text-lg font-medium text-gray-900">Basic Information</h3>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">Expense ID</label>
                <p className="mt-1 text-sm text-gray-900">{expense.expenseId}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Reference Number</label>
                <p className="mt-1 text-sm text-gray-900">{expense.referenceNo}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Expense Date</label>
                <p className="mt-1 text-sm text-gray-900">{formatDate(expense.expenseDate)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Created Date</label>
                <p className="mt-1 text-sm text-gray-900">{formatDateTime(expense.createdDate)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Party Name</label>
                <p className="mt-1 text-sm text-gray-900">{expense.partyName}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Branch ID</label>
                <p className="mt-1 text-sm text-gray-900">{expense.branchId}</p>
              </div>
            </div>
          </div>

          {/* Financial Information */}
          <div className="mb-8">
            <h3 className="mb-4 text-lg font-medium text-gray-900">Financial Information</h3>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">Total Amount</label>
                <p className="mt-1 text-lg font-semibold text-gray-900">{formatCurrency(expense.totalAmount)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Payment Method</label>
                <div className="mt-1">
                  <span
                    style={getPaymentMethodStyle(expense.paymentMethod)}
                    className="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium"
                  >
                    {expense.paymentMethod}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Status Information */}
          <div className="mb-8">
            <h3 className="mb-4 text-lg font-medium text-gray-900">Status Information</h3>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <div className="mt-1">
                  <span
                    style={getStatusStyle(expense.status)}
                    className="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium"
                  >
                    {expense.status}
                  </span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Approved By</label>
                <p className="mt-1 text-sm text-gray-900">{expense.approvedBy}</p>
              </div>
            </div>
          </div>

          {/* Expense Items */}
          {expense.expenseItems && expense.expenseItems.length > 0 && (
            <div className="mb-8">
              <h3 className="mb-4 text-lg font-medium text-gray-900">Expense Items</h3>
              <div className="overflow-hidden rounded-lg border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        Description
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        HSN
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        Price
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        Tax
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        Total Amount
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {expense.expenseItems.map((item, index) => (
                      <tr key={item.itemId}>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">{item.description}</td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">{item.hsn}</td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                          {formatCurrency(item.price)}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                          {formatCurrency(item.tax)}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                          {formatCurrency(item.totalAmount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tax Breakdown */}
          {expense.expenseItems && expense.expenseItems.length > 0 && (
            <div className="mb-8">
              <h3 className="mb-4 text-lg font-medium text-gray-900">Tax Breakdown</h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="rounded-lg border border-gray-200 p-4">
                  <label className="block text-sm font-medium text-gray-700">Total GST</label>
                  <p className="mt-1 text-lg font-semibold text-gray-900">
                    {formatCurrency(expense.expenseItems.reduce((sum, item) => sum + (item.gstAmount || 0), 0))}
                  </p>
                </div>
                <div className="rounded-lg border border-gray-200 p-4">
                  <label className="block text-sm font-medium text-gray-700">Total CGST</label>
                  <p className="mt-1 text-lg font-semibold text-gray-900">
                    {formatCurrency(expense.expenseItems.reduce((sum, item) => sum + (item.cgstAmount || 0), 0))}
                  </p>
                </div>
                <div className="rounded-lg border border-gray-200 p-4">
                  <label className="block text-sm font-medium text-gray-700">Total SGST</label>
                  <p className="mt-1 text-lg font-semibold text-gray-900">
                    {formatCurrency(expense.expenseItems.reduce((sum, item) => sum + (item.sgstAmount || 0), 0))}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Attachment Preview */}
          {attachment && (
            <div>
              <h3 className="mb-4 text-lg font-medium text-gray-900">Attachment</h3>
              <div className="rounded-lg border border-gray-200 p-4">
                {attachmentType === "image" && attachmentUrl && (
                  <div className="mt-2 flex justify-center">
                    <img
                      src={attachmentUrl}
                      alt="Expense attachment"
                      className="max-h-64 max-w-full rounded-lg object-contain"
                      onError={(e) => {
                        // Fallback if image fails to load
                        console.error("Image failed to load:", attachmentUrl)
                        e.currentTarget.style.display = "none"
                      }}
                    />
                  </div>
                )}
                {attachmentType === "pdf" && attachmentUrl && (
                  <div className="mt-2 h-80 w-full overflow-hidden rounded-lg border">
                    <object data={attachmentUrl} type="application/pdf" className="size-full">
                      <div className="flex h-full items-center justify-center bg-gray-100">
                        <p className="text-gray-500">PDF preview not available. Download to view.</p>
                      </div>
                    </object>
                  </div>
                )}
                {attachmentType === "json" && (
                  <div className="mt-2 rounded bg-gray-100 p-4">
                    <pre className="whitespace-pre-wrap break-words text-sm">
                      {JSON.stringify(JSON.parse(attachment), null, 2)}
                    </pre>
                  </div>
                )}
                {attachmentType === "unknown" && (
                  <div className="mt-2 rounded bg-gray-100 p-4">
                    <p className="text-sm text-gray-600">Attachment content (format unknown):</p>
                    <pre className="mt-2 whitespace-pre-wrap break-words text-xs">
                      {attachment.substring(0, 500)}
                      {attachment.length > 500 ? "..." : ""}
                    </pre>
                  </div>
                )}
                {attachmentType === "none" && <p className="text-sm text-gray-600">No attachment available</p>}

                {(attachmentType === "image" ||
                  attachmentType === "pdf" ||
                  attachmentType === "json" ||
                  attachmentType === "unknown") && (
                  <div className="mt-3">
                    <button
                      type="button"
                      onClick={openOrDownloadAttachment}
                      className="text-sm font-medium text-blue-600 hover:underline"
                    >
                      {attachmentType === "image" || attachmentType === "pdf"
                        ? "Open/Download Attachment"
                        : "Download Attachment"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex justify-end border-t bg-gray-50 px-6 py-4">
          <ButtonModule variant="ghost" size="md" onClick={onClose}>
            Close
          </ButtonModule>
        </div>
      </motion.div>
    </div>
  )
}

// Create Expense Page Component
const CreateExpensePage = ({ onExpenseCreated }: { onExpenseCreated: () => void }) => {
  const dispatch = useAppDispatch()
  const { categories, categoriesLoading, createExpenseLoading, createExpenseError } = useAppSelector(selectExpenses)
  const { branches } = useAppSelector(selectBranches)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null)

  const [formData, setFormData] = useState<CreateExpensePayload>({
    expenseDate: new Date().toISOString().slice(0, 10),
    branchId: 0,
    partyName: "",
    paymentMethod: "CASH",
    status: "DRAFT",
    approvedBy: "Admin",
    expenseItems: [
      {
        price: 0,
        hsn: 0,
        tax: 0,
        taxIncluded: true,
        description: "",
        categoryId: 0,
      },
    ],
  })

  // Fetch categories when component mounts
  useEffect(() => {
    dispatch(fetchAllExpenseCategories())
  }, [dispatch])

  // Set default branch when branches load
  useEffect(() => {
    if (branches.length > 0 && formData.branchId === 0) {
      setFormData((prev) => ({
        ...prev,
        branchId: branches[0]?.branchId ?? 0,
      }))
    }
  }, [branches, formData.branchId])

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
        ...prev.expenseItems,
        {
          price: 0,
          hsn: 0,
          tax: 0,
          taxIncluded: true,
          description: "",
          categoryId: 0,
        },
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

      // Handle custom thunk return structure: { success, data, error }
      const success = (result as any)?.success
      const apiMessage = (result as any)?.data?.message
      const errorMsg = (result as any)?.error

      if (success) {
        const message = apiMessage || "Expense created successfully!"
        notify("success", message, {
          title: "Success",
          description: message,
        })

        // Reset form
        setFormData({
          expenseDate: new Date().toISOString().slice(0, 10),
          branchId: branches[0]?.branchId ?? 0,
          partyName: "",
          paymentMethod: "CASH",
          status: "DRAFT",
          approvedBy: "Admin",
          expenseItems: [
            {
              price: 0,
              hsn: 0,
              tax: 0,
              taxIncluded: true,
              description: "",
              categoryId: 0,
            },
          ],
        })
        setPreviewImage(null)
        setAttachmentFile(null)

        onExpenseCreated()
      } else if (errorMsg) {
        // Show error from the thunk
        notify("error", "Expense creation failed", {
          title: "Error",
          description: errorMsg,
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
    <div className="min-h-screen bg-gray-50 p-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create New Expense</h1>
          <p className="mt-1 text-sm text-gray-600">Fill in the details below to create a new expense record</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => window.history.back()}
          className="flex items-center gap-2 rounded-md bg-gray-600 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
        >
          <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Expenses
        </motion.button>
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
                    className="flex items-center gap-2 rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Item
                  </motion.button>
                </div>

                <div className="space-y-4">
                  {formData.expenseItems.map((item, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="rounded-lg border border-gray-200 p-4"
                    >
                      <div className="mb-4 flex items-center justify-between">
                        <h4 className="font-medium text-gray-900">Item {index + 1}</h4>
                        {formData.expenseItems.length > 1 && (
                          <motion.button
                            type="button"
                            onClick={() => removeExpenseItem(index)}
                            className="rounded-full p-1 text-red-600 hover:bg-red-50"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          </motion.button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <FormInputModule
                          label="Description *"
                          type="text"
                          placeholder="Enter item description"
                          value={item.description}
                          onChange={(e) => handleExpenseItemChange(index, "description", e.target.value)}
                          className="w-full"
                        />

                        <div>
                          <label className="mb-1 block text-sm font-medium text-gray-700">Category *</label>
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
                                  handleExpenseItemChange(index, "categoryId", selectedCategory.categoryId)
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
                          onChange={(e) => handleExpenseItemChange(index, "price", parseFloat(e.target.value) || 0)}
                          className="w-full"
                        />

                        <FormInputModule
                          label="HSN Code"
                          type="number"
                          placeholder="Enter HSN code"
                          value={item.hsn}
                          onChange={(e) => handleExpenseItemChange(index, "hsn", parseInt(e.target.value) || 0)}
                          className="w-full"
                        />

                        <FormInputModule
                          label="Tax (%)"
                          type="number"
                          placeholder="0"
                          value={item.tax}
                          onChange={(e) => handleExpenseItemChange(index, "tax", parseFloat(e.target.value) || 0)}
                          className="w-full"
                        />

                        <div className="flex items-center">
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={item.taxIncluded}
                              onChange={(e) => handleExpenseItemChange(index, "taxIncluded", e.target.checked)}
                              className="mr-2 rounded border-gray-300"
                            />
                            <span className="text-sm font-medium text-gray-700">Tax Included</span>
                          </label>
                        </div>
                      </div>
                    </motion.div>
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
                className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-6 transition-colors hover:border-blue-500"
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
                onClick={() => window.history.back()}
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
            className="rounded-lg bg-blue-50 p-6 shadow-sm"
          >
            <h4 className="mb-3 text-sm font-medium text-blue-900">Required Fields</h4>
            <ul className="space-y-2 text-sm text-blue-700">
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
                Item descriptions and categories
              </li>
            </ul>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

// Dropdown Popover Component
const ActionDropdown = ({
  order,
  onClose,
  position,
  onViewDetails,
}: {
  order: FinanceOrder
  onClose: () => void
  position: { top: number; left: number }
  onViewDetails: () => void
}) => {
  const dropdownRef = useRef<HTMLDivElement>(null)

  const handleViewDetails = () => {
    onViewDetails()
    onClose()
  }

  const handleEdit = () => {
    console.log("Edit expense:", order.expenseId)
    onClose()
  }

  const handleDelete = () => {
    console.log("Delete expense:", order.expenseId)
    onClose()
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [onClose])

  return (
    <div
      ref={dropdownRef}
      className="fixed z-50 w-48 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
      style={{
        top: position.top,
        left: position.left,
      }}
    >
      <div className="py-1">
        <motion.button
          whileHover={{ backgroundColor: "#f3f4f6" }}
          whileTap={{ scale: 0.98 }}
          onClick={handleViewDetails}
          className="block w-full px-4 py-2 text-left text-sm text-gray-700"
        >
          View Details
        </motion.button>
        <motion.button
          whileHover={{ backgroundColor: "#f3f4f6" }}
          whileTap={{ scale: 0.98 }}
          onClick={handleEdit}
          className="block w-full px-4 py-2 text-left text-sm text-gray-700"
        >
          Edit
        </motion.button>
        <motion.button
          whileHover={{ backgroundColor: "#f3f4f6" }}
          whileTap={{ scale: 0.98 }}
          onClick={handleDelete}
          className="block w-full px-4 py-2 text-left text-sm text-red-600"
        >
          Delete
        </motion.button>
      </div>
    </div>
  )
}

const SkeletonRow = () => {
  return (
    <tr>
      {[...Array(9)].map((_, index) => (
        <td key={index} className="whitespace-nowrap border-b px-4 py-2 text-sm">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className="h-6 w-full animate-pulse rounded bg-gray-200"
          ></motion.div>
        </td>
      ))}
    </tr>
  )
}

const exportToCSV = (data: Expense[], filename: string) => {
  const headers = [
    "SN",
    "Expense ID",
    "Date",
    "Party Name",
    "Reference No",
    "Total Amount",
    "Payment Method",
    "Status",
    "Approved By",
  ]
  const rows = data.map((expense, index) => [
    index + 1,
    expense.expenseId,
    `"${expense.expenseDate}"`,
    `"${expense.partyName}"`,
    `"${expense.referenceNo}"`,
    expense.totalAmount,
    `"${expense.paymentMethod}"`,
    `"${expense.status}"`,
    `"${expense.approvedBy}"`,
  ])
  const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n")
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
  const link = document.createElement("a")
  const url = URL.createObjectURL(blob)

  link.setAttribute("href", url)
  link.setAttribute("download", filename)
  link.style.visibility = "hidden"

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

const AllFinance = () => {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { expenses, loading, error, pagination, categories } = useAppSelector(selectExpenses)

  const [sortColumn, setSortColumn] = useState<string | null>(null)
  const [sortOrder, setSortOrder] = useState<SortOrder>(null)
  const [searchText, setSearchText] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(7)
  const [activeDropdown, setActiveDropdown] = useState<number | null>(null)
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 })
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [isCreatePage, setIsCreatePage] = useState(false)
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null)

  const fetchExpenses = useCallback(
    async (signal?: AbortSignal) => {
      try {
        await dispatch(fetchAllExpenses(currentPage - 1, itemsPerPage, signal))
      } catch (error) {
        if (!(error instanceof Error && error.name === "AbortError")) {
          console.error("Failed to fetch expenses:", error)
        }
      }
    },
    [dispatch, currentPage, itemsPerPage]
  )

  useEffect(() => {
    const controller = new AbortController()
    fetchExpenses(controller.signal)

    return () => {
      controller.abort()
    }
  }, [fetchExpenses])

  // Fetch branches when component mounts
  useEffect(() => {
    dispatch(fetchAllBranches())
  }, [dispatch])

  const toggleDropdown = (index: number, event: React.MouseEvent) => {
    if (activeDropdown === index) {
      setActiveDropdown(null)
    } else {
      // Calculate position for dropdown
      const rect = event.currentTarget.getBoundingClientRect()
      const dropdownHeight = 112 // Approximate height of dropdown with 3 items
      const viewportHeight = window.innerHeight

      // Check if dropdown would go off screen at the bottom
      let topPosition = rect.bottom + window.scrollY
      if (rect.bottom + dropdownHeight > viewportHeight) {
        // If it would go off screen, position it above the button
        topPosition = rect.top + window.scrollY - dropdownHeight
      }

      setDropdownPosition({
        top: topPosition,
        left: rect.right + window.scrollX - 192, // 192px is the width of the dropdown
      })
      setActiveDropdown(index)
    }
  }

  const handleViewDetails = (expense: Expense) => {
    setSelectedExpense(expense)
    setIsDetailsModalOpen(true)
  }

  const closeDetailsModal = () => {
    setIsDetailsModalOpen(false)
    setSelectedExpense(null)
  }

  const handleCreateExpense = () => {
    router.push("/finance/create-expense")
  }

  const handleExpenseCreated = () => {
    // Refresh the expenses list and go back to list view
    fetchExpenses()
    setIsCreatePage(false)
  }

  const handleBackToList = () => {
    setIsCreatePage(false)
  }

  const getStatusStyle = useCallback((status: string) => {
    switch (status.toLowerCase()) {
      case "paid":
      case "approved":
      case "completed":
        return { backgroundColor: "#EEF5F0", color: "#589E67" }
      case "pending":
      case "draft":
        return { backgroundColor: "#FFF3CD", color: "#856404" }
      case "cancelled":
      case "rejected":
      case "failed":
        return { backgroundColor: "#F7EDED", color: "#AF4B4B" }
      default:
        return { backgroundColor: "#F3F4F6", color: "#6B7280" }
    }
  }, [])

  const getPaymentMethodStyle = useCallback((method: string) => {
    switch (method.toLowerCase()) {
      case "cash":
        return { backgroundColor: "#E8F5E8", color: "#2E7D32" }
      case "card":
        return { backgroundColor: "#E3F2FD", color: "#1565C0" }
      case "upi":
        return { backgroundColor: "#F3E5F5", color: "#7B1FA2" }
      case "bank transfer":
        return { backgroundColor: "#FFF3E0", color: "#EF6C00" }
      default:
        return { backgroundColor: "#F3F4F6", color: "#6B7280" }
    }
  }, [])

  const toggleSort = useCallback(
    (column: keyof FinanceOrder) => {
      const isAscending = sortColumn === column && sortOrder === "asc"
      setSortOrder(isAscending ? "desc" : "asc")
      setSortColumn(column)
    },
    [sortColumn, sortOrder]
  )

  const handleCancelSearch = () => {
    setSearchText("")
  }

  const handleExport = () => {
    const dataToExport = searchText ? filteredExpenses : expenses
    exportToCSV(dataToExport, "expenses_export.csv")
  }

  const filteredExpenses = useMemo(() => {
    return expenses.filter((expense) =>
      Object.values(expense).some((value) => {
        if (value === null || value === undefined) return false
        if (typeof value === "object") return false // Skip nested objects like expenseItems
        return String(value).toLowerCase().includes(searchText.toLowerCase())
      })
    )
  }, [expenses, searchText])

  const sortedExpenses = useMemo(() => {
    if (!sortColumn) return filteredExpenses

    return [...filteredExpenses].sort((a, b) => {
      let aValue: any = a[sortColumn as keyof Expense]
      let bValue: any = b[sortColumn as keyof Expense]

      // Handle numeric sorting
      if (sortColumn === "totalAmount" || sortColumn === "expenseId") {
        aValue = Number(aValue)
        bValue = Number(bValue)
      }

      // Handle date sorting
      if (sortColumn === "expenseDate" || sortColumn === "createdDate") {
        aValue = new Date(aValue).getTime()
        bValue = new Date(bValue).getTime()
      }

      if (aValue < bValue) return sortOrder === "asc" ? -1 : 1
      if (aValue > bValue) return sortOrder === "asc" ? 1 : -1
      return 0
    })
  }, [filteredExpenses, sortColumn, sortOrder])

  const paginate = (pageNumber: number) => {
    setCurrentPage(pageNumber)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }

  // Render Create Expense Page if in create mode
  if (isCreatePage) {
    return <CreateExpensePage onExpenseCreated={handleExpenseCreated} />
  }

  return (
    <>
      {/* Expense Details Modal */}
      <ExpenseDetailsModal isOpen={isDetailsModalOpen} onClose={closeDetailsModal} expense={selectedExpense} />

      <div className="min-h-screen bg-gray-50 p-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-5 flex w-full justify-between"
        >
          <p className="text-xl font-semibold">Finance</p>
          <motion.div
            className="flex gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <ButtonModule variant="black" size="md" icon={<ExportIcon />} iconPosition="end" onClick={handleExport}>
                <p className="max-sm:hidden">Export</p>
              </ButtonModule>
            </motion.div>

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <ButtonModule
                variant="ghost"
                size="md"
                icon={<AddBusiness />}
                iconPosition="end"
                onClick={handleCreateExpense}
              >
                <p className="max-sm:hidden"> Add New Expense</p>
              </ButtonModule>
            </motion.div>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="flex-3 mt-5 flex flex-col rounded-md border bg-white p-3 md:p-5"
        >
          <div className="items-center justify-between border-b py-2 md:flex md:py-4">
            <p className="text-lg font-semibold max-sm:pb-3 md:text-2xl">Expenses</p>
            <motion.div
              className="flex gap-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <SearchModule
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                onCancel={handleCancelSearch}
              />
            </motion.div>
          </div>

          {loading ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="w-full overflow-x-auto border-l border-r"
            >
              <table className="w-full min-w-[800px] border-separate border-spacing-0 text-left">
                <thead>
                  <tr>
                    <th className="whitespace-nowrap border-b bg-[#F4F9F8] p-4 text-sm">
                      <div className="flex items-center gap-2">
                        <MdOutlineCheckBoxOutlineBlank className="text-lg" />
                        SN <RxCaretSort />
                      </div>
                    </th>
                    <th className="whitespace-nowrap border-b bg-[#F4F9F8] p-4 text-sm">
                      <div className="flex items-center gap-2">
                        Expense ID <RxCaretSort />
                      </div>
                    </th>
                    <th className="whitespace-nowrap border-b bg-[#F4F9F8] p-4 text-sm">
                      <div className="flex items-center gap-2">
                        Date <RxCaretSort />
                      </div>
                    </th>
                    <th className="whitespace-nowrap border-b bg-[#F4F9F8] p-4 text-sm">
                      <div className="flex items-center gap-2">
                        Party Name <RxCaretSort />
                      </div>
                    </th>
                    <th className="whitespace-nowrap border-b bg-[#F4F9F8] p-4 text-sm">
                      <div className="flex items-center gap-2">
                        Reference No <RxCaretSort />
                      </div>
                    </th>
                    <th className="whitespace-nowrap border-b bg-[#F4F9F8] p-4 text-sm">
                      <div className="flex items-center gap-2">
                        Total Amount <RxCaretSort />
                      </div>
                    </th>
                    <th className="whitespace-nowrap border-b bg-[#F4F9F8] p-4 text-sm">
                      <div className="flex items-center gap-2">
                        Payment Method <RxCaretSort />
                      </div>
                    </th>
                    <th className="whitespace-nowrap border-b bg-[#F4F9F8] p-4 text-sm">
                      <div className="flex items-center gap-2">
                        Status <RxCaretSort />
                      </div>
                    </th>
                    <th className="whitespace-nowrap border-b bg-[#F4F9F8] p-4 text-sm">
                      <div className="flex items-center gap-2">Action</div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {[...Array(6)].map((_, index) => (
                    <SkeletonRow key={index} />
                  ))}
                </tbody>
              </table>
            </motion.div>
          ) : error ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex h-60 flex-col items-center justify-center gap-2 bg-[#F4F9F8]"
            >
              <div className="text-center">
                <EmptyState />
                <p className="text-xl font-bold text-[#D82E2E]">Failed to load expenses.</p>
                <p>{error}</p>
              </div>
            </motion.div>
          ) : sortedExpenses.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex h-60 flex-col items-center justify-center gap-2 bg-[#F4F9F8]"
            >
              <EmptyState />
              <p className="text-base font-bold text-[#202B3C]">No expenses found.</p>
            </motion.div>
          ) : (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="w-full overflow-x-auto border-l border-r"
              >
                <table className="w-full min-w-[800px] border-separate border-spacing-0 text-left">
                  <thead>
                    <tr>
                      <th className="whitespace-nowrap border-b bg-[#F4F9F8] p-4 text-sm">
                        <div className="flex items-center gap-2">
                          <MdOutlineCheckBoxOutlineBlank className="text-lg" />
                          SN
                        </div>
                      </th>
                      <th
                        className="cursor-pointer whitespace-nowrap border-b bg-[#F4F9F8] p-4 text-sm"
                        onClick={() => toggleSort("expenseId")}
                      >
                        <div className="flex items-center gap-2">
                          Expense ID <RxCaretSort />
                        </div>
                      </th>
                      <th
                        className="cursor-pointer whitespace-nowrap border-b bg-[#F4F9F8] p-4 text-sm"
                        onClick={() => toggleSort("expenseDate")}
                      >
                        <div className="flex items-center gap-2">
                          Date <RxCaretSort />
                        </div>
                      </th>
                      <th
                        className="cursor-pointer whitespace-nowrap border-b bg-[#F4F9F8] p-4 text-sm"
                        onClick={() => toggleSort("partyName")}
                      >
                        <div className="flex items-center gap-2">
                          Party Name <RxCaretSort />
                        </div>
                      </th>
                      <th
                        className="cursor-pointer whitespace-nowrap border-b bg-[#F4F9F8] p-4 text-sm"
                        onClick={() => toggleSort("referenceNo")}
                      >
                        <div className="flex items-center gap-2">
                          Reference No <RxCaretSort />
                        </div>
                      </th>
                      <th
                        className="cursor-pointer whitespace-nowrap border-b bg-[#F4F9F8] p-4 text-sm"
                        onClick={() => toggleSort("totalAmount")}
                      >
                        <div className="flex items-center gap-2">
                          Total Amount <RxCaretSort />
                        </div>
                      </th>
                      <th
                        className="cursor-pointer whitespace-nowrap border-b bg-[#F4F9F8] p-4 text-sm"
                        onClick={() => toggleSort("paymentMethod")}
                      >
                        <div className="flex items-center gap-2">
                          Payment Method <RxCaretSort />
                        </div>
                      </th>
                      <th
                        className="cursor-pointer whitespace-nowrap border-b bg-[#F4F9F8] p-4 text-sm"
                        onClick={() => toggleSort("status")}
                      >
                        <div className="flex items-center gap-2">
                          Status <RxCaretSort />
                        </div>
                      </th>
                      <th className="whitespace-nowrap border-b bg-[#F4F9F8] p-4 text-sm">
                        <div className="flex items-center gap-2">Action</div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <AnimatePresence>
                      {sortedExpenses.map((expense, index) => (
                        <motion.tr
                          key={expense.expenseId}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.2, delay: index * 0.05 }}
                        >
                          <td className="whitespace-nowrap border-b px-4 py-2 text-sm">
                            <div className="flex items-center gap-2">
                              <MdOutlineCheckBoxOutlineBlank className="text-lg" />
                              {(currentPage - 1) * itemsPerPage + index + 1}
                            </div>
                          </td>
                          <td className="whitespace-nowrap border-b px-4 py-2 text-sm">
                            <div className="flex items-center gap-2">{expense.expenseId}</div>
                          </td>
                          <td className="whitespace-nowrap border-b px-4 py-2 text-sm">
                            <div className="flex items-center gap-2">{formatDate(expense.expenseDate)}</div>
                          </td>
                          <td className="whitespace-nowrap border-b px-4 py-2 text-sm">
                            <div className="flex items-center gap-2">{expense.partyName}</div>
                          </td>
                          <td className="whitespace-nowrap border-b px-4 py-2 text-sm">
                            <div className="flex items-center gap-2">{expense.referenceNo}</div>
                          </td>
                          <td className="whitespace-nowrap border-b px-4 py-2 text-sm">
                            <div className="flex items-center gap-2 font-medium">
                              {formatCurrency(expense.totalAmount)}
                            </div>
                          </td>
                          <td className="whitespace-nowrap border-b px-4 py-3 text-sm">
                            <div className="flex">
                              <motion.div
                                style={getPaymentMethodStyle(expense.paymentMethod)}
                                className="flex items-center justify-center gap-1 rounded-full px-2 py-1 text-xs"
                                whileHover={{ scale: 1.05 }}
                              >
                                {expense.paymentMethod}
                              </motion.div>
                            </div>
                          </td>
                          <td className="whitespace-nowrap border-b px-4 py-3 text-sm">
                            <div className="flex">
                              <motion.div
                                style={getStatusStyle(expense.status)}
                                className="flex items-center justify-center gap-1 rounded-full px-2 py-1 text-xs"
                                whileHover={{ scale: 1.05 }}
                              >
                                {expense.status}
                              </motion.div>
                            </div>
                          </td>
                          <td className="whitespace-nowrap border-b px-4 py-1 text-sm">
                            <div className="relative flex items-center gap-2">
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={(e) => toggleDropdown(index, e)}
                                className="flex items-center gap-2 rounded p-1 hover:bg-gray-100"
                              >
                                <RxDotsVertical />
                              </motion.button>
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </tbody>
                </table>
              </motion.div>

              {/* Render dropdown outside the table */}
              {(() => {
                const selectedExpense = activeDropdown !== null ? sortedExpenses[activeDropdown] : undefined
                if (activeDropdown === null || !selectedExpense) return null
                return (
                  <ActionDropdown
                    order={{
                      sn: activeDropdown + 1,
                      expenseId: selectedExpense.expenseId,
                      expenseDate: selectedExpense.expenseDate,
                      partyName: selectedExpense.partyName,
                      referenceNo: selectedExpense.referenceNo,
                      totalAmount: selectedExpense.totalAmount,
                      paymentMethod: selectedExpense.paymentMethod,
                      status: selectedExpense.status,
                      approvedBy: selectedExpense.approvedBy,
                    }}
                    onClose={() => setActiveDropdown(null)}
                    position={dropdownPosition}
                    onViewDetails={() => handleViewDetails(selectedExpense)}
                  />
                )
              })()}

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="flex items-center justify-between border-t px-4 py-3"
              >
                <div className="text-sm text-gray-700">
                  Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                  {Math.min(currentPage * itemsPerPage, pagination.totalElements)} of {pagination.totalElements} entries
                </div>
                <div className="flex gap-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`rounded-full px-2 py-1 ${
                      currentPage === 1
                        ? "cursor-not-allowed bg-gray-200 text-gray-500"
                        : "bg-gray-200 hover:bg-gray-300"
                    }`}
                  >
                    <MdOutlineArrowBackIosNew />
                  </motion.button>

                  {Array.from({ length: Math.min(5, pagination.totalPages) }).map((_, index) => (
                    <motion.button
                      key={index}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => paginate(index + 1)}
                      className={`rounded-full px-3 py-1 ${
                        currentPage === index + 1 ? "bg-primary text-[#ffffff]" : "bg-gray-200 hover:bg-gray-300"
                      }`}
                    >
                      {index + 1}
                    </motion.button>
                  ))}

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === pagination.totalPages}
                    className={`rounded-full px-2 py-1 ${
                      currentPage === pagination.totalPages
                        ? "cursor-not-allowed bg-gray-200 text-gray-500"
                        : "bg-gray-200 hover:bg-gray-300"
                    }`}
                  >
                    <MdOutlineArrowForwardIos />
                  </motion.button>
                </div>
              </motion.div>
            </>
          )}
        </motion.div>
      </div>
    </>
  )
}

export default AllFinance
