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

const PurchaseOrderBill = () => {
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
          <p className="text-grey-400">Supplier Registration Form</p>
        </div>
      </div>
      <div className="mt-4 grid w-full grid-cols-3 gap-4">
        <FormInputModule
          label="Supplier Name"
          type="customer"
          placeholder="Teemah"
          value={customer}
          onChange={handleCustomerChange}
          className="mb-3 w-full"
        />
        <FormInputModule
          label="Business Name"
          type="text"
          placeholder="Business Name"
          value=""
          onChange={handlePhoneChange}
          className="mb-3 w-full"
        />
        <DropdownPopoverModule
          label="Supplier Type"
          options={payments}
          placeholder="Choose a state"
          value={paymentMethod}
          onChange={setPaymentMethod}
          className="w-full"
        />
        <FormInputModule
          label="Phone Number"
          type="text"
          placeholder="phone number"
          value={phone}
          onChange={handlePhoneChange}
          className="mb-3 w-full"
        />

        <FormInputModule
          label="Email"
          type="text"
          placeholder="Enter Email"
          value={email}
          onChange={handlePhoneChange}
          className="mb-3 w-full"
        />

        <FormInputModule
          label="Tax ID"
          type="text"
          placeholder="Enter Tax Id"
          value=""
          onChange={handlePhoneChange}
          className="mb-3 w-full"
        />

        <FormInputModule
          label="Bank Name"
          type="text"
          placeholder="Enter Bank Name"
          value=""
          onChange={handlePhoneChange}
          className="mb-3 w-full"
        />

        <FormInputModule
          label="Account No"
          type="text"
          placeholder="Enter Account No"
          value=""
          onChange={handlePhoneChange}
          className="mb-3 w-full"
        />

        <FormInputModule
          label="Account Name"
          type="text"
          placeholder="Enter Account Name"
          value=""
          onChange={handlePhoneChange}
          className="mb-3 w-full"
        />
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor="refundNotes" className="text-sm">
          Address
        </label>
        <textarea
          id="refundNotes"
          className="focus:border-primary focus:ring-primary w-full rounded-md border border-gray-300 bg-white p-3 transition-colors duration-200 hover:border-[#00a4a6] focus:outline-none focus:ring-2 focus:ring-[#00a4a6]"
          rows={3}
          placeholder="Enter any notes about the refund..."
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="refundNotes" className="text-sm">
          Additional Notes
        </label>
        <textarea
          id="refundNotes"
          className="focus:border-primary focus:ring-primary w-full rounded-md border border-gray-300 bg-white p-3 transition-colors duration-200 hover:border-[#00a4a6] focus:outline-none focus:ring-2 focus:ring-[#00a4a6]"
          rows={3}
          placeholder="Enter any notes about the refund..."
        />
      </div>

      <div className="flex w-full justify-end gap-2">
        <ButtonModule variant="ghost" size="md" iconPosition="start" onClick={togglePaymentSidebar}>
          <p className="max-sm:hidden">Cancel</p>
        </ButtonModule>
        <ButtonModule variant="primary" size="md" onClick={() => alert("Export clicked")}>
          <p className="max-sm:hidden">Save</p>
        </ButtonModule>
      </div>
    </div>
  )
}

export default PurchaseOrderBill
