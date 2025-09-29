"use client"
import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useDispatch, useSelector } from "react-redux"
import { ButtonModule } from "components/ui/Button/Button"
import { FormInputModule } from "components/ui/Input/Input"
import { notify } from "components/ui/Notification/Notification"
import { GoArrowLeft } from "react-icons/go"
import Link from "next/link"
import { forgotPassword, resetForgotPassword, selectForgotPassword } from "app/api/store/authSlice"
import { motion, AnimatePresence } from "framer-motion"

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

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const dispatch = useDispatch()
  const forgotPasswordState = useSelector(selectForgotPassword)

  useEffect(() => {
    dispatch(resetForgotPassword())
  }, [dispatch])

  useEffect(() => {
    if (forgotPasswordState.success) {
      localStorage.setItem(
        "forgotPasswordData",
        JSON.stringify({
          email: email,
          maskedEmail: forgotPasswordState.maskedEmail,
          otpExpiryTime: forgotPasswordState.otpExpiryTime,
          otpIdentifier: forgotPasswordState.otpIdentifier,
        })
      )

      notify("success", "OTP Sent!", {
        description: "We've sent an OTP to your email address.",
        duration: 3000,
      })
      router.push("/reset-password")
    }

    if (forgotPasswordState.error) {
      notify("error", "Failed to send OTP", {
        description: forgotPasswordState.error,
      })
    }
  }, [forgotPasswordState, email, router])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)
    setError(null)

    try {
      await dispatch(forgotPassword(email) as any)
    } catch (err) {
      setError("Failed to process your request. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value)
  }

  const isButtonDisabled = loading || email.trim() === ""

  return (
    <motion.section
      initial="hidden"
      animate="visible"
      className="relative flex h-auto w-full flex-grow overflow-hidden bg-[#FFFFFF]"
    >
      <div className="grid h-screen w-full items-center md:grid-cols-2">
        {/* Centered login form container */}
        <motion.div
          className="flex h-full w-full items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex h-auto items-center justify-center rounded-lg max-sm:w-[95%] md:w-[500px] md:bg-[#FFFFFF] 2xl:w-[550px]">
            <motion.div className="w-full justify-center max-sm:p-4" variants={containerVariants}>
              <motion.div className="mb-4 flex flex-col items-center pb-5 text-center" variants={logoVariants}>
                <motion.img
                  src="/saffronLogo.png"
                  alt="profile"
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
                  Forgot Your Password?
                </motion.p>
                <motion.p className="text-[#131313]" variants={itemVariants}>
                  Enter the email address associated with your account, and we'll send you a link to reset your password
                </motion.p>
              </motion.div>

              <motion.form onSubmit={handleSubmit} variants={containerVariants}>
                <motion.div variants={itemVariants}>
                  <FormInputModule
                    label="Email"
                    type="email"
                    placeholder="saffronwellcare@gmail.com"
                    value={email}
                    onChange={handleEmailChange}
                    className="mb-3"
                  />
                </motion.div>

                <div className="mt-4 flex w-full items-center justify-between md:mb-10"></div>

                <motion.div variants={itemVariants}>
                  <ButtonModule
                    type="submit"
                    variant="primary"
                    size="lg"
                    disabled={isButtonDisabled}
                    className="w-full"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
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
                </motion.div>
              </motion.form>

              <motion.div variants={itemVariants}>
                <Link
                  href="/signin"
                  className="mt-4 flex w-full items-center justify-center gap-2 hover:text-[#00a4a6]"
                >
                  <motion.span whileHover={{ x: -5 }} className="flex items-center gap-2">
                    <GoArrowLeft />
                    <p>Back to login</p>
                  </motion.span>
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
            className="absolute right-[-50px] top-[-50px] h-64 w-64 rounded-full bg-white opacity-20"
            variants={circleVariants}
          ></motion.div>

          <motion.div
            className="absolute bottom-[-50px] left-[-50px] h-64 w-64 -translate-x-1/2 translate-y-1/2 rounded-full bg-white opacity-20"
            variants={circleVariants}
          ></motion.div>

          <div className="relative z-10 flex items-center justify-center">
            <div className="absolute -inset-4 left-1/2 h-[340px] w-[300px] -translate-x-1/2 translate-y-1/4 rounded-t-[100px] bg-white opacity-20"></div>
            <img
              src="/495d4bc982f3e84eababedb06343999b2de92fcf.gif"
              alt="profile"
              className="relative z-20  object-contain"
            />
          </div>
        </motion.div>
      </div>
    </motion.section>
  )
}

export default ForgotPassword
