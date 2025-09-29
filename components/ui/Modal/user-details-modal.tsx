"use client"

import React, { useEffect, useRef, useState } from "react"
import Modal from "react-modal"
import { MdClose } from "react-icons/md"
import { ButtonModule } from "components/ui/Button/Button"
import PdfFile from "public/pdf-file"
import { jsPDF } from "jspdf"
import html2canvas from "html2canvas"
import { useAppDispatch, useAppSelector } from "app/api/store/store"
import { fetchUserDetail } from "app/api/store/userManagementSlice"
import { selectOrganizationDetails, getOrganizationDetails } from "app/api/store/authSlice"
import { RxAvatar } from "react-icons/rx"
import { FiMail, FiPhone, FiUser, FiShield, FiHome, FiBriefcase, FiFileText, FiCreditCard } from "react-icons/fi"
import Image from "next/image"

interface UserDetailsModalProps {
  isOpen: boolean
  userId: number | null
  onRequestClose: () => void
}

const UserDetailsModal: React.FC<UserDetailsModalProps> = ({ isOpen, userId, onRequestClose }) => {
  const modalRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const dispatch = useAppDispatch()
  const { currentUser, userDetailLoading, userDetailError } = useAppSelector((state) => state.userManagement)
  const orgDetails = useAppSelector(selectOrganizationDetails)
  const [activeTab, setActiveTab] = useState("details")

  useEffect(() => {
    if (isOpen && userId) {
      dispatch(fetchUserDetail(userId))
    }
  }, [isOpen, userId, dispatch])

  useEffect(() => {
    if (currentUser?.organisationId) {
      dispatch(getOrganizationDetails(currentUser.organisationId))
    }
  }, [currentUser?.organisationId, dispatch])

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

      pdf.save(`User_Details_${currentUser?.userId}.pdf`)
    } catch (error) {
      console.error("Error generating PDF:", error)
      alert("Failed to generate PDF. Please try again.")
    }
  }

  const getStatusStyle = (isActive: boolean | null) => {
    return isActive
      ? { backgroundColor: "#EEF5F0", color: "#589E67" }
      : { backgroundColor: "#F7EDED", color: "#AF4B4B" }
  }

  if (!isOpen) return null

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      className="flex w-[550px] overflow-hidden rounded-md bg-white shadow-lg outline-none max-sm:w-full max-sm:max-w-[380px]"
      style={{
        content: {
          height: "80vh",
          maxHeight: "700px",
          margin: "auto",
          position: "relative",
          top: "auto",
          left: "auto",
          right: "auto",
          bottom: "auto",
          transform: "none",
        },
      }}
      overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      ariaHideApp={false}
    >
      <div ref={modalRef} className="flex h-full w-full flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b p-4">
          <div className="flex items-center gap-3">
            {userDetailLoading ? (
              <div className="h-12 w-12 animate-pulse rounded-full bg-gray-200" />
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                {currentUser?.firstName && currentUser?.lastName ? (
                  <span className="text-lg font-semibold text-gray-600">
                    {currentUser.firstName.charAt(0)}
                    {currentUser.lastName.charAt(0)}
                  </span>
                ) : (
                  <RxAvatar className="h-6 w-6 text-gray-500" />
                )}
              </div>
            )}
            <div>
              {userDetailLoading ? (
                <>
                  <div className="h-5 w-40 animate-pulse rounded bg-gray-200" />
                  <div className="mt-1 h-4 w-24 animate-pulse rounded bg-gray-200" />
                </>
              ) : (
                <>
                  <h2 className="text-lg font-semibold text-gray-800">
                    {currentUser?.firstName || currentUser?.userName || "User Details"}
                  </h2>
                  <p className="text-sm text-gray-500">License ID: {orgDetails?.licenseId || "Not available"}</p>
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

        {/* Content */}
        <div ref={contentRef} className="flex-1 overflow-y-auto p-6">
          {userDetailLoading ? (
            <div className="space-y-6">
              {/* User Info Skeleton */}
              <div className="rounded-lg border bg-gray-50 p-4">
                <div className="mb-3 h-5 w-32 animate-pulse rounded bg-gray-200" />
                <div className="space-y-3">
                  {[1, 2, 3, 4].map((item) => (
                    <div key={item} className="flex items-center gap-3">
                      <div className="h-5 w-5 animate-pulse rounded-full bg-gray-200" />
                      <div>
                        <div className="h-3 w-16 animate-pulse rounded bg-gray-200" />
                        <div className="mt-1 h-4 w-40 animate-pulse rounded bg-gray-200" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Organization Info Skeleton */}
              <div className="rounded-lg border bg-gray-50 p-4">
                <div className="mb-3 h-5 w-32 animate-pulse rounded bg-gray-200" />
                <div className="space-y-3">
                  {[1, 2, 3, 4].map((item) => (
                    <div key={item} className="flex items-center gap-3">
                      <div className="h-5 w-5 animate-pulse rounded-full bg-gray-200" />
                      <div>
                        <div className="h-3 w-24 animate-pulse rounded bg-gray-200" />
                        <div className="mt-1 h-4 w-40 animate-pulse rounded bg-gray-200" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : userDetailError ? (
            <div className="flex h-40 items-center justify-center text-red-500">
              Failed to load user details: {userDetailError}
            </div>
          ) : currentUser ? (
            <>
              {activeTab === "details" && (
                <div className="space-y-6">
                  {/* Status */}
                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <div>
                      <p className="text-sm text-gray-500">Account Status</p>
                      <span
                        className="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium"
                        style={getStatusStyle(currentUser.isActive)}
                      >
                        {currentUser.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Organization ID</p>
                      <p className="text-sm font-medium text-gray-800">
                        {currentUser.organisationId || "Not provided"}
                      </p>
                    </div>
                  </div>

                  {/* User Info */}
                  <div className="rounded-lg border bg-gray-50 p-4">
                    <h3 className="mb-3 text-sm font-semibold text-gray-700">User Information</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <FiUser className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-xs text-gray-500">Username</p>
                          <p className="text-sm font-medium text-gray-800">{currentUser.userName || "Not provided"}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <FiMail className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-xs text-gray-500">Email</p>
                          <p className="text-sm font-medium text-gray-800">{currentUser.email || "Not provided"}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <FiPhone className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-xs text-gray-500">Phone</p>
                          <p className="text-sm font-medium text-gray-800">{currentUser.mobileNo || "Not provided"}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <FiUser className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-xs text-gray-500">Full Name</p>
                          <p className="text-sm font-medium text-gray-800">
                            {currentUser.firstName || currentUser.lastName
                              ? `${currentUser.firstName || ""} ${currentUser.lastName || ""}`.trim()
                              : "Not provided"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Organization Info */}
                  <div className="rounded-lg border bg-gray-50 p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-gray-700">Organization Information</h3>
                      {orgDetails.id && (
                        <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800">
                          Verified
                        </span>
                      )}
                    </div>

                    {orgDetails.id ? (
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          {orgDetails.logo ? (
                            <div className="flex-shrink-0">
                              <Image
                                src={`data:image/png;base64,${orgDetails.logo}`}
                                alt="Organization Logo"
                                width={40}
                                height={40}
                                className="h-10 object-contain"
                              />
                            </div>
                          ) : (
                            <FiBriefcase className="h-5 w-5 text-gray-400" />
                          )}
                          <div>
                            <p className="text-xs text-gray-500">Organization Name</p>
                            <p className="text-sm font-medium text-gray-800">
                              {orgDetails.companyName || "Not provided"}
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                          <div className="flex items-center gap-3">
                            <FiFileText className="h-5 w-5 text-gray-400" />
                            <div>
                              <p className="text-xs text-gray-500">Business Type</p>
                              <p className="text-sm font-medium text-gray-800">
                                {orgDetails.businessType || "Not provided"}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <FiBriefcase className="h-5 w-5 text-gray-400" />
                            <div>
                              <p className="text-xs text-gray-500">Category</p>
                              <p className="text-sm font-medium text-gray-800">
                                {orgDetails.businessCategory || "Not provided"}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <FiCreditCard className="h-5 w-5 text-gray-400" />
                            <div>
                              <p className="text-xs text-gray-500">License ID</p>
                              <p className="text-sm font-medium text-gray-800">
                                {orgDetails.licenseId || "Not provided"}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <FiCreditCard className="h-5 w-5 text-gray-400" />
                            <div>
                              <p className="text-xs text-gray-500">GSTIN</p>
                              <p className="text-sm font-medium text-gray-800">{orgDetails.gstin || "Not provided"}</p>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <FiHome className="h-5 w-5 text-gray-400" />
                          <div>
                            <p className="text-xs text-gray-500">Address</p>
                            <p className="text-sm font-medium text-gray-800">{orgDetails.address || "Not provided"}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <FiPhone className="h-5 w-5 text-gray-400" />
                          <div>
                            <p className="text-xs text-gray-500">Contact</p>
                            <p className="text-sm font-medium text-gray-800">
                              {orgDetails.phoneNumber || "Not provided"}
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center py-4 text-gray-500">
                        No organization details available
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex h-40 items-center justify-center text-gray-500">No user data available</div>
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

export default UserDetailsModal
