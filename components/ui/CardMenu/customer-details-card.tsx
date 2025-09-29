// components/ui/Cards/CustomerDetailsCard.tsx
import React from "react"
import { Customer } from "app/api/store/customerSlice"
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaIdCard } from "react-icons/fa"
import StatusBadge from "./status-badge"

interface CustomerDetailsCardProps {
  customer: Customer
}

const CustomerDetailsCard = ({ customer }: CustomerDetailsCardProps) => {
  return (
    <div className="mb-6 rounded-lg bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="bg-primary flex h-16 w-16 items-center justify-center rounded-full text-2xl font-bold text-white">
            {customer.customerName.charAt(0)}
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-800">{customer.customerName}</h2>
            <StatusBadge status={customer.status === "Y" ? "Active" : "Inactive"} />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center">
          <FaIdCard className="mr-3 text-gray-400" />
          <div>
            <p className="text-sm text-gray-500">Customer ID</p>
            <p className="font-medium text-gray-700">{customer.customerProfileId}</p>
          </div>
        </div>

        <div className="flex items-center">
          <FaEnvelope className="mr-3 text-gray-400" />
          <div>
            <p className="text-sm text-gray-500">Email</p>
            <p className="font-medium text-gray-700">{customer.customerEmail}</p>
          </div>
        </div>

        <div className="flex items-center">
          <FaPhone className="mr-3 text-gray-400" />
          <div>
            <p className="text-sm text-gray-500">Phone</p>
            <p className="font-medium text-gray-700">{customer.customerPhone}</p>
          </div>
        </div>

        <div className="flex items-center">
          <FaMapMarkerAlt className="mr-3 text-gray-400" />
          <div>
            <p className="text-sm text-gray-500">Address</p>
            <p className="font-medium text-gray-700">{customer.customerAddress || "Not provided"}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CustomerDetailsCard
