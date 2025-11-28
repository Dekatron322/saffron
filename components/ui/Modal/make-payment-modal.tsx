// components/PaymentSidebar/PaymentSidebar.tsx
import BankTransfer from "public/bank-transfer"
import CardIcon from "public/cards-icon"
import UpIcon from "public/Icons/up-icon"
import UpiIcon from "public/upi"
import WalletIcon from "public/wallet-icon"
import React, { useState } from "react"
import { FormInputModule } from "../Input/Input"
import { ButtonModule } from "../Button/Button"
import QrCode from "public/qrcode"

interface PaymentSidebarProps {
  isOpen: boolean
  onClose: () => void
}

type PaymentMethod = "card" | "cash" | "bank" | "upi"

const PaymentSidebar: React.FC<PaymentSidebarProps> = ({ isOpen, onClose }) => {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>("card") // Set 'card' as default
  const [cardNumber, setCardNumber] = useState("")
  const [cvv, setCvv] = useState("")
  const [cardName, setCardName] = useState("")
  const [expiry, setExpiry] = useState("")
  const [billingAddress, setBillingAddress] = useState("")

  if (!isOpen) return null

  const handleMethodSelect = (method: PaymentMethod) => {
    setSelectedMethod(method)
  }

  const getMethodStyle = (method: PaymentMethod) => {
    return selectedMethod === method
      ? "border-[#00a4a6] ring-2 ring-[#00a4a6] bg-[#e6f7f7]"
      : "border-gray-300 hover:border-gray-400"
  }

  const handleCardNumberChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCardNumber(event.target.value)
  }

  const handleCvvChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCvv(event.target.value)
  }

  const handleCardNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCardName(event.target.value)
  }

  const handleExpiryChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setExpiry(event.target.value)
  }

  const handleBillingChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setBillingAddress(event.target.value)
  }

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose}></div>
      <div className="absolute inset-y-0 right-0 flex max-w-full pl-10">
        <div className="w-screen max-w-2xl">
          <div className="flex h-full flex-col bg-white shadow-xl">
            <div className="flex-1 overflow-y-auto p-6">
              <div className="flex items-start justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Make Payment</h2>
                <button type="button" className="text-gray-400 hover:text-gray-500" onClick={onClose}>
                  <span className="sr-only">Close panel</span>
                  <svg className="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="mt-6">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Select Payment Method</label>
                    <div className="mt-2 grid grid-cols-4 gap-2">
                      <div
                        className={`flex cursor-pointer flex-col items-center justify-center gap-1 rounded-md border py-4 text-sm transition-colors ${getMethodStyle(
                          "card"
                        )}`}
                        onClick={() => handleMethodSelect("card")}
                      >
                        <CardIcon />
                        <p>Credit/Debit Card</p>
                      </div>
                      <div
                        className={`flex cursor-pointer flex-col items-center justify-center gap-1 rounded-md border py-4 text-sm transition-colors ${getMethodStyle(
                          "cash"
                        )}`}
                        onClick={() => handleMethodSelect("cash")}
                      >
                        <WalletIcon />
                        <p>Cash</p>
                      </div>
                      <div
                        className={`flex cursor-pointer flex-col items-center justify-center gap-1 rounded-md border py-4 text-sm transition-colors ${getMethodStyle(
                          "bank"
                        )}`}
                        onClick={() => handleMethodSelect("bank")}
                      >
                        <BankTransfer />
                        <p>Bank Transfer</p>
                      </div>
                      <div
                        className={`flex cursor-pointer flex-col items-center justify-center gap-1 rounded-md border py-4 text-sm transition-colors ${getMethodStyle(
                          "upi"
                        )}`}
                        onClick={() => handleMethodSelect("upi")}
                      >
                        <UpiIcon />
                        <p>UPI</p>
                      </div>
                    </div>
                  </div>

                  {selectedMethod === "card" && (
                    <>
                      <div className="flex gap-3">
                        <FormInputModule
                          label="Name on Card"
                          type="text"
                          placeholder="Enter Name on Card"
                          value={cardName}
                          onChange={handleCardNameChange}
                          className=" w-full"
                        />
                        <FormInputModule
                          label="Expiry"
                          type="date"
                          placeholder="***"
                          value={expiry}
                          onChange={handleExpiryChange}
                          className=" w-1/2"
                        />
                      </div>

                      <div className="flex gap-3">
                        <FormInputModule
                          label="Card Number"
                          type="text"
                          placeholder="Card Number"
                          value={cardNumber}
                          onChange={handleCardNumberChange}
                          className=" w-full"
                        />
                        <FormInputModule
                          label="CVV"
                          type="password"
                          placeholder="***"
                          value={cvv}
                          onChange={handleCvvChange}
                          className=" w-1/2"
                        />
                      </div>
                      <FormInputModule
                        label="Billing Address"
                        type="text"
                        placeholder="Enter Billing Address"
                        value={billingAddress}
                        onChange={handleBillingChange}
                        className="mb-3 w-full"
                      />

                      <div className="grid  gap-3">
                        <p className="text-xl">Order Summary</p>

                        <p className="">
                          Sub Total: <span className="text-grey-400 ">₹115.00</span>
                        </p>
                        <p className="">
                          Tax (5%): <span className="text-grey-400">₹5.75</span>
                        </p>
                        <p className="">
                          Advance Amount : <span className="text-grey-400">₹50.00</span>
                        </p>
                        <p className="">
                          Total Amount: <span className="text-grey-400">₹125.75</span>
                        </p>
                      </div>
                    </>
                  )}

                  {selectedMethod === "cash" && (
                    <>
                      <div className="flex gap-3">
                        <FormInputModule
                          label="Customer Name"
                          type="text"
                          placeholder="Enter Customer Name "
                          value={cardName}
                          onChange={handleCardNameChange}
                          className=" w-full"
                        />
                        <FormInputModule
                          label="Date"
                          type="date"
                          placeholder="***"
                          value={expiry}
                          onChange={handleExpiryChange}
                          className=" w-1/2"
                        />
                      </div>

                      <FormInputModule
                        label="Billing Address"
                        type="text"
                        placeholder="Enter Billing Address"
                        value={billingAddress}
                        onChange={handleBillingChange}
                        className="mb-3 w-full"
                      />

                      <div className="grid  gap-3">
                        <p className="text-xl">Order Summary</p>

                        <p className="">
                          Sub Total: <span className="text-grey-400 ">₹115.00</span>
                        </p>
                        <p className="">
                          Tax (5%): <span className="text-grey-400">₹5.75</span>
                        </p>
                        <p className="">
                          Advance Amount : <span className="text-grey-400">₹50.00</span>
                        </p>
                        <p className="">
                          Total Amount: <span className="text-grey-400">₹125.75</span>
                        </p>
                      </div>
                    </>
                  )}

                  {selectedMethod === "bank" && (
                    <>
                      <div className="grid  gap-3">
                        <p className="text-center text-xl">We Are Waiting For Your Payment</p>
                        <div className="w-full rounded-md bg-[#F5F8FA] p-4">
                          <p className="text-center">
                            Please follow the instructions below and do not refresh or leave this page, payment
                            confirmation may take up to 2 mins
                          </p>
                        </div>

                        <p className="text-xl">Bank Transfer Details</p>
                        <p className="">
                          Bank Name: <span className="text-grey-400 ">Zenith Bank</span>
                        </p>
                        <p className="">
                          Account Name: <span className="text-grey-400">Saffron Pharmacy Ltd.</span>
                        </p>
                        <p className="">
                          Advance Amount : <span className="text-grey-400">₹50.00</span>
                        </p>
                        <p className="">
                          Account Number : <span className="text-grey-400">1234567890</span>
                        </p>
                        <p className="">
                          Transfer Reference Code: <span className="text-grey-400">INV-000123</span>
                        </p>
                        <p className="">
                          Total Amount: <span className="text-grey-400">₹125.75</span>
                        </p>
                        <p className="text-grey-400 mt-10 text-center">This Transaction expires in 20 minutes</p>
                      </div>
                    </>
                  )}

                  {selectedMethod === "upi" && (
                    <>
                      <div className="flex gap-3">
                        <FormInputModule
                          label="UPI ID"
                          type="text"
                          placeholder="Enter UPI ID"
                          value={cardName}
                          onChange={handleCardNameChange}
                          className=" w-full"
                        />
                        <FormInputModule
                          label="Date"
                          type="date"
                          placeholder="***"
                          value={expiry}
                          onChange={handleExpiryChange}
                          className=" w-1/2"
                        />
                      </div>
                      <p className="text-primary">Save UPI ID for future purchases</p>

                      <div className=" flex w-full flex-col items-center justify-center gap-5">
                        <p className="text-xl">Scan QR code on your preferred UPI App</p>

                        <QrCode />

                        <p className="">Total Amount: ₹125.75</p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 p-6">
              <div className="flex justify-end space-x-3">
                <ButtonModule
                  variant="outline"
                  size="md"
                  onClick={() => alert("Export clicked")}
                  className="rounded-md"
                >
                  <p className="max-sm:hidden">Cancel</p>
                </ButtonModule>
                <ButtonModule
                  variant="primary"
                  size="md"
                  onClick={() => alert("Export clicked")}
                  className="rounded-md"
                >
                  <p className="max-sm:hidden">Process Payment</p>
                </ButtonModule>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PaymentSidebar
