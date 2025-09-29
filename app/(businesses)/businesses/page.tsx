"use client"
import DashboardNav from "components/Navbar/DashboardNav"
import ArrowIcon from "public/arrow-icon"
import BusinessIcon from "public/business-icon"
import RecentlyAdded from "public/recently-added"
import TotalBusiness from "public/total-business"
import DisabledBusiness from "public/disabled-business"
import { ButtonModule } from "components/ui/Button/Button"
import AddBusiness from "public/add-business"
import { useState } from "react"
import AddBusinessModal from "components/ui/Modal/add-item-modal"
import AllBusinessTable from "components/Tables/AllBusinessTable"

interface PaymentAccount {
  id: number
  src: any
  name: string
  balance: string
}

export default function AllTransactions() {
  const [isAddBusinessModalOpen, setIsAddBusinessModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleAddBusiness = async (businessData: { name: string; email: string; phone: string; address: string }) => {
    setIsSubmitting(true)
    try {
      // Here you would typically call your API to add the business
      console.log("Adding business:", businessData)
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))
      // Close modal after successful submission
      setIsAddBusinessModalOpen(false)
    } catch (error) {
      console.error("Error adding business:", error)
    } finally {
      setIsSubmitting(false)
    }
  }
  return (
    <section className="h-full w-full">
      <div className="flex min-h-screen w-full">
        <div className="flex w-full flex-col">
          <DashboardNav />
          <div className="flex flex-col">
            <div className="flex items-center justify-between border-b px-8 py-4 max-sm:px-3">
              <p className="font-medium  md:text-2xl">Businesses Page</p>
              <ButtonModule
                variant="primary"
                size="md"
                icon={<AddBusiness />}
                iconPosition="start"
                onClick={() => setIsAddBusinessModalOpen(true)}
              >
                Add Business
              </ButtonModule>
            </div>

            <div className="flex w-full gap-6 px-8 max-md:flex-col max-md:px-0 max-sm:my-4 max-sm:px-3 md:my-8">
              <div className="w-full">
                <div className="flex w-full gap-3 max-lg:grid max-lg:grid-cols-2 max-sm:grid-cols-1">
                  <div className="flex w-full max-sm:flex-col">
                    <div className="w-full">
                      <div className="mb-3 flex w-full cursor-pointer gap-3 max-sm:flex-col">
                        {/* Overview starts */}
                        <div className="small-card rounded-md p-2 transition duration-500 md:border">
                          <div className="flex items-center gap-2 border-b pb-4 max-sm:mb-2">
                            <BusinessIcon />
                            Overview
                          </div>
                          <div className="flex flex-col items-end justify-between gap-3 pt-4">
                            <div className="flex w-full justify-between">
                              <p className="text-grey-200">Cards count:</p>
                              <p className="text-secondary font-medium">7,679</p>
                            </div>
                            <div className="flex w-full justify-between">
                              <p className="text-grey-200">Total Volume:</p>
                              <p className="text-secondary font-medium">
                                <span className="text-grey-300 font-normal">NGN </span>40,453,456.26
                              </p>
                            </div>
                          </div>
                        </div>
                        {/* Overview ends */}
                        {/* Incoming starts */}
                        <div className="small-card rounded-md p-2 transition duration-500 md:border">
                          <div className="flex items-center gap-2 border-b pb-4 max-sm:mb-2">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F5F8FA]">
                              <RecentlyAdded />
                            </div>
                            Recently Added
                          </div>
                          <div className="flex flex-col items-end justify-between gap-3 pt-4">
                            <div className="flex w-full justify-between">
                              <p className="text-grey-200">Total count:</p>
                              <p className="text-secondary font-medium">407</p>
                            </div>
                            <div className="flex w-full justify-between">
                              <p className="text-grey-200">Total Volume:</p>
                              <p className="text-secondary font-medium">
                                <span className="text-grey-300 font-normal">NGN </span>15,097,280.54
                              </p>
                            </div>
                          </div>
                        </div>
                        {/* Incoming ends */}
                        {/* Outgoing starts */}
                        <div className="small-card rounded-md p-2 transition duration-500 md:border">
                          <div className="flex items-center gap-2 border-b pb-4 max-sm:mb-2">
                            <TotalBusiness />
                            Total Businesses
                          </div>
                          <div className="flex flex-col items-end justify-between gap-3 pt-4">
                            <div className="flex w-full justify-between">
                              <p className="text-grey-200">Total count:</p>
                              <p className="text-secondary font-medium">110</p>
                            </div>
                            <div className="flex w-full justify-between">
                              <p className="text-grey-200">Total Volume:</p>
                              <p className="text-secondary font-medium">
                                <span className="text-grey-300 font-normal">NGN </span>8,453,456.96
                              </p>
                            </div>
                          </div>
                        </div>
                        {/* Outgoing ends */}
                        {/* Unresolved starts */}
                        <div className="small-card rounded-md p-2 transition duration-500 md:border">
                          <div className="flex items-center gap-2 border-b pb-4 max-sm:mb-2">
                            <DisabledBusiness />
                            Inactive Businesses
                          </div>
                          <div className="flex flex-col items-end justify-between gap-3 pt-4">
                            <div className="flex w-full justify-between">
                              <p className="text-grey-200">Total:</p>
                              <div className="flex gap-1">
                                <p className="text-secondary font-medium">110</p>
                                <ArrowIcon />
                              </div>
                            </div>
                            <div className="flex w-full justify-between">
                              <p className="text-grey-200">Total Volume:</p>
                              <p className="text-secondary font-medium">
                                <span className="text-grey-300 font-normal">NGN </span>53,456.00
                              </p>
                            </div>
                          </div>
                        </div>
                        {/* Unresolved ends */}
                      </div>
                    </div>
                  </div>
                </div>
                <AllBusinessTable />
              </div>
            </div>
          </div>
        </div>
      </div>
      <AddBusinessModal
        isOpen={isAddBusinessModalOpen}
        onRequestClose={() => setIsAddBusinessModalOpen(false)}
        onSubmit={handleAddBusiness}
        loading={isSubmitting}
      />
    </section>
  )
}
