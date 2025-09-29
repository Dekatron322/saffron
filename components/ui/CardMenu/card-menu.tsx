import CardIcon from "public/Icons/card-icon"
import GrowthRate from "public/Icons/growth-rate"
import StockIcons from "public/Icons/stock-icon"
import TotalIcon from "public/Icons/total-icon"
import UpIcon from "public/Icons/up-icon"
import TotalAssets from "public/total-assets"
import TransactionIcon from "public/transaction-icon"
import React from "react"

const CardMenu = () => {
  return (
    <div className="mb-3 flex w-full cursor-pointer gap-3 max-sm:flex-col">
      <div className="small-card rounded-md p-2 transition duration-500 md:border">
        <div className="flex items-center gap-2   max-sm:mb-2">
          <CardIcon />
          <div className="w-full">
            <span className="text-grey-400 max-xl:text-sm">Total Sales </span>
            <div className="flex w-full justify-between  max-xl:text-sm">
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
        <div className="flex items-center gap-1   max-sm:mb-2">
          <TotalIcon />
          <div className="w-full max-xl:text-sm">
            <span className="text-grey-400 ">Total Purchases </span>
            <div className="flex w-full  justify-between">
              <p>45,000</p>
              <div className="flex items-center gap-1">
                <UpIcon />
                <p>+15.00%</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="small-card rounded-md p-2 transition duration-500 md:border">
        <div className="flex items-center gap-1   max-sm:mb-2">
          <StockIcons />
          <div className="w-full max-xl:text-sm">
            <span className="text-grey-400 ">Total Stock Available </span>
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
        <div className="flex items-center gap-1   max-sm:mb-2">
          <GrowthRate />
          <div className="w-full max-xl:text-sm">
            <span className="text-grey-400 ">Sales Growth Rate </span>
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

export default CardMenu
