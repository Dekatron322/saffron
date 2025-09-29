import React from "react"
import { GoChevronUp } from "react-icons/go"

const CustomerInfo = () => {
  return (
    <div className="flex flex-col rounded-md border bg-white">
      <div className="flex justify-between gap-3 p-4 max-sm:flex-col">
        <div className="max-sm:border-b max-sm:pb-2 md:w-1/2 md:border-r  ">
          <div className="flex items-center gap-2 ">
            <p className="font-medium">Account Info.</p>
          </div>
          <div className="pr-3">
            <ul className="mt-5 ">
              <li className="li__style mt-3">Name: Aisha Bello</li>
              <li className="li__style mt-3">Acct numbere: 1234567890 (Savings)</li>
              <li className="li__style mt-3">Email: aisha.bello@example.com</li>
              <li className="li__style mt-3">Phone: +234-812-345-6789</li>
              <li className="li__style mt-3">Address: 15 Crescent Avenue, Abuja, Nigeria</li>
            </ul>
          </div>
        </div>

        <div className="max-sm:border-b max-sm:pb-2 md:w-1/2 md:border-r  ">
          <div className="flex items-center gap-2 ">
            <p className="font-medium">Account Summary: </p>
          </div>
          <div className="pr-3">
            <ul className="mt-5 ">
              <li className="li__style mt-3">Total Amount Available: ₦540,000.</li>
              <li className="li__style mt-3">Total Amount Spent: ₦210,000.</li>
              <li className="li__style mt-3">Total Amount Recieved: ₦240,000.</li>
            </ul>
          </div>
          <p className="mt-5 font-medium">Communication Preferences:</p>
          <p className="li__style mt-2">Opted-in for promotional emails? (Yes/No)</p>
          <p className="li__style mt-2">Preferred communication method: Email/SMS.</p>
        </div>
        <div className="md:w-1/2">
          <p className=" font-medium">Admin Activity Report</p>
          <p className="li__style mt-4">Reminder Sent on 26/12/2024 8:30am</p>
        </div>
      </div>
    </div>
  )
}

export default CustomerInfo
