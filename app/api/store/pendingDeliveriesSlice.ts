// src/store/pendingDeliveriesSlice.ts
import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit"
import { AppDispatch, RootState } from "./store"
import axios from "axios"
import { API_CONFIG } from "../config/api"

// Interfaces for the request body
interface PendingDeliveriesRequest {
  startDate?: string
  endDate?: string
  pageNo: number
  pageSize: number
  sortBy: string
  sortDir: string
}

// Interfaces for purchase order items (reusing from overviewSlice)
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
interface PendingDeliveriesResponse {
  pageNo: number
  pageSize: number
  totalElements: number
  totalPages: number
  last: boolean
  growth: number
  totalPendingDelevery: number
  purchaseOrder: PurchaseOrder[]
}

// State interface
interface PendingDeliveriesState {
  data: PendingDeliveriesResponse | null
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
const initialState: PendingDeliveriesState = {
  data: null,
  loading: false,
  error: null,
  filters: {
    startDate: "",
    endDate: "",
    pageNo: 0,
    pageSize: 5,
    sortBy: "purchaseOrderId",
    sortDir: "asc",
  },
}

// Create async thunk for fetching pending deliveries data
export const fetchPendingDeliveriesData = createAsyncThunk<
  PendingDeliveriesResponse,
  Partial<PendingDeliveriesRequest> | void,
  {
    dispatch: AppDispatch
    state: RootState
    rejectValue: string
  }
>("pendingDeliveries/fetchPendingDeliveriesData", async (filters = {}, { rejectWithValue, getState }) => {
  try {
    const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken")
    if (!token) throw new Error("No authentication token found")

    // Get current state to use as fallback
    const state = getState()
    const currentFilters = state.pendingDeliveries.filters

    // Use default values from initialState if not provided, otherwise use current filters
    const requestBody: PendingDeliveriesRequest = {
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

    const response = await axios.post<PendingDeliveriesResponse>(
      `${API_CONFIG.BASE_URL}/supplier-service/api/v1/supplierDashboard/pending-deliveries/summary`,
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
    let errorMessage = "Failed to fetch pending deliveries data"

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

    console.error("Pending deliveries data fetch error:", error)
    return rejectWithValue(errorMessage)
  }
})

// Create the slice
const pendingDeliveriesSlice = createSlice({
  name: "pendingDeliveries",
  initialState,
  reducers: {
    // Action to set filters
    setFilters: (state, action: PayloadAction<Partial<PendingDeliveriesState["filters"]>>) => {
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
      if (state.data && state.data.purchaseOrder) {
        const index = state.data.purchaseOrder.findIndex((po) => po.purchaseOrderId === action.payload.purchaseOrderId)
        if (index !== -1) {
          state.data.purchaseOrder[index] = action.payload
        }
      }
    },

    // Action to remove a purchase order
    removePurchaseOrder: (state, action: PayloadAction<number>) => {
      if (state.data && state.data.purchaseOrder) {
        state.data.purchaseOrder = state.data.purchaseOrder.filter((po) => po.purchaseOrderId !== action.payload)
        state.data.totalElements = Math.max(0, state.data.totalElements - 1)
        state.data.totalPendingDelevery = Math.max(0, state.data.totalPendingDelevery - 1)
      }
    },

    // Action to mark purchase order as delivered
    // markAsDelivered: (state, action: PayloadAction<number>) => {
    //   if (state.data && state.data.purchaseOrder) {
    //     const index = state.data.purchaseOrder.findIndex((po) => po.purchaseOrderId === action.payload)
    //     if (index !== -1) {
    //       // Update the status to indicate delivered
    //       state.data.purchaseOrder[index].status = "DELIVERED"
    //       state.data.purchaseOrder[index].orderStatus = "DELIVERED"
    //     }
    //   }
    // },

    // Action to reset loading state
    resetLoading: (state) => {
      state.loading = false
    },
  },
  extraReducers: (builder) => {
    builder
      // Handle pending state
      .addCase(fetchPendingDeliveriesData.pending, (state) => {
        state.loading = true
        state.error = null
      })
      // Handle fulfilled state
      .addCase(fetchPendingDeliveriesData.fulfilled, (state, action: PayloadAction<PendingDeliveriesResponse>) => {
        state.loading = false
        state.data = action.payload
        state.error = null

        // Update page number from response to stay in sync
        if (action.payload.pageNo !== undefined) {
          state.filters.pageNo = action.payload.pageNo
        }
      })
      // Handle rejected state
      .addCase(fetchPendingDeliveriesData.rejected, (state, action) => {
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
  //   markAsDelivered,
  resetLoading,
} = pendingDeliveriesSlice.actions

// Selectors
export const selectPendingDeliveriesData = (state: RootState) => state.pendingDeliveries.data
export const selectPendingDeliveriesLoading = (state: RootState) => state.pendingDeliveries.loading
export const selectPendingDeliveriesError = (state: RootState) => state.pendingDeliveries.error
export const selectPendingDeliveriesFilters = (state: RootState) => state.pendingDeliveries.filters

// Selector for purchase orders
export const selectPendingPurchaseOrders = (state: RootState) => state.pendingDeliveries.data?.purchaseOrder || []

// Selector for summary statistics
export const selectPendingDeliveriesSummary = (state: RootState) => {
  const data = state.pendingDeliveries.data
  if (!data) return null

  return {
    // Use totalElements to reflect the total number of pending deliveries across all pages
    totalPendingDeliveries: data.totalElements,
    growth: data.growth,
    totalElements: data.totalElements,
    totalPages: data.totalPages,
  }
}

// Selector for pagination info
export const selectPendingDeliveriesPagination = (state: RootState) => {
  const data = state.pendingDeliveries.data
  const filters = state.pendingDeliveries.filters

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
export const selectCurrentPagePendingOrders = (state: RootState) => {
  return selectPendingPurchaseOrders(state)
}

// Selector for purchase order by ID
export const selectPendingPurchaseOrderById = (purchaseOrderId: number) => (state: RootState) => {
  return state.pendingDeliveries.data?.purchaseOrder.find((po) => po.purchaseOrderId === purchaseOrderId) || null
}

// Selector for loading state with specific conditions
export const selectPendingDeliveriesLoadingState = (state: RootState) => ({
  loading: state.pendingDeliveries.loading,
  hasData: !!state.pendingDeliveries.data,
  hasError: !!state.pendingDeliveries.error,
})

// Selector for date range
export const selectPendingDeliveriesDateRange = (state: RootState) => ({
  startDate: state.pendingDeliveries.filters.startDate,
  endDate: state.pendingDeliveries.filters.endDate,
})

// Selector for sorting
export const selectPendingDeliveriesSorting = (state: RootState) => ({
  sortBy: state.pendingDeliveries.filters.sortBy,
  sortDir: state.pendingDeliveries.filters.sortDir,
})

// Selector for total pending deliveries amount
export const selectTotalPendingDeliveriesAmount = (state: RootState) => {
  const orders = selectPendingPurchaseOrders(state)
  return orders.reduce((total, order) => total + (order.totalAmount || 0), 0)
}

// Selector for pending deliveries count by status
export const selectPendingDeliveriesByStatus = (state: RootState) => {
  const orders = selectPendingPurchaseOrders(state)
  const statusCount: Record<string, number> = {}

  orders.forEach((order) => {
    const status = order.status || "Unknown"
    statusCount[status] = (statusCount[status] || 0) + 1
  })

  return statusCount
}

// Selector for growth percentage formatted
export const selectGrowthPercentage = (state: RootState) => {
  const data = state.pendingDeliveries.data
  if (!data || data.growth === undefined) return null

  return {
    value: data.growth,
    formatted: `${data.growth >= 0 ? "+" : ""}${data.growth.toFixed(2)}%`,
    isPositive: data.growth >= 0,
  }
}

// Selector for total items in pending deliveries
export const selectTotalPendingItems = (state: RootState) => {
  const orders = selectPendingPurchaseOrders(state)
  return orders.reduce((total, order) => total + order.purchaseOrderItems.length, 0)
}

// Thunk action to fetch data with current filters
export const fetchPendingDeliveriesWithCurrentFilters =
  () => async (dispatch: AppDispatch, getState: () => RootState) => {
    const currentFilters = selectPendingDeliveriesFilters(getState())
    return dispatch(fetchPendingDeliveriesData(currentFilters))
  }

// Thunk action to fetch next page
export const fetchNextPendingDeliveriesPage = () => async (dispatch: AppDispatch, getState: () => RootState) => {
  const state = getState()
  const currentPage = state.pendingDeliveries.filters.pageNo
  const totalPages = state.pendingDeliveries.data?.totalPages || 0

  if (currentPage < totalPages - 1) {
    dispatch(setPage(currentPage + 1))
    return dispatch(fetchPendingDeliveriesWithCurrentFilters())
  }
}

// Thunk action to fetch previous page
export const fetchPreviousPendingDeliveriesPage = () => async (dispatch: AppDispatch, getState: () => RootState) => {
  const state = getState()
  const currentPage = state.pendingDeliveries.filters.pageNo

  if (currentPage > 0) {
    dispatch(setPage(currentPage - 1))
    return dispatch(fetchPendingDeliveriesWithCurrentFilters())
  }
}

// Thunk action to refresh data
export const refreshPendingDeliveriesData = () => async (dispatch: AppDispatch) => {
  dispatch(clearError())
  return dispatch(fetchPendingDeliveriesWithCurrentFilters())
}

// Thunk action to fetch data with date range
export const fetchPendingDeliveriesWithDateRange =
  (startDate: string, endDate: string) => async (dispatch: AppDispatch) => {
    dispatch(setDateRange({ startDate, endDate }))
    return dispatch(fetchPendingDeliveriesWithCurrentFilters())
  }

// // Thunk action to mark purchase order as delivered
// export const markPurchaseOrderAsDelivered = (purchaseOrderId: number) => async (dispatch: AppDispatch) => {
//   // This would typically make an API call to update the status
//   // For now, we'll just update the local state optimistically
//   dispatch(markAsDelivered(purchaseOrderId))

//   // In a real implementation, you would make an API call here:
//   // try {
//   //   await axios.put(`/api/purchase-orders/${purchaseOrderId}/deliver`)
//   // } catch (error) {
//   //   // Revert optimistic update on error
//   //   dispatch(updatePurchaseOrder(originalOrder))
//   // }
// }

export default pendingDeliveriesSlice.reducer
