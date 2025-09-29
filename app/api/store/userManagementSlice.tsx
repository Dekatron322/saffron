// src/store/userManagementSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { AppDispatch, RootState } from "./store"
import axios from "axios"
import { API_CONFIG } from "../config/api"

interface User {
  userId: number
  userName: string
  email: string
  mobileNo: string
  organisationId: number
  firstName: string | null
  lastName: string | null
  isActive: boolean | null
  password?: string
  orgName?: string | null
}

interface UserDetailResponse {
  success: boolean
  message: string
  userId: number
  userName: string
  email: string
  mobileNo: string
  password: string
  organisationId: number
  orgName: string | null
  firstName: string | null
  lastName: string | null
  isActive: string | null
}

interface CreateUserPayload {
  firstName: string
  lastName: string
  email: string
  mobileNo: string
  password: string
  organisationId: number
}

interface UpdateUserPayload {
  userId: number
  userName: string
  firstName: string
  email: string
  mobileNo: string
  organisationId: number
}

interface Organisation {
  id: number
  companyName: string
  gstin: string
  cin: string
  address: string
  licenseId: string
  logo: string
  shortName: string
  emailId: string
  phoneNumber: string
  businessType: string
  businessCategory: string
}

interface CreateOrganisationPayload {
  companyName: string
  gstin: string
  cin: string
  address: string
  logo: File | null
  shortName: string
  emailId: string
  phoneNumber: string
  businessType: string
  businessCategory: string
}

interface UserManagementState {
  users: User[]
  currentUser: User | null
  organisations: Organisation[]
  loading: boolean
  error: string | null
  userDetailLoading: boolean
  userDetailError: string | null
  updateLoading: boolean
  updateError: string | null
  updateSuccess: boolean
  createLoading: boolean
  createError: string | null
  createSuccess: boolean
  organisationsLoading: boolean
  organisationsError: string | null
  createOrganisationLoading: boolean
  createOrganisationError: string | null
  createOrganisationSuccess: boolean
}

const initialState: UserManagementState = {
  users: [],
  currentUser: null,
  organisations: [],
  loading: false,
  error: null,
  userDetailLoading: false,
  userDetailError: null,
  updateLoading: false,
  updateError: null,
  updateSuccess: false,
  createLoading: false,
  createError: null,
  createSuccess: false,
  organisationsLoading: false,
  organisationsError: null,
  createOrganisationLoading: false,
  createOrganisationError: null,
  createOrganisationSuccess: false,
}

const userManagementSlice = createSlice({
  name: "userManagement",
  initialState,
  reducers: {
    fetchUsersStart(state) {
      state.loading = true
      state.error = null
    },
    fetchUsersSuccess(state, action: PayloadAction<User[]>) {
      state.users = action.payload
      state.loading = false
      state.error = null
    },
    fetchUsersFailure(state, action: PayloadAction<string>) {
      state.loading = false
      state.error = action.payload
    },
    fetchUserDetailStart(state) {
      state.userDetailLoading = true
      state.userDetailError = null
    },
    fetchUserDetailSuccess(state, action: PayloadAction<User>) {
      state.currentUser = action.payload
      state.userDetailLoading = false
      state.userDetailError = null
    },
    fetchUserDetailFailure(state, action: PayloadAction<string>) {
      state.userDetailLoading = false
      state.userDetailError = action.payload
    },
    updateUserStart(state) {
      state.updateLoading = true
      state.updateError = null
      state.updateSuccess = false
    },
    updateUserSuccess(state, action: PayloadAction<User>) {
      const updatedUser = action.payload
      state.users = state.users.map((user) => (user.userId === updatedUser.userId ? updatedUser : user))

      if (state.currentUser && state.currentUser.userId === updatedUser.userId) {
        state.currentUser = updatedUser
      }

      state.updateLoading = false
      state.updateSuccess = true
    },
    updateUserFailure(state, action: PayloadAction<string>) {
      state.updateLoading = false
      state.updateError = action.payload
      state.updateSuccess = false
    },
    createUserStart(state) {
      state.createLoading = true
      state.createError = null
      state.createSuccess = false
    },
    createUserSuccess(state, action: PayloadAction<User>) {
      state.users.push(action.payload)
      state.createLoading = false
      state.createSuccess = true
    },
    createUserFailure(state, action: PayloadAction<string>) {
      state.createLoading = false
      state.createError = action.payload
      state.createSuccess = false
    },
    fetchOrganisationsStart(state) {
      state.organisationsLoading = true
      state.organisationsError = null
    },
    fetchOrganisationsSuccess(state, action: PayloadAction<Organisation[]>) {
      state.organisations = action.payload
      state.organisationsLoading = false
      state.organisationsError = null
    },
    fetchOrganisationsFailure(state, action: PayloadAction<string>) {
      state.organisationsLoading = false
      state.organisationsError = action.payload
    },
    createOrganisationStart(state) {
      state.createOrganisationLoading = true
      state.createOrganisationError = null
      state.createOrganisationSuccess = false
    },
    createOrganisationSuccess(state, action: PayloadAction<Organisation>) {
      state.organisations.push(action.payload)
      state.createOrganisationLoading = false
      state.createOrganisationSuccess = true
    },
    createOrganisationFailure(state, action: PayloadAction<string>) {
      state.createOrganisationLoading = false
      state.createOrganisationError = action.payload
      state.createOrganisationSuccess = false
    },
    resetUpdateStatus(state) {
      state.updateSuccess = false
      state.updateError = null
    },
    resetCreateStatus(state) {
      state.createSuccess = false
      state.createError = null
    },
    resetCreateOrganisationStatus(state) {
      state.createOrganisationSuccess = false
      state.createOrganisationError = null
    },
    clearUsers(state) {
      state.users = []
    },
    clearCurrentUser(state) {
      state.currentUser = null
    },
  },
})

