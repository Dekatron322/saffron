import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { AppDispatch, RootState } from "./store"
import axios from "axios"
import { API_CONFIG } from "../config/api"

interface BatchDetail {
  mrp: string
  batchNo: string
  mfg: string
  mfgDate: string
  expDate: string
  packing: string
}

interface Category {
  createdDate: string
  createdBy: string
  modifiedDate: string
  modifiedBy: string
  catId: number
  catName: string
}

interface HSN {
  hsnId: number
  hsnNumber: number
  description: string
}

interface Branch {
  branchId: number
  branchName: string
  location: string
}

interface Product {
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
  baseUnit: string | null
  secondaryUnit: string | null
  conversionRate: number | null
  branch: number
  itemName: string
  batchNo: string
  modelNo: string
  size: string
  mfgDate: string
  expDate: string
  mrp: number
  hsn: number
  reorderQuantity: number | null
  currentStockLevel: number | null
  reorderThreshold: number | null
  supplierId: number | null
  unitId: number
  packagingSize: number
  productStatus: boolean
  refundable: string
  paymentCategory: string | null
  type: string | null
  paidAmount: number | null
  linkPayment: boolean
  deductibleWalletAmount: number | null
  batchDetails: BatchDetail
  unitsAvailable?: number
  subUnitsPerUnit?: number
}

interface ProductResponse {
  products: Product[]
  currentPage: number
  totalPages: number
  totalElements: number
  pageSize: number
  lastPage: boolean
}

interface StockSummary {
  totalStock: number
  totalStockAmount: number
  percentChange: string
  productDto: Product[]
}

interface CategoryResponse {
  success: boolean
  message: string
  data: Category | Category[]
}

interface HSNResponse {
  success: boolean
  message: string
  data: HSN | HSN[]
}

interface BranchesResponse {
  success: boolean
  message: string
  data: Branch[]
}

// New interface for discount at product level
interface ProductDiscount {
  discountType: string
  discountValue: number
  discountedAmount: number
}

// Updated interface for CreateProductPayload with discount
interface CreateProductPayload {
  productName: string
  description: string
  category: {
    catId: number
    catName: string
  }
  supplierId: number
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
  batchNo: string
  modelNo: string
  size: string
  mfgDate: string
  expDate: string
  mrp: number
  hsn: number
  reorderQuantity: number
  currentStockLevel?: number
  reorderThreshold: number
  packagingSize: number
  unitId: number
  refundable: string
  productStatus: boolean
  paymentCategory: string
  type: string
  paidAmount: number | string
  linkPayment: boolean
  deductibleWalletAmount: number
  discount?: ProductDiscount // Added discount field
}

// Interface for Product Transaction
interface ProductTransaction {
  invoiceDate: string
  productName: string
  supplier: string | null
  type: string
  quantity: number
  pricePerUnit: number
  totalPrice: number
  unit: string
  customer: string | null
  status: string
  loyaltyPointDiscount: number | null
  invoiceNo: number
  historyId: number | null
}

// Interface for Product Transactions Response
interface ProductTransactionsResponse {
  salePrice: number
  purchasePrice: number
  transactionSummary: ProductTransaction[]
  stockQuantity: number
  availableUnit: number
  currentPage: number
  totalPages: number
  totalElements: number
  pageSize: number
  lastPage: boolean
}

// Interface for Product Transactions Request
interface ProductTransactionsRequest {
  name: string
  page?: number
  size?: number
  sortBy?: string
  sortDir?: string
}

// Interface for Purchase Order Item
export interface PurchaseOrderItem {
  purchaseOrderItemId: number
  purchaseOrderId: number
  productId: number | null
  stagedProductId: number
  quantity: number
  unitPrice: number
  itemDetails: {
    productName: string
    purchasePrice: number
    supplierId: number
    taxRate: number
    unitId: number
    paidAmount: number
    salePrice: number
    reorderQuantity: number
    mrp: number
    mfgDate: string
    manufacturer: string
    hsn: string
    expDate: string
    description: string
    batchNo: string
    branchId: number
  }
}

