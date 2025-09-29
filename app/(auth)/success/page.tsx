"use client"
import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import Footer from "components/Footer/Footer"

const Page: React.FC = () => {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showSuccessNotification, setShowSuccessNotification] = useState(false)
  const [showErrorNotification, setShowErrorNotification] = useState(false)
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)

  const router = useRouter() // Initialize the router

  const handleUsernameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(event.target.value)
  }

  const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value)
  }

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible)
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Simulate an API call or some asynchronous action
      await new Promise((resolve) => setTimeout(resolve, 1000))

      setShowSuccessNotification(true)
      setLoading(false)

      // Redirect to the success page
      router.push("/reset-password")
    } catch (error) {
      setError("Failed to sign in. Please try again.")
      setShowErrorNotification(true)
      setLoading(false)
    }
  }

  return (
    <>
      <div className="flex h-screen w-full items-center justify-center bg-[#FFFFFF]">
        <div className="auth flex rounded-[20px] bg-[#FFFFFF]  max-sm:w-[95%] ">
          <div className="w-full justify-center  py-[60px] max-sm:px-7">
            <div className=" flex w-full flex-col items-center justify-center gap-4 text-center">
              <h1 className="text-4xl font-bold text-[#131313]">Welcome!</h1>
              <img src="/saffronLogo.png" alt="profile" className="w-[197px]" />
              <p className="text-xl text-[#131313]">Effortless Pharmacy Management, One Click Away.</p>
            </div>
            <div className=" mt-20 flex items-center justify-center">
              <img src="/6a6c85e00cf9d3abf5325a36abb6f3e647b77d0f.gif" width={656.67} height={394} alt="profile" />
            </div>
          </div>
        </div>
        {/* <Footer /> */}
      </div>
      {showSuccessNotification && (
        <div className="animation-fade-in absolute bottom-16 m-5  flex h-[50px] w-[339px] transform items-center justify-center gap-2 rounded-md border border-[#0F920F] bg-[#F2FDF2] text-[#0F920F] shadow-[#05420514] md:right-16">
          <Image src="/check-circle.svg" width={16} height={16} alt="dekalo" />
          <span className="clash-font text-sm  text-[#0F920F]">Login Successfully</span>
        </div>
      )}
      {showErrorNotification && (
        <div className="animation-fade-in 0 absolute bottom-16  m-5 flex h-[50px] w-[339px] transform items-center justify-center gap-2 rounded-md border border-[#D14343] bg-[#FEE5E5] text-[#D14343] shadow-[#05420514] md:right-16">
          <Image src="/check-circle-failed.svg" width={16} height={16} alt="dekalo" />
          <span className="clash-font text-sm  text-[#D14343]">{error}</span>
        </div>
      )}
    </>
  )
}

export default Page
