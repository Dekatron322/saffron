// app/components/PurchaseMenu/PurchaseMenu.tsx
"use client"

import React, { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAppDispatch, useAppSelector } from "app/api/store/store"
import {
  fetchOverviewData,
  selectSummaryStats,
  selectOverviewLoading,
  selectOverviewError,
} from "app/api/store/overviewSlice"
import {
  fetchUnitsOrderedData,
  selectTotalUnitsOrdered,
  selectUnitsPercentageChange,
  selectUnitsOrderedLoading,
  selectUnitsOrderedError,
} from "app/api/store/unitsOrderedSlice"
import {
  fetchPendingDeliveriesData,
  selectPendingDeliveriesSummary,
  selectGrowthPercentage,
  selectPendingDeliveriesLoading,
  selectPendingDeliveriesError,
} from "app/api/store/pendingDeliveriesSlice"
import {
  fetchReturnPurchaseOrderData,
  selectReturnSummaryStats,
  selectReturnPurchaseOrderLoading,
  selectReturnPurchaseOrderError,
} from "app/api/store/returnPurchaseOrderSlice"
import CardIcon from "public/Icons/card-icon"
import GrowthRate from "public/Icons/growth-rate"
import StockIcons from "public/Icons/stock-icon"
import TotalIcon from "public/Icons/total-icon"
import UpIcon from "public/Icons/up-icon"
import DownIcon from "public/Icons/down-icon"