// Interface for Transaction Details
export interface TransactionDetails {
  // Common / purchase-order fields
  purchaseOrderId?: number
  supplierId?: number
  orderDate?: string
  expectedDeliveryDate?: string
  totalAmount?: number
  raised?: boolean
  purchaseOrderItems?: PurchaseOrderItem[]
  paymentStatus?: string
  paymentCategory?: string
  type: string | null
  status?: string
  paidAmount?: number | null
  linkPayment?: boolean
  deductibleWalletAmount?: number | null
  discount?: number
  orderStatus?: string

  // Sale-order specific fields (used in TransactionDetailsModal)
  customerId?: number | string
  paymentStatusId?: number
  paymentTypeId?: number
  returnStatus?: string
  placeOfSupply?: string
  promoCode?: string
  loyaltyPointDiscount?: number | null
  subscriptionDiscount?: number | null

  // Sale order items
  saleOrderItems?: {
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
    saleOrderId: string | null
    statusOfItem: string | null
    defectQuantity: number | null
    unitName: string
    unitSold: number
    totalRevenue: number | null
    discountType: string | null
    discountValue: number
  }[]
}

// Interface for Transaction Details Response
export interface TransactionDetailsResponse {
  transaction: TransactionDetails
  orderType: string
}

// Interface for Transaction Details Request
interface TransactionDetailsRequest {
  type: string
  invoiceNo: number
}

interface ProductState {
  products: Product[]
  loading: boolean
  error: string | null
  pagination: {
    currentPage: number
    totalPages: number
    totalElements: number
    pageSize: number
    lastPage: boolean
  }
  stockSummary: StockSummary | null
  stockSummaryLoading: boolean
  stockSummaryError: string | null
  categories: Category[]
  categoriesLoading: boolean
  categoriesError: string | null
  hsnCodes: HSN[]
  hsnLoading: boolean
  hsnError: string | null
  branches: Branch[]
  branchesLoading: boolean
  branchesError: string | null
  createCategoryLoading: boolean
  createCategoryError: string | null
  createProductLoading: boolean
  createProductError: string | null
  createdProduct: Product | null
  productSuccess: boolean
  // New state for product transactions
  productTransactions: ProductTransactionsResponse | null
  productTransactionsLoading: boolean
  productTransactionsError: string | null
  // New state for transaction details
  transactionDetails: TransactionDetailsResponse | null
  transactionDetailsLoading: boolean
  transactionDetailsError: string | null
}

const initialState: ProductState = {
  products: [],
  loading: false,
  error: null,
  pagination: {
    currentPage: 0,
    totalPages: 1,
    totalElements: 0,
    pageSize: 10,
    lastPage: false,
  },
  stockSummary: null,
  stockSummaryLoading: false,
  stockSummaryError: null,
  categories: [],
  categoriesLoading: false,
  categoriesError: null,
  hsnCodes: [],
  hsnLoading: false,
  hsnError: null,
  branches: [],
  branchesLoading: false,
  branchesError: null,
  createCategoryLoading: false,
  createCategoryError: null,
  createProductLoading: false,
  createProductError: null,
  createdProduct: null,
  productSuccess: false,
  // Initialize product transactions state
  productTransactions: null,
  productTransactionsLoading: false,
  productTransactionsError: null,
  // Initialize transaction details state
  transactionDetails: null,
  transactionDetailsLoading: false,
  transactionDetailsError: null,
}

