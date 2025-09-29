import DownIcon from "public/Icons/down-icon"
import TotalRevenue from "public/Icons/total-revenue-icon"
import TotalVolumeIcon from "public/Icons/total-volume-icon"
import UpIcon from "public/Icons/up-icon"
import React from "react"
import ProfitMarginsIcon from "../../../public/Icons/profit-margins-icon"
import PromotionImpactIcon from "public/Icons/promotions-impact-icon"

const RefundReportCard = () => {
  return (
    <div className="mb-3 flex w-full cursor-pointer gap-3 max-sm:flex-col">
      <div className="small-card rounded-md p-2 transition duration-500 md:border">
        <div className="flex items-center gap-2   max-sm:mb-2">
          <TotalRevenue />
          <div className="w-full">
            <span className="text-grey-400 ">Total Returns </span>
            <div className="flex w-full  justify-between">
              <p>120</p>
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
            <span className="text-grey-400 ">Total Refund Issued </span>
            <div className="flex w-full  justify-between">
              <p>
                <span className="text-grey-400">₹</span>1,500
              </p>
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
            <span className="text-grey-400 ">Most Returned Product </span>
            <div className="flex w-full  justify-between">
              <p>Pills</p>
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
            <span className="text-grey-400 ">Return Rate </span>
            <div className="flex w-full  justify-between">
              <p>10%</p>
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

export default RefundReportCard
