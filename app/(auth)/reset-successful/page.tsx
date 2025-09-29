"use client"
import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { notify } from "components/ui/Notification/Notification"
import { GoArrowLeft } from "react-icons/go"
import Link from "next/link"

const ResetSuccessful: React.FC = () => {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [showSuccessNotification, setShowSuccessNotification] = useState(false)
  const [showErrorNotification, setShowErrorNotification] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)

  const router = useRouter()

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      notify("success", "Login successful!", {
        description: "Redirecting to dashboard...",
        duration: 1000,
      })

      setTimeout(() => router.push("/reset-pin"), 1000)
    } catch (error) {
      notify("error", "Login failed", {
        description: "Invalid credentials. Please try again.",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleUsernameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(event.target.value)
  }

  const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value)
  }

  const handleConfirmPasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmPassword(event.target.value)
  }

  const handleRememberMeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRememberMe(event.target.checked)
  }

  useEffect(() => {
    if (showSuccessNotification || showErrorNotification) {
      const timer = setTimeout(() => {
        setShowSuccessNotification(false)
        setShowErrorNotification(false)
      }, 5000)

      return () => clearTimeout(timer)
    }
  }, [showSuccessNotification, showErrorNotification])

  const isButtonDisabled = loading || username.trim() === ""

  return (
    <section className="relative flex h-auto w-full flex-grow overflow-hidden bg-[#FFFFFF]">
      <div className="grid h-screen w-full items-center md:grid-cols-2">
        {/* Centered login form container */}
        <div className="flex h-full w-full items-center justify-center">
          <div className="flex h-auto items-center justify-center rounded-lg max-sm:w-[95%] md:w-[500px] md:bg-[#FFFFFF] 2xl:w-[550px]">
            <div className="w-full justify-center max-sm:p-4">
              <div className="mb-4 flex flex-col items-center gap-5 pb-5 text-center">
                <img src="/saffronLogo.png" alt="profile" className="w-[197px]" />
                <p className="text-3xl font-semibold text-[#131313]">All Done</p>
                <p className="text-[#131313]">Your password has been reset successfully</p>
              </div>

              <Link href="/signin" className="mt-4 flex w-full items-center justify-center gap-2 hover:text-[#00a4a6] ">
                <GoArrowLeft />
                <p>Back to login</p>
              </Link>
            </div>
          </div>
        </div>
        <div className="relative mb-4 flex h-screen flex-col items-center justify-center gap-2 overflow-hidden bg-[#00a4a6] max-sm:hidden">
          {/* Top Circle */}
          <div className="absolute right-[-50px] top-[-50px] h-64 w-64 rounded-full bg-white opacity-20"></div>

          {/* Bottom Circle */}
          <div className="absolute bottom-0 left-0 h-64 w-64 -translate-x-1/2 translate-y-1/2 rounded-full bg-white opacity-20"></div>

          {/* Left Triangle */}

          {/* Centered GIF with decorative border */}
          <div className="relative z-10 flex items-center justify-center">
            <div className="absolute -inset-4 left-1/2 h-[340px] w-[300px] -translate-x-1/2 translate-y-1/4 rounded-t-[100px] bg-white opacity-20"></div>
            <img
              src="/495d4bc982f3e84eababedb06343999b2de92fcf.gif"
              alt="profile"
              className="relative z-20  object-contain"
            />
          </div>
        </div>
      </div>
    </section>
  )
}

export default ResetSuccessful
