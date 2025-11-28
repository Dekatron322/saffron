"use client"
import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

// Importing modular components
import { PasswordInputModule } from "components/ui/Input/PasswordInput"
import { ButtonModule } from "components/ui/Button/Button"
import Footer from "components/Footer/Footer"
import { FormInputModule } from "components/ui/Input/Input"
import { notify } from "components/ui/Notification/Notification"

const SignUp: React.FC = () => {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [email, setEmail] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showSuccessNotification, setShowSuccessNotification] = useState(false)
  const [showErrorNotification, setShowErrorNotification] = useState(false)
  const [rememberMe, setRememberMe] = useState(false) // New state for Remember Me checkbox

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

      setTimeout(() => router.push("/verify-email"), 1000)
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

  const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value)
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

  // Disable the button if loading or if either field is empty
  const isButtonDisabled =
    loading || username.trim() === "" || password.trim() === "" || email.trim() === "" || confirmPassword.trim() === ""

  return (
    <section className="relative flex h-auto w-full grow overflow-hidden bg-[#FFFFFF]">
      <div className="grid h-screen w-full items-center  md:grid-cols-2">
        <div className="relative mb-4 flex h-screen flex-col items-center justify-center gap-2 overflow-hidden bg-[#00a4a6] max-sm:hidden">
          {/* Top Circle */}
          <div className="absolute right-[-50px] top-[-50px] size-64   rounded-full bg-white opacity-20"></div>

          {/* Bottom Circle */}
          <div className="absolute bottom-0 left-0 size-64 -translate-x-1/2 translate-y-1/2 rounded-full bg-white opacity-20"></div>

          <img src="/amico.png" alt="profile" className="size-[510px]" />
          <div className="mt-10 flex flex-col ">
            <h1 className="text-4xl font-bold text-[#ffffff]">Welcome!</h1>
            <p className="text-xl text-[#ffffff]">Effortless Pharmacy Management, One Click Away.</p>
          </div>
        </div>

        {/* Centered login form container */}
        <div className="flex size-full items-center justify-center">
          <div className="flex h-auto items-center justify-center rounded-lg max-sm:w-[95%] md:w-[500px] md:bg-[#FFFFFF] 2xl:w-[550px]">
            <div className="w-full justify-center max-sm:p-4">
              <div className="mb-4 flex flex-col items-center  pb-5">
                <img src="/saffronLogo.png" alt="profile" className="w-[197px]" />
                <p className="text-2xl font-semibold text-[#131313]">e-Management Portal</p>
                <p className="text-[#131313] max-sm:text-center">
                  Please enter your email and password to Create an account
                </p>
              </div>
              <form onSubmit={handleSubmit}>
                <FormInputModule
                  label="Name"
                  type="text"
                  placeholder="John Doe"
                  value={username}
                  onChange={handleUsernameChange}
                  className="mb-3"
                />
                <FormInputModule
                  label="Email"
                  type="email"
                  placeholder="saffronwellcare@gmail.com"
                  value={email}
                  onChange={handleEmailChange}
                  className="mb-3"
                />

                <div className="w-full gap-2 md:flex">
                  <PasswordInputModule
                    label="Password"
                    placeholder="******"
                    value={password}
                    onChange={handlePasswordChange}
                    className="w-full"
                  />
                  <PasswordInputModule
                    label="Confirm Password"
                    placeholder="******"
                    value={confirmPassword}
                    onChange={handleConfirmPasswordChange}
                    className="w-full"
                  />
                </div>
                <div className="mb-10 mt-4 flex w-full items-center justify-between">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="rememberMe"
                      checked={rememberMe}
                      onChange={handleRememberMeChange}
                      className="size-4 rounded border-gray-300 text-[#00a4a6] focus:ring-[#00a4a6]"
                    />
                    <label htmlFor="rememberMe" className="cursor-pointer select-none">
                      Remember Me
                    </label>
                  </div>
                  <Link
                    href="/forgot-password"
                    className=" flex justify-end text-[#00a4a6] transition-all duration-200 ease-in-out hover:text-[#07898c] "
                  >
                    Forgot Password?
                  </Link>
                </div>

                <ButtonModule type="submit" variant="primary" size="lg" disabled={isButtonDisabled} className="w-full">
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <svg
                        className="mr-2 size-5 animate-spin"
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
                    "Log In"
                  )}
                </ButtonModule>
              </form>
              <p className="mt-4 text-center">
                Already have an account ?{" "}
                <Link
                  href="/signin"
                  className="text-[#00a4a6] transition-all duration-200 ease-in-out hover:text-[#07898c] "
                >
                  Log In
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default SignUp
