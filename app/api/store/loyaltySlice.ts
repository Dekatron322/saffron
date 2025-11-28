// src/store/loyaltySlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { AppDispatch, RootState } from "./store"
import axios from "axios"
import { API_CONFIG } from "../config/api"

interface LoyaltyPointsConversion {
  pointsConversionId: number
  organisationId: number
  currencyCode: string
  points: number
  rateValue: number
}

interface CreateLoyaltyConversionPayload {
  currencyCode: string
  points: number
  rateValue: number
  organisationId: number
}

interface LoyaltyState {
  loyaltyConversion: LoyaltyPointsConversion | null
  loading: boolean
  error: string | null
  success: boolean
}

const initialState: LoyaltyState = {
  loyaltyConversion: null,
  loading: false,
  error: null,
  success: false,
}

const loyaltySlice = createSlice({
  name: "loyalty",
  initialState,
  reducers: {
    createLoyaltyConversionStart(state) {
      state.loading = true
      state.error = null
      state.success = false
    },
    createLoyaltyConversionSuccess(state, action: PayloadAction<LoyaltyPointsConversion>) {
      state.loyaltyConversion = action.payload
      state.loading = false
      state.success = true
      state.error = null
    },
    createLoyaltyConversionFailure(state, action: PayloadAction<string>) {
      state.loading = false
      state.error = action.payload
      state.success = false
    },
    resetLoyaltyStatus(state) {
      state.success = false
      state.error = null
    },
    clearLoyaltyConversion(state) {
      state.loyaltyConversion = null
    },
  },
})

// Thunk for creating loyalty points conversion
export const createLoyaltyConversion =
  (conversionData: CreateLoyaltyConversionPayload) => async (dispatch: AppDispatch) => {
    try {
      dispatch(createLoyaltyConversionStart())

      const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken")
      if (!token) {
        throw new Error("No authentication token found")
      }

      const response = await axios.post(
        `${API_CONFIG.BASE_URL}/order-service/api/v1/loyaltyPointsConversions/create-loyalty-conversion`,
        {
          currencyCode: conversionData.currencyCode,
          points: conversionData.points,
          rateValue: conversionData.rateValue,
          organisationId: conversionData.organisationId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      )

      const responseData = response.data

      const loyaltyConversion: LoyaltyPointsConversion = {
        pointsConversionId: responseData.pointsConversionId,
        organisationId: responseData.organisationId,
        currencyCode: responseData.currencyCode,
        points: responseData.points,
        rateValue: responseData.rateValue,
      }

      dispatch(createLoyaltyConversionSuccess(loyaltyConversion))

      return {
        success: true,
        data: loyaltyConversion,
      }
    } catch (error: any) {
      let errorMessage = "Failed to create loyalty points conversion"
      if (error.response?.data) {
        errorMessage = error.response.data.message || error.response.data.errorMessage || "API request failed"
      } else if (error.message) {
        errorMessage = error.message
      }
      dispatch(createLoyaltyConversionFailure(errorMessage))
      return {
        error: errorMessage,
      }
    }
  }

// Export all actions
export const {
  createLoyaltyConversionStart,
  createLoyaltyConversionSuccess,
  createLoyaltyConversionFailure,
  resetLoyaltyStatus,
  clearLoyaltyConversion,
} = loyaltySlice.actions

// Export the reducer
export default loyaltySlice.reducer

// Selectors
export const selectLoyaltyConversion = (state: RootState) => state.loyalty.loyaltyConversion
export const selectLoyaltyLoading = (state: RootState) => state.loyalty.loading
export const selectLoyaltyError = (state: RootState) => state.loyalty.error
export const selectLoyaltySuccess = (state: RootState) => state.loyalty.success
