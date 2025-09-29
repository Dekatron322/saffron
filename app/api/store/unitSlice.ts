// src/store/unitSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { AppDispatch, RootState } from "./store"
import axios from "axios"
import { API_CONFIG } from "../config/api"

interface Conversion {
  conversionId: number
  fromUnit: string
  toUnit: string
  conversionFactor: number
}

interface Unit {
  unitId: number
  baseUnit: string
  secondaryUnit: string
  shortName: string
  conversions: Conversion[]
  productId: number | null
}

interface UnitResponse {
  success: boolean
  message: string
  data: Unit[] | Unit
}

interface AddUnitPayload {
  baseUnit: string
  secondaryUnit: string
  shortName: string
}

interface UnitState {
  units: Unit[]
  loading: boolean
  error: string | null
  addUnitLoading: boolean
  addUnitError: string | null
}

const initialState: UnitState = {
  units: [],
  loading: false,
  error: null,
  addUnitLoading: false,
  addUnitError: null,
}

const unitSlice = createSlice({
  name: "unit",
  initialState,
  reducers: {
    fetchUnitsStart(state) {
      state.loading = true
      state.error = null
    },
    fetchUnitsSuccess(state, action: PayloadAction<Unit[]>) {
      state.units = action.payload
      state.loading = false
      state.error = null
    },
    fetchUnitsFailure(state, action: PayloadAction<string>) {
      state.loading = false
      state.error = action.payload
    },
    clearUnits(state) {
      state.units = []
    },
    addUnitStart(state) {
      state.addUnitLoading = true
      state.addUnitError = null
    },
    addUnitSuccess(state, action: PayloadAction<Unit>) {
      state.units = [...state.units, action.payload]
      state.addUnitLoading = false
      state.addUnitError = null
    },
    addUnitFailure(state, action: PayloadAction<string>) {
      state.addUnitLoading = false
      state.addUnitError = action.payload
    },
  },
})

export const {
  fetchUnitsStart,
  fetchUnitsSuccess,
  fetchUnitsFailure,
  clearUnits,
  addUnitStart,
  addUnitSuccess,
  addUnitFailure,
} = unitSlice.actions

export const fetchAllUnits = () => async (dispatch: AppDispatch) => {
  try {
    dispatch(fetchUnitsStart())

    const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken")
    if (!token) {
      throw new Error("No authentication token found")
    }

    const response = await axios.get(`${API_CONFIG.BASE_URL}/inventory-service/api/v1/units`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })

    if (response.data.success === false) {
      throw new Error(response.data.message || "Failed to fetch units")
    }

    if (!response.data.data || !Array.isArray(response.data.data)) {
      throw new Error("Invalid response format from server")
    }

    dispatch(fetchUnitsSuccess(response.data.data))
  } catch (error: any) {
    let errorMessage = "Failed to fetch units"

    if (error.response?.data) {
      const apiError = error.response.data
      errorMessage = apiError.message || apiError.errorMessage || "API request failed"
    } else if (error.message) {
      errorMessage = error.message
    }

    dispatch(fetchUnitsFailure(errorMessage))
  }
}

export const addUnit = (unitData: AddUnitPayload) => async (dispatch: AppDispatch) => {
  try {
    dispatch(addUnitStart())

    const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken")
    if (!token) {
      throw new Error("No authentication token found")
    }

    const response = await axios.post(`${API_CONFIG.BASE_URL}/inventory-service/api/v1/units`, unitData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })

    if (response.data.success === false) {
      throw new Error(response.data.message || "Failed to add unit")
    }

    if (!response.data.data) {
      throw new Error("Invalid response format from server")
    }

    dispatch(addUnitSuccess(response.data.data))
    return response.data.data // Return the created unit for immediate use
  } catch (error: any) {
    let errorMessage = "Failed to add unit"

    if (error.response?.data) {
      const apiError = error.response.data
      errorMessage = apiError.message || apiError.errorMessage || "API request failed"
    } else if (error.message) {
      errorMessage = error.message
    }

    dispatch(addUnitFailure(errorMessage))
    throw errorMessage // Re-throw the error for the component to handle
  }
}

export const selectUnits = (state: RootState) => ({
  units: state.unit.units,
  loading: state.unit.loading,
  error: state.unit.error,
  addUnitLoading: state.unit.addUnitLoading,
  addUnitError: state.unit.addUnitError,
})

export default unitSlice.reducer
