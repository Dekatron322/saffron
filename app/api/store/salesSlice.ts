import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit"
import { AppDispatch, RootState } from "./store"
import axios from "axios"
import { API_CONFIG } from "../config/api"

// Sale Order Item Interfaces
interface SaleOrderItem {
  saleOrderItemId: number
  itemName: string
  hsnCode: string
  description: string
  batchNo: string
  mfg: string
  expDate: string
  mfgDate: string
  mrp: number
  packing: string
  quantity: number
  pricePerUnit: number
  tax: number
  unitName: string
  unitSold: number
  createdDate: string
  discountType?: string | null
  discountValue?: number
  packagingSize?: number
  numberOfPacks?: number
  price?: number
  taxAmount?: number
  amountWithoutTax?: number
  discountAmount?: number
  amountWithDiscountWithoutTax?: number
  taxAfterDiscount?: number
  totalPayableAmount?: number
}

// Payment Info Interface
interface PaymentInfo {
  paymentType: string
  amount: number
  gstPercentage: number
  totalAmount: number
  receivedAmount: number
  status: string
}

// Create Sale Order Request Interfaces
interface CreateSaleOrderItem {
  itemName: string
  hsnCode: string
  description: string
  batchNo: string
  mfg: string
  expDate: string
  mfgDate: string
  mrp: number
  packing: string
  quantity: number
  discountType: string | null
  discountValue: number
  tax: number
  unitName: string
  packagingSize: number
  numberOfPacks?: number
  price: number
  taxAmount: number
  amountWithoutTax: number
  discountAmount: number
  amountWithDiscountWithoutTax: number
  taxAfterDiscount: number
  totalPayableAmount: number
}

interface CreateSaleOrderRequest {
  customerId: number
  paymentStatusId: number
  paymentTypeId: number
  linkPayment: string | boolean
  deductableWalletAmount: number
  paidAmount: number
  placeOfSupply: number
  orderStatus: string
  extraDiscount: string | boolean
  upgradeSubscription: boolean
  purchaseSubscription: boolean
  paymentInfo: PaymentInfo
  saleOrderItems: CreateSaleOrderItem[]
}

// Sale Order Interfaces
interface SaleOrder {
  saleOrderId: number
  customerId: number
  paymentStatusId: number
  paymentTypeId: number
  orderStatus: string
  returnStatus: string
  saleOrderItems: SaleOrderItem[]
  paidAmount: number
  linkPayment: boolean
  deductibleWalletAmount: number | null
  placeOfSupply: number
  promoCode: string | null
  saleOrderInvoiceNo: string
  createdDate: string
  loyaltyPointUsed: boolean
  loyaltyPoints: number | null
  subscriptionPoints: number | null
  checkoutType: string | null
  paymentInfo: any | null
  upgradeSubscription: any | null
  purchaseSubscription: any | null
  subscriptionDetails: any | null
  extraDiscount: boolean
  saleType: string | null
  loyaltyPointDiscount: number | null
  subscriptionDiscount: number | null
}

// Create Sale Order Response Interface
interface CreateSaleOrderResponse {
  success: boolean
  message: string
  error: string | null
  saleOrderDto: SaleOrder
}

// Pagination Response Interface
interface SaleOrderPaginationResponse {
  saleOrders: SaleOrder[]
  pageNo: number
  pageSize: number
  totalElements: number
  totalPages: number
  last: boolean
}

// Main API Response Interface for list
interface SaleOrderListResponse {
  success: boolean
  message: string
  error: string | null
  saleOrderPaginationResponse: SaleOrderPaginationResponse
}

// Single Sale Order Response Interface
interface SingleSaleOrderResponse {
  success: boolean
  message: string
  error: string | null
  saleOrder?: SaleOrder
  saleOrderPaginationResponse?: SaleOrderPaginationResponse
}

// Request Payload Interface
interface FetchSaleOrdersRequest {
  pageNo: number
  pageSize: number
  sortBy: string
  sortDir: string
}

// UPI QR Code Request Interface
interface UpiQrCodeRequest {
  name: string
  email: string
  phoneNumber: string
  amount: number
}

// UPI QR Code Response Interface
interface UpiQrCodeResponse {
  success: boolean
  message: string
  error: string | null
  qrCodeBase64: string
}

