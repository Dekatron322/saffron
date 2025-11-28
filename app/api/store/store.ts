// src/store/store.ts
import { configureStore } from "@reduxjs/toolkit"
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux"
import authReducer from "./authSlice"
import productReducer from "./productSlice"
import unitReducer from "./unitSlice"
import customerReducer from "./customerSlice"
import supplierReducer from "./supplierSlice"
import batchReducer from "./batchSlice"
import subscriptionReducer from "./subscriptionSlice"
import userManagementReducer from "./userManagementSlice"
import purchaseReducer from "./purchaseSlice"
import reorderSuggestionReducer from "./reorderSuggestionSlice"
import overviewReducer from "./overviewSlice"
import unitsOrderedReducer from "./unitsOrderedSlice"
import pendingDeliveriesReducer from "./pendingDeliveriesSlice"
import returnPurchaseOrderReducer from "./returnPurchaseOrderSlice"
import financeReducer from "./financeSlice"
import promoCodeReducer from "./promoCodeSlice"
import salesReducer from "./salesSlice"
import loyaltyReducer from "./loyaltySlice"
import dashboardReducer from "./dashboardSlice"

export const store = configureStore({
  reducer: {
    auth: authReducer,
    product: productReducer,
    unit: unitReducer,
    customer: customerReducer,
    supplier: supplierReducer,
    batch: batchReducer,
    subscription: subscriptionReducer,
    userManagement: userManagementReducer,
    purchase: purchaseReducer,
    reorderSuggestion: reorderSuggestionReducer,
    overview: overviewReducer,
    unitsOrdered: unitsOrderedReducer,
    pendingDeliveries: pendingDeliveriesReducer,
    returnPurchaseOrder: returnPurchaseOrderReducer,
    finance: financeReducer,
    promoCode: promoCodeReducer,
    sales: salesReducer,
    loyalty: loyaltyReducer,
    dashboard: dashboardReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

export const useAppDispatch: () => AppDispatch = useDispatch
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector
