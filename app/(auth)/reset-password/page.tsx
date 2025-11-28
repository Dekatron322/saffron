"use client"
import React, { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { useDispatch, useSelector } from "react-redux"
import { ButtonModule } from "components/ui/Button/Button"
import { PasswordInputModule } from "components/ui/Input/PasswordInput"
import { notify } from "components/ui/Notification/Notification"
import { GoArrowLeft } from "react-icons/go"
import Link from "next/link"
import { resetPasswordConfirm, resetPasswordState, selectResetPassword } from "app/api/store/authSlice"
import { AnimatePresence, motion } from "framer-motion"

// Types and type guards
type ForgotPasswordData = {
  email: string
  maskedEmail: string
  otpIdentifier: string
}

function isForgotPasswordData(value: unknown): value is ForgotPasswordData {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as any).email === "string" &&
    typeof (value as any).maskedEmail === "string" &&
    typeof (value as any).otpIdentifier === "string"
  )
}

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      when: "beforeChildren",
      staggerChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 10,
    },
  },
}

const circleVariants = {
  hidden: { scale: 0 },
  visible: {
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 50,
      damping: 10,
    },
  },
}

const logoVariants = {
  hidden: { scale: 0.8, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 10,
    },
  },
}

const pinVariants = {
  hidden: { scale: 0.9, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 200,
      damping: 10,
    },
  },
}

const ResetPassword: React.FC = () => {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pin, setPin] = useState<string[]>(["", "", "", "", "", ""])
  const pinInputRefs = useRef<(HTMLInputElement | null)[]>([])
  const [forgotPasswordData, setForgotPasswordData] = useState<{
    email: string
    maskedEmail: string
    otpIdentifier: string
  } | null>(null)

  const router = useRouter()
  const dispatch = useDispatch()
  const resetPasswordStatus = useSelector(selectResetPassword)

  useEffect(() => {
    const storedData = localStorage.getItem("forgotPasswordData")
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData) as unknown
        if (isForgotPasswordData(parsedData)) {
          setForgotPasswordData(parsedData)
        } else {
          // If shape is invalid, treat as missing
          router.push("/forgot-password")
        }
      } catch {
        // If JSON is malformed, redirect to start over
        router.push("/forgot-password")
      }
    } else {
      router.push("/forgot-password")
    }
    dispatch(resetPasswordState())
  }, [dispatch, router])

  useEffect(() => {
    if (resetPasswordStatus.success) {
      notify("success", "Password Reset Successful!", {
        description: resetPasswordStatus.message ?? undefined,
        duration: 3000,
      })
      setTimeout(() => router.push("/signin"), 3000)
    }

    if (resetPasswordStatus.error) {
      notify("error", "Password Reset Failed", {
        description: resetPasswordStatus.error ?? undefined,
      })
    }
  }, [resetPasswordStatus, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // Validations
    if (password !== confirmPassword) {
      setError("Passwords don't match")
      setLoading(false)
      return
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters")
      setLoading(false)
      return
    }

    const otp = pin.join("")
    if (otp.length !== 6) {
      setError("Please enter a complete 6-digit OTP")
      setLoading(false)
      return
    }

    if (!forgotPasswordData) {
      setError("Session expired. Please try again.")
      setLoading(false)
      return
    }

    try {
      await dispatch(
        resetPasswordConfirm(
          forgotPasswordData.email,
          otp,
          password,
          "inventoryManager",
          forgotPasswordData.otpIdentifier
        ) as any
      )
    } catch (err) {
      setError("Failed to reset password. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handlePinChange = (index: number, value: string) => {
    if (/^\d*$/.test(value) && value.length <= 1) {
      const newPin = [...pin]
      newPin[index] = value
      setPin(newPin)
      if (value && index < 5) pinInputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !pin[index] && index > 0) {
      pinInputRefs.current[index - 1]?.focus()
    }
  }

  return (
    <motion.section
      initial="hidden"
      animate="visible"
      className="relative flex h-auto w-full grow overflow-hidden bg-[#FFFFFF]"
    >
      <div className="grid h-screen w-full items-center md:grid-cols-2">
        {/* Left side with form */}
        <motion.div
          className="flex size-full items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex h-auto items-center justify-center rounded-lg max-sm:w-[95%] md:w-[500px] md:bg-[#FFFFFF] 2xl:w-[550px]">
            <motion.div className="w-full justify-center max-sm:p-4" variants={containerVariants}>
              <motion.div className="mb-4 flex flex-col items-center pb-5 text-center" variants={logoVariants}>
                <motion.img
                  src="/saffronLogo.png"
                  alt="logo"
                  className="w-[197px]"
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  transition={{
                    type: "spring",
                    stiffness: 200,
                    damping: 10,
                    delay: 0.4,
                  }}
                />
                <motion.p className="text-2xl font-semibold text-[#131313]" variants={itemVariants}>
                  Set New Password
                </motion.p>
                <motion.p className="text-[#131313]" variants={itemVariants}>
                  {forgotPasswordData ? (
                    <>
                      We sent a code to <span className="font-medium">{forgotPasswordData.maskedEmail}</span>. Please
                      enter the code below to verify your email and set new password.
                    </>
                  ) : (
                    "Please enter the verification code and new password"
                  )}
                </motion.p>
              </motion.div>

              <motion.form onSubmit={handleSubmit} variants={containerVariants}>
                <motion.div className="mb-6 flex justify-center space-x-4" variants={containerVariants}>
                  {pin.map((digit, i) => (
                    <motion.input
                      key={i}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handlePinChange(i, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(i, e)}
                      ref={(el) => {
                        pinInputRefs.current[i] = el
                      }}
                      className="h-16 w-16 rounded-lg border border-gray-300 bg-transparent text-center text-2xl focus:border-[#00a4a6] focus:outline-none focus:ring-2 focus:ring-[#00a4a6]"
                      inputMode="numeric"
                      variants={pinVariants}
                      custom={i}
                      initial="hidden"
                      animate="visible"
                      transition={{ delay: 0.1 * i }}
                      whileFocus={{ scale: 1.05 }}
                    />
                  ))}
                </motion.div>

                <motion.div variants={itemVariants}>
                  <PasswordInputModule
                    label="Password"
                    placeholder="******"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="mb-4"
                  />
                </motion.div>

                <motion.div variants={itemVariants}>
                  <PasswordInputModule
                    label="Confirm Password"
                    placeholder="******"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="mb-6"
                  />
                </motion.div>

                <AnimatePresence>
                  {error && (
                    <motion.div
                      className="mb-4 text-center text-red-500"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      {error}
                    </motion.div>
                  )}
                </AnimatePresence>

                <motion.div variants={itemVariants}>
                  <ButtonModule
                    type="submit"
                    variant="primary"
                    size="lg"
                    disabled={loading || !password || !confirmPassword}
                    className="w-full"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
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
                        Processing...
                      </div>
                    ) : (
                      "Reset Password"
                    )}
                  </ButtonModule>
                </motion.div>
              </motion.form>

              <motion.div variants={itemVariants}>
                <Link href="/signin" className="mt-4 flex items-center justify-center gap-2 hover:text-[#00a4a6]">
                  <GoArrowLeft /> Back to login
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>

        {/* Right side with graphics */}
        <motion.div
          className="relative mb-4 flex h-screen flex-col items-center justify-center gap-2 overflow-hidden bg-[#00a4a6] max-sm:hidden"
          variants={containerVariants}
        >
          <motion.div
            className="absolute right-[-50px] top-[-50px] size-64 rounded-full bg-white opacity-20"
            variants={circleVariants}
          ></motion.div>

          <motion.div
            className="absolute bottom-[-50px] left-[-50px] size-64 rounded-full bg-white opacity-20"
            variants={circleVariants}
          ></motion.div>

          <motion.div
            className="relative z-10 flex items-center justify-center"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, type: "spring" }}
          >
            <div className="relative z-10 flex items-center justify-center">
              <div className="absolute -inset-4 left-1/2 h-[340px] w-[300px] -translate-x-1/2 translate-y-1/4 rounded-t-[100px] bg-white opacity-20"></div>
              <img
                src="/495d4bc982f3e84eababedb06343999b2de92fcf.gif"
                alt="profile"
                className="relative z-20  object-contain"
              />
            </div>
          </motion.div>
        </motion.div>
      </div>
    </motion.section>
  )
}

export default ResetPassword
