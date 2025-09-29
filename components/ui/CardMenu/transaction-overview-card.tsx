import React from "react"
import TotalAssets from "public/total-assets"
import UpIcon from "public/Icons/up-icon"
import DownIcon from "public/Icons/down-icon"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

const TransactionsOverviewCard = () => {
  // --- 1) Seasonal Demands Data ---
  const seasonalDemandsData = [
    { month: "Jan", All: 35000, Allergy: 25000, Flu: 20000 },
    { month: "Feb", All: 62000, Allergy: 40000, Flu: 48000 },
    { month: "Mar", All: 52000, Allergy: 45000, Flu: 28000 },
    { month: "Apr", All: 85000, Allergy: 70000, Flu: 55000 },
    { month: "May", All: 32000, Allergy: 24000, Flu: 15000 },
    { month: "Jun", All: 65000, Allergy: 50000, Flu: 35000 },
    { month: "Jul", All: 42000, Allergy: 33000, Flu: 20000 },
    { month: "Aug", All: 75000, Allergy: 62000, Flu: 48000 },
    { month: "Sep", All: 52000, Allergy: 42000, Flu: 28000 },
    { month: "Oct", All: 82000, Allergy: 70000, Flu: 55000 },
    { month: "Nov", All: 31000, Allergy: 25000, Flu: 15000 },
    { month: "Dec", All: 64000, Allergy: 50000, Flu: 38000 },
  ]

  // --- 2) Prescription vs. OTC Sales Data ---
  const rxOtcData = [
    {
      name: "Prescription-Based Sales",
      value: 65,
      change: 5.0,
      color: "#00a4a6",
    },
    {
      name: "Over-the-Counter (OTC) Sales",
      value: 35,
      change: -3.0,
      color: "#F2960F",
    },
  ]

  // --- 3) Low Stock Items Data ---
  const lowStockItems = [
    { name: "Insulin Pen", change: -5.0, color: "#B1EEE2" },
    { name: "Vitamin C", change: -12.3, color: "#B1EEE2" },
    { name: "Vitamin B", change: -8.2, color: "#B1EEE2" },
    { name: "Amoxicillin", change: -3.7, color: "#B1EEE2" },
    { name: "Ibuprofen", change: -6.5, color: "#B1EEE2" },
  ]

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

  return (
    <div className="flex w-full gap-3 max-lg:grid max-lg:grid-cols-1 max-sm:flex-col">
      {/* ===== Seasonal Demands Card ===== */}
      <div className="small-card rounded-md p-2 transition duration-500 md:border">
        <div className="flex items-center gap-1 border-b pb-4 max-sm:mb-2">
          <TotalAssets />
          <div>Seasonal Demands</div>
        </div>
        <div className="pt-6">
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={seasonalDemandsData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(val) => `${val / 1000}K`} />
                <Tooltip formatter={(val: number) => val.toLocaleString()} />
                <Legend verticalAlign="top" align="right" />
                <Bar dataKey="All" name="All" fill="#1c232b" />
                <Bar dataKey="Allergy" name="Allergy" fill="#999999" />
                <Bar dataKey="Flu" name="Flu" fill="#F2960F" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ===== Prescription vs. OTC Sales Card ===== */}
      <div className="small-card rounded-md p-2 transition duration-500 md:border">
        <div className="flex items-center gap-1 border-b pb-4 max-sm:mb-2">
          <TotalAssets />
          <div>Prescription vs. OTC Sales</div>
        </div>
        <div className="pt-6">
          <div className="h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={rxOtcData}
                  cx="50%"
                  cy="50%"
                  innerRadius={0}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {rxOtcData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="#fff" />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 flex flex-col gap-3">
            {rxOtcData.map((entry, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="inline-block h-3 w-3 rounded-full" style={{ backgroundColor: entry.color }} />
                  <span className="text-sm">{entry.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`flex items-center gap-1 ${entry.change > 0 ? "text-green-500" : "text-red-500"}`}>
                    {entry.change > 0 ? <UpIcon /> : <DownIcon />}
                    {Math.abs(entry.change).toFixed(1)}%
                  </span>
                  <span className="font-bold">{entry.value}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ===== Low Stock Items Card ===== */}
      <div className="small-card rounded-md p-2 transition duration-500 md:border">
        <div className="flex items-center gap-1 border-b pb-4 max-sm:mb-2">
          <TotalAssets />
          <div>Prescription vs. OTC Sales</div>
        </div>
        <div className="pt-6">
          <div className="h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={rxOtcData}
                  cx="50%"
                  cy="50%"
                  innerRadius={0}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {rxOtcData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="#fff" />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 flex flex-col gap-3">
            {rxOtcData.map((entry, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="inline-block h-3 w-3 rounded-full" style={{ backgroundColor: entry.color }} />
                  <span className="text-sm">{entry.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`flex items-center gap-1 ${entry.change > 0 ? "text-green-500" : "text-red-500"}`}>
                    {entry.change > 0 ? <UpIcon /> : <DownIcon />}
                    {Math.abs(entry.change).toFixed(1)}%
                  </span>
                  <span className="font-bold">{entry.value}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default TransactionsOverviewCard
