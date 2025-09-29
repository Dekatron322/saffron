import React from "react"
import { GoChevronUp } from "react-icons/go"

const PaymentInfo = () => {
  return (
    <div className="flex flex-col rounded-md border ">
      <div className=" flex w-full  gap-5 border-b p-4">
        <p className="text-lg font-semibold">Status:</p>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <p className="font-medium">30% payment</p>
            <div className="flex items-center justify-center gap-1 rounded-full bg-[#EEF5F0]  px-2 py-1 text-xs text-[#589E67]">
              <span className="size-2 rounded-full bg-[#589E67]"></span>
              Paid
            </div>
          </div>
          <div className="flex items-center gap-1">
            <p className="font-medium">70% payment</p>
            <div className="flex items-center justify-center gap-1 rounded-full bg-[#FBF4EC]  px-2 py-1 text-xs text-[#D28E3D]">
              <span className="size-2 rounded-full bg-[#D28E3D]"></span>
              Pending
            </div>
          </div>
        </div>
      </div>
      <div className="flex justify-between gap-3 p-4">
        <div className="w-3/5 border-r  ">
          <div className=" flex items-center gap-2 ">
            <GoChevronUp />
            <p className="font-medium">Order Details</p>
          </div>
          <div className="pr-3">
            <ul className="my-2 border-t">
              <li className="li__style mt-3">Door Model: Altima Classic Door</li>
              <li className="li__style mt-3">Quantity: 1000</li>
              <li className="li__style mt-3">Unit Price: ₦150,000</li>
              <li className="li__style mt-3">Total Cost: ₦300,000</li>
              <li className="li__style mt-3">Order Date: 2024-12-20</li>
            </ul>
          </div>
          <div className="mt-5 flex items-center gap-2 ">
            <GoChevronUp />
            <p className="font-medium">Payment Details</p>
          </div>
          <div className="pr-3">
            <ul className="my-2  border-t">
              <p className="li__style mt-3">30% Payment:</p>
              <li className="li__style ml-6 mt-3 list-disc">Paid ₦90,000 on 2024-12-20 via Razor Pay.</li>
              <p className="li__style mt-3">70% Payment:</p>
              <li className="li__style ml-6 mt-3 list-disc">
                Pending ₦210,000, due by <b className="underline">2024-12-30</b>.
              </li>
            </ul>
          </div>

          <div className="mt-5 flex items-center gap-2 ">
            <GoChevronUp />
            <p className="font-medium">Order Timeline</p>
          </div>
          <div className="pr-3">
            <ul className="my-2 border-t">
              <li className="li__style mt-3">Order Created: 2024-12-20, 10:00 AM</li>
              <li className="li__style mt-3">30% Payment Received: 2024-12-20, 10:15 AM</li>
              <li className="li__style mt-3">Order Confirmed: 2024-12-21, 2:00 PM</li>
            </ul>
          </div>
        </div>

        <div className="w-2/5">
          <div className="flex items-center gap-2 ">
            <GoChevronUp />
            <p className="font-medium">Customer Info.</p>
          </div>
          <div className="pr-3">
            <ul className="mt-5 ">
              <li className="li__style mt-3">Name: Aisha Bello</li>
              <li className="li__style mt-3">Email: aisha.bello@example.com</li>
              <li className="li__style mt-3">Phone: +234-812-345-6789</li>
              <li className="li__style mt-3">Address: 15 Crescent Avenue, Abuja, Nigeria</li>
              <li className="li__style mt-3">Notes: &quot;Please deliver after 5 PM.&quot;</li>
            </ul>
          </div>
          <p className="mt-5 font-medium">Admin Activity Report</p>
          <p className="li__style mt-2">Reminder Sent on 26/12/2024 8:30am</p>
        </div>
      </div>
    </div>
  )
}

export default PaymentInfo
