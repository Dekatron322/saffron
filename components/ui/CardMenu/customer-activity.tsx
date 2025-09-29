// components/ui/Cards/CustomerActivity.tsx
import React from "react"
import { Customer } from "app/api/store/customerSlice"
import { FaHistory, FaShoppingCart, FaMoneyBillWave } from "react-icons/fa"

interface CustomerActivityProps {
  customerId: number
}

const CustomerActivity = ({ customerId }: CustomerActivityProps) => {
  // In a real app, you would fetch activity data based on customerId
  const orders = [
    { id: 1, date: "2023-05-15", amount: 125.0, status: "Delivered" },
    { id: 2, date: "2023-06-22", amount: 89.99, status: "Shipped" },
    { id: 3, date: "2023-07-10", amount: 45.5, status: "Processing" },
  ]

  return (
    <div className="rounded-lg bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800">Recent Activity</h3>
        <button className="text-primary text-sm hover:underline">View All</button>
      </div>

      <div className="space-y-4">
        {orders.length > 0 ? (
          orders.map((order) => (
            <div key={order.id} className="flex items-center justify-between rounded border p-4">
              <div className="flex items-center space-x-4">
                <div className="rounded-lg bg-blue-50 p-3">
                  <FaShoppingCart className="text-blue-500" />
                </div>
                <div>
                  <p className="font-medium text-gray-700">Order #{order.id}</p>
                  <p className="text-sm text-gray-500">{order.date}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-medium text-gray-700">${order.amount.toFixed(2)}</p>
                <span
                  className={`inline-block rounded-full px-2 py-1 text-xs ${
                    order.status === "Delivered"
                      ? "bg-green-100 text-green-800"
                      : order.status === "Shipped"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {order.status}
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <FaHistory className="mb-2 text-4xl text-gray-300" />
            <p className="text-gray-500">No recent activity found</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default CustomerActivity
