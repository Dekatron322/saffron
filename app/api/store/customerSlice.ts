// src/store/customerSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { AppDispatch, RootState } from "./store"
import axios from "axios"

export interface Customer {
  customerProfileId: number
  customerName: string
  customerEmail: string
  customerPhone: string
  customerAddress: string
  customerLoyaltyPoints: number
  customerPassword: string
  gstin: string | null
  subscriptionValidation: any | null
  subscriptionOpt: any | null
  subscriptionDuration: any | null
  status?: string
  subscriptionAmt?: number | null
  gstAmt?: number | null
  totalAmt?: number | null
}

interface CustomerPaginationResponse {
  customers: Customer[]
  pageNo: number
  pageSize: number
  totalElements: number
  totalPages: number
  last: boolean
}

interface CustomerResponse {
  success: boolean
  message: string
  customerPaginationResponse: CustomerPaginationResponse
}

interface SingleCustomerResponse {
  success: boolean
  message: string
  customer: Customer
}

interface CustomerMetricData {
  totalNumber: number
  growth: number
  customerDto: Customer[]
  pageNo: number
  pageSize: number
  totalElements: number
  totalPages: number
  last: boolean
}

interface CustomerDashboardSummary {
  success: boolean
  message: string
  totalRegisterCustomer: CustomerMetricData | null
  newCustomers: CustomerMetricData | null
  activeCustomers: CustomerMetricData | null
  subscribedCustomers: CustomerMetricData | null
}

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
  discount: number
  tax: number
  unitName: string
  unitSold: number
  createdDate: string
}

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
  subscriptionTypeDto: any | null
  paymentInfo: any | null
  upgradeSubscription: any | null
}

interface SalesByCustomerResponse {
  errorCode: string
  success: boolean
  message: string
  saleOrderDtoList: SaleOrder[] // Changed from 'sales' to 'saleOrderDtoList'
  pageNo: number
  pageSize: number
  totalElements: number
  totalPages: number
  last: boolean
}

interface CustomerState {
  customers: Customer[]
  currentCustomer: Customer | null
  loading: boolean
  error: string | null
  pagination: {
    currentPage: number
    pageSize: number
    totalElements: number
    totalPages: number
    lastPage: boolean
  }
  createCustomerLoading: boolean
  createCustomerError: string | null
  updateCustomerLoading: boolean
  updateCustomerError: string | null
  deleteCustomerLoading: boolean
  deleteCustomerError: string | null
  dashboardSummary: {
    loading: boolean
    error: string | null
    data: {
      totalRegistered: {
        count: number
        growth: number
      }
      newCustomers: {
        count: number
        growth: number
      }
      activeCustomers: {
        count: number
        growth: number
        customers: Customer[]
      }
      subscribedCustomers: {
        count: number
        growth: number
      }
    }
  }
  customerSales: {
    data: SaleOrder[]
    loading: boolean
    error: string | null
    pagination: {
      currentPage: number
      pageSize: number
      totalElements: number
      totalPages: number
      lastPage: boolean
    }
  }
}

const initialState: CustomerState = {
  customers: [],
  currentCustomer: null,
  loading: false,
  error: null,
  pagination: {
    currentPage: 0,
    pageSize: 5,
    totalElements: 0,
    totalPages: 1,
    lastPage: false,
  },
  createCustomerLoading: false,
  createCustomerError: null,
  updateCustomerLoading: false,
  updateCustomerError: null,
  deleteCustomerLoading: false,
  deleteCustomerError: null,
  dashboardSummary: {
    loading: false,
    error: null,
    data: {
      totalRegistered: {
        count: 0,
        growth: 0,
      },
      newCustomers: {
        count: 0,
        growth: 0,
      },
      activeCustomers: {
        count: 0,
        growth: 0,
        customers: [],
      },
      subscribedCustomers: {
        count: 0,
        growth: 0,
      },
    },
  },
  customerSales: {
    data: [],
    loading: false,
    error: null,
    pagination: {
      currentPage: 0,
      pageSize: 5,
      totalElements: 0,
      totalPages: 1,
      lastPage: false,
    },
  },
}

