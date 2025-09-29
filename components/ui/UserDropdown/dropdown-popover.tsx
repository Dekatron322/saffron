"use client"

import React, { useEffect, useRef, useState } from "react"
import Modal from "react-modal"
import { useRouter } from "next/navigation"
import { useDispatch, useSelector } from "react-redux"

import UserIcon from "public/user-icon"
import EditProfileIcon from "public/edit-profile-icon"
import PricingIcon from "public/pricing-icon"
import SupportIcon from "public/support-icon"
import EditIcon from "public/edit-icon"
import SettingIcon from "public/setting-icon"
import LogoutIcon from "public/logout-icon"
import LogoutModal from "../Modal/logout-modal"
import { AppDispatch, RootState } from "app/api/store/store"
import { logout } from "app/api/store/authSlice"

// Set the app element for accessibility
if (typeof window !== "undefined") {
  Modal.setAppElement(document.body)
}

const UserDropdown = () => {
  const [open, setOpen] = useState(false)
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const dispatch = useDispatch<AppDispatch>()
  const router = useRouter()
  const { userDetails, isAuthenticated, token } = useSelector((state: RootState) => state.auth)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Store token in localStorage when it changes
  useEffect(() => {
    if (token && typeof window !== "undefined") {
      localStorage.setItem("authToken", token)
    }
  }, [token])

  const getInitials = (name?: string | null) => {
    if (!name) return "US"
    const parts = name.trim().split(/\s+/).filter(Boolean)
    if (parts.length === 0) return "US"
    const firstInitial = parts[0]?.substring(0, 1).toUpperCase() ?? "U"
    let initials = firstInitial
    if (parts.length > 1) {
      const lastInitial = parts[parts.length - 1]?.substring(0, 1).toUpperCase() ?? "S"
      initials += lastInitial
    }
    return initials
  }

  const handleConfirmLogout = async () => {
    setLoading(true)
    try {
      // Clear storage
      localStorage.removeItem("authToken")
      sessionStorage.removeItem("authToken")

      // Dispatch logout action
      dispatch(logout())

      // Redirect to login
      router.push("/login")
    } catch (error) {
      console.error("Logout error:", error)
    } finally {
      setLoading(false)
      setIsLogoutModalOpen(false)
    }
  }

  if (!isAuthenticated) return null

  return (
    <>
      <div className="relative" ref={dropdownRef}>
        <div
          className="bg-grey-100 flex cursor-pointer items-center justify-center gap-2 rounded-full p-2 transition duration-150 ease-in-out hover:bg-gray-200 focus:bg-gray-200 focus:outline-none"
          onClick={() => setOpen(!open)}
          tabIndex={0}
          aria-label="User dropdown"
        >
          <div className="relative">
            <UserIcon />
            <div className="bg-primary absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full text-xs text-white">
              {getInitials(userDetails.firstName || userDetails.userName)}
            </div>
          </div>
        </div>

        {open && (
          <div className="absolute right-0 z-50 mt-2 w-72 overflow-hidden rounded-md bg-white shadow-lg">
            <div className="flex items-center gap-2 border-b px-4 py-2">
              <div className="bg-primary flex size-10 items-center justify-center rounded-full text-white">
                {getInitials(userDetails.firstName || userDetails.userName)}
              </div>
              <div className="flex flex-col gap-0">
                <p className="m-0 inline-block font-bold leading-none text-[#202B3C]">
                  {userDetails.firstName || userDetails.userName || "User"}
                </p>
                <small className="text-grey-400 m-0 inline-block text-sm leading-none">
                  {userDetails.email || "No email"}
                </small>
              </div>
            </div>

            <ul>
              <li>
                <a
                  href="/profile"
                  className="text-grey-400 flex gap-2 px-4 py-2 text-sm font-medium hover:bg-gray-100"
                  onClick={() => setOpen(false)}
                >
                  <EditProfileIcon /> View Profile
                </a>
              </li>
              <li>
                <a
                  href="/pricing"
                  className="text-grey-400 flex gap-2 px-4 py-2 text-sm font-medium hover:bg-gray-100"
                  onClick={() => setOpen(false)}
                >
                  <PricingIcon /> Pricing
                </a>
              </li>
              <li className="flex w-full justify-between px-4 py-2">
                <a
                  href="/settings/organization"
                  className="text-grey-400 flex gap-2 text-sm font-medium hover:bg-gray-100"
                  onClick={() => setOpen(false)}
                >
                  <SupportIcon /> Organization
                </a>
                <EditIcon />
              </li>
              <li>
                <a
                  href="/settings"
                  className="text-grey-400 flex gap-2 px-4 py-2 text-sm font-medium hover:bg-gray-100"
                  onClick={() => setOpen(false)}
                >
                  <SettingIcon /> Settings
                </a>
              </li>
              <li>
                <button
                  onClick={() => {
                    setOpen(false)
                    setIsLogoutModalOpen(true)
                  }}
                  className="flex w-full justify-between gap-2 bg-[#F8F9FA] px-4 py-2 text-sm font-medium hover:bg-gray-100"
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

export default UserDropdown