const productSlice = createSlice({
  name: "product",
  initialState,
  reducers: {
    fetchProductsStart(state) {
      state.loading = true
      state.error = null
    },
    fetchProductsSuccess(state, action: PayloadAction<ProductResponse>) {
      state.products = action.payload.products
      state.pagination = {
        currentPage: action.payload.currentPage,
        totalPages: action.payload.totalPages,
        totalElements: action.payload.totalElements,
        pageSize: action.payload.pageSize,
        lastPage: action.payload.lastPage,
      }
      state.loading = false
      state.error = null
    },
    fetchProductsFailure(state, action: PayloadAction<string>) {
      state.loading = false
      state.error = action.payload
    },
    clearProducts(state) {
      state.products = []
      state.pagination = {
        currentPage: 0,
        totalPages: 0,
        totalElements: 0,
        pageSize: 10,
        lastPage: false,
      }
    },
    fetchStockSummaryStart(state) {
      state.stockSummaryLoading = true
      state.stockSummaryError = null
    },
    fetchStockSummarySuccess(state, action: PayloadAction<StockSummary>) {
      state.stockSummary = action.payload
      state.stockSummaryLoading = false
      state.stockSummaryError = null
    },
    fetchStockSummaryFailure(state, action: PayloadAction<string>) {
      state.stockSummaryLoading = false
      state.stockSummaryError = action.payload
    },
    clearStockSummary(state) {
      state.stockSummary = null
    },
    fetchCategoriesStart(state) {
      state.categoriesLoading = true
      state.categoriesError = null
    },
    fetchCategoriesSuccess(state, action: PayloadAction<Category[]>) {
      state.categories = action.payload
      state.categoriesLoading = false
      state.categoriesError = null
    },
    fetchCategoriesFailure(state, action: PayloadAction<string>) {
      state.categoriesLoading = false
      state.categoriesError = action.payload
    },
    clearCategories(state) {
      state.categories = []
    },
    fetchHSNStart(state) {
      state.hsnLoading = true
      state.hsnError = null
    },
    fetchHSNSuccess(state, action: PayloadAction<HSN[]>) {
      state.hsnCodes = action.payload
      state.hsnLoading = false
      state.hsnError = null
    },
    fetchHSNFailure(state, action: PayloadAction<string>) {
      state.hsnLoading = false
      state.hsnError = action.payload
    },
    clearHSN(state) {
      state.hsnCodes = []
    },
    fetchBranchesStart(state) {
      state.branchesLoading = true
      state.branchesError = null
    },
    fetchBranchesSuccess(state, action: PayloadAction<Branch[]>) {
      state.branches = action.payload
      state.branchesLoading = false
      state.branchesError = null
    },
    fetchBranchesFailure(state, action: PayloadAction<string>) {
      state.branchesLoading = false
      state.branchesError = action.payload
    },
    clearBranches(state) {
      state.branches = []
    },
    createCategoryStart(state) {
      state.createCategoryLoading = true
      state.createCategoryError = null
    },
    createCategorySuccess(state, action: PayloadAction<Category>) {
      state.categories = [...state.categories, action.payload]
      state.createCategoryLoading = false
      state.createCategoryError = null
    },
    createCategoryFailure(state, action: PayloadAction<string>) {
      state.createCategoryLoading = false
      state.createCategoryError = action.payload
    },
    createProductStart(state) {
      state.createProductLoading = true
      state.createProductError = null
      state.productSuccess = false
      state.createdProduct = null
    },
    createProductSuccess(state, action: PayloadAction<Product>) {
      state.createProductLoading = false
      state.createProductError = null
      state.createdProduct = action.payload
      state.products = [action.payload, ...state.products]
      state.pagination.totalElements += 1
      state.productSuccess = true
    },
    createProductFailure(state, action: PayloadAction<string>) {
      state.createProductLoading = false
      state.createProductError = action.payload
      state.createdProduct = null
      state.productSuccess = false
    },
    clearCreatedProduct(state) {
      state.createdProduct = null
      state.productSuccess = false
    },
    // New reducers for product transactions
    fetchProductTransactionsStart(state) {
      state.productTransactionsLoading = true
      state.productTransactionsError = null
    },
    fetchProductTransactionsSuccess(state, action: PayloadAction<ProductTransactionsResponse>) {
      state.productTransactions = action.payload
      state.productTransactionsLoading = false
      state.productTransactionsError = null
    },
    fetchProductTransactionsFailure(state, action: PayloadAction<string>) {
      state.productTransactionsLoading = false
      state.productTransactionsError = action.payload
    },
    clearProductTransactions(state) {
      state.productTransactions = null
      state.productTransactionsError = null
    },
    // New reducers for transaction details
    fetchTransactionDetailsStart(state) {
      state.transactionDetailsLoading = true
      state.transactionDetailsError = null
    },
    fetchTransactionDetailsSuccess(state, action: PayloadAction<TransactionDetailsResponse>) {
      state.transactionDetails = action.payload
      state.transactionDetailsLoading = false
      state.transactionDetailsError = null
    },
    fetchTransactionDetailsFailure(state, action: PayloadAction<string>) {
      state.transactionDetailsLoading = false
      state.transactionDetailsError = action.payload
    },
    clearTransactionDetails(state) {
      state.transactionDetails = null
      state.transactionDetailsError = null
    },
  },
})

