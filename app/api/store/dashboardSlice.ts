// src/store/dashboardSlice.ts
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit"
import { AppDispatch, RootState } from "./store"
import axios from "axios"
import { API_CONFIG } from "../config/api"

// Interface for sales request body
interface SalesDashboardRequest {
  pageNo: number
  pageSize: number
  sortBy: string
  sortDir: string
}

// Interface for purchase request body (without date range)
interface PurchaseDashboardRequest {
  pageNo: number
  pageSize: number
  sortBy: string
  sortDir: string
}

// Interface for stock request body (empty for now)
interface StockSummaryRequest {
  // Can add parameters here if needed in the future
}

// Interface for stock levels request body (empty for now)
interface StockLevelsRequest {
  // Can add parameters here if needed in the future
}

// Interface for sales growth request body (empty for now)
interface SalesGrowthRequest {
  // Can add parameters here if needed in the future
}

// Interface for order summary request body
interface OrderSummaryRequest {
  createdDateTo: string
}

// Interface for low stock alerts request body (empty for GET request)
interface LowStockAlertsRequest {
  // No parameters needed for this GET request
}

// Interface for sales purchase graph request body
interface SalesPurchaseGraphRequest {
  period:
    | "TODAY"
    | "THIS_WEEK"
    | "THIS_MONTH"
    | "THIS_YEAR"
    | "YEAR"
    | "LAST_MONTH"
    | "LAST_3_MONTHS"
    | "LAST_6_MONTHS"
    | "CUSTOM"
  startDate?: string
  endDate?: string
}

// Interface for top selling categories request body
interface TopSellingCategoriesRequest {
  createdDateFrom: string
  createdDateTo: string
}

// Interface for sales purchase graph data point
interface SalesPurchaseDataPoint {
  date: string
  sale: number
  purchase: number
  cumulativeSale: number
  cumulativePurchase: number
}

// Interface for sales purchase graph response
interface SalesPurchaseGraphResponse {
  success: boolean
  message: string
  error: string | null
  data: SalesPurchaseDataPoint[]
  // Remove summary since it's not in the actual response, or keep if it exists
  summary?: {
    totalSales: number
    totalPurchases: number
    totalProfit: number
    salesGrowth: number
    purchasesGrowth: number
    profitGrowth: number
  }
}

// Interface for sales response body
interface SalesDashboardResponse {
  success: boolean
  message: string
  error: string | null
  growth: number
  totalSaleAmount: number
  saleOrders: any[]
  pageNo: number
  pageSize: number
  totalElements: number
  totalPages: number
  last: boolean
}

// Interface for sale order item
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
  discountValue: number
}

// Interface for contributing sale order
interface ContributingSaleOrder {
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
  placeOfSupply: string | null
  promoCode: string | null
  saleOrderInvoiceNo: string | null
  createdDate: string | null
  loyaltyPointUsed: boolean
  loyaltyPoints: number | null
  subscriptionPoints: number | null
  checkoutType: string
  paymentInfo: any | null
  upgradeSubscription: any | null
  purchaseSubscription: any | null
  subscriptionDetails: any | null
  extraDiscount: boolean
  saleType: string | null
  loyaltyPointDiscount: number | null
  subscriptionDiscount: number | null
}

// Interface for sale growth DTO
interface SaleGrowthDto {
  growthAmount: number
  growthPercentage: number
  contributingSaleOrders: ContributingSaleOrder[]
}

// Interface for sales growth response
interface SalesGrowthResponse {
  success: boolean
  message: string
  error: string | null
  saleGrowthDto: SaleGrowthDto
}

// Interface for purchase order item
interface PurchaseOrderItem {
  purchaseOrderItemId: number
  quantity: number
  unitPrice: number
  stagedProductId: number
  purchaseOrderId: number
  itemDetails: {
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
    baseUnit: string | null
    secondaryUnit: string | null
    reorderQuantity: number
    currentStockLevel: number
    reorderThreshold: number
    supplierId: number
    productStatus: boolean
    refundable: boolean | null
    stagedProductId: number
    paidAmount: number
    paymentType: string | null
    purchaseOrderId: number
  }
}

// Interface for purchase order
interface PurchaseOrder {
  purchaseOrderId: number
  supplierId: number
  orderDate: string
  expectedDeliveryDate: string
  totalAmount: number
  totalAmountWithTax: number | null
  raised: boolean
  purchaseOrderItems: PurchaseOrderItem[]
  paymentStatus: string | null
  paymentCategory: string | null
  type: string | null
  status: string
  paidAmount: number
  linkPayment: boolean
  deductibleWalletAmount: number | null
  orderType: string
  discount: number
  discountDto: any | null
  orderStatus: string
}

// Interface for purchase response body
interface PurchaseDashboardResponse {
  pageNo: number
  pageSize: number
  totalElements: number
  totalPages: number
  last: boolean
  totalPurchases: number
  percentageChange: string
  purchaseOrders: PurchaseOrder[]
}

// Interface for category
interface Category {
  createdDate: string
  createdBy: string
  modifiedDate: string
  modifiedBy: string
  catId: number
  catName: string
  subCatId?: number | null
  subCategory?: string | null
}

// Interface for batch details
interface BatchDetails {
  mrp: number
  batchNo: string
  mfg: string | null
  mfgDate: string
  expDate: string
  packing: string
  productDto: any | null
}

// Interface for product
interface Product {
  productId: number
  productName: string
  description: string
  category: Category
  manufacturer: string
  price: number | null
  productCode: string | null
  defaultMRP: number
  salePrice: number
  purchasePrice: number
  discountType: string | null
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
  mrp: string
  hsn: number
  reorderQuantity: number | null
  currentStockLevel: number | null
  reorderThreshold: number | null
  supplierId: number | null
  status: string | null
  productCondition: string | null
  unitId: number
  packagingSize: number
  productStatus: boolean
  refundable: string | boolean | null
  paymentCategory: string | null
  type: string | null
  paidAmount: number | null
  linkPayment: boolean
  deductibleWalletAmount: number | null
  batchDetails: any | null
  batchDetailsDtoList: BatchDetails[]
  points: number
  createdManually: boolean
}

