// src/store/financeSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { AppDispatch, RootState } from "./store"
import axios from "axios"

export interface ExpenseItem {
  itemId: number
  expenseId: number
  categoryId: number
  price: number
  description: string
  tax: number
  hsn: number
  taxIncluded: boolean
  totalAmount: number
  gstAmount: number
  cgstAmount: number
  sgstAmount: number
}

export interface Expense {
  expenseId: number
  expenseDate: string
  totalAmount: number
  branchId: number
  partyName: string
  referenceNo: string
  paymentMethod: string
  status: string
  approvedBy: string
  createdDate: string
  expenseItems: ExpenseItem[]
  attachment: string
}

export interface ExpenseCategory {
  categoryId: number
  name: string
  description: string
  expenseTypeId: number
  branchId: number
}

export interface ExpenseType {
  expenseTypeId: number
  expenseType: string
  expenseCategories: ExpenseCategory[] | null
}

// Interface for creating expense items
export interface CreateExpenseItem {
  price: number
  hsn: number
  tax: number
  taxIncluded: boolean
  description: string
  categoryId: number
}

// Interface for creating expense
export interface CreateExpensePayload {
  expenseDate: string
  branchId: number
  partyName: string
  paymentMethod: string
  status: string
  approvedBy: string
  expenseItems: CreateExpenseItem[]
}

// Interface for creating expense type
export interface CreateExpenseTypePayload {
  expenseType: string
}

interface ExpensePaginationResponse {
  expenses: Expense[]
  pageNo: number
  pageSize: number
  totalElements: number
  totalPages: number
  last: boolean
}

interface FinanceResponse {
  success: boolean
  message: string
  error: string | null
  expenses: ExpensePaginationResponse
}

interface ExpenseCategoriesResponse {
  success: boolean
  message: string
  error: string | null
  expenseCategory: ExpenseCategory[]
}

interface ExpenseTypesResponse {
  success: boolean
  message: string
  error: string | null
  expenseTypes: ExpenseType[]
}

interface CreateCategoryResponse {
  meta: any
  success: boolean
  message: string
  error: string | null
  expenseCategory: ExpenseCategory
}

interface CreateExpenseResponse {
  success: boolean
  message: string
  error: string | null
  expense: Expense
}

interface CreateExpenseTypeResponse {
  success: boolean
  message: string
  error: string | null
  expenseType: ExpenseType
}

interface UpdateExpenseTypeResponse {
  success: boolean
  message: string
  error: string | null
  expenseType: ExpenseType
}

interface DeleteExpenseTypeResponse {
  success: boolean
  message: string
  error: string | null
}

interface FinanceState {
  expenses: Expense[]
  categories: ExpenseCategory[]
  expenseTypes: ExpenseType[]
  loading: boolean
  error: string | null
  categoriesLoading: boolean
  categoriesError: string | null
  expenseTypesLoading: boolean
  expenseTypesError: string | null
  createCategoryLoading: boolean
  createCategoryError: string | null
  updateCategoryLoading: boolean
  updateCategoryError: string | null
  deleteCategoryLoading: boolean
  deleteCategoryError: string | null
  createExpenseLoading: boolean
  createExpenseError: string | null
  createExpenseSuccess: boolean
  createExpenseTypeLoading: boolean
  createExpenseTypeError: string | null
  createExpenseTypeSuccess: boolean
  updateExpenseTypeLoading: boolean
  updateExpenseTypeError: string | null
  deleteExpenseTypeLoading: boolean
  deleteExpenseTypeError: string | null
  pagination: {
    currentPage: number
    pageSize: number
    totalElements: number
    totalPages: number
    lastPage: boolean
  }
}

