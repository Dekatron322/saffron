// src/store/subscriptionSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { AppDispatch, RootState } from "./store"
import axios from "axios"

interface Price {
  monthly: number
  yearly: number
}

interface SubscriptionPlan {
  planName: string
  description: string
  keyFeatures: string[]
  price: Price
  targetAudience: string
  points: number
  discount?: number
  subscriptionTypeId?: number
  subscriptionPlanId?: string
}

interface SubscriptionState {
  plans: SubscriptionPlan[]
  loading: boolean
  error: string | null
  successMessage: string | null
  currentSubscriptionType: {
    subscriptionTypeId: number | null
    subscriptionName: string | null
  }
}

const initialState: SubscriptionState = {
  plans: [],
  loading: false,
  error: null,
  successMessage: null,
  currentSubscriptionType: {
    subscriptionTypeId: null,
    subscriptionName: null,
  },
}

const subscriptionSlice = createSlice({
  name: "subscription",
  initialState,
  reducers: {
    fetchSubscriptionsStart(state) {
      state.loading = true
      state.error = null
      state.successMessage = null
    },
    fetchSubscriptionsSuccess(state, action: PayloadAction<SubscriptionPlan[]>) {
      state.plans = action.payload
      state.loading = false
      state.error = null
    },
    fetchSubscriptionsFailure(state, action: PayloadAction<string>) {
      state.loading = false
      state.error = action.payload
    },
    clearSubscriptions(state) {
      state.plans = []
      state.loading = false
      state.error = null
      state.successMessage = null
    },
    createSubscriptionSuccess(state, action: PayloadAction<string>) {
      state.loading = false
      state.successMessage = action.payload
      state.error = null
    },
    addSubscriptionPlanSuccess(state, action: PayloadAction<string>) {
      state.loading = false
      state.successMessage = action.payload
      state.error = null
    },
    addSubscriptionDetailsSuccess(state, action: PayloadAction<string>) {
      state.loading = false
      state.successMessage = action.payload
      state.error = null
    },
    clearMessages(state) {
      state.successMessage = null
      state.error = null
    },
    fetchSubscriptionTypeByIdSuccess(
      state,
      action: PayloadAction<{ subscriptionTypeId: number; subscriptionName: string }>
    ) {
      state.currentSubscriptionType = {
        subscriptionTypeId: action.payload.subscriptionTypeId,
        subscriptionName: action.payload.subscriptionName,
      }
      state.loading = false
      state.error = null
    },
    updateSubscriptionDetailsSuccess(state, action: PayloadAction<string>) {
      state.loading = false
      state.successMessage = action.payload
      state.error = null
    },
  },
})

export const {
  fetchSubscriptionsStart,
  fetchSubscriptionsSuccess,
  fetchSubscriptionsFailure,
  clearSubscriptions,
  createSubscriptionSuccess,
  addSubscriptionPlanSuccess,
  addSubscriptionDetailsSuccess,
  clearMessages,
  fetchSubscriptionTypeByIdSuccess,
  updateSubscriptionDetailsSuccess,
} = subscriptionSlice.actions

const getAuthToken = () => {
  const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken")
  if (!token) {
    throw new Error("No authentication token found")
  }
  return token
}

export const fetchAllSubscriptions = () => async (dispatch: AppDispatch) => {
  try {
    dispatch(fetchSubscriptionsStart())
    const token = getAuthToken()

    const response = await axios.get("http://saffronwellcare.com/customer-service/api/v1/subscriptionType", {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })

    if (!response.data?.planDetails) {
      throw new Error("Invalid response format from server")
    }

    dispatch(fetchSubscriptionsSuccess(response.data.planDetails))
    return {
      payload: response.data.planDetails,
      success: true,
    }
  } catch (error: any) {
    let errorMessage = "Failed to fetch subscription plans"

    if (error.response?.data) {
      const apiError = error.response.data
      errorMessage = apiError.message || apiError.errorMessage || "API request failed"
    } else if (error.message) {
      errorMessage = error.message
    }

    dispatch(fetchSubscriptionsFailure(errorMessage))
    return {
      error: errorMessage,
      success: false,
    }
  }
}