const customerSlice = createSlice({
  name: "customer",
  initialState,
  reducers: {
    fetchCustomersStart(state) {
      state.loading = true
      state.error = null
    },
    fetchCustomersSuccess(state, action: PayloadAction<CustomerPaginationResponse>) {
      state.customers = action.payload.customers
      state.pagination = {
        currentPage: action.payload.pageNo,
        pageSize: action.payload.pageSize,
        totalElements: action.payload.totalElements,
        totalPages: action.payload.totalPages,
        lastPage: action.payload.last,
      }
      state.loading = false
      state.error = null
    },
    fetchCustomersFailure(state, action: PayloadAction<string>) {
      state.loading = false
      state.error = action.payload
    },
    fetchCustomerByIdStart(state) {
      state.loading = true
      state.error = null
    },
    fetchCustomerByIdSuccess(state, action: PayloadAction<Customer>) {
      state.currentCustomer = action.payload
      state.loading = false
      state.error = null
    },
    fetchCustomerByIdFailure(state, action: PayloadAction<string>) {
      state.loading = false
      state.error = action.payload
    },
    createCustomerStart(state) {
      state.createCustomerLoading = true
      state.createCustomerError = null
    },
    createCustomerSuccess(state, action: PayloadAction<Customer>) {
      state.createCustomerLoading = false
      state.createCustomerError = null
      state.customers = [action.payload, ...state.customers]
    },
    createCustomerFailure(state, action: PayloadAction<string>) {
      state.createCustomerLoading = false
      state.createCustomerError = action.payload
    },
    updateCustomerStart(state) {
      state.updateCustomerLoading = true
      state.updateCustomerError = null
    },
    updateCustomerSuccess(state, action: PayloadAction<Customer>) {
      state.updateCustomerLoading = false
      state.updateCustomerError = null
      state.customers = state.customers.map((customer) =>
        customer.customerProfileId === action.payload.customerProfileId ? action.payload : customer
      )
      if (state.currentCustomer?.customerProfileId === action.payload.customerProfileId) {
        state.currentCustomer = action.payload
      }
    },
    updateCustomerFailure(state, action: PayloadAction<string>) {
      state.updateCustomerLoading = false
      state.updateCustomerError = action.payload
    },
    deleteCustomerStart(state) {
      state.deleteCustomerLoading = true
      state.deleteCustomerError = null
    },
    deleteCustomerSuccess(state, action: PayloadAction<number>) {
      state.deleteCustomerLoading = false
      state.deleteCustomerError = null
      state.customers = state.customers.filter((customer) => customer.customerProfileId !== action.payload)
      if (state.currentCustomer?.customerProfileId === action.payload) {
        state.currentCustomer = null
      }
    },
    deleteCustomerFailure(state, action: PayloadAction<string>) {
      state.deleteCustomerLoading = false
      state.deleteCustomerError = action.payload
    },
    clearCustomers(state) {
      state.customers = []
      state.currentCustomer = null
      state.pagination = {
        currentPage: 0,
        pageSize: 5,
        totalElements: 0,
        totalPages: 1,
        lastPage: false,
      }
    },
    fetchDashboardSummaryStart(state) {
      state.dashboardSummary.loading = true
      state.dashboardSummary.error = null
    },
    fetchDashboardSummarySuccess(state, action: PayloadAction<CustomerDashboardSummary>) {
      state.dashboardSummary.loading = false
      state.dashboardSummary.error = null

      const { totalRegisterCustomer, newCustomers, activeCustomers, subscribedCustomers } = action.payload

      state.dashboardSummary.data = {
        totalRegistered: {
          count: totalRegisterCustomer?.totalNumber || 0,
          growth: totalRegisterCustomer?.growth || 0,
        },
        newCustomers: {
          count: newCustomers?.totalNumber || 0,
          growth: newCustomers?.growth || 0,
        },
        activeCustomers: {
          count: activeCustomers?.totalNumber || 0,
          growth: activeCustomers?.growth || 0,
          customers: activeCustomers?.customerDto || [],
        },
        subscribedCustomers: {
          count: subscribedCustomers?.totalNumber || 0,
          growth: subscribedCustomers?.growth || 0,
        },
      }
    },
    fetchDashboardSummaryFailure(state, action: PayloadAction<string>) {
      state.dashboardSummary.loading = false
      state.dashboardSummary.error = action.payload
    },
    fetchCustomerSalesStart(state) {
      state.customerSales.loading = true
      state.customerSales.error = null
    },
    fetchCustomerSalesSuccess(
      state,
      action: PayloadAction<{
        sales: SaleOrder[]
        pageNo: number
        pageSize: number
        totalElements: number
        totalPages: number
        last: boolean
      }>
    ) {
      state.customerSales.data = action.payload.sales
      state.customerSales.pagination = {
        currentPage: action.payload.pageNo,
        pageSize: action.payload.pageSize,
        totalElements: action.payload.totalElements,
        totalPages: action.payload.totalPages,
        lastPage: action.payload.last,
      }
      state.customerSales.loading = false
      state.customerSales.error = null
    },
    fetchCustomerSalesFailure(state, action: PayloadAction<string>) {
      state.customerSales.loading = false
      state.customerSales.error = action.payload
    },
    clearCustomerSales(state) {
      state.customerSales = {
        data: [],
        loading: false,
        error: null,
        pagination: {
          currentPage: 0,
          pageSize: 5,
          totalElements: 0,
          totalPages: 1,
          lastPage: false,
        },
      }
    },
  },
})

