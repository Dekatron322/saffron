"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { useAppDispatch } from "app/api/store/store"
import { notify } from "components/ui/Notification/Notification"
import { FormInputModule } from "components/ui/Input/Input"
import { TextAreaModule } from "components/ui/Input/Textarea"
import { ButtonModule } from "components/ui/Button/Button"
import { addSubscriptionDetails, addSubscriptionPlan, createSubscriptionName } from "app/api/store/subscriptionSlice"
import DashboardNav from "components/Navbar/DashboardNav"

const AddSubscriptionPage = () => {
  const router = useRouter()
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

      // Updated success condition to check for subscriptionPlanId
      if ("payload" in response && response.payload?.subscriptionPlanId) {
        setDetailsData((prev) => ({
          ...prev,
          subscriptionPlanId: response.payload.subscriptionPlanId,
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

      // Updated success condition to be more flexible
      if ("payload" in response && (response.payload?.success || response.payload?.subscriptionPlanId)) {
        notify("success", "Subscription created successfully!", {
          title: "Success",
          duration: 4000,
        })
        resetForm()
        router.push("/customers/all-customers") // Redirect to subscriptions list
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

  const handleCancel = () => {
    resetForm()
    router.push("/customers/all-customers")
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

  // Guard against out-of-bounds access to steps
  const currentStep = steps[activeStep]

  return (
    <div className="min-h-screen w-full bg-[#F4F9F8]">
      <DashboardNav />
      <div className="mx-auto mt-10 max-w-4xl rounded-lg bg-white p-6 shadow-md">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Create New Subscription</h1>
          <ButtonModule variant="ghost" size="sm" onClick={handleCancel} className="text-gray-500 hover:text-gray-700">
            Cancel
          </ButtonModule>
        </div>

        {/* Stepper indicator */}
        <div className="flex w-full items-center justify-between px-4 py-2">
          {steps.map((_, index) => (
            <React.Fragment key={index}>
              <div
                className={`flex h-8 min-w-8  items-center justify-center rounded-full ${
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
                  className={`h-1 w-full ${
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

        <div className="mt-6 rounded-lg border border-gray-200 p-6">
          <h2 className="mb-4 text-xl font-semibold">{currentStep ? currentStep.title : ""}</h2>
          {currentStep?.content}

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
              onClick={currentStep ? currentStep.action : undefined}
              disabled={isLoading}
            >
              {isLoading ? (
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
      </div>
    </div>
  )
}

export default AddSubscriptionPage
