"use client"
import React, { useEffect, useState } from "react"

interface ExchangeRate {
  pair: string
  rate: number
}

interface ExchangeRateApiResponse {
  conversion_rates: {
    USD: number
    NGN: number
    EUR: number
    GBP: number
    // Add other currencies you might use
  }
}

export const ExchangeRateMarquee: React.FC = () => {
  const [rates, setRates] = useState<ExchangeRate[]>([])
  const [loading, setLoading] = useState(true)
  const API_KEY = process.env.NEXT_PUBLIC_EXCHANGE_RATE_API_KEY

  const API_URL = `https://v6.exchangerate-api.com/v6/a3ff4f2f6ad29b9573a09b18/latest/USD`

  const fetchRates = async () => {
    try {
      const response = await fetch(API_URL)
      if (!response.ok) {
        throw new Error("Network response was not ok")
      }
      const data = (await response.json()) as ExchangeRateApiResponse

      const newRates: ExchangeRate[] = [
        { pair: "USD/NGN", rate: data.conversion_rates.NGN },
        {
          pair: "EUR/NGN",
          rate: Number(
            ((data.conversion_rates.EUR * data.conversion_rates.NGN) / data.conversion_rates.USD).toFixed(2)
          ),
        },
        {
          pair: "GBP/NGN",
          rate: Number(
            ((data.conversion_rates.GBP * data.conversion_rates.NGN) / data.conversion_rates.USD).toFixed(2)
          ),
        },
        // Add more pairs if required
      ]
      setRates(newRates)
      setLoading(false)
    } catch (error) {
      console.error("Error fetching exchange rates:", error)
      setLoading(false)
    }
  }

  // Fetch rates on mount and refresh them periodically (e.g., every minute)
  useEffect(() => {
    fetchRates()
    const interval = setInterval(() => {
      fetchRates()
    }, 60000) // refresh every 60 seconds

    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div className="relative w-1/2 overflow-hidden rounded-md bg-gray-50 p-2">
        <div className="absolute inset-y-0 left-0 z-10 w-8 bg-gradient-to-r from-gray-50 to-transparent"></div>
        <div className="absolute inset-y-0 right-0 z-10 w-8 bg-gradient-to-l from-gray-50 to-transparent"></div>
        <div className="animate-marquee flex space-x-4">
          <span className="mx-4 inline-block h-6 w-24 animate-pulse rounded bg-gray-300" />
          <span className="mx-4 inline-block h-6 w-24 animate-pulse rounded bg-gray-300" />
          <span className="mx-4 inline-block h-6 w-24 animate-pulse rounded bg-gray-300" />
          <span className="mx-4 inline-block h-6 w-24 animate-pulse rounded bg-gray-300" />
          <span className="mx-4 inline-block h-6 w-24 animate-pulse rounded bg-gray-300" />
          <span className="mx-4 inline-block h-6 w-24 animate-pulse rounded bg-gray-300" />
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-1/2 overflow-hidden rounded-md bg-gray-50 p-2">
      {/* Left blur effect */}
      <div className="absolute inset-y-0 left-0 z-10 w-40 bg-gradient-to-r from-gray-50 to-transparent"></div>

      {/* Right blur effect */}
      <div className="absolute inset-y-0 right-0 z-10 w-52  bg-gradient-to-l from-gray-50 to-transparent"></div>

      <div className="animate-marquee inline-block whitespace-nowrap">
        {rates.concat(rates).map((item, index) => (
          <span key={index} className="mx-4">
            {item.pair}: {item.rate.toFixed(2)}
          </span>
        ))}
      </div>
      <style jsx>{`
        @keyframes marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-marquee {
          display: inline-block;
          animation: marquee 20s linear infinite;
        }
      `}</style>
    </div>
  )
}

export default ExchangeRateMarquee
