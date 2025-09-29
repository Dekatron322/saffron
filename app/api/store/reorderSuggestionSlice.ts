// src/store/reorderSuggestionSlice.ts
import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit"
import { AppDispatch, RootState } from "./store"
import axios from "axios"
import { API_CONFIG } from "../config/api"

// Interfaces based on the provided response
interface Category {
  createdDate: string
  createdBy: string
  modifiedDate: string
  modifiedBy: string
  catId: number
  catName: string
}

interface BatchDetail {
  mrp: number
  batchNo: string
  mfg: string | null
  mfgDate: string
  expDate: string
  packing: string
  productDto: any | null
}

interface LowStockProduct {
  productId: number
  productName: string
  description: string
  category: Category
  manufacturer: string
  price: number | null
  productCode: string
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
  baseUnit: any | null
  secondaryUnit: any | null
  conversionRate: any | null
  branch: number
  itemName: string
  batchNo: string | null
  modelNo: string
  size: string
  mfgDate: string
  expDate: string
  mrp: string
  hsn: number
  reorderQuantity: number
  currentStockLevel: number
  reorderThreshold: number
  supplierId: number
  unitId: number
  packagingSize: number
  productStatus: boolean
  refundable: string
  paymentCategory: string | null
  type: string | null
  paidAmount: string | null
  linkPayment: boolean
  deductibleWalletAmount: number | null
  batchDetails: any | null
  batchDetailsDtoList: BatchDetail[]
  points: any | null
}

interface SupplierLowStock {
  supplierId: number
  products: LowStockProduct[]
}

interface LowStockResponse {
  lowStocks: SupplierLowStock[]
}

// Interfaces for creating purchase order
interface PaymentInfo {
  paymentType: string
  totalAmount: string
  totalAmountWithTax: string
  paidAmount: string
  linkPayment: boolean
  deductibleWalletAmount: number
}

interface PurchaseOrderProduct {
  // Required for our payload construction
  quantity?: number
  productId?: number

  // Common product fields (made optional to accept partials from the form)
  productName?: string
  description?: string
  category?: Category
  manufacturer?: string
  price?: number | null
  productCode?: string
  defaultMRP?: number
  salePrice?: number
  purchasePrice?: number
  discountType?: string
  saleDiscount?: number
  openingStockQuantity?: number
  minimumStockQuantity?: number
  itemLocation?: string
  taxRate?: number
  inclusiveOfTax?: boolean
  baseUnit?: any | null
  secondaryUnit?: any | null
  conversionRate?: any | null
  branch?: number
  itemName?: string
  batchNo?: string | null
  modelNo?: string
  size?: string
  mfgDate?: string
  expDate?: string
  mrp?: string | number
  hsn?: number
  reorderQuantity?: number
  currentStockLevel?: number
  reorderThreshold?: number
  supplierId?: number
  unitId?: number
  packagingSize?: number
  productStatus?: boolean
  refundable?: string
  paymentCategory?: string | null
  type?: string | null
  paidAmount?: string | null
  linkPayment?: boolean
  deductibleWalletAmount?: number | null
  batchDetails?: any | null
  batchDetailsDtoList?: BatchDetail[]
  points?: any | null
}

interface CreatePurchaseOrderRequest {
  supplierId: number
  orderType: string
  paymentInfo: PaymentInfo
  products: PurchaseOrderProduct[]
}

interface CreatePurchaseOrderResponse {
  // Define response structure based on your API
  success: boolean
  message: string
  orderId?: number
}

interface ReorderSuggestionState {
  lowStockItems: SupplierLowStock[]
  loading: boolean
  error: string | null
  creatingOrder: boolean
  createOrderError: string | null
  orderSuccess: boolean
}

const initialState: ReorderSuggestionState = {
  lowStockItems: [],
  loading: false,
  error: null,
  creatingOrder: false,
  createOrderError: null,
  orderSuccess: false,
}