// Interface for stock summary response
interface StockSummaryResponse {
  totalStock: number
  totalStockAmount: number
  percentChange: string
  productDto: Product[]
}

// Interface for stock levels response
interface StockLevelsResponse {
  inStock: number
  lowStock: number
  expired: number
  outOfStock: number
  inStockPercentage: number
  lowStockPercentage: number
  expiredPercentage: number
  outOfStockPercentage: number
  inStockItems: Product[]
  lowStockItems: Product[]
  expiredItems: Product[]
  outOfStockItems: Product[]
}

// Interface for order summary item
interface OrderSummaryItem {
  itemName: string
  quantity: number
  pricePerUnit: number
  unitSold: number
}

// Interface for order in order summary
interface OrderSummaryOrder {
  saleOrderId: number
  customerId: number
  paymentStatusId: number
  paymentTypeId: number
  orderStatus: string
  returnStatus: string
  saleOrderItems: OrderSummaryItem[]
  paidAmount: number
  linkPayment: boolean
  deductibleWalletAmount: number | null
  placeOfSupply: number | null
  promoCode: string | null
  saleOrderInvoiceNo: string | null
  createdDate: string | null
  loyaltyPointUsed: boolean
  loyaltyPoints: number | null
  subscriptionPoints: number | null
  checkoutType: string
  paymentInfo: any | null
  upgradeSubscription: any | null
  purchaseSubscription: any | null
  subscriptionDetails: any | null
  extraDiscount: boolean
  saleType: string | null
  loyaltyPointDiscount: number | null
  subscriptionDiscount: number | null
}

// Interface for order summary DTO
interface OrderSummaryDto {
  totalOrders: number
  completedOrders: number
  pendingOrders: number
  cancelledOrders: number
  growthPercentage: number
  orders: OrderSummaryOrder[]
}

// Interface for order summary response
interface OrderSummaryResponse {
  success: boolean
  message: string
  error: string | null
  orderSummaryDto: OrderSummaryDto
}

// Interface for supplier low stock products
interface SupplierLowStockProducts {
  supplierId: number
  products: Product[]
}

// Interface for low stock alerts response
interface LowStockAlertsResponse {
  lowStocks: SupplierLowStockProducts[]
}

// Interface for top selling category item
interface TopSellingCategoryItem {
  productId: number
  productName: string
  description: string
  category: Category
  manufacturer: string
  price: number | null
  productCode: string | null
  defaultMRP: number
  salePrice: number
  purchasePrice: number
  discountType: string | null
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
  mrp: string
  hsn: number
  reorderQuantity: number | null
  currentStockLevel: number | null
  reorderThreshold: number | null
  supplierId: number | null
  status: string | null
  productCondition: string | null
  unitId: number
  packagingSize: number
  refundable: string | boolean | null
  points: number
}

// Interface for top selling category DTO
interface TopSellingCategoryDto {
  categoryName: string
  totalQuantity: number
  totalSaleGrowth: number
  percentage: number
  items: TopSellingCategoryItem[]
}

// Interface for top selling categories response
interface TopSellingCategoriesResponse {
  success: boolean
  message: string
  error: string | null
  topSellingCategoryDto: TopSellingCategoryDto[]
}

// State interface
interface DashboardState {
  salesData: SalesDashboardResponse | null
  purchaseData: PurchaseDashboardResponse | null
  stockData: StockSummaryResponse | null
  stockLevelsData: StockLevelsResponse | null
  salesGrowthData: SalesGrowthResponse | null
  orderSummaryData: OrderSummaryResponse | null
  lowStockAlertsData: LowStockAlertsResponse | null
  salesPurchaseGraphData: SalesPurchaseGraphResponse | null
  topSellingCategoriesData: TopSellingCategoriesResponse | null
  salesLoading: boolean
  purchaseLoading: boolean
  stockLoading: boolean
  stockLevelsLoading: boolean
  salesGrowthLoading: boolean
  orderSummaryLoading: boolean
  lowStockAlertsLoading: boolean
  salesPurchaseGraphLoading: boolean
  topSellingCategoriesLoading: boolean
  error: string | null
  salesPurchaseGraphPeriod:
    | "TODAY"
    | "THIS_WEEK"
    | "THIS_MONTH"
    | "THIS_YEAR"
    | "YEAR"
    | "LAST_MONTH"
    | "LAST_3_MONTHS"
    | "LAST_6_MONTHS"
    | "CUSTOM"
  salesPurchaseGraphLastFetch: number | null
}

// Initial state
const initialState: DashboardState = {
  salesData: null,
  purchaseData: null,
  stockData: null,
  stockLevelsData: null,
  salesGrowthData: null,
  orderSummaryData: null,
  lowStockAlertsData: null,
  salesPurchaseGraphData: null,
  topSellingCategoriesData: null,
  salesLoading: false,
  purchaseLoading: false,
  stockLoading: false,
  stockLevelsLoading: false,
  salesGrowthLoading: false,
  orderSummaryLoading: false,
  lowStockAlertsLoading: false,
  salesPurchaseGraphLoading: false,
  topSellingCategoriesLoading: false,
  error: null,
  salesPurchaseGraphPeriod: "THIS_MONTH",
  salesPurchaseGraphLastFetch: null,
}

// Helper function to get today's date in YYYY-MM-DD format
const getTodayDate = (): string => {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, "0")
  const day = String(today.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

// Helper function to get first day of current month in YYYY-MM-DD format
const getFirstDayOfMonth = (): string => {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, "0")
  return `${year}-${month}-01`
}

// Create async thunk for fetching sales purchase graph data with caching
export const fetchSalesPurchaseGraphData = createAsyncThunk<
  SalesPurchaseGraphResponse,
  {
    period:
      | "TODAY"
      | "THIS_WEEK"
      | "THIS_MONTH"
      | "THIS_YEAR"
      | "YEAR"
      | "LAST_MONTH"
      | "LAST_3_MONTHS"
      | "LAST_6_MONTHS"
      | "CUSTOM"
    startDate?: string
    endDate?: string
    forceRefresh?: boolean
  },
  {
    dispatch: AppDispatch
    state: RootState
    rejectValue: string
  }
