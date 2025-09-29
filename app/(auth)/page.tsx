"use client"
import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAppDispatch, useAppSelector } from "app/api/store/store"
import { motion } from "framer-motion"

import { notify } from "components/ui/Notification/Notification"
import { PasswordInputModule } from "components/ui/Input/PasswordInput"
import { ButtonModule } from "components/ui/Button/Button"
import { FormInputModule } from "components/ui/Input/Input"
import { login, selectAuth } from "app/api/store/authSlice"

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

const SignIn: React.FC = () => {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const dispatch = useAppDispatch()
  const router = useRouter()
  const { loading, error, isAuthenticated } = useAppSelector(selectAuth)

  useEffect(() => {
    const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken")
    if (token) {
      router.push("/dashboard")
    }
  }, [router])

  useEffect(() => {
    if (isAuthenticated) {
      notify("success", "Login successful!", {
        description: "Redirecting to dashboard...",
        duration: 1000,
      })
      setTimeout(() => router.push("/dashboard"), 1000)
    }
  }, [isAuthenticated, router])

  useEffect(() => {
    if (error) {
      notify("error", "Login failed", {
        description: error,
      })
    }
  }, [error])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    dispatch(login(username, password, rememberMe))
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

  const isButtonDisabled = loading || username.trim() === "" || password.trim() === ""

  return (
    <motion.section initial="hidden" animate="visible" className="relative flex h-auto w-full overflow-hidden">
      <div className="grid h-svh w-full items-center md:grid-cols-2">
        {/* Left side with graphics */}
        <motion.div
          className="relative mb-4 flex h-svh flex-col items-center justify-center gap-2 overflow-hidden bg-[#00a4a6] max-sm:hidden"
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

          <motion.img
            src="/amico.png"
            alt="profile"
            className="size-[510px]"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, type: "spring" }}
          />

          <motion.div className="mt-10 flex flex-col" variants={containerVariants}>
            <motion.h1 className="gilroy text-4xl font-bold text-[#ffffff]" variants={itemVariants}>
              Welcome!
            </motion.h1>
            <motion.p className="text-xl font-semibold text-[#ffffff]" variants={itemVariants}>
              Effortless Pharmacy Management, One Click Away.
            </motion.p>
          </motion.div>
        </motion.div>

        {/* Right side with login form */}
        <motion.div
          className="flex h-full w-full items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex h-auto items-center justify-center rounded-lg max-sm:w-[95%] md:w-[500px] md:bg-[#FFFFFF] 2xl:w-[550px]">
            <motion.div className="w-full justify-center max-sm:p-4" variants={containerVariants}>
              <motion.div className="mb-4 flex flex-col items-center pb-5" variants={logoVariants}>
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
                  e-Management Portal
                </motion.p>
                <motion.p className="text-[#131313]" variants={itemVariants}>
                  Please enter your email and password to access your account
                </motion.p>
              </motion.div>

              <motion.form onSubmit={handleSubmit} variants={containerVariants}>
                <motion.div variants={itemVariants}>
                  <FormInputModule
                    label="Username"
                    type="name"
                    placeholder="saffronwellcare@gmail.com"
                    value={username}
                    onChange={handleUsernameChange}
                    className="mb-3"
                  />
                </motion.div>

                <motion.div variants={itemVariants}>
                  <PasswordInputModule
                    label="Password"
                    placeholder="******"
                    value={password}
                    onChange={handlePasswordChange}
                    className="mb-3"
                  />
                </motion.div>

                <motion.div className="mb-10 mt-4 flex w-full items-center justify-between" variants={itemVariants}>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="rememberMe"
                      checked={rememberMe}
                      onChange={handleRememberMeChange}
                      className="h-4 w-4 rounded border-gray-300 bg-transparent text-[#00a4a6] focus:ring-[#00a4a6]"
                    />
                    <label htmlFor="rememberMe" className="cursor-pointer select-none">
                      Remember Me
                    </label>
                  </div>
                  <Link
                    href="/forgot-password"
                    className="flex justify-end text-[#00a4a6] transition-all duration-200 ease-in-out hover:text-[#07898c]"
                  >
                    Forgot Password?
                  </Link>
                </motion.div>

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
                      "Log In"
                    )}
                  </ButtonModule>
                </motion.div>
              </motion.form>

              <motion.p className="mt-4 text-center" variants={itemVariants}>
                Don&apos;t have an account?{" "}
                <Link
                  href="/signup"
                  className="text-[#00a4a6] transition-all duration-200 ease-in-out hover:text-[#07898c]"
                >
                  Sign Up
                </Link>
              </motion.p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </motion.section>
  )
}

export default SignIn