const initialState: FinanceState = {
  expenses: [],
  categories: [],
  expenseTypes: [],
  loading: false,
  error: null,
  categoriesLoading: false,
  categoriesError: null,
  expenseTypesLoading: false,
  expenseTypesError: null,
  createCategoryLoading: false,
  createCategoryError: null,
  updateCategoryLoading: false,
  updateCategoryError: null,
  deleteCategoryLoading: false,
  deleteCategoryError: null,
  createExpenseLoading: false,
  createExpenseError: null,
  createExpenseSuccess: false,
  createExpenseTypeLoading: false,
  createExpenseTypeError: null,
  createExpenseTypeSuccess: false,
  updateExpenseTypeLoading: false,
  updateExpenseTypeError: null,
  deleteExpenseTypeLoading: false,
  deleteExpenseTypeError: null,
  pagination: {
    currentPage: 0,
    pageSize: 5,
    totalElements: 0,
    totalPages: 1,
    lastPage: false,
  },
}

const financeSlice = createSlice({
  name: "finance",
  initialState,
  reducers: {
    fetchExpensesStart(state) {
      state.loading = true
      state.error = null
    },
    fetchExpensesSuccess(state, action: PayloadAction<ExpensePaginationResponse>) {
      state.expenses = action.payload.expenses
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
    fetchExpensesFailure(state, action: PayloadAction<string>) {
      state.loading = false
      state.error = action.payload
    },
    fetchCategoriesStart(state) {
      state.categoriesLoading = true
      state.categoriesError = null
    },
    fetchCategoriesSuccess(state, action: PayloadAction<ExpenseCategory[]>) {
      state.categories = action.payload
      state.categoriesLoading = false
      state.categoriesError = null
    },
    fetchCategoriesFailure(state, action: PayloadAction<string>) {
      state.categoriesLoading = false
      state.categoriesError = action.payload
    },
    fetchExpenseTypesStart(state) {
      state.expenseTypesLoading = true
      state.expenseTypesError = null
    },
    fetchExpenseTypesSuccess(state, action: PayloadAction<ExpenseType[]>) {
      state.expenseTypes = action.payload
      state.expenseTypesLoading = false
      state.expenseTypesError = null
    },
    fetchExpenseTypesFailure(state, action: PayloadAction<string>) {
      state.expenseTypesLoading = false
      state.expenseTypesError = action.payload
    },
    createCategoryStart(state) {
      state.createCategoryLoading = true
      state.createCategoryError = null
    },
    createCategorySuccess(state, action: PayloadAction<ExpenseCategory>) {
      state.createCategoryLoading = false
      state.createCategoryError = null
      state.categories = [action.payload, ...state.categories]
    },
    createCategoryFailure(state, action: PayloadAction<string>) {
      state.createCategoryLoading = false
      state.createCategoryError = action.payload
    },
    updateCategoryStart(state) {
      state.updateCategoryLoading = true
      state.updateCategoryError = null
    },
    updateCategorySuccess(state, action: PayloadAction<ExpenseCategory>) {
      state.updateCategoryLoading = false
      state.updateCategoryError = null
      state.categories = state.categories.map((category) =>
        category.categoryId === action.payload.categoryId ? action.payload : category
      )
    },
    updateCategoryFailure(state, action: PayloadAction<string>) {
      state.updateCategoryLoading = false
      state.updateCategoryError = action.payload
    },
    deleteCategoryStart(state) {
      state.deleteCategoryLoading = true
      state.deleteCategoryError = null
    },
    deleteCategorySuccess(state, action: PayloadAction<number>) {
      state.deleteCategoryLoading = false
      state.deleteCategoryError = null
      state.categories = state.categories.filter((category) => category.categoryId !== action.payload)
    },
    deleteCategoryFailure(state, action: PayloadAction<string>) {
      state.deleteCategoryLoading = false
      state.deleteCategoryError = action.payload
    },
    createExpenseStart(state) {
      state.createExpenseLoading = true
      state.createExpenseError = null
      state.createExpenseSuccess = false
    },
    createExpenseSuccess(state, action: PayloadAction<Expense>) {
      state.createExpenseLoading = false
      state.createExpenseError = null
      state.createExpenseSuccess = true
      state.expenses = [action.payload, ...state.expenses]
      state.pagination.totalElements += 1
    },
    createExpenseFailure(state, action: PayloadAction<string>) {
      state.createExpenseLoading = false
      state.createExpenseError = action.payload
      state.createExpenseSuccess = false
    },
    createExpenseTypeStart(state) {
      state.createExpenseTypeLoading = true
      state.createExpenseTypeError = null
      state.createExpenseTypeSuccess = false
    },
    createExpenseTypeSuccess(state, action: PayloadAction<ExpenseType>) {
      state.createExpenseTypeLoading = false
      state.createExpenseTypeError = null
      state.createExpenseTypeSuccess = true
      state.expenseTypes = [action.payload, ...state.expenseTypes]
    },
    createExpenseTypeFailure(state, action: PayloadAction<string>) {
      state.createExpenseTypeLoading = false
      state.createExpenseTypeError = action.payload
      state.createExpenseTypeSuccess = false
    },
    updateExpenseTypeStart(state) {
      state.updateExpenseTypeLoading = true
      state.updateExpenseTypeError = null
    },
    updateExpenseTypeSuccess(state, action: PayloadAction<ExpenseType>) {
      state.updateExpenseTypeLoading = false
      state.updateExpenseTypeError = null
      state.expenseTypes = state.expenseTypes.map((type) =>
        type.expenseTypeId === action.payload.expenseTypeId ? action.payload : type
      )
    },
    updateExpenseTypeFailure(state, action: PayloadAction<string>) {
      state.updateExpenseTypeLoading = false
      state.updateExpenseTypeError = action.payload
    },
    deleteExpenseTypeStart(state) {
      state.deleteExpenseTypeLoading = true
      state.deleteExpenseTypeError = null
    },
    deleteExpenseTypeSuccess(state, action: PayloadAction<number>) {
      state.deleteExpenseTypeLoading = false
      state.deleteExpenseTypeError = null
      state.expenseTypes = state.expenseTypes.filter((type) => type.expenseTypeId !== action.payload)
    },
    deleteExpenseTypeFailure(state, action: PayloadAction<string>) {
      state.deleteExpenseTypeLoading = false
      state.deleteExpenseTypeError = action.payload
    },
    clearCreateExpenseStatus(state) {
      state.createExpenseLoading = false
      state.createExpenseError = null
      state.createExpenseSuccess = false
    },
    clearCreateExpenseTypeStatus(state) {
      state.createExpenseTypeLoading = false
      state.createExpenseTypeError = null
      state.createExpenseTypeSuccess = false
    },
    clearExpenses(state) {
      state.expenses = []
      state.pagination = {
        currentPage: 0,
        pageSize: 5,
        totalElements: 0,
        totalPages: 1,
        lastPage: false,
      }
    },
    clearCategories(state) {
      state.categories = []
      state.categoriesError = null
    },
    clearExpenseTypes(state) {
      state.expenseTypes = []
      state.expenseTypesError = null
    },
    clearCreateCategoryError(state) {
      state.createCategoryError = null
    },
    clearUpdateCategoryError(state) {
      state.updateCategoryError = null
    },
    clearDeleteCategoryError(state) {
      state.deleteCategoryError = null
    },
    clearCreateExpenseTypeError(state) {
      state.createExpenseTypeError = null
    },
    clearUpdateExpenseTypeError(state) {
      state.updateExpenseTypeError = null
    },
    clearDeleteExpenseTypeError(state) {
      state.deleteExpenseTypeError = null
    },
  },
})

export const {
  fetchExpensesStart,
  fetchExpensesSuccess,
  fetchExpensesFailure,
  fetchCategoriesStart,
  fetchCategoriesSuccess,
  fetchCategoriesFailure,
  fetchExpenseTypesStart,
  fetchExpenseTypesSuccess,
  fetchExpenseTypesFailure,
  createCategoryStart,
  createCategorySuccess,
  createCategoryFailure,
  updateCategoryStart,
  updateCategorySuccess,
  updateCategoryFailure,
  deleteCategoryStart,
  deleteCategorySuccess,
  deleteCategoryFailure,
  createExpenseStart,
  createExpenseSuccess,
  createExpenseFailure,
  createExpenseTypeStart,
  createExpenseTypeSuccess,
  createExpenseTypeFailure,
  updateExpenseTypeStart,
  updateExpenseTypeSuccess,
  updateExpenseTypeFailure,
  deleteExpenseTypeStart,
  deleteExpenseTypeSuccess,
  deleteExpenseTypeFailure,
  clearCreateExpenseStatus,
  clearCreateExpenseTypeStatus,
  clearExpenses,
  clearCategories,
  clearExpenseTypes,
  clearCreateCategoryError,
  clearUpdateCategoryError,
  clearDeleteCategoryError,
  clearCreateExpenseTypeError,
  clearUpdateExpenseTypeError,
  clearDeleteExpenseTypeError,
} = financeSlice.actions

export const fetchAllExpenses =
  (page = 0, size = 5, signal?: AbortSignal) =>
  async (dispatch: AppDispatch) => {
    try {
      dispatch(fetchExpensesStart())

      const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken")
      if (!token) {
        throw new Error("No authentication token found")
      }

      const pageSize = Math.max(1, size)

      const requestBody = {
        pageNo: page,
        pageSize: pageSize,
        sortBy: "createdDate",
        sortDir: "asc",
      }

      const response = await axios.post<FinanceResponse>(
        "http://saffronwellcare.com/supplier-service/api/expenses/get-all-expenses",
        requestBody,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          signal,
        }
      )

      if (response.data.success === false) {
        throw new Error(response.data.message || "Failed to fetch expenses")
      }

      if (!response.data.expenses || !Array.isArray(response.data.expenses.expenses)) {
        throw new Error("Invalid response format from server")
      }

      dispatch(fetchExpensesSuccess(response.data.expenses))
    } catch (error: any) {
      let errorMessage = "Failed to fetch expenses"

      if (error.response?.data) {
        const apiError = error.response.data
        errorMessage = apiError.message || apiError.errorMessage || "API request failed"

        if (apiError.errorCode === "402") {
          errorMessage = "Invalid pagination parameters. Please try again."
        }
      } else if (error.message) {
        errorMessage = error.message
      }

      dispatch(fetchExpensesFailure(errorMessage))
    }
  }