// Sales State Interface
interface SalesState {
  sales: SaleOrder[]
  loading: boolean
  error: string | null
  pagination: {
    pageNo: number
    pageSize: number
    totalElements: number
    totalPages: number
    last: boolean
  }
  currentSaleOrder: SaleOrder | null
  currentLoading: boolean
  currentError: string | null
  createLoading: boolean
  createError: string | null
  createdOrder: SaleOrder | null
  upiQrCode: {
    loading: boolean
    error: string | null
    qrCodeBase64: string | null
  }
}

const initialState: SalesState = {
  sales: [],
  loading: false,
  error: null,
  pagination: {
    pageNo: 0,
    pageSize: 0,
    totalElements: 0,
    totalPages: 0,
    last: true,
  },
  currentSaleOrder: null,
  currentLoading: false,
  currentError: null,
  createLoading: false,
  createError: null,
  createdOrder: null,
  upiQrCode: {
    loading: false,
    error: null,
    qrCodeBase64: null,
  },
}

const salesSlice = createSlice({
  name: "sales",
  initialState,
  reducers: {
    fetchSalesStart(state) {
      state.loading = true
      state.error = null
    },
    fetchSalesSuccess(state, action: PayloadAction<SaleOrderPaginationResponse>) {
      state.sales = action.payload.saleOrders
      state.pagination = {
        pageNo: action.payload.pageNo,
        pageSize: action.payload.pageSize,
        totalElements: action.payload.totalElements,
        totalPages: action.payload.totalPages,
        last: action.payload.last,
      }
      state.loading = false
      state.error = null
    },
    fetchSalesFailure(state, action: PayloadAction<string>) {
      state.loading = false
      state.error = action.payload
      state.sales = []
      state.pagination = {
        pageNo: 0,
        pageSize: 0,
        totalElements: 0,
        totalPages: 0,
        last: true,
      }
    },
    fetchSaleOrderByIdStart(state) {
      state.currentLoading = true
      state.currentError = null
    },
    fetchSaleOrderByIdSuccess(state, action: PayloadAction<SaleOrder>) {
      state.currentSaleOrder = action.payload
      state.currentLoading = false
      state.currentError = null
    },
    fetchSaleOrderByIdFailure(state, action: PayloadAction<string>) {
      state.currentLoading = false
      state.currentError = action.payload
      state.currentSaleOrder = null
    },
    createSaleOrderStart(state) {
      state.createLoading = true
      state.createError = null
      state.createdOrder = null
    },
    createSaleOrderSuccess(state, action: PayloadAction<SaleOrder>) {
      state.createLoading = false
      state.createError = null
      state.createdOrder = action.payload
      // Add the new order to the sales list
      state.sales.unshift(action.payload)
      // Update pagination totals
      state.pagination.totalElements += 1
    },
    createSaleOrderFailure(state, action: PayloadAction<string>) {
      state.createLoading = false
      state.createError = action.payload
      state.createdOrder = null
    },
    generateUpiQrCodeStart(state) {
      state.upiQrCode.loading = true
      state.upiQrCode.error = null
      state.upiQrCode.qrCodeBase64 = null
    },
    generateUpiQrCodeSuccess(state, action: PayloadAction<string>) {
      state.upiQrCode.loading = false
      state.upiQrCode.error = null
      state.upiQrCode.qrCodeBase64 = action.payload
    },
    generateUpiQrCodeFailure(state, action: PayloadAction<string>) {
      state.upiQrCode.loading = false
      state.upiQrCode.error = action.payload
      state.upiQrCode.qrCodeBase64 = null
    },
    clearUpiQrCode(state) {
      state.upiQrCode.loading = false
      state.upiQrCode.error = null
      state.upiQrCode.qrCodeBase64 = null
    },
    clearCurrentSaleOrder(state) {
      state.currentSaleOrder = null
      state.currentError = null
      state.currentLoading = false
    },
    clearCreateSaleOrder(state) {
      state.createLoading = false
      state.createError = null
      state.createdOrder = null
    },
    clearSales(state) {
      state.sales = []
      state.pagination = {
        pageNo: 0,
        pageSize: 0,
        totalElements: 0,
        totalPages: 0,
        last: true,
      }
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSaleOrders.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchSaleOrders.fulfilled, (state, action) => {
        state.sales = action.payload.saleOrderPaginationResponse.saleOrders
        state.pagination = {
          pageNo: action.payload.saleOrderPaginationResponse.pageNo,
          pageSize: action.payload.saleOrderPaginationResponse.pageSize,
          totalElements: action.payload.saleOrderPaginationResponse.totalElements,
          totalPages: action.payload.saleOrderPaginationResponse.totalPages,
          last: action.payload.saleOrderPaginationResponse.last,
        }
        state.loading = false
        state.error = null
      })
      .addCase(fetchSaleOrders.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || "Failed to fetch sale orders"
        state.sales = []
        state.pagination = {
          pageNo: 0,
          pageSize: 0,
          totalElements: 0,
          totalPages: 0,
          last: true,
        }
      })
      .addCase(fetchSaleOrderById.pending, (state) => {
        state.currentLoading = true
        state.currentError = null
      })
      .addCase(fetchSaleOrderById.fulfilled, (state, action) => {
        state.currentSaleOrder = action.payload
        state.currentLoading = false
        state.currentError = null
      })
      .addCase(fetchSaleOrderById.rejected, (state, action) => {
        state.currentLoading = false
        state.currentError = action.payload || "Failed to fetch sale order"
        state.currentSaleOrder = null
      })
      .addCase(createSaleOrder.pending, (state) => {
        state.createLoading = true
        state.createError = null
        state.createdOrder = null
      })
      .addCase(createSaleOrder.fulfilled, (state, action) => {
        state.createLoading = false
        state.createError = null
        state.createdOrder = action.payload
        // Add the new order to the sales list
        state.sales.unshift(action.payload)
        // Update pagination totals
        state.pagination.totalElements += 1
      })
      .addCase(createSaleOrder.rejected, (state, action) => {
        state.createLoading = false
        state.createError = action.payload || "Failed to create sale order"
        state.createdOrder = null
      })
      .addCase(generateUpiQrCode.pending, (state) => {
        state.upiQrCode.loading = true
        state.upiQrCode.error = null
        state.upiQrCode.qrCodeBase64 = null
      })
      .addCase(generateUpiQrCode.fulfilled, (state, action) => {
        state.upiQrCode.loading = false
        state.upiQrCode.error = null
        state.upiQrCode.qrCodeBase64 = action.payload
      })
      .addCase(generateUpiQrCode.rejected, (state, action) => {
        state.upiQrCode.loading = false
        state.upiQrCode.error = action.payload || "Failed to generate UPI QR code"
        state.upiQrCode.qrCodeBase64 = null
      })
  },
})

