import RefundedItemsTable from "components/Tables/RefundedItemsTable"
import SalesOrderTable from "components/Tables/SalesOrderTable"
import { ButtonModule } from "components/ui/Button/Button"
import { DropdownPopoverModule } from "components/ui/Input/DropdownModule"
import { FormInputModule } from "components/ui/Input/Input"
import PaymentSidebar from "components/ui/Modal/make-payment-modal"
import CalendarIcon from "public/calender-icon"
import CardPosIcon from "public/card-pos-icon"
import DocumentIcon from "public/document-icon"
import React, { useState } from "react"

const InvoiceDetail = () => {
  const [selectedState, setSelectedState] = useState("")
  const [email, setEmail] = useState("")
  const [customer, setCustomer] = useState("")
  const [phone, setPhone] = useState("")
  const [paymentMethod, setPaymentMethod] = useState("")
  const [isPaymentSidebarOpen, setIsPaymentSidebarOpen] = useState(false)

  const states = [
    { value: "AP", label: "Andhra Pradesh" },
    { value: "CH", label: "Chandigarh" },
    { value: "DL", label: "Delhi" },
    { value: "MN", label: "Manipur" },
    { value: "RJ", label: "Rajasthan" },
  ]

  const payments = [
    { value: "Cash", label: "Cash" },
    { value: "Debit Card", label: "Debit Card" },
    { value: "Voucher", label: "Voucher" },
  ]

  const handlePhoneChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPhone(event.target.value)
  }

  const handleCustomerChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCustomer(event.target.value)
  }

  const togglePaymentSidebar = () => {
    setIsPaymentSidebarOpen(!isPaymentSidebarOpen)
  }

  return (
    <div className="relative flex w-full flex-col gap-4 rounded-md bg-white p-6">
      <PaymentSidebar isOpen={isPaymentSidebarOpen} onClose={togglePaymentSidebar} />

      <div className="flex w-full items-center justify-between">
        <div className="flex flex-col gap-2">
          <p className="text-grey-400">Invoice Number</p>
          <p>Inv-1111111</p>
        </div>
        <div className="flex flex-col gap-2">
          <p className="text-grey-400">Invoice Date</p>
          <div className="flex items-center gap-2">
            <CalendarIcon />
            <p>04-04-2025</p>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <DropdownPopoverModule
            label="State of Supply"
            options={states}
            placeholder="Choose a state"
            value={selectedState}
            onChange={setSelectedState}
          />
        </div>
      </div>
      <div className="mt-4 grid w-full grid-cols-3 gap-4">
        <FormInputModule
          label="Customer"
          type="customer"
          placeholder="Teemah"
          value={customer}
          onChange={handleCustomerChange}
          className="mb-3 w-full"
        />
        <FormInputModule
          label="Phone"
          type="phone"
          placeholder="saffronwellcare@gmail.com"
          value={email}
          onChange={handlePhoneChange}
          className="mb-3 w-full"
        />
        <DropdownPopoverModule
          label="Payment Method"
          options={payments}
          placeholder="Choose a state"
          value={paymentMethod}
          onChange={setPaymentMethod}
          className="w-full"
        />
        <FormInputModule
          label="Payment Description"
          type="customer"
          placeholder="Teemah"
          value={customer}
          onChange={handleCustomerChange}
          className="mb-3 w-full"
        />
        <div>
          <p className="mb-1 text-sm">Add Docx</p>
          <div className="h-12 w-full rounded-md bg-[#F5F8FA] p-2 transition-all duration-300 ease-in-out hover:bg-[#e6f7f7]">
            <div className="flex h-full items-center gap-2 rounded-md border border-dashed border-[#33333380] px-2">
              <DocumentIcon />
              <p className="font-bold">
                Select file
                <span className="text-sm font-medium text-[#64748B]"> (supports .docx, .pdf. files up to 5MB)</span>
              </p>
            </div>
          </div>
        </div>
        <div>
          <p className="mb-1 text-sm">Add Image</p>
          <div className="h-12 w-full rounded-md bg-[#F5F8FA] p-2 transition-all duration-300 ease-in-out hover:bg-[#e6f7f7]">
            <div className="flex h-full items-center gap-2 rounded-md border border-dashed border-[#33333380] px-2">
              <DocumentIcon />
              <p className="font-bold">
                Select file
                <span className="text-sm font-medium text-[#64748B]"> (supports .jpg, .png, files up to 5MB)</span>
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor="refundNotes" className="text-lg font-semibold">
          Billing Address
        </label>
        <textarea
          id="refundNotes"
          className="focus:border-primary focus:ring-primary w-full rounded-md border border-gray-300 bg-white p-3 transition-colors duration-200 hover:border-[#00a4a6] focus:outline-none focus:ring-2 focus:ring-[#00a4a6]"
          rows={3}
          placeholder="Enter any notes about the refund..."
        />
      </div>

      <SalesOrderTable />

      <div className="flex w-full justify-end gap-2">
        <ButtonModule
          variant="ghost"
          size="md"
          icon={<CardPosIcon />}
          iconPosition="start"
          onClick={togglePaymentSidebar}
        >
          <p className="max-sm:hidden">Make Payment</p>
        </ButtonModule>
        <ButtonModule variant="primary" size="md" onClick={() => alert("Export clicked")}>
          <p className="max-sm:hidden">Submit</p>
        </ButtonModule>
      </div>
    </div>
  )
}

export default InvoiceDetail