export const fetchSubscriptionTypeByName = (subscriptionName: string) => async (dispatch: AppDispatch) => {
  try {
    dispatch(fetchSubscriptionsStart())
    const token = getAuthToken()

    const encodedName = encodeURIComponent(subscriptionName)
    const response = await axios.get(
      `http://saffronwellcare.com/customer-service/api/v1/subscriptionType/get-subscription-type-by-subscription-name/${encodedName}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    )

    if (!response.data?.subscriptionTypeId) {
      throw new Error("Invalid response format from server")
    }

    dispatch(
      fetchSubscriptionTypeByIdSuccess({
        subscriptionTypeId: response.data.subscriptionTypeId,
        subscriptionName: response.data.subscriptionName,
      })
    )
    return {
      payload: response.data,
      success: true,
    }
  } catch (error: any) {
    let errorMessage = "Failed to fetch subscription type by name"

    if (error.response?.data) {
      const apiError = error.response.data
      errorMessage = apiError.message || apiError.errorMessage || "API request failed"
    } else if (error.message) {
      errorMessage = error.message
    }

    dispatch(fetchSubscriptionsFailure(errorMessage))
    return {
      error: errorMessage,
      success: false,
    }
  }
}

export const updateSubscriptionDetails =
  (updateData: {
    subscriptionType: {
      subscriptionTypeId: number
      subscriptionName: string
    }
    subscriptionPlan: {
      yearlyPrice: number
      monthlyPrice: number
      targetAudience: string
      description: string
      points: number
      discount: number
    }
    subscriptionPlanDetails: {
      keyFeatures: string
    }
  }) =>
  async (dispatch: AppDispatch) => {
    try {
      dispatch(fetchSubscriptionsStart())
      const token = getAuthToken()

      const response = await axios.put(
        "http://saffronwellcare.com/customer-service/api/v1/subscriptionType/update-subscription-details",
        updateData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      )

      dispatch(updateSubscriptionDetailsSuccess("Subscription details updated successfully"))
      return {
        payload: response.data,
        success: true,
      }
    } catch (error: any) {
      let errorMessage = "Failed to update subscription details"

      if (error.response?.data) {
        const apiError = error.response.data
        errorMessage = apiError.message || apiError.errorMessage || "API request failed"
      } else if (error.message) {
        errorMessage = error.message
      }

      dispatch(fetchSubscriptionsFailure(errorMessage))
      return {
        error: errorMessage,
        success: false,
      }
    }
  }

export const createSubscriptionName = (subscriptionName: string) => async (dispatch: AppDispatch) => {
  try {
    dispatch(fetchSubscriptionsStart())
    const token = getAuthToken()

    const response = await axios.post<{
      subscriptionTypeId: number
      subscriptionName: string
    }>(
      "http://saffronwellcare.com/customer-service/api/v1/subscriptionType",
      { subscriptionName },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    )

    dispatch(createSubscriptionSuccess("Subscription name created successfully"))
    return {
      payload: response.data,
      success: true,
    }
  } catch (error: any) {
    let errorMessage = "Failed to create subscription name"

    if (error.response?.data) {
      const apiError = error.response.data
      errorMessage = apiError.message || apiError.errorMessage || "API request failed"
    } else if (error.message) {
      errorMessage = error.message
    }

    dispatch(fetchSubscriptionsFailure(errorMessage))
    return {
      error: errorMessage,
      success: false,
    }
  }
}

export const addSubscriptionPlan =
  (planData: {
    subscriptionTypeId: number
    monthlyPrice: number
    yearlyPrice: number
    targetAudience: string
    description: string
    points: number
    discount: number
  }) =>
  async (dispatch: AppDispatch) => {
    try {
      dispatch(fetchSubscriptionsStart())
      const token = getAuthToken()

      const response = await axios.post<{
        id: string
        [key: string]: any
      }>("http://saffronwellcare.com/customer-service/api/v1/subscriptionPlan", planData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      dispatch(addSubscriptionPlanSuccess("Subscription plan added successfully"))
      return {
        payload: response.data,
        success: true,
      }
    } catch (error: any) {
      let errorMessage = "Failed to add subscription plan"

      if (error.response?.data) {
        const apiError = error.response.data
        errorMessage = apiError.message || apiError.errorMessage || "API request failed"
      } else if (error.message) {
        errorMessage = error.message
      }

      dispatch(fetchSubscriptionsFailure(errorMessage))
      return {
        error: errorMessage,
        success: false,
      }
    }
  }

export const addSubscriptionDetails =
  (detailsData: { subscriptionPlanId: string; keyFeatures: string }) => async (dispatch: AppDispatch) => {
    try {
      dispatch(fetchSubscriptionsStart())
      const token = getAuthToken()

      const response = await axios.post<{
        success: boolean
        [key: string]: any
      }>("http://saffronwellcare.com/customer-service/api/v1/subscriptionDetails", detailsData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      dispatch(addSubscriptionDetailsSuccess("Subscription details added successfully"))
      return {
        payload: response.data,
        success: true,
      }
    } catch (error: any) {
      let errorMessage = "Failed to add subscription details"

      if (error.response?.data) {
        const apiError = error.response.data
        errorMessage = apiError.message || apiError.errorMessage || "API request failed"
      } else if (error.message) {
        errorMessage = error.message
      }

      dispatch(fetchSubscriptionsFailure(errorMessage))
      return {
        error: errorMessage,
        success: false,
      }
    }
  }

export const selectSubscriptions = (state: RootState) => ({
  plans: state.subscription.plans,
  loading: state.subscription.loading,
  error: state.subscription.error,
  successMessage: state.subscription.successMessage,
  currentSubscriptionType: state.subscription.currentSubscriptionType,
})

export default subscriptionSlice.reducer