export const {
  fetchSalesStart,
  fetchSalesSuccess,
  fetchSalesFailure,
  fetchSaleOrderByIdStart,
  fetchSaleOrderByIdSuccess,
  fetchSaleOrderByIdFailure,
  createSaleOrderStart,
  createSaleOrderSuccess,
  createSaleOrderFailure,
  generateUpiQrCodeStart,
  generateUpiQrCodeSuccess,
  generateUpiQrCodeFailure,
  clearUpiQrCode,
  clearCurrentSaleOrder,
  clearCreateSaleOrder,
  clearSales,
} = salesSlice.actions

// Async thunk to fetch all sale orders
export const fetchSaleOrders = createAsyncThunk<SaleOrderListResponse, FetchSaleOrdersRequest, { rejectValue: string }>(
  "sales/fetchSaleOrders",
  async (requestData, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken")
      if (!token) throw new Error("No authentication token found")

      const response = await axios.post<SaleOrderListResponse>(
        `${API_CONFIG.BASE_URL}/order-service/api/v1/orders`,
        requestData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      )

      return response.data
    } catch (error: any) {
      let errorMessage = "Failed to fetch sale orders"
      if (error.response?.data) {
        const apiError = error.response.data
        errorMessage = apiError.errorMessage || apiError.message || "API request failed"
      } else if (error.message) {
        errorMessage = error.message
      }
      return rejectWithValue(errorMessage)
    }
  }
)

