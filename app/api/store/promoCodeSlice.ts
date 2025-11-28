// src/store/promoSlice.ts
import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit"
import { AppDispatch, RootState } from "./store"
import axios from "axios"
import { API_CONFIG } from "../config/api"

interface PromoCode {
  promoCodeId: number
  promoCode: string
  promoCodeType: string
  percentage: number
  expireDate: string
  useType: string
  eligibleCustomers: string
}

interface CreatePromoCodeRequest {
  promoCode: string
  promoCodeType: string
  percentage: number
  expireDate: string
  useType: string
  eligibleCustomers: string
}

interface UpdatePromoCodeRequest {
  promoCode: string
  promoCodeType: string
  percentage: number
  expireDate: string
  useType: string
  eligibleCustomers: string
}

interface RemoveCustomerRequest {
  promoCodeId: number
  customerId: number
}

interface PromoState {
  promoCodes: PromoCode[]
  loading: boolean
  error: string | null
  createLoading: boolean
  createError: string | null
  updateLoading: boolean
  updateError: string | null
  removeCustomerLoading: boolean
  removeCustomerError: string | null
  currentPromoCode: PromoCode | null
  currentPromoLoading: boolean
  currentPromoError: string | null
  promoCodeById: PromoCode | null
  promoCodeByIdLoading: boolean
  promoCodeByIdError: string | null
}

const initialState: PromoState = {
  promoCodes: [],
  loading: false,
  error: null,
  createLoading: false,
  createError: null,
  updateLoading: false,
  updateError: null,
  removeCustomerLoading: false,
  removeCustomerError: null,
  currentPromoCode: null,
  currentPromoLoading: false,
  currentPromoError: null,
  promoCodeById: null,
  promoCodeByIdLoading: false,
  promoCodeByIdError: null,
}

// Create async thunk for better TypeScript support
export const createPromoCode = createAsyncThunk(
  "promo/createPromoCode",
  async (promoData: CreatePromoCodeRequest, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken")
      if (!token) {
        throw new Error("No authentication token found")
      }

      const response = await axios.post<PromoCode>(
        `${API_CONFIG.BASE_URL}/customer-service/api/v1/promoCode`,
        promoData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      )

      return response.data
    } catch (error: any) {
      let errorMessage = "Failed to create promo code"

      if (error.response?.data) {
        const apiError = error.response.data
        if (typeof apiError === "string") {
          errorMessage = apiError
        } else if (apiError.message) {
          errorMessage = apiError.message
        } else if (apiError.errorMessage) {
          errorMessage = apiError.errorMessage
        }
      } else if (error.message) {
        errorMessage = error.message
      }

      return rejectWithValue(errorMessage)
    }
  }
)

// Async thunk for updating promo code by ID
export const updatePromoCode = createAsyncThunk(
  "promo/updatePromoCode",
  async (
    { promoCodeId, promoData }: { promoCodeId: number; promoData: UpdatePromoCodeRequest },
    { rejectWithValue }
  ) => {
    try {
      const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken")
      if (!token) {
        throw new Error("No authentication token found")
      }

      const response = await axios.put<PromoCode>(
        `${API_CONFIG.BASE_URL}/customer-service/api/v1/promoCode/${promoCodeId}`,
        promoData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      )

      return response.data
    } catch (error: any) {
      let errorMessage = "Failed to update promo code"

      if (error.response?.data) {
        const apiError = error.response.data
        if (typeof apiError === "string") {
          errorMessage = apiError
        } else if (apiError.message) {
          errorMessage = apiError.message
        } else if (apiError.errorMessage) {
          errorMessage = apiError.errorMessage
        }
      } else if (error.message) {
        errorMessage = error.message
      }

      return rejectWithValue(errorMessage)
    }
  }
)

