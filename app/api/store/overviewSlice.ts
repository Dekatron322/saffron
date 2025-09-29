// src/store/overviewSlice.ts
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit"
import { AppDispatch, RootState } from "./store"
import axios from "axios"
import { API_CONFIG } from "../config/api"

// Interfaces for the request body
interface OverviewRequest {
  startDate?: string
  endDate?: string
  pageNo: number
  pageSize: number
  sortBy: string
  sortDir: string
}

// Interfaces for purchase order items
interface ItemDetails {
  productId: number | null
  productName: string
  description: string
  categoryId: number
  manufacturer: string
  price: number | null
  productCode: string | null
  defaultMRP: number
  salePrice: number
  purchasePrice: number
  discountType: string
  saleDiscount: number
  openingStockQuantity: number
  minimumStockQuantity: number
  itemLocation: string
  taxRate: number
  inclusiveOfTax: boolean
  hsn: number
  branchId: number
  itemName: string
  batchNo: string
  modelNo: string
  size: string
  mfgDate: string
  expDate: string
  mrp: string
  unitId: number
  packagingSize: number
  baseUnit: any | null
  secondaryUnit: any | null
  reorderQuantity: number
  currentStockLevel: number
  reorderThreshold: number
  supplierId: number
  productStatus: boolean
  refundable: any | null
  stagedProductId: number
  paidAmount: number | null
  paymentType: any | null
  purchaseOrderId: number | null
}

interface PurchaseOrderItem {
  purchaseOrderItemId: number
  quantity: number
  unitPrice: number
  stagedProductId: number
  purchaseOrderId: number
  itemDetails: ItemDetails
}

// Interface for purchase orders
interface PurchaseOrder {
  purchaseOrderId: number
  supplierId: number
  orderDate: string
  expectedDeliveryDate: string
  totalAmount: number
  raised: boolean
  purchaseOrderItems: PurchaseOrderItem[]
  paymentStatus: string
  paymentCategory: string
  type: any | null
  status: string
  paidAmount: number
  linkPayment: boolean
  deductibleWalletAmount: number | null
  orderType: string
  discount: number | null
  orderStatus: string
}

// Interface for the response body
interface OverviewResponse {
  pageNo: number
  pageSize: number
  totalElements: number
  totalPages: number
  last: boolean
  totalPurchases: number
  percentageChange: string
  purchaseOrders: PurchaseOrder[]
}

// State interface
interface OverviewState {
  data: OverviewResponse | null
  loading: boolean
  error: string | null
  filters: {
    startDate: string
    endDate: string
    pageNo: number
    pageSize: number
    sortBy: string
    sortDir: string
  }
}

// Initial state
const initialState: OverviewState = {
  data: null,
  loading: false,
  error: null,
  filters: {
    startDate: "",
    endDate: "",
    pageNo: 0,
    pageSize: 5,
    sortBy: "purchaseOrder",
    sortDir: "asc",
  },
}

// Create async thunk for fetching overview data
export const fetchOverviewData = createAsyncThunk<
  OverviewResponse,
  Partial<OverviewRequest> | void,
  {
    dispatch: AppDispatch
    state: RootState
    rejectValue: string
  }
>("overview/fetchOverviewData", async (filters = {}, { rejectWithValue, getState }) => {
  try {
    const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken")
    if (!token) throw new Error("No authentication token found")

    // Get current state to use as fallback
    const state = getState()
    const currentFilters = state.overview.filters

    // Use default values from initialState if not provided, otherwise use current filters
    const requestBody: OverviewRequest = {
      pageNo: currentFilters.pageNo,
      pageSize: currentFilters.pageSize,
      sortBy: currentFilters.sortBy,
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

    const response = await axios.post<OverviewResponse>(
      `${API_CONFIG.BASE_URL}/supplier-service/api/v1/supplierDashboard/purchases/summary`,
      requestBody,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        timeout: 10000, // 10 second timeout
      }
    )

    return response.data
  } catch (error: any) {
    let errorMessage = "Failed to fetch overview data"

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

    console.error("Overview data fetch error:", error)
    return rejectWithValue(errorMessage)
  }
})

// Create the slice
const overviewSlice = createSlice({
  name: "overview",
  initialState,
  reducers: {
    // Action to set filters
    setFilters: (state, action: PayloadAction<Partial<OverviewState["filters"]>>) => {
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

    // Action to set page number
    setPage: (state, action: PayloadAction<number>) => {
      state.filters.pageNo = action.payload
    },

    // Action to set page size
    setPageSize: (state, action: PayloadAction<number>) => {
      state.filters.pageSize = action.payload
      state.filters.pageNo = 0 // Reset to first page when page size changes
    },

    // Action to set date range
    setDateRange: (state, action: PayloadAction<{ startDate: string; endDate: string }>) => {
      state.filters.startDate = action.payload.startDate
      state.filters.endDate = action.payload.endDate
      state.filters.pageNo = 0 // Reset to first page when date range changes
    },

    // Action to set sorting
    setSorting: (state, action: PayloadAction<{ sortBy: string; sortDir: string }>) => {
      state.filters.sortBy = action.payload.sortBy
      state.filters.sortDir = action.payload.sortDir
    },

    // Action to manually update a purchase order (for optimistic updates)
    updatePurchaseOrder: (state, action: PayloadAction<PurchaseOrder>) => {
      if (state.data && state.data.purchaseOrders) {
        const index = state.data.purchaseOrders.findIndex((po) => po.purchaseOrderId === action.payload.purchaseOrderId)
        if (index !== -1) {
          state.data.purchaseOrders[index] = action.payload
        }
      }
    },

    // Action to remove a purchase order
    removePurchaseOrder: (state, action: PayloadAction<number>) => {
      if (state.data && state.data.purchaseOrders) {
        state.data.purchaseOrders = state.data.purchaseOrders.filter((po) => po.purchaseOrderId !== action.payload)
        state.data.totalElements = Math.max(0, state.data.totalElements - 1)
      }
    },

    // Action to reset loading state
    resetLoading: (state) => {
      state.loading = false
    },
  },
  extraReducers: (builder) => {
    builder
      // Handle pending state
      .addCase(fetchOverviewData.pending, (state) => {
        state.loading = true
        state.error = null
      })
      // Handle fulfilled state
      .addCase(fetchOverviewData.fulfilled, (state, action: PayloadAction<OverviewResponse>) => {
        state.loading = false
        state.data = action.payload
        state.error = null

        // Update page number from response to stay in sync
        if (action.payload.pageNo !== undefined) {
          state.filters.pageNo = action.payload.pageNo
        }
      })
      // Handle rejected state
      .addCase(fetchOverviewData.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
        // Don't clear data on error to maintain previous state
      })
  },
})

