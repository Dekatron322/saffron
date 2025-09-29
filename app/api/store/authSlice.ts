// src/store/authSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { AppDispatch, RootState } from "./store"
import axios from "axios"
import { API_CONFIG } from "../config/api"

interface UserDetails {
  userId: number | null
  userName: string | null
  email: string | null
  mobileNo: string | null
  organisationId: number | null
  orgName: string | null
  firstName: string | null
  lastName: string | null
  isActive: boolean | null
}

interface OrganizationDetails {
  id: number | null
  companyName: string | null
  gstin: string | null
  cin: string | null
  address: string | null
  licenseId: string | null
  logo: string | null
  shortName: string | null
  phoneNumber: string | null
  emailId: string | null
  businessType: string | null
  businessCategory: string | null
}

interface AuthState {
  token: string | null
  loading: boolean
  error: string | null
  isAuthenticated: boolean
  userDetails: UserDetails
  organizationDetails: OrganizationDetails
  forgotPassword: {
    loading: boolean
    error: string | null
    success: boolean
    maskedEmail: string | null
    otpExpiryTime: number | null
    otpIdentifier: string | null
  }
  resetPassword: {
    loading: boolean
    error: string | null
    success: boolean
    message: string | null
    nextAction: string | null
  }
  updateUser: {
    loading: boolean
    error: string | null
    success: boolean
  }
}

const getInitialToken = (): string | null => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("authToken") || sessionStorage.getItem("authToken")
  }
  return null
}

const initialState: AuthState = {
  token: getInitialToken(),
  loading: false,
  error: null,
  isAuthenticated: !!getInitialToken(),
  userDetails: {
    userId: null,
    userName: null,
    email: null,
    mobileNo: null,
    organisationId: null,
    orgName: null,
    firstName: null,
    lastName: null,
    isActive: null,
  },
  organizationDetails: {
    id: null,
    companyName: null,
    gstin: null,
    cin: null,
    address: null,
    licenseId: null,
    logo: null,
    shortName: null,
    phoneNumber: null,
    emailId: null,
    businessType: null,
    businessCategory: null,
  },
  forgotPassword: {
    loading: false,
    error: null,
    success: false,
    maskedEmail: null,
    otpExpiryTime: null,
    otpIdentifier: null,
  },
  resetPassword: {
    loading: false,
    error: null,
    success: false,
    message: null,
    nextAction: null,
  },
  updateUser: {
    loading: false,
    error: null,
    success: false,
  },
}

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginStart(state) {
      state.loading = true
      state.error = null
    },
    loginSuccess(state, action: PayloadAction<string>) {
      state.token = action.payload
      state.loading = false
      state.error = null
      state.isAuthenticated = true
    },
    loginFailure(state, action: PayloadAction<string>) {
      state.loading = false
      state.error = action.payload
      state.isAuthenticated = false
    },
    logout(state) {
      state.token = null
      state.isAuthenticated = false
      state.userDetails = initialState.userDetails
      state.organizationDetails = initialState.organizationDetails
    },
    getUserDetailsStart(state) {
      state.loading = true
      state.error = null
    },
    getUserDetailsSuccess(state, action: PayloadAction<UserDetails>) {
      state.userDetails = action.payload
      state.loading = false
      state.error = null
    },
    getUserDetailsFailure(state, action: PayloadAction<string>) {
      state.loading = false
      state.error = action.payload
    },
    getOrganizationDetailsStart(state) {
      state.loading = true
      state.error = null
    },
    getOrganizationDetailsSuccess(state, action: PayloadAction<OrganizationDetails>) {
      state.organizationDetails = action.payload
      state.loading = false
      state.error = null
    },
    getOrganizationDetailsFailure(state, action: PayloadAction<string>) {
      state.loading = false
      state.error = action.payload
    },
    forgotPasswordStart(state) {
      state.forgotPassword.loading = true
      state.forgotPassword.error = null
      state.forgotPassword.success = false
    },
    forgotPasswordSuccess(
      state,
      action: PayloadAction<{
        maskedEmail: string
        otpExpiryTime: number
        otpIdentifier: string
      }>
    ) {
      state.forgotPassword.loading = false
      state.forgotPassword.error = null
      state.forgotPassword.success = true
      state.forgotPassword.maskedEmail = action.payload.maskedEmail
      state.forgotPassword.otpExpiryTime = action.payload.otpExpiryTime
      state.forgotPassword.otpIdentifier = action.payload.otpIdentifier
    },
    forgotPasswordFailure(state, action: PayloadAction<string>) {
      state.forgotPassword.loading = false
      state.forgotPassword.error = action.payload
      state.forgotPassword.success = false
    },
    resetForgotPassword(state) {
      state.forgotPassword.loading = false
      state.forgotPassword.error = null
      state.forgotPassword.success = false
      state.forgotPassword.maskedEmail = null
      state.forgotPassword.otpExpiryTime = null
      state.forgotPassword.otpIdentifier = null
    },
    resetPasswordStart(state) {
      state.resetPassword.loading = true
      state.resetPassword.error = null
      state.resetPassword.success = false
      state.resetPassword.message = null
      state.resetPassword.nextAction = null
    },
    resetPasswordSuccess(
      state,
      action: PayloadAction<{
        message: string
        nextAction: string
      }>
    ) {
      state.resetPassword.loading = false
      state.resetPassword.error = null
      state.resetPassword.success = true
      state.resetPassword.message = action.payload.message
      state.resetPassword.nextAction = action.payload.nextAction
      state.forgotPassword = {
        loading: false,
        error: null,
        success: false,
        maskedEmail: null,
        otpExpiryTime: null,
        otpIdentifier: null,
      }
    },
    resetPasswordFailure(state, action: PayloadAction<string>) {
      state.resetPassword.loading = false
      state.resetPassword.error = action.payload
      state.resetPassword.success = false
      state.resetPassword.message = null
      state.resetPassword.nextAction = null
    },
    resetPasswordState(state) {
      state.resetPassword = {
        loading: false,
        error: null,
        success: false,
        message: null,
        nextAction: null,
      }
    },
    updateUserDetailsStart(state) {
      state.updateUser.loading = true
      state.updateUser.error = null
      state.updateUser.success = false
    },
    updateUserDetailsSuccess(state) {
      state.updateUser.loading = false
      state.updateUser.error = null
      state.updateUser.success = true
    },
    updateUserDetailsFailure(state, action: PayloadAction<string>) {
      state.updateUser.loading = false
      state.updateUser.error = action.payload
      state.updateUser.success = false
    },
    resetUpdateUserState(state) {
      state.updateUser = {
        loading: false,
        error: null,
        success: false,
      }
    },
  },
})

