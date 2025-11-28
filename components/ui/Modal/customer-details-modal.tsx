"use client"

import React, { useEffect, useRef, useState } from "react"
import Modal from "react-modal"
import { MdClose } from "react-icons/md"
import { ButtonModule } from "components/ui/Button/Button"
import PdfFile from "public/pdf-file"
import { jsPDF } from "jspdf"
import html2canvas from "html2canvas"
import { useAppDispatch, useAppSelector } from "app/api/store/store"
import { fetchCustomerById, fetchSalesByCustomerDetails } from "app/api/store/customerSlice"

import { RxAvatar } from "react-icons/rx"
import { FiCalendar, FiCreditCard, FiDollarSign, FiMail, FiMapPin, FiPackage, FiPhone } from "react-icons/fi"
import { TbCoin } from "react-icons/tb"
import { format } from "date-fns"
import { FaArrowLeft, FaArrowRight } from "react-icons/fa"

interface CustomerDetailsModalProps {
  isOpen: boolean
  customerId: number | null
  onRequestClose: () => void
}

const CustomerDetailsModal: React.FC<CustomerDetailsModalProps> = ({ isOpen, customerId, onRequestClose }) => {
  const modalRef = useRef<HTMLDivElement>(null)
  const dispatch = useAppDispatch()
  const { currentCustomer, loading, error, customerSales } = useAppSelector((state) => state.customer)
  const [activeTab, setActiveTab] = useState("details")
  const [currentPage, setCurrentPage] = useState(0)
  const [pageSize, setPageSize] = useState(5)

  useEffect(() => {
    if (isOpen && customerId) {
      dispatch(fetchCustomerById(customerId))
      dispatch(
        fetchSalesByCustomerDetails(
          customerId,
          currentCustomer?.customerName || "",
          currentCustomer?.customerEmail || "",
          currentPage,
          pageSize
        )
      )
    }
  }, [isOpen, customerId, dispatch, currentPage, pageSize])

  useEffect(() => {
    if (customerId && currentCustomer) {
      dispatch(
        fetchSalesByCustomerDetails(
          customerId,
          currentCustomer.customerName,
          currentCustomer.customerEmail,
          currentPage,
          pageSize
        )
      )
    }
  }, [activeTab, customerId, currentCustomer, dispatch, currentPage, pageSize])

  const handleDownloadPDF = async () => {
    if (!modalRef.current) return

    try {
      const canvas = await html2canvas(modalRef.current, {
        scale: 2,
        logging: false,
        useCORS: true,
        allowTaint: true,
      })

      const imgData = canvas.toDataURL("image/png")
      const pdf = new jsPDF("p", "mm", "a4")
      const imgWidth = 210 // A4 width in mm
      const pageHeight = 297 // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      let heightLeft = imgHeight
      let position = 0

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight
        pdf.addPage()
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight)
        heightLeft -= pageHeight
      }

      pdf.save(`Customer_Details_${currentCustomer?.customerProfileId}.pdf`)
    } catch (error) {
      console.error("Error generating PDF:", error)
      alert("Failed to generate PDF. Please try again.")
    }
  }

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "Y":
        return {
          backgroundColor: "#EEF5F0",
          color: "#589E67",
        }
      case "N":
        return {
          backgroundColor: "#F7EDED",
          color: "#AF4B4B",
        }
      default:
        return {}
    }
  }

  const getSubscriptionStyle = (subscription: string) => {
    switch (subscription) {
      case "Business":
        return {
          backgroundColor: "#EDF2FE",
          color: "#4976F4",
        }
      case "Premium":
        return {
          backgroundColor: "#F4EDF7",
          color: "#954BAF",
        }
      default:
        return {
          backgroundColor: "#F4F9F8",
          color: "#5A6A85",
        }
    }
  }

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd MMM yyyy, hh:mm a")
    } catch {
      return dateString
    }
  }

  const renderOrderStatus = (status: string) => {
    switch (status) {
      case "Paid":
        return <span className="text-green-600">Paid</span>
      case "Pending":
        return <span className="text-yellow-600">Pending</span>
      case "Cancelled":
        return <span className="text-red-600">Cancelled</span>
      default:
        return <span className="text-gray-600">{status}</span>
    }
  }

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage)
  }

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize)
    setCurrentPage(0) // Reset to first page when changing page size
  }

  if (!isOpen) return null

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      className="flex h-[90vh] w-[800px] overflow-hidden rounded-md bg-white shadow-lg outline-none max-sm:w-full max-sm:max-w-[380px]"
      overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      ariaHideApp={false}
    >
      <div ref={modalRef} className="flex w-full flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b p-4">
          <div className="flex items-center gap-3">
            {loading ? (
              <div className="size-12 animate-pulse rounded-full bg-gray-200" />
            ) : (
              <div className="flex size-12 items-center justify-center rounded-full bg-gray-100">
                <RxAvatar className="size-6 text-gray-500" />
              </div>
            )}
            <div>
              {loading ? (
                <>
                  <div className="h-5 w-40 animate-pulse rounded bg-gray-200" />
                  <div className="mt-1 h-4 w-24 animate-pulse rounded bg-gray-200" />
                </>
              ) : (
                <>
                  <h2 className="text-lg font-semibold text-gray-800">
                    {currentCustomer?.customerName || "Customer Details"}
                  </h2>
                  <p className="text-sm text-gray-500">ID: {currentCustomer?.customerProfileId}</p>
                </>
              )}
            </div>
          </div>
          <button
            onClick={onRequestClose}
            className="rounded-full p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-800"
          >
            <MdClose size={24} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b">
          <button
            className={`flex-1 py-3 text-sm font-medium ${
              activeTab === "details" ? "text-primary border-b-2 border-[#00A4a6]" : "text-gray-500"
            }`}
            onClick={() => setActiveTab("details")}
          >
            Details
          </button>
          <button
            className={`flex-1 py-3 text-sm font-medium ${
              activeTab === "orders" ? "text-primary border-b-2 border-[#00A4a6]" : "text-gray-500"
            }`}
            onClick={() => setActiveTab("orders")}
          >
            Orders ({customerSales.pagination.totalElements})
          </button>
          <button
            className={`flex-1 py-3 text-sm font-medium ${
              activeTab === "transactions" ? "text-primary border-b-2 border-[#00A4a6]" : "text-gray-500"
            }`}
            onClick={() => setActiveTab("transactions")}
          >
            Transactions ({customerSales.pagination.totalElements})
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="space-y-6">
              {/* Status and Subscription Skeleton */}
              <div className="flex gap-4">
                <div className="h-8 w-24 animate-pulse rounded-full bg-gray-200" />
                <div className="h-8 w-24 animate-pulse rounded-full bg-gray-200" />
              </div>

              {/* Contact Info Skeleton */}
              <div className="rounded-lg border bg-gray-50 p-4">
                <div className="mb-3 h-5 w-32 animate-pulse rounded bg-gray-200" />
                <div className="space-y-3">
                  {[1, 2, 3].map((item) => (
                    <div key={item} className="flex items-center gap-3">
                      <div className="size-5 animate-pulse rounded-full bg-gray-200" />
                      <div>
                        <div className="h-3 w-16 animate-pulse rounded bg-gray-200" />
                        <div className="mt-1 size-40 animate-pulse rounded bg-gray-200" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Loyalty and GST Skeleton */}
              <div className="grid grid-cols-2 gap-4">
                {[1, 2].map((item) => (
                  <div key={item} className="rounded-lg border bg-gray-50 p-4">
                    <div className="flex items-center gap-3">
                      <div className="size-5 animate-pulse rounded-full bg-gray-200" />
                      <div>
                        <div className="h-3 w-24 animate-pulse rounded bg-gray-200" />
                        <div className="mt-1 h-4 w-16 animate-pulse rounded bg-gray-200" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Subscription Details Skeleton */}
              <div className="rounded-lg border bg-gray-50 p-4">
                <div className="mb-3 h-5 w-32 animate-pulse rounded bg-gray-200" />
                <div className="grid grid-cols-3 gap-4">
                  {[1, 2, 3].map((item) => (
                    <div key={item}>
                      <div className="h-3 w-16 animate-pulse rounded bg-gray-200" />
                      <div className="mt-1 h-4 w-20 animate-pulse rounded bg-gray-200" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : error ? (
            <div className="flex h-40 items-center justify-center text-red-500">
              Failed to load customer details: {error}
            </div>
          ) : currentCustomer ? (
            <>
              {activeTab === "details" && (
                <div className="space-y-6">
                  {/* Status and Subscription */}
                  <div className="flex gap-4">
                    <div
                      style={getStatusStyle(currentCustomer.status || "N")}
                      className="flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium"
                    >
                      <span
                        className={`size-2 rounded-full ${
                          currentCustomer.status === "Y" ? "bg-green-500" : "bg-red-500"
                        }`}
                      ></span>
                      {currentCustomer.status === "Y" ? "Active" : "Inactive"}
                    </div>
                    <div
                      style={getSubscriptionStyle(currentCustomer.subscriptionOpt || "Individual")}
                      className="flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium"
                    >
                      {currentCustomer.subscriptionOpt || "Individual"}
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="rounded-lg border bg-gray-50 p-4">
                    <h3 className="mb-3 text-sm font-semibold text-gray-700">Contact Information</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <FiMail className="size-5 text-gray-400" />
                        <div>
                          <p className="text-xs text-gray-500">Email</p>
                          <p className="text-sm font-medium text-gray-800">
                            {currentCustomer.customerEmail || "Not provided"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <FiPhone className="size-5 text-gray-400" />
                        <div>
                          <p className="text-xs text-gray-500">Phone</p>
                          <p className="text-sm font-medium text-gray-800">
                            {currentCustomer.customerPhone || "Not provided"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <FiMapPin className="size-5 text-gray-400" />
                        <div>
                          <p className="text-xs text-gray-500">Address</p>
                          <p className="text-sm font-medium text-gray-800">
                            {currentCustomer.customerAddress || "Not provided"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Loyalty and GST */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-lg border bg-gray-50 p-4">
                      <div className="flex items-center gap-3">
                        <TbCoin className="size-5 text-gray-400" />
                        <div>
                          <p className="text-xs text-gray-500">Loyalty Points</p>
                          <p className="text-sm font-medium text-gray-800">
                            {currentCustomer.customerLoyaltyPoints || 0} points
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="rounded-lg border bg-gray-50 p-4">
                      <div className="flex items-center gap-3">
                        <FiCreditCard className="size-5 text-gray-400" />
                        <div>
                          <p className="text-xs text-gray-500">GSTIN</p>
                          <p className="text-sm font-medium text-gray-800">
                            {currentCustomer.gstin || "Not registered"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Subscription Details */}
                  {currentCustomer.subscriptionOpt && (
                    <div className="rounded-lg border bg-gray-50 p-4">
                      <h3 className="mb-3 text-sm font-semibold text-gray-700">Subscription Details</h3>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <p className="text-xs text-gray-500">Type</p>
                          <p className="text-sm font-medium text-gray-800">{currentCustomer.subscriptionOpt}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Duration</p>
                          <p className="text-sm font-medium text-gray-800">
                            {currentCustomer.subscriptionDuration || "N/A"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Amount</p>
                          <p className="text-sm font-medium text-gray-800">
                            {currentCustomer.subscriptionAmt ? `₹${currentCustomer.subscriptionAmt}` : "N/A"}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {(activeTab === "orders" || activeTab === "transactions") && (
                <div className="space-y-4">
                  {customerSales.loading ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map((item) => (
                        <div key={item} className="animate-pulse rounded-lg border bg-gray-50 p-4">
                          <div className="flex justify-between">
                            <div className="h-5 w-32 rounded bg-gray-200"></div>
                            <div className="h-5 w-20 rounded bg-gray-200"></div>
                          </div>
                          <div className="mt-3 size-48 rounded bg-gray-200"></div>
                          <div className="mt-2 flex items-center gap-2">
                            <div className="h-4 w-16 rounded bg-gray-200"></div>
                            <div className="h-4 w-24 rounded bg-gray-200"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : customerSales.error &&
                    customerSales.error !== "Invalid pagination parameters. Please try again." ? (
                    <div className="flex h-40 items-center justify-center text-red-500">{customerSales.error}</div>
                  ) : customerSales.pagination.totalElements > 0 ? (
                    <>
                      {customerSales.data.map((order) => (
                        <div key={order.saleOrderId} className="rounded-lg border bg-gray-50 p-4">
                          <div className="flex justify-between">
                            <div className="flex items-center gap-2">
                              {activeTab === "orders" ? (
                                <FiPackage className="text-gray-400" />
                              ) : (
                                <FiDollarSign className="text-gray-400" />
                              )}
                              <span className="font-medium">
                                {activeTab === "orders" ? "Order" : "Transaction"} #{order.saleOrderInvoiceNo}
                              </span>
                            </div>
                            {activeTab === "orders" ? (
                              renderOrderStatus(order.orderStatus)
                            ) : (
                              <span className="font-medium text-green-600">₹{order.paidAmount.toFixed(2)}</span>
                            )}
                          </div>
                          <div className="mt-2 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <FiCalendar className="text-gray-400" />
                              <span>{formatDate(order.createdDate)}</span>
                            </div>
                            {activeTab === "transactions" && (
                              <div className="mt-1">
                                <span className="text-gray-500">Status: </span>
                                {renderOrderStatus(order.orderStatus)}
                              </div>
                            )}
                          </div>
                          {activeTab === "orders" && (
                            <div className="mt-3 border-t pt-3">
                              <h4 className="text-sm font-medium text-gray-700">Items:</h4>
                              <ul className="mt-2 space-y-2">
                                {order.saleOrderItems.map((item) => (
                                  <li key={item.saleOrderItemId} className="flex justify-between text-sm">
                                    <span>
                                      {item.itemName} (x{item.quantity})
                                    </span>
                                    <span>₹{(item.pricePerUnit * item.quantity).toFixed(2)}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {activeTab === "transactions" && (
                            <div className="mt-3 border-t pt-3">
                              <h4 className="text-sm font-medium text-gray-700">Payment Details:</h4>
                              <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                                <div>
                                  <span className="text-gray-500">Payment Type: </span>
                                  <span>{order.paymentTypeId === 1 ? "Cash" : "Online"}</span>
                                </div>
                                <div>
                                  <span className="text-gray-500">Promo Code: </span>
                                  <span>{order.promoCode || "None"}</span>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}

                      {/* Pagination controls */}
                      <div className="mt-4 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600">Rows per page:</span>
                          <select
                            value={pageSize}
                            onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                            className="rounded-md border border-gray-300 bg-white p-1 text-sm"
                          >
                            {[5, 10, 20, 50].map((size) => (
                              <option key={size} value={size}>
                                {size}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-sm text-gray-600">
                            {currentPage * pageSize + 1}-
                            {Math.min((currentPage + 1) * pageSize, customerSales.pagination.totalElements)} of{" "}
                            {customerSales.pagination.totalElements}
                          </span>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handlePageChange(currentPage - 1)}
                              disabled={currentPage === 0}
                              className={`rounded-md p-1 ${
                                currentPage === 0 ? "text-gray-400" : "text-gray-700 hover:bg-gray-100"
                              }`}
                            >
                              <FaArrowLeft size={18} />
                            </button>
                            <button
                              onClick={() => handlePageChange(currentPage + 1)}
                              disabled={currentPage >= customerSales.pagination.totalPages - 1}
                              className={`rounded-md p-1 ${
                                currentPage >= customerSales.pagination.totalPages - 1
                                  ? "text-gray-400"
                                  : "text-gray-700 hover:bg-gray-100"
                              }`}
                            >
                              <FaArrowRight size={18} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex h-40 items-center justify-center text-gray-500">
                      No {activeTab === "orders" ? "orders" : "transactions"} found for this customer
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="flex h-40 items-center justify-center text-gray-500">No customer data available</div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between border-t p-4">
          <ButtonModule
            variant="outline"
            size="md"
            icon={<PdfFile />}
            iconPosition="start"
            onClick={handleDownloadPDF}
            className="border-gray-300 hover:bg-gray-50"
          >
            Download PDF
          </ButtonModule>
          <div className="flex gap-2">
            <ButtonModule variant="ghost" size="md" onClick={onRequestClose}>
              Close
            </ButtonModule>
          </div>
        </div>
      </div>
    </Modal>
  )
}

export default CustomerDetailsModal