// Async thunk for removing customer from eligible list
export const removeCustomerFromPromo = createAsyncThunk(
  "promo/removeCustomerFromPromo",
  async ({ promoCodeId, customerId }: RemoveCustomerRequest, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken")
      if (!token) {
        throw new Error("No authentication token found")
      }

      const response = await axios.post<PromoCode>(
        `${API_CONFIG.BASE_URL}/customer-service/api/v1/promoCode/${promoCodeId}/remove-customer/${customerId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      )

      return response.data
    } catch (error: any) {
      let errorMessage = "Failed to remove customer from promo code"

      if (error.response?.data) {
        const apiError = error.response.data
        if (typeof apiError === "string") {
          errorMessage = apiError
        } else if (apiError.message) {
          errorMessage = apiError.message
        } else if (apiError.errorMessage) {
          errorMessage = apiError.errorMessage
        }
      } else if (error.message) {
        errorMessage = error.message
      }

      return rejectWithValue(errorMessage)
    }
  }
)

// Async thunk for getting promo code by code
export const getPromoCodeByCode = createAsyncThunk(
  "promo/getPromoCodeByCode",
  async (promoCode: string, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken")
      if (!token) {
        throw new Error("No authentication token found")
      }

      const response = await axios.get<PromoCode>(
        `${API_CONFIG.BASE_URL}/customer-service/api/v1/promoCode/code/${promoCode}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      )

      return response.data
    } catch (error: any) {
      let errorMessage = "Failed to fetch promo code"

      if (error.response?.data) {
        const apiError = error.response.data
        if (typeof apiError === "string") {
          errorMessage = apiError
        } else if (apiError.message) {
          errorMessage = apiError.message
        } else if (apiError.errorMessage) {
          errorMessage = apiError.errorMessage
        }
      } else if (error.message) {
        errorMessage = error.message
      } else if (error.response?.status === 404) {
        errorMessage = "Promo code not found"
      }

      return rejectWithValue(errorMessage)
    }
  }
)