const reorderSuggestionSlice = createSlice({
  name: "reorderSuggestion",
  initialState,
  reducers: {
    fetchLowStockItemsStart(state) {
      state.loading = true
      state.error = null
    },
    fetchLowStockItemsSuccess(state, action: PayloadAction<SupplierLowStock[]>) {
      state.lowStockItems = action.payload
      state.loading = false
      state.error = null
    },
    fetchLowStockItemsFailure(state, action: PayloadAction<string>) {
      state.loading = false
      state.error = action.payload
      state.lowStockItems = []
    },
    clearLowStockItems(state) {
      state.lowStockItems = []
      state.error = null
    },
    // Keeping reset action for consumers
    resetOrderStatus(state) {
      state.creatingOrder = false
      state.createOrderError = null
      state.orderSuccess = false
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createPurchaseOrder.pending, (state) => {
        state.creatingOrder = true
        state.createOrderError = null
        state.orderSuccess = false
      })
      .addCase(createPurchaseOrder.fulfilled, (state) => {
        state.creatingOrder = false
        state.createOrderError = null
        state.orderSuccess = true
      })
      .addCase(createPurchaseOrder.rejected, (state, action) => {
        state.creatingOrder = false
        state.createOrderError = (action.payload as string) || action.error.message || "Failed to create purchase order"
        state.orderSuccess = false
      })
  },
})

export const { fetchLowStockItemsStart, fetchLowStockItemsSuccess, fetchLowStockItemsFailure, clearLowStockItems, resetOrderStatus } =
  reorderSuggestionSlice.actions

export const fetchLowStockItems = () => async (dispatch: AppDispatch) => {
  try {
    dispatch(fetchLowStockItemsStart())
    const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken")
    if (!token) throw new Error("No authentication token found")

    const response = await axios.get<LowStockResponse>(
      `${API_CONFIG.BASE_URL}/inventory-service/api/v1/inventory/low-stock-alerts`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    )

    if (!response.data.lowStocks || !Array.isArray(response.data.lowStocks)) {
      throw new Error("Invalid response format from server")
    }

    dispatch(fetchLowStockItemsSuccess(response.data.lowStocks))
  } catch (error: any) {
    let errorMessage = "Failed to fetch low stock items"
    if (error.response?.data) {
      const apiError = error.response.data
      errorMessage = apiError.errorMessage || apiError.message || "API request failed"
    } else if (error.message) {
      errorMessage = error.message
    }
    dispatch(fetchLowStockItemsFailure(errorMessage))
  }
}

export const createPurchaseOrder = createAsyncThunk<
  CreatePurchaseOrderResponse,
  CreatePurchaseOrderRequest,
  { rejectValue: string }
>("reorderSuggestion/createPurchaseOrder", async (orderData, { rejectWithValue }) => {
  try {
    const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken")
    if (!token) throw new Error("No authentication token found")

    const response = await axios.post<CreatePurchaseOrderResponse>(
      `${API_CONFIG.BASE_URL}/supplier-service/api/purchase-orders/create-manual-purchase-order`,
      orderData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    )

    if (!response.data.success) {
      return rejectWithValue(response.data.message || "Failed to create purchase order")
    }

    return response.data
  } catch (error: any) {
    let errorMessage = "Failed to create purchase order"
    if (error?.response?.data) {
      const apiError = error.response.data
      errorMessage = apiError.errorMessage || apiError.message || "API request failed"
    } else if (error?.message) {
      errorMessage = error.message
    }
    return rejectWithValue(errorMessage)
  }
})

export const selectLowStockItems = (state: RootState) => state.reorderSuggestion.lowStockItems
export const selectLowStockItemsLoading = (state: RootState) => state.reorderSuggestion.loading
export const selectLowStockItemsError = (state: RootState) => state.reorderSuggestion.error
export const selectCreatingOrder = (state: RootState) => state.reorderSuggestion.creatingOrder
export const selectCreateOrderError = (state: RootState) => state.reorderSuggestion.createOrderError
export const selectOrderSuccess = (state: RootState) => state.reorderSuggestion.orderSuccess

export default reorderSuggestionSlice.reducer