export const {
  fetchProductsStart,
  fetchProductsSuccess,
  fetchProductsFailure,
  clearProducts,
  fetchStockSummaryStart,
  fetchStockSummarySuccess,
  fetchStockSummaryFailure,
  clearStockSummary,
  fetchCategoriesStart,
  fetchCategoriesSuccess,
  fetchCategoriesFailure,
  clearCategories,
  fetchHSNStart,
  fetchHSNSuccess,
  fetchHSNFailure,
  clearHSN,
  fetchBranchesStart,
  fetchBranchesSuccess,
  fetchBranchesFailure,
  clearBranches,
  createCategoryStart,
  createCategorySuccess,
  createCategoryFailure,
  createProductStart,
  createProductSuccess,
  createProductFailure,
  clearCreatedProduct,
  // Export new actions
  fetchProductTransactionsStart,
  fetchProductTransactionsSuccess,
  fetchProductTransactionsFailure,
  clearProductTransactions,
  // Export transaction details actions
  fetchTransactionDetailsStart,
  fetchTransactionDetailsSuccess,
  fetchTransactionDetailsFailure,
  clearTransactionDetails,
} = productSlice.actions

export const fetchAllProducts =
  (page = 0, size = 10) =>
  async (dispatch: AppDispatch) => {
    try {
      dispatch(fetchProductsStart())
      const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken")
      if (!token) throw new Error("No authentication token found")

      const pageSize = Math.max(1, size)
      const requestBody = {
        pageNo: page,
        pageSize: pageSize,
        sortBy: "productId",
        sortDir: "desc",
      }

      const response = await axios.post(`${API_CONFIG.BASE_URL}/inventory-service/api/v1/product`, requestBody, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (response.data.success === false) {
        throw new Error(response.data.errorMessage || "Failed to fetch products")
      }

      if (!response.data.products || !Array.isArray(response.data.products)) {
        throw new Error("Invalid response format from server")
      }

      const payload = {
        products: response.data.products,
        currentPage: response.data.pageNo || page,
        totalPages: response.data.totalPages || 1,
        totalElements: response.data.totalElements || response.data.products.length,
        pageSize: response.data.pageSize || pageSize,
        lastPage: response.data.lastPage || false,
      }

      dispatch(fetchProductsSuccess(payload))

      return payload
    } catch (error: any) {
      let errorMessage = "Failed to fetch products"
      if (error.response?.data) {
        const apiError = error.response.data
        errorMessage = apiError.errorMessage || apiError.message || "API request failed"
        if (apiError.errorCode === "402") {
          errorMessage = "Invalid pagination parameters. Please try again."
        }
      } else if (error.message) {
        errorMessage = error.message
      }
      dispatch(fetchProductsFailure(errorMessage))
    }
  }

export const fetchStockSummary = (startDate: string, endDate: string) => async (dispatch: AppDispatch) => {
  try {
    dispatch(fetchStockSummaryStart())
    const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken")
    if (!token) throw new Error("No authentication token found")

    const response = await axios.post(
      `${API_CONFIG.BASE_URL}/inventory-service/api/v1/stock-summary/total-stock`,
      { startDate, endDate },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    )

    if (response.data.success === false) {
      throw new Error(response.data.errorMessage || "Failed to fetch stock summary")
    }

    dispatch(fetchStockSummarySuccess(response.data))
  } catch (error: any) {
    let errorMessage = "Failed to fetch stock summary"
    if (error.response?.data) {
      const apiError = error.response.data
      errorMessage = apiError.errorMessage || apiError.message || "API request failed"
    } else if (error.message) {
      errorMessage = error.message
    }
    dispatch(fetchStockSummaryFailure(errorMessage))
  }
}

export const fetchAllCategories = () => async (dispatch: AppDispatch) => {
  try {
    dispatch(fetchCategoriesStart())
    const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken")
    if (!token) throw new Error("No authentication token found")

    const response = await axios.get(`${API_CONFIG.BASE_URL}/inventory-service/api/v1/categories`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })

    if (response.data.success === false) {
      throw new Error(response.data.message || "Failed to fetch categories")
    }

    if (!response.data.data || !Array.isArray(response.data.data)) {
      throw new Error("Invalid response format from server")
    }

    dispatch(fetchCategoriesSuccess(response.data.data))
  } catch (error: any) {
    let errorMessage = "Failed to fetch categories"
    if (error.response?.data) {
      const apiError = error.response.data
      errorMessage = apiError.message || apiError.errorMessage || "API request failed"
    } else if (error.message) {
      errorMessage = error.message
    }
    dispatch(fetchCategoriesFailure(errorMessage))
  }
}