>(
  "dashboard/fetchSalesPurchaseGraphData",
  async ({ period, startDate, endDate, forceRefresh = false }, { getState, rejectWithValue }) => {
    try {
      const state = getState() as RootState
      const { salesPurchaseGraphLastFetch, salesPurchaseGraphPeriod, salesPurchaseGraphData } = state.dashboard

      // Prevent multiple calls: Check if we already have data for this period and it's recent (5 minutes)
      const now = Date.now()
      const fiveMinutes = 5 * 60 * 1000 // 5 minutes in milliseconds

      if (
        !forceRefresh &&
        salesPurchaseGraphData &&
        salesPurchaseGraphPeriod === period &&
        salesPurchaseGraphLastFetch &&
        now - salesPurchaseGraphLastFetch < fiveMinutes
      ) {
        console.log(`Using cached sales purchase graph data for period: ${period}`)
        return salesPurchaseGraphData
      }

      const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken")
      if (!token) throw new Error("No authentication token found")

      const requestBody: SalesPurchaseGraphRequest = {
        period,
        ...(period === "CUSTOM" && startDate && endDate && { startDate, endDate }),
      }

      console.log("Fetching sales purchase graph data with request body:", requestBody)

      const response = await axios.post<any>(
        `${API_CONFIG.BASE_URL}/inventory-service/api/v1/stock-summary/sale-purchase`,
        requestBody,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          timeout: 10000,
        }
      )

      // The API returns a raw array of data points. Normalize it to our expected shape.
      const raw = response.data
      const normalized: SalesPurchaseGraphResponse = Array.isArray(raw)
        ? {
            success: true,
            message: "",
            error: null,
            data: raw as SalesPurchaseDataPoint[],
          }
        : (raw as SalesPurchaseGraphResponse)

      console.log("Sales purchase graph response (normalized):", normalized)
      return normalized
    } catch (error: any) {
      let errorMessage = "Failed to fetch sales purchase graph data"

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

      console.error("Sales purchase graph fetch error:", error)
      return rejectWithValue(errorMessage)
    }
  }
)

// Create async thunk for fetching top selling categories data
export const fetchTopSellingCategoriesData = createAsyncThunk<
  TopSellingCategoriesResponse,
  { createdDateFrom?: string; createdDateTo?: string },
  {
    dispatch: AppDispatch
    state: RootState
    rejectValue: string
  }
>("dashboard/fetchTopSellingCategoriesData", async ({ createdDateFrom, createdDateTo }, { rejectWithValue }) => {
  try {
    const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken")
    if (!token) throw new Error("No authentication token found")

    const requestBody: TopSellingCategoriesRequest = {
      createdDateFrom: createdDateFrom || getFirstDayOfMonth(),
      createdDateTo: createdDateTo || getTodayDate(),
    }

    console.log("Fetching top selling categories data with request body:", requestBody)

    const response = await axios.post<TopSellingCategoriesResponse>(
      `${API_CONFIG.BASE_URL}/order-service/api/dashboard/get-top-selling-categories`,
      requestBody,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        timeout: 10000,
      }
    )

    console.log("Top selling categories response:", response.data)
    return response.data
  } catch (error: any) {
    let errorMessage = "Failed to fetch top selling categories data"

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

    console.error("Top selling categories fetch error:", error)
    return rejectWithValue(errorMessage)
  }
})

// Create async thunk for fetching low stock alerts data
export const fetchLowStockAlertsData = createAsyncThunk<
  LowStockAlertsResponse,
  void,
  {
    dispatch: AppDispatch
    state: RootState
    rejectValue: string
  }
>("dashboard/fetchLowStockAlertsData", async (_, { rejectWithValue }) => {
  try {
    const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken")
    if (!token) throw new Error("No authentication token found")

    console.log("Fetching low stock alerts data")

    const response = await axios.get<LowStockAlertsResponse>(
      `${API_CONFIG.BASE_URL}/inventory-service/api/v1/inventory/low-stock-alerts`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        timeout: 10000,
      }
    )

    console.log("Low stock alerts response:", response.data)
    return response.data
  } catch (error: any) {
    let errorMessage = "Failed to fetch low stock alerts data"

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

    console.error("Low stock alerts fetch error:", error)
    return rejectWithValue(errorMessage)
  }
})

// Create async thunk for fetching order summary data
export const fetchOrderSummaryData = createAsyncThunk<
  OrderSummaryResponse,
  void,
  {
    dispatch: AppDispatch
    state: RootState
    rejectValue: string
  }
>("dashboard/fetchOrderSummaryData", async (_, { rejectWithValue }) => {
  try {
    const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken")
    if (!token) throw new Error("No authentication token found")

    const requestBody: OrderSummaryRequest = {
      createdDateTo: getTodayDate(),
    }

    console.log("Fetching order summary data with request body:", requestBody)

    const response = await axios.post<OrderSummaryResponse>(
      `${API_CONFIG.BASE_URL}/order-service/api/dashboard/get-order-month-summary`,
      requestBody,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        timeout: 10000,
      }
    )

    console.log("Order summary response:", response.data)
    return response.data
  } catch (error: any) {
    let errorMessage = "Failed to fetch order summary data"

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

    console.error("Order summary fetch error:", error)
    return rejectWithValue(errorMessage)
  }
})

// Create async thunk for fetching sales dashboard data
export const fetchSalesDashboardData = createAsyncThunk<
  SalesDashboardResponse,
  void,
  {
    dispatch: AppDispatch
    state: RootState
    rejectValue: string
  }
>("dashboard/fetchSalesDashboardData", async (_, { rejectWithValue }) => {
  try {
    const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken")
    if (!token) throw new Error("No authentication token found")

    const requestBody: SalesDashboardRequest = {
      pageNo: 0,
      pageSize: 100,
      sortBy: "saleOrderId",
      sortDir: "asc",
    }

    const response = await axios.post<SalesDashboardResponse>(
      `${API_CONFIG.BASE_URL}/order-service/api/dashboard/sales/summary`,
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
    let errorMessage = "Failed to fetch sales data"

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

    console.error("Sales data fetch error:", error)
    return rejectWithValue(errorMessage)
  }
})

// Create async thunk for fetching sales growth data
export const fetchSalesGrowthData = createAsyncThunk<
  SalesGrowthResponse,
  void,
  {
    dispatch: AppDispatch
    state: RootState
    rejectValue: string
  }
>("dashboard/fetchSalesGrowthData", async (_, { rejectWithValue }) => {
  try {
    const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken")
    if (!token) throw new Error("No authentication token found")

    const requestBody: SalesGrowthRequest = {}

    console.log("Fetching sales growth data")

    const response = await axios.post<SalesGrowthResponse>(
      `${API_CONFIG.BASE_URL}/order-service/api/dashboard/get-sale-growth`,
      requestBody,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        timeout: 10000,
      }
    )

    console.log("Sales growth response:", response.data)
    return response.data
  } catch (error: any) {
    let errorMessage = "Failed to fetch sales growth data"

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

    console.error("Sales growth fetch error:", error)
    return rejectWithValue(errorMessage)
  }
})

// Create async thunk for fetching purchase dashboard data
export const fetchPurchaseDashboardData = createAsyncThunk<
  PurchaseDashboardResponse,
  void,
  {
    dispatch: AppDispatch
    state: RootState
    rejectValue: string
  }
>("dashboard/fetchPurchaseDashboardData", async (_, { rejectWithValue }) => {
  try {
    const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken")
    if (!token) throw new Error("No authentication token found")

    const requestBody: PurchaseDashboardRequest = {
      pageNo: 0,
      pageSize: 100,
      sortBy: "purchaseOrder",
      sortDir: "asc",
    }

    console.log("Fetching purchase data with request body:", requestBody)

    const response = await axios.post<PurchaseDashboardResponse>(
      `${API_CONFIG.BASE_URL}/supplier-service/api/v1/supplierDashboard/purchases/summary`,
      requestBody,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        timeout: 10000,
      }
    )

    console.log("Purchase data response:", response.data)
    return response.data
  } catch (error: any) {
    let errorMessage = "Failed to fetch purchase data"

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

    console.error("Purchase data fetch error:", error)
    return rejectWithValue(errorMessage)
  }
})

// Create async thunk for fetching stock summary data
export const fetchStockSummaryData = createAsyncThunk<
  StockSummaryResponse,
  void,
  {
    dispatch: AppDispatch
    state: RootState
    rejectValue: string
  }
>("dashboard/fetchStockSummaryData", async (_, { rejectWithValue }) => {
  try {
    const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken")
    if (!token) throw new Error("No authentication token found")

    const requestBody: StockSummaryRequest = {}

    console.log("Fetching stock summary data")

    const response = await axios.post<StockSummaryResponse>(
      `${API_CONFIG.BASE_URL}/inventory-service/api/v1/stock-summary/total-stock`,
      requestBody,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        timeout: 10000,
      }
    )

    console.log("Stock summary response:", response.data)
    return response.data
  } catch (error: any) {
    let errorMessage = "Failed to fetch stock summary data"

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

    console.error("Stock summary fetch error:", error)
    return rejectWithValue(errorMessage)
  }
})

// Create async thunk for fetching stock levels data
export const fetchStockLevelsData = createAsyncThunk<
  StockLevelsResponse,
  void,
  {
    dispatch: AppDispatch
    state: RootState
    rejectValue: string
  }
>("dashboard/fetchStockLevelsData", async (_, { rejectWithValue }) => {
  try {
    const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken")
    if (!token) throw new Error("No authentication token found")

    const requestBody: StockLevelsRequest = {}

    console.log("Fetching stock levels data")

    const response = await axios.post<StockLevelsResponse>(
      `${API_CONFIG.BASE_URL}/inventory-service/api/v1/stock-summary/stocks-available`,
      requestBody,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        timeout: 10000,
      }
    )

    console.log("Stock levels response:", response.data)
    return response.data
  } catch (error: any) {
    let errorMessage = "Failed to fetch stock levels data"

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

    console.error("Stock levels fetch error:", error)
    return rejectWithValue(errorMessage)
  }
})