// Async thunk for getting promo code by ID
export const getPromoCodeById = createAsyncThunk(
  "promo/getPromoCodeById",
  async (promoCodeId: number, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken")
      if (!token) {
        throw new Error("No authentication token found")
      }

      const response = await axios.get<PromoCode>(
        `${API_CONFIG.BASE_URL}/customer-service/api/v1/promoCode/${promoCodeId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      )

      return response.data
    } catch (error: any) {
      let errorMessage = "Failed to fetch promo code"

      if (error.response?.data) {
        const apiError = error.response.data
        if (typeof apiError === "string") {
          errorMessage = apiError
        } else if (apiError.message) {
          errorMessage = apiError.message
        } else if (apiError.errorMessage) {
          errorMessage = apiError.errorMessage
        }
      } else if (error.message) {
        errorMessage = error.message
      } else if (error.response?.status === 404) {
        errorMessage = "Promo code not found"
      }

      return rejectWithValue(errorMessage)
    }
  }
)

const promoSlice = createSlice({
  name: "promo",
  initialState,
  reducers: {
    fetchPromosStart(state) {
      state.loading = true
      state.error = null
    },
    fetchPromosSuccess(state, action: PayloadAction<PromoCode[]>) {
      state.promoCodes = action.payload
      state.loading = false
      state.error = null
    },
    fetchPromosFailure(state, action: PayloadAction<string>) {
      state.loading = false
      state.error = action.payload
    },
    clearPromos(state) {
      state.promoCodes = []
    },
    clearCreateError(state) {
      state.createError = null
    },
    clearUpdateError(state) {
      state.updateError = null
    },
    clearRemoveCustomerError(state) {
      state.removeCustomerError = null
    },
    clearCurrentPromo(state) {
      state.currentPromoCode = null
      state.currentPromoError = null
    },
    clearPromoCodeById(state) {
      state.promoCodeById = null
      state.promoCodeByIdError = null
    },
    clearErrors(state) {
      state.error = null
      state.createError = null
      state.updateError = null
      state.removeCustomerError = null
      state.currentPromoError = null
      state.promoCodeByIdError = null
    },
    clearAll(state) {
      state.promoCodes = []
      state.currentPromoCode = null
      state.promoCodeById = null
      state.loading = false
      state.error = null
      state.createLoading = false
      state.createError = null
      state.updateLoading = false
      state.updateError = null
      state.removeCustomerLoading = false
      state.removeCustomerError = null
      state.currentPromoLoading = false
      state.currentPromoError = null
      state.promoCodeByIdLoading = false
      state.promoCodeByIdError = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Create promo code cases
      .addCase(createPromoCode.pending, (state) => {
        state.createLoading = true
        state.createError = null
      })
      .addCase(createPromoCode.fulfilled, (state, action: PayloadAction<PromoCode>) => {
        state.createLoading = false
        state.createError = null
        state.promoCodes.push(action.payload)
      })
      .addCase(createPromoCode.rejected, (state, action) => {
        state.createLoading = false
        state.createError = action.payload as string
      })
      // Update promo code cases
      .addCase(updatePromoCode.pending, (state) => {
        state.updateLoading = true
        state.updateError = null
      })
      .addCase(updatePromoCode.fulfilled, (state, action: PayloadAction<PromoCode>) => {
        state.updateLoading = false
        state.updateError = null

        // Update the promo code in the list
        const existingIndex = state.promoCodes.findIndex((promo) => promo.promoCodeId === action.payload.promoCodeId)
        if (existingIndex !== -1) {
          state.promoCodes[existingIndex] = action.payload
        } else {
          state.promoCodes.push(action.payload)
        }

        // Also update current promo code and promo code by ID if they match
        if (state.currentPromoCode?.promoCodeId === action.payload.promoCodeId) {
          state.currentPromoCode = action.payload
        }
        if (state.promoCodeById?.promoCodeId === action.payload.promoCodeId) {
          state.promoCodeById = action.payload
        }
      })
      .addCase(updatePromoCode.rejected, (state, action) => {
        state.updateLoading = false
        state.updateError = action.payload as string
      })
      // Remove customer from promo code cases
      .addCase(removeCustomerFromPromo.pending, (state) => {
        state.removeCustomerLoading = true
        state.removeCustomerError = null
      })
      .addCase(removeCustomerFromPromo.fulfilled, (state, action: PayloadAction<PromoCode>) => {
        state.removeCustomerLoading = false
        state.removeCustomerError = null

        // Update the promo code in the list
        const existingIndex = state.promoCodes.findIndex((promo) => promo.promoCodeId === action.payload.promoCodeId)
        if (existingIndex !== -1) {
          state.promoCodes[existingIndex] = action.payload
        }

        // Also update current promo code and promo code by ID if they match
        if (state.currentPromoCode?.promoCodeId === action.payload.promoCodeId) {
          state.currentPromoCode = action.payload
        }
        if (state.promoCodeById?.promoCodeId === action.payload.promoCodeId) {
          state.promoCodeById = action.payload
        }
      })
      .addCase(removeCustomerFromPromo.rejected, (state, action) => {
        state.removeCustomerLoading = false
        state.removeCustomerError = action.payload as string
      })
      // Get promo code by code cases
      .addCase(getPromoCodeByCode.pending, (state) => {
        state.currentPromoLoading = true
        state.currentPromoError = null
        state.currentPromoCode = null
      })
      .addCase(getPromoCodeByCode.fulfilled, (state, action: PayloadAction<PromoCode>) => {
        state.currentPromoLoading = false
        state.currentPromoError = null
        state.currentPromoCode = action.payload

        // Also update the promo code in the list if it exists
        const existingIndex = state.promoCodes.findIndex((promo) => promo.promoCodeId === action.payload.promoCodeId)
        if (existingIndex !== -1) {
          state.promoCodes[existingIndex] = action.payload
        } else {
          state.promoCodes.push(action.payload)
        }
      })
      .addCase(getPromoCodeByCode.rejected, (state, action) => {
        state.currentPromoLoading = false
        state.currentPromoError = action.payload as string
        state.currentPromoCode = null
      })
      // Get promo code by ID cases
      .addCase(getPromoCodeById.pending, (state) => {
        state.promoCodeByIdLoading = true
        state.promoCodeByIdError = null
        state.promoCodeById = null
      })
      .addCase(getPromoCodeById.fulfilled, (state, action: PayloadAction<PromoCode>) => {
        state.promoCodeByIdLoading = false
        state.promoCodeByIdError = null
        state.promoCodeById = action.payload

        // Also update the promo code in the list if it exists
        const existingIndex = state.promoCodes.findIndex((promo) => promo.promoCodeId === action.payload.promoCodeId)
        if (existingIndex !== -1) {
          state.promoCodes[existingIndex] = action.payload
        } else {
          state.promoCodes.push(action.payload)
        }
      })
      .addCase(getPromoCodeById.rejected, (state, action) => {
        state.promoCodeByIdLoading = false
        state.promoCodeByIdError = action.payload as string
        state.promoCodeById = null
      })
  },
})

export const {
  fetchPromosStart,
  fetchPromosSuccess,
  fetchPromosFailure,
  clearPromos,
  clearCreateError,
  clearUpdateError,
  clearRemoveCustomerError,
  clearCurrentPromo,
  clearPromoCodeById,
  clearErrors,
  clearAll,
} = promoSlice.actions

export const fetchAllPromos = () => async (dispatch: AppDispatch) => {
  try {
    dispatch(fetchPromosStart())

    const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken")
    if (!token) {
      throw new Error("No authentication token found")
    }

    const response = await axios.get<PromoCode[]>(`${API_CONFIG.BASE_URL}/customer-service/api/v1/promoCode`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })

    if (!Array.isArray(response.data)) {
      throw new Error("Invalid response format from server")
    }

    dispatch(fetchPromosSuccess(response.data))
  } catch (error: any) {
    let errorMessage = "Failed to fetch promo codes"

    if (error.response?.data) {
      const apiError = error.response.data
      if (typeof apiError === "string") {
        errorMessage = apiError
      } else if (apiError.message) {
        errorMessage = apiError.message
      } else if (apiError.errorMessage) {
        errorMessage = apiError.errorMessage
      }
    } else if (error.message) {
      errorMessage = error.message
    }

    dispatch(fetchPromosFailure(errorMessage))
  }
}

// Legacy thunk to get promo code by ID (kept for backward compatibility)
export const fetchPromoCodeById = (promoCodeId: number) => async (dispatch: AppDispatch) => {
  try {
    const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken")
    if (!token) {
      throw new Error("No authentication token found")
    }

    const response = await axios.get<PromoCode>(
      `${API_CONFIG.BASE_URL}/customer-service/api/v1/promoCode/${promoCodeId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    )

    return response.data
  } catch (error: any) {
    let errorMessage = "Failed to fetch promo code"

    if (error.response?.data) {
      const apiError = error.response.data
      if (typeof apiError === "string") {
        errorMessage = apiError
      } else if (apiError.message) {
        errorMessage = apiError.message
      } else if (apiError.errorMessage) {
        errorMessage = apiError.errorMessage
      }
    } else if (error.message) {
      errorMessage = error.message
    }

    throw new Error(errorMessage)
  }
}

export const selectPromos = (state: RootState) => ({
  promoCodes: state.promoCode.promoCodes,
  loading: state.promoCode.loading,
  error: state.promoCode.error,
  createLoading: state.promoCode.createLoading,
  createError: state.promoCode.createError,
  updateLoading: state.promoCode.updateLoading,
  updateError: state.promoCode.updateError,
  removeCustomerLoading: state.promoCode.removeCustomerLoading,
  removeCustomerError: state.promoCode.removeCustomerError,
  currentPromoCode: state.promoCode.currentPromoCode,
  currentPromoLoading: state.promoCode.currentPromoLoading,
  currentPromoError: state.promoCode.currentPromoError,
  promoCodeById: state.promoCode.promoCodeById,
  promoCodeByIdLoading: state.promoCode.promoCodeByIdLoading,
  promoCodeByIdError: state.promoCode.promoCodeByIdError,
})

export const selectPromoById = (promoCodeId: number) => (state: RootState) =>
  state.promoCode.promoCodes.find((promo) => promo.promoCodeId === promoCodeId)

export const selectPromoByCode = (promoCode: string) => (state: RootState) =>
  state.promoCode.promoCodes.find((promo) => promo.promoCode === promoCode)

export const selectCurrentPromoCode = (state: RootState) => state.promoCode.currentPromoCode
export const selectCurrentPromoLoading = (state: RootState) => state.promoCode.currentPromoLoading
export const selectCurrentPromoError = (state: RootState) => state.promoCode.currentPromoError

export const selectPromoCodeById = (state: RootState) => state.promoCode.promoCodeById
export const selectPromoCodeByIdLoading = (state: RootState) => state.promoCode.promoCodeByIdLoading
export const selectPromoCodeByIdError = (state: RootState) => state.promoCode.promoCodeByIdError

export const selectRemoveCustomerLoading = (state: RootState) => state.promoCode.removeCustomerLoading
export const selectRemoveCustomerError = (state: RootState) => state.promoCode.removeCustomerError

export default promoSlice.reducer
