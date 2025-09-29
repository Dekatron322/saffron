import CardIcon from "public/Icons/card-icon"
import DownIcon from "public/Icons/down-icon"
import GrowthRate from "public/Icons/growth-rate"
import StockIcons from "public/Icons/stock-icon"
import TotalIcon from "public/Icons/total-icon"
import TotalRevenue from "public/Icons/total-revenue-icon"
import TotalVolumeIcon from "public/Icons/total-volume-icon"
import UpIcon from "public/Icons/up-icon"
import TotalAssets from "public/total-assets"
import TransactionIcon from "public/transaction-icon"
import React from "react"
import ProfitMarginsIcon from "../../../public/Icons/profit-margins-icon"
import PromotionImpactIcon from "public/Icons/promotions-impact-icon"

const SalesReportCard = () => {
  return (
    <div className="mb-3 flex w-full cursor-pointer gap-3 max-sm:flex-col">
      <div className="small-card rounded-md p-2 transition duration-500 md:border">
        <div className="flex items-center gap-2   max-sm:mb-2">
          <TotalRevenue />
          <div className="w-full">
            <span className="text-grey-400 ">Total Sales Revenue </span>
            <div className="flex w-full  justify-between">
              <p>70,000</p>
              <div className="flex items-center gap-1">
                <UpIcon />
                <p>+15.00%</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="small-card rounded-md p-2 transition duration-500 md:border">
        <div className="flex items-center gap-2   max-sm:mb-2">
          <TotalVolumeIcon />
          <div className="w-full">
            <span className="text-grey-400 ">Total Sales Volume </span>
            <div className="flex w-full  justify-between">
              <p>45,000</p>
              <div className="flex items-center gap-1">
                <DownIcon />
                <p>-15.00%</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="small-card rounded-md p-2 transition duration-500 md:border">
        <div className="flex items-center gap-2   max-sm:mb-2">
          <ProfitMarginsIcon />
          <div className="w-full">
            <span className="text-grey-400 ">Profit Margins </span>
            <div className="flex w-full  justify-between">
              <p>17,500</p>
              <div className="flex items-center gap-1">
                <UpIcon />
                <p>+15.00%</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="small-card rounded-md p-2 transition duration-500 md:border">
        <div className="flex items-center gap-2   max-sm:mb-2">
          <PromotionImpactIcon />
          <div className="w-full">
            <span className="text-grey-400 ">Promotion Impact </span>
            <div className="flex w-full  justify-between">
              <p>70%</p>
              <div className="flex items-center gap-1">
                <UpIcon />
                <p>+15.00%</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Additional small cards can be similarly defined... */}
    </div>
  )
}

export default SalesReportCard
