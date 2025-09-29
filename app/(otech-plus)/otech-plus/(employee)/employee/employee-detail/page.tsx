"use client"
import CustomerInfo from "components/CustomerInfo/CustomerInfo"
import DashboardNav from "components/Navbar/DashboardNav"
import { useEffect, useState } from "react"

import { ButtonModule } from "components/ui/Button/Button"

import FreezeAccountModal from "components/ui/Modal/freeze-account-modal"
import GenerateReceiptmodal from "components/ui/Modal/generate-receipt-modal"
import { useRouter } from "next/navigation"
import Link from "next/link"
import EditUserIcon from "public/edit-info-icon"
import LinkedInIcon from "public/linkedIn-icon"
import TwitterIcon from "public/twitter-icon"
import FacebookIcon from "public/facebook-icon"

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
            <div className="flex items-center justify-between border-b px-8 py-4">
              <div className="flex cursor-pointer items-center gap-2" onClick={() => router.back()}>
                <img src="/DashboardImages/ArrowLeft.png" alt="dekalo" className="icon-style" />
                <img src="/DashboardImages/ArrowLeft-dark.png" alt="dekalo" className="dark-icon-style" />
                <p className="text-2xl font-medium">Employee 001</p>
              </div>
              <div className="flex gap-4">
                {/* <ButtonModule variant="outline" size="md" iconPosition="end" onClick={handleGenerateReceipt}>
                  Generate Bank Statement
                </ButtonModule> */}
                <ButtonModule variant="black" size="md" iconPosition="end" onClick={handleGenerateReceipt}>
                  Edit Employee
                </ButtonModule>
              </div>
            </div>

            <div className="max-sm-my-4 mt-8 flex  w-full items-start gap-6  px-8 max-md:flex-col max-md:px-0 max-sm:px-3">
              <div className="w-1/3 rounded-md bg-[#FFFFFF] p-4 shadow-md">
                <div className="flex gap-4">
                  <div className="relative h-[46px] w-[46px]">
                    <div className="text-grey-600 flex h-[44px] w-[44px] items-center justify-center rounded-md bg-[#F5F8FA] font-medium">
                      AA
                    </div>
                    <div
                      className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white ${"bg-[#27AE60]"}`}
                    ></div>
                  </div>

                  <div className="flex-1">
                    <h3 className="text-base font-bold">Adegboyega & Akinsanya LLC</h3>
                    <p className="text-sm">Lorem ipsum dolor sit amet consectetur</p>
                  </div>
                </div>
                <div className="my-4 flex w-full flex-col justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex w-full justify-between gap-1">
                      <span className="text-grey-400">Department:</span>
                      <span className="font-medium">Finance</span>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-col  text-sm">
                    <div className="flex w-full justify-between gap-1">
                      <span className="text-grey-400 text-base">Position</span>
                      <span className=" text-sm font-medium">Head of Department</span>
                    </div>
                  </div>
                </div>

                <div className="mt-2 flex items-center justify-between gap-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-grey-400">Reports:</span>
                    <span className="font-medium">7</span>
                  </div>
                </div>

                <div className="text-grey-600 mt-4 rounded-md bg-[#F5F8FA] p-3">
                  <div className="flex justify-between text-sm">
                    <span>Salary:</span>
                    <span className="text-grey-300">
                      NGN <span className="text-base font-bold text-[#202B3C]">80,000</span>
                      /month
                    </span>
                  </div>
                  <div className="mt-2 flex justify-between text-sm">
                    <span>Bonuses</span>
                    <span className="text-grey-300">
                      NGN <span className="text-base font-bold text-[#202B3C]">80,000</span>
                      /month
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex w-2/3 flex-col items-start rounded-md bg-[#EBEFF3] p-4">
                <div className="flex w-full justify-between">
                  <p className="text-2xl font-bold">Adegboyega & Akinsanya LLC</p>
                </div>
                <span className="text-grey-400 mt-2 w-1/2 space-y-0">
                  Lorem ipsum dolor sit amet consectetur. Lorem ornare nullam integer porttitor nibh in elementum at
                  libero. Gravida at sit et.
                </span>

                <div className="my-4 flex gap-2">
                  <div className="rounded bg-[#CBD5E1] px-2 py-1">
                    <p className="text-sm text-[#384860]">Financial reporting</p>
                  </div>
                  <div className="rounded bg-[#CBD5E1] px-2 py-1">
                    <p className="text-sm text-[#384860]">Audit & Assurance</p>
                  </div>
                  <div className="rounded bg-[#CBD5E1] px-2 py-1">
                    <p className="text-sm text-[#384860]">Tax</p>
                  </div>
                  <div className="rounded bg-[#CBD5E1] px-2 py-1">
                    <p className="text-sm text-[#384860]">Advisory</p>
                  </div>
                </div>
                <div className="flex w-full bg-[#DDE2E9] p-4">
                  <p className="text-[#384860]">BASIC INFO</p>
                </div>
                <div className="mt-4 flex w-full justify-between border-b pb-2">
                  <p className="text-[#384860]">Website</p>
                  <div className="flex items-center gap-2">
                    <Link href="" className="text-[#202B3C]">
                      https://adegboakintax.com
                    </Link>
                    <EditUserIcon />
                  </div>
                </div>
                <div className="mt-4 flex w-full justify-between border-b pb-2">
                  <p className="text-[#384860]">Otech Bank ID</p>
                  <div className="flex items-center gap-2">
                    <p className="text-[#202B3C]">OTECH0002354</p>
                  </div>
                </div>
                <div className="mt-4 flex w-full justify-between border-b pb-2">
                  <p className="text-[#384860]">Level</p>
                  <div className="flex items-center gap-2">
                    <p className="text-[#202B3C]">10 (Senior Accountant)</p>
                  </div>
                </div>
                <div className="mt-4 flex w-full flex-col justify-between gap-4 ">
                  <p className="text-[#384860]">Socials</p>
                  <div className="flex items-center gap-2">
                    <Link
                      href="#"
                      className="group flex h-11 w-11  items-center justify-center rounded-md bg-[#E6E9EE] transition-all duration-200 ease-in-out hover:bg-[#ffe8d1]"
                    >
                      <LinkedInIcon className="group-hover:fill-[#f58634]" />
                    </Link>

                    <Link
                      href="#"
                      className="group flex h-11 w-11 items-center justify-center rounded-md bg-[#E6E9EE] transition-all duration-200 ease-in-out hover:bg-[#ffe8d1]"
                    >
                      <TwitterIcon className="group-hover:fill-[#f58634]" />
                    </Link>

                    <Link
                      href="#"
                      className="group flex h-11 w-11 items-center justify-center rounded-md bg-[#E6E9EE] transition-all duration-200 ease-in-out hover:bg-[#ffe8d1]"
                    >
                      <FacebookIcon className="group-hover:fill-[#f58634]" />
                    </Link>
                  </div>
                </div>
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