export const {
  fetchCustomersStart,
  fetchCustomersSuccess,
  fetchCustomersFailure,
  fetchCustomerByIdStart,
  fetchCustomerByIdSuccess,
  fetchCustomerByIdFailure,
  createCustomerStart,
  createCustomerSuccess,
  createCustomerFailure,
  updateCustomerStart,
  updateCustomerSuccess,
  updateCustomerFailure,
  deleteCustomerStart,
  deleteCustomerSuccess,
  deleteCustomerFailure,
  clearCustomers,
  fetchDashboardSummaryStart,
  fetchDashboardSummarySuccess,
  fetchDashboardSummaryFailure,
  fetchCustomerSalesStart,
  fetchCustomerSalesSuccess,
  fetchCustomerSalesFailure,
  clearCustomerSales,
} = customerSlice.actions

export const fetchAllCustomers =
  (page = 0, size = 5, signal?: AbortSignal) =>
  async (dispatch: AppDispatch) => {
    try {
      dispatch(fetchCustomersStart())

      const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken")
      if (!token) {
        throw new Error("No authentication token found")
      }

      const pageSize = Math.max(1, size)

      const requestBody = {
        pageNo: page,
        pageSize: pageSize,
        sortBy: "customerProfileId",
        sortDir: "asc",
      }

      const response = await axios.post("http://saffronwellcare.com/customer-service/api/v1/customers", requestBody, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        signal,
      })

      if (response.data.success === false) {
        throw new Error(response.data.message || "Failed to fetch customers")
      }

      if (
        !response.data.customerPaginationResponse ||
        !Array.isArray(response.data.customerPaginationResponse.customers)
      ) {
        throw new Error("Invalid response format from server")
      }

      dispatch(fetchCustomersSuccess(response.data.customerPaginationResponse))
    } catch (error: any) {
      let errorMessage = "Failed to fetch customers"

      if (error.response?.data) {
        const apiError = error.response.data
        errorMessage = apiError.message || apiError.errorMessage || "API request failed"

        if (apiError.errorCode === "402") {
          errorMessage = "Invalid pagination parameters. Please try again."
        }
      } else if (error.message) {
        errorMessage = error.message
      }

      dispatch(fetchCustomersFailure(errorMessage))
    }
  }

