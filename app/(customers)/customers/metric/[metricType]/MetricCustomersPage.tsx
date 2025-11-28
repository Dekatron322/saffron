"use client"
import React, { useEffect } from "react"
import { useAppDispatch, useAppSelector } from "app/api/store/store"
import { fetchCustomersByMetric, selectCustomers } from "app/api/store/customerSlice"
import { ButtonModule } from "components/ui/Button/Button"
import ExportIcon from "public/export-icon"
import { SearchModule } from "components/ui/Search/search-module"
import CustomerMetricTable from "components/Tables/CustomerMetricTable"
import ArrowBackIcon from "public/arrow-back-icon"
import { useRouter } from "next/navigation" // Import useRouter from Next.js
import DashboardNav from "components/Navbar/DashboardNav"
import AddBusiness from "public/add-business"

interface MetricCustomersPageProps {
  metricType: string
  title: string
}

const metricTypes: Record<string, string> = {
  "total-registered": "TOTAL_REGISTERED_CUSTOMERS",
  "new-customers": "NEW_CUSTOMERS",
  "active-customers": "ACTIVE_CUSTOMERS",
  "subscribed-customers": "SUBSCRIBED_CUSTOMERS",
}

export default function MetricCustomersPage({ metricType, title }: MetricCustomersPageProps) {
  const router = useRouter() // Initialize the router
  const apiMetricType = metricTypes[metricType]
  const { customers, loading, error } = useAppSelector(selectCustomers)
  const dispatch = useAppDispatch()

  useEffect(() => {
    dispatch(fetchCustomersByMetric(apiMetricType as any))
  }, [dispatch, apiMetricType])

  const handleBackClick = () => {
    router.back() // This will navigate to the previous page
  }

  return (
    <section className="bg-[#F4F9F8]">
      <DashboardNav />
      <div className="paddings  min-h-screen  py-8 ">
        <div className="mb-5 flex w-full justify-between">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex size-9 items-center justify-center rounded-md border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
            >
              <svg
                width="1em"
                height="1em"
                viewBox="0 0 17 17"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="new-arrow-right rotate-180 transform"
              >
                <path
                  d="M9.1497 0.80204C9.26529 3.95101 13.2299 6.51557 16.1451 8.0308L16.1447 9.43036C13.2285 10.7142 9.37889 13.1647 9.37789 16.1971L7.27855 16.1978C7.16304 12.8156 10.6627 10.4818 13.1122 9.66462L0.049716 9.43565L0.0504065 7.33631L13.1129 7.56528C10.5473 6.86634 6.93261 4.18504 7.05036 0.80273L9.1497 0.80204Z"
                  fill="currentColor"
                ></path>
              </svg>
            </button>

            <h1 className="text-xl font-semibold">{title}</h1>
          </div>
        </div>

        <CustomerMetricTable customers={customers} loading={loading} error={error} />
      </div>
    </section>
  )
}