// Create the slice
const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {
    // Action to clear error
    clearError: (state) => {
      state.error = null
    },

    // Action to clear all data
    clearData: (state) => {
      state.salesData = null
      state.purchaseData = null
      state.stockData = null
      state.stockLevelsData = null
      state.salesGrowthData = null
      state.orderSummaryData = null
      state.lowStockAlertsData = null
      state.salesPurchaseGraphData = null
      state.topSellingCategoriesData = null
      state.error = null
      state.salesLoading = false
      state.purchaseLoading = false
      state.stockLoading = false
      state.stockLevelsLoading = false
      state.salesGrowthLoading = false
      state.orderSummaryLoading = false
      state.lowStockAlertsLoading = false
      state.salesPurchaseGraphLoading = false
      state.topSellingCategoriesLoading = false
      state.salesPurchaseGraphPeriod = "THIS_MONTH"
      state.salesPurchaseGraphLastFetch = null
    },

    // Action to clear sales data
    clearSalesData: (state) => {
      state.salesData = null
    },

    // Action to clear purchase data
    clearPurchaseData: (state) => {
      state.purchaseData = null
    },

    // Action to clear stock data
    clearStockData: (state) => {
      state.stockData = null
    },

    // Action to clear stock levels data
    clearStockLevelsData: (state) => {
      state.stockLevelsData = null
    },

    // Action to clear sales growth data
    clearSalesGrowthData: (state) => {
      state.salesGrowthData = null
    },

    // Action to clear order summary data
    clearOrderSummaryData: (state) => {
      state.orderSummaryData = null
    },

    // Action to clear low stock alerts data
    clearLowStockAlertsData: (state) => {
      state.lowStockAlertsData = null
    },

    // Action to clear sales purchase graph data
    clearSalesPurchaseGraphData: (state) => {
      state.salesPurchaseGraphData = null
      state.salesPurchaseGraphPeriod = "THIS_MONTH"
      state.salesPurchaseGraphLastFetch = null
    },

    // Action to clear top selling categories data
    clearTopSellingCategoriesData: (state) => {
      state.topSellingCategoriesData = null
    },

    // Action to set sales purchase graph period
    setSalesPurchaseGraphPeriod: (
      state,
      action: PayloadAction<
        | "TODAY"
        | "THIS_WEEK"
        | "THIS_MONTH"
        | "THIS_YEAR"
        | "YEAR"
        | "LAST_MONTH"
        | "LAST_3_MONTHS"
        | "LAST_6_MONTHS"
        | "CUSTOM"
      >
    ) => {
      state.salesPurchaseGraphPeriod = action.payload
    },

    // Action to force refresh sales purchase graph data
    forceRefreshSalesPurchaseGraph: (state) => {
      state.salesPurchaseGraphLastFetch = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Handle pending states
      .addCase(fetchTopSellingCategoriesData.pending, (state) => {
        state.topSellingCategoriesLoading = true
        state.error = null
      })
      .addCase(fetchSalesPurchaseGraphData.pending, (state) => {
        state.salesPurchaseGraphLoading = true
        state.error = null
      })
      .addCase(fetchLowStockAlertsData.pending, (state) => {
        state.lowStockAlertsLoading = true
        state.error = null
      })
      .addCase(fetchOrderSummaryData.pending, (state) => {
        state.orderSummaryLoading = true
        state.error = null
      })
      .addCase(fetchSalesDashboardData.pending, (state) => {
        state.salesLoading = true
        state.error = null
      })
      .addCase(fetchSalesGrowthData.pending, (state) => {
        state.salesGrowthLoading = true
        state.error = null
      })
      .addCase(fetchPurchaseDashboardData.pending, (state) => {
        state.purchaseLoading = true
        state.error = null
      })
      .addCase(fetchStockSummaryData.pending, (state) => {
        state.stockLoading = true
        state.error = null
      })
      .addCase(fetchStockLevelsData.pending, (state) => {
        state.stockLevelsLoading = true
        state.error = null
      })
      // Handle fulfilled states
      .addCase(
        fetchTopSellingCategoriesData.fulfilled,
        (state, action: PayloadAction<TopSellingCategoriesResponse>) => {
          state.topSellingCategoriesLoading = false
          state.topSellingCategoriesData = action.payload
          state.error = null
        }
      )
      .addCase(fetchSalesPurchaseGraphData.fulfilled, (state, action: PayloadAction<SalesPurchaseGraphResponse>) => {
        state.salesPurchaseGraphLoading = false
        state.salesPurchaseGraphData = action.payload
        state.salesPurchaseGraphLastFetch = Date.now()
        state.error = null
      })
      .addCase(fetchLowStockAlertsData.fulfilled, (state, action: PayloadAction<LowStockAlertsResponse>) => {
        state.lowStockAlertsLoading = false
        state.lowStockAlertsData = action.payload
        state.error = null
      })
      .addCase(fetchOrderSummaryData.fulfilled, (state, action: PayloadAction<OrderSummaryResponse>) => {
        state.orderSummaryLoading = false
        state.orderSummaryData = action.payload
        state.error = null
      })
      .addCase(fetchSalesDashboardData.fulfilled, (state, action: PayloadAction<SalesDashboardResponse>) => {
        state.salesLoading = false
        state.salesData = action.payload
        state.error = null
      })
      .addCase(fetchSalesGrowthData.fulfilled, (state, action: PayloadAction<SalesGrowthResponse>) => {
        state.salesGrowthLoading = false
        state.salesGrowthData = action.payload
        state.error = null
      })
      .addCase(fetchPurchaseDashboardData.fulfilled, (state, action: PayloadAction<PurchaseDashboardResponse>) => {
        state.purchaseLoading = false
        state.purchaseData = action.payload
        state.error = null
      })
      .addCase(fetchStockSummaryData.fulfilled, (state, action: PayloadAction<StockSummaryResponse>) => {
        state.stockLoading = false
        state.stockData = action.payload
        state.error = null
      })
      .addCase(fetchStockLevelsData.fulfilled, (state, action: PayloadAction<StockLevelsResponse>) => {
        state.stockLevelsLoading = false
        state.stockLevelsData = action.payload
        state.error = null
      })
      // Handle rejected states
      .addCase(fetchTopSellingCategoriesData.rejected, (state, action) => {
        state.topSellingCategoriesLoading = false
        state.error = action.payload as string
      })
      .addCase(fetchSalesPurchaseGraphData.rejected, (state, action) => {
        state.salesPurchaseGraphLoading = false
        state.error = action.payload as string
      })
      .addCase(fetchLowStockAlertsData.rejected, (state, action) => {
        state.lowStockAlertsLoading = false
        state.error = action.payload as string
      })
      .addCase(fetchOrderSummaryData.rejected, (state, action) => {
        state.orderSummaryLoading = false
        state.error = action.payload as string
      })
      .addCase(fetchSalesDashboardData.rejected, (state, action) => {
        state.salesLoading = false
        state.error = action.payload as string
      })
      .addCase(fetchSalesGrowthData.rejected, (state, action) => {
        state.salesGrowthLoading = false
        state.error = action.payload as string
      })
      .addCase(fetchPurchaseDashboardData.rejected, (state, action) => {
        state.purchaseLoading = false
        state.error = action.payload as string
      })
      .addCase(fetchStockSummaryData.rejected, (state, action) => {
        state.stockLoading = false
        state.error = action.payload as string
      })
      .addCase(fetchStockLevelsData.rejected, (state, action) => {
        state.stockLevelsLoading = false
        state.error = action.payload as string
      })
  },
})