export const fetchAllExpenseCategories = (signal?: AbortSignal) => async (dispatch: AppDispatch) => {
  try {
    dispatch(fetchCategoriesStart())

    const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken")
    if (!token) {
      throw new Error("No authentication token found")
    }

    const response = await axios.get<ExpenseCategoriesResponse>(
      "http://saffronwellcare.com/supplier-service/api/expense-categories",
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        signal,
      }
    )

    if (response.data.success === false) {
      throw new Error(response.data.message || "Failed to fetch expense categories")
    }

    if (!response.data.expenseCategory || !Array.isArray(response.data.expenseCategory)) {
      throw new Error("Invalid response format from server")
    }

    dispatch(fetchCategoriesSuccess(response.data.expenseCategory))
  } catch (error: any) {
    let errorMessage = "Failed to fetch expense categories"

    if (error.response?.data) {
      const apiError = error.response.data
      errorMessage = apiError.message || apiError.errorMessage || "API request failed"
    } else if (error.message) {
      errorMessage = error.message
    }

    dispatch(fetchCategoriesFailure(errorMessage))
  }
}

export const fetchAllExpenseTypes = (signal?: AbortSignal) => async (dispatch: AppDispatch) => {
  try {
    dispatch(fetchExpenseTypesStart())

    const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken")
    if (!token) {
      throw new Error("No authentication token found")
    }

    const response = await axios.get<ExpenseTypesResponse>(
      "http://saffronwellcare.com/supplier-service/api/expense-types",
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        signal,
      }
    )

    if (response.data.success === false) {
      throw new Error(response.data.message || "Failed to fetch expense types")
    }

    if (!response.data.expenseTypes || !Array.isArray(response.data.expenseTypes)) {
      throw new Error("Invalid response format from server")
    }

    dispatch(fetchExpenseTypesSuccess(response.data.expenseTypes))
  } catch (error: any) {
    let errorMessage = "Failed to fetch expense types"

    if (error.response?.data) {
      const apiError = error.response.data
      errorMessage = apiError.message || apiError.errorMessage || "API request failed"
    } else if (error.message) {
      errorMessage = error.message
    }

    dispatch(fetchExpenseTypesFailure(errorMessage))
  }
}