// Async thunk to fetch sale order by ID - UPDATED to handle direct sale order response
export const fetchSaleOrderById = createAsyncThunk<SaleOrder, number, { rejectValue: string }>(
  "sales/fetchSaleOrderById",
  async (saleOrderId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken")
      if (!token) throw new Error("No authentication token found")

      const response = await axios.get(`${API_CONFIG.BASE_URL}/order-service/api/v1/orders/${saleOrderId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      console.log("API Response:", response.data)

      // Handle different response formats
      let saleOrderData: SaleOrder | null = null

      // Case 1: Direct sale order object (your current response)
      if (response.data && typeof response.data === "object" && response.data.saleOrderId) {
        saleOrderData = response.data
      }
      // Case 2: Response with saleOrder property
      else if (response.data && response.data.saleOrder) {
        saleOrderData = response.data.saleOrder
      }
      // Case 3: Response with success property and saleOrder
      else if (response.data && response.data.success && response.data.saleOrder) {
        saleOrderData = response.data.saleOrder
      }
      // Case 4: Response with saleOrderPaginationResponse (list response)
      else if (response.data && response.data.saleOrderPaginationResponse) {
        const orders = response.data.saleOrderPaginationResponse.saleOrders
        if (orders && orders.length > 0) {
          saleOrderData = orders[0] // Take first order
        }
      }

      if (!saleOrderData) {
        throw new Error("Sale order data not found in response")
      }

      return saleOrderData
    } catch (error: any) {
      console.error("Error fetching sale order:", error)
      let errorMessage = "Failed to fetch sale order"

      if (error.response?.status === 404) {
        errorMessage = "Sale order not found"
      } else if (error.response?.data) {
        const apiError = error.response.data
        errorMessage = apiError.errorMessage || apiError.message || "API request failed"
      } else if (error.message) {
        errorMessage = error.message
      }

      return rejectWithValue(errorMessage)
    }
  }
)

// Async thunk to create a new sale order - FIXED VERSION
export const createSaleOrder = createAsyncThunk<SaleOrder, CreateSaleOrderRequest, { rejectValue: string }>(
  "sales/createSaleOrder",
  async (saleOrderData, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken")
      if (!token) throw new Error("No authentication token found")

      console.log("Sending sale order data:", JSON.stringify(saleOrderData, null, 2))

      const response = await axios.post<CreateSaleOrderResponse>(
        `${API_CONFIG.BASE_URL}/order-service/api/v1/orders/create-sale-order`,
        saleOrderData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      )

      console.log("API Response:", response.data)

      // Check if the request was successful
      if (!response.data.success) {
        throw new Error(response.data.error || "Failed to create sale order")
      }

      // Check if saleOrderDto exists in the response
      if (!response.data.saleOrderDto) {
        throw new Error("Sale order data not found in response")
      }

      return response.data.saleOrderDto
    } catch (error: any) {
      console.error("Error creating sale order:", error)
      // Build a structured error payload to preserve backend fields
      let apiErrorPayload: any = { errorMessage: "Failed to create sale order" }
      if (error.response?.data) {
        apiErrorPayload = error.response.data
      } else if (error.message) {
        apiErrorPayload = { errorMessage: error.message }
      }

      // Reject with the structured object so unwrap() yields it directly
      return rejectWithValue(apiErrorPayload as any)
    }
  }
)

// Async thunk to generate UPI QR code
export const generateUpiQrCode = createAsyncThunk<string, UpiQrCodeRequest, { rejectValue: string }>(
  "sales/generateUpiQrCode",
  async (qrCodeData, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken")
      if (!token) throw new Error("No authentication token found")

      console.log("Generating UPI QR code with data:", JSON.stringify(qrCodeData, null, 2))

      const response = await axios.post<UpiQrCodeResponse>(
        `${API_CONFIG.BASE_URL}/inventory-service/api/payments/upi/qr-code`,
        qrCodeData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      )

      console.log("QR Code API Response:", response.data)

      // Check if the request was successful
      if (!response.data.success) {
        throw new Error(response.data.error || "Failed to generate QR code")
      }

      // Check if qrCodeBase64 exists in the response
      if (!response.data.qrCodeBase64) {
        throw new Error("QR code data not found in response")
      }

      return response.data.qrCodeBase64
    } catch (error: any) {
      console.error("Error generating UPI QR code:", error)
      let errorMessage = "Failed to generate UPI QR code"

      if (error.response?.data) {
        const apiError = error.response.data
        errorMessage = apiError.errorMessage || apiError.message || "API request failed"
      } else if (error.message) {
        errorMessage = error.message
      }

      return rejectWithValue(errorMessage)
    }
  }
)

// Thunk to fetch sales with default parameters
export const fetchAllSales = () => async (dispatch: AppDispatch) => {
  try {
    dispatch(fetchSalesStart())
    const requestData: FetchSaleOrdersRequest = {
      pageNo: 0,
      pageSize: 100,
      sortBy: "saleOrderId",
      sortDir: "asc",
    }

    const data = await dispatch(fetchSaleOrders(requestData)).unwrap()
    dispatch(fetchSalesSuccess(data.saleOrderPaginationResponse))
  } catch (error: any) {
    dispatch(fetchSalesFailure(error.message || "Failed to fetch sales"))
  }
}

// Thunk to fetch sale order by ID using the action
export const fetchSaleOrderByIdAction = (saleOrderId: number) => async (dispatch: AppDispatch) => {
  try {
    dispatch(fetchSaleOrderByIdStart())
    const saleOrder = await dispatch(fetchSaleOrderById(saleOrderId)).unwrap()
    dispatch(fetchSaleOrderByIdSuccess(saleOrder))
    return saleOrder
  } catch (error: any) {
    dispatch(fetchSaleOrderByIdFailure(error.message || "Failed to fetch sale order"))
    throw error
  }
}

// Thunk to create sale order using the action - FIXED VERSION
export const createSaleOrderAction = (saleOrderData: CreateSaleOrderRequest) => async (dispatch: AppDispatch) => {
  try {
    dispatch(createSaleOrderStart())

    // Ensure boolean fields are properly formatted
    const formattedData = {
      ...saleOrderData,
      linkPayment: saleOrderData.linkPayment === "true" || saleOrderData.linkPayment === true,
      extraDiscount: saleOrderData.extraDiscount === "true" || saleOrderData.extraDiscount === true,
    }

    const createdOrder = await dispatch(createSaleOrder(formattedData)).unwrap()
    dispatch(createSaleOrderSuccess(createdOrder))
    return createdOrder
  } catch (error: any) {
    // error is the rejectValue from unwrap(); may be string or structured object
    const isObject = error && typeof error === "object"
    const apiError = isObject ? error : { errorMessage: String(error || "Failed to create sale order") }
    const errorMessage = apiError.errorMessage || apiError.message || "Failed to create sale order"
    dispatch(createSaleOrderFailure(errorMessage))
    // Rethrow in Axios-like shape so UI catch can read err.response.data
    throw { response: { data: apiError } }
  }
}

// Thunk to generate UPI QR code using the action
export const generateUpiQrCodeAction = (qrCodeData: UpiQrCodeRequest) => async (dispatch: AppDispatch) => {
  try {
    dispatch(generateUpiQrCodeStart())
    const qrCodeBase64 = await dispatch(generateUpiQrCode(qrCodeData)).unwrap()
    dispatch(generateUpiQrCodeSuccess(qrCodeBase64))
    return qrCodeBase64
  } catch (error: any) {
    dispatch(generateUpiQrCodeFailure(error.message || "Failed to generate UPI QR code"))
    throw error
  }
}

// Selectors
export const selectSales = (state: RootState) => state.sales.sales
export const selectSalesLoading = (state: RootState) => state.sales.loading
export const selectSalesError = (state: RootState) => state.sales.error
export const selectSalesPagination = (state: RootState) => state.sales.pagination
export const selectCurrentSaleOrder = (state: RootState) => state.sales.currentSaleOrder
export const selectCurrentSaleOrderLoading = (state: RootState) => state.sales.currentLoading
export const selectCurrentSaleOrderError = (state: RootState) => state.sales.currentError
export const selectCreateSaleOrderLoading = (state: RootState) => state.sales.createLoading
export const selectCreateSaleOrderError = (state: RootState) => state.sales.createError
export const selectCreatedSaleOrder = (state: RootState) => state.sales.createdOrder
export const selectUpiQrCodeLoading = (state: RootState) => state.sales.upiQrCode.loading
export const selectUpiQrCodeError = (state: RootState) => state.sales.upiQrCode.error
export const selectUpiQrCodeBase64 = (state: RootState) => state.sales.upiQrCode.qrCodeBase64

export default salesSlice.reducer