export const fetchAllHSN = () => async (dispatch: AppDispatch) => {
  try {
    dispatch(fetchHSNStart())
    const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken")
    if (!token) throw new Error("No authentication token found")

    const response = await axios.get(`${API_CONFIG.BASE_URL}/inventory-service/api/hsn`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })

    if (response.data.success === false) {
      throw new Error(response.data.message || "Failed to fetch HSN codes")
    }

    if (!Array.isArray(response.data)) {
      throw new Error("Invalid response format from server")
    }

    dispatch(fetchHSNSuccess(response.data as any))
  } catch (error: any) {
    let errorMessage = "Failed to fetch HSN codes"
    if (error.response?.data) {
      const apiError = error.response.data
      errorMessage = apiError.message || apiError.errorMessage || "API request failed"
    } else if (error.message) {
      errorMessage = error.message
    }
    dispatch(fetchHSNFailure(errorMessage))
  }
}

export const fetchAllBranches = () => async (dispatch: AppDispatch) => {
  try {
    dispatch(fetchBranchesStart())
    const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken")
    if (!token) throw new Error("No authentication token found")

    const response = await axios.get(`${API_CONFIG.BASE_URL}/inventory-service/api/v1/branches`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })

    if (response.data.success === false) {
      throw new Error(response.data.message || "Failed to fetch branches")
    }

    if (!response.data.data || !Array.isArray(response.data.data)) {
      throw new Error("Invalid response format from server")
    }

    dispatch(fetchBranchesSuccess(response.data.data))
  } catch (error: any) {
    let errorMessage = "Failed to fetch branches"
    if (error.response?.data) {
      const apiError = error.response.data
      errorMessage = apiError.message || apiError.errorMessage || "API request failed"
    } else if (error.message) {
      errorMessage = error.message
    }
    dispatch(fetchBranchesFailure(errorMessage))
  }
}

export const createCategory = (categoryName: string) => async (dispatch: AppDispatch) => {
  try {
    dispatch(createCategoryStart())
    const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken")
    if (!token) throw new Error("No authentication token found")

    const response = await axios.post(
      `${API_CONFIG.BASE_URL}/inventory-service/api/v1/categories`,
      { catName: categoryName },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    )

    if (response.data.success === false) {
      throw new Error(response.data.message || "Failed to create category")
    }

    if (!response.data.data) {
      throw new Error("Invalid response format from server")
    }

    dispatch(createCategorySuccess(response.data.data))
    return response.data.data
  } catch (error: any) {
    let errorMessage = "Failed to create category"
    if (error.response?.data) {
      const apiError = error.response.data
      errorMessage = apiError.message || apiError.errorMessage || "API request failed"
    } else if (error.message) {
      errorMessage = error.message
    }
    dispatch(createCategoryFailure(errorMessage))
    throw errorMessage
  }
}

