// components/Modals/AddSubscriptionModal.tsx
"use client"

import React, { useState } from "react"
import Modal from "react-modal"
import CloseIcon from "public/close-icon"
import { ButtonModule } from "../Button/Button"
import { FormInputModule } from "../Input/Input"
import { useAppDispatch } from "app/api/store/store"
import { createSubscriptionName, addSubscriptionPlan, addSubscriptionDetails } from "app/api/store/subscriptionSlice"
import { notify } from "../Notification/Notification"
import { TextAreaModule } from "../Input/Textarea"

interface AddSubscriptionModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

const AddSubscriptionModal: React.FC<AddSubscriptionModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const dispatch = useAppDispatch()
  const [activeStep, setActiveStep] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [completedSteps, setCompletedSteps] = useState<number[]>([])

  // Step 1: Subscription Name
  const [subscriptionName, setSubscriptionName] = useState("")

  // Step 2: Subscription Plan
  const [planData, setPlanData] = useState({
    subscriptionTypeId: 0,
    monthlyPrice: 0,
    yearlyPrice: 0,
    targetAudience: "",
    description: "",
    points: 0,
    discount: 0,
  })

  // Step 3: Subscription Details
  const [detailsData, setDetailsData] = useState({
    subscriptionPlanId: "",
    keyFeatures: "",
  })

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSubscriptionName(e.target.value)
  }

  const handlePlanChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setPlanData((prev) => ({
      ...prev,
      [name]:
        name.includes("Price") || name.includes("Id") || name.includes("points") || name.includes("discount")
          ? Number(value)
          : value,
    }))
  }

  const handleDetailsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setDetailsData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const nextStep = () => {
    setActiveStep((prev) => {
      const next = prev + 1
      if (!completedSteps.includes(prev)) {
        setCompletedSteps([...completedSteps, prev])
      }
      return next
    })
  }

  const prevStep = () => {
    setActiveStep((prev) => prev - 1)
  }

  const handleCreateSubscriptionName = async () => {
    if (!subscriptionName.trim()) {
      notify("error", "Please enter a subscription name", {
        title: "Validation Error",
        duration: 3000,
      })
      return
    }

    try {
      setIsLoading(true)
      const response = await dispatch(createSubscriptionName(subscriptionName))

      if ("payload" in response && response.payload?.subscriptionTypeId) {
        setPlanData((prev) => ({
          ...prev,
          subscriptionTypeId: response.payload.subscriptionTypeId,
        }))
        notify("success", "Subscription name created successfully", {
          title: "Success",
          duration: 3000,
        })
        nextStep()
      } else if ("error" in response) {
        throw new Error(response.error)
      } else {
        throw new Error("Unexpected response format")
      }
    } catch (error: any) {
      notify("error", error.message || "Failed to create subscription name", {
        title: "Error",
        duration: 5000,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddSubscriptionPlan = async () => {
    if (!planData.description || !planData.targetAudience || planData.monthlyPrice <= 0) {
      notify("error", "Please fill all required fields with valid values", {
        title: "Validation Error",
        duration: 3000,
      })
      return
    }

    try {
      setIsLoading(true)
      const response = await dispatch(addSubscriptionPlan(planData))

      if ("payload" in response && response.payload?.id) {
        setDetailsData((prev) => ({
          ...prev,
          subscriptionPlanId: response.payload.id,
        }))
        notify("success", "Subscription plan added successfully", {
          title: "Success",
          duration: 3000,
        })
        nextStep()
      } else if ("error" in response) {
        throw new Error(response.error)
      } else {
        throw new Error("Unexpected response format")
      }
    } catch (error: any) {
      notify("error", error.message || "Failed to add subscription plan", {
        title: "Error",
        duration: 5000,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddSubscriptionDetails = async () => {
    if (!detailsData.keyFeatures.trim()) {
      notify("error", "Please enter key features", {
        title: "Validation Error",
        duration: 3000,
      })
      return
    }

    try {
      setIsLoading(true)
      const response = await dispatch(addSubscriptionDetails(detailsData))

      if ("payload" in response && response.payload?.success) {
        notify("success", "Subscription created successfully!", {
          title: "Success",
          duration: 4000,
        })
        if (onSuccess) onSuccess()
        resetForm()
        onClose()
      } else if ("error" in response) {
        throw new Error(response.error)
      } else {
        throw new Error("Unexpected response format")
      }
    } catch (error: any) {
      notify("error", error.message || "Failed to add subscription details", {
        title: "Error",
        duration: 5000,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setActiveStep(0)
    setCompletedSteps([])
    setSubscriptionName("")
    setPlanData({
      subscriptionTypeId: 0,
      monthlyPrice: 0,
      yearlyPrice: 0,
      targetAudience: "",
      description: "",
      points: 0,
      discount: 0,
    })
    setDetailsData({
      subscriptionPlanId: "",
      keyFeatures: "",
    })
  }

  const handleModalClose = () => {
    if (completedSteps.length < 3 && activeStep !== steps.length - 1) {
      notify("warning", "Please complete all steps before closing", {
        title: "Warning",
        duration: 3000,
      })
      return
    }
    resetForm()
    onClose()
  }

  const handleCancel = () => {
    resetForm()
    onClose()
  }

  const steps = [
    {
      title: "Add Subscription Name",
      content: (
        <div className="mt-4">
          <FormInputModule
            label="Subscription Name"
            type="text"
            placeholder="e.g., HealthSaver Basic"
            value={subscriptionName}
            onChange={handleNameChange}
            className="mb-4"
          />
        </div>
      ),
      action: handleCreateSubscriptionName,
    },
    {
      title: "Add Subscription Plan",
      content: (
        <div className="mt-4 grid gap-4">
          <div className="grid grid-cols-2 gap-4">
            <FormInputModule
              label="Monthly Price (₹)"
              type="number"
              name="monthlyPrice"
              value={planData.monthlyPrice}
              onChange={handlePlanChange}
              placeholder=""
            />
            <FormInputModule
              label="Yearly Price (₹)"
              type="number"
              name="yearlyPrice"
              value={planData.yearlyPrice}
              onChange={handlePlanChange}
              placeholder=""
            />
          </div>
          <FormInputModule
            label="Target Audience"
            type="text"
            name="targetAudience"
            placeholder="e.g., Families, chronic patients"
            value={planData.targetAudience}
            onChange={handlePlanChange}
          />
          <TextAreaModule
            label="Description"
            name="description"
            placeholder="Describe the plan benefits"
            value={planData.description}
            onChange={handlePlanChange}
            rows={3}
          />
          <div className="grid grid-cols-2 gap-4">
            <FormInputModule
              label="Loyalty Points"
              type="number"
              name="points"
              value={planData.points}
              onChange={handlePlanChange}
              placeholder=""
            />
            <FormInputModule
              label="Discount (%)"
              type="number"
              name="discount"
              value={planData.discount}
              onChange={handlePlanChange}
              placeholder=""
            />
          </div>
        </div>
      ),
      action: handleAddSubscriptionPlan,
    },
    {
      title: "Add Subscription Details",
      content: (
        <div className="mt-4">
          <TextAreaModule
            label="Key Features (comma separated)"
            name="keyFeatures"
            placeholder="e.g., 1 point per ₹100 spent, Free delivery, Health tips"
            value={detailsData.keyFeatures}
            onChange={handleDetailsChange}
          />
        </div>
      ),
      action: handleAddSubscriptionDetails,
    },
  ]

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={handleModalClose}
      shouldCloseOnOverlayClick={false}
      shouldCloseOnEsc={false}
      className="mt-20 w-[500px] max-w-md overflow-hidden rounded-md bg-white shadow-lg outline-none"
      overlayClassName="fixed inset-0 bg-black bg-opacity-50 overflow-hidden flex items-center justify-center"
      ariaHideApp={false}
    >
      <div className="flex w-full items-center justify-between bg-[#F5F8FA] p-4">
        <h2 className="text-lg font-bold">{steps[activeStep].title}</h2>
        <div className="flex items-center gap-2">
          <ButtonModule variant="text" size="sm" onClick={handleCancel} className="text-gray-500 hover:text-gray-700">
            Cancel
          </ButtonModule>
          <div onClick={handleModalClose} className="cursor-pointer">
            <CloseIcon />
          </div>
        </div>
      </div>

      {/* Stepper indicator */}
      <div className="flex items-center justify-center px-4 py-2">
        {steps.map((_, index) => (
          <React.Fragment key={index}>
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full ${
                completedSteps.includes(index)
                  ? "bg-[#00a4a6] text-white"
                  : activeStep === index
                  ? "bg-[#00a4a6] bg-opacity-70 text-white"
                  : "bg-gray-200 text-gray-600"
              }`}
            >
              {index + 1}
            </div>
            {index < steps.length - 1 && (
              <div
                className={`h-1 w-10 ${
                  completedSteps.includes(index)
                    ? "bg-[#00a4a6]"
                    : activeStep > index
                    ? "bg-[#00a4a6] bg-opacity-50"
                    : "bg-gray-200"
                }`}
              />
            )}
          </React.Fragment>
        ))}
      </div>

      <div className="px-4 pb-6">
        {steps[activeStep].content}

        <div className="mt-6 flex justify-between">
          {activeStep > 0 ? (
            <ButtonModule variant="outline" className="rounded-md" size="lg" onClick={prevStep} disabled={isLoading}>
              Back
            </ButtonModule>
          ) : (
            <div /> // Empty div to maintain flex space-between
          )}

          <ButtonModule
            variant="primary"
            className="rounded-md"
            size="lg"
            onClick={steps[activeStep].action}
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <svg
                  className="mr-2 h-5 w-5 animate-spin"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  ></path>
                </svg>
                Processing...
              </div>
            ) : activeStep === steps.length - 1 ? (
              "Complete"
            ) : (
              "Next"
            )}
          </ButtonModule>
        </div>
      </div>
    </Modal>
  )
}

export default AddSubscriptionModal