// Export actions
export const {
  clearError,
  clearData,
  clearSalesData,
  clearPurchaseData,
  clearStockData,
  clearStockLevelsData,
  clearSalesGrowthData,
  clearOrderSummaryData,
  clearLowStockAlertsData,
  clearSalesPurchaseGraphData,
  clearTopSellingCategoriesData,
  setSalesPurchaseGraphPeriod,
  forceRefreshSalesPurchaseGraph,
} = dashboardSlice.actions

// Selectors
export const selectDashboardData = (state: RootState) => state.dashboard
export const selectDashboardLoading = (state: RootState) =>
  state.dashboard.salesLoading ||
  state.dashboard.purchaseLoading ||
  state.dashboard.stockLoading ||
  state.dashboard.stockLevelsLoading ||
  state.dashboard.salesGrowthLoading ||
  state.dashboard.orderSummaryLoading ||
  state.dashboard.lowStockAlertsLoading ||
  state.dashboard.salesPurchaseGraphLoading ||
  state.dashboard.topSellingCategoriesLoading
export const selectDashboardError = (state: RootState) => state.dashboard.error
export const selectSalesLoading = (state: RootState) => state.dashboard.salesLoading
export const selectPurchaseLoading = (state: RootState) => state.dashboard.purchaseLoading
export const selectStockLoading = (state: RootState) => state.dashboard.stockLoading
export const selectStockLevelsLoading = (state: RootState) => state.dashboard.stockLevelsLoading
export const selectSalesGrowthLoading = (state: RootState) => state.dashboard.salesGrowthLoading
export const selectOrderSummaryLoading = (state: RootState) => state.dashboard.orderSummaryLoading
export const selectLowStockAlertsLoading = (state: RootState) => state.dashboard.lowStockAlertsLoading
export const selectSalesPurchaseGraphLoading = (state: RootState) => state.dashboard.salesPurchaseGraphLoading
export const selectTopSellingCategoriesLoading = (state: RootState) => state.dashboard.topSellingCategoriesLoading

// Sales Purchase Graph selectors
export const selectSalesPurchaseGraphData = (state: RootState) => state.dashboard.salesPurchaseGraphData
export const selectSalesPurchaseGraphPoints = (state: RootState) => {
  return state.dashboard.salesPurchaseGraphData?.data || []
}
export const selectSalesPurchaseGraphPeriod = (state: RootState) => state.dashboard.salesPurchaseGraphPeriod
export const selectSalesPurchaseGraphLastFetch = (state: RootState) => state.dashboard.salesPurchaseGraphLastFetch
export const selectTotalSales = (state: RootState) => {
  const summaryTotal = state.dashboard.salesPurchaseGraphData?.summary?.totalSales
  if (typeof summaryTotal === "number") return summaryTotal
  const points = state.dashboard.salesPurchaseGraphData?.data || []
  if (points.length === 0) return 0
  const last = points[points.length - 1]
  return last?.cumulativeSale ?? 0
}
export const selectTotalPurchases = (state: RootState) => {
  const summaryTotal = state.dashboard.salesPurchaseGraphData?.summary?.totalPurchases
  if (typeof summaryTotal === "number") return summaryTotal
  const points = state.dashboard.salesPurchaseGraphData?.data || []
  if (points.length === 0) return 0
  const last = points[points.length - 1]
  return last?.cumulativePurchase ?? 0
}
export const selectTotalProfit = (state: RootState) => {
  const summaryProfit = state.dashboard.salesPurchaseGraphData?.summary?.totalProfit
  if (typeof summaryProfit === "number") return summaryProfit
  const sales = selectTotalSales(state)
  const purchases = selectTotalPurchases(state)
  return sales - purchases
}
export const selectSalesGrowth = (state: RootState) => {
  return state.dashboard.salesPurchaseGraphData?.summary?.salesGrowth || 0
}
export const selectPurchasesGrowth = (state: RootState) => {
  return state.dashboard.salesPurchaseGraphData?.summary?.purchasesGrowth || 0
}
export const selectProfitGrowth = (state: RootState) => {
  return state.dashboard.salesPurchaseGraphData?.summary?.profitGrowth || 0
}
export const selectSalesPurchaseGraphSummary = (state: RootState) => {
  const data = state.dashboard.salesPurchaseGraphData
  if (!data) return null

  return {
    dataPoints: data.data || [],
    totalSales: data.summary?.totalSales || 0,
    totalPurchases: data.summary?.totalPurchases || 0,
    totalProfit: data.summary?.totalProfit || 0,
    salesGrowth: data.summary?.salesGrowth || 0,
    purchasesGrowth: data.summary?.purchasesGrowth || 0,
    profitGrowth: data.summary?.profitGrowth || 0,
    success: data.success,
    message: data.message,
  }
}

// Top Selling Categories selectors
export const selectTopSellingCategoriesData = (state: RootState) => state.dashboard.topSellingCategoriesData
export const selectTopSellingCategories = (state: RootState) => {
  return state.dashboard.topSellingCategoriesData?.topSellingCategoryDto || []
}
export const selectTopSellingCategoriesSummary = (state: RootState) => {
  const data = state.dashboard.topSellingCategoriesData
  if (!data) return null

  const categories = data.topSellingCategoryDto || []

  return {
    categories,
    totalCategories: categories.length,
    success: data.success,
    message: data.message,
  }
}
export const selectTopCategory = (state: RootState) => {
  const categories = state.dashboard.topSellingCategoriesData?.topSellingCategoryDto || []
  if (categories.length === 0) return null

  return categories.reduce((prev, current) => (prev.percentage > current.percentage ? prev : current))
}
export const selectCategoryByName = (state: RootState, categoryName: string) => {
  const categories = state.dashboard.topSellingCategoriesData?.topSellingCategoryDto || []
  return categories.find((category) => category.categoryName === categoryName) || null
}
export const selectTotalProductsSold = (state: RootState) => {
  const categories = state.dashboard.topSellingCategoriesData?.topSellingCategoryDto || []
  return categories.reduce((total, category) => total + category.totalQuantity, 0)
}