export const createProduct = (productData: CreateProductPayload) => async (dispatch: AppDispatch) => {
  try {
    dispatch(createProductStart())
    const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken")
    if (!token) throw new Error("No authentication token found")

    const requestPayload = {
      productName: productData.productName,
      description: productData.description,
      category: productData.category,
      supplierId: productData.supplierId,
      manufacturer: productData.manufacturer,
      defaultMRP: productData.defaultMRP,
      salePrice: productData.salePrice,
      purchasePrice: productData.purchasePrice,
      discountType: productData.discountType,
      saleDiscount: productData.saleDiscount,
      openingStockQuantity: productData.openingStockQuantity,
      minimumStockQuantity: productData.minimumStockQuantity,
      itemLocation: productData.itemLocation,
      taxRate: productData.taxRate,
      inclusiveOfTax: productData.inclusiveOfTax,
      branch: productData.branch,
      batchDetails: {
        mrp: productData.mrp.toString(),
        batchNo: productData.batchNo,
        mfg: productData.manufacturer,
        mfgDate: productData.mfgDate,
        expDate: productData.expDate,
        packing: "Box",
      },
      modelNo: productData.modelNo,
      size: productData.size,
      mfgDate: productData.mfgDate,
      expDate: productData.expDate,
      mrp: productData.mrp,
      hsn: productData.hsn,
      reorderQuantity: productData.reorderQuantity,
      currentStockLevel: productData.openingStockQuantity,
      reorderThreshold: productData.reorderThreshold,
      packagingSize: productData.packagingSize,
      unitId: productData.unitId,
      refundable: productData.refundable,
      productStatus: productData.productStatus,
      paymentCategory: productData.paymentCategory.toLowerCase(),
      type: productData.type,
      paidAmount:
        typeof productData.paidAmount === "string" ? parseFloat(productData.paidAmount) : productData.paidAmount,
      linkPayment: productData.linkPayment,
      deductibleWalletAmount: productData.deductibleWalletAmount,
      // Add discount information if provided
      ...(productData.discount && { discount: productData.discount }),
    }

    const response = await axios.post(
      `${API_CONFIG.BASE_URL}/inventory-service/api/v1/product/create-product`,
      requestPayload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    )

    console.log("API Response:", response.data)

    if (response.data && (response.data.success === true || response.data.productId)) {
      dispatch(createProductSuccess(response.data))
      return response.data
    }

    if (response.data && response.data.success === false) {
      const errorMsg = response.data.message || response.data.errorMessage || "Failed to create product"
      throw new Error(errorMsg)
    }

    throw new Error("Unexpected response format from server")
  } catch (error: any) {
    let errorMessage = "Failed to create product"

    if (error.response) {
      const apiError = error.response.data
      if (apiError) {
        errorMessage =
          apiError.message ||
          apiError.errorMessage ||
          (apiError.errors ? Object.values(apiError.errors).join(", ") : "API request failed")
      }
    } else if (error.message) {
      errorMessage = error.message
    }

    console.error("Product creation error:", errorMessage)
    dispatch(createProductFailure(errorMessage))
    throw errorMessage
  }
}

// New function to create a manual purchase order with both payment-level and product-level discounts
export const createManualPurchaseOrder = (purchaseOrderData: any) => async (dispatch: AppDispatch) => {
  try {
    const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken")
    if (!token) throw new Error("No authentication token found")

    const response = await axios.post(
      `${API_CONFIG.BASE_URL}/supplier-service/api/purchase-orders/create-manual-purchase-order`,
      purchaseOrderData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    )

    if (response.data && (response.data.success === true || response.data.purchaseOrderId)) {
      return response.data
    }

    if (response.data && response.data.success === false) {
      const errorMsg = response.data.message || response.data.errorMessage || "Failed to create purchase order"
      throw new Error(errorMsg)
    }

    throw new Error("Unexpected response format from server")
  } catch (error: any) {
    let errorMessage = "Failed to create purchase order"

    if (error.response) {
      const apiError = error.response.data
      if (apiError) {
        errorMessage =
          apiError.message ||
          apiError.errorMessage ||
          (apiError.errors ? Object.values(apiError.errors).join(", ") : "API request failed")
      }
    } else if (error.message) {
      errorMessage = error.message
    }

    console.error("Purchase order creation error:", errorMessage)
    throw errorMessage
  }
}