export const {
  loginStart,
  loginSuccess,
  loginFailure,
  logout,
  getUserDetailsStart,
  getUserDetailsSuccess,
  getUserDetailsFailure,
  getOrganizationDetailsStart,
  getOrganizationDetailsSuccess,
  getOrganizationDetailsFailure,
  forgotPasswordStart,
  forgotPasswordSuccess,
  forgotPasswordFailure,
  resetForgotPassword,
  resetPasswordStart,
  resetPasswordSuccess,
  resetPasswordFailure,
  resetPasswordState,
  updateUserDetailsStart,
  updateUserDetailsSuccess,
  updateUserDetailsFailure,
  resetUpdateUserState,
} = authSlice.actions

export const login = (username: string, password: string, rememberMe: boolean) => async (dispatch: AppDispatch) => {
  try {
    dispatch(loginStart())
    const response = await axios.post(`${API_CONFIG.BASE_URL}${API_CONFIG.AUTH_ENDPOINT}`, {
      userName: username,
      password: password,
    })

    if (response.data.authenticate) {
      const token = response.data.token
      dispatch(loginSuccess(token))

      if (rememberMe) {
        localStorage.setItem("authToken", token)
      } else {
        sessionStorage.setItem("authToken", token)
      }

      await dispatch(getUserDetails(token))
    } else {
      dispatch(loginFailure(response.data.message || "Authentication failed"))
    }
  } catch (error: any) {
    dispatch(loginFailure(error.response?.data?.message || "Login failed"))
  }
}

export const getUserDetails = (token: string) => async (dispatch: AppDispatch) => {
  try {
    dispatch(getUserDetailsStart())
    const response = await axios.get(
      "http://saffronwellcare.com/inventory-service/api/v1/inventory/user/getUserDetails",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )

    if (response.data.success) {
      const userDetails: UserDetails = {
        userId: response.data.userId,
        userName: response.data.userName,
        email: response.data.email,
        mobileNo: response.data.mobileNo,
        organisationId: response.data.organisationId,
        orgName: response.data.orgName,
        firstName: response.data.firstName,
        lastName: response.data.lastName,
        isActive: response.data.isActive,
      }
      dispatch(getUserDetailsSuccess(userDetails))

      if (response.data.organisationId) {
        await dispatch(getOrganizationDetails(response.data.organisationId))
      }
    } else {
      dispatch(getUserDetailsFailure(response.data.message || "Failed to fetch user details"))
    }
  } catch (error: any) {
    dispatch(getUserDetailsFailure(error.response?.data?.message || "Failed to fetch user details"))
  }
}