// Low Stock Alerts selectors
export const selectLowStockAlertsData = (state: RootState) => state.dashboard.lowStockAlertsData
export const selectLowStockSuppliers = (state: RootState) => {
  return state.dashboard.lowStockAlertsData?.lowStocks || []
}
export const selectAllLowStockProducts = (state: RootState) => {
  const suppliers = state.dashboard.lowStockAlertsData?.lowStocks || []
  return suppliers.flatMap((supplier) => supplier.products || [])
}
export const selectLowStockProductsCount = (state: RootState) => {
  const suppliers = state.dashboard.lowStockAlertsData?.lowStocks || []
  return suppliers.reduce((total, supplier) => total + (supplier.products?.length || 0), 0)
}
export const selectLowStockAlertsSummary = (state: RootState) => {
  const data = state.dashboard.lowStockAlertsData
  if (!data) return null

  const allProducts = data.lowStocks.flatMap((supplier) => supplier.products || [])

  return {
    totalSuppliers: data.lowStocks.length,
    totalProducts: allProducts.length,
    suppliers: data.lowStocks,
    allProducts,
  }
}

// Order Summary selectors
export const selectOrderSummaryData = (state: RootState) => state.dashboard.orderSummaryData
export const selectTotalOrders = (state: RootState) => {
  return state.dashboard.orderSummaryData?.orderSummaryDto?.totalOrders || 0
}
export const selectCompletedOrders = (state: RootState) => {
  return state.dashboard.orderSummaryData?.orderSummaryDto?.completedOrders || 0
}
export const selectPendingOrders = (state: RootState) => {
  return state.dashboard.orderSummaryData?.orderSummaryDto?.pendingOrders || 0
}
export const selectCancelledOrders = (state: RootState) => {
  return state.dashboard.orderSummaryData?.orderSummaryDto?.cancelledOrders || 0
}
export const selectOrderGrowthPercentage = (state: RootState) => {
  return state.dashboard.orderSummaryData?.orderSummaryDto?.growthPercentage || 0
}
export const selectOrderSummaryOrders = (state: RootState) => {
  return state.dashboard.orderSummaryData?.orderSummaryDto?.orders || []
}
export const selectOrderSummary = (state: RootState) => {
  const data = state.dashboard.orderSummaryData
  if (!data) return null

  return {
    totalOrders: data.orderSummaryDto?.totalOrders || 0,
    completedOrders: data.orderSummaryDto?.completedOrders || 0,
    pendingOrders: data.orderSummaryDto?.pendingOrders || 0,
    cancelledOrders: data.orderSummaryDto?.cancelledOrders || 0,
    growthPercentage: data.orderSummaryDto?.growthPercentage || 0,
    orders: data.orderSummaryDto?.orders || [],
    success: data.success,
    message: data.message,
  }
}

// Sales selectors
export const selectSalesData = (state: RootState) => state.dashboard.salesData
export const selectTotalSalesAmount = (state: RootState) => {
  return state.dashboard.salesData?.totalSaleAmount || 0
}
export const selectGrowthPercentage = (state: RootState) => {
  return state.dashboard.salesData?.growth || 0
}
export const selectSalesSummary = (state: RootState) => {
  const data = state.dashboard.salesData
  if (!data) return null

  return {
    totalSales: data.totalSaleAmount,
    growth: data.growth,
    totalOrders: data.totalElements,
    success: data.success,
    message: data.message,
  }
}

// Sales Growth selectors
export const selectSalesGrowthData = (state: RootState) => state.dashboard.salesGrowthData
export const selectSalesGrowthAmount = (state: RootState) => {
  return state.dashboard.salesGrowthData?.saleGrowthDto?.growthAmount || 0
}
export const selectSalesGrowthPercentage = (state: RootState) => {
  return state.dashboard.salesGrowthData?.saleGrowthDto?.growthPercentage || 0
}
export const selectContributingSaleOrders = (state: RootState) => {
  return state.dashboard.salesGrowthData?.saleGrowthDto?.contributingSaleOrders || []
}
export const selectSalesGrowthSummary = (state: RootState) => {
  const data = state.dashboard.salesGrowthData
  if (!data) return null

  return {
    growthAmount: data.saleGrowthDto?.growthAmount || 0,
    growthPercentage: data.saleGrowthDto?.growthPercentage || 0,
    contributingOrders: data.saleGrowthDto?.contributingSaleOrders || [],
    success: data.success,
    message: data.message,
  }
}

// Purchase selectors
export const selectPurchaseData = (state: RootState) => state.dashboard.purchaseData
export const selectTotalPurchasesAmount = (state: RootState) => {
  return state.dashboard.purchaseData?.totalPurchases || 0
}
export const selectPercentageChange = (state: RootState) => {
  return state.dashboard.purchaseData?.percentageChange || "+0"
}
export const selectPurchaseOrders = (state: RootState) => {
  return state.dashboard.purchaseData?.purchaseOrders || []
}
export const selectPurchaseSummary = (state: RootState) => {
  const data = state.dashboard.purchaseData
  if (!data) return null

  return {
    totalPurchases: data.totalPurchases,
    percentageChange: data.percentageChange,
    totalOrders: data.totalElements,
    pageInfo: {
      pageNo: data.pageNo,
      pageSize: data.pageSize,
      totalPages: data.totalPages,
      last: data.last,
    },
  }
}
export const selectPaginationInfo = (state: RootState) => {
  const data = state.dashboard.purchaseData
  if (!data) return null

  return {
    pageNo: data.pageNo,
    pageSize: data.pageSize,
    totalElements: data.totalElements,
    totalPages: data.totalPages,
    last: data.last,
  }
}

