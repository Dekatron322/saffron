"use client"
import DashboardNav from "components/Navbar/DashboardNav"
import CardMenu from "components/ui/CardMenu/card-menu"
import OverviewCard from "components/ui/CardMenu/overview-card"
import RecentActivityTable from "components/Tables/RecentActivityTable"

export default function Dashboard() {
  return (
    // <ProtectedRoute>
    <section className="h-auto w-full bg-[#F4F9F8]">
      <div className="flex min-h-screen w-full">
        <div className="flex w-full flex-col">
          <DashboardNav />
          <div className="flex flex-col">
            <div className="max-sm-my-4 flex w-full gap-6 px-8 max-md:flex-col  max-sm:px-3 max-sm:py-4 md:my-8">
              <div className="w-full">
                <CardMenu />
                <OverviewCard />
                {/* <RecentActivityTable /> */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
    // </ProtectedRoute>
  )
}
