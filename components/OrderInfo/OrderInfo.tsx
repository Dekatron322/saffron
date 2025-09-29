import React from "react"
import { GoChevronUp } from "react-icons/go"

const OrderInfo = () => {
  return (
    <div className="flex flex-col rounded-md border ">
      <div className=" flex w-full  gap-2 border-b p-4">
        <p className="text-lg font-semibold">Status</p>
        <div className="flex items-center justify-center gap-1 rounded-full bg-[#FBF4EC]  px-2 py-1 text-xs text-[#D28E3D]">
          <span className="size-2 rounded-full bg-[#D28E3D]"></span>
          Pending
        </div>
      </div>
      <div className="flex justify-between gap-3 p-4">
        <div className="w-3/5 border-r  ">
          <div className=" flex items-center gap-2 ">
            <GoChevronUp />
            <p>Order Details</p>
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
            <p>Order Specifications</p>
          </div>
          <div className="pr-3">
            <ul className="my-2 border-t">
              <li className="li__style mt-3">Product: Altima Elite</li>
              <li className="li__style mt-3">Size: 96&quot; x 42&quot;</li>
              <li className="li__style mt-3">Frame Type: Reinforced</li>
              <li className="li__style mt-3">Finish: Glass – Frosted</li>
              <li className="li__style mt-3">Handle Placement: Right</li>
              <li className="li__style mt-3">Smart Features:</li>
              <li className="li__style mt-3">
                Video Doorbell, Intercom System, Camera, Alexa Integration, Wi-Fi Connectivity, Battery Backupt
              </li>
              <li className="li__style mt-3">Security Features: Reinforced Lock, Anti-theft Alarm, Motion Sensor</li>
              <li className="li__style mt-3">Installation Type: Residential</li>
              <li className="li__style mt-3">Preferred Date: December 15, 2024</li>
              <li className="li__style mt-3">Special Instructions: Install on the rear entrance of the property.</li>
              <li className="li__style mt-3">Extended Warranty: Yes</li>
              <li className="li__style mt-3">On-Site Support: Yes</li>
              <li className="li__style mt-3">Payment Method: Razor Pay</li>
            </ul>
          </div>
          <div className="mt-5 flex items-center gap-2 ">
            <GoChevronUp />
            <p>Payment Details</p>
          </div>
          <div className="pr-3">
            <ul className="my-2 border-t">
              <li className="li__style mt-3">Total Amount: ₦300,000</li>
              <li className="li__style mt-3">30% Payment (Paid): ₦90,000 (Paid on 2024-12-20)</li>
              <li className="li__style mt-3">70% Payment (Pending): ₦210,000</li>
              <li className="li__style mt-3">Payment Method: Bank Transfer</li>
              <li className="li__style mt-3">Transaction ID: TXN987654321</li>
            </ul>
          </div>
          <div className="mt-5 flex items-center gap-2 ">
            <GoChevronUp />
            <p>Order Timeline</p>
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
            <p>Order Timeline</p>
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
          <p className="mt-5">Admin Activity Report</p>
          <p className="li__style mt-2">Reminder Sent on 26/12/2024 8:30am</p>
        </div>
      </div>
    </div>
  )
}

export default OrderInfo
