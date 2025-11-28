import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit"
import { AppDispatch, RootState } from "./store"
import axios from "axios"
import { API_CONFIG } from "../config/api"

interface PurchaseOrderItem {
  itemDetails: any
  purchaseOrderItemId: number
  productId?: number
  quantity: number
  unitPrice: number
  statusOfItem: string
  defectQuantity: number
  discountType?: string
  discountValue?: number
}

interface DiscountDto {
  discountType: string
  discountValue: number
  discountedAmount: number
}

interface PurchaseOrder {
  purchaseOrderId: number
  supplierId: number
  orderDate: string
  expectedDeliveryDate: string | null
  totalAmount: number
  totalAmountWithTax: number
  discountDto?: DiscountDto
  discount?: number
  raised: boolean
  purchaseOrderItems: PurchaseOrderItem[]
  paymentStatus: string
  paymentCategory: string | null
  type: string | null
  status: string | null
  paidAmount: number | null
  linkPayment: boolean
  deductibleWalletAmount: number | null
  orderStatus: string
}

interface PurchaseResponse {
  status: string
  message: string
  purchaseOrders: PurchaseOrder[]
}

interface PaymentInfo {
  paymentType: string
  totalAmount: string
  totalAmountWithTax: string
  paidAmount: string
  linkPayment: boolean
  deductibleWalletAmount: number
}

interface Product {
  productName: string
  description: string
  category: {
    catId: number
    catName: string
  }
  batchDetails: {
    mrp: string
    batchNo: string
    mfg: string
    mfgDate: string
    expDate: string
    packing: string
  }
  manufacturer: string
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
  branch: number
  modelNo: number
  size: string
  mfgDate: string
  expDate: string
  mrp: number
  hsn: number
  reorderQuantity: number
  currentStockLevel: number
  reorderThreshold: number
  packagingSize: number
  unitId: number
  refundable: string
  productStatus: boolean
  paymentCategory: string
  type: string
  paidAmount: string
  linkPayment: boolean
  deductibleWalletAmount: number
  supplierId?: number
  batchNo?: string
}

interface CreatePurchaseOrderRequest {
  supplierId: number
  paymentInfo: PaymentInfo
  products: Product[]
}

interface ManualPurchaseOrderRequest {
  supplierId: number
  paymentInfo: PaymentInfo
  products: Product[]
}

interface UpdatePurchaseOrderRequest {
  purchaseOrderId: number
  manualPurchaseOrderRequest: ManualPurchaseOrderRequest
}

interface SupplierProduct {
  quantity: number
  productId: number
  productName: string
}

interface Supplier {
  supplierId: number
  name: string
  products: SupplierProduct[]
}

interface CreatePurchaseOrderResponse {
  purchaseOrder: {
    suppliers: Supplier[]
  }
}

interface UpdatePurchaseOrderResponse {
  success: boolean
  message: string
}

interface PurchaseOrderByIdResponse {
  purchaseOrderId: number
  supplierId: number
  orderDate: string
  expectedDeliveryDate: string | null
  totalAmount: number
  totalAmountWithTax: number
  discountDto?: DiscountDto
  discount?: number
  raised: boolean
  purchaseOrderItems: PurchaseOrderItem[]
  paymentStatus: string
  paymentCategory: string | null
  type: string | null
  status: string | null
  paidAmount: number | null
  linkPayment: boolean
  deductibleWalletAmount: number | null
  orderStatus: string
}

interface UpdatePaymentStatusRequest {
  purchaseOrderId: number
  supplierId: number
  orderDate: string
  expectedDeliveryDate: string | null
  totalAmount: number
  totalAmountWithTax: number
  discountDto?: DiscountDto
  discount?: number
  raised: boolean
  purchaseOrderItems: PurchaseOrderItem[]
  paymentStatus: string
  paymentCategory: string | null
  type: string | null
  status: string | null
  paidAmount: number | null
  linkPayment: boolean
  deductibleWalletAmount: number | null
  orderStatus: string
}

interface UpdatePaymentStatusResponse {
  status: string
  message: string
  purchaseOrder: PurchaseOrder
}

