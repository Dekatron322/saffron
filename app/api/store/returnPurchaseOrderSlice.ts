// src/store/returnPurchaseOrderSlice.ts
import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit"
import { AppDispatch, RootState } from "./store"
import axios from "axios"
import { API_CONFIG } from "../config/api"

// Interfaces for the request body
interface ReturnPurchaseOrderRequest {
  startDate?: string
  endDate?: string
  pageNo: number
  pageSize: number
  sortBy: string
  sortDir: string
}

// Interfaces for purchase order items
interface ReturnItemDetails {
  createdDate: string
  createdBy: string
  modifiedDate: string
  modifiedBy: string
  stagedProductId: number
  productName: string
  description: string
  categoryId: number
  manufacturer: string
  price: number | null
  stagedProductCode: string | null
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
  purchaseOrderId: number
  paidAmount: number
}

interface ReturnPurchaseOrderItem {
  purchaseOrderItemId: number
  quantity: number
  unitPrice: number
  stagedProductId: number
  purchaseOrderId: number
  itemDetails: ReturnItemDetails
}

// Interface for return purchase orders
interface ReturnPurchaseOrder {
  purchaseOrderId: number
  supplierId: number
  orderDate: string
  expectedDeliveryDate: string
  totalAmount: number
  raised: boolean
  purchaseOrderItems: ReturnPurchaseOrderItem[]
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
interface ReturnPurchaseOrderResponse {
  pageNo: number
  pageSize: number
  totalElements: number
  totalPages: number
  last: boolean
  growth: number
  totalReturnPurchase: number
  purchaseOrders: ReturnPurchaseOrder[]
}

// State interface
interface ReturnPurchaseOrderState {
  data: ReturnPurchaseOrderResponse | null
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
const initialState: ReturnPurchaseOrderState = {
  data: null,
  loading: false,
  error: null,
  filters: {
    startDate: "",
    endDate: "",
    pageNo: 0,
    pageSize: 70,
    sortBy: "purchaseOrderId",
    sortDir: "asc",
  },
}

// Create async thunk for fetching return purchase order data
export const fetchReturnPurchaseOrderData = createAsyncThunk<
  ReturnPurchaseOrderResponse,
  Partial<ReturnPurchaseOrderRequest> | void,
  {
    dispatch: AppDispatch
    state: RootState
    rejectValue: string
  }
>("returnPurchaseOrder/fetchReturnPurchaseOrderData", async (filters = {}, { rejectWithValue, getState }) => {
  try {
    const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken")
    if (!token) throw new Error("No authentication token found")

    // Get current state to use as fallback
    const state = getState()
    const currentFilters = state.returnPurchaseOrder.filters

    // Use default values from initialState if not provided, otherwise use current filters
    const requestBody: ReturnPurchaseOrderRequest = {
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

    const response = await axios.post<ReturnPurchaseOrderResponse>(
      `${API_CONFIG.BASE_URL}/supplier-service/api/v1/supplierDashboard/return-purchase-orders/summary`,
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
    let errorMessage = "Failed to fetch return purchase order data"

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

    console.error("Return purchase order data fetch error:", error)
    return rejectWithValue(errorMessage)
  }
})

// Create the slice
const returnPurchaseOrderSlice = createSlice({
  name: "returnPurchaseOrder",
  initialState,
  reducers: {
    // Action to set filters
    setFilters: (state, action: PayloadAction<Partial<ReturnPurchaseOrderState["filters"]>>) => {
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

    // Action to manually update a return purchase order (for optimistic updates)
    updateReturnPurchaseOrder: (state, action: PayloadAction<ReturnPurchaseOrder>) => {
      if (state.data && state.data.purchaseOrders) {
        const index = state.data.purchaseOrders.findIndex((po) => po.purchaseOrderId === action.payload.purchaseOrderId)
        if (index !== -1) {
          state.data.purchaseOrders[index] = action.payload
        }
      }
    },

    // Action to remove a return purchase order
    removeReturnPurchaseOrder: (state, action: PayloadAction<number>) => {
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
      .addCase(fetchReturnPurchaseOrderData.pending, (state) => {
        state.loading = true
        state.error = null
      })
      // Handle fulfilled state
      .addCase(fetchReturnPurchaseOrderData.fulfilled, (state, action: PayloadAction<ReturnPurchaseOrderResponse>) => {
        state.loading = false
        state.data = action.payload
        state.error = null

        // Update page number from response to stay in sync
        if (action.payload.pageNo !== undefined) {
          state.filters.pageNo = action.payload.pageNo
        }
      })
      // Handle rejected state
      .addCase(fetchReturnPurchaseOrderData.rejected, (state, action) => {
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
  updateReturnPurchaseOrder,
  removeReturnPurchaseOrder,
  resetLoading,
} = returnPurchaseOrderSlice.actions

// Selectors
export const selectReturnPurchaseOrderData = (state: RootState) => state.returnPurchaseOrder.data
export const selectReturnPurchaseOrderLoading = (state: RootState) => state.returnPurchaseOrder.loading
export const selectReturnPurchaseOrderError = (state: RootState) => state.returnPurchaseOrder.error
export const selectReturnPurchaseOrderFilters = (state: RootState) => state.returnPurchaseOrder.filters

// Selector for return purchase orders
export const selectReturnPurchaseOrders = (state: RootState) => state.returnPurchaseOrder.data?.purchaseOrders || []

// Selector for summary statistics
export const selectReturnSummaryStats = (state: RootState) => {
  const data = state.returnPurchaseOrder.data
  if (!data) return null

  return {
    totalReturnPurchase: data.totalReturnPurchase,
    growth: data.growth,
    totalElements: data.totalElements,
    totalPages: data.totalPages,
  }
}

// Selector for pagination info
export const selectReturnPaginationInfo = (state: RootState) => {
  const data = state.returnPurchaseOrder.data
  const filters = state.returnPurchaseOrder.filters

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

// Selector for current page return purchase orders
export const selectCurrentPageReturnOrders = (state: RootState) => {
  return selectReturnPurchaseOrders(state)
}

// Selector for return purchase order by ID
export const selectReturnPurchaseOrderById = (purchaseOrderId: number) => (state: RootState) => {
  return state.returnPurchaseOrder.data?.purchaseOrders.find((po) => po.purchaseOrderId === purchaseOrderId) || null
}

// Selector for loading state with specific conditions
export const selectReturnPurchaseOrderLoadingState = (state: RootState) => ({
  loading: state.returnPurchaseOrder.loading,
  hasData: !!state.returnPurchaseOrder.data,
  hasError: !!state.returnPurchaseOrder.error,
})

// Selector for date range
export const selectReturnDateRange = (state: RootState) => ({
  startDate: state.returnPurchaseOrder.filters.startDate,
  endDate: state.returnPurchaseOrder.filters.endDate,
})

// Selector for sorting
export const selectReturnSorting = (state: RootState) => ({
  sortBy: state.returnPurchaseOrder.filters.sortBy,
  sortDir: state.returnPurchaseOrder.filters.sortDir,
})

// Selector for total return purchases amount
export const selectTotalReturnPurchasesAmount = (state: RootState) => {
  const orders = selectReturnPurchaseOrders(state)
  return orders.reduce((total, order) => total + (order.totalAmount || 0), 0)
}

// Selector for return purchase orders count by status
export const selectReturnPurchaseOrdersByStatus = (state: RootState) => {
  const orders = selectReturnPurchaseOrders(state)
  const statusCount: Record<string, number> = {}

  orders.forEach((order) => {
    const status = order.status || "Unknown"
    statusCount[status] = (statusCount[status] || 0) + 1
  })

  return statusCount
}

// Thunk action to fetch data with current filters
export const fetchReturnPurchaseOrderWithCurrentFilters =
  () => async (dispatch: AppDispatch, getState: () => RootState) => {
    const currentFilters = selectReturnPurchaseOrderFilters(getState())
    return dispatch(fetchReturnPurchaseOrderData(currentFilters))
  }

// Thunk action to fetch next page
export const fetchReturnNextPage = () => async (dispatch: AppDispatch, getState: () => RootState) => {
  const state = getState()
  const currentPage = state.returnPurchaseOrder.filters.pageNo
  const totalPages = state.returnPurchaseOrder.data?.totalPages || 0

  if (currentPage < totalPages - 1) {
    dispatch(setPage(currentPage + 1))
    return dispatch(fetchReturnPurchaseOrderWithCurrentFilters())
  }
}

// Thunk action to fetch previous page
export const fetchReturnPreviousPage = () => async (dispatch: AppDispatch, getState: () => RootState) => {
  const state = getState()
  const currentPage = state.returnPurchaseOrder.filters.pageNo

  if (currentPage > 0) {
    dispatch(setPage(currentPage - 1))
    return dispatch(fetchReturnPurchaseOrderWithCurrentFilters())
  }
}

// Thunk action to refresh data
export const refreshReturnPurchaseOrderData = () => async (dispatch: AppDispatch) => {
  dispatch(clearError())
  return dispatch(fetchReturnPurchaseOrderWithCurrentFilters())
}

// Thunk action to fetch data with date range
export const fetchReturnPurchaseOrderWithDateRange =
  (startDate: string, endDate: string) => async (dispatch: AppDispatch) => {
    dispatch(setDateRange({ startDate, endDate }))
    return dispatch(fetchReturnPurchaseOrderWithCurrentFilters())
  }

export default returnPurchaseOrderSlice.reducer