// Thunk for fetching all users
export const fetchAllUsers = () => async (dispatch: AppDispatch) => {
  try {
    dispatch(fetchUsersStart())

    const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken")
    if (!token) {
      throw new Error("No authentication token found")
    }

    const response = await axios.get(
      `${API_CONFIG.BASE_URL}/inventory-service/api/v1/inventory/user/get-all-inventory-users`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    )

    if (!Array.isArray(response.data)) {
      throw new Error("Invalid response format from server")
    }

    const validatedUsers = response.data.map((user: any) => ({
      userId: user.userId,
      userName: user.userName,
      email: user.email,
      mobileNo: user.mobileNo,
      organisationId: user.organisationId,
      firstName: user.firstName,
      lastName: user.lastName,
      isActive: user.isActive === "Y",
    }))

    dispatch(fetchUsersSuccess(validatedUsers))
  } catch (error: any) {
    let errorMessage = "Failed to fetch users"
    if (error.response?.data) {
      errorMessage = error.response.data.message || error.response.data.errorMessage || "API request failed"
    } else if (error.message) {
      errorMessage = error.message
    }
    dispatch(fetchUsersFailure(errorMessage))
  }
}

// Thunk for fetching single user detail
export const fetchUserDetail = (userId: number) => async (dispatch: AppDispatch) => {
  try {
    dispatch(fetchUserDetailStart())

    const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken")
    if (!token) {
      throw new Error("No authentication token found")
    }

    const response = await axios.get<UserDetailResponse>(
      `${API_CONFIG.BASE_URL}/inventory-service/api/v1/inventory/user/${userId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    )

    const userData = response.data

    if (!userData.success) {
      throw new Error(userData.message || "Failed to fetch user details")
    }

    const user: User = {
      userId: userData.userId,
      userName: userData.userName,
      email: userData.email,
      mobileNo: userData.mobileNo,
      organisationId: userData.organisationId,
      firstName: userData.firstName,
      lastName: userData.lastName,
      isActive: userData.isActive === "Y",
      password: userData.password,
      orgName: userData.orgName,
    }

    dispatch(fetchUserDetailSuccess(user))
  } catch (error: any) {
    let errorMessage = "Failed to fetch user details"
    if (error.response?.data) {
      errorMessage = error.response.data.message || error.response.data.errorMessage || "API request failed"
    } else if (error.message) {
      errorMessage = error.message
    }
    dispatch(fetchUserDetailFailure(errorMessage))
  }
}

// Thunk for creating a new user
export const createUser = (userData: CreateUserPayload) => async (dispatch: AppDispatch) => {
  try {
    dispatch(createUserStart())

    const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken")
    if (!token) {
      throw new Error("No authentication token found")
    }

    const response = await axios.post(
      `${API_CONFIG.BASE_URL}/inventory-service/api/v1/inventory/user/create-inventory-user`,
      {
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        mobileNo: userData.mobileNo,
        password: userData.password,
        organisationId: userData.organisationId,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    )

    const responseData = response.data

    if (!responseData.success) {
      throw new Error(responseData.message || "Failed to create user")
    }

    const newUser: User = {
      userId: responseData.userId,
      userName: responseData.userName,
      email: responseData.email,
      mobileNo: responseData.mobileNo,
      organisationId: responseData.organisationId,
      firstName: responseData.firstName,
      lastName: responseData.lastName,
      isActive: responseData.isActive === "Y",
      password: responseData.password,
      orgName: responseData.orgName,
    }

    dispatch(createUserSuccess(newUser))
    return { success: true, data: newUser }
  } catch (error: any) {
    let errorMessage = "Failed to create user"
    if (error.response?.data) {
      errorMessage = error.response.data.message || error.response.data.errorMessage || "API request failed"
    } else if (error.message) {
      errorMessage = error.message
    }
    dispatch(createUserFailure(errorMessage))
    return { error: errorMessage }
  }
}

// Thunk for updating user details
export const updateUserDetails = (userData: UpdateUserPayload) => async (dispatch: AppDispatch) => {
  try {
    dispatch(updateUserStart())

    const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken")
    if (!token) {
      throw new Error("No authentication token found")
    }

    const response = await axios.put(
      `${API_CONFIG.BASE_URL}/inventory-service/api/v1/inventory/user/updateUserDetails`,
      {
        userName: userData.userName,
        firstName: userData.firstName,
        email: userData.email,
        mobileNo: userData.mobileNo,
        organisationId: userData.organisationId,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    )

    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to update user details")
    }

    const updatedUser: User = {
      userId: userData.userId,
      userName: userData.userName,
      email: userData.email,
      mobileNo: userData.mobileNo,
      organisationId: userData.organisationId,
      firstName: userData.firstName,
      lastName: null,
      isActive: true,
    }

    dispatch(updateUserSuccess(updatedUser))
  } catch (error: any) {
    let errorMessage = "Failed to update user details"
    if (error.response?.data) {
      errorMessage = error.response.data.message || error.response.data.errorMessage || "API request failed"
    } else if (error.message) {
      errorMessage = error.message
    }
    dispatch(updateUserFailure(errorMessage))
  }
}

// Thunk for fetching organisations
export const fetchOrganisations = () => async (dispatch: AppDispatch) => {
  try {
    dispatch(fetchOrganisationsStart())

    const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken")
    if (!token) {
      throw new Error("No authentication token found")
    }

    const response = await axios.get(`${API_CONFIG.BASE_URL}/order-service/api/organisations`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })

    if (!Array.isArray(response.data)) {
      throw new Error("Invalid response format from server")
    }

    const organisations: Organisation[] = response.data.map((org: any) => ({
      id: org.id,
      companyName: org.companyName,
      gstin: org.gstin,
      cin: org.cin,
      address: org.address,
      licenseId: org.licenseId,
      logo: org.logo,
      shortName: org.shortName,
      emailId: org.emailId || "",
      phoneNumber: org.phoneNumber || "",
      businessType: org.businessType || "",
      businessCategory: org.businessCategory || "",
    }))

    dispatch(fetchOrganisationsSuccess(organisations))
  } catch (error: any) {
    let errorMessage = "Failed to fetch organisations"
    if (error.response?.data) {
      errorMessage = error.response.data.message || error.response.data.errorMessage || "API request failed"
    } else if (error.message) {
      errorMessage = error.message
    }
    dispatch(fetchOrganisationsFailure(errorMessage))
  }
}

export const createOrganisation = (organisationData: CreateOrganisationPayload) => async (dispatch: AppDispatch) => {
  try {
    dispatch(createOrganisationStart())

    const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken")
    if (!token) {
      throw new Error("No authentication token found")
    }

    // Create FormData object
    const formData = new FormData()

    // Create organisation JSON blob
    const organisation = {
      companyName: organisationData.companyName,
      gstin: organisationData.gstin,
      cin: organisationData.cin || "",
      address: organisationData.address || "",
      emailId: organisationData.emailId,
      phoneNumber: organisationData.phoneNumber,
      businessType: organisationData.businessType,
      businessCategory: organisationData.businessCategory,
      shortName: organisationData.shortName,
    }

    // Append organisation as a Blob with the exact key "organisation"
    const orgBlob = new Blob([JSON.stringify(organisation)], { type: "application/json" })
    formData.append("organisation", orgBlob, "organisation.json")

    // Append the logo file with the exact key "file"
    if (organisationData.logo) {
      formData.append("file", organisationData.logo)
    }

    const response = await axios.post(
      `${API_CONFIG.BASE_URL}/order-service/api/organisations/create-organisation-details`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )

    const responseData = response.data

    if (!responseData.id) {
      throw new Error(responseData.message || "Failed to create organisation")
    }

    const newOrganisation: Organisation = {
      id: responseData.id,
      companyName: responseData.companyName,
      gstin: responseData.gstin,
      cin: responseData.cin || "",
      address: responseData.address || "",
      licenseId: responseData.licenseId || "",
      logo: responseData.logo || "",
      shortName: responseData.shortName,
      emailId: responseData.emailId,
      phoneNumber: responseData.phoneNumber,
      businessType: responseData.businessType,
      businessCategory: responseData.businessCategory,
    }

    dispatch(createOrganisationSuccess(newOrganisation))

    // Return a properly structured response
    return {
      meta: {
        requestStatus: "fulfilled",
      },
      payload: newOrganisation,
    }
  } catch (error: any) {
    let errorMessage = "Failed to create organisation"
    if (error.response?.data) {
      errorMessage = error.response.data.errorMessage || error.response.data.message || "API request failed"
    } else if (error.message) {
      errorMessage = error.message
    }
    dispatch(createOrganisationFailure(errorMessage))

    // Return a properly structured error response
    return {
      meta: {
        requestStatus: "rejected",
      },
      payload: {
        errorMessage,
        message: errorMessage,
      },
    }
  }
}
// Export all actions
export const {
  fetchUsersStart,
  fetchUsersSuccess,
  fetchUsersFailure,
  fetchUserDetailStart,
  fetchUserDetailSuccess,
  fetchUserDetailFailure,
  updateUserStart,
  updateUserSuccess,
  updateUserFailure,
  createUserStart,
  createUserSuccess,
  createUserFailure,
  fetchOrganisationsStart,
  fetchOrganisationsSuccess,
  fetchOrganisationsFailure,
  createOrganisationStart,
  createOrganisationSuccess,
  createOrganisationFailure,
  resetUpdateStatus,
  resetCreateStatus,
  resetCreateOrganisationStatus,
  clearUsers,
  clearCurrentUser,
} = userManagementSlice.actions

// Export the reducer
export default userManagementSlice.reducer

// Selectors
export const selectUsers = (state: RootState) => state.userManagement.users
export const selectCurrentUser = (state: RootState) => state.userManagement.currentUser
export const selectOrganisations = (state: RootState) => state.userManagement.organisations
export const selectLoading = (state: RootState) => state.userManagement.loading
export const selectError = (state: RootState) => state.userManagement.error
export const selectUserDetailLoading = (state: RootState) => state.userManagement.userDetailLoading
export const selectUserDetailError = (state: RootState) => state.userManagement.userDetailError
export const selectUpdateLoading = (state: RootState) => state.userManagement.updateLoading
export const selectUpdateError = (state: RootState) => state.userManagement.updateError
export const selectUpdateSuccess = (state: RootState) => state.userManagement.updateSuccess
export const selectCreateLoading = (state: RootState) => state.userManagement.createLoading
export const selectCreateError = (state: RootState) => state.userManagement.createError
export const selectCreateSuccess = (state: RootState) => state.userManagement.createSuccess
export const selectOrganisationsLoading = (state: RootState) => state.userManagement.organisationsLoading
export const selectOrganisationsError = (state: RootState) => state.userManagement.organisationsError
export const selectCreateOrganisationLoading = (state: RootState) => state.userManagement.createOrganisationLoading
export const selectCreateOrganisationError = (state: RootState) => state.userManagement.createOrganisationError
export const selectCreateOrganisationSuccess = (state: RootState) => state.userManagement.createOrganisationSuccess
