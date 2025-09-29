// components/ui/Cards/CustomerLoyalty.tsx
import React from "react"
import { Customer } from "app/api/store/customerSlice"
import { FaGift, FaStar } from "react-icons/fa"

interface CustomerLoyaltyProps {
  customer: Customer
}

const CustomerLoyalty = ({ customer }: CustomerLoyaltyProps) => {
  return (
    <div className="rounded-lg bg-white p-6 shadow-sm">
      <h3 className="mb-4 text-lg font-semibold text-gray-800">Loyalty Program</h3>

      <div className="space-y-6">
        <div className="flex items-center justify-between rounded-lg bg-yellow-50 p-4">
          <div className="flex items-center">
            <FaStar className="mr-3 text-yellow-500" />
            <div>
              <p className="text-sm text-gray-500">Loyalty Points</p>
              <p className="text-xl font-bold text-yellow-600">{customer.customerLoyaltyPoints.toLocaleString()}</p>
            </div>
          </div>
          <button className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-800">
            Gold Tier
          </button>
        </div>

        <div className="rounded-lg border p-4">
          <div className="mb-3 flex items-center justify-between">
            <h4 className="font-medium text-gray-700">Available Rewards</h4>
            <button className="text-primary text-xs hover:underline">View All</button>
          </div>
          <div className="flex space-x-4">
            <div className="flex-1 rounded-lg bg-blue-50 p-3 text-center">
              <FaGift className="mx-auto mb-2 text-blue-500" />
              <p className="text-sm font-medium text-gray-700">10% Discount</p>
              <p className="text-xs text-gray-500">5,000 points</p>
            </div>
            <div className="flex-1 rounded-lg bg-purple-50 p-3 text-center">
              <FaGift className="mx-auto mb-2 text-purple-500" />
              <p className="text-sm font-medium text-gray-700">Free Shipping</p>
              <p className="text-xs text-gray-500">2,000 points</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CustomerLoyalty
