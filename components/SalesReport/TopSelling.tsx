"use client"
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  ChartOptions,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
} from "chart.js"
import { Chart } from "react-chartjs-2"
import { ChartData } from "chart.js"
import ProductSalesTable from "components/Tables/ProductSalesTable"

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend)

export default function TopSelling() {
  const chartData: ChartData<"bar" | "line", number[], string> = {
    labels: [
      "Paracetamol",
      "Vitamin C Gummies",
      "Herbal Tea",
      "Amootetilin",
      "Ibuprofen",
      "Sanitary Pad",
      "Diagers",
      "Blood Tonic",
      "Vitamin D Complex",
      "Sleeping Pills",
    ],
    datasets: [
      {
        type: "bar" as const,
        label: "Total Revenue ($)",
        data: [50000, 40000, 30000, 28000, 25000, 22000, 20000, 18000, 15000, 10000],
        backgroundColor: "#F2960F",
        borderRadius: {
          topLeft: 10,
          topRight: 10,
          bottomLeft: 0,
          bottomRight: 0,
        },
        borderSkipped: false,
        order: 1,
      },
      {
        type: "line" as const,
        label: "Revenue Trend",
        data: [50000, 40000, 30000, 28000, 25000, 22000, 20000, 18000, 15000, 10000],
        borderColor: "#00a4a6",
        backgroundColor: "#00a4a6",
        borderWidth: 2,
        tension: 0.4,
        pointStyle: "circle",
        pointRadius: 6,
        pointHoverRadius: 8,
        pointBackgroundColor: "#00a4a6",
        pointBorderColor: "#fff",
        fill: false,
        borderDash: [6, 4],
        order: 2,
      },
    ],
  }

  const chartOptions: ChartOptions<"bar" | "line"> = {
    responsive: true,
    maintainAspectRatio: false,
    layout: { padding: 20 },
    plugins: {
      legend: {
        display: true,
        position: "top" as const,
        labels: {
          usePointStyle: true,
          padding: 20,
        },
      },
      title: {
        display: true,
        text: "Sales Performance Chart",
        font: { size: 18 },
        padding: { top: 10, bottom: 20 },
      },
      tooltip: {
        enabled: true,
        mode: "index",
        intersect: false,
        callbacks: {
          label: (context) => {
            const label = context.dataset.label || ""
            const value = context.parsed.y
            return context.dataset.type === "bar"
              ? `${label}: $${value.toLocaleString()}`
              : `${label}: ${value.toLocaleString()}`
          },
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { autoSkip: false },
      },
      y: {
        beginAtZero: true,
        grid: { display: true },
        ticks: {
          stepSize: 10000,
          callback: (value) => "$" + Number(value).toLocaleString(),
        },
        title: {
          display: true,
          text: "Total Revenue",
          font: { weight: "bold" },
        },
      },
    },
  }

  return (
    <section className="h-auto w-full bg-[#F4F9F8]">
      <div className="flex min-h-screen w-full">
        <div className="flex w-full flex-col">
          <div className="flex flex-col">
            <div className="max-sm-my-4 flex w-full gap-6 max-md:flex-col">
              <div className="w-full">
                <div className="mb-4 mt-6 rounded-lg bg-white p-6 shadow-sm">
                  <div className="h-[500px]">
                    <Chart type="bar" data={chartData} options={chartOptions} />
                  </div>
                </div>

                <ProductSalesTable />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
