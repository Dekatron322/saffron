import TotalAssets from "public/total-assets"
import TransactionIcon from "public/transaction-icon"
import React from "react"
import { ButtonModule } from "../Button/Button"
import CustomerIcon from "public/customer-icon"
import AccountIcon from "public/accounts-icon"
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts"
import UpIcon from "public/Icons/up-icon"
import DownIcon from "public/Icons/down-icon"
import ArrowIcon from "public/Icons/arrowIcon"

const OverviewCard = () => {
  // Stock Levels Data
  const stockLevelsData = [
    { name: "In Stock", value: 54.1 },
    { name: "Low Stock", value: 18.8 },
    { name: "Expired", value: 10.0 },
    { name: "Out of Stock", value: 10.9 },
  ]

  // Order Status Data
  const orderStatusData = [
    { status: "Completed", value: 65, count: 809, color: "#00a4a6" },
    { status: "Pending", value: 25, count: 312, color: "#F2960F" },
    { status: "Cancelled", value: 10, count: 124, color: "#EB2426" },
  ]

  // Low Stock Items Data
  const lowStockItems = [
    { name: "Insulin Pen", change: -5.0, color: "#B1EEE2" },
    { name: "Vitamin C", change: -12.3, color: "#B1EEE2" },
    { name: "Vitamin B", change: -8.2, color: "#B1EEE2" },
    { name: "Amoxicillin", change: -3.7, color: "#B1EEE2" },
    { name: "Ibuprofen", change: -6.5, color: "#B1EEE2" },
  ]

  // Sales & Purchase Trends Data
  const salesData = [
    { week: "Wk 1", sales: 12000, purchases: 8000 },
    { week: "Wk 2", sales: 19000, purchases: 12000 },
    { week: "Wk 3", sales: 30000, purchases: 18000 },
    { week: "Wk 4", sales: 25000, purchases: 22000 },
    { week: "Wk 5", sales: 18000, purchases: 15000 },
  ]

  // Top Selling Categories Data
  const topCategories = [
    { name: "Pharma", change: 5.0, percentage: 60, color: "#00a4a6" },
    { name: "Generic", change: -3.0, percentage: 5, color: "#F2960F" },
    { name: "Food Related items", change: -6.0, percentage: 20, color: "#EB2426" },
    { name: "General", change: -1.0, percentage: 5, color: "#9E9E9E" },
  ]

  // Color scheme for stock levels
  const COLORS = ["#00a4a6", "#B1EEE2", "#F2960F", "#EB242699"]

  // Custom legend formatter for stock levels
  const renderLegend = (props: any) => {
    const { payload } = props
    return (
      <ul className="flex flex-col gap-2">
        {payload.map((entry: any, index: number) => {
          const dataItem = stockLevelsData.find((item) => item.name === entry.value)
          return (
            <li key={`legend-${index}`} className="flex items-center gap-2 text-sm">
              <div className="h-3 w-3 rounded-full" style={{ backgroundColor: entry.color }} />
              <span className="text-gray-700">{entry.value}</span>
              <span className="font-medium">{dataItem?.value}%</span>
            </li>
          )
        })}
      </ul>
    )
  }

  // Progress bar component
  const ProgressBar = ({
    percentage,
    color,
    label,
    count,
  }: {
    percentage: number
    color: string
    label: string
    count: number
  }) => (
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

  // Low stock item component
  const LowStockItem = ({ name, change, color }: { name: string; change: number; color: string }) => (
    <div className="flex w-full items-center justify-between py-3">
      <div className="flex items-center gap-2">
        <div className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
        <p className="text-secondary">{name}</p>
      </div>
      <div className="flex items-center gap-1">
        {change < 0 ? <DownIcon /> : <UpIcon />}
        <p className={`text-secondary ${change < 0 ? "text-red-500" : "text-green-500"}`}>{change}%</p>
      </div>
    </div>
  )

  // Top Selling Category component
  const TopCategoryItem = ({
    name,
    change,
    percentage,
    color,
  }: {
    name: string
    change: number
    percentage: number
    color: string
  }) => (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center gap-2">
        <div className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
        <span className="text-sm font-medium">{name}</span>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1">
          {change < 0 ? <DownIcon className="h-3 w-3" /> : <UpIcon className="h-3 w-3" />}
          <span className={`text-xs ${change < 0 ? "text-red-500" : "text-green-500"}`}>
            {change > 0 ? "+" : ""}
            {change}%
          </span>
        </div>
        <span className="text-sm font-medium">{percentage}%</span>
      </div>
    </div>
  )

  // Custom tooltip for line chart
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded bg-white p-2 shadow-md">
          <p className="font-semibold">{label}</p>
          <p className="text-[#00a4a6]">Sales: {payload[0].value.toLocaleString()}</p>
          <p className="text-[#F2960F]">Purchases: {payload[1].value.toLocaleString()}</p>
        </div>
      )
    }
    return null
  }

  // Custom legend for pie chart
  const renderPieLegend = (props: any) => {
    const { payload } = props
    return (
      <ul className="flex flex-wrap justify-center gap-2">
        {payload.map((entry: any, index: number) => (
          <li key={`legend-${index}`} className="flex items-center gap-1 text-xs">
            <div className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
            <span>{entry.value}%</span>
          </li>
        ))}
      </ul>
    )
  }

  // Prepare data for pie chart
  const pieData = topCategories.map((category) => ({
    name: category.name,
    value: category.percentage,
    color: category.color,
  }))

  return (
    <div className="flex w-full gap-3 max-lg:grid max-lg:grid-cols-1 max-sm:flex-col">
      <div className="flex w-full max-sm:flex-col">
        <div className="w-full">
          <div className="mb-3 flex w-full cursor-pointer gap-3 max-sm:flex-col">
            {/* Stock Levels Card with Pie Chart */}
            <div className="small-card hidden rounded-md p-2 transition duration-500 md:border 2xl:block">
              <div className="flex items-center gap-1 border-b pb-4 max-sm:mb-2">
                <TotalAssets />
                <div>Stock Levels</div>
              </div>
              <div className="flex items-end justify-between pt-6">
                <div className="h-[220px] w-full md:hidden 2xl:block">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={stockLevelsData}
                        cx="50%"
                        cy="50%"
                        innerRadius={70}
                        outerRadius={90}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {stockLevelsData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="#fff" />
                        ))}
                      </Pie>
                      <Legend content={renderLegend} layout="vertical" verticalAlign="middle" align="right" />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
            {/* Stock Levels Card with Pie Chart */}
            <div className="small-card rounded-md p-2 transition duration-500 md:border 2xl:hidden">
              <div className="flex items-center gap-1 border-b pb-4 max-sm:mb-2">
                <TotalAssets />
                <div>Stock Levels</div>
              </div>

              {/* Chart on Top */}
              <div className="h-[140px] w-full">
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
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Legend/Content Below */}
              <div className="mt-4">
                <ul className="flex flex-col gap-2">
                  {stockLevelsData.map((entry, index) => (
                    <li
                      key={`legend-${index}`}
                      className="flex w-full items-center justify-between gap-2 text-center text-sm"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="text-gray-700">{entry.name}</span>
                      </div>
                      <span className="font-medium">{entry.value}%</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Total Orders Card with Progress Bars */}
            <div className="small-card rounded-md p-2 transition duration-500 md:border">
              <div className="flex w-full items-center justify-between gap-1 border-b pb-4 max-sm:mb-2">
                <div className="flex items-center gap-1">
                  <TransactionIcon />
                  <span className="text-grey-400">Total Orders</span>
                </div>
                <div className="flex items-center gap-1">
                  <UpIcon />
                  <span className="text-xs">+15.00%</span>
                  <div className="ml-2">
                    <p>1,245 Orders</p>
                  </div>
                </div>
              </div>
              <div className="flex flex-col justify-between pt-6">
                {orderStatusData.map((status) => (
                  <ProgressBar
                    key={status.status}
                    percentage={status.value}
                    color={status.color}
                    label={status.status}
                    count={status.count}
                  />
                ))}
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
                </div>
              </div>
              <div className="">
                {lowStockItems.map((item, index) => (
                  <LowStockItem key={index} name={item.name} change={item.change} color={item.color} />
                ))}
              </div>
            </div>
          </div>

          {/* Second Row of Cards */}
          <div className="flex w-full cursor-pointer gap-3 max-sm:flex-col">
            {/* Sales & Purchase Trends Card */}
            <div className="small-card rounded-md p-2 transition duration-500 md:border">
              <div className="flex items-center justify-between border-b pb-4 max-sm:mb-2">
                <div className="flex items-center gap-2">
                  <AccountIcon />
                  <h3 className="font-medium">Sales & Purchase Trends</h3>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <div className="h-2 w-2 rounded-full bg-[#00a4a6]"></div>
                    <span className="text-xs">Sales</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="h-2 w-2 rounded-full bg-[#F2960F]"></div>
                    <span className="text-xs">Purchases</span>
                  </div>
                  <span className="ml-2 text-xs text-gray-500">This Month</span>
                </div>
              </div>
              <div className="h-[250px] w-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={salesData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => `${value / 1000}K`}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Line
                      type="monotone"
                      dataKey="sales"
                      stroke="#00a4a6"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="purchases"
                      stroke="#F2960F"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Top Selling Categories Card */}
            <div className="small-card-two rounded-md p-2 transition duration-500 md:border">
              <div className="flex w-full items-center justify-between gap-1 border-b pb-4 max-sm:mb-2">
                <div className="flex items-center gap-2">
                  <CustomerIcon />
                  <p className="font-medium">Top Selling Categories</p>
                </div>
                <div>
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
                </div>
              </div>

              {/* Pie Chart */}
              <div className="h-[140px] w-full py-2">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={60}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} stroke="#fff" />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Categories List */}
              <div className="">
                {topCategories.map((category, index) => (
                  <TopCategoryItem
                    key={index}
                    name={category.name}
                    change={category.change}
                    percentage={category.percentage}
                    color={category.color}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OverviewCard
