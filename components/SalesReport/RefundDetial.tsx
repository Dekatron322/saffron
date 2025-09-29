import AllTransactionTable from "components/Tables/AllAccountsTable"
import RefundedItemsTable from "components/Tables/RefundedItemsTable"
import { ButtonModule } from "components/ui/Button/Button"
import ExportIcon from "public/export-icon"
import React from "react"

const RefundDetial = () => {
  return (
    <div className="flex w-full flex-col gap-4 rounded-md bg-white p-4">
      <div className="flex w-full items-center justify-between">
        <h1 className="text-lg font-semibold">Refund Summary</h1>
        <ButtonModule
          variant="black"
          size="md"
          icon={<ExportIcon />}
          iconPosition="end"
          onClick={() => alert("Export clicked")}
        >
          <p className="max-sm:hidden">Export</p>
        </ButtonModule>
      </div>
      <div className="flex flex-col gap-2">
        <div className="flex items-center ">
          <p className="text-grey-400 w-[200px]">Refund ID:</p>
          <p className="text-secondary">REF-20250328-001</p>
        </div>
        <div className="flex items-center ">
          <p className="text-grey-400 w-[200px]">Request Date:</p>
          <p className="text-secondary">March 28, 2025</p>
        </div>
        <div className="flex items-center ">
          <p className="text-grey-400 w-[200px]">Processed Date:</p>
          <p className="text-secondary">March 30, 2025</p>
        </div>
        <div className="flex items-center ">
          <p className="text-grey-400 w-[200px]">Refund Status:</p>
          <p className="text-secondary">Pending</p>
        </div>
      </div>
      <div className="flex w-2/3 justify-between">
        <div>
          <p className="my-4 text-lg font-semibold">Customer Information</p>
          <div className="mb-2 flex w-full items-start">
            <p className="text-grey-400 w-[200px]">Customer Name:</p>
            <p className="text-secondary ">John Doe</p>
          </div>
          <div className="mb-2 flex justify-between">
            <p className="text-grey-400 w-[200px]">Contact Info:</p>
            <p className="text-secondary">john.doe@email.com / +1234567890</p>
          </div>
          <div className="flex w-full items-start ">
            <p className="text-grey-400 w-[200px]">Purchase History:</p>
            <a href="" className="text-primary hover:underline">
              View Past Orders
            </a>
          </div>
        </div>
        <div>
          <p className="my-4 text-lg font-semibold">Order Information</p>
          <div className="mb-2 flex w-full items-start">
            <p className="text-grey-400 w-[200px]">Order ID:</p>
            <p className="text-secondary ">ORD-20250325-045</p>
          </div>
          <div className="j mb-2 flex">
            <p className="text-grey-400 w-[200px]">Purchase Date:</p>
            <p className="text-secondary">March 25, 2025</p>
          </div>
          <div className="flex w-full items-start ">
            <p className="text-grey-400 w-[200px]">Total Order Amount:</p>
            <p className="text-secondary">₹120.00</p>
          </div>
        </div>
      </div>
      <RefundedItemsTable />
      <div className="flex w-2/3 justify-between">
        <div>
          <p className="my-4 text-lg font-semibold">Refund Payment Details</p>
          <div className="mb-2 flex w-full items-start">
            <p className="text-grey-400 w-[300px]">Original Payment Method:</p>
            <p className="text-secondary ">Credit Card</p>
          </div>
          <div className="mb-2 flex w-full">
            <p className="text-grey-400 w-[300px]">Refund Amount:</p>
            <p className="text-secondary">₹18.00</p>
          </div>
          <div className="mb-2 flex w-full items-start ">
            <p className="text-grey-400 w-[300px]">Refund Method:</p>
            <p className="text-secondary">Reversal to Card</p>
          </div>
          <div className="flex w-full items-start ">
            <p className="text-grey-400 w-[300px]">Transaction ID:</p>
            <p className="text-secondary">TXN-987654321</p>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor="refundNotes" className="text-lg font-semibold">
          Admin Remarks
        </label>
        <textarea
          id="refundNotes"
          className="focus:border-primary focus:ring-primary w-full  rounded-md border border-gray-300 p-3 transition-colors duration-200 hover:border-[#00a4a6] focus:outline-none focus:ring-2 focus:ring-[#00a4a6]"
          rows={4}
          placeholder="Enter any notes about the refund..."
        />
      </div>
      <div className="flex w-full justify-end gap-2">
        <ButtonModule variant="ghost" size="md" onClick={() => alert("Export clicked")}>
          <p className="max-sm:hidden">Save</p>
        </ButtonModule>
        <ButtonModule variant="primary" size="md" onClick={() => alert("Export clicked")}>
          <p className="max-sm:hidden">Submit</p>
        </ButtonModule>
      </div>
    </div>
  )
}

export default RefundDetial