// Purchase Return Reason Interfaces
interface PurchaseReturnReason {
  purchaseReturnReasonId: number
  reasonType: string
  description: string
}

interface CreatePurchaseReturnReasonRequest {
  reasonType: string
  description: string
}

interface CreatePurchaseReturnReasonResponse {
  purchaseReturnReasonId: number
  reasonType: string
  description: string
}

type PurchaseReturnReasonsResponse = PurchaseReturnReason[]

// Purchase Ledger Interfaces
interface PurchaseLedger {
  purchaseLedgerId: number
  supplierId: number
  productName: string
  batchNo: string
  expDate: string
  taxRate: number
  returnQuantity: number
  walletAmount: number
  purchaseReturnReasonId: number
  purchaseOrderId: number
  status: string
  saleOrderId: number | null
  amountWithTax: number
  totalRoundOffAmt: number
  createdDate: string
  createdNewLedger: any | null
}

// New interfaces for grouped purchase ledgers response
interface PurchaseOrderWithLedgers {
  purchaseOrderId: number
  ledgers: PurchaseLedger[]
}

interface PurchaseLedgerGroupedResponse {
  pageNo: number
  pageSize: number
  totalElements: number
  totalPages: number
  last: boolean
  purchaseOrders: PurchaseOrderWithLedgers[]
}

// Return Note Interfaces - UPDATED
interface ReturnNoteItem {
  purchaseLedgerId: number
  supplierId: number
  productName: string
  batchNo: string
  expDate: string
  taxRate: number
  returnQuantity: number
  walletAmount: number
  purchaseReturnReasonId: number
  purchaseOrderId: number
  status: string
  saleOrderId: number | null
  amountWithTax: number
  totalRoundOffAmt: number
  createdDate: string
}

interface ReturnNoteRequest {
  purchaseOrderId: number
  ledgers: ReturnNoteItem[]
}

interface ReturnNoteResponse {
  status: string
  message: string
  data: any
}

interface PurchaseState {
  purchases: PurchaseOrder[]
  loading: boolean
  error: string | null
  creating: boolean
  createError: string | null
  createdOrder: CreatePurchaseOrderResponse | null
  updating: boolean
  updateError: string | null
  updatedOrder: UpdatePurchaseOrderResponse | null
  currentPurchaseOrder: PurchaseOrderByIdResponse | null
  currentLoading: boolean
  currentError: string | null
  updatingPaymentStatus: boolean
  updatePaymentStatusError: string | null
  purchaseReturnReasons: PurchaseReturnReason[]
  returnReasonsLoading: boolean
  returnReasonsError: string | null
  creatingReturnReason: boolean
  createReturnReasonError: string | null
  createdReturnReason: CreatePurchaseReturnReasonResponse | null
  purchaseLedgers: PurchaseLedger[]
  purchaseLedgersGrouped: PurchaseOrderWithLedgers[]
  purchaseLedgersPagination: {
    pageNo: number
    pageSize: number
    totalElements: number
    totalPages: number
    last: boolean
  }
  purchaseLedgersLoading: boolean
  purchaseLedgersError: string | null
  creatingReturnNote: boolean
  createReturnNoteError: string | null
  returnNoteResponse: ReturnNoteResponse | null
}

const initialState: PurchaseState = {
  purchases: [],
  loading: false,
  error: null,
  creating: false,
  createError: null,
  createdOrder: null,
  updating: false,
  updateError: null,
  updatedOrder: null,
  currentPurchaseOrder: null,
  currentLoading: false,
  currentError: null,
  updatingPaymentStatus: false,
  updatePaymentStatusError: null,
  purchaseReturnReasons: [],
  returnReasonsLoading: false,
  returnReasonsError: null,
  creatingReturnReason: false,
  createReturnReasonError: null,
  createdReturnReason: null,
  purchaseLedgers: [],
  purchaseLedgersGrouped: [],
  purchaseLedgersPagination: {
    pageNo: 0,
    pageSize: 0,
    totalElements: 0,
    totalPages: 0,
    last: true,
  },
  purchaseLedgersLoading: false,
  purchaseLedgersError: null,
  creatingReturnNote: false,
  createReturnNoteError: null,
  returnNoteResponse: null,
}