export const getOrganizationDetails = (orgId: number) => async (dispatch: AppDispatch) => {
  try {
    dispatch(getOrganizationDetailsStart())

    const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken")
    if (!token) {
      throw new Error("No authentication token found")
    }

    const response = await axios.get(`http://saffronwellcare.com/order-service/api/organisations/${orgId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })

    if (response.data) {
      const orgDetails: OrganizationDetails = {
        id: response.data.id,
        companyName: response.data.companyName,
        gstin: response.data.gstin,
        cin: response.data.cin,
        address: response.data.address,
        licenseId: response.data.licenseId,
        logo: response.data.logo,
        shortName: response.data.shortName,
        phoneNumber: response.data.phoneNumber,
        emailId: response.data.emailId,
        businessType: response.data.businessType,
        businessCategory: response.data.businessCategory,
      }
      dispatch(getOrganizationDetailsSuccess(orgDetails))
    } else {
      throw new Error("Invalid organization data format")
    }
  } catch (error: any) {
    let errorMessage = "Failed to fetch organization details"

    if (error.response?.data) {
      const apiError = error.response.data
      errorMessage = apiError.message || apiError.errorMessage || "API request failed"
    } else if (error.message) {
      errorMessage = error.message
    }

    dispatch(getOrganizationDetailsFailure(errorMessage))
  }
}

// In the authSlice.ts, update the updateUserDetails thunk action
export const updateUserDetails =
  (userData: { userName: string; firstName: string; lastName: string; email: string; mobileNo: string }) =>
  async (dispatch: AppDispatch) => {
    try {
      dispatch(updateUserDetailsStart())

      const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken")
      if (!token) {
        throw new Error("No authentication token found")
      }

      const response = await axios.put(
        "http://saffronwellcare.com/inventory-service/api/v1/inventory/user/updateUserDetails",
        {
          userName: userData.userName,
          firstName: userData.firstName,
          lastName: userData.lastName,
          email: userData.email,
          mobileNo: userData.mobileNo,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      )

      if (response.data.success) {
        dispatch(updateUserDetailsSuccess())
        // Refresh user details after successful update
        await dispatch(getUserDetails(token))
      } else {
        throw new Error(response.data.message || "Failed to update user details")
      }
    } catch (error: any) {
      let errorMessage = "Failed to update user details"

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message
      } else if (error.message) {
        errorMessage = error.message
      }

      dispatch(updateUserDetailsFailure(errorMessage))
    }
  }

export const initializeAuth = () => async (dispatch: AppDispatch) => {
  const token = getInitialToken()
  if (token) {
    try {
      dispatch(loginSuccess(token))
      await dispatch(getUserDetails(token))
    } catch (error) {
      localStorage.removeItem("authToken")
      sessionStorage.removeItem("authToken")
      dispatch(logout())
    }
  }
}

export const forgotPassword = (email: string) => async (dispatch: AppDispatch) => {
  try {
    dispatch(forgotPasswordStart())
    const response = await axios.post(
      "http://saffronwellcare.com/framework-service/dapi/sfwusers/reset-password/request-otp",
      { email }
    )

    if (response.data.success) {
      dispatch(
        forgotPasswordSuccess({
          maskedEmail: response.data.maskedEmail,
          otpExpiryTime: response.data.otpExpiryTime,
          otpIdentifier: response.data.otpIdentifier,
        })
      )
    } else {
      dispatch(forgotPasswordFailure(response.data.message || "Failed to send OTP"))
    }
  } catch (error: any) {
    dispatch(forgotPasswordFailure(error.response?.data?.message || "Failed to send OTP"))
  }
}

export const resetPasswordConfirm =
  (email: string, otp: string, newPassword: string, userType: string, otpIdentifier: string) =>
  async (dispatch: AppDispatch) => {
    try {
      dispatch(resetPasswordStart())
      const response = await axios.post(
        "http://saffronwellcare.com/framework-service/dapi/sfwusers/reset-password/confirm",
        { email, otp, newPassword, userType, otpIdentifier }
      )

      if (response.data.success) {
        dispatch(
          resetPasswordSuccess({
            message: response.data.message,
            nextAction: response.data.nextAction,
          })
        )
        localStorage.removeItem("forgotPasswordData")
      } else {
        dispatch(resetPasswordFailure(response.data.message || "Failed to reset password"))
      }
    } catch (error: any) {
      dispatch(resetPasswordFailure(error.response?.data?.message || "Failed to reset password"))
    }
  }

export const selectAuth = (state: RootState) => state.auth
export const selectUserDetails = (state: RootState) => state.auth.userDetails
export const selectOrganizationDetails = (state: RootState) => state.auth.organizationDetails
export const selectForgotPassword = (state: RootState) => state.auth.forgotPassword
export const selectResetPassword = (state: RootState) => state.auth.resetPassword
export const selectUpdateUser = (state: RootState) => state.auth.updateUser

export default authSlice.reducer