export const createExpenseCategory =
  (categoryData: { name: string; description: string; expenseTypeId: number; branchId: number }) =>
  async (dispatch: AppDispatch) => {
    try {
      dispatch(createCategoryStart())

      const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken")
      if (!token) {
        throw new Error("No authentication token found")
      }

      const requestBody = {
        name: categoryData.name,
        description: categoryData.description,
        expenseTypeId: categoryData.expenseTypeId,
        branchId: categoryData.branchId,
      }

      const response = await axios.post<CreateCategoryResponse>(
        "http://saffronwellcare.com/supplier-service/api/expense-categories",
        requestBody,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      )

      if (response.data.success === false) {
        throw new Error(response.data.message || "Failed to create expense category")
      }

      if (!response.data.expenseCategory) {
        throw new Error("Invalid response format from server")
      }

      dispatch(createCategorySuccess(response.data.expenseCategory))
      return response.data
    } catch (error: any) {
      let errorMessage = "Failed to create expense category"

      if (error.response?.data) {
        const apiError = error.response.data
        errorMessage = apiError.message || apiError.errorMessage || "API request failed"

        // Handle specific error cases
        if (apiError.errorCode === "400") {
          errorMessage = "Invalid category data. Please check your input."
        } else if (apiError.errorCode === "409") {
          errorMessage = "A category with this name already exists."
        }
      } else if (error.message) {
        errorMessage = error.message
      }

      dispatch(createCategoryFailure(errorMessage))
      throw new Error(errorMessage)
    }
  }

