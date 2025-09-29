"use client"
import CustomerInfo from "components/CustomerInfo/CustomerInfo"
import DashboardNav from "components/Navbar/DashboardNav"
import { useEffect, useState } from "react"
import AllTransactionTable from "components/Tables/AllTransactionstable"
import { ButtonModule } from "components/ui/Button/Button"

import FreezeAccountModal from "components/ui/Modal/freeze-account-modal"
import GenerateReceiptmodal from "components/ui/Modal/generate-receipt-modal"
import { useRouter } from "next/navigation"

export default function Dashboard() {
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false)
  const [isFreezeModalOpen, setIsFreezeModalOpen] = useState(false)
  const [isFreezing, setIsFreezing] = useState(false)

  const handleFreezeAccount = () => {
    setIsFreezeModalOpen(true)
  }

  const handleGenerateReceipt = () => {
    setIsReceiptModalOpen(true)
  }

  const confirmFreezeAccount = () => {
    setIsFreezing(true)
    // Simulate API call
    setTimeout(() => {
      console.log("Account frozen")
      setIsFreezing(false)
      setIsFreezeModalOpen(false)
    }, 1500)
  }

  const router = useRouter()

  return (
    <section className="h-full w-full">
      <div className="flex min-h-screen w-full">
        <div className="flex  w-full flex-col">
          <DashboardNav />
          <div className="flex flex-col">
            <div className="flex  justify-between border-b px-8 py-4 max-sm:flex-col max-sm:px-3">
              <div className="flex cursor-pointer  gap-2" onClick={() => router.back()}>
                <img src="/DashboardImages/ArrowLeft.png" alt="dekalo" className="icon-style" />
                <img src="/DashboardImages/ArrowLeft-dark.png" alt="dekalo" className="dark-icon-style" />
                <p className="font-medium md:text-2xl ">Business 001</p>
              </div>
              <div className="flex gap-4 max-sm:pt-4">
                <ButtonModule variant="outline" size="md" iconPosition="end" onClick={handleGenerateReceipt}>
                  Generate Statement
                </ButtonModule>
                <ButtonModule variant="black" size="md" iconPosition="end" onClick={handleFreezeAccount}>
                  Freeze Account
                </ButtonModule>
              </div>
            </div>

            <div className="mt-8 flex w-full gap-6 px-8  max-md:flex-col max-md:px-0 max-sm:my-4 max-sm:px-3">
              <div className="w-full">
                <CustomerInfo />
              </div>
            </div>

            <div className="flex w-full gap-6 px-8 max-md:flex-col  max-md:px-0 max-sm:mb-4 max-sm:px-3 md:my-8">
              <div className="w-full">
                <AllTransactionTable />
              </div>
            </div>
          </div>
        </div>
      </div>

      <FreezeAccountModal
        isOpen={isFreezeModalOpen}
        onRequestClose={() => setIsFreezeModalOpen(false)}
        onConfirm={confirmFreezeAccount}
        loading={isFreezing}
      />

      <GenerateReceiptmodal
        isOpen={isReceiptModalOpen}
        onRequestClose={() => setIsReceiptModalOpen(false)}
        onConfirm={confirmFreezeAccount}
        loading={isFreezing}
      />
    </section>
  )
}
