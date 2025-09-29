// components/ui/Cards/CustomerSubscription.tsx
import React from "react"
import { Customer } from "app/api/store/customerSlice"
import { FaCalendarAlt, FaTag } from "react-icons/fa"
import ProgressBar from "./progress-bar"

interface CustomerSubscriptionProps {
  customer: Customer
}

const CustomerSubscription = ({ customer }: CustomerSubscriptionProps) => {
  const hasSubscription = customer.subscriptionOpt !== null

  return (
    <div className="mb-6 rounded-lg bg-white p-6 shadow-sm">
      <h3 className="mb-4 text-lg font-semibold text-gray-800">Subscription</h3>

      {hasSubscription ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <FaTag className="mr-3 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Plan</p>
                <p className="font-medium text-gray-700">{customer.subscriptionOpt}</p>
              </div>
            </div>
            <div className="flex items-center">
              <FaCalendarAlt className="mr-3 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Duration</p>
                <p className="font-medium text-gray-700">{customer.subscriptionDuration}</p>
              </div>
            </div>
          </div>

          <div>
            <div className="mb-2 flex justify-between">
              <span className="text-sm text-gray-500">Subscription Progress</span>
              <span className="text-sm font-medium text-gray-700">65%</span>
            </div>
            <ProgressBar progress={65} />
          </div>

          <div className="rounded-lg bg-blue-50 p-4">
            <p className="text-sm text-blue-700">
              Subscription valid until: <span className="font-medium">December 31, 2023</span>
            </p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="mb-4 rounded-full bg-gray-100 p-4">
            <FaTag className="text-2xl text-gray-400" />
          </div>
          <p className="text-gray-600">No active subscription</p>
          <button className="text-primary mt-4 text-sm font-medium hover:underline">Subscribe Now</button>
        </div>
      )}
    </div>
  )
}

export default CustomerSubscription
