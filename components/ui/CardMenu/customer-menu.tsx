// components/CustomerMenu.tsx
import React, { useEffect } from "react"
import ActiveCustomer from "public/active-customers"
import UpIcon from "public/Icons/up-icon"
import NewCustomers from "public/new-customers"
import TotalCustomers from "public/total-customers"
import { useAppDispatch, useAppSelector } from "app/api/store/store"
import { fetchCustomerDashboardSummary, selectCustomers } from "app/api/store/customerSlice"
import Link from "next/link"
import { motion } from "framer-motion"

const CustomerMenu = () => {
  const dispatch = useAppDispatch()
  const { dashboardSummary } = useAppSelector(selectCustomers)

  useEffect(() => {
    dispatch(fetchCustomerDashboardSummary())
  }, [dispatch])

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 10,
      },
    },
    hover: {
      y: -5,
      scale: 1.02,
      transition: { duration: 0.2 },
    },
  }

  const skeletonVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  }

  // Skeleton loader component
  const MetricSkeleton = () => (
    <motion.div
      className="small-card rounded-md p-2 transition duration-500 md:border"
      variants={itemVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="flex items-center gap-2 max-sm:mb-2">
        <div className="h-8 w-8 animate-pulse rounded-full bg-gray-200"></div>
        <div className="w-full">
          <div className="mb-2 h-4 w-3/4 animate-pulse rounded bg-gray-200"></div>
          <div className="flex w-full justify-between">
            <div className="h-6 w-1/3 animate-pulse rounded bg-gray-200"></div>
            <div className="flex items-center gap-1">
              <div className="h-4 w-4 animate-pulse rounded bg-gray-200"></div>
              <div className="h-4 w-8 animate-pulse rounded bg-gray-200"></div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )

  // Loading state
  if (dashboardSummary.loading) {
    return (
      <motion.div
        className="mb-3 flex w-full cursor-pointer gap-3 max-sm:flex-col"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <MetricSkeleton />
        <MetricSkeleton />
        <MetricSkeleton />
        <MetricSkeleton />
      </motion.div>
    )
  }

  // Error state
  if (dashboardSummary.error) {
    return (
      <motion.div
        className="mb-3 flex w-full cursor-pointer gap-3 max-sm:flex-col"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="small-card rounded-md border-red-100 bg-red-50 p-2 transition duration-500 md:border">
          <div className="p-4 text-center text-red-500">Error loading dashboard data: {dashboardSummary.error}</div>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      className="mb-3 flex w-full cursor-pointer gap-3 max-sm:flex-col"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Total Registered Customers */}
      <Link href="/customers/metric/total-registered" passHref className="flex w-full">
        <motion.div
          className="small-card rounded-md p-2 transition duration-500 hover:shadow-md md:border"
          variants={itemVariants}
          whileHover="hover"
        >
          <div className="flex items-center gap-2 max-sm:mb-2">
            <motion.div whileHover={{ scale: 1.1 }}>
              <TotalCustomers />
            </motion.div>
            <div className="w-full">
              <span className="text-grey-400 text-sm">Total Registered Customers</span>
              <div className="mt-1 flex w-full justify-between">
                <motion.p
                  className="text-lg font-semibold"
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  {dashboardSummary.data.totalRegistered.count.toLocaleString()}
                </motion.p>
                <div className="flex items-center gap-1 text-green-500">
                  <motion.div
                    animate={{
                      y: [0, -2, 0],
                      transition: {
                        repeat: Infinity,
                        duration: 1.5,
                      },
                    }}
                  >
                    <UpIcon />
                  </motion.div>
                  <p className="text-sm">{dashboardSummary.data.totalRegistered.growth.toFixed(2)}%</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </Link>

      {/* New Customers */}
      <Link href="/customers/metric/new-customers" passHref className="flex w-full">
        <motion.div
          className="small-card rounded-md p-2 transition duration-500 hover:shadow-md md:border"
          variants={itemVariants}
          whileHover="hover"
        >
          <div className="flex items-center gap-2 max-sm:mb-2">
            <motion.div whileHover={{ scale: 1.1 }}>
              <NewCustomers />
            </motion.div>
            <div className="w-full">
              <span className="text-grey-400 text-sm">New Customers</span>
              <div className="mt-1 flex w-full justify-between">
                <motion.p
                  className="text-lg font-semibold"
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  {dashboardSummary.data.newCustomers.count.toLocaleString()}
                </motion.p>
                <div className="flex items-center gap-1 text-green-500">
                  <motion.div
                    animate={{
                      y: [0, -2, 0],
                      transition: {
                        repeat: Infinity,
                        duration: 1.5,
                        delay: 0.2,
                      },
                    }}
                  >
                    <UpIcon />
                  </motion.div>
                  <p className="text-sm">{dashboardSummary.data.newCustomers.growth.toFixed(2)}%</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </Link>

      {/* Active Customers */}
      <Link href="/customers/metric/active-customers" passHref className="flex w-full">
        <motion.div
          className="small-card rounded-md p-2 transition duration-500 hover:shadow-md md:border"
          variants={itemVariants}
          whileHover="hover"
        >
          <div className="flex items-center gap-2 max-sm:mb-2">
            <motion.div whileHover={{ scale: 1.1 }}>
              <ActiveCustomer />
            </motion.div>
            <div className="w-full">
              <span className="text-grey-400 text-sm">Active Customers</span>
              <div className="mt-1 flex w-full justify-between">
                <motion.p
                  className="text-lg font-semibold"
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  {dashboardSummary.data.activeCustomers.count.toLocaleString()}
                </motion.p>
                <div className="flex items-center gap-1 text-green-500">
                  <motion.div
                    animate={{
                      y: [0, -2, 0],
                      transition: {
                        repeat: Infinity,
                        duration: 1.5,
                        delay: 0.4,
                      },
                    }}
                  >
                    <UpIcon />
                  </motion.div>
                  <p className="text-sm">{dashboardSummary.data.activeCustomers.growth.toFixed(2)}%</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </Link>

      {/* Subscribed Customers */}
      <Link href="/customers/metric/subscribed-customers" passHref className="flex w-full">
        <motion.div
          className="small-card rounded-md p-2 transition duration-500 hover:shadow-md md:border"
          variants={itemVariants}
          whileHover="hover"
        >
          <div className="flex items-center gap-2 max-sm:mb-2">
            <motion.div whileHover={{ scale: 1.1 }}>
              <TotalCustomers />
            </motion.div>
            <div className="w-full">
              <span className="text-grey-400 text-sm">Subscribed Customers</span>
              <div className="mt-1 flex w-full justify-between">
                <motion.p
                  className="text-lg font-semibold"
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  {dashboardSummary.data.subscribedCustomers.count.toLocaleString()}
                </motion.p>
                <div className="flex items-center gap-1 text-green-500">
                  <motion.div
                    animate={{
                      y: [0, -2, 0],
                      transition: {
                        repeat: Infinity,
                        duration: 1.5,
                        delay: 0.6,
                      },
                    }}
                  >
                    <UpIcon />
                  </motion.div>
                  <p className="text-sm">{dashboardSummary.data.subscribedCustomers.growth.toFixed(2)}%</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </Link>
    </motion.div>
  )
}

export default CustomerMenu