export const fetchCustomerById = (customerProfileId: number) => async (dispatch: AppDispatch) => {
  try {
    dispatch(fetchCustomerByIdStart())

    const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken")
    if (!token) {
      throw new Error("No authentication token found")
    }

    const response = await axios.get<SingleCustomerResponse>(
      `http://saffronwellcare.com/customer-service/api/v1/customers/${customerProfileId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    )

    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to fetch customer")
    }

    if (!response.data.customer) {
      throw new Error("Customer data not found in response")
    }

    dispatch(fetchCustomerByIdSuccess(response.data.customer))
    return response.data.customer
  } catch (error: any) {
    let errorMessage = "Failed to fetch customer"

    if (error.response?.status === 404) {
      errorMessage = "Customer not found"
    } else if (error.response?.data) {
      const apiError = error.response.data
      errorMessage = apiError.message || apiError.errorMessage || "API request failed"
    } else if (error.message) {
      errorMessage = error.message
    }

    dispatch(fetchCustomerByIdFailure(errorMessage))
    throw error
  }
}

export const createCustomer =
  (customerData: {
    customerName: string
    customerEmail: string
    customerPhone: string
    customerAddress: string
    customerPassword: string
  }) =>
  async (dispatch: AppDispatch) => {
    try {
      dispatch(createCustomerStart())

      const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken")
      if (!token) {
        throw new Error("No authentication token found")
      }

      const response = await axios.post(
        "http://saffronwellcare.com/customer-service/api/v1/customers/create-customer",
        customerData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      )

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to create customer")
      }

      dispatch(createCustomerSuccess(response.data.customer))
      return response.data
    } catch (error: any) {
      let errorMessage = "Failed to create customer"

      if (error.response?.data) {
        const apiError = error.response.data
        errorMessage = apiError.message || apiError.errorMessage || "API request failed"
      } else if (error.message) {
        errorMessage = error.message
      }

      dispatch(createCustomerFailure(errorMessage))
      throw error
    }
  }

export const updateCustomer =
  (
    customerProfileId: number,
    customerData: {
      customerName: string
      customerEmail: string
      customerPhone: string
      customerAddress: string
      customerPassword: string
    }
  ) =>
  async (dispatch: AppDispatch) => {
    try {
      dispatch(updateCustomerStart())

      const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken")
      if (!token) {
        throw new Error("No authentication token found")
      }

      const response = await axios.put<{
        success: boolean
        message: string
        customer: Customer
      }>(`http://saffronwellcare.com/customer-service/api/v1/customers/update/${customerProfileId}`, customerData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to update customer")
      }

      dispatch(updateCustomerSuccess(response.data.customer))
      return response.data
    } catch (error: any) {
      let errorMessage = "Failed to update customer"

      if (error.response?.data) {
        const apiError = error.response.data
        if (apiError.message?.includes("Duplicate entry") && apiError.message?.includes("for key 'customers.UK")) {
          errorMessage = "Email already exists"
        } else {
          errorMessage = apiError.message || apiError.errorMessage || "API request failed"
        }
      } else if (error.message) {
        if (error.message.includes("Duplicate entry") && error.message.includes("for key 'customers.UK")) {
          errorMessage = "Email already exists"
        } else {
          errorMessage = error.message
        }
      }

      dispatch(updateCustomerFailure(errorMessage))
      throw errorMessage
    }
  }

export const updateCustomerWithoutToken =
  (
    customerProfileId: number,
    customerData: {
      customerName: string
      customerEmail: string
      customerPhone: string
      customerAddress: string
      customerPassword: string
    }
  ) =>
  async (dispatch: AppDispatch) => {
    try {
      dispatch(updateCustomerStart())

      const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken")
      if (!token) {
        throw new Error("No authentication token found")
      }

      const response = await axios.put<{
        success: boolean
        message: string
        customer: Customer
      }>(
        `http://saffronwellcare.com/customer-service/api/v1/customers/update-without-token/${customerProfileId}`,
        customerData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      )

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to update customer")
      }

      dispatch(updateCustomerSuccess(response.data.customer))
      return response.data
    } catch (error: any) {
      let errorMessage = "Failed to update customer"

      if (error.response?.data) {
        const apiError = error.response.data
        if (apiError.message?.includes("Duplicate entry") && apiError.message?.includes("for key 'customers.UK")) {
          errorMessage = "Email already exists"
        } else {
          errorMessage = apiError.message || apiError.errorMessage || "API request failed"
        }
      } else if (error.message) {
        if (error.message.includes("Duplicate entry") && error.message.includes("for key 'customers.UK")) {
          errorMessage = "Email already exists"
        } else {
          errorMessage = error.message
        }
      }

      dispatch(updateCustomerFailure(errorMessage))
      throw errorMessage
    }
  }

