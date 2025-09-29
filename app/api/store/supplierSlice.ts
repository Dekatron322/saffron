// src/store/supplierSlice.ts
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit"
import { createSelector } from "@reduxjs/toolkit"
import { AppDispatch, RootState } from "./store"
import axios from "axios"

interface Supplier {
  id: number
  name: string
  contactDetails: string
  address: string
  email: string
  gstNumber: string
  gstAddress: string
}

interface SupplierState {
  suppliers: Supplier[]
  loading: boolean
  error: string | null
}

const initialState: SupplierState = {
  suppliers: [],
  loading: false,
  error: null,
}

export const createSupplier = createAsyncThunk(
  "supplier/createSupplier",
  async (
    supplierData: {
      name: string
      contactDetails: string
      address: string
      email: string
      gstNumber: string
    },
    { rejectWithValue }
  ) => {
    try {
      const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken")
      if (!token) {
        throw new Error("No authentication token found")
      }

      const response = await axios.post(
        "http://saffronwellcare.com/supplier-service/api/v1/suppliers/create-supplier",
        supplierData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      )

      return response.data
    } catch (error: any) {
      let errorMessage = "Failed to create supplier"

      if (error.response?.data) {
        if (Array.isArray(error.response.data)) {
          errorMessage = error.response.data.join(", ")
        } else if (typeof error.response.data === "object") {
          errorMessage = error.response.data.message || JSON.stringify(error.response.data)
        } else {
          errorMessage = error.response.data
        }
      } else if (error.message) {
        errorMessage = error.message
      }

      return rejectWithValue(errorMessage)
    }
  }
)

const supplierSlice = createSlice({
  name: "supplier",
  initialState,
  reducers: {
    fetchSuppliersStart(state) {
      state.loading = true
      state.error = null
    },
    fetchSuppliersSuccess(state, action: PayloadAction<Supplier[]>) {
      state.suppliers = action.payload
      state.loading = false
      state.error = null
    },
    fetchSuppliersFailure(state, action: PayloadAction<string>) {
      state.loading = false
      state.error = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createSupplier.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createSupplier.fulfilled, (state, action: PayloadAction<Supplier>) => {
        state.suppliers.push(action.payload)
        state.loading = false
        state.error = null
      })
      .addCase(createSupplier.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  },
})

export const { fetchSuppliersStart, fetchSuppliersSuccess, fetchSuppliersFailure } = supplierSlice.actions

export const fetchAllSuppliers = () => async (dispatch: AppDispatch) => {
  try {
    dispatch(fetchSuppliersStart())

    const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken")
    if (!token) {
      throw new Error("No authentication token found")
    }

    const response = await axios.get("http://saffronwellcare.com/supplier-service/api/v1/suppliers", {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })

    if (!Array.isArray(response.data)) {
      throw new Error("Expected an array of suppliers")
    }

    dispatch(fetchSuppliersSuccess(response.data as any))
  } catch (error: any) {
    let errorMessage = "Failed to fetch suppliers"

    if (error.response?.data) {
      if (Array.isArray(error.response.data)) {
        errorMessage = error.response.data.join(", ")
      } else if (typeof error.response.data === "object") {
        errorMessage = error.response.data.message || JSON.stringify(error.response.data)
      } else {
        errorMessage = error.response.data
      }
    } else if (error.message) {
      errorMessage = error.message
    }

    dispatch(fetchSuppliersFailure(errorMessage))
  }
}

// Memoized selectors to prevent unnecessary re-renders
export const selectSuppliers = createSelector(
  (state: RootState) => state.supplier.suppliers,
  (state: RootState) => state.supplier.loading,
  (state: RootState) => state.supplier.error,
  (suppliers, loading, error) => ({
    suppliers,
    loading,
    error,
  })
)

export default supplierSlice.reducer
