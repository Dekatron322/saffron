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
            <div onClick={handleBackClick}>
              <ArrowBackIcon />
            </div>
            <h1 className="text-xl font-semibold">{title}</h1>
          </div>
        </div>

        <CustomerMetricTable customers={customers} loading={loading} error={error} />
      </div>
    </section>
  )
}