export const updateExpenseCategory =
  (categoryId: number, categoryData: { name: string; description: string; expenseTypeId: number; branchId: number }) =>
  async (dispatch: AppDispatch) => {
    try {
      dispatch(updateCategoryStart())

      const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken")
      if (!token) {
        throw new Error("No authentication token found")
      }

      const requestBody = {
        name: categoryData.name,
        description: categoryData.description,
        expenseTypeId: categoryData.expenseTypeId,
        branchId: categoryData.branchId,
      }

      const response = await axios.put<CreateCategoryResponse>(
        `http://saffronwellcare.com/supplier-service/api/expense-categories/${categoryId}`,
        requestBody,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      )

      if (response.data.success === false) {
        throw new Error(response.data.message || "Failed to update expense category")
      }

      if (!response.data.expenseCategory) {
        throw new Error("Invalid response format from server")
      }

      dispatch(updateCategorySuccess(response.data.expenseCategory))
      return response.data
    } catch (error: any) {
      let errorMessage = "Failed to update expense category"

      if (error.response?.data) {
        const apiError = error.response.data
        errorMessage = apiError.message || apiError.errorMessage || "API request failed"

        // Handle specific error cases
        if (apiError.errorCode === "400") {
          errorMessage = "Invalid category data. Please check your input."
        } else if (apiError.errorCode === "404") {
          errorMessage = "Category not found."
        } else if (apiError.errorCode === "409") {
          errorMessage = "A category with this name already exists."
        }
      } else if (error.message) {
        errorMessage = error.message
      }

      dispatch(updateCategoryFailure(errorMessage))
      throw new Error(errorMessage)
    }
  }

