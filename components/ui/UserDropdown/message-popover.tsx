"use client"

import React, { useEffect, useRef, useState } from "react"
import Modal from "react-modal"
import { useRouter } from "next/navigation"

import UserIcon from "public/user-icon" // adjust the path as needed
import EditProfileIcon from "public/edit-profile-icon"
import PricingIcon from "public/pricing-icon"
import SupportIcon from "public/support-icon"
import EditIcon from "public/edit-icon"
import SettingIcon from "public/setting-icon"
import LogoutIcon from "public/logout-icon"
import LogoutModal from "../Modal/logout-modal"
import NotificationIcon from "public/Icons/notification-icon"
import Messageicon from "public/Icons/message-icon"

// Set the app element for accessibility (ensure this runs client-side)
if (typeof window !== "undefined") {
  Modal.setAppElement(document.body)
}

const MessageDropdown = () => {
  const [open, setOpen] = useState(false)
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close the dropdown if clicking outside of it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const router = useRouter()

  const handleConfirmLogout = () => {
    // TODO: Implement your logout logic (e.g., clear session or call signOut)
    console.log("User logged out")
    setIsLogoutModalOpen(false)
  }

  return (
    <>
      <div className="relative" ref={dropdownRef}>
        <div
          className="bg-grey-100 flex cursor-pointer items-center justify-center gap-2 rounded-full p-2 transition duration-150 ease-in-out hover:bg-gray-200 focus:bg-gray-200 focus:outline-none"
          onClick={() => setOpen(!open)}
          tabIndex={0}
        >
          <Messageicon />
        </div>
        {open && (
          <div className="absolute right-0 z-50 mt-2 w-56 rounded-md bg-white shadow-lg">
            <div className="flex items-center gap-2 border-b px-4 py-2">
              <div className="bg-primary flex size-10 items-center justify-center rounded-full text-white">MI</div>
              <div className="flex flex-col gap-0">
                <p className="m-0 inline-block font-bold leading-none text-[#202B3C]">Muritala Ibrahim</p>
                <small className="text-grey-400 m-0 inline-block text-sm leading-none">example@otech.com</small>
              </div>
            </div>
            <ul>
              <li>
                <a href="/profile" className="text-grey-400 flex gap-2 px-4 py-2 text-sm font-medium hover:bg-gray-100">
                  <EditProfileIcon /> Edit Profile
                </a>
              </li>
              <li>
                <a href="/profile" className="text-grey-400 flex gap-2 px-4 py-2 text-sm font-medium hover:bg-gray-100">
                  <PricingIcon /> Pricing
                </a>
              </li>
              <li className="flex w-full justify-between px-4 py-2">
                <a
                  href="/setting/organization"
                  className="text-grey-400 flex gap-2 text-sm font-medium hover:bg-gray-100"
                >
                  <SupportIcon /> Organizations
                </a>
                <EditIcon />
              </li>
              <li>
                <a href="/profile" className="text-grey-400 flex gap-2 px-4 py-2 text-sm font-medium hover:bg-gray-100">
                  <SettingIcon /> Settings
                </a>
              </li>
              <li>
                <button
                  onClick={() => setIsLogoutModalOpen(true)}
                  className="flex w-full justify-between gap-2 bg-[#F8F9FA] px-4 py-2 text-sm font-medium"
                >
                  Log out <LogoutIcon />
                </button>
              </li>
            </ul>
          </div>
        )}
      </div>

      <LogoutModal
        isOpen={isLogoutModalOpen}
        onRequestClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleConfirmLogout}
        loading={loading}
      />
    </>
  )
}

export default MessageDropdown
