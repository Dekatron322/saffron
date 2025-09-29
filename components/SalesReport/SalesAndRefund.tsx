"use client"
import ProductSalesTable from "components/Tables/ProductSalesTable"
import RefundReportCard from "components/ui/CardMenu/refund-report-card"

export default function SalesAndRefund() {
  return (
    <section className="h-auto w-full bg-[#F4F9F8]">
      <div className="flex min-h-screen w-full">
        <div className="flex w-full flex-col">
          <div className="flex flex-col">
            <div className="max-sm-my-4 flex w-full gap-6 max-md:flex-col">
              <div className="w-full">
                <RefundReportCard />

                <ProductSalesTable />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
