// src/store/batchSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { AppDispatch, RootState } from "./store"
import axios from "axios"

interface Product {
  createdDate: string | null
  createdBy: string | null
  modifiedDate: string | null
  modifiedBy: string | null
  productId: number
  productName: string | null
  description: string | null
  category: string | null
  manufacturer: string | null
  price: number | null
  productCode: string | null
  defaultMRP: number | null
  salePrice: number | null
  purchasePrice: number | null
  discountType: string | null
  saleDiscount: number | null
  openingStockQuantity: number | null
  minimumStockQuantity: number | null
  itemLocation: string | null
  taxRate: number | null
  inclusiveOfTax: boolean | null
  hsn: string | null
  itemName: string | null
  batchNo: string | null
  modelNo: string | null
  size: string | null
  mfgDate: string | null
  expDate: string | null
  mrp: number | null
  unit: string | null
  packagingSize: string | null
  productStatus: boolean
  refundable: boolean | null
  barcode: string | null
  points: number | null
}

interface Batch {
  mrp: number
  batchNo: string
  mfg: string
  mfgDate: string
  expDate: string
  packing: string
  product: Product
}

interface BatchState {
  batches: Batch[]
  loading: boolean
  error: string | null
  creating: boolean
  createError: string | null
}

const initialState: BatchState = {
  batches: [],
  loading: false,
  error: null,
  creating: false,
  createError: null,
}

const batchSlice = createSlice({
  name: "batch",
  initialState,
  reducers: {
    fetchBatchesStart(state) {
      state.loading = true
      state.error = null
    },
    fetchBatchesSuccess(state, action: PayloadAction<Batch[]>) {
      state.batches = action.payload
      state.loading = false
      state.error = null
    },
    fetchBatchesFailure(state, action: PayloadAction<string>) {
      state.loading = false
      state.error = action.payload
    },
    createBatchStart(state) {
      state.creating = true
      state.createError = null
    },
    createBatchSuccess(state, action: PayloadAction<Batch>) {
      state.batches = [...state.batches, action.payload]
      state.creating = false
      state.createError = null
    },
    createBatchFailure(state, action: PayloadAction<string>) {
      state.creating = false
      state.createError = action.payload
    },
    clearBatches(state) {
      state.batches = []
      state.loading = false
      state.error = null
      state.creating = false
      state.createError = null
    },
  },
})

export const {
  fetchBatchesStart,
  fetchBatchesSuccess,
  fetchBatchesFailure,
  createBatchStart,
  createBatchSuccess,
  createBatchFailure,
  clearBatches,
} = batchSlice.actions

export const fetchAllBatches = () => async (dispatch: AppDispatch) => {
  try {
    dispatch(fetchBatchesStart())

    const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken")
    if (!token) {
      throw new Error("No authentication token found")
    }

    const response = await axios.get("http://saffronwellcare.com/inventory-service/api/batches", {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })

    if (!Array.isArray(response.data)) {
      throw new Error("Invalid response format from server")
    }

    dispatch(fetchBatchesSuccess(response.data as any))
  } catch (error: any) {
    let errorMessage = "Failed to fetch batches"

    if (error.response?.data) {
      const apiError = error.response.data
      errorMessage = apiError.message || apiError.errorMessage || "API request failed"
    } else if (error.message) {
      errorMessage = error.message
    }

    dispatch(fetchBatchesFailure(errorMessage))
  }
}

export const createBatch =
  (batchData: {
    mrp: number
    batchNo: string
    mfg: string
    mfgDate: string
    expDate: string
    packing: string
    product: {
      productId: number
    }
  }) =>
  async (dispatch: AppDispatch) => {
    try {
      dispatch(createBatchStart())

      const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken")
      if (!token) {
        throw new Error("No authentication token found")
      }

      const response = await axios.post("http://saffronwellcare.com/inventory-service/api/batches", batchData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.data) {
        throw new Error("No data received from server")
      }

      dispatch(createBatchSuccess(response.data))
      return response.data // Important for .unwrap() to work
    } catch (error: any) {
      let errorMessage = "Failed to create batch"

      if (error.response?.data) {
        const apiError = error.response.data
        errorMessage = apiError.message || apiError.errorMessage || "API request failed"
        if (apiError.errors) {
          // Handle validation errors if your API returns them
          errorMessage = Object.values(apiError.errors).join(", ")
        }
      } else if (error.message) {
        errorMessage = error.message
      }

      dispatch(createBatchFailure(errorMessage))
      throw new Error(errorMessage) // Important for .unwrap() to work
    }
  }

export const selectBatches = (state: RootState) => ({
  batches: state.batch.batches,
  loading: state.batch.loading,
  error: state.batch.error,
  creating: state.batch.creating,
  createError: state.batch.createError,
})

export default batchSlice.reducer
