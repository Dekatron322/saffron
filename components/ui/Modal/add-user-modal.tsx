// components/ui/Modal/add-user-modal.tsx
import React, { useState, useEffect } from "react"
import { FormInputModule } from "../Input/Input"
import { ButtonModule } from "../Button/Button"
import { useAppDispatch, useAppSelector } from "app/api/store/store"
import {
  createUser,
  fetchOrganisations,
  selectOrganisations,
  selectOrganisationsLoading,
} from "app/api/store/userManagementSlice"
import { notify } from "../Notification/Notification"
import { motion, AnimatePresence } from "framer-motion"
import { DropdownPopoverModule } from "../Input/DropdownModule"

interface AddUserModalProps {
  isOpen: boolean
  onClose: () => void
  onUserCreated?: () => void
}

interface ApiError {
  errorMessage?: string
  message?: string
}

const AddUserModal: React.FC<AddUserModalProps> = ({ isOpen, onClose, onUserCreated }) => {
  const dispatch = useAppDispatch()
  const [isLoading, setIsLoading] = useState(false)
  const organisations = useAppSelector(selectOrganisations)
  const organisationsLoading = useAppSelector(selectOrganisationsLoading)

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    mobileNo: "",
    password: "123456", // Default password
    organisationId: "", // Will be set when an organization is selected
  })

  useEffect(() => {
    if (isOpen) {
      dispatch(fetchOrganisations())
    }
  }, [isOpen, dispatch])

  const handleInputChange = (field: keyof typeof formData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [field]: e.target.value,
    }))
  }

  const handleOrganizationChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      organisationId: value,
    }))
  }

  const handleSubmit = async () => {
    if (!formData.firstName || !formData.email || !formData.mobileNo || !formData.organisationId) {
      notify("error", "Please fill all required fields", {
        title: "Validation Error",
        description: "First Name, Email, Mobile Number, and Organization are required fields",
      })
      return
    }

    setIsLoading(true)

    try {
      const result = await dispatch(
        createUser({
          ...formData,
          organisationId: Number(formData.organisationId), // Convert to number for the API
        })
      )

      if (result.error) {
        notify("error", result.error, {
          title: "Error",
          description: result.error,
        })
        return
      }

      notify("success", "User added successfully!", {
        title: "Success",
        description: "The user has been added to the system.",
      })

      onClose()
      if (onUserCreated) onUserCreated()
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.errorMessage || error?.message || "There was an issue adding the user. Please try again."

      notify("error", "Failed to add user", {
        title: "Error",
        description: errorMessage,
      })
      console.error("Add user error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Prepare organization options for dropdown
  const organizationOptions = organisations.map((org) => ({
    value: org.id.toString(),
    label: org.companyName,
  }))

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
                      Add New User
                    </motion.h2>
                    <motion.button
                      type="button"
                      className="text-gray-400 hover:text-gray-500"
                      onClick={onClose}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <span className="sr-only">Close panel</span>
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </motion.button>
                  </div>

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
                            label="First Name*"
                            type="text"
                            placeholder="Enter First Name"
                            value={formData.firstName}
                            onChange={handleInputChange("firstName")}
                            className="w-full"
                          />
                        </motion.div>

                        <motion.div
                          initial={{ y: 20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: 0.55 }}
                        >
                          <FormInputModule
                            label="Last Name"
                            type="text"
                            placeholder="Enter Last Name"
                            value={formData.lastName}
                            onChange={handleInputChange("lastName")}
                            className="w-full"
                          />
                        </motion.div>

                        <motion.div
                          initial={{ y: 20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: 0.6 }}
                        >
                          <FormInputModule
                            label="Email*"
                            type="email"
                            placeholder="Enter Email"
                            value={formData.email}
                            onChange={handleInputChange("email")}
                            className="w-full"
                          />
                        </motion.div>

                        <motion.div
                          initial={{ y: 20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: 0.65 }}
                        >
                          <FormInputModule
                            label="Mobile Number*"
                            type="tel"
                            placeholder="Enter Mobile Number"
                            value={formData.mobileNo}
                            onChange={handleInputChange("mobileNo")}
                            className="w-full"
                          />
                        </motion.div>

                        <motion.div
                          initial={{ y: 20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: 0.7 }}
                        >
                          <DropdownPopoverModule
                            label="Organization*"
                            options={organizationOptions}
                            placeholder={organisationsLoading ? "Loading organizations..." : "Select Organization"}
                            value={formData.organisationId}
                            onChange={handleOrganizationChange}
                            className="w-full"
                          />
                        </motion.div>

                        <motion.div
                          initial={{ y: 20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: 0.75 }}
                        >
                          <FormInputModule
                            label="Password*"
                            type="password"
                            placeholder="Enter Password"
                            value={formData.password}
                            onChange={handleInputChange("password")}
                            className="w-full"
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
                        disabled={isLoading || organisationsLoading}
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
                            Creating...
                          </motion.div>
                        ) : (
                          <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                            Add User
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

export default AddUserModal
