"use client"
import { useAppDispatch, useAppSelector } from "app/api/store/store"
import {
  fetchAllSubscriptions,
  fetchSubscriptionTypeByName,
  selectSubscriptions,
  updateSubscriptionDetails,
} from "app/api/store/subscriptionSlice"
import { ButtonModule } from "components/ui/Button/Button"
import { useRouter } from "next/navigation"
import CheckIcon from "public/check"
import Check2Icon from "public/check-icon"
import React, { useEffect, useState } from "react"
import AddSubscriptionModal from "../Modal/add-subscription-modal"
import EditSubscriptionModal from "../Modal/edit-subscription-modal"
import { AnimatePresence, motion } from "framer-motion"

// Local type describing the shape of each item in `mappedPlans`
type MappedPlan = {
  id: number
  subscriptionTypeId?: number
  name: string
  tagline: string
  monthlyPrice: number
  yearlyPrice: number
  features: string[]
  targetAudience: string
  points: number
  discount: number
  bgColor: string
  textColor: string
  buttonVariant: "secondary" | "outline"
}

// Local type for data coming back from EditSubscriptionModal's onUpdate
type EditSubscriptionData = {
  name: string
  tagline: string
  monthlyPrice: number
  yearlyPrice: number
  targetAudience: string
  points: number
  discount: number
  features: string[]
}

