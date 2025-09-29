import InvoiceIcon from "public/Icons/invoice-icon"
import UpIcon from "public/Icons/up-icon"
import React from "react"

const InvoicesMenu = () => {
  return (
    <div className="mb-3 flex w-full cursor-pointer gap-3 max-sm:flex-col">
      <div className="small-card rounded-md p-2 transition duration-500 md:border">
        <div className="flex items-center gap-2   max-sm:mb-2">
          <InvoiceIcon />
          <div className="w-full">
            <span className="text-grey-400 ">Total Invoices Issued </span>
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
          <InvoiceIcon />
          <div className="w-full">
            <span className="text-grey-400 ">Total Amount Invoiced</span>
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
        <div className="flex items-center gap-2   max-sm:mb-2">
          <InvoiceIcon />
          <div className="w-full">
            <span className="text-grey-400 ">Pending Payments </span>
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
          <InvoiceIcon />
          <div className="w-full">
            <span className="text-grey-400 ">Total Receipts Generated </span>
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

export default InvoicesMenu