export const deleteExpenseCategory = (categoryId: number) => async (dispatch: AppDispatch) => {
  try {
    dispatch(deleteCategoryStart())

    const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken")
    if (!token) {
      throw new Error("No authentication token found")
    }

    const response = await axios.delete<ExpenseCategoriesResponse>(
      `http://saffronwellcare.com/supplier-service/api/expense-categories/${categoryId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )

    if (response.data.success === false) {
      throw new Error(response.data.message || "Failed to delete expense category")
    }

    dispatch(deleteCategorySuccess(categoryId))
    return response.data
  } catch (error: any) {
    let errorMessage = "Failed to delete expense category"

    if (error.response?.data) {
      const apiError = error.response.data
      errorMessage = apiError.message || apiError.errorMessage || "API request failed"

      // Handle specific error cases
      if (apiError.errorCode === "404") {
        errorMessage = "Category not found."
      } else if (apiError.errorCode === "409") {
        errorMessage = "Cannot delete category because it is being used by expenses."
      }
    } else if (error.message) {
      errorMessage = error.message
    }

    dispatch(deleteCategoryFailure(errorMessage))
    throw new Error(errorMessage)
  }
}

// Create Expense Type
export const createExpenseType = (expenseTypeData: CreateExpenseTypePayload) => async (dispatch: AppDispatch) => {
  try {
    dispatch(createExpenseTypeStart())

    const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken")
    if (!token) {
      throw new Error("No authentication token found")
    }

    const requestBody = {
      expenseType: expenseTypeData.expenseType,
    }

    const response = await axios.post<CreateExpenseTypeResponse>(
      "http://saffronwellcare.com/supplier-service/api/expense-types",
      requestBody,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    )

    if (response.data.success === false) {
      throw new Error(response.data.message || "Failed to create expense type")
    }

    if (!response.data.expenseType) {
      throw new Error("Invalid response format from server")
    }

    dispatch(createExpenseTypeSuccess(response.data.expenseType))
    return response.data
  } catch (error: any) {
    let errorMessage = "Failed to create expense type"

    if (error.response?.data) {
      const apiError = error.response.data
      errorMessage = apiError.message || apiError.errorMessage || "API request failed"

      // Handle specific error cases
      if (apiError.errorCode === "400") {
        errorMessage = "Invalid expense type data. Please check your input."
      } else if (apiError.errorCode === "409") {
        errorMessage = "An expense type with this name already exists."
      }
    } else if (error.message) {
      errorMessage = error.message
    }

    dispatch(createExpenseTypeFailure(errorMessage))
    throw new Error(errorMessage)
  }
}

// Update Expense Type
export const updateExpenseType =
  (expenseTypeId: number, expenseTypeData: CreateExpenseTypePayload) => async (dispatch: AppDispatch) => {
    try {
      dispatch(updateExpenseTypeStart())

      const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken")
      if (!token) {
        throw new Error("No authentication token found")
      }

      const requestBody = {
        expenseType: expenseTypeData.expenseType,
      }

      const response = await axios.put<UpdateExpenseTypeResponse>(
        `http://saffronwellcare.com/supplier-service/api/expense-types/${expenseTypeId}`,
        requestBody,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      )

      if (response.data.success === false) {
        throw new Error(response.data.message || "Failed to update expense type")
      }

      if (!response.data.expenseType) {
        throw new Error("Invalid response format from server")
      }

      dispatch(updateExpenseTypeSuccess(response.data.expenseType))
      return response.data
    } catch (error: any) {
      let errorMessage = "Failed to update expense type"

      if (error.response?.data) {
        const apiError = error.response.data
        errorMessage = apiError.message || apiError.errorMessage || "API request failed"

        // Handle specific error cases
        if (apiError.errorCode === "400") {
          errorMessage = "Invalid expense type data. Please check your input."
        } else if (apiError.errorCode === "404") {
          errorMessage = "Expense type not found."
        } else if (apiError.errorCode === "409") {
          errorMessage = "An expense type with this name already exists."
        }
      } else if (error.message) {
        errorMessage = error.message
      }

      dispatch(updateExpenseTypeFailure(errorMessage))
      throw new Error(errorMessage)
    }
  }

