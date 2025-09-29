"use client"
import DashboardNav from "components/Navbar/DashboardNav"
import FinanceChart from "components/Chart/FinanceChart"

import TotalAssets from "public/total-assets"
import TransactionIcon from "public/transaction-icon"
import AccountIcon from "public/accounts-icon"
import WarningIcon from "public/warning-icon"
import CustomerIcon from "public/customer-icon"
import { ButtonModule } from "components/ui/Button/Button"
import InsightIcon from "public/insight-icon"
import ExchangeRateMarquee from "components/ui/ExchangeRate/exchange-rate"
import TransactionTable from "components/Tables/RecentActivityTable"

interface PaymentAccount {
  id: number
  src: any
  name: string
  balance: string
}

export default function Dashboard() {
  return (
    <section className="h-full w-full">
      <div className="flex min-h-screen w-full">
        <div className="flex w-full flex-col">
          <DashboardNav />
          <div className="flex flex-col">
            <div className="flex items-center justify-between border-b px-8 py-4">
              <p className="text-2xl font-medium">Dashboard</p>
              {/* Replacing the previous button group with the real-time exchange rates marquee */}
              <ExchangeRateMarquee />
            </div>

            <div className="max-sm-my-4 flex w-full gap-6 px-8 max-md:flex-col max-md:px-0 max-sm:px-3 md:my-8">
              <div className="w-full">
                <div className="flex w-full gap-3 max-lg:grid max-lg:grid-cols-2">
                  <div className="flex w-3/4">
                    <div className="w-full">
                      <div className="mb-3 flex w-full cursor-pointer gap-3">
                        <div className="small-card rounded-md p-2 transition duration-500 md:border">
                          <div className="flex items-center gap-1 border-b pb-4 max-sm:mb-2">
                            <TotalAssets />
                            <span className="text-grey-400 ml-1">Total Transaction </span> (Income Basis)
                          </div>
                          <div className="flex items-end justify-between pt-6">
                            <div>
                              <h5 className="text-secondary text-xl font-semibold max-sm:text-lg">
                                <span className="text-grey-300 font-normal">NGN</span> 40,453.
                                <span className="text-grey-300 text-sm">26</span>
                              </h5>
                            </div>
                          </div>
                        </div>
                        <div className="small-card rounded-md  p-2 transition duration-500 md:border">
                          <div className=" flex items-center  gap-1 border-b pb-4 max-sm:mb-2">
                            <TotalAssets />
                            <span className="text-grey-400 ml-1 ">Total Transaction </span> (Income Basis )
                          </div>

                          <div className="flex items-end justify-between pt-6">
                            <div>
                              <h5 className="text-secondary text-xl font-semibold  max-sm:text-lg ">
                                <span className="text-grey-300 font-normal">NGN</span> 40,453.
                                <span className="text-grey-300 text-sm">26</span>
                              </h5>
                            </div>
                          </div>
                        </div>
                        <div className="small-card rounded-md  p-2 transition duration-500 md:border">
                          <div className=" flex items-center  gap-1 border-b pb-4 max-sm:mb-2">
                            <TransactionIcon />
                            <span className="text-grey-400 ml-1 ">Total Transaction </span> (Income Basis )
                          </div>

                          <div className="flex items-end justify-between pt-6">
                            <div>
                              <h5 className="text-secondary text-xl font-semibold  max-sm:text-lg ">
                                <span className="text-grey-300 font-normal">NGN</span> 40,453.
                                <span className="text-grey-300 text-sm">26</span>
                              </h5>
                            </div>
                          </div>
                        </div>

                        {/* Additional small cards can be similarly defined... */}
                      </div>
                      <div className="flex w-full cursor-pointer gap-3">
                        <div className="small-card rounded-md p-2 transition duration-500 md:border">
                          <div className="flex items-center gap-1 border-b pb-4 max-sm:mb-2">
                            <AccountIcon />
                            Accounts
                          </div>
                          <div className="mt-4 flex min-h-[42px] w-full cursor-pointer items-center gap-2 rounded-lg bg-[#ffe8d1] px-3 py-4">
                            <WarningIcon />
                            <p className="font-bold text-[#202B3C]">
                              <span className="font-normal">Unresolved transactions, click to resolve </span>
                            </p>
                          </div>
                          <div className="flex items-end justify-between pt-4">
                            <div>
                              <p className="text-secondary font-semibold">
                                Connected accounts <span className="text-grey-300 font-normal">(11)</span>
                              </p>
                            </div>
                            <div>
                              <p className="text-secondary font-semibold">
                                Total transactions <span className="text-grey-300 font-normal">(7,679)</span>
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="small-card rounded-md p-2 transition duration-500 md:border">
                          <div className="flex items-center gap-1 border-b pb-4 max-sm:mb-2">
                            <CustomerIcon />
                            Issues Raised
                          </div>
                          <div className="flex items-end justify-between border-b py-6">
                            <div>
                              <p className="text-secondary font-semibold">
                                Total Complaints <span className="text-grey-300 font-normal">(11)</span>
                              </p>
                            </div>
                            <div>
                              <p className="text-secondary font-semibold">
                                Total Resolved <span className="text-grey-300 font-normal">(8)</span>
                              </p>
                            </div>
                          </div>
                          <div className="flex items-end justify-between pt-4">
                            <div>
                              <p className="text-secondary font-semibold">
                                Unresolved <span className="text-grey-300 font-normal">(3)</span>
                              </p>
                            </div>
                            <div>
                              <ButtonModule type="submit" variant="outline" size="sm" className="w-full">
                                View
                              </ButtonModule>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex w-1/4 flex-col justify-between rounded-md border bg-white p-4">
                    <div className="flex items-center gap-2 border-b pb-4">
                      <InsightIcon />
                      <p className="text-lg font-semibold">Model Popularity</p>
                    </div>
                    <div>
                      <p className="text-center font-medium">Insight</p>
                      <div className="bottom-style mt-1 flex items-center justify-center rounded-[4px] border py-2">
                        <p className="text-center text-xs">
                          Otech MFB is the top <br />
                          choice among customers.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <TransactionTable />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