// Helper function to calculate item total with discount and tax
const calculateItemTotalWithTax = (item: PurchaseOrderItem, editedItem?: any) => {
  const quantity = item.quantity || 1
  const unitPrice = item.unitPrice || 0
  const taxRate = item.itemDetails?.taxRate || 0
  const inclusiveOfTax = item.itemDetails?.inclusiveOfTax || false

  let subtotal = quantity * unitPrice
  let discountAmount = 0

  // Apply item-level discount if available
  if (editedItem) {
    if (editedItem.discountType === "Percentage") {
      discountAmount = subtotal * (editedItem.discountValue / 100)
    } else {
      discountAmount = editedItem.discountValue
    }
  }

  const discountedSubtotal = Math.max(0, subtotal - discountAmount)

  if (inclusiveOfTax) {
    // If tax is inclusive, the discountedSubtotal already includes tax
    return discountedSubtotal
  } else {
    // If tax is exclusive, add tax to discounted amount
    const taxAmount = discountedSubtotal * (taxRate / 100)
    return discountedSubtotal + taxAmount
  }
}

// Helper function to calculate order totals
const calculateOrderTotals = (purchaseOrder: PurchaseOrderByIdResponse, formData: any, editingItems: any[]) => {
  let totalAmount = 0
  let totalAmountWithTax = 0

  // Calculate item-level totals
  purchaseOrder.purchaseOrderItems.forEach((item) => {
    const editedItem = editingItems.find((editItem) => editItem.purchaseOrderItemId === item.purchaseOrderItemId)

    const quantity = item.quantity || 1
    const unitPrice = item.unitPrice || 0
    const itemSubtotal = quantity * unitPrice

    // Add to totalAmount (without tax)
    totalAmount += itemSubtotal

    // Calculate item total with tax
    const itemTotalWithTax = calculateItemTotalWithTax(item, editedItem)
    totalAmountWithTax += itemTotalWithTax
  })

  // Apply order-level discount
  let finalTotalAmount = totalAmount
  let finalTotalAmountWithTax = totalAmountWithTax

  if (formData.discount && formData.discount > 0) {
    if (formData.discountType === "PERCENTAGE") {
      finalTotalAmount = totalAmount - (totalAmount * formData.discount) / 100
      finalTotalAmountWithTax = totalAmountWithTax - (totalAmountWithTax * formData.discount) / 100
    } else {
      // Distribute the flat discount proportionally between amount and amount with tax
      const discountRatio = formData.discount / totalAmount
      finalTotalAmount = Math.max(0, totalAmount - formData.discount)
      finalTotalAmountWithTax = Math.max(0, totalAmountWithTax - totalAmountWithTax * discountRatio)
    }
  }

  return {
    totalAmount: finalTotalAmount,
    totalAmountWithTax: finalTotalAmountWithTax,
  }
}