const SubscriptionsTab = () => {
  const router = useRouter()
  const [isYearly, setIsYearly] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [currentPlan, setCurrentPlan] = useState<MappedPlan | null>(null)
  const dispatch = useAppDispatch()
  const { plans, loading, error, currentSubscriptionType } = useAppSelector(selectSubscriptions)

  useEffect(() => {
    dispatch(fetchAllSubscriptions())
  }, [dispatch])

  const handleViewInvoice = () => {
    router.push(`transactions/invoice-detail`)
  }

  const handleAddSubscription = () => {
    router.push("/customers/add-subscription")
  }

  const handleSubscriptionSuccess = () => {
    setIsModalOpen(false)
    dispatch(fetchAllSubscriptions()) // Refresh the list after adding
  }

  const handleEditSubscription = async (plan: MappedPlan) => {
    setCurrentPlan(plan)
    try {
      // Fetch the subscription type ID by name first
      const result = await dispatch(fetchSubscriptionTypeByName(plan.name))
      if (result.payload) {
        setIsEditModalOpen(true)
      }
    } catch (error) {}
  }

  const handleUpdateSubscription = async (updatedData: EditSubscriptionData) => {
    try {
      // Ensure we have a valid subscriptionTypeId before proceeding
      const { subscriptionTypeId } = currentSubscriptionType
      if (subscriptionTypeId == null) {
        console.error("subscriptionTypeId is not available. Please select a subscription type first.")
        return
      }

      if (typeof subscriptionTypeId !== "number") {
        throw new Error("subscriptionTypeId must be a number")
      }

      const updatePayload = {
        subscriptionType: {
          subscriptionTypeId,
          subscriptionName: updatedData.name,
        },
        subscriptionPlan: {
          yearlyPrice: updatedData.yearlyPrice,
          monthlyPrice: updatedData.monthlyPrice,
          targetAudience: updatedData.targetAudience,
          description: updatedData.tagline,
          points: Number(updatedData.points),
          discount: Number(updatedData.discount || 0),
        },
        subscriptionPlanDetails: {
          keyFeatures: updatedData.features.join(", "),
        },
      }

      const result = await dispatch(updateSubscriptionDetails(updatePayload))
      if (result.success) {
        setIsEditModalOpen(false)
        dispatch(fetchAllSubscriptions()) // Refresh the list after updating
      }
    } catch (error) {
      console.error("Failed to update subscription:", error)
    }
  }

  if (loading) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full rounded-md p-4">
        <div className="mb-8 space-y-4">
          <div className="h-8 w-3/4 animate-pulse rounded bg-gray-200"></div>
          <div className="h-4 w-full animate-pulse rounded bg-gray-200"></div>
          <div className="h-4 w-2/3 animate-pulse rounded bg-gray-200"></div>
        </div>

        <div className="flex justify-between">
          <div className="h-10 w-40 animate-pulse rounded-md bg-gray-200"></div>
          <div className="flex items-center gap-4">
            <div className="h-5 w-16 animate-pulse rounded bg-gray-200"></div>
            <div className="h-6 w-11 animate-pulse rounded-full bg-gray-200"></div>
            <div className="h-5 w-40 animate-pulse rounded bg-gray-200"></div>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((item) => (
            <motion.div
              key={item}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: item * 0.1 }}
              className="h-[400px] animate-pulse rounded-2xl bg-gray-200 p-4"
            ></motion.div>
          ))}
        </div>
      </motion.div>
    )
  }

  if (error) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full rounded-md p-4">
        <p className="text-red-500">Error: {error}</p>
      </motion.div>
    )
  }

  if (!plans || plans.length === 0) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full rounded-md p-4">
        <p>No subscription plans available</p>
        <ButtonModule
          className="mt-4"
          variant="primary"
          size="md"
          onClick={handleAddSubscription}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Add New Subscription
        </ButtonModule>
        <AddSubscriptionModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={handleSubscriptionSuccess}
        />
      </motion.div>
    )
  }

  // Map and filter the API data to match your UI structure
  const mappedPlans: MappedPlan[] = plans
    .filter(
      (plan) =>
        plan.planName && (plan.price?.monthly || plan.price?.yearly) && plan.keyFeatures && plan.keyFeatures.length > 0
    )
    .map(
      (plan, index): MappedPlan => ({
        id: index + 1,
        subscriptionTypeId: plan.subscriptionTypeId,
        name: plan.planName,
        tagline: plan.description,
        monthlyPrice: plan.price.monthly,
        yearlyPrice: plan.price.yearly,
        features: plan.keyFeatures.flatMap((feature) =>
          typeof feature === "string" ? feature.split(",").map((f) => f.trim()) : [feature]
        ),
        targetAudience: plan.targetAudience,
        points: plan.points,
        discount: plan.discount || 0,
        bgColor: index % 2 === 1 ? "bg-[#00a4a6]" : "bg-white",
        textColor: index % 2 === 1 ? "text-white" : "text-[#00a4a6]",
        buttonVariant: index % 2 === 1 ? "secondary" : "outline",
      })
    )

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="w-full rounded-md p-4"
    >
      <AddSubscriptionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleSubscriptionSuccess}
      />

      {currentPlan && (
        <EditSubscriptionModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onUpdate={handleUpdateSubscription}
          initialData={currentPlan}
        />
      )}

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-4 flex items-center justify-between"
      >
        <div>
          <h2 className="text-xl font-semibold">Enjoy extra discounts and exclusive perks with an upgraded plan.</h2>
          <p className="mt-2">
            Unlock exclusive discounts, earn loyalty points, and enjoy premium healthcare benefits for you and your
            family. Whether you&apos;re managing prescriptions or prioritizing wellness, there&apos;s a plan that fits
            your lifestyle.
          </p>
        </div>
      </motion.div>

      {/* Toggle switch */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="flex w-full items-center justify-between"
      >
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <ButtonModule variant="primary" size="md" onClick={handleAddSubscription}>
            Add New Subscription
          </ButtonModule>
        </motion.div>
        <motion.div
          className="my-6 flex items-center justify-end gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <motion.span
            className={`font-medium ${!isYearly ? "text-[#00a4a6]" : "text-gray-500"}`}
            animate={!isYearly ? { scale: 1.05 } : { scale: 1 }}
            transition={{ type: "spring", stiffness: 500 }}
          >
            Monthly
          </motion.span>
          <label className="relative inline-flex cursor-pointer items-center">
            <input
              type="checkbox"
              className="peer sr-only"
              checked={isYearly}
              onChange={() => setIsYearly(!isYearly)}
            />
            <motion.div
              className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-[#00a4a6] peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none"
              whileTap={{ scale: 0.95 }}
            ></motion.div>
          </label>
          <motion.span
            className={`font-medium ${isYearly ? "text-[#00a4a6]" : "text-gray-500"}`}
            animate={isYearly ? { scale: 1.05 } : { scale: 1 }}
            transition={{ type: "spring", stiffness: 500 }}
          >
            Yearly (2 months free)
          </motion.span>
        </motion.div>
      </motion.div>

      {mappedPlans.length > 0 ? (
        <motion.div
          className="mt-4 grid grid-cols-4 gap-4 overflow-x-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <AnimatePresence>
            {mappedPlans.map((plan) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                whileHover={{ y: -5 }}
                className={`flex flex-col items-start rounded-2xl p-4 ${plan.bgColor} h-full`}
              >
                <div className="flex w-full justify-between">
                  <motion.div
                    className={`flex items-center justify-center rounded-full ${
                      plan.bgColor === "bg-[#00a4a6]" ? "bg-white" : "bg-[#00a4a6]"
                    } px-4 py-1 text-center ${plan.bgColor === "bg-[#00a4a6]" ? "text-[#00a4a6]" : "text-white"}`}
                    whileHover={{ scale: 1.05 }}
                  >
                    <p>{plan.name}</p>
                  </motion.div>
                  <button
                    onClick={() => handleEditSubscription(plan)}
                    className={`text-sm ${plan.bgColor === "bg-[#00a4a6]" ? "text-white" : "text-[#00a4a6]"}`}
                  >
                    Edit
                  </button>
                </div>
                <p className={`mt-2 ${plan.textColor}`}>{plan.tagline}</p>
                <div className="my-4 flex">
                  <p className={`text-5xl font-semibold ${plan.textColor}`}>
                    ₹{isYearly ? plan.yearlyPrice : plan.monthlyPrice}
                    <span
                      className={`text-sm font-normal ${
                        plan.bgColor === "bg-[#00a4a6]" ? "text-[#F7F8F9]" : "text-[#33333380]"
                      }`}
                    >
                      /{isYearly ? "year" : "month"}
                    </span>
                  </p>
                </div>
                <motion.div
                  className={`mb-4 flex flex-col gap-2 ${plan.textColor}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  {plan.features.map((feature, index) => (
                    <motion.div
                      key={index}
                      className="flex items-center gap-2"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      {plan.bgColor === "bg-[#00a4a6]" ? <Check2Icon /> : <CheckIcon />}
                      <p>{feature}</p>
                    </motion.div>
                  ))}
                </motion.div>
                <motion.div className="mt-auto w-full" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <ButtonModule variant={plan.buttonVariant} size="md" onClick={() => handleViewInvoice()}>
                    {plan.bgColor === "bg-[#00a4a6]" ? "Book a Call" : "Get Started Now"}
                  </ButtonModule>
                </motion.div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full rounded-md p-4">
          <p>No valid subscription plans available</p>
          <ButtonModule
            className="mt-4"
            variant="primary"
            size="md"
            onClick={handleAddSubscription}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Add New Subscription
          </ButtonModule>
        </motion.div>
      )}
    </motion.div>
  )
}

export default SubscriptionsTab
