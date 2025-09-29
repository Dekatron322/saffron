"use client"
import React, { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { ButtonModule } from "components/ui/Button/Button"
import { notify } from "components/ui/Notification/Notification"

const ResetPin: React.FC = () => {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showSuccessNotification, setShowSuccessNotification] = useState(false)
  const [showErrorNotification, setShowErrorNotification] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [pin, setPin] = useState<string[]>(["", "", "", ""])
  const pinInputRefs = useRef<(HTMLInputElement | null)[]>([])

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

      setTimeout(() => router.push("/reset-password"), 1000)
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

  const handleRememberMeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRememberMe(event.target.checked)
  }

  const handlePinChange = (index: number, value: string) => {
    if (/^\d*$/.test(value) && value.length <= 1) {
      const newPin = [...pin]
      newPin[index] = value
      setPin(newPin)

      // Auto focus to next input
      if (value && index < 3) {
        pinInputRefs.current[index + 1]?.focus()
      }
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !pin[index] && index > 0) {
      pinInputRefs.current[index - 1]?.focus()
    }
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

  const isButtonDisabled = loading || pin.some((digit) => digit === "")

  return (
    <section className="relative flex h-auto w-full flex-grow overflow-auto bg-[#FFFFFF]">
      <div className="grid h-screen w-full items-center md:grid-cols-2">
        {/* Centered login form container */}
        <div className="flex h-full w-full items-center justify-center">
          <div className="flex h-auto items-center justify-center rounded-lg max-sm:w-[95%] md:w-[500px] md:bg-[#FFFFFF] 2xl:w-[550px]">
            <div className="w-full justify-center max-sm:p-4">
              <div className="mb-4 flex flex-col items-center  pb-5">
                <img src="/saffronLogo.png" alt="profile" className="w-[197px]" />
                <p className="mt-3 text-2xl font-semibold">Verify Your Email</p>
                <p className="text-center">
                  We sent a code to <span className="font-bold">Fatyma@gmail.com</span> Please enter the code below to
                  verify your email and continue.
                </p>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="mb-6 flex justify-center space-x-4">
                  {pin.map((digit, index) => (
                    <input
                      key={index}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handlePinChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      ref={(el: HTMLInputElement | null) => {
                        pinInputRefs.current[index] = el
                      }}
                      className="h-16 w-16 rounded-lg border border-gray-300 text-center text-2xl focus:border-[#00a4a6] focus:outline-none focus:ring-2 focus:ring-[#00a4a6]"
                      inputMode="numeric"
                      pattern="[0-9]*"
                    />
                  ))}
                </div>

                <ButtonModule
                  type="submit"
                  variant="primary"
                  size="lg"
                  disabled={isButtonDisabled}
                  className="mt-20 w-full"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <svg
                        className="mr-2 h-5 w-5 animate-spin"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                        ></path>
                      </svg>
                    </div>
                  ) : (
                    "Reset Password"
                  )}
                </ButtonModule>
              </form>
              <p className="mt-4 text-center">
                Didn't receive a code?{" "}
                <button className="text-[#00a4a6] transition-all duration-200 ease-in-out hover:text-[#07898c] focus:outline-none">
                  Resend Code
                </button>
              </p>
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

export default ResetPin