// New function to fetch product transactions
export const fetchProductTransactions = (requestData: ProductTransactionsRequest) => async (dispatch: AppDispatch) => {
  try {
    dispatch(fetchProductTransactionsStart())
    const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken")
    if (!token) throw new Error("No authentication token found")

    const requestBody = {
      name: requestData.name,
      page: requestData.page || 0,
      size: requestData.size || 5,
      sortBy: requestData.sortBy || "invoiceDate",
      sortDir: requestData.sortDir || "asc",
    }

    const response = await axios.post(
      `${API_CONFIG.BASE_URL}/inventory-service/api/v1/histories/product`,
      requestBody,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    )

    // Assuming the API returns the data directly in the response structure shown
    if (response.data && response.data.transactionSummary) {
      dispatch(fetchProductTransactionsSuccess(response.data))
      return response.data
    }

    // If the API wraps the response in a success/data structure
    if (response.data.success === true && response.data.data) {
      dispatch(fetchProductTransactionsSuccess(response.data.data))
      return response.data.data
    }

    if (response.data.success === false) {
      throw new Error(response.data.message || response.data.errorMessage || "Failed to fetch product transactions")
    }

    throw new Error("Invalid response format from server")
  } catch (error: any) {
    let errorMessage = "Failed to fetch product transactions"

    if (error.response?.data) {
      const apiError = error.response.data
      errorMessage = apiError.message || apiError.errorMessage || "API request failed"
    } else if (error.message) {
      errorMessage = error.message
    }

    console.error("Product transactions fetch error:", errorMessage)
    dispatch(fetchProductTransactionsFailure(errorMessage))
    throw errorMessage
  }
}

// New function to fetch transaction details by type and invoice number
export const fetchTransactionDetails = (requestData: TransactionDetailsRequest) => async (dispatch: AppDispatch) => {
  try {
    dispatch(fetchTransactionDetailsStart())
    const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken")
    if (!token) throw new Error("No authentication token found")

    const requestBody = {
      type: requestData.type,
      invoiceNo: requestData.invoiceNo,
    }

    const response = await axios.post(
      `${API_CONFIG.BASE_URL}/inventory-service/api/v1/history/viewTransactionDetails`,
      requestBody,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    )

    // Check if response has the expected structure
    if (response.data && response.data.transaction) {
      dispatch(fetchTransactionDetailsSuccess(response.data))
      return response.data
    }

    // If the API wraps the response in a success/data structure
    if (response.data.success === true && response.data.data) {
      dispatch(fetchTransactionDetailsSuccess(response.data.data))
      return response.data.data
    }

    if (response.data.success === false) {
      throw new Error(response.data.message || response.data.errorMessage || "Failed to fetch transaction details")
    }

    throw new Error("Invalid response format from server")
  } catch (error: any) {
    let errorMessage = "Failed to fetch transaction details"

    if (error.response?.data) {
      const apiError = error.response.data
      errorMessage = apiError.message || apiError.errorMessage || "API request failed"
    } else if (error.message) {
      errorMessage = error.message
    }

    console.error("Transaction details fetch error:", errorMessage)
    dispatch(fetchTransactionDetailsFailure(errorMessage))
    throw errorMessage
  }
}

export const selectProducts = (state: RootState) => state.product
export const selectStockSummary = (state: RootState) => ({
  stockSummary: state.product.stockSummary,
  loading: state.product.stockSummaryLoading,
  error: state.product.stockSummaryError,
})
export const selectCategories = (state: RootState) => ({
  categories: state.product.categories,
  loading: state.product.categoriesLoading,
  error: state.product.categoriesError,
})
export const selectHSN = (state: RootState) => ({
  hsnCodes: state.product.hsnCodes,
  loading: state.product.hsnLoading,
  error: state.product.hsnError,
})
export const selectBranches = (state: RootState) => ({
  branches: state.product.branches,
  loading: state.product.branchesLoading,
  error: state.product.branchesError,
})
export const selectCreateCategory = (state: RootState) => ({
  loading: state.product.createCategoryLoading,
  error: state.product.createCategoryError,
})
export const selectCreateProduct = (state: RootState) => ({
  loading: state.product.createProductLoading,
  error: state.product.createProductError,
  success: state.product.productSuccess,
  createdProduct: state.product.createdProduct,
})
// New selector for product transactions
export const selectProductTransactions = (state: RootState) => ({
  productTransactions: state.product.productTransactions,
  loading: state.product.productTransactionsLoading,
  error: state.product.productTransactionsError,
})
// New selector for transaction details
export const selectTransactionDetails = (state: RootState) => ({
  transactionDetails: state.product.transactionDetails,
  loading: state.product.transactionDetailsLoading,
  error: state.product.transactionDetailsError,
})

export default productSlice.reducer
