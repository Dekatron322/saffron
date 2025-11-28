"use client"
import TotalAssets from "public/total-assets"
import TransactionIcon from "public/transaction-icon"
import React, { useCallback, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import {
  fetchStockLevelsData,
  selectExpiredCount,
  selectExpiredPercentage,
  selectInStockCount,
  selectInStockPercentage,
  selectLowStockCount,
  selectLowStockPercentage,
  selectOutOfStockCount,
  selectOutOfStockPercentage,
  selectStockLevelsData,
  selectStockLevelsLoading,
} from "app/api/store/dashboardSlice"
import {
  fetchLowStockAlertsData,
  selectAllLowStockProducts,
  selectLowStockAlertsData,
  selectLowStockAlertsLoading,
} from "app/api/store/dashboardSlice"
import {
  fetchOrderSummaryData,
  selectCancelledOrders,
  selectCompletedOrders,
  selectOrderGrowthPercentage,
  selectOrderSummaryData,
  selectOrderSummaryLoading,
  selectOrderSummaryOrders,
  selectPendingOrders,
  selectTotalOrders,
} from "app/api/store/dashboardSlice"
import { selectAuth } from "app/api/store/authSlice"
import { AppDispatch } from "app/api/store/store"
import { ButtonModule } from "../Button/Button"
import {
  fetchTopSellingCategoriesData,
  selectTopSellingCategories,
  selectTopSellingCategoriesLoading,
} from "app/api/store/dashboardSlice"
import {
  fetchSalesPurchaseGraphData,
  refreshSalesPurchaseGraphData,
  selectProfitGrowth,
  selectPurchasesGrowth,
  selectSalesGrowth,
  selectSalesPurchaseGraphData,
  selectSalesPurchaseGraphLoading,
  selectSalesPurchaseGraphPeriod,
  selectSalesPurchaseGraphPoints,
  selectTotalProfit,
  selectTotalPurchases,
  selectTotalSales,
} from "app/api/store/dashboardSlice"
import CustomerIcon from "public/customer-icon"
import AccountIcon from "public/accounts-icon"
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import UpIcon from "public/Icons/up-icon"
import DownIcon from "public/Icons/down-icon"
import ArrowIcon from "public/Icons/arrowIcon"

const OverviewCard = () => {
  const dispatch = useDispatch<AppDispatch>()

  // Selectors for stock levels
  const inStockPct = useSelector(selectInStockPercentage)
  const lowStockPct = useSelector(selectLowStockPercentage)
  const expiredPct = useSelector(selectExpiredPercentage)
  const outOfStockPct = useSelector(selectOutOfStockPercentage)
  const stockLevelsLoading = useSelector(selectStockLevelsLoading)
  const stockLevelsState = useSelector(selectStockLevelsData)
  const { isAuthenticated } = useSelector(selectAuth)
  const inStockCount = useSelector(selectInStockCount)
  const lowStockCount = useSelector(selectLowStockCount)
  const expiredCount = useSelector(selectExpiredCount)
  const outOfStockCount = useSelector(selectOutOfStockCount)

  // Low stock alerts selectors
  const lowStockAlertsLoading = useSelector(selectLowStockAlertsLoading)
  const lowStockAlertsState = useSelector(selectLowStockAlertsData)
  const lowStockProducts = useSelector(selectAllLowStockProducts)

  // Selectors for order summary
  const orderSummaryLoading = useSelector(selectOrderSummaryLoading)
  const orderSummaryData = useSelector(selectOrderSummaryData)
  const totalOrders = useSelector(selectTotalOrders)
  const completedOrders = useSelector(selectCompletedOrders)
  const pendingOrders = useSelector(selectPendingOrders)
  const cancelledOrders = useSelector(selectCancelledOrders)
  const orderGrowthPercentage = useSelector(selectOrderGrowthPercentage)
  const orderSummaryOrders = useSelector(selectOrderSummaryOrders)

  // Top selling categories selectors
  const topSellingCategoriesLoading = useSelector(selectTopSellingCategoriesLoading)
  const topSellingCategories = useSelector(selectTopSellingCategories)

  // Sales Purchase Graph selectors
  const salesPurchaseGraphLoading = useSelector(selectSalesPurchaseGraphLoading)
  const salesPurchaseGraphData = useSelector(selectSalesPurchaseGraphData)
  const salesPurchaseGraphPoints = useSelector(selectSalesPurchaseGraphPoints)
  const totalSales = useSelector(selectTotalSales)
  const totalPurchases = useSelector(selectTotalPurchases)
  const totalProfit = useSelector(selectTotalProfit)
  const salesGrowth = useSelector(selectSalesGrowth)
  const purchasesGrowth = useSelector(selectPurchasesGrowth)
  const profitGrowth = useSelector(selectProfitGrowth)
  const currentPeriod = useSelector(selectSalesPurchaseGraphPeriod)

  // Memoized data preparation to prevent unnecessary re-renders
  const stockLevelsData = React.useMemo(
    () =>
      [
        {
          name: "In Stock",
          value: inStockPct,
          count: inStockCount,
        },
        {
          name: "Low Stock",
          value: lowStockPct,
          count: lowStockCount,
        },
        {
          name: "Expired",
          value: expiredPct,
          count: expiredCount,
        },
        {
          name: "Out of Stock",
          value: outOfStockPct,
          count: outOfStockCount,
        },
      ].map((item) => ({
        ...item,
        value: Number(item.value) || 0,
      })),
    [inStockPct, lowStockPct, expiredPct, outOfStockPct, inStockCount, lowStockCount, expiredCount, outOfStockCount]
  )

  // Order Status Data
  const orderStatusData = React.useMemo(
    () => [
      {
        status: "Total",
        value: totalOrders > 0 ? 100 : 0,
        count: totalOrders,
        color: "#9E9E9E",
      },
      {
        status: "Completed",
        value: totalOrders > 0 ? Math.round((completedOrders / totalOrders) * 100) : 0,
        count: completedOrders,
        color: "#00a4a6",
      },
      {
        status: "Pending",
        value: totalOrders > 0 ? Math.round((pendingOrders / totalOrders) * 100) : 0,
        count: pendingOrders,
        color: "#F2960F",
      },
      {
        status: "Cancelled",
        value: totalOrders > 0 ? Math.round((cancelledOrders / totalOrders) * 100) : 0,
        count: cancelledOrders,
        color: "#EB2426",
      },
    ],
    [totalOrders, completedOrders, pendingOrders, cancelledOrders]
  )

  // Low Stock Items Data
  const lowStockItems = React.useMemo(
    () =>
      (lowStockProducts || [])
        .map((p: any) => ({
          name: p.itemName || p.productName || "Item",
          change: 0,
          color: "#B1EEE2",
        }))
        .slice(0, 5),
    [lowStockProducts]
  )

  // Sales & Purchase Trends Data - ensure cumulative fields are present and numeric
  const salesData = React.useMemo(() => {
    let runningSale = 0
    let runningPurchase = 0
    return (salesPurchaseGraphPoints || []).map((point: any) => {
      const sale = Number(point?.sale) || 0
      const purchase = Number(point?.purchase) || 0
      runningSale += sale
      runningPurchase += purchase
      const cumulativeSale =
        point?.cumulativeSale !== undefined && point?.cumulativeSale !== null
          ? Number(point.cumulativeSale)
          : runningSale
      const cumulativePurchase =
        point?.cumulativePurchase !== undefined && point?.cumulativePurchase !== null
          ? Number(point.cumulativePurchase)
          : runningPurchase
      return {
        date: point?.date,
        sale,
        purchase,
        cumulativeSale,
        cumulativePurchase,
      }
    })
  }, [salesPurchaseGraphPoints])

  // Format date for display - show day/month
  const formatDate = useCallback((dateString: string) => {
    const date = new Date(dateString)
    return `${date.getDate()}/${date.getMonth() + 1}`
  }, [])

  // Prepare chart data - use daily sales and purchases (not cumulative)
  const chartData = React.useMemo(
    () =>
      salesData.length > 0
        ? salesData.map((item) => ({
            day: formatDate(item.date),
            sales: item.sale, // Use daily sales, not cumulative
            purchases: item.purchase, // Use daily purchases, not cumulative
            date: item.date,
            cumulativeSale: item.cumulativeSale,
            cumulativePurchase: item.cumulativePurchase,
          }))
        : [
            { day: "1/11", sales: 0, purchases: 0, cumulativeSale: 0, cumulativePurchase: 0 },
            { day: "2/11", sales: 0, purchases: 0, cumulativeSale: 0, cumulativePurchase: 0 },
            { day: "3/11", sales: 0, purchases: 0, cumulativeSale: 0, cumulativePurchase: 0 },
            { day: "4/11", sales: 0, purchases: 0, cumulativeSale: 0, cumulativePurchase: 0 },
            { day: "5/11", sales: 0, purchases: 0, cumulativeSale: 0, cumulativePurchase: 0 },
            { day: "6/11", sales: 0, purchases: 0, cumulativeSale: 0, cumulativePurchase: 0 },
            { day: "7/11", sales: 0, purchases: 0, cumulativeSale: 0, cumulativePurchase: 0 },
          ],
    [salesData, formatDate]
  )

  // Calculate cumulative totals from the last data point
  const cumulativeTotals = React.useMemo(() => {
    if (salesData.length === 0) {
      return { totalSales: 0, totalPurchases: 0 }
    }
    const lastPoint = salesData[salesData.length - 1]
    return {
      totalSales: lastPoint?.cumulativeSale ?? 0,
      totalPurchases: lastPoint?.cumulativePurchase ?? 0,
    }
  }, [salesData])

  // Color scheme for categories
  const CATEGORY_COLORS = ["#00a4a6", "#F2960F", "#EB2426", "#9E9E9E", "#B1EEE2"]

  // Top Selling Categories Data
  const topCategories = React.useMemo(
    () =>
      (topSellingCategories || []).slice(0, 5).map((cat: any, index: number) => ({
        name: cat?.categoryName ?? "",
        change: Number(cat?.totalSaleGrowth ?? 0),
        percentage: Math.round(Number(cat?.percentage ?? 0)),
        quantity: Number(cat?.totalQuantity ?? 0),
        color: CATEGORY_COLORS[index % CATEGORY_COLORS.length] ?? "#9E9E9E",
      })),
    [topSellingCategories]
  )

  // Color scheme for stock levels
  const COLORS = ["#00a4a6", "#B1EEE2", "#F2960F", "#EB242699"]

  // Effect to fetch data only when needed
  useEffect(() => {
    if (!isAuthenticated) return

    const fetchData = async () => {
      const promises = []

      if (!stockLevelsState && !stockLevelsLoading) {
        promises.push(dispatch(fetchStockLevelsData()))
      }
      if (!lowStockAlertsState && !lowStockAlertsLoading) {
        promises.push(dispatch(fetchLowStockAlertsData()))
      }
      if (!orderSummaryData && !orderSummaryLoading) {
        promises.push(dispatch(fetchOrderSummaryData()))
      }
      if (!topSellingCategoriesLoading && (!topSellingCategories || topSellingCategories.length === 0)) {
        promises.push(dispatch(fetchTopSellingCategoriesData({})))
      }
      if (!salesPurchaseGraphData && !salesPurchaseGraphLoading) {
        promises.push(dispatch(fetchSalesPurchaseGraphData({ period: currentPeriod })))
      }

      if (promises.length > 0) {
        await Promise.all(promises)
      }
    }

    fetchData()
  }, [
    dispatch,
    isAuthenticated,
    stockLevelsState,
    stockLevelsLoading,
    lowStockAlertsState,
    lowStockAlertsLoading,
    orderSummaryData,
    orderSummaryLoading,
    topSellingCategoriesLoading,
    topSellingCategories,
    salesPurchaseGraphData,
    salesPurchaseGraphLoading,
  ])

  // Handle period change
  const handlePeriodChange = useCallback(
    (period: "THIS_MONTH" | "LAST_MONTH" | "LAST_3_MONTHS" | "LAST_6_MONTHS" | "THIS_YEAR" | "YEAR") => {
      dispatch(refreshSalesPurchaseGraphData(period))
    },
    [dispatch]
  )

  // Format growth percentage for display
  const formatGrowthPercentage = useCallback((growth: number) => {
    const sign = growth >= 0 ? "+" : ""
    return `${sign}${growth.toFixed(2)}%`
  }, [])

  // Format currency for display
  const formatCurrency = useCallback((amount: number) => {
    return `₹${amount?.toLocaleString("en-IN") || 0}`
  }, [])

  // Custom tooltip for bar chart
  const CustomBarTooltip = useCallback(
    ({ active, payload, label }: any) => {
      if (active && payload && payload.length) {
        const data = payload[0]?.payload
        return (
          <div className="rounded border bg-white p-3 shadow-lg">
            <p className="mb-2 font-semibold text-gray-800">{data?.date || label}</p>
            <p className="flex items-center gap-2 text-[#00a4a6]">
              <div className="size-2 rounded-full bg-[#00a4a6]"></div>
              Daily Sales: {formatCurrency(payload[0]?.value || 0)}
            </p>
            <p className="flex items-center gap-2 text-[#F2960F]">
              <div className="size-2 rounded-full bg-[#F2960F]"></div>
              Daily Purchases: {formatCurrency(payload[1]?.value || 0)}
            </p>
            {data && (
              <>
                <p className="mt-1 flex items-center gap-2 text-sm text-[#00a4a6]">
                  Cumulative Sales: {formatCurrency(data.cumulativeSale || 0)}
                </p>
                <p className="flex items-center gap-2 text-sm text-[#F2960F]">
                  Cumulative Purchases: {formatCurrency(data.cumulativePurchase || 0)}
                </p>
              </>
            )}
          </div>
        )
      }
      return null
    },
    [formatCurrency]
  )

  // Period options
  const periodOptions = [
    { value: "THIS_MONTH", label: "Month" },
    { value: "LAST_MONTH", label: "Last Month" },
    { value: "LAST_3_MONTHS", label: "3 Months" },
    { value: "LAST_6_MONTHS", label: "6 Months" },
    { value: "YEAR", label: "Year" },
  ]

  // Skeleton components
  const PulseSkeleton = ({ className = "" }: { className?: string }) => (
    <div className={`animate-pulse rounded bg-gray-200 ${className}`} />
  )

  const ChartSkeleton = () => (
    <div className="size-full">
      <PulseSkeleton className="size-full" />
    </div>
  )

  const ProgressBarSkeleton = () => (
    <div className="mb-4">
      <div className="mb-2 flex justify-between">
        <PulseSkeleton className="h-4 w-20" />
        <PulseSkeleton className="h-4 w-16" />
      </div>
      <PulseSkeleton className="h-2 w-full" />
      <div className="mt-1 flex justify-end">
        <PulseSkeleton className="h-3 w-8" />
      </div>
    </div>
  )

  const LowStockItemSkeleton = () => (
    <div className="flex w-full items-center justify-between py-3">
      <div className="flex items-center gap-2">
        <PulseSkeleton className="size-2 rounded-full" />
        <PulseSkeleton className="h-4 w-24" />
      </div>
      <div className="flex items-center gap-1">
        <PulseSkeleton className="size-4 rounded-full" />
        <PulseSkeleton className="h-4 w-12" />
      </div>
    </div>
  )

  const TopCategoryItemSkeleton = () => (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center gap-2">
        <PulseSkeleton className="size-2 rounded-full" />
        <PulseSkeleton className="h-4 w-20" />
      </div>
      <div className="flex items-center gap-3">
        <PulseSkeleton className="h-4 w-12" />
        <PulseSkeleton className="h-4 w-8" />
      </div>
    </div>
  )

  const ButtonSkeleton = () => <PulseSkeleton className="h-8 w-16 rounded" />

  // Progress bar component
  const ProgressBar = React.memo(function ProgressBar({
    percentage,
    color,
    label,
    count,
  }: {
    percentage: number
    color: string
    label: string
    count: number
  }) {
    return (
      <div className="mb-4">
        <div className="mb-1 flex justify-between text-sm">
          <span className="text-gray-600">{label}</span>
          <span className="font-medium">{count} orders</span>
        </div>
        <div className="h-2 w-full rounded-full bg-gray-200">
          <div
            className="h-full rounded-full"
            style={{
              width: `${percentage}%`,
              backgroundColor: color,
            }}
          />
        </div>
        <div className="mt-1 text-right text-xs text-gray-500">{percentage}%</div>
      </div>
    )
  })

  // Low stock item component
  const LowStockItem = React.memo(function LowStockItem({
    name,
    change,
    color,
  }: {
    name: string
    change: number
    color: string
  }) {
    return (
      <div className="flex w-full items-center justify-between py-3">
        <div className="flex items-center gap-2">
          <div className="size-2 rounded-full" style={{ backgroundColor: color }} />
          <p className="text-secondary">{name}</p>
        </div>
        <div className="flex items-center gap-1">
          {change < 0 ? <DownIcon /> : <UpIcon />}
          <p className={`text-secondary ${change < 0 ? "text-red-500" : "text-green-500"}`}>{change}%</p>
        </div>
      </div>
    )
  })

  // Top Selling Category component
  const TopCategoryItem = React.memo(function TopCategoryItem({
    name,
    change,
    percentage,
    quantity,
    color,
  }: {
    name: string
    change: number
    percentage: number
    quantity: number
    color: string
  }) {
    return (
      <div className="flex items-center justify-between py-2">
        <div className="flex items-center gap-2">
          <div className="size-2 rounded-full" style={{ backgroundColor: color }} />
          <span className="text-sm font-medium">{name}</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            {change < 0 ? <DownIcon className="size-3" /> : <UpIcon className="size-3" />}
            <span className={`text-xs ${change < 0 ? "text-red-500" : "text-green-500"}`}>
              {change > 0 ? "+" : ""}
              {change}%
            </span>
          </div>
          <span className="text-sm font-medium">{percentage}%</span>
          <span className="text-xs text-gray-500">{quantity}</span>
        </div>
      </div>
    )
  })

  return (
    <div className="flex w-full gap-3 max-lg:grid max-lg:grid-cols-1 max-sm:flex-col">
      <div className="flex w-full max-sm:flex-col">
        <div className="w-full">
          <div className="mb-3 flex w-full cursor-pointer gap-3 max-sm:flex-col">
            {/* Stock Levels Card */}
            <div className="small-card rounded-md p-2 transition duration-500 md:border">
              <div className="flex items-center gap-1 border-b pb-4 max-sm:mb-2">
                <TotalAssets />
                <div>Stock Levels</div>
              </div>
              <div className="h-[140px] w-full">
                {stockLevelsLoading ? (
                  <ChartSkeleton />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={stockLevelsData}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={60}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {stockLevelsData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="#fff" />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
              <div className="mt-4">
                {stockLevelsLoading ? (
                  <div className="flex flex-col gap-2">
                    {[1, 2, 3, 4].map((item) => (
                      <div key={item} className="flex w-full items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <PulseSkeleton className="size-3 rounded-full" />
                          <PulseSkeleton className="h-4 w-16" />
                        </div>
                        <PulseSkeleton className="h-4 w-8" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <ul className="flex flex-col gap-2">
                    {stockLevelsData.map((entry, index) => (
                      <li
                        key={`legend-${index}`}
                        className="flex w-full items-center justify-between gap-2 text-center text-sm"
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className="size-3 rounded-full"
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          />
                          <span className="text-gray-700">{entry.name}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-gray-500">{entry.count} items</span>
                          <span className="font-medium">{entry.value}%</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {/* Total Orders Card */}
            <div className="small-card rounded-md p-2 transition duration-500 md:border">
              <div className="flex w-full items-center justify-between gap-1 border-b pb-4 max-sm:mb-2">
                <div className="flex items-center gap-1">
                  <TransactionIcon />
                  <span className="text-grey-400">Total Orders</span>
                </div>
                {orderSummaryLoading ? (
                  <div className="flex items-center gap-1">
                    <PulseSkeleton className="size-4 rounded-full" />
                    <PulseSkeleton className="h-4 w-12" />
                    <PulseSkeleton className="ml-2 h-4 w-16" />
                  </div>
                ) : (
                  <div className="flex items-center gap-1">
                    {orderGrowthPercentage >= 0 ? <UpIcon /> : <DownIcon />}
                    <span className={`text-xs ${orderGrowthPercentage >= 0 ? "text-green-500" : "text-red-500"}`}>
                      {formatGrowthPercentage(orderGrowthPercentage)}
                    </span>
                    <div className="ml-2">
                      <p>{totalOrders} Orders</p>
                    </div>
                  </div>
                )}
              </div>
              <div className="flex flex-col justify-between pt-6">
                {orderSummaryLoading ? (
                  <>
                    <ProgressBarSkeleton />
                    <ProgressBarSkeleton />
                    <ProgressBarSkeleton />
                  </>
                ) : totalOrders > 0 ? (
                  orderStatusData.map((status) => (
                    <ProgressBar
                      key={status.status}
                      percentage={status.value}
                      color={status.color}
                      label={status.status}
                      count={status.count}
                    />
                  ))
                ) : (
                  <div className="py-4 text-center text-gray-500">No order data available</div>
                )}
              </div>
            </div>

            {/* Low Stocks Items Card */}
            <div className="small-card rounded-md p-2 transition duration-500 md:border">
              <div className="flex items-center justify-between gap-1 border-b pb-4 max-sm:mb-2">
                <div className="flex w-full items-center gap-1">
                  <TransactionIcon />
                  <span className="text-grey-400 ml-1">Low Stocks Items</span>
                </div>
                <div>
                  {lowStockAlertsLoading ? (
                    <ButtonSkeleton />
                  ) : (
                    <ButtonModule
                      type="submit"
                      variant="outline"
                      size="sm"
                      className="w-full"
                      icon={<ArrowIcon />}
                      iconPosition="end"
                    >
                      View
                    </ButtonModule>
                  )}
                </div>
              </div>
              <div className="">
                {lowStockAlertsLoading ? (
                  <>
                    <LowStockItemSkeleton />
                    <LowStockItemSkeleton />
                    <LowStockItemSkeleton />
                    <LowStockItemSkeleton />
                    <LowStockItemSkeleton />
                  </>
                ) : lowStockItems.length > 0 ? (
                  lowStockItems.map((item, index) => (
                    <LowStockItem key={index} name={item.name} change={item.change} color={item.color} />
                  ))
                ) : (
                  <div className="py-4 text-center text-gray-500">No low stock items</div>
                )}
              </div>
            </div>
          </div>

          {/* Second Row of Cards */}
          <div className="flex w-full cursor-pointer gap-3 max-sm:flex-col">
            {/* Sales & Purchase Trends Card - UPDATED WITH CORRECT DATA MAPPING */}
            <div className="small-card rounded-md p-2 transition duration-500 md:border">
              <div className="flex items-center justify-between border-b pb-4 max-sm:mb-2">
                <div className="flex items-center gap-2">
                  <AccountIcon />
                  <h3 className="font-medium">Sales & Purchase Trends</h3>
                </div>

                {/* Period Selector and Stats */}
                <div className="flex items-center gap-4">
                  {/* Period Selector */}
                  <div className="flex items-center gap-1 rounded-lg bg-gray-100 p-1">
                    {periodOptions.map((period) => (
                      <button
                        key={period.value}
                        className={`rounded-md px-2 py-1 text-xs transition-colors ${
                          currentPeriod === period.value
                            ? "bg-white text-gray-800 shadow-sm"
                            : "text-gray-600 hover:text-gray-800"
                        }`}
                        onClick={() => handlePeriodChange(period.value as any)}
                      >
                        {period.label}
                      </button>
                    ))}
                  </div>

                  {/* Stats Summary */}
                  {salesPurchaseGraphLoading ? (
                    <div className="flex items-center gap-2">
                      <PulseSkeleton className="h-4 w-16" />
                      <PulseSkeleton className="h-4 w-16" />
                    </div>
                  ) : (
                    <div className="flex items-center gap-4 text-xs">
                      <div className="flex items-center gap-1">
                        <div className="size-2 rounded-full bg-[#00a4a6]"></div>
                        <span>Total Sales: {formatCurrency(cumulativeTotals.totalSales)}</span>
                        {salesGrowth !== 0 && (
                          <span className={`${salesGrowth >= 0 ? "text-green-500" : "text-red-500"}`}>
                            {formatGrowthPercentage(salesGrowth)}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="size-2 rounded-full bg-[#F2960F]"></div>
                        <span>Total Purchases: {formatCurrency(cumulativeTotals.totalPurchases)}</span>
                        {purchasesGrowth !== 0 && (
                          <span className={`${purchasesGrowth >= 0 ? "text-green-500" : "text-red-500"}`}>
                            {formatGrowthPercentage(purchasesGrowth)}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Chart Area */}
              <div className="h-[250px] w-full pt-4">
                {salesPurchaseGraphLoading ? (
                  <ChartSkeleton />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                      <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#666" }} />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12, fill: "#666" }}
                        tickFormatter={(value) => {
                          if (value >= 1000000) return `₹${(value / 1000000).toFixed(1)}M`
                          if (value >= 1000) return `₹${(value / 1000).toFixed(1)}K`
                          return `₹${value}`
                        }}
                      />
                      <Tooltip content={<CustomBarTooltip />} />
                      <Bar dataKey="sales" fill="#00a4a6" radius={[4, 4, 0, 0]} barSize={20} name="Daily Sales" />
                      <Bar
                        dataKey="purchases"
                        fill="#F2960F"
                        radius={[4, 4, 0, 0]}
                        barSize={20}
                        name="Daily Purchases"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>

              {/* Summary Stats */}
              {!salesPurchaseGraphLoading && salesPurchaseGraphData && (
                <div className="mt-4 grid grid-cols-3 gap-4 border-t pt-4">
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Total Sales</p>
                    <p className="text-lg font-semibold text-[#00a4a6]">
                      {formatCurrency(cumulativeTotals.totalSales)}
                    </p>
                    {salesGrowth !== 0 && (
                      <p className={`text-xs ${salesGrowth >= 0 ? "text-green-500" : "text-red-500"}`}>
                        {formatGrowthPercentage(salesGrowth)}
                      </p>
                    )}
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Total Purchases</p>
                    <p className="text-lg font-semibold text-[#F2960F]">
                      {formatCurrency(cumulativeTotals.totalPurchases)}
                    </p>
                    {purchasesGrowth !== 0 && (
                      <p className={`text-xs ${purchasesGrowth >= 0 ? "text-green-500" : "text-red-500"}`}>
                        {formatGrowthPercentage(purchasesGrowth)}
                      </p>
                    )}
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Total Profit</p>
                    <p className="text-lg font-semibold text-[#EB2426]">
                      {formatCurrency(cumulativeTotals.totalSales - cumulativeTotals.totalPurchases)}
                    </p>
                    {profitGrowth !== 0 && (
                      <p className={`text-xs ${profitGrowth >= 0 ? "text-green-500" : "text-red-500"}`}>
                        {formatGrowthPercentage(profitGrowth)}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Top Selling Categories Card */}
            <div className="small-card-two rounded-md p-2 transition duration-500 md:border">
              <div className="flex w-full items-center justify-between gap-1 border-b pb-4 max-sm:mb-2">
                <div className="flex items-center gap-2">
                  <CustomerIcon />
                  <p className="font-medium">Top Selling Categories</p>
                </div>
                <div>
                  {topSellingCategoriesLoading ? (
                    <ButtonSkeleton />
                  ) : (
                    <ButtonModule
                      type="submit"
                      variant="outline"
                      size="sm"
                      className="w-full"
                      icon={<ArrowIcon />}
                      iconPosition="end"
                    >
                      View
                    </ButtonModule>
                  )}
                </div>
              </div>

              {/* Pie Chart */}
              <div className="h-[140px] w-full py-2">
                {topSellingCategoriesLoading ? (
                  <ChartSkeleton />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={topCategories.map((cat) => ({
                          name: cat.name,
                          value: cat.percentage,
                          color: cat.color,
                        }))}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={60}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {topCategories.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} stroke="#fff" />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>

              {/* Categories List */}
              <div className="">
                {topSellingCategoriesLoading ? (
                  <>
                    <TopCategoryItemSkeleton />
                    <TopCategoryItemSkeleton />
                    <TopCategoryItemSkeleton />
                    <TopCategoryItemSkeleton />
                  </>
                ) : topCategories.length > 0 ? (
                  topCategories.map((category, index) => (
                    <TopCategoryItem
                      key={index}
                      name={category.name}
                      change={category.change}
                      percentage={category.percentage}
                      quantity={category.quantity}
                      color={category.color}
                    />
                  ))
                ) : (
                  <div className="py-4 text-center text-gray-500">No category data available</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OverviewCard
