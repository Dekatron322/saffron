"use client"

import { selectAuth, selectOrganizationDetails, selectUpdateUser, selectUserDetails } from "app/api/store/authSlice"
import { useAppDispatch, useAppSelector } from "app/api/store/store"
import DashboardNav from "components/Navbar/DashboardNav"
import Image from "next/image"
import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import Modal from "react-modal"
import { ButtonModule } from "components/ui/Button/Button"
import { FormInputModule } from "components/ui/Input/Input"
import { updateUserDetails } from "app/api/store/authSlice"
import { notify } from "components/ui/Notification/Notification"

// Enhanced Edit Profile Modal Component
const EditProfileModal = ({
  isOpen,
  onRequestClose,
  userData,
  onSave,
}: {
  isOpen: boolean
  onRequestClose: () => void
  userData: {
    userName: string
    firstName: string | null
    lastName: string | null
    email: string
    mobileNo: string | null
  }
  onSave: (data: {
    userName: string
    firstName: string
    lastName: string
    email: string
    mobileNo: string
  }) => Promise<void>
}) => {
  const { loading } = useAppSelector(selectUpdateUser)
  const [formData, setFormData] = useState({
    userName: userData.userName,
    firstName: userData.firstName || "",
    lastName: userData.lastName || "",
    email: userData.email,
    mobileNo: userData.mobileNo || "",
  })

  const [formErrors, setFormErrors] = useState({
    userName: "",
    email: "",
    mobileNo: "",
  })

  useEffect(() => {
    if (isOpen) {
      setFormData({
        userName: userData.userName,
        firstName: userData.firstName || "",
        lastName: userData.lastName || "",
        email: userData.email,
        mobileNo: userData.mobileNo || "",
      })
    }
  }, [isOpen, userData])

  const validateForm = () => {
    let valid = true
    const newErrors = {
      userName: "",
      email: "",
      mobileNo: "",
    }

    if (!formData.userName.trim()) {
      newErrors.userName = "Username is required"
      valid = false
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required"
      valid = false
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format"
      valid = false
    }

    if (!formData.mobileNo.trim()) {
      newErrors.mobileNo = "Mobile number is required"
      valid = false
    }

    setFormErrors(newErrors)
    return valid
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    if (formErrors[name as keyof typeof formErrors]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      try {
        await onSave({
          userName: formData.userName,
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          mobileNo: formData.mobileNo,
        })
      } catch (error) {
        // Error notification will be handled by the thunk
      }
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      className="mt-20 w-[90%] max-w-md overflow-hidden rounded-md bg-white shadow-lg outline-none"
      overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
      ariaHideApp={false}
    >
      <div className="flex w-full items-center justify-between bg-[#F5F8FA] p-4">
        <h2 className="text-lg font-bold">Edit Profile</h2>
        <button onClick={onRequestClose} className="text-gray-500 hover:text-gray-700">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="max-h-[80vh] overflow-y-auto px-4 pb-6">
        <form onSubmit={handleSubmit}>
          <FormInputModule
            label="Username *"
            name="userName"
            type="text"
            value={formData.userName}
            onChange={handleChange}
            className="mb-4"
            placeholder="Enter username"
          />

          <FormInputModule
            label="First Name"
            name="firstName"
            type="text"
            value={formData.firstName}
            onChange={handleChange}
            className="mb-4"
            placeholder="Enter first name"
          />

          <FormInputModule
            label="Last Name"
            name="lastName"
            type="text"
            value={formData.lastName}
            onChange={handleChange}
            className="mb-4"
            placeholder="Enter last name"
          />

          <FormInputModule
            label="Email *"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            className="mb-4"
            placeholder="Enter email"
          />

          <FormInputModule
            label="Mobile Number *"
            name="mobileNo"
            type="tel"
            value={formData.mobileNo}
            onChange={handleChange}
            className="mb-6"
            placeholder="Enter mobile number"
          />

          <div className="flex gap-3">
            <ButtonModule
              type="button"
              variant="ghost"
              className="flex-1"
              size="lg"
              onClick={onRequestClose}
              disabled={loading}
            >
              Cancel
            </ButtonModule>

            <ButtonModule type="submit" variant="primary" className="flex-1" size="lg" disabled={loading}>
              {loading ? (
                <div className="flex items-center justify-center">
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
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Saving...
                </div>
              ) : (
                "Save Changes"
              )}
            </ButtonModule>
          </div>
        </form>
      </div>
    </Modal>
  )
}

// Main Profile Page Component
export default function ProfilePage() {
  const { loading } = useAppSelector(selectAuth)
  const userDetails = useAppSelector(selectUserDetails)
  const orgDetails = useAppSelector(selectOrganizationDetails)
  const updateUserState = useAppSelector(selectUpdateUser)
  const dispatch = useAppDispatch()
  const [isClient, setIsClient] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (updateUserState.success) {
      notify("success", "Profile updated successfully", {
        description: "Your changes have been saved",
        duration: 3000,
      })
    }
    if (updateUserState.error) {
      notify("error", "Failed to update profile", {
        description: updateUserState.error,
        duration: 5000,
      })
    }
  }, [updateUserState.success, updateUserState.error])

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
      },
    },
  }

  const handleEditProfile = () => {
    setIsEditModalOpen(true)
  }

  const handleSaveProfile = async (data: {
    userName: string
    firstName: string
    lastName: string
    email: string
    mobileNo: string
  }) => {
    await dispatch(updateUserDetails(data))
    setIsEditModalOpen(false)
  }

  if (!isClient) {
    return null
  }

  return (
    <section className="h-full w-full bg-gray-50">
      <div className="flex min-h-screen w-full">
        <div className="flex w-full flex-col">
          <DashboardNav />
          <div className="flex flex-col p-6">
            <motion.h1
              className="mb-8 text-3xl font-bold text-gray-800 md:text-4xl"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              My Profile
            </motion.h1>

            {loading ? (
              <>
                <motion.div
                  className="max-w-6xl rounded-xl bg-white p-8 shadow-lg"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <div className="flex flex-col gap-10 md:flex-row">
                    {/* User Profile Skeleton */}
                    <div className="flex-1">
                      <div className="mb-8 flex flex-col items-center md:flex-row md:items-start">
                        <div className="relative mb-4 md:mb-0 md:mr-6">
                          <div className="h-24 w-24 animate-pulse rounded-full bg-gray-200"></div>
                        </div>
                        <div className="space-y-2 text-center md:text-left">
                          <div className="h-8 w-48 animate-pulse rounded bg-gray-200"></div>
                          <div className="h-6 w-32 animate-pulse rounded bg-gray-200"></div>
                          <div className="h-6 w-24 animate-pulse rounded-full bg-gray-200"></div>
                        </div>
                      </div>

                      <div className="space-y-6 rounded-xl bg-gray-50 p-6">
                        <div className="h-6 w-40 animate-pulse rounded bg-gray-200"></div>
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                          {[...Array(4)].map((_, i) => (
                            <div key={i} className="space-y-2">
                              <div className="h-4 w-24 animate-pulse rounded bg-gray-200"></div>
                              <div className="h-5 w-full animate-pulse rounded bg-gray-200"></div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Organization Skeleton */}
                    <div className="flex-1 border-l-0 border-gray-200 md:border-l md:pl-10">
                      <div className="mb-6 flex items-center justify-between">
                        <div className="h-8 w-40 animate-pulse rounded bg-gray-200"></div>
                        <div className="h-6 w-20 animate-pulse rounded-full bg-gray-200"></div>
                      </div>

                      <div className="space-y-6 rounded-xl bg-gray-50 p-6">
                        <div className="flex items-center space-x-4">
                          <div className="h-10 w-20 animate-pulse rounded bg-gray-200"></div>
                          <div className="space-y-2">
                            <div className="h-6 w-48 animate-pulse rounded bg-gray-200"></div>
                            <div className="h-5 w-32 animate-pulse rounded bg-gray-200"></div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                          {[...Array(6)].map((_, i) => (
                            <div key={i} className="space-y-2">
                              <div className="h-4 w-24 animate-pulse rounded bg-gray-200"></div>
                              <div className="h-5 w-full animate-pulse rounded bg-gray-200"></div>
                            </div>
                          ))}
                        </div>

                        <div className="space-y-2">
                          <div className="h-4 w-24 animate-pulse rounded bg-gray-200"></div>
                          <div className="h-5 w-full animate-pulse rounded bg-gray-200"></div>
                        </div>
                        <div className="space-y-2">
                          <div className="h-4 w-24 animate-pulse rounded bg-gray-200"></div>
                          <div className="h-5 w-full animate-pulse rounded bg-gray-200"></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-10 flex justify-end border-t border-gray-200 pt-6">
                    <div className="h-12 w-32 animate-pulse rounded-lg bg-gray-200"></div>
                  </div>
                </motion.div>
              </>
            ) : (
              <motion.div
                className="max-w-6xl rounded-xl bg-white p-8 shadow-lg"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                <div className="flex flex-col gap-10 md:flex-row">
                  {/* User Profile Section */}
                  <motion.div className="flex-1" variants={itemVariants}>
                    <div className="mb-8 flex flex-col items-center md:flex-row md:items-start">
                      <div className="relative mb-4 md:mb-0 md:mr-6">
                        <div className="h-24 w-24 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 p-1">
                          {userDetails.firstName && userDetails.lastName ? (
                            <div className="flex h-full w-full items-center justify-center rounded-full bg-white text-3xl font-bold text-blue-600">
                              {userDetails.firstName.charAt(0)}
                              {userDetails.lastName.charAt(0)}
                            </div>
                          ) : (
                            <div className="flex h-full w-full items-center justify-center rounded-full bg-white text-3xl font-bold text-blue-600">
                              ?
                            </div>
                          )}
                        </div>
                        <div className="absolute -bottom-2 -right-2 rounded-full bg-green-500 p-1">
                          <div className="h-5 w-5 rounded-full bg-white"></div>
                        </div>
                      </div>
                      <div className="text-center md:text-left">
                        <h2 className="text-2xl font-bold text-gray-800">
                          {userDetails.firstName || "Unknown"} {userDetails.lastName || ""}
                        </h2>
                        <p className="text-blue-600">{userDetails.orgName || "No organization"}</p>
                        <div className="mt-2">
                          {userDetails.isActive ? (
                            <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800">
                              Active Account
                            </span>
                          ) : (
                            <span className="inline-flex items-center rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-800">
                              Inactive Account
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6 rounded-xl bg-gray-50 p-6">
                      <h3 className="text-lg font-semibold text-gray-700">Personal Information</h3>
                      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <div>
                          <h4 className="text-sm font-medium text-gray-500">Username</h4>
                          <p className="mt-1 text-gray-900">{userDetails.userName || "Not provided"}</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-500">Email</h4>
                          <p className="mt-1 text-gray-900">{userDetails.email || "Not provided"}</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-500">Mobile Number</h4>
                          <p className="mt-1 text-gray-900">{userDetails.mobileNo || "Not provided"}</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-500">Organization ID</h4>
                          <p className="mt-1 text-gray-900">{userDetails.organisationId || "Not provided"}</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Organization Section */}
                  <motion.div
                    className="flex-1 border-l-0 border-gray-200 md:border-l md:pl-10"
                    variants={itemVariants}
                  >
                    <div className="mb-6 flex items-center justify-between">
                      <h2 className="text-2xl font-bold text-gray-800">Organization</h2>
                      {orgDetails.id && (
                        <div className="flex items-center space-x-2">
                          <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800">
                            Verified
                          </span>
                        </div>
                      )}
                    </div>

                    {orgDetails.id ? (
                      <div className="space-y-6 rounded-xl bg-gray-50 p-6">
                        <div className="flex items-center space-x-4">
                          {orgDetails.logo && (
                            <div className="flex-shrink-0">
                              <Image
                                src={`data:image/png;base64,${orgDetails.logo}`}
                                alt="Organization Logo"
                                width={80}
                                height={40}
                                className="h-10 object-contain"
                              />
                            </div>
                          )}
                          <div>
                            <h3 className="text-lg font-semibold text-gray-800">{orgDetails.companyName}</h3>
                            <p className="text-blue-600">{orgDetails.shortName}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                          <div>
                            <h4 className="text-sm font-medium text-gray-500">Business Type</h4>
                            <p className="mt-1 text-gray-900">{orgDetails.businessType || "Not provided"}</p>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-gray-500">Category</h4>
                            <p className="mt-1 text-gray-900">{orgDetails.businessCategory || "Not provided"}</p>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-gray-500">License ID</h4>
                            <p className="mt-1 text-gray-900">{orgDetails.licenseId || "Not provided"}</p>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-gray-500">GSTIN</h4>
                            <p className="mt-1 text-gray-900">{orgDetails.gstin || "Not provided"}</p>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-gray-500">CIN</h4>
                            <p className="mt-1 text-gray-900">{orgDetails.cin || "Not provided"}</p>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-gray-500">Contact</h4>
                            <p className="mt-1 text-gray-900">{orgDetails.phoneNumber || "Not provided"}</p>
                          </div>
                        </div>

                        <div>
                          <h4 className="text-sm font-medium text-gray-500">Address</h4>
                          <p className="mt-1 text-gray-900">{orgDetails.address || "Not provided"}</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-500">Contact Email</h4>
                          <p className="mt-1 text-gray-900">{orgDetails.emailId || "Not provided"}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex h-64 items-center justify-center rounded-xl bg-gray-50">
                        <div className="text-center">
                          <div className="mx-auto h-12 w-12 text-gray-400">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                              />
                            </svg>
                          </div>
                          <p className="mt-3 text-gray-500">No organization details available</p>
                        </div>
                      </div>
                    )}
                  </motion.div>
                </div>

                <motion.div className="mt-10 flex justify-end border-t border-gray-200 pt-6" variants={itemVariants}>
                  <button
                    type="button"
                    onClick={handleEditProfile}
                    className="inline-flex items-center rounded-lg bg-gradient-to-r from-[#00a4a6] to-[#06352c] px-6 py-3 text-sm font-medium text-white shadow-md hover:from-[#06352c] hover:to-[#00a4a6] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    Edit Profile
                    <svg
                      className="ml-2 h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      ></path>
                    </svg>
                  </button>
                </motion.div>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={isEditModalOpen}
        onRequestClose={() => setIsEditModalOpen(false)}
        userData={{
          userName: userDetails.userName || "",
          firstName: userDetails.firstName,
          lastName: userDetails.lastName,
          email: userDetails.email || "",
          mobileNo: userDetails.mobileNo,
        }}
        onSave={handleSaveProfile}
      />
    </section>
  )
}