// Delete Expense Type
export const deleteExpenseType = (expenseTypeId: number) => async (dispatch: AppDispatch) => {
  try {
    dispatch(deleteExpenseTypeStart())

    const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken")
    if (!token) {
      throw new Error("No authentication token found")
    }

    const response = await axios.delete<DeleteExpenseTypeResponse>(
      `http://saffronwellcare.com/supplier-service/api/expense-types/${expenseTypeId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )

    if (response.data.success === false) {
      throw new Error(response.data.message || "Failed to delete expense type")
    }

    dispatch(deleteExpenseTypeSuccess(expenseTypeId))
    return response.data
  } catch (error: any) {
    let errorMessage = "Failed to delete expense type"

    if (error.response?.data) {
      const apiError = error.response.data
      errorMessage = apiError.message || apiError.errorMessage || "API request failed"

      // Handle specific error cases
      if (apiError.errorCode === "404") {
        errorMessage = "Expense type not found."
      } else if (apiError.errorCode === "409") {
        errorMessage = "Cannot delete expense type because it is being used by categories."
      }
    } else if (error.message) {
      errorMessage = error.message
    }

    dispatch(deleteExpenseTypeFailure(errorMessage))
    throw new Error(errorMessage)
  }
}

// Create Expense
export const createExpense =
  (payload: { expenseData: CreateExpensePayload; file: File }) => async (dispatch: AppDispatch) => {
    try {
      dispatch(createExpenseStart())

      const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken")
      if (!token) {
        dispatch(createExpenseFailure("No authentication token found"))
        return { success: false, error: "No authentication token found" }
      }

      // Create FormData
      const formData = new FormData()

      // Create the expensesDTO object
      const expensesDTO = {
        expenseDate: payload.expenseData.expenseDate,
        branchId: payload.expenseData.branchId,
        partyName: payload.expenseData.partyName,
        paymentMethod: payload.expenseData.paymentMethod,
        status: payload.expenseData.status,
        approvedBy: payload.expenseData.approvedBy,
        expenseItems: payload.expenseData.expenseItems.map((item) => ({
          price: item.price,
          hsn: item.hsn,
          tax: item.tax,
          taxIncluded: item.taxIncluded,
          description: item.description,
          categoryId: item.categoryId,
        })),
      }

      // Append the expensesDTO as a JSON string
      formData.append("expensesDTO", JSON.stringify(expensesDTO))

      // Append the file
      formData.append("file", payload.file)

      const response = await axios.post("http://saffronwellcare.com/supplier-service/api/expenses/create", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      // Check if the request was successful
      if (response.data.success === false) {
        dispatch(createExpenseFailure(response.data.message || "Failed to create expense"))
        return { success: false, error: response.data.message }
      }

      // Success case - dispatch success and return the data
      dispatch(createExpenseSuccess(response.data.expenses))
      return { success: true, data: response.data }
    } catch (error: any) {
      let errorMessage = "Failed to create expense"

      if (error.response?.data) {
        const apiError = error.response.data
        errorMessage = apiError.message || apiError.errorMessage || "API request failed"
      } else if (error.message) {
        errorMessage = error.message
      }

      dispatch(createExpenseFailure(errorMessage))
      return { success: false, error: errorMessage }
    }
  }

export const selectExpenses = (state: RootState) => ({
  expenses: state.finance.expenses,
  categories: state.finance.categories,
  expenseTypes: state.finance.expenseTypes,
  loading: state.finance.loading,
  error: state.finance.error,
  categoriesLoading: state.finance.categoriesLoading,
  categoriesError: state.finance.categoriesError,
  expenseTypesLoading: state.finance.expenseTypesLoading,
  expenseTypesError: state.finance.expenseTypesError,
  createCategoryLoading: state.finance.createCategoryLoading,
  createCategoryError: state.finance.createCategoryError,
  updateCategoryLoading: state.finance.updateCategoryLoading,
  updateCategoryError: state.finance.updateCategoryError,
  deleteCategoryLoading: state.finance.deleteCategoryLoading,
  deleteCategoryError: state.finance.deleteCategoryError,
  createExpenseLoading: state.finance.createExpenseLoading,
  createExpenseError: state.finance.createExpenseError,
  createExpenseSuccess: state.finance.createExpenseSuccess,
  createExpenseTypeLoading: state.finance.createExpenseTypeLoading,
  createExpenseTypeError: state.finance.createExpenseTypeError,
  createExpenseTypeSuccess: state.finance.createExpenseTypeSuccess,
  updateExpenseTypeLoading: state.finance.updateExpenseTypeLoading,
  updateExpenseTypeError: state.finance.updateExpenseTypeError,
  deleteExpenseTypeLoading: state.finance.deleteExpenseTypeLoading,
  deleteExpenseTypeError: state.finance.deleteExpenseTypeError,
  pagination: state.finance.pagination,
})

export default financeSlice.reducer
