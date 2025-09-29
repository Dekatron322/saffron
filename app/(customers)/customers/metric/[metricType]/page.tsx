// app/customers/metric/[metricType]/page.tsx
import { Metadata } from "next"
import { notFound } from "next/navigation"
import MetricCustomersPage from "./MetricCustomersPage"

interface PageProps {
  params: {
    metricType: string
  }
}

const metricTitles: Record<string, string> = {
  "total-registered": "Total Registered Customers",
  "new-customers": "New Customers",
  "active-customers": "Active Customers",
  "subscribed-customers": "Subscribed Customers",
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const title = metricTitles[params.metricType] || "Customers"
  return {
    title: `${title} | Your App Name`,
  }
}

export default function Page({ params }: PageProps) {
  const { metricType } = params
  const title = metricTitles[metricType]

  if (!title) {
    return notFound()
  }

  return <MetricCustomersPage metricType={metricType} title={title} />
}
