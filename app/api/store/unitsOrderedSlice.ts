// src/store/unitsOrderedSlice.ts
import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit"
import { AppDispatch, RootState } from "./store"
import axios from "axios"
import { API_CONFIG } from "../config/api"

// Interfaces for the request body
interface UnitsOrderedRequest {
  startDate?: string
  endDate?: string
  pageNo: number
  pageSize: number
  sortBy: string
  unitType: string
  sortDir: string
}

// Interface for order items
interface OrderItem {
  historyId: number
  invoiceDate: string
  productName: string
  supplier: string
  type: string
  quantity: number
  pricePerUnit: number
  totalPrice: number
  unit: string
  customer: string | null
  status: string
  invoiceNo: number
}

// Interface for the response body
interface UnitsOrderedResponse {
  pageNo: number
  pageSize: number
  sortBy: string
  sortDir: string
  totalUnitsOrdered: number
  percentageChange: string
  totalOrders: OrderItem[]
}

// State interface
interface UnitsOrderedState {
  data: UnitsOrderedResponse | null
  loading: boolean
  error: string | null
  filters: {
    startDate: string
    endDate: string
    pageNo: number
    pageSize: number
    sortBy: string
    unitType: string
    sortDir: string
  }
}

// Initial state
const initialState: UnitsOrderedState = {
  data: null,
  loading: false,
  error: null,
  filters: {
    startDate: "",
    endDate: "",
    pageNo: 0,
    pageSize: 10,
    sortBy: "createdDate",
    unitType: "baseUnit",
    sortDir: "asc",
  },
}

// Create async thunk for fetching units ordered data
export const fetchUnitsOrderedData = createAsyncThunk<
  UnitsOrderedResponse,
  Partial<UnitsOrderedRequest> | void,
  {
    dispatch: AppDispatch
    state: RootState
    rejectValue: string
  }
>("unitsOrdered/fetchUnitsOrderedData", async (filters = {}, { rejectWithValue, getState }) => {
  try {
    const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken")
    if (!token) throw new Error("No authentication token found")

    // Get current state to use as fallback
    const state = getState()
    const currentFilters = state.unitsOrdered.filters

    // Use default values from initialState if not provided, otherwise use current filters
    const requestBody: UnitsOrderedRequest = {
      pageNo: currentFilters.pageNo,
      pageSize: currentFilters.pageSize,
      sortBy: currentFilters.sortBy,
      unitType: currentFilters.unitType,
      sortDir: currentFilters.sortDir,
      ...filters,
    }

    // Remove startDate and endDate if they are empty strings
    if (requestBody.startDate === "") {
      delete requestBody.startDate
    }
    if (requestBody.endDate === "") {
      delete requestBody.endDate
    }

    const response = await axios.post<UnitsOrderedResponse>(
      `${API_CONFIG.BASE_URL}/supplier-service/api/v1/supplierDashboard/units-ordered/summary`,
      requestBody,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        timeout: 10000,
      }
    )

    return response.data
  } catch (error: any) {
    let errorMessage = "Failed to fetch units ordered data"

    if (axios.isAxiosError(error)) {
      if (error.code === "ECONNABORTED") {
        errorMessage = "Request timeout - please try again"
      } else if (error.response?.status === 401) {
        errorMessage = "Authentication failed - please login again"
      } else if (error.response?.status === 403) {
        errorMessage = "You don't have permission to access this data"
      } else if (error.response?.status === 404) {
        errorMessage = "API endpoint not found"
      } else if (error.response?.status === 500) {
        errorMessage = "Server error - please try again later"
      } else if (error.response?.data) {
        const apiError = error.response.data
        errorMessage = apiError.errorMessage || apiError.message || "API request failed"
      } else if (error.request) {
        errorMessage = "No response received from server - check your connection"
      }
    } else if (error?.message) {
      errorMessage = error.message
    }

    console.error("Units ordered data fetch error:", error)
    return rejectWithValue(errorMessage)
  }
})

