"use client"
import React, { useEffect, useState } from "react"
import Modal from "react-modal"
import CloseIcon from "public/close-icon"
import { ButtonModule } from "../Button/Button"
import { FormInputModule } from "../Input/Input"
import { useAppDispatch, useAppSelector } from "app/api/store/store"
import { fetchAllUsers, updateUserDetails } from "app/api/store/userManagementSlice"

interface EditUserModalProps {
  isOpen: boolean
  onRequestClose: () => void
  userId: number | null
  userData: {
    userName: string
    firstName: string | null
    email: string
    mobileNo: string
    organisationId: number
  }
}

const EditUserModal: React.FC<EditUserModalProps> = ({ isOpen, onRequestClose, userId, userData }) => {
  const dispatch = useAppDispatch()
  const { updateLoading, updateSuccess } = useAppSelector((state) => ({
    updateLoading: state.userManagement.updateLoading,
    updateSuccess: state.userManagement.updateSuccess,
  }))

  const [formData, setFormData] = useState({
    userName: "",
    firstName: "",
    email: "",
    mobileNo: "",
    organisationId: 0,
  })

  const [formErrors, setFormErrors] = useState({
    userName: "",
    email: "",
    mobileNo: "",
  })

  // Initialize form data when modal opens or userData changes
  useEffect(() => {
    if (isOpen) {
      setFormData({
        userName: userData.userName,
        firstName: userData.firstName || "",
        email: userData.email,
        mobileNo: userData.mobileNo,
        organisationId: userData.organisationId,
      })
    }
  }, [isOpen, userData])

  // Handle successful update
  useEffect(() => {
    if (updateSuccess) {
      dispatch(fetchAllUsers())
      onRequestClose()
    }
  }, [updateSuccess, dispatch]) // Removed onRequestClose from dependencies

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

    // Clear error when user starts typing
    if (formErrors[name as keyof typeof formErrors]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    if (userId) {
      dispatch(
        updateUserDetails({
          userId,
          userName: formData.userName,
          firstName: formData.firstName,
          email: formData.email,
          mobileNo: formData.mobileNo,
          organisationId: formData.organisationId,
        })
      )
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
        <h2 className="text-lg font-bold">Edit User</h2>
        <button onClick={onRequestClose} className="text-gray-500 hover:text-gray-700">
          <CloseIcon />
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
            // error={formErrors.userName}
            // required
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
            label="Email *"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            className="mb-4"
            placeholder="Enter email"
            // error={formErrors.email}
            // required
          />

          <FormInputModule
            label="Mobile Number *"
            name="mobileNo"
            type="tel"
            value={formData.mobileNo}
            onChange={handleChange}
            className="mb-4"
            placeholder="Enter mobile number"
            // error={formErrors.mobileNo}
            // required
          />

          <FormInputModule
            label="Organization ID"
            name="organisationId"
            type="number"
            value={formData.organisationId.toString()}
            onChange={(e) => {
              const val = e.target.value
              setFormData((prev) => ({
                ...prev,
                organisationId: val === "" ? 0 : Number(val),
              }))
            }}
            className="mb-6"
            placeholder="Enter organization ID"
          />

          <div className="flex gap-3">
            <ButtonModule
              type="button"
              variant="ghost"
              className="flex-1"
              size="lg"
              onClick={onRequestClose}
              disabled={updateLoading}
            >
              Cancel
            </ButtonModule>

            <ButtonModule type="submit" variant="primary" className="flex-1" size="lg" disabled={updateLoading}>
              {updateLoading ? (
                <div className="flex items-center justify-center">
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

export default EditUserModal