const purchaseSlice = createSlice({
  name: "purchase",
  initialState,
  reducers: {
    // ... keep all your existing reducers the same
    fetchPurchasesStart(state) {
      state.loading = true
      state.error = null
    },
    fetchPurchasesSuccess(state, action: PayloadAction<PurchaseOrder[]>) {
      state.purchases = action.payload
      state.loading = false
      state.error = null
    },
    fetchPurchasesFailure(state, action: PayloadAction<string>) {
      state.loading = false
      state.error = action.payload
    },
    createPurchaseOrderStart(state) {
      state.creating = true
      state.createError = null
      state.createdOrder = null
    },
    createPurchaseOrderSuccess(state, action: PayloadAction<CreatePurchaseOrderResponse>) {
      state.creating = false
      state.createError = null
      state.createdOrder = action.payload
    },
    createPurchaseOrderFailure(state, action: PayloadAction<string>) {
      state.creating = false
      state.createError = action.payload
      state.createdOrder = null
    },
    updatePurchaseOrderStart(state) {
      state.updating = true
      state.updateError = null
      state.updatedOrder = null
    },
    updatePurchaseOrderSuccess(state, action: PayloadAction<UpdatePurchaseOrderResponse>) {
      state.updating = false
      state.updateError = null
      state.updatedOrder = action.payload
    },
    updatePurchaseOrderFailure(state, action: PayloadAction<string>) {
      state.updating = false
      state.updateError = action.payload
      state.updatedOrder = null
    },
    fetchPurchaseOrderByIdStart(state) {
      state.currentLoading = true
      state.currentError = null
    },
    fetchPurchaseOrderByIdSuccess(state, action: PayloadAction<PurchaseOrderByIdResponse>) {
      state.currentPurchaseOrder = action.payload
      state.currentLoading = false
      state.currentError = null
    },
    fetchPurchaseOrderByIdFailure(state, action: PayloadAction<string>) {
      state.currentLoading = false
      state.currentError = action.payload
      state.currentPurchaseOrder = null
    },
    clearCurrentPurchaseOrder(state) {
      state.currentPurchaseOrder = null
      state.currentError = null
    },
    clearPurchases(state) {
      state.purchases = []
    },
    clearCreateOrder(state) {
      state.createdOrder = null
      state.createError = null
    },
    clearUpdateOrder(state) {
      state.updatedOrder = null
      state.updateError = null
    },
    fetchPurchaseReturnReasonsStart(state) {
      state.returnReasonsLoading = true
      state.returnReasonsError = null
    },
    fetchPurchaseReturnReasonsSuccess(state, action: PayloadAction<PurchaseReturnReason[]>) {
      state.purchaseReturnReasons = action.payload
      state.returnReasonsLoading = false
      state.returnReasonsError = null
    },
    fetchPurchaseReturnReasonsFailure(state, action: PayloadAction<string>) {
      state.returnReasonsLoading = false
      state.returnReasonsError = action.payload
      state.purchaseReturnReasons = []
    },
    createPurchaseReturnReasonStart(state) {
      state.creatingReturnReason = true
      state.createReturnReasonError = null
      state.createdReturnReason = null
    },
    createPurchaseReturnReasonSuccess(state, action: PayloadAction<CreatePurchaseReturnReasonResponse>) {
      state.creatingReturnReason = false
      state.createReturnReasonError = null
      state.createdReturnReason = action.payload
      state.purchaseReturnReasons.push(action.payload)
    },
    createPurchaseReturnReasonFailure(state, action: PayloadAction<string>) {
      state.creatingReturnReason = false
      state.createReturnReasonError = action.payload
      state.createdReturnReason = null
    },
    clearPurchaseReturnReasons(state) {
      state.purchaseReturnReasons = []
      state.returnReasonsError = null
    },
    clearCreatedReturnReason(state) {
      state.createdReturnReason = null
      state.createReturnReasonError = null
    },
    fetchPurchaseLedgersStart(state) {
      state.purchaseLedgersLoading = true
      state.purchaseLedgersError = null
    },
    fetchPurchaseLedgersSuccess(state, action: PayloadAction<PurchaseLedgerGroupedResponse>) {
      const allLedgers: PurchaseLedger[] = []
      action.payload.purchaseOrders.forEach((order) => {
        allLedgers.push(...order.ledgers)
      })

      state.purchaseLedgers = allLedgers
      state.purchaseLedgersGrouped = action.payload.purchaseOrders
      state.purchaseLedgersPagination = {
        pageNo: action.payload.pageNo,
        pageSize: action.payload.pageSize,
        totalElements: action.payload.totalElements,
        totalPages: action.payload.totalPages,
        last: action.payload.last,
      }
      state.purchaseLedgersLoading = false
      state.purchaseLedgersError = null
    },
    fetchPurchaseLedgersFailure(state, action: PayloadAction<string>) {
      state.purchaseLedgersLoading = false
      state.purchaseLedgersError = action.payload
      state.purchaseLedgers = []
      state.purchaseLedgersGrouped = []
      state.purchaseLedgersPagination = {
        pageNo: 0,
        pageSize: 0,
        totalElements: 0,
        totalPages: 0,
        last: true,
      }
    },
    clearPurchaseLedgers(state) {
      state.purchaseLedgers = []
      state.purchaseLedgersGrouped = []
      state.purchaseLedgersPagination = {
        pageNo: 0,
        pageSize: 0,
        totalElements: 0,
        totalPages: 0,
        last: true,
      }
      state.purchaseLedgersError = null
    },
    createReturnNoteStart(state) {
      state.creatingReturnNote = true
      state.createReturnNoteError = null
      state.returnNoteResponse = null
    },
    createReturnNoteSuccess(state, action: PayloadAction<ReturnNoteResponse>) {
      state.creatingReturnNote = false
      state.createReturnNoteError = null
      state.returnNoteResponse = action.payload
    },
    createReturnNoteFailure(state, action: PayloadAction<string>) {
      state.creatingReturnNote = false
      state.createReturnNoteError = action.payload
      state.returnNoteResponse = null
    },
    clearReturnNote(state) {
      state.returnNoteResponse = null
      state.createReturnNoteError = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(updatePaymentStatus.pending, (state) => {
        state.updatingPaymentStatus = true
        state.updatePaymentStatusError = null
      })
      .addCase(updatePaymentStatus.fulfilled, (state, action) => {
        const updatedOrder = action.payload.purchaseOrder
        const index = state.purchases.findIndex((order) => order.purchaseOrderId === updatedOrder.purchaseOrderId)

        if (index !== -1) {
          state.purchases[index] = updatedOrder
        }

        if (state.currentPurchaseOrder && state.currentPurchaseOrder.purchaseOrderId === updatedOrder.purchaseOrderId) {
          state.currentPurchaseOrder = updatedOrder
        }

        state.updatingPaymentStatus = false
        state.updatePaymentStatusError = null
      })
      .addCase(updatePaymentStatus.rejected, (state, action) => {
        state.updatingPaymentStatus = false
        state.updatePaymentStatusError = action.payload || "Failed to update payment status"
      })
      .addCase(fetchPurchaseReturnReasons.pending, (state) => {
        state.returnReasonsLoading = true
        state.returnReasonsError = null
      })
      .addCase(fetchPurchaseReturnReasons.fulfilled, (state, action) => {
        state.purchaseReturnReasons = action.payload
        state.returnReasonsLoading = false
        state.returnReasonsError = null
      })
      .addCase(fetchPurchaseReturnReasons.rejected, (state, action) => {
        state.returnReasonsLoading = false
        state.returnReasonsError = action.payload || "Failed to fetch purchase return reasons"
        state.purchaseReturnReasons = []
      })
      .addCase(createPurchaseReturnReason.pending, (state) => {
        state.creatingReturnReason = true
        state.createReturnReasonError = null
      })
      .addCase(createPurchaseReturnReason.fulfilled, (state, action) => {
        state.creatingReturnReason = false
        state.createReturnReasonError = null
        state.createdReturnReason = action.payload
        state.purchaseReturnReasons.push(action.payload)
      })
      .addCase(createPurchaseReturnReason.rejected, (state, action) => {
        state.creatingReturnReason = false
        state.createReturnReasonError = action.payload || "Failed to create purchase return reason"
        state.createdReturnReason = null
      })
      .addCase(fetchPurchaseLedgers.pending, (state) => {
        state.purchaseLedgersLoading = true
        state.purchaseLedgersError = null
      })
      .addCase(fetchPurchaseLedgers.fulfilled, (state, action) => {
        const allLedgers: PurchaseLedger[] = []
        action.payload.purchaseOrders.forEach((order) => {
          allLedgers.push(...order.ledgers)
        })

        state.purchaseLedgers = allLedgers
        state.purchaseLedgersGrouped = action.payload.purchaseOrders
        state.purchaseLedgersPagination = {
          pageNo: action.payload.pageNo,
          pageSize: action.payload.pageSize,
          totalElements: action.payload.totalElements,
          totalPages: action.payload.totalPages,
          last: action.payload.last,
        }
        state.purchaseLedgersLoading = false
        state.purchaseLedgersError = null
      })
      .addCase(fetchPurchaseLedgers.rejected, (state, action) => {
        state.purchaseLedgersLoading = false
        state.purchaseLedgersError = action.payload || "Failed to fetch purchase ledgers"
        state.purchaseLedgers = []
        state.purchaseLedgersGrouped = []
        state.purchaseLedgersPagination = {
          pageNo: 0,
          pageSize: 0,
          totalElements: 0,
          totalPages: 0,
          last: true,
        }
      })
      .addCase(createReturnNote.pending, (state) => {
        state.creatingReturnNote = true
        state.createReturnNoteError = null
      })
      .addCase(createReturnNote.fulfilled, (state, action) => {
        state.creatingReturnNote = false
        state.createReturnNoteError = null
        state.returnNoteResponse = action.payload
      })
      .addCase(createReturnNote.rejected, (state, action) => {
        state.creatingReturnNote = false
        state.createReturnNoteError = action.payload || "Failed to create return note"
        state.returnNoteResponse = null
      })
      .addCase(updatePurchaseOrder.pending, (state) => {
        state.updating = true
        state.updateError = null
      })
      .addCase(updatePurchaseOrder.fulfilled, (state, action) => {
        state.updating = false
        state.updateError = null
        state.updatedOrder = action.payload
      })
      .addCase(updatePurchaseOrder.rejected, (state, action) => {
        state.updating = false
        state.updateError = action.payload || "Failed to update purchase order"
        state.updatedOrder = null
      })
  },
})

export const {
  fetchPurchasesStart,
  fetchPurchasesSuccess,
  fetchPurchasesFailure,
  createPurchaseOrderStart,
  createPurchaseOrderSuccess,
  createPurchaseOrderFailure,
  updatePurchaseOrderStart,
  updatePurchaseOrderSuccess,
  updatePurchaseOrderFailure,
  fetchPurchaseOrderByIdStart,
  fetchPurchaseOrderByIdSuccess,
  fetchPurchaseOrderByIdFailure,
  clearCurrentPurchaseOrder,
  clearPurchases,
  clearCreateOrder,
  clearUpdateOrder,
  fetchPurchaseReturnReasonsStart,
  fetchPurchaseReturnReasonsSuccess,
  fetchPurchaseReturnReasonsFailure,
  createPurchaseReturnReasonStart,
  createPurchaseReturnReasonSuccess,
  createPurchaseReturnReasonFailure,
  clearPurchaseReturnReasons,
  clearCreatedReturnReason,
  fetchPurchaseLedgersStart,
  fetchPurchaseLedgersSuccess,
  fetchPurchaseLedgersFailure,
  clearPurchaseLedgers,
  createReturnNoteStart,
  createReturnNoteSuccess,
  createReturnNoteFailure,
  clearReturnNote,
} = purchaseSlice.actions

export const fetchAllPurchases = () => async (dispatch: AppDispatch) => {
  try {
    dispatch(fetchPurchasesStart())
    const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken")
    if (!token) throw new Error("No authentication token found")

    const response = await axios.get<PurchaseResponse>(
      `${API_CONFIG.BASE_URL}/supplier-service/api/purchase-orders/purchase-orders?status=ALL`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    )

    if (!response.data.purchaseOrders || !Array.isArray(response.data.purchaseOrders)) {
      throw new Error("Invalid response format from server")
    }

    dispatch(fetchPurchasesSuccess(response.data.purchaseOrders))
  } catch (error: any) {
    let errorMessage = "Failed to fetch purchases"
    if (error.response?.data) {
      const apiError = error.response.data
      errorMessage = apiError.errorMessage || apiError.message || "API request failed"
    } else if (error.message) {
      errorMessage = error.message
    }
    dispatch(fetchPurchasesFailure(errorMessage))
  }
}

export const fetchPurchaseOrderById = (id: number) => async (dispatch: AppDispatch) => {
  try {
    dispatch(fetchPurchaseOrderByIdStart())
    const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken")
    if (!token) throw new Error("No authentication token found")

    const response = await axios.get<PurchaseOrderByIdResponse>(
      `${API_CONFIG.BASE_URL}/supplier-service/api/purchase-orders/${id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    )

    dispatch(fetchPurchaseOrderByIdSuccess(response.data))
    return response.data
  } catch (error: any) {
    let errorMessage = "Failed to fetch purchase order"
    if (error.response?.data) {
      const apiError = error.response.data
      errorMessage = apiError.errorMessage || apiError.message || "API request failed"
    } else if (error.message) {
      errorMessage = error.message
    }
    dispatch(fetchPurchaseOrderByIdFailure(errorMessage))
    throw new Error(errorMessage)
  }
}

export const createPurchaseOrder = (orderData: CreatePurchaseOrderRequest) => async (dispatch: AppDispatch) => {
  try {
    dispatch(createPurchaseOrderStart())
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

    dispatch(createPurchaseOrderSuccess(response.data))
    return response.data
  } catch (error: any) {
    let errorMessage = "Failed to create purchase order"
    if (error.response?.data) {
      const apiError = error.response.data
      errorMessage = apiError.errorMessage || apiError.message || "API request failed"
    } else if (error.message) {
      errorMessage = error.message
    }
    dispatch(createPurchaseOrderFailure(errorMessage))
    throw new Error(errorMessage)
  }
}

export const updatePurchaseOrder = createAsyncThunk<
  UpdatePurchaseOrderResponse,
  UpdatePurchaseOrderRequest,
  { rejectValue: string }
>("purchase/updatePurchaseOrder", async (orderData, { rejectWithValue }) => {
  try {
    const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken")
    if (!token) throw new Error("No authentication token found")

    const response = await axios.put<UpdatePurchaseOrderResponse>(
      `${API_CONFIG.BASE_URL}/supplier-service/api/purchase-orders/update-purchase-order`,
      orderData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    )

    return response.data
  } catch (error: any) {
    let errorMessage = "Failed to update purchase order"
    if (error.response?.data) {
      const apiError = error.response.data
      errorMessage = apiError.errorMessage || apiError.message || "API request failed"
    } else if (error.message) {
      errorMessage = error.message
    }
    return rejectWithValue(errorMessage)
  }
})

export const updatePaymentStatus = createAsyncThunk<
  UpdatePaymentStatusResponse,
  UpdatePaymentStatusRequest,
  { rejectValue: string }
>("purchase/updatePaymentStatus", async (paymentData, { rejectWithValue }) => {
  try {
    const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken")
    if (!token) throw new Error("No authentication token found")

    const response = await axios.post<UpdatePaymentStatusResponse>(
      `${API_CONFIG.BASE_URL}/supplier-service/api/purchase-orders/update-payment-status-manual-po`,
      paymentData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    )

    return response.data
  } catch (error: any) {
    let errorMessage = "Failed to update payment status"
    if (error.response?.data) {
      const apiError = error.response.data
      errorMessage = apiError.errorMessage || apiError.message || "API request failed"
    } else if (error.message) {
      errorMessage = error.message
    }
    return rejectWithValue(errorMessage)
  }
})

export const fetchPurchaseReturnReasons = createAsyncThunk<PurchaseReturnReason[], void, { rejectValue: string }>(
  "purchase/fetchPurchaseReturnReasons",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken")
      if (!token) throw new Error("No authentication token found")

      const response = await axios.get<PurchaseReturnReason[]>(
        `${API_CONFIG.BASE_URL}/supplier-service/api/purchase-return-reasons`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      )

      console.log("Return reasons response:", response.data)
      return response.data
    } catch (error: any) {
      let errorMessage = "Failed to fetch purchase return reasons"
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

export const createPurchaseReturnReason = createAsyncThunk<
  CreatePurchaseReturnReasonResponse,
  CreatePurchaseReturnReasonRequest,
  { rejectValue: string }
>("purchase/createPurchaseReturnReason", async (reasonData, { rejectWithValue }) => {
  try {
    const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken")
    if (!token) throw new Error("No authentication token found")

    const response = await axios.post<CreatePurchaseReturnReasonResponse>(
      `${API_CONFIG.BASE_URL}/supplier-service/api/purchase-return-reasons`,
      reasonData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    )

    return response.data
  } catch (error: any) {
    let errorMessage = "Failed to create purchase return reason"
    if (error.response?.data) {
      const apiError = error.response.data
      errorMessage = apiError.errorError || apiError.message || "API request failed"
    } else if (error.message) {
      errorMessage = error.message
    }
    return rejectWithValue(errorMessage)
  }
})

export const fetchPurchaseLedgers = createAsyncThunk<PurchaseLedgerGroupedResponse, void, { rejectValue: string }>(
  "purchase/fetchPurchaseLedgers",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken")
      if (!token) throw new Error("No authentication token found")

      const requestBody = {
        pageNo: 0,
        pageSize: 100,
        sortBy: "purchaseLedgerId",
        sortDir: "asc",
      }

      const response = await axios.post<PurchaseLedgerGroupedResponse>(
        `${API_CONFIG.BASE_URL}/supplier-service/api/purchase-ledgers/grouped`,
        requestBody,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      )

      return response.data
    } catch (error: any) {
      let errorMessage = "Failed to fetch purchase ledgers"
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

export const createReturnNote = createAsyncThunk<ReturnNoteResponse, ReturnNoteRequest, { rejectValue: string }>(
  "purchase/createReturnNote",
  async (returnNoteData, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken")
      if (!token) throw new Error("No authentication token found")

      const response = await axios.post<ReturnNoteResponse>(
        `${API_CONFIG.BASE_URL}/supplier-service/api/purchase-orders/return-note`,
        returnNoteData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      )

      return response.data
    } catch (error: any) {
      let errorMessage = "Failed to create return note"
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

// Export the helper functions for use in components
export { calculateOrderTotals, calculateItemTotalWithTax }

export const selectPurchases = (state: RootState) => state.purchase
export const selectCurrentPurchaseOrder = (state: RootState) => state.purchase.currentPurchaseOrder
export const selectCurrentPurchaseOrderLoading = (state: RootState) => state.purchase.currentLoading
export const selectCurrentPurchaseOrderError = (state: RootState) => state.purchase.currentError
export const selectUpdatingPaymentStatus = (state: RootState) => state.purchase.updatingPaymentStatus
export const selectUpdatePaymentStatusError = (state: RootState) => state.purchase.updatePaymentStatusError
export const selectPurchaseReturnReasons = (state: RootState) => state.purchase.purchaseReturnReasons
export const selectPurchaseReturnReasonsLoading = (state: RootState) => state.purchase.returnReasonsLoading
export const selectPurchaseReturnReasonsError = (state: RootState) => state.purchase.returnReasonsError
export const selectCreatingReturnReason = (state: RootState) => state.purchase.creatingReturnReason
export const selectCreateReturnReasonError = (state: RootState) => state.purchase.createReturnReasonError
export const selectCreatedReturnReason = (state: RootState) => state.purchase.createdReturnReason
export const selectPurchaseLedgers = (state: RootState) => state.purchase.purchaseLedgers
export const selectPurchaseLedgersGrouped = (state: RootState) => state.purchase.purchaseLedgersGrouped
export const selectPurchaseLedgersPagination = (state: RootState) => state.purchase.purchaseLedgersPagination
export const selectPurchaseLedgersLoading = (state: RootState) => state.purchase.purchaseLedgersLoading
export const selectPurchaseLedgersError = (state: RootState) => state.purchase.purchaseLedgersError
export const selectCreatingReturnNote = (state: RootState) => state.purchase.creatingReturnNote
export const selectCreateReturnNoteError = (state: RootState) => state.purchase.createReturnNoteError
export const selectReturnNoteResponse = (state: RootState) => state.purchase.returnNoteResponse
export const selectUpdatingPurchaseOrder = (state: RootState) => state.purchase.updating
export const selectUpdatePurchaseOrderError = (state: RootState) => state.purchase.updateError
export const selectUpdatedPurchaseOrder = (state: RootState) => state.purchase.updatedOrder

export default purchaseSlice.reducer
