import CardIcon from "public/Icons/card-icon"
import GrowthRate from "public/Icons/growth-rate"
import StockIcons from "public/Icons/stock-icon"
import TotalIcon from "public/Icons/total-icon"
import UpIcon from "public/Icons/up-icon"
import DownIcon from "public/Icons/down-icon"
import React, { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import {
  fetchPurchaseDashboardData,
  fetchSalesDashboardData,
  fetchSalesGrowthData,
  fetchStockSummaryData,
  selectGrowthPercentage,
  selectPercentageChange,
  selectPurchaseLoading,
  selectSalesGrowthAmount,
  selectSalesGrowthLoading,
  selectSalesGrowthPercentage,
  selectSalesLoading,
  selectStockLoading,
  selectStockPercentageChange,
  selectTotalPurchasesAmount,
  selectTotalSalesAmount,
  selectTotalStock,
} from "app/api/store/dashboardSlice"
import { AppDispatch } from "app/api/store/store"

const CardMenu = () => {
  const dispatch = useDispatch<AppDispatch>()
  const totalSales = useSelector(selectTotalSalesAmount)
  const growthPercentage = useSelector(selectGrowthPercentage)
  const totalPurchases = useSelector(selectTotalPurchasesAmount)
  const percentageChange = useSelector(selectPercentageChange)
  const totalStock = useSelector(selectTotalStock)
  const stockPercentageChange = useSelector(selectStockPercentageChange)
  const salesGrowthPercentage = useSelector(selectSalesGrowthPercentage)
  const salesGrowthAmount = useSelector(selectSalesGrowthAmount)
  const salesLoading = useSelector(selectSalesLoading)
  const purchaseLoading = useSelector(selectPurchaseLoading)
  const stockLoading = useSelector(selectStockLoading)
  const salesGrowthLoading = useSelector(selectSalesGrowthLoading)

  useEffect(() => {
    dispatch(fetchSalesDashboardData())
    dispatch(fetchPurchaseDashboardData())
    dispatch(fetchStockSummaryData())
    dispatch(fetchSalesGrowthData())
  }, [dispatch])

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  }

  // Format number with commas
  const formatNumber = (number: number) => {
    return new Intl.NumberFormat("en-IN").format(number)
  }

  // Format percentage for sales (number type)
  const formatSalesPercentage = (percentage: number) => {
    return `${percentage >= 0 ? "+" : ""}${percentage.toFixed(2)}%`
  }

  // Format percentage for purchases and stock (string type with + sign)
  const formatStringPercentage = (percentage: string) => {
    // If percentage already has + or - sign, return as is, otherwise add +
    if (percentage.startsWith("+") || percentage.startsWith("-")) {
      return `${percentage}%`
    }
    return `+${percentage}%`
  }

  // Helper function to check if percentage is negative
  const isPercentageNegative = (percentage: string) => {
    return percentage.trim().startsWith("-")
  }

  // Helper function to check if number is negative
  const isNumberNegative = (number: number) => {
    return number < 0
  }

  return (
    <div className="mb-3 flex w-full cursor-pointer gap-3 max-sm:flex-col">
      {/* Total Sales Card */}
      <div className="small-card rounded-md p-2 transition duration-500 md:border">
        <div className="flex items-center gap-2 max-sm:mb-2">
          <CardIcon />
          <div className="w-full">
            <span className="text-grey-400 max-xl:text-sm">Total Sales</span>
            <div className="flex w-full justify-between max-xl:text-sm">
              {salesLoading ? (
                <p className="text-gray-400">Loading...</p>
              ) : (
                <>
                  <p>{formatCurrency(totalSales)}</p>
                  <div className="flex items-center gap-1">
                    {isNumberNegative(growthPercentage) ? <DownIcon /> : <UpIcon />}
                    <p>{formatSalesPercentage(growthPercentage)}</p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Total Purchases Card */}
      <div className="small-card rounded-md p-2 transition duration-500 md:border">
        <div className="flex items-center gap-1 max-sm:mb-2">
          <TotalIcon />
          <div className="w-full max-xl:text-sm">
            <span className="text-grey-400">Total Purchases</span>
            <div className="flex w-full justify-between">
              {purchaseLoading ? (
                <p className="text-gray-400">Loading...</p>
              ) : (
                <>
                  <p>{formatCurrency(totalPurchases)}</p>
                  <div className="flex items-center gap-1">
                    {isPercentageNegative(percentageChange) ? <DownIcon /> : <UpIcon />}
                    <p>{formatStringPercentage(percentageChange)}</p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Total Stock Available Card */}
      <div className="small-card rounded-md p-2 transition duration-500 md:border">
        <div className="flex items-center gap-1 max-sm:mb-2">
          <StockIcons />
          <div className="w-full max-xl:text-sm">
            <span className="text-grey-400">Total Stock Available</span>
            <div className="flex w-full justify-between">
              {stockLoading ? (
                <p className="text-gray-400">Loading...</p>
              ) : (
                <>
                  <p>{formatNumber(totalStock)}</p>
                  <div className="flex items-center gap-1">
                    {isPercentageNegative(stockPercentageChange) ? <DownIcon /> : <UpIcon />}
                    <p>{formatStringPercentage(stockPercentageChange)}</p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Sales Growth Rate Card */}
      <div className="small-card rounded-md p-2 transition duration-500 md:border">
        <div className="flex items-center gap-1 max-sm:mb-2">
          <GrowthRate />
          <div className="w-full max-xl:text-sm">
            <span className="text-grey-400">Sales Growth Rate</span>
            <div className="flex w-full justify-between">
              {salesGrowthLoading ? (
                <p className="text-gray-400">Loading...</p>
              ) : (
                <>
                  <p>{salesGrowthPercentage.toFixed(2)}%</p>
                  <div className="flex items-center gap-1">
                    {isNumberNegative(salesGrowthPercentage) ? <DownIcon /> : <UpIcon />}
                    <p>{formatSalesPercentage(salesGrowthPercentage)}</p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CardMenu