// Create the slice
const unitsOrderedSlice = createSlice({
  name: "unitsOrdered",
  initialState,
  reducers: {
    // Action to set filters
    setFilters: (state, action: PayloadAction<Partial<UnitsOrderedState["filters"]>>) => {
      state.filters = { ...state.filters, ...action.payload }
      // Reset page number to 0 when filters change (except pageNo itself)
      if (action.payload.pageNo === undefined) {
        state.filters.pageNo = 0
      }
    },

    // Action to reset filters to initial state
    resetFilters: (state) => {
      state.filters = initialState.filters
    },

    // Action to clear error
    clearError: (state) => {
      state.error = null
    },

    // Action to clear all data
    clearData: (state) => {
      state.data = null
      state.error = null
      state.loading = false
    },

    // Action to set unit type
    setUnitType: (state, action: PayloadAction<string>) => {
      state.filters.unitType = action.payload
      state.filters.pageNo = 0 // Reset to first page when unit type changes
    },

    // Action to set page number
    setPage: (state, action: PayloadAction<number>) => {
      state.filters.pageNo = action.payload
    },

    // Action to set page size
    setPageSize: (state, action: PayloadAction<number>) => {
      state.filters.pageSize = action.payload
      state.filters.pageNo = 0
    },

    // Action to set date range
    setDateRange: (state, action: PayloadAction<{ startDate: string; endDate: string }>) => {
      state.filters.startDate = action.payload.startDate
      state.filters.endDate = action.payload.endDate
      state.filters.pageNo = 0
    },
  },
  extraReducers: (builder) => {
    builder
      // Handle pending state
      .addCase(fetchUnitsOrderedData.pending, (state) => {
        state.loading = true
        state.error = null
      })
      // Handle fulfilled state
      .addCase(fetchUnitsOrderedData.fulfilled, (state, action: PayloadAction<UnitsOrderedResponse>) => {
        state.loading = false
        state.data = action.payload
        state.error = null

        // Update page number from response to stay in sync
        if (action.payload.pageNo !== undefined) {
          state.filters.pageNo = action.payload.pageNo
        }
      })
      // Handle rejected state
      .addCase(fetchUnitsOrderedData.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  },
})

// Export actions
export const { setFilters, resetFilters, clearError, clearData, setUnitType, setPage, setPageSize, setDateRange } =
  unitsOrderedSlice.actions

// Selectors
export const selectUnitsOrderedData = (state: RootState) => state.unitsOrdered.data
export const selectUnitsOrderedLoading = (state: RootState) => state.unitsOrdered.loading
export const selectUnitsOrderedError = (state: RootState) => state.unitsOrdered.error
export const selectUnitsOrderedFilters = (state: RootState) => state.unitsOrdered.filters

// Selector for orders list
export const selectOrders = (state: RootState) => state.unitsOrdered.data?.totalOrders || []

// Selector for summary statistics
export const selectUnitsOrderedSummary = (state: RootState) => {
  const data = state.unitsOrdered.data
  if (!data) return null

  return {
    totalUnitsOrdered: data.totalUnitsOrdered,
    percentageChange: data.percentageChange,
  }
}

// Selector for total units ordered number
export const selectTotalUnitsOrdered = (state: RootState) => state.unitsOrdered.data?.totalUnitsOrdered || 0

// Selector for percentage change
export const selectUnitsPercentageChange = (state: RootState) => state.unitsOrdered.data?.percentageChange || null

// Thunk action to fetch data with current filters
export const fetchUnitsOrderedWithCurrentFilters = () => async (dispatch: AppDispatch, getState: () => RootState) => {
  const currentFilters = selectUnitsOrderedFilters(getState())
  return dispatch(fetchUnitsOrderedData(currentFilters))
}

export default unitsOrderedSlice.reducer