const PurchaseMenu = () => {
  const router = useRouter()
  const dispatch = useAppDispatch()

  // Overview selectors
  const summaryStats = useAppSelector(selectSummaryStats)
  const overviewLoading = useAppSelector(selectOverviewLoading)
  const overviewError = useAppSelector(selectOverviewError)

  // Units ordered selectors
  const totalUnitsOrdered = useAppSelector(selectTotalUnitsOrdered)
  const unitsPercentageChange = useAppSelector(selectUnitsPercentageChange)
  const unitsOrderedLoading = useAppSelector(selectUnitsOrderedLoading)
  const unitsOrderedError = useAppSelector(selectUnitsOrderedError)

  // Pending deliveries selectors
  const pendingDeliveriesSummary = useAppSelector(selectPendingDeliveriesSummary)
  const growthPercentage = useAppSelector(selectGrowthPercentage)
  const pendingDeliveriesLoading = useAppSelector(selectPendingDeliveriesLoading)
  const pendingDeliveriesError = useAppSelector(selectPendingDeliveriesError)

  // Return purchase orders selectors
  const returnSummaryStats = useAppSelector(selectReturnSummaryStats)
  const returnPurchaseOrderLoading = useAppSelector(selectReturnPurchaseOrderLoading)
  const returnPurchaseOrderError = useAppSelector(selectReturnPurchaseOrderError)

  useEffect(() => {
    // Fetch all data when component mounts
    dispatch(fetchOverviewData())
    dispatch(fetchUnitsOrderedData())
    dispatch(fetchPendingDeliveriesData())
    dispatch(fetchReturnPurchaseOrderData())
  }, [dispatch])

  // Format currency with commas
  const formatCurrency = (value: number | null | undefined) => {
    if (value === null || value === undefined) return "0"
    return new Intl.NumberFormat("en-IN", {
      maximumFractionDigits: 0,
    }).format(value)
  }

  // Format number with commas (for units)
  const formatNumber = (value: number | null | undefined) => {
    if (value === null || value === undefined) return "0"
    return new Intl.NumberFormat("en-IN").format(value)
  }

  // Format percentage
  const formatPercentage = (percentage: string | null | undefined) => {
    if (!percentage) return "+0.00%"
    const isPositive = !percentage.startsWith("-")
    const value = percentage.replace("+", "").replace("-", "")
    return `${isPositive ? "+" : "-"}${value}%`
  }

  // Format growth percentage (number type)
  const formatGrowthPercentage = (growth: number | null | undefined) => {
    if (growth === null || growth === undefined) return "+0.00%"
    return `${growth >= 0 ? "+" : ""}${growth.toFixed(2)}%`
  }

  // Check if percentage is positive (string type)
  const isPositive = (percentage: string | null | undefined) => {
    if (!percentage) return true
    return !percentage.startsWith("-")
  }

  // Check if growth is positive (number type)
  const isGrowthPositive = (growth: number | null | undefined) => {
    if (growth === null || growth === undefined) return true
    return growth >= 0
  }

  // Calculate returned purchases value and percentage
  const getReturnedPurchasesData = () => {
    if (!returnSummaryStats) {
      return {
        totalReturnPurchase: 0,
        growth: 0,
        displayValue: "0",
        displayPercentage: "+0.00%",
        isPositive: true,
      }
    }

    return {
      totalReturnPurchase: returnSummaryStats.totalReturnPurchase,
      growth: returnSummaryStats.growth,
      displayValue: formatNumber(returnSummaryStats.totalReturnPurchase),
      displayPercentage: formatGrowthPercentage(returnSummaryStats.growth),
      isPositive: isGrowthPositive(returnSummaryStats.growth),
    }
  }

  // Handle card click to redirect to appropriate pages
  const handleCardClick = (cardType: string) => {
    switch (cardType) {
      case "totalPurchaseValue":
        router.push("/purchases/overview")
        break
      case "totalUnitsOrdered":
        router.push("/purchases/units-ordered")
        break
      case "pendingDeliveries":
        router.push("/purchases/pending-deliveries")
        break
      case "returnedPurchases":
        router.push("/purchases/returns")
        break
      default:
        router.push("/purchases/overview")
    }
  }

  // Combined loading state
  const loading = overviewLoading || unitsOrderedLoading || pendingDeliveriesLoading || returnPurchaseOrderLoading

  // Get returned purchases data
  const returnedPurchasesData = getReturnedPurchasesData()

  if (loading) {
    return (
      <div className="mb-3 flex w-full cursor-pointer gap-3 max-sm:flex-col">
        {[1, 2, 3, 4].map((item) => (
          <div key={item} className="small-card rounded-md p-2 transition duration-500 md:border">
            <div className="flex items-center gap-2 max-sm:mb-2">
              <div className="h-8 w-8 animate-pulse rounded-full bg-gray-200"></div>
              <div className="w-full">
                <div className="mb-2 h-4 w-32 animate-pulse rounded bg-gray-200 max-xl:text-sm"></div>
                <div className="flex w-full justify-between max-xl:text-sm">
                  <div className="h-6 w-16 animate-pulse rounded bg-gray-200"></div>
                  <div className="flex items-center gap-1">
                    <div className="h-4 w-4 animate-pulse rounded bg-gray-200"></div>
                    <div className="h-4 w-12 animate-pulse rounded bg-gray-200"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (overviewError) {
    console.error("Error loading overview data:", overviewError)
  }

  if (unitsOrderedError) {
    console.error("Error loading units ordered data:", unitsOrderedError)
  }

  if (pendingDeliveriesError) {
    console.error("Error loading pending deliveries data:", pendingDeliveriesError)
  }

  if (returnPurchaseOrderError) {
    console.error("Error loading return purchase order data:", returnPurchaseOrderError)
  }

  return (
    <div className="mb-3 flex w-full cursor-pointer gap-3 max-sm:flex-col">
      {/* Total Purchase Value Card */}
      <div
        className="small-card rounded-md p-2 transition duration-500 hover:shadow-md md:border"
        onClick={() => handleCardClick("totalPurchaseValue")}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            handleCardClick("totalPurchaseValue")
          }
        }}
      >
        <div className="flex items-center gap-2 max-sm:mb-2">
          <CardIcon />
          <div className="w-full">
            <span className="text-grey-400 max-xl:text-sm">Total Purchase Value</span>
            <div className="flex w-full justify-between max-xl:text-sm">
              <p>₹{summaryStats ? formatCurrency(summaryStats.totalPurchases) : "0"}</p>
              <div className="flex items-center gap-1">
                {summaryStats?.percentageChange ? (
                  <>
                    {isPositive(summaryStats.percentageChange) ? <UpIcon /> : <DownIcon />}
                    <p className={isPositive(summaryStats.percentageChange) ? "text-green-600" : "text-red-600"}>
                      {formatPercentage(summaryStats.percentageChange)}
                    </p>
                  </>
                ) : (
                  <>
                    <UpIcon />
                    <p>+0.00%</p>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Total Units Ordered Card */}
      <div
        className="small-card rounded-md p-2 transition duration-500 hover:shadow-md md:border"
        onClick={() => handleCardClick("totalUnitsOrdered")}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            handleCardClick("totalUnitsOrdered")
          }
        }}
      >
        <div className="flex items-center gap-2 max-sm:mb-2">
          <TotalIcon />
          <div className="w-full max-xl:text-sm">
            <span className="text-grey-400">Total Units Ordered</span>
            <div className="flex w-full justify-between">
              <p>{formatNumber(totalUnitsOrdered)}</p>
              <div className="flex items-center gap-1">
                {unitsPercentageChange ? (
                  <>
                    {isPositive(unitsPercentageChange) ? <UpIcon /> : <DownIcon />}
                    <p className={isPositive(unitsPercentageChange) ? "text-green-600" : "text-red-600"}>
                      {formatPercentage(unitsPercentageChange)}
                    </p>
                  </>
                ) : (
                  <>
                    <UpIcon />
                    <p>+0.00%</p>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pending Deliveries Card */}
      <div
        className="small-card rounded-md p-2 transition duration-500 hover:shadow-md md:border"
        onClick={() => handleCardClick("pendingDeliveries")}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            handleCardClick("pendingDeliveries")
          }
        }}
      >
        <div className="flex items-center gap-2 max-sm:mb-2">
          <StockIcons />
          <div className="w-full max-xl:text-sm">
            <span className="text-grey-400">Pending Deliveries</span>
            <div className="flex w-full justify-between">
              <p>{pendingDeliveriesSummary ? formatNumber(pendingDeliveriesSummary.totalPendingDeliveries) : "0"}</p>
              <div className="flex items-center gap-1">
                {growthPercentage ? (
                  <>
                    {isGrowthPositive(growthPercentage.value) ? <UpIcon /> : <DownIcon />}
                    <p className={isGrowthPositive(growthPercentage.value) ? "text-green-600" : "text-red-600"}>
                      {formatGrowthPercentage(growthPercentage.value)}
                    </p>
                  </>
                ) : (
                  <>
                    <UpIcon />
                    <p>+0.00%</p>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Returned Purchases Card */}
      <div
        className="small-card rounded-md p-2 transition duration-500 hover:shadow-md md:border"
        onClick={() => handleCardClick("returnedPurchases")}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            handleCardClick("returnedPurchases")
          }
        }}
      >
        <div className="flex items-center gap-2 max-sm:mb-2">
          <GrowthRate />
          <div className="w-full max-xl:text-sm">
            <span className="text-grey-400">Returned Purchases</span>
            <div className="flex w-full justify-between">
              <p>{returnedPurchasesData.displayValue}</p>
              <div className="flex items-center gap-1">
                {returnSummaryStats ? (
                  <>
                    {returnedPurchasesData.isPositive ? <UpIcon /> : <DownIcon />}
                    <p className={returnedPurchasesData.isPositive ? "text-green-600" : "text-red-600"}>
                      {returnedPurchasesData.displayPercentage}
                    </p>
                  </>
                ) : (
                  <>
                    <UpIcon />
                    <p>+0.00%</p>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PurchaseMenu