// Stock selectors
export const selectStockData = (state: RootState) => state.dashboard.stockData
export const selectTotalStock = (state: RootState) => {
  return state.dashboard.stockData?.totalStock || 0
}
export const selectTotalStockAmount = (state: RootState) => {
  return state.dashboard.stockData?.totalStockAmount || 0
}
export const selectStockPercentageChange = (state: RootState) => {
  return state.dashboard.stockData?.percentChange || "+0%"
}
export const selectStockProducts = (state: RootState) => {
  return state.dashboard.stockData?.productDto || []
}
export const selectStockSummary = (state: RootState) => {
  const data = state.dashboard.stockData
  if (!data) return null

  return {
    totalStock: data.totalStock,
    totalStockAmount: data.totalStockAmount,
    percentChange: data.percentChange,
    products: data.productDto,
  }
}

// Stock Levels selectors
export const selectStockLevelsData = (state: RootState) => state.dashboard.stockLevelsData
export const selectInStockCount = (state: RootState) => {
  return state.dashboard.stockLevelsData?.inStock || 0
}
export const selectLowStockCount = (state: RootState) => {
  return state.dashboard.stockLevelsData?.lowStock || 0
}
export const selectExpiredCount = (state: RootState) => {
  return state.dashboard.stockLevelsData?.expired || 0
}
export const selectOutOfStockCount = (state: RootState) => {
  return state.dashboard.stockLevelsData?.outOfStock || 0
}
export const selectInStockPercentage = (state: RootState) => {
  return state.dashboard.stockLevelsData?.inStockPercentage || 0
}
export const selectLowStockPercentage = (state: RootState) => {
  return state.dashboard.stockLevelsData?.lowStockPercentage || 0
}
export const selectExpiredPercentage = (state: RootState) => {
  return state.dashboard.stockLevelsData?.expiredPercentage || 0
}
export const selectOutOfStockPercentage = (state: RootState) => {
  return state.dashboard.stockLevelsData?.outOfStockPercentage || 0
}
export const selectInStockItems = (state: RootState) => {
  return state.dashboard.stockLevelsData?.inStockItems || []
}
export const selectLowStockItems = (state: RootState) => {
  return state.dashboard.stockLevelsData?.lowStockItems || []
}
export const selectExpiredItems = (state: RootState) => {
  return state.dashboard.stockLevelsData?.expiredItems || []
}
export const selectOutOfStockItems = (state: RootState) => {
  return state.dashboard.stockLevelsData?.outOfStockItems || []
}
export const selectStockLevelsSummary = (state: RootState) => {
  const data = state.dashboard.stockLevelsData
  if (!data) return null

  return {
    inStock: data.inStock,
    lowStock: data.lowStock,
    expired: data.expired,
    outOfStock: data.outOfStock,
    inStockPercentage: data.inStockPercentage,
    lowStockPercentage: data.lowStockPercentage,
    expiredPercentage: data.expiredPercentage,
    outOfStockPercentage: data.outOfStockPercentage,
    inStockItems: data.inStockItems,
    lowStockItems: data.lowStockItems,
    expiredItems: data.expiredItems,
    outOfStockItems: data.outOfStockItems,
  }
}

// Thunk action to refresh all data
export const refreshDashboardData = () => async (dispatch: AppDispatch) => {
  dispatch(clearError())
  await Promise.all([
    dispatch(fetchSalesPurchaseGraphData({ period: "THIS_MONTH", forceRefresh: true })),
    dispatch(fetchLowStockAlertsData()),
    dispatch(fetchOrderSummaryData()),
    dispatch(fetchSalesDashboardData()),
    dispatch(fetchSalesGrowthData()),
    dispatch(fetchPurchaseDashboardData()),
    dispatch(fetchStockSummaryData()),
    dispatch(fetchStockLevelsData()),
    dispatch(fetchTopSellingCategoriesData({})),
  ])
}

// Thunk action to refresh sales purchase graph data
export const refreshSalesPurchaseGraphData =
  (
    period:
      | "TODAY"
      | "THIS_WEEK"
      | "THIS_MONTH"
      | "THIS_YEAR"
      | "YEAR"
      | "LAST_MONTH"
      | "LAST_3_MONTHS"
      | "LAST_6_MONTHS"
      | "CUSTOM" = "THIS_MONTH",
    startDate?: string,
    endDate?: string,
    forceRefresh: boolean = true
  ) =>
  async (dispatch: AppDispatch) => {
    dispatch(clearError())
    dispatch(setSalesPurchaseGraphPeriod(period))
    return dispatch(fetchSalesPurchaseGraphData({ period, startDate, endDate, forceRefresh }))
  }

// Thunk action to refresh top selling categories data
export const refreshTopSellingCategoriesData =
  (createdDateFrom?: string, createdDateTo?: string) => async (dispatch: AppDispatch) => {
    dispatch(clearError())
    return dispatch(fetchTopSellingCategoriesData({ createdDateFrom, createdDateTo }))
  }

// Thunk action to refresh low stock alerts data only
export const refreshLowStockAlertsData = () => async (dispatch: AppDispatch) => {
  dispatch(clearError())
  return dispatch(fetchLowStockAlertsData())
}

// Thunk action to refresh order summary data only
export const refreshOrderSummaryData = () => async (dispatch: AppDispatch) => {
  dispatch(clearError())
  return dispatch(fetchOrderSummaryData())
}

// Thunk action to refresh sales data only
export const refreshSalesData = () => async (dispatch: AppDispatch) => {
  dispatch(clearError())
  return dispatch(fetchSalesDashboardData())
}

// Thunk action to refresh sales growth data only
export const refreshSalesGrowthData = () => async (dispatch: AppDispatch) => {
  dispatch(clearError())
  return dispatch(fetchSalesGrowthData())
}

// Thunk action to refresh purchase data only
export const refreshPurchaseData = () => async (dispatch: AppDispatch) => {
  dispatch(clearError())
  return dispatch(fetchPurchaseDashboardData())
}

// Thunk action to refresh stock data only
export const refreshStockData = () => async (dispatch: AppDispatch) => {
  dispatch(clearError())
  return dispatch(fetchStockSummaryData())
}

// Thunk action to refresh stock levels data only
export const refreshStockLevelsData = () => async (dispatch: AppDispatch) => {
  dispatch(clearError())
  return dispatch(fetchStockLevelsData())
}

export default dashboardSlice.reducer