// Export actions
export const {
  setFilters,
  resetFilters,
  clearError,
  clearData,
  setPage,
  setPageSize,
  setDateRange,
  setSorting,
  updatePurchaseOrder,
  removePurchaseOrder,
  resetLoading,
} = overviewSlice.actions

// Selectors
export const selectOverviewData = (state: RootState) => state.overview.data
export const selectOverviewLoading = (state: RootState) => state.overview.loading
export const selectOverviewError = (state: RootState) => state.overview.error
export const selectOverviewFilters = (state: RootState) => state.overview.filters

// Selector for purchase orders
export const selectPurchaseOrders = (state: RootState) => state.overview.data?.purchaseOrders || []

// Selector for summary statistics
export const selectSummaryStats = (state: RootState) => {
  const data = state.overview.data
  if (!data) return null

  return {
    totalPurchases: data.totalPurchases,
    percentageChange: data.percentageChange,
    totalElements: data.totalElements,
    totalPages: data.totalPages,
  }
}

// Selector for pagination info
export const selectPaginationInfo = (state: RootState) => {
  const data = state.overview.data
  const filters = state.overview.filters

  if (!data) {
    return {
      pageNo: filters.pageNo,
      pageSize: filters.pageSize,
      totalElements: 0,
      totalPages: 0,
      last: true,
    }
  }

  return {
    pageNo: data.pageNo,
    pageSize: data.pageSize,
    totalElements: data.totalElements,
    totalPages: data.totalPages,
    last: data.last,
  }
}

// Selector for current page purchase orders
export const selectCurrentPageOrders = (state: RootState) => {
  return selectPurchaseOrders(state)
}

// Selector for purchase order by ID
export const selectPurchaseOrderById = (purchaseOrderId: number) => (state: RootState) => {
  return state.overview.data?.purchaseOrders.find((po) => po.purchaseOrderId === purchaseOrderId) || null
}

// Selector for loading state with specific conditions
export const selectOverviewLoadingState = (state: RootState) => ({
  loading: state.overview.loading,
  hasData: !!state.overview.data,
  hasError: !!state.overview.error,
})

// Selector for date range
export const selectDateRange = (state: RootState) => ({
  startDate: state.overview.filters.startDate,
  endDate: state.overview.filters.endDate,
})

// Selector for sorting
export const selectSorting = (state: RootState) => ({
  sortBy: state.overview.filters.sortBy,
  sortDir: state.overview.filters.sortDir,
})

// Selector for total purchases amount
export const selectTotalPurchasesAmount = (state: RootState) => {
  const orders = selectPurchaseOrders(state)
  return orders.reduce((total, order) => total + (order.totalAmount || 0), 0)
}

// Selector for purchase orders count by status
export const selectPurchaseOrdersByStatus = (state: RootState) => {
  const orders = selectPurchaseOrders(state)
  const statusCount: Record<string, number> = {}

  orders.forEach((order) => {
    const status = order.status || "Unknown"
    statusCount[status] = (statusCount[status] || 0) + 1
  })

  return statusCount
}

// Thunk action to fetch data with current filters
export const fetchOverviewWithCurrentFilters = () => async (dispatch: AppDispatch, getState: () => RootState) => {
  const currentFilters = selectOverviewFilters(getState())
  return dispatch(fetchOverviewData(currentFilters))
}

// Thunk action to fetch next page
export const fetchNextPage = () => async (dispatch: AppDispatch, getState: () => RootState) => {
  const state = getState()
  const currentPage = state.overview.filters.pageNo
  const totalPages = state.overview.data?.totalPages || 0

  if (currentPage < totalPages - 1) {
    dispatch(setPage(currentPage + 1))
    return dispatch(fetchOverviewWithCurrentFilters())
  }
}

// Thunk action to fetch previous page
export const fetchPreviousPage = () => async (dispatch: AppDispatch, getState: () => RootState) => {
  const state = getState()
  const currentPage = state.overview.filters.pageNo

  if (currentPage > 0) {
    dispatch(setPage(currentPage - 1))
    return dispatch(fetchOverviewWithCurrentFilters())
  }
}

// Thunk action to refresh data
export const refreshOverviewData = () => async (dispatch: AppDispatch) => {
  dispatch(clearError())
  return dispatch(fetchOverviewWithCurrentFilters())
}

// Thunk action to fetch data with date range
export const fetchOverviewWithDateRange = (startDate: string, endDate: string) => async (dispatch: AppDispatch) => {
  dispatch(setDateRange({ startDate, endDate }))
  return dispatch(fetchOverviewWithCurrentFilters())
}

export default overviewSlice.reducer
