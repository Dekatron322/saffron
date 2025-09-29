"use client"
import DashboardNav from "components/Navbar/DashboardNav"
import CancelledOrders from "components/Tables/CancelledOrders"

export default function Confirmed() {
  return (
    <section className="h-full w-full">
      <div className="flex min-h-screen w-full">
        <div className="flex  w-full flex-col">
          <DashboardNav />
          <div className="flex flex-col">
            <div className="flex items-center justify-between border-b px-8 py-4">
              <p className="text-2xl font-medium">Cancelled Pre-Orders</p>
              <div className="flex gap-4">
                <button className="button-oulined" type="button">
                  <img src="/DashboardImages/MailStar.png" alt="dekalo" className="icon-style" />
                  <img src="/DashboardImages/MailStar-dark.png" alt="dekalo" className="dark-icon-style" />
                  <p>Start Email Campaign</p>
                </button>
                <div className="border-l"></div>
              </div>
            </div>

            <div className="max-sm-my-4 flex w-full gap-6 px-8  max-md:flex-col max-md:px-0 max-sm:px-3 md:my-8">
              <div className="w-full">
                <CancelledOrders />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