export const deleteCustomer = (customerProfileId: number) => async (dispatch: AppDispatch) => {
  try {
    dispatch(deleteCustomerStart())

    const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken")
    if (!token) {
      throw new Error("No authentication token found")
    }

    const response = await axios.delete(
      `http://saffronwellcare.com/customer-service/api/v1/customers/${customerProfileId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )

    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to delete customer")
    }

    dispatch(deleteCustomerSuccess(customerProfileId))
    return response.data
  } catch (error: any) {
    let errorMessage = "Failed to delete customer"

    if (error.response?.data) {
      const apiError = error.response.data
      errorMessage = apiError.message || apiError.errorMessage || "API request failed"
    } else if (error.message) {
      errorMessage = error.message
    }

    dispatch(deleteCustomerFailure(errorMessage))
    throw error
  }
}

export const fetchCustomerDashboardSummary = () => async (dispatch: AppDispatch) => {
  try {
    dispatch(fetchDashboardSummaryStart())

    const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken")
    if (!token) {
      throw new Error("No authentication token found")
    }

    const metricTypes = ["TOTAL_REGISTERED_CUSTOMERS", "NEW_CUSTOMERS", "ACTIVE_CUSTOMERS", "SUBSCRIBED_CUSTOMERS"]

    const requests = metricTypes.map((metricType) =>
      axios.post<CustomerDashboardSummary>(
        "http://saffronwellcare.com/customer-service/api/v1/customers-dashboard-summary/get-customer-dashboard",
        {
          pageNo: 0,
          pageSize: 2,
          sortBy: "customerProfileId",
          sortDir: "asc",
          customerMetricType: metricType,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      )
    )

    const responses = await Promise.all(requests)

    const combinedSummary: CustomerDashboardSummary = {
      success: true,
      message: "All metrics retrieved successfully",
      totalRegisterCustomer: responses[0]?.data?.totalRegisterCustomer ?? null,
      newCustomers: responses[1]?.data?.newCustomers ?? null,
      activeCustomers: responses[2]?.data?.activeCustomers ?? null,
      subscribedCustomers: responses[3]?.data?.subscribedCustomers ?? null,
    }

    dispatch(fetchDashboardSummarySuccess(combinedSummary))
    return combinedSummary
  } catch (error: any) {
    let errorMessage = "Failed to fetch customer dashboard summary"

    if (error.response?.data) {
      const apiError = error.response.data
      errorMessage = apiError.message || apiError.errorMessage || "API request failed"
    } else if (error.message) {
      errorMessage = error.message
    }

    dispatch(fetchDashboardSummaryFailure(errorMessage))
    throw error
  }
}

export const fetchCustomersByMetric = (metricType: string) => async (dispatch: AppDispatch) => {
  try {
    dispatch(fetchCustomersStart())

    const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken")
    if (!token) {
      throw new Error("No authentication token found")
    }

    const response = await axios.post<CustomerDashboardSummary>(
      "http://saffronwellcare.com/customer-service/api/v1/customers-dashboard-summary/get-customer-dashboard",
      {
        pageNo: 0,
        pageSize: 100,
        sortBy: "customerProfileId",
        sortDir: "asc",
        customerMetricType: metricType,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    )

    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to fetch customers")
    }

    let customers: Customer[] = []
    switch (metricType) {
      case "TOTAL_REGISTERED_CUSTOMERS":
        customers = response.data.totalRegisterCustomer?.customerDto || []
        break
      case "NEW_CUSTOMERS":
        customers = response.data.newCustomers?.customerDto || []
        break
      case "ACTIVE_CUSTOMERS":
        customers = response.data.activeCustomers?.customerDto || []
        break
      case "SUBSCRIBED_CUSTOMERS":
        customers = response.data.subscribedCustomers?.customerDto || []
        break
    }

    dispatch(
      fetchCustomersSuccess({
        customers,
        pageNo: 0,
        pageSize: customers.length,
        totalElements: customers.length,
        totalPages: 1,
        last: true,
      })
    )
  } catch (error: any) {
    let errorMessage = "Failed to fetch customers by metric"
    if (error.response?.data) {
      errorMessage = error.response.data.message || error.response.data.errorMessage || "API request failed"
    } else if (error.message) {
      errorMessage = error.message
    }
    dispatch(fetchCustomersFailure(errorMessage))
  }
}

// Update the fetchSalesByCustomerDetails thunk to handle both response formats
export const fetchSalesByCustomerDetails =
  (customerId: number, customerName: string, customerEmail: string, page = 0, size = 5) =>
  async (dispatch: AppDispatch) => {
    try {
      dispatch(fetchCustomerSalesStart())

      const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken")
      if (!token) {
        throw new Error("No authentication token found")
      }

      const pageSize = Math.max(1, size)

      const requestBody = {
        customerId,
        customerName,
        customerEmail,
        pageNo: page,
        pageSize: pageSize,
        sortBy: "saleOrderId",
        sortDir: "desc",
      }

      const response = await axios.post<SalesByCustomerResponse>(
        "http://saffronwellcare.com/order-service/api/v1/orders/getSalesByCustomerDetails",
        requestBody,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      )

      // Handle error response when no orders found
      if (response.data.success === false && response.data.errorCode === "402") {
        dispatch(
          fetchCustomerSalesSuccess({
            sales: [],
            pageNo: 0,
            pageSize: pageSize,
            totalElements: 0,
            totalPages: 0,
            last: true,
          })
        )
        return
      }

      // Handle successful responses with proper typing
      let salesData: SaleOrder[] = []
      let paginationData = {
        pageNo: page,
        pageSize: pageSize,
        totalElements: 0,
        totalPages: 1,
        last: true,
      }

      if (Array.isArray(response.data)) {
        salesData = response.data as SaleOrder[] // Type assertion here
      } else if (response.data && Array.isArray(response.data.saleOrderDtoList)) {
        salesData = response.data.saleOrderDtoList
        paginationData = {
          pageNo: response.data.pageNo || page,
          pageSize: response.data.pageSize || pageSize,
          totalElements: response.data.totalElements || response.data.saleOrderDtoList.length,
          totalPages: response.data.totalPages || 1,
          last: response.data.last !== undefined ? response.data.last : true,
        }
      } else if (response.data && Array.isArray((response.data as any).sales)) {
        salesData = (response.data as any).sales as SaleOrder[] // Type assertion here
        paginationData = {
          pageNo: (response.data as any).pageNo || page,
          pageSize: (response.data as any).pageSize || pageSize,
          totalElements: (response.data as any).totalElements || (response.data as any).sales.length,
          totalPages: (response.data as any).totalPages || 1,
          last: (response.data as any).last !== undefined ? (response.data as any).last : true,
        }
      } else {
        throw new Error("Invalid response format from server")
      }

      dispatch(
        fetchCustomerSalesSuccess({
          sales: salesData,
          ...paginationData,
        })
      )
    } catch (error: any) {
      let errorMessage = "Failed to fetch customer sales"

      if (error.response?.data) {
        const apiError = error.response.data
        if (apiError.errorCode === "402" && apiError.errorMessage.includes("No sale orders found")) {
          // Handle "no orders found" case as a successful empty response
          dispatch(
            fetchCustomerSalesSuccess({
              sales: [],
              pageNo: 0,
              pageSize: size,
              totalElements: 0,
              totalPages: 0,
              last: true,
            })
          )
          return
        }
        errorMessage = apiError.message || apiError.errorMessage || "API request failed"
      } else if (error.message) {
        errorMessage = error.message
      }

      dispatch(fetchCustomerSalesFailure(errorMessage))
    }
  }

export const selectCustomers = (state: RootState) => ({
  customers: state.customer.customers,
  currentCustomer: state.customer.currentCustomer,
  loading: state.customer.loading,
  error: state.customer.error,
  pagination: state.customer.pagination,
  createCustomerLoading: state.customer.createCustomerLoading,
  createCustomerError: state.customer.createCustomerError,
  updateCustomerLoading: state.customer.updateCustomerLoading,
  updateCustomerError: state.customer.updateCustomerError,
  deleteCustomerLoading: state.customer.deleteCustomerLoading,
  deleteCustomerError: state.customer.deleteCustomerError,
  dashboardSummary: state.customer.dashboardSummary,
  customerSales: state.customer.customerSales,
})

export default customerSlice.reducer
