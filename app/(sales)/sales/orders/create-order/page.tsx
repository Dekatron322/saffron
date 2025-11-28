"use client"

import { ButtonModule } from "components/ui/Button/Button"
import { SearchModule } from "components/ui/Search/search-module"
import { useRouter, useSearchParams } from "next/navigation"
import React, { useEffect, useState } from "react"
import { useAppDispatch, useAppSelector } from "app/api/store/store"
import { fetchAllCustomers, selectCustomers } from "app/api/store/customerSlice"
import { fetchAllCategories, fetchAllProducts, selectCategories, selectProducts } from "app/api/store/productSlice"
import { createSaleOrderAction, fetchSaleOrderByIdAction } from "app/api/store/salesSlice"
import { FormInputModule } from "components/ui/Input/Input"
import { DropdownPopoverModule } from "components/ui/Input/DropdownModule"
import { AnimatePresence, motion } from "framer-motion"
import { notify } from "components/ui/Notification/Notification"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import { fetchAllUnits, selectUnits } from "app/api/store/unitSlice"
import DashboardNav from "components/Navbar/DashboardNav"

interface ProductFormData {
  productName: string
  description: string
  category: {
    catId: number
    catName: string
  }
  manufacturer: string
  salePrice: number
  purchasePrice: number
  discountType: string
  saleDiscount: number
  taxRate: number
  mrp: number
  hsn: number
  batchNo: string
  modelNo: string
  size: string
  mfgDate: string
  expDate: string
  itemLocation: string
  openingStockQuantity: number
  minimumStockQuantity: number
  reorderQuantity: number
  reorderThreshold: number
  packagingSize: number
  unitId: number
  selectedUnitType?: "base" | "secondary"
  refundable: string
  productStatus: boolean
  inclusiveOfTax: boolean
  branch: number
  paymentCategory: string
  type: string
  paidAmount: string
  linkPayment: boolean
  deductibleWalletAmount: number
  customerId: number
}

interface SaleOrderItem {
  productForm: ProductFormData
  quantity?: number
  isMinimized: boolean
  calculatedAmounts?: {
    price: number
    taxAmount: number
    amountWithoutTax: number
    discountAmount: number
    amountWithDiscountWithoutTax: number
    taxAfterDiscount: number
    totalPayableAmount: number
    actualTabletCount: number
    numberOfPacks: number
  }
  batchOptions?: Array<{
    mrp: number
    batchNo: string
    mfg?: string | null
    mfgDate?: string | null
    expDate?: string | null
    packing?: string | null
  }>
}

interface PaymentInfo {
  paymentType: string
  amount: number
  gstPercentage: number
  totalAmount: number
  receivedAmount: number
  status: string
  walletUsed?: number
}

interface CalculationBreakdown {
  subtotal: number
  taxAmount: number
  totalWithTax: number
  discountAmount: number
  itemBreakdown: Array<{
    productName: string
    quantity: number
    mrp: number
    taxRate: number
    discountType: string
    discountValue: number
    discountAmount: number
    subtotal: number
    taxAmount: number
    total: number
    price: number
    amountWithoutTax: number
    amountWithDiscountWithoutTax: number
    taxAfterDiscount: number
    totalPayableAmount: number
    actualTabletCount: number
    numberOfPacks: number
  }>
}

interface ApiError {
  errorType?: string
  errorMessage?: string
  errorCode?: string
  severity?: string
  path?: string
  method?: string
  timestamp?: string
}

const RaiseSalesOrder = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const dispatch = useAppDispatch()

  // Helper function to create deep copy of an order
  const createOrderCopy = (order: SaleOrderItem): SaleOrderItem => ({
    ...order,
    productForm: {
      ...order.productForm,
      category: { ...order.productForm.category },
    },
    quantity: order.quantity,
    isMinimized: order.isMinimized,
    calculatedAmounts: order.calculatedAmounts ? { ...order.calculatedAmounts } : undefined,
  })

  // Helper function to create order copy with minimized state
  const createOrderCopyWithMinimize = (order: SaleOrderItem, isMinimized: boolean): SaleOrderItem => ({
    ...order,
    productForm: {
      ...order.productForm,
      category: { ...order.productForm.category },
    },
    quantity: order.quantity,
    isMinimized,
    calculatedAmounts: order.calculatedAmounts ? { ...order.calculatedAmounts } : undefined,
  })

  const calculateItemAmounts = (
    mrp: number,
    quantity: number,
    taxRate: number,
    discountValue: number,
    unitType: string,
    packagingSize: number = 1
  ) => {
    // Calculate actual tablet count based on unit type
    let actualTabletCount = quantity
    let numberOfPacks = quantity
    let displayQuantity = quantity

    if (unitType.toLowerCase() === "tablet") {
      // For tablets: quantity is number of tablets
      actualTabletCount = quantity
      // Use fractional packs instead of ceiling so 40 tablets with pack size 30 => 1.3333 packs
      numberOfPacks = packagingSize > 0 ? quantity / packagingSize : quantity
      displayQuantity = quantity // Show tablet count
    } else if (unitType.toLowerCase() === "strip") {
      // For strips: 1 strip = packagingSize tablets
      actualTabletCount = quantity * packagingSize
      numberOfPacks = quantity
      displayQuantity = quantity // Show strip count
    }
    // For other units (PCS, etc.), use quantity as is
    else {
      actualTabletCount = quantity
      numberOfPacks = quantity
      displayQuantity = quantity
    }

    // Calculate total price:
    // - For TABLET/STRIP: MRP is per strip, so price = numberOfPacks * mrp
    // - For other units (PCS, etc.): price = quantity * mrp
    const normalizedUnit = unitType.toLowerCase()
    const price = normalizedUnit === "tablet" || normalizedUnit === "strip" ? numberOfPacks * mrp : quantity * mrp

    // Step 2: Deduct Tax from MRP Price (MRP includes tax)
    const taxAmount = Number(((price * taxRate) / (100 + taxRate)).toFixed(2))
    const amountWithoutTax = Number((price - taxAmount).toFixed(2))

    // Step 3: Apply Discount on Amount Without Tax (only if discount exists)
    const discountAmount = discountValue > 0 ? Number(((amountWithoutTax * discountValue) / 100).toFixed(2)) : 0
    const amountWithDiscountWithoutTax = Number((amountWithoutTax - discountAmount).toFixed(2))

    // Step 4: Recalculate Tax on Discounted Amount
    const taxAfterDiscount = Number((amountWithDiscountWithoutTax * (taxRate / 100)).toFixed(2))

    // Step 5: Calculate Final Payable Amount
    const totalPayableAmount = Number((amountWithDiscountWithoutTax + taxAfterDiscount).toFixed(2))

    return {
      price: Number(price.toFixed(2)),
      taxAmount: taxAmount,
      amountWithoutTax: amountWithoutTax,
      discountAmount: discountAmount,
      amountWithDiscountWithoutTax: amountWithDiscountWithoutTax,
      taxAfterDiscount: taxAfterDiscount,
      totalPayableAmount: totalPayableAmount,
      actualTabletCount: actualTabletCount,
      numberOfPacks: numberOfPacks,
      displayQuantity: displayQuantity,
    }
  }

  const handleMfgDateChange = (date: Date | null, index: number) => {
    setSaleOrders((prevOrders) => {
      const updatedOrders = prevOrders.map(createOrderCopy)
      const currentOrder = updatedOrders[index]
      if (!currentOrder) return prevOrders

      updatedOrders[index] = {
        ...currentOrder,
        productForm: {
          ...currentOrder.productForm,
          mfgDate: date ? date.toISOString().split("T")[0] ?? "" : "",
        },
      }
      return updatedOrders
    })
  }

  const handleExpDateChange = (date: Date | null, index: number) => {
    setSaleOrders((prevOrders) => {
      const updatedOrders = prevOrders.map(createOrderCopy)
      const currentOrder = updatedOrders[index]
      if (!currentOrder) return prevOrders

      updatedOrders[index] = {
        ...currentOrder,
        productForm: {
          ...currentOrder.productForm,
          expDate: date ? date.toISOString().split("T")[0] ?? "" : "",
        },
      }
      return updatedOrders
    })
  }

  // Redux state selectors
  const { customers, loading: customersLoading } = useAppSelector(selectCustomers)
  const { products, loading: productsLoading } = useAppSelector(selectProducts)
  const { categories, loading: categoriesLoading } = useAppSelector(selectCategories)
  const { units, loading: unitsLoading } = useAppSelector(selectUnits)
  const [filteredCustomers, setFilteredCustomers] = useState<any[]>([])
  const [repeatOrderId, setRepeatOrderId] = useState<number | null>(null)
  const [repeatLoaded, setRepeatLoaded] = useState(false)
  const [pendingRepeatOrder, setPendingRepeatOrder] = useState<any | null>(null)

  const [searchText, setSearchText] = useState("")
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null)
  const [saleOrders, setSaleOrders] = useState<SaleOrderItem[]>([
    {
      productForm: {
        productName: "",
        description: "",
        category: { catId: 0, catName: "" },
        manufacturer: "",
        salePrice: 0,
        purchasePrice: 0,
        discountType: "percentage",
        saleDiscount: 0,
        taxRate: 5,
        mrp: 0,
        hsn: 3004,
        batchNo: "",
        modelNo: "",
        size: "",
        mfgDate: "",
        expDate: "",
        itemLocation: "",
        openingStockQuantity: 0,
        minimumStockQuantity: 0,
        reorderQuantity: 1,
        reorderThreshold: 0,
        packagingSize: 1,
        unitId: 0,
        refundable: "Y",
        productStatus: true,
        inclusiveOfTax: true,
        branch: 1,
        paymentCategory: "cash",
        type: "STOCK",
        paidAmount: "0",
        linkPayment: false,
        deductibleWalletAmount: 0,
        customerId: 0,
      },
      quantity: 1,
      isMinimized: false,
    },
  ])

  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo>({
    paymentType: "Cash",
    amount: 0,
    gstPercentage: 5,
    totalAmount: 0,
    receivedAmount: 0,
    status: "Paid",
    walletUsed: 0,
  })

  const [orderInfo, setOrderInfo] = useState({
    paymentStatusId: 1, // Paid
    paymentTypeId: 1, // CASH
    linkPayment: "false",
    deductibleWalletAmount: 0,
    paidAmount: 0,
    placeOfSupply: 1,
    orderStatus: "Paid",
    extraDiscount: "false",
    checkoutType: "", // Added checkoutType - empty string by default (optional)
    upgradeSubscription: false,
    purchaseSubscription: false,
    promoCode: "", // Added promoCode field
  })

  const [calculationBreakdown, setCalculationBreakdown] = useState<CalculationBreakdown>({
    subtotal: 0,
    taxAmount: 0,
    totalWithTax: 0,
    discountAmount: 0,
    itemBreakdown: [],
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [apiError, setApiError] = useState<ApiError | null>(null)
  const [success, setSuccess] = useState("")
  const [showBreakdown, setShowBreakdown] = useState(false)
  const [expandedOrderIndex, setExpandedOrderIndex] = useState<number>(0)
  const [customerWalletBalance, setCustomerWalletBalance] = useState<number>(0)

  // Fetch initial data
  useEffect(() => {
    dispatch(fetchAllCustomers(0, 1000))
    dispatch(fetchAllProducts(0, 100))
    dispatch(fetchAllCategories())
    dispatch(fetchAllUnits()) // Fetch units from the unitSlice
  }, [dispatch])

  useEffect(() => {
    const id = searchParams?.get("repeatFrom")
    if (id && !repeatLoaded) {
      const numericId = Number(id)
      if (!Number.isNaN(numericId)) {
        setRepeatOrderId(numericId)
        ;(async () => {
          try {
            const saleOrder = await dispatch(fetchSaleOrderByIdAction(numericId))
            setPendingRepeatOrder(saleOrder)
          } catch (e) {
          } finally {
            setRepeatLoaded(true)
          }
        })()
      } else {
        setRepeatLoaded(true)
      }
    }
  }, [dispatch, searchParams, repeatLoaded])

  useEffect(() => {
    if (pendingRepeatOrder && customers && customers.length > 0) {
      const match = customers.find((c) => c.customerProfileId === pendingRepeatOrder.customerId)
      if (match) {
        setSelectedCustomer(match)
      }
    }
  }, [pendingRepeatOrder, customers])

  useEffect(() => {
    if (!pendingRepeatOrder || !units || units.length === 0) return

    const mappedOrders: SaleOrderItem[] = (pendingRepeatOrder.saleOrderItems || []).map((it: any) => {
      const unitName = (it.unitName || "").toString().toLowerCase()
      const unit = units.find(
        (u) => u.baseUnit?.toLowerCase() === unitName || u.secondaryUnit?.toLowerCase() === unitName
      )
      const selectedUnitType = unit?.secondaryUnit?.toLowerCase() === unitName ? "secondary" : "base"

      return {
        productForm: {
          productName: it.itemName || "",
          description: it.description || "",
          category: { catId: 0, catName: "" },
          manufacturer: it.mfg || "",
          salePrice: 0,
          purchasePrice: 0,
          discountType: it.discountType || "percentage",
          saleDiscount: it.discountValue || 0,
          taxRate: it.tax || 5,
          mrp: it.mrp || it.pricePerUnit || 0,
          hsn: Number(it.hsnCode) || 3004,
          batchNo: it.batchNo || "",
          modelNo: "",
          size: "",
          mfgDate: it.mfgDate || "",
          expDate: it.expDate || "",
          itemLocation: "",
          openingStockQuantity: 0,
          minimumStockQuantity: 0,
          reorderQuantity: 1,
          reorderThreshold: 0,
          packagingSize: it.packagingSize || 1,
          unitId: unit?.unitId || 0,
          selectedUnitType: selectedUnitType,
          refundable: "Y",
          productStatus: true,
          inclusiveOfTax: true,
          branch: 1,
          paymentCategory: "cash",
          type: "STOCK",
          paidAmount: "0",
          linkPayment: false,
          deductibleWalletAmount: 0,
          customerId: Number(pendingRepeatOrder.customerId || 0),
        },
        quantity: it.quantity || 1,
        isMinimized: false,
      }
    })

    if (mappedOrders.length > 0) {
      setSaleOrders(mappedOrders)
      setExpandedOrderIndex(0)
    }
  }, [pendingRepeatOrder, units])

  useEffect(() => {
    if (!pendingRepeatOrder) return
    setOrderInfo((prev) => ({
      ...prev,
      paymentStatusId: Number(pendingRepeatOrder.paymentStatusId ?? prev.paymentStatusId),
      paymentTypeId: Number(pendingRepeatOrder.paymentTypeId ?? prev.paymentTypeId),
      linkPayment: pendingRepeatOrder.linkPayment ? "true" : "false",
      deductibleWalletAmount: Number(pendingRepeatOrder.deductibleWalletAmount ?? prev.deductibleWalletAmount),
      paidAmount: Number(pendingRepeatOrder.paidAmount ?? prev.paidAmount),
      orderStatus: pendingRepeatOrder.orderStatus || prev.orderStatus,
    }))
  }, [pendingRepeatOrder])

  // Calculate totals whenever saleOrders change
  useEffect(() => {
    calculateTotals()
  }, [saleOrders])

  // Filter customers based on search text
  useEffect(() => {
    if (customers.length > 0) {
      if (searchText.trim() === "") {
        setFilteredCustomers(customers)
      } else {
        const filtered = customers.filter(
          (customer) =>
            customer.customerName?.toLowerCase().includes(searchText.toLowerCase()) ||
            customer.customerEmail?.toLowerCase().includes(searchText.toLowerCase()) ||
            customer.customerPhone?.toLowerCase().includes(searchText.toLowerCase())
        )
        setFilteredCustomers(filtered)
      }
    }
  }, [searchText, customers])

  // Update wallet balance when customer changes
  useEffect(() => {
    if (selectedCustomer) {
      setCustomerWalletBalance(selectedCustomer.walletAmt || 0)

      // Auto-set linkPayment to true if customer has wallet balance
      if (selectedCustomer.walletAmt > 0) {
        setOrderInfo((prev) => ({
          ...prev,
          linkPayment: "true",
        }))
      }
    } else {
      setCustomerWalletBalance(0)
    }
  }, [selectedCustomer])

  // Update received amount when wallet usage changes
  useEffect(() => {
    if (orderInfo.linkPayment === "true" && orderInfo.deductibleWalletAmount > 0) {
      const walletAmount = Math.min(orderInfo.deductibleWalletAmount, calculationBreakdown.totalWithTax)
      const remainingAmount = Math.max(0, calculationBreakdown.totalWithTax - walletAmount)

      setPaymentInfo((prev) => ({
        ...prev,
        walletUsed: walletAmount,
        amount: remainingAmount,
        receivedAmount: remainingAmount,
      }))

      setOrderInfo((prev) => ({
        ...prev,
        paidAmount: remainingAmount,
      }))
    } else {
      setPaymentInfo((prev) => ({
        ...prev,
        walletUsed: 0,
        amount: calculationBreakdown.totalWithTax,
        receivedAmount: orderInfo.paymentStatusId === 2 ? prev.receivedAmount : calculationBreakdown.totalWithTax,
      }))
    }
  }, [
    orderInfo.deductibleWalletAmount,
    orderInfo.linkPayment,
    calculationBreakdown.totalWithTax,
    orderInfo.paymentStatusId,
  ])

  const calculateTotals = () => {
    let subtotal = 0
    let taxAmount = 0
    let totalWithTax = 0
    let totalDiscountAmount = 0
    const itemBreakdown: CalculationBreakdown["itemBreakdown"] = []

    // Calculate amounts for each item
    saleOrders.forEach((order, index) => {
      const quantity = order.quantity || 1
      const mrp = order.productForm.mrp || 0
      const taxRate = order.productForm.taxRate || 5
      const discountValue = order.productForm.saleDiscount || 0
      const unit = units.find((unit) => unit.unitId === order.productForm.unitId)
      const unitType = order.productForm.selectedUnitType === "secondary" ? unit?.secondaryUnit : unit?.baseUnit
      const packagingSize = order.productForm.packagingSize || 1

      // Calculate item amounts using the correct formula with unit conversion
      const calculatedAmounts = calculateItemAmounts(
        mrp,
        quantity,
        taxRate,
        discountValue,
        unitType || "base",
        packagingSize
      )

      subtotal += calculatedAmounts.price
      taxAmount += calculatedAmounts.taxAfterDiscount
      totalWithTax += calculatedAmounts.totalPayableAmount
      totalDiscountAmount += calculatedAmounts.discountAmount

      itemBreakdown.push({
        productName: order.productForm.productName || `Product ${index + 1}`,
        quantity,
        mrp,
        taxRate,
        discountType: discountValue > 0 ? "percentage" : "none",
        discountValue,
        discountAmount: calculatedAmounts.discountAmount,
        subtotal: calculatedAmounts.price,
        taxAmount: calculatedAmounts.taxAfterDiscount,
        total: calculatedAmounts.totalPayableAmount,
        price: calculatedAmounts.price,
        amountWithoutTax: calculatedAmounts.amountWithoutTax,
        amountWithDiscountWithoutTax: calculatedAmounts.amountWithDiscountWithoutTax,
        taxAfterDiscount: calculatedAmounts.taxAfterDiscount,
        totalPayableAmount: calculatedAmounts.totalPayableAmount,
        actualTabletCount: calculatedAmounts.actualTabletCount,
        numberOfPacks: calculatedAmounts.numberOfPacks,
      })
    })

    setCalculationBreakdown({
      subtotal,
      taxAmount,
      totalWithTax,
      discountAmount: totalDiscountAmount,
      itemBreakdown,
    })

    // Update payment info with calculated amounts
    setPaymentInfo((prev) => ({
      ...prev,
      totalAmount: totalWithTax,
      amount:
        orderInfo.linkPayment === "true" && orderInfo.deductibleWalletAmount > 0
          ? Math.max(0, totalWithTax - orderInfo.deductibleWalletAmount)
          : totalWithTax,
      receivedAmount: orderInfo.paymentStatusId === 2 ? prev.receivedAmount : totalWithTax,
    }))

    // Update paidAmount in orderInfo
    setOrderInfo((prev) => ({
      ...prev,
      paidAmount: orderInfo.paymentStatusId === 2 ? prev.paidAmount : totalWithTax,
    }))
  }

  const handleCancelSearch = () => {
    setSearchText("")
  }

  const handleCustomerSelect = (customer: any) => {
    setSelectedCustomer(customer)
    setSaleOrders((prevOrders) =>
      prevOrders.map((order) => ({
        ...order,
        productForm: {
          ...order.productForm,
          customerId: customer.customerProfileId,
        },
      }))
    )
  }

  const handleProductSelect = (product: any, index: number) => {
    setSaleOrders((prevOrders) => {
      const updatedOrders = prevOrders.map(createOrderCopy)
      const currentOrder = updatedOrders[index]
      if (!currentOrder) return prevOrders

      const batchOptions = Array.isArray(product.batchDetailsDtoList)
        ? product.batchDetailsDtoList.map((b: any) => ({
            mrp: Number(b.mrp ?? 0),
            batchNo: b.batchNo ?? "",
            mfg: b.mfg ?? null,
            mfgDate: b.mfgDate ?? null,
            expDate: b.expDate ?? null,
            packing: b.packing ?? null,
          }))
        : []

      const singleBatch = batchOptions.length === 1 ? batchOptions[0] : null

      updatedOrders[index] = {
        ...currentOrder,
        quantity: currentOrder.quantity || 1,
        productForm: {
          ...currentOrder.productForm,
          productName: product.productName || "",
          description: product.description || "",
          category: product.category || { catId: 0, catName: "" },
          manufacturer: product.manufacturer || "",
          salePrice: product.salePrice || 0,
          purchasePrice: product.purchasePrice || 0,
          discountType: product.discountType || "percentage",
          saleDiscount: product.saleDiscount || 0,
          taxRate: product.taxRate || 5,
          mrp: singleBatch ? Number(singleBatch.mrp || 0) : Number(product.mrp || 0),
          hsn: product.hsn || 3004,
          batchNo: singleBatch ? singleBatch.batchNo || "" : product.batchNo || "",
          modelNo: product.modelNo || "",
          size: product.size || "",
          mfgDate: singleBatch?.mfgDate || product.mfgDate || "",
          expDate: singleBatch?.expDate || product.expDate || "",
          itemLocation: product.itemLocation || "",
          openingStockQuantity: product.openingStockQuantity || 0,
          minimumStockQuantity: product.minimumStockQuantity || 0,
          reorderQuantity: product.reorderQuantity || 0,
          reorderThreshold: product.reorderThreshold || 0,
          packagingSize: product.packagingSize || 1,
          unitId: product.unitId || 0,
          selectedUnitType: "base",
          refundable: product.refundable || "Y",
          productStatus: product.productStatus !== undefined ? product.productStatus : true,
          customerId: selectedCustomer?.customerProfileId || 0,
        },
        batchOptions: batchOptions,
      }
      return updatedOrders
    })
    // Reset wallet usage when a new product is selected
    setOrderInfo((prev) => ({
      ...prev,
      deductibleWalletAmount: 0,
    }))
  }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
    index: number
  ) => {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked

    setSaleOrders((prevOrders) => {
      const updatedOrders = prevOrders.map(createOrderCopy)
      const currentOrder = updatedOrders[index]
      if (!currentOrder) return prevOrders

      const currentForm = currentOrder.productForm

      if (type === "checkbox") {
        updatedOrders[index] = {
          ...currentOrder,
          productForm: {
            ...currentForm,
            [name]: checked,
          },
        }
      } else if (name.startsWith("category.")) {
        const categoryField = name.split(".")[1]
        if (!categoryField) return prevOrders

        updatedOrders[index] = {
          ...currentOrder,
          productForm: {
            ...currentForm,
            category: {
              ...currentForm.category,
              [categoryField]: categoryField === "catId" ? parseInt(value) : value,
            },
          },
        }
      } else if (name === "selectedUnitType") {
        updatedOrders[index] = {
          ...currentOrder,
          productForm: {
            ...currentForm,
            selectedUnitType: value === "secondary" ? "secondary" : "base",
          },
        }
      } else if (name === "quantity") {
        const parsedQty = parseInt(value) || 1
        updatedOrders[index] = {
          ...currentOrder,
          quantity: parsedQty,
        }
      } else {
        updatedOrders[index] = {
          ...currentOrder,
          productForm: {
            ...currentForm,
            [name]: type === "number" ? parseFloat(value) || 0 : value,
          },
        }
      }

      return updatedOrders
    })
  }

  const handleOrderInfoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked

    setOrderInfo((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  const handleWalletAmountChange = (amount: number) => {
    const maxWalletAmount = Math.min(amount, customerWalletBalance, calculationBreakdown.totalWithTax)
    setOrderInfo((prev) => ({
      ...prev,
      deductibleWalletAmount: maxWalletAmount,
    }))
  }

  const handleLinkPaymentChange = (checked: boolean) => {
    setOrderInfo((prev) => ({
      ...prev,
      linkPayment: checked ? "true" : "false",
      deductibleWalletAmount: checked
        ? Math.min(prev.deductibleWalletAmount, customerWalletBalance, calculationBreakdown.totalWithTax)
        : 0,
    }))
  }

  const handleCheckoutTypeChange = (checked: boolean) => {
    setOrderInfo((prev) => ({
      ...prev,
      checkoutType: checked ? "Express" : "", // Set to "Express" if checked, empty string if not
    }))
  }

  const handlePaymentStatusChange = (paymentStatusId: number) => {
    setOrderInfo((prev) => ({
      ...prev,
      paymentStatusId,
    }))

    // Update payment info status based on payment status
    let paymentStatus = "Paid"
    if (paymentStatusId === 2) {
      paymentStatus = "Partially Paid"
    } else if (paymentStatusId === 3) {
      paymentStatus = "Unpaid"
    }

    setPaymentInfo((prev) => ({
      ...prev,
      status: paymentStatus,
    }))

    // If changing to fully paid, set received amount to total amount minus wallet usage
    if (paymentStatusId === 1) {
      const walletAmount = orderInfo.linkPayment === "true" ? orderInfo.deductibleWalletAmount : 0
      const remainingAmount = Math.max(0, calculationBreakdown.totalWithTax - walletAmount)

      setPaymentInfo((prev) => ({
        ...prev,
        receivedAmount: remainingAmount,
        walletUsed: walletAmount,
        amount: remainingAmount,
      }))
      setOrderInfo((prev) => ({
        ...prev,
        paidAmount: remainingAmount,
      }))
    }
  }

  const handleReceivedAmountChange = (amount: number) => {
    setPaymentInfo((prev) => ({
      ...prev,
      receivedAmount: amount,
    }))
    setOrderInfo((prev) => ({
      ...prev,
      paidAmount: amount,
    }))
  }

  const addNewOrder = () => {
    setSaleOrders((prevOrders) => {
      // Minimize all existing orders
      const minimizedExistingOrders = prevOrders.map((order) => createOrderCopyWithMinimize(order, true))

      // Add new order at the beginning of the array
      const newOrder: SaleOrderItem = {
        productForm: {
          productName: "",
          description: "",
          category: { catId: 0, catName: "" },
          manufacturer: "",
          salePrice: 0,
          purchasePrice: 0,
          discountType: "percentage",
          saleDiscount: 0,
          taxRate: 5,
          mrp: 0,
          hsn: 3004,
          batchNo: "",
          modelNo: "",
          size: "",
          mfgDate: "",
          expDate: "",
          itemLocation: "",
          openingStockQuantity: 0,
          minimumStockQuantity: 0,
          reorderQuantity: 1,
          reorderThreshold: 0,
          packagingSize: 1,
          unitId: 0,
          refundable: "Y",
          productStatus: true,
          inclusiveOfTax: true,
          branch: 1,
          paymentCategory: "cash",
          type: "STOCK",
          paidAmount: "0",
          linkPayment: false,
          deductibleWalletAmount: 0,
          customerId: Number(selectedCustomer?.customerProfileId || 0),
        },
        quantity: 1,
        isMinimized: false,
      }

      setExpandedOrderIndex(0)
      return [newOrder, ...minimizedExistingOrders]
    })
  }

  const removeOrder = (index: number) => {
    if (saleOrders.length > 1) {
      setSaleOrders((prevOrders) => {
        const updatedOrders = prevOrders.filter((_, i) => i !== index)

        if (index === expandedOrderIndex) {
          setExpandedOrderIndex(0)
          if (updatedOrders.length > 0) {
            return updatedOrders.map((order, i) => (i === 0 ? createOrderCopyWithMinimize(order, false) : order))
          }
        } else if (index < expandedOrderIndex) {
          setExpandedOrderIndex(expandedOrderIndex - 1)
        }

        return updatedOrders
      })
    }
  }

  const toggleMinimizeOrder = (index: number) => {
    setSaleOrders((prevOrders) => {
      const targetOrder = prevOrders[index]
      if (!targetOrder) return prevOrders

      if (targetOrder.isMinimized) {
        // If we're expanding this order, minimize all others and expand this one
        const updatedOrders = prevOrders.map((order, i) => createOrderCopyWithMinimize(order, i !== index))
        setExpandedOrderIndex(index)
        return updatedOrders
      } else {
        // If we're minimizing this order
        const updatedOrders = prevOrders.map((order, i) =>
          i === index ? createOrderCopyWithMinimize(order, true) : order
        )
        setExpandedOrderIndex(-1)
        return updatedOrders
      }
    })
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError("")
    setApiError(null)
    setSuccess("")

    try {
      if (!selectedCustomer) {
        throw new Error("Please select a customer")
      }

      // Validate all required fields
      const invalidOrders = saleOrders.filter(
        (order) =>
          !order.productForm.productName ||
          !order.quantity ||
          order.quantity <= 0 ||
          !order.productForm.mrp ||
          order.productForm.mrp <= 0
      )

      if (invalidOrders.length > 0) {
        throw new Error("Please fill in all required fields: Product Name, Quantity, and MRP for all items")
      }

      // Validate wallet usage
      if (orderInfo.linkPayment === "true") {
        if (orderInfo.deductibleWalletAmount > customerWalletBalance) {
          throw new Error(`Wallet amount cannot exceed customer's wallet balance of ₹${customerWalletBalance}`)
        }
        if (orderInfo.deductibleWalletAmount > calculationBreakdown.totalWithTax) {
          throw new Error("Wallet amount cannot exceed total payable amount")
        }
        if (orderInfo.deductibleWalletAmount < 0) {
          throw new Error("Wallet amount cannot be negative")
        }
      }

      // Validate received amount for partially paid status
      if (orderInfo.paymentStatusId === 2) {
        const totalPaid = paymentInfo.receivedAmount + (paymentInfo.walletUsed || 0)
        if (totalPaid <= 0) {
          throw new Error("Total paid amount (wallet + received) must be greater than 0 for partially paid order")
        }
        if (totalPaid >= calculationBreakdown.totalWithTax) {
          throw new Error("Total paid amount must be less than total amount for partially paid order")
        }
      }

      // Prepare sale order items in the exact format required by the API
      const saleOrderItems = saleOrders.map((order) => {
        const quantity = order.quantity || 1
        const mrp = order.productForm.mrp || 0
        const taxRate = order.productForm.taxRate || 5
        const discountValue = order.productForm.saleDiscount || 0
        const unit = units.find((unit) => unit.unitId === order.productForm.unitId)
        const unitType = order.productForm.selectedUnitType === "secondary" ? unit?.secondaryUnit : unit?.baseUnit
        const packagingSize = order.productForm.packagingSize || 1

        // Calculate amounts using the correct formula with unit conversion
        const calculatedAmounts = calculateItemAmounts(
          mrp,
          quantity,
          taxRate,
          discountValue,
          unitType || "base",
          packagingSize
        )

        // Set discountType to null if no discount, otherwise "percentage"
        const discountType = discountValue > 0 ? "percentage" : null

        // Determine the API quantity based on unit type - THIS IS THE KEY FIX
        let apiQuantity = quantity

        if (unitType?.toLowerCase() === "tablet") {
          // For tablets: send actual tablet count as quantity
          apiQuantity = calculatedAmounts.actualTabletCount
        } else if (unitType?.toLowerCase() === "strip") {
          // For strips: send strip count as quantity
          apiQuantity = quantity // Keep the strip count
        }
        // For other units, use quantity as is

        // Create base item data
        const itemData: any = {
          itemName: order.productForm.productName,
          hsnCode: order.productForm.hsn?.toString() || "3004",
          description: order.productForm.description || "Product description",
          batchNo: order.productForm.batchNo || `BATCH-${Date.now()}`,
          mfg: order.productForm.manufacturer || "Manufacturer",
          expDate:
            order.productForm.expDate || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
          mfgDate: order.productForm.mfgDate || new Date().toISOString().split("T")[0],
          mrp: Number(mrp),
          packing: "S",
          quantity: Number(apiQuantity),
          discountType: discountType,
          discountValue: Number(discountValue),
          tax: Number(taxRate),
          unitName: unitType || "PCS",
          packagingSize: Number(packagingSize),
          price: calculatedAmounts.price,
          taxAmount: calculatedAmounts.taxAmount,
          amountWithoutTax: calculatedAmounts.amountWithoutTax,
          discountAmount: calculatedAmounts.discountAmount,
          amountWithDiscountWithoutTax: calculatedAmounts.amountWithDiscountWithoutTax,
          taxAfterDiscount: calculatedAmounts.taxAfterDiscount,
          totalPayableAmount: calculatedAmounts.totalPayableAmount,
        }

        // Only add numberOfPacks for tablet products when unit is TABLET
        if (unitType?.toLowerCase() === "tablet") {
          itemData.numberOfPacks = Number(calculatedAmounts.numberOfPacks.toFixed(4))
        }

        return itemData
      })

      // Calculate total order amounts
      const totalPrice = saleOrderItems.reduce((sum, item) => sum + item.price, 0)
      const totalPayableAmount = saleOrderItems.reduce((sum, item) => sum + item.totalPayableAmount, 0)

      // Calculate wallet usage and remaining amounts
      const walletAmount = orderInfo.linkPayment === "true" ? orderInfo.deductibleWalletAmount : 0
      const remainingAmount = Math.max(0, totalPayableAmount - walletAmount)

      // Prepare the complete request data - only include checkoutType if it has a value
      const requestData: any = {
        customerId: Number(selectedCustomer.customerProfileId),
        paymentStatusId: Number(orderInfo.paymentStatusId),
        paymentTypeId: Number(orderInfo.paymentTypeId),
        linkPayment: orderInfo.linkPayment, // This should be string "true" or "false"
        deductibleWalletAmount: Number(orderInfo.deductibleWalletAmount), // Fixed spelling
        paidAmount: Number(orderInfo.paidAmount),
        placeOfSupply: Number(orderInfo.placeOfSupply),
        orderStatus: orderInfo.orderStatus,
        extraDiscount: orderInfo.extraDiscount,
        upgradeSubscription: Boolean(orderInfo.upgradeSubscription),
        purchaseSubscription: Boolean(orderInfo.purchaseSubscription),
        // Add promoCode to the request data
        promoCode: orderInfo.promoCode || null,
        paymentInfo: {
          paymentType: paymentInfo.paymentType,
          amount: Number(remainingAmount.toFixed(2)), // This should be the remaining amount after wallet
          gstPercentage: Number(paymentInfo.gstPercentage),
          totalAmount: Number(totalPayableAmount.toFixed(2)),
          receivedAmount: Number(paymentInfo.receivedAmount),
          status: paymentInfo.status,
        },
        saleOrderItems: saleOrderItems,
      }

      // Only add checkoutType if it's not empty
      if (orderInfo.checkoutType) {
        requestData.checkoutType = orderInfo.checkoutType
      }

      console.log("Sending sales order data with unit conversion:", JSON.stringify(requestData, null, 2))

      // Dispatch the action and wait for the result
      const result = await dispatch(createSaleOrderAction(requestData))

      // If we get here, the action was successful
      const walletMessage = walletAmount > 0 ? ` (₹${walletAmount.toFixed(2)} paid from wallet)` : ""
      const promoMessage = orderInfo.promoCode ? ` with promo code: ${orderInfo.promoCode}` : ""
      const successMessage = `Successfully created sales order with ${saleOrders.length} product${
        saleOrders.length !== 1 ? "s" : ""
      }${promoMessage}! Order ID: ${result.saleOrderId}${walletMessage}`

      setSuccess(successMessage)
      notify("success", successMessage)

      // Reset form
      resetForm()
    } catch (err: any) {
      console.error("Error creating sales order:", err)

      // Check if this is an API error response with the structure we expect
      if (err.response?.data) {
        const apiErrorData = err.response.data

        // Handle different API error formats
        if (apiErrorData.errorMessage) {
          // This is the structured API error from your example
          setApiError(apiErrorData)
          setError(apiErrorData.errorMessage)
          notify("error", apiErrorData.errorMessage)
        } else if (apiErrorData.message) {
          // Alternative error format
          setError(apiErrorData.message)
          notify("error", apiErrorData.message)
        } else if (typeof apiErrorData === "string") {
          // Simple string error
          setError(apiErrorData)
          notify("error", apiErrorData)
        } else {
          // Fallback to generic error
          const errorMessage = err.message || "Failed to create sales order. Please check all fields and try again."
          setError(errorMessage)
          notify("error", errorMessage)
        }
      } else {
        // This is a client-side validation error or network error
        const errorMessage = err.message || "Failed to create sales order. Please check all fields and try again."
        setError(errorMessage)
        notify("error", errorMessage)
      }
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setSaleOrders([
      {
        productForm: {
          productName: "",
          description: "",
          category: { catId: 0, catName: "" },
          manufacturer: "",
          salePrice: 0,
          purchasePrice: 0,
          discountType: "percentage",
          saleDiscount: 0,
          taxRate: 5,
          mrp: 0,
          hsn: 3004,
          batchNo: "",
          modelNo: "",
          size: "",
          mfgDate: "",
          expDate: "",
          itemLocation: "",
          openingStockQuantity: 0,
          minimumStockQuantity: 0,
          reorderQuantity: 1,
          reorderThreshold: 0,
          packagingSize: 1,
          unitId: 0,
          refundable: "Y",
          productStatus: true,
          inclusiveOfTax: true,
          branch: 1,
          paymentCategory: "cash",
          type: "STOCK",
          paidAmount: "0",
          linkPayment: false,
          deductibleWalletAmount: 0,
          customerId: selectedCustomer?.customerProfileId || 0,
        },
        quantity: 1,
        isMinimized: false,
      },
    ])

    setExpandedOrderIndex(0)
    setPaymentInfo({
      paymentType: "Cash",
      amount: 0,
      gstPercentage: 5,
      totalAmount: 0,
      receivedAmount: 0,
      status: "Paid",
      walletUsed: 0,
    })
    setOrderInfo({
      paymentStatusId: 1,
      paymentTypeId: 1,
      linkPayment: "false",
      deductibleWalletAmount: 0,
      paidAmount: 0,
      placeOfSupply: 1,
      orderStatus: "Paid",
      extraDiscount: "false",
      checkoutType: "", // Reset to empty string
      upgradeSubscription: false,
      purchaseSubscription: false,
      promoCode: "", // Reset promoCode to empty string
    })
    setCalculationBreakdown({
      subtotal: 0,
      taxAmount: 0,
      totalWithTax: 0,
      discountAmount: 0,
      itemBreakdown: [],
    })
    setCustomerWalletBalance(0)
    setApiError(null)
  }

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.3,
      },
    },
  }

  const formVariants = {
    hidden: { height: 0, opacity: 0 },
    visible: {
      height: "auto",
      opacity: 1,
      transition: {
        duration: 0.4,
        ease: "easeInOut",
      },
    },
    exit: {
      height: 0,
      opacity: 0,
      transition: {
        duration: 0.3,
        ease: "easeInOut",
      },
    },
  }

  return (
    <>
      <DashboardNav />
      <section className="h-auto w-full bg-[#F4F9F8]">
        <div className="flex min-h-screen w-full">
          <div className="flex w-full flex-col">
            <div className="flex flex-col items-start">
              <div className="flex w-full">
                <div className="w-full p-4">
                  <div className="mb-6 flex items-center space-x-4">
                    <button
                      type="button"
                      onClick={() => router.back()}
                      className="flex size-9 items-center justify-center rounded-md border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                    >
                      <svg
                        width="1em"
                        height="1em"
                        viewBox="0 0 17 17"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="new-arrow-right rotate-180 transform"
                      >
                        <path
                          d="M9.1497 0.80204C9.26529 3.95101 13.2299 6.51557 16.1451 8.0308L16.1447 9.43036C13.2285 10.7142 9.37889 13.1647 9.37789 16.1971L7.27855 16.1978C7.16304 12.8156 10.6627 10.4818 13.1122 9.66462L0.049716 9.43565L0.0504065 7.33631L13.1129 7.56528C10.5473 6.86634 6.93261 4.18504 7.05036 0.80273L9.1497 0.80204Z"
                          fill="currentColor"
                        ></path>
                      </svg>
                    </button>
                    <div>
                      <h1 className="text-2xl font-bold text-slate-900 lg:text-2xl">Raise Sales Order</h1>
                    </div>
                  </div>

                  {error && (
                    <motion.div
                      className="mb-4 rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                    >
                      <div className="font-semibold">{error}</div>
                      {apiError && (
                        <div className="mt-2 text-sm">
                          {apiError.errorCode && <div>Error Code: {apiError.errorCode}</div>}
                          {apiError.errorType && <div>Error Type: {apiError.errorType}</div>}
                          {apiError.severity && <div>Severity: {apiError.severity}</div>}
                        </div>
                      )}
                    </motion.div>
                  )}

                  {success && (
                    <motion.div
                      className="mb-4 rounded border border-green-400 bg-green-100 px-4 py-3 text-green-700"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                    >
                      {success}
                    </motion.div>
                  )}

                  <motion.div
                    className="flex w-full items-start gap-6"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    {/* Customer Selection */}
                    <motion.div className="w-1/4 rounded-lg bg-white p-4 shadow" variants={itemVariants}>
                      <h2 className="mb-4 text-lg font-semibold">Select Customer</h2>

                      <div className="mb-4">
                        <SearchModule
                          value={searchText}
                          onChange={(e) => setSearchText(e.target.value)}
                          onCancel={handleCancelSearch}
                          placeholder="Search customers..."
                        />
                      </div>

                      <div className="max-h-96 overflow-y-auto">
                        {customersLoading ? (
                          <div className="py-4 text-center">Loading customers...</div>
                        ) : filteredCustomers.length > 0 ? (
                          filteredCustomers.map((customer) => (
                            <motion.div
                              key={customer.customerProfileId}
                              className={`mb-3 flex w-full cursor-pointer items-start justify-between rounded-md border p-3 hover:bg-gray-50 ${
                                selectedCustomer?.customerProfileId === customer.customerProfileId
                                  ? "border-blue-200 bg-blue-50"
                                  : ""
                              }`}
                              onClick={() => handleCustomerSelect(customer)}
                              whileHover={{ scale: 1.01 }}
                              whileTap={{ scale: 0.99 }}
                            >
                              <div>
                                <div className="font-medium">{customer.customerName}</div>
                                <div className="text-xs text-gray-600">{customer.customerEmail}</div>
                                <div className="text-xs text-gray-600">{customer.customerPhone}</div>
                              </div>
                              {customer.walletAmt > 0 && (
                                <div className="rounded-md bg-green-200 p-2 text-xs font-medium text-green-700">
                                  ₹{customer.walletAmt.toFixed(2)}
                                </div>
                              )}
                            </motion.div>
                          ))
                        ) : (
                          <div className="py-4 text-center">
                            {searchText ? "No matching customers found" : "No customers found"}
                          </div>
                        )}
                      </div>

                      {/* Order Information */}
                      {selectedCustomer && (
                        <motion.div
                          className="mt-6 border-t pt-4"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.2 }}
                        >
                          <h2 className="mb-4 text-lg font-semibold">Order Information</h2>

                          <div className="space-y-3">
                            <div>
                              <label className="mb-1 block text-sm font-medium">Payment Status</label>
                              <DropdownPopoverModule
                                label=""
                                options={[
                                  { value: "1", label: "Paid" },
                                  { value: "2", label: "Partially Paid" },
                                  { value: "3", label: "Unpaid" },
                                ]}
                                placeholder="Select Payment Status"
                                value={orderInfo.paymentStatusId.toString()}
                                onChange={(value) => handlePaymentStatusChange(parseInt(value))}
                              />
                            </div>

                            <div>
                              <label className="mb-1 block text-sm font-medium">Payment Type</label>
                              <DropdownPopoverModule
                                label=""
                                options={[
                                  { value: "Cash", label: "Cash" },
                                  { value: "Card", label: "Card" },
                                  { value: "UPI", label: "UPI" },
                                  { value: "Bank Transfer", label: "Bank Transfer" },
                                  { value: "Credit", label: "Credit" },
                                ]}
                                placeholder="Select Payment Type"
                                value={paymentInfo.paymentType}
                                onChange={(value) => setPaymentInfo({ ...paymentInfo, paymentType: value })}
                              />
                            </div>

                            {/* Promo Code Input */}
                            <div>
                              <FormInputModule
                                label="Promo Code"
                                type="text"
                                name="promoCode"
                                placeholder="Enter promo code (optional)"
                                value={orderInfo.promoCode}
                                onChange={(e) => setOrderInfo({ ...orderInfo, promoCode: e.target.value })}
                                className="w-full"
                              />
                            </div>

                            {/* Wallet Payment Section */}
                            {selectedCustomer.walletAmt > 0 && (
                              <div className="space-y-2 rounded-lg border border-blue-200 bg-blue-50 p-3">
                                <div className="flex items-center justify-between">
                                  <span className="text-sm font-medium text-blue-800">Wallet Payment</span>
                                  <div className="flex items-center">
                                    <input
                                      type="checkbox"
                                      name="linkPayment"
                                      checked={orderInfo.linkPayment === "true"}
                                      onChange={(e) => handleLinkPaymentChange(e.target.checked)}
                                      className="mr-2"
                                      id="linkPayment"
                                    />
                                    <label htmlFor="linkPayment" className="text-sm font-medium text-blue-800">
                                      Use Wallet
                                    </label>
                                  </div>
                                </div>

                                {orderInfo.linkPayment === "true" && (
                                  <div className="space-y-2">
                                    <div className="text-xs text-blue-600">
                                      Available Balance: ₹{customerWalletBalance.toFixed(2)}
                                    </div>
                                    <FormInputModule
                                      label="Wallet Amount to Use"
                                      type="number"
                                      name="deductibleWalletAmount"
                                      placeholder="Enter wallet amount"
                                      value={orderInfo.deductibleWalletAmount.toString()}
                                      onChange={(e) => handleWalletAmountChange(parseFloat(e.target.value) || 0)}
                                      className="w-full"
                                      helperText={`Max: ₹${Math.min(
                                        customerWalletBalance,
                                        calculationBreakdown.totalWithTax
                                      ).toFixed(2)}`}
                                    />
                                    {orderInfo.deductibleWalletAmount > 0 && (
                                      <div className="text-xs text-green-600">
                                        Remaining to pay: ₹
                                        {(calculationBreakdown.totalWithTax - orderInfo.deductibleWalletAmount).toFixed(
                                          2
                                        )}
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            )}

                            {orderInfo.paymentStatusId === 2 && (
                              <FormInputModule
                                label="Received Amount *"
                                type="number"
                                name="receivedAmount"
                                placeholder="Enter received amount"
                                value={paymentInfo.receivedAmount.toString()}
                                onChange={(e) => handleReceivedAmountChange(parseFloat(e.target.value) || 0)}
                                className="w-full"
                                helperText={`Total payable after wallet: ₹${(
                                  calculationBreakdown.totalWithTax - (paymentInfo.walletUsed || 0)
                                ).toFixed(2)}`}
                              />
                            )}

                            <FormInputModule
                              label="GST Percentage"
                              type="number"
                              name="gstPercentage"
                              placeholder="Enter GST percentage"
                              value={paymentInfo.gstPercentage.toString()}
                              onChange={(e) =>
                                setPaymentInfo({ ...paymentInfo, gstPercentage: parseFloat(e.target.value) || 0 })
                              }
                              className="w-full"
                            />

                            <FormInputModule
                              label="Total MRP"
                              type="text"
                              placeholder=""
                              value={`₹${(calculationBreakdown.subtotal || 0).toFixed(2)}`}
                              onChange={() => {}}
                              className="w-full"
                            />

                            <FormInputModule
                              label="Total Discount"
                              type="text"
                              placeholder=""
                              value={`-₹${(calculationBreakdown.discountAmount || 0).toFixed(2)}`}
                              onChange={() => {}}
                              className="w-full"
                            />

                            <FormInputModule
                              label="Final Tax Amount"
                              type="text"
                              placeholder=""
                              value={`₹${(calculationBreakdown.taxAmount || 0).toFixed(2)}`}
                              onChange={() => {}}
                              className="w-full"
                            />

                            <FormInputModule
                              label="Total Payable Amount"
                              type="text"
                              placeholder=""
                              value={`₹${paymentInfo.totalAmount.toFixed(2)}`}
                              onChange={() => {}}
                              className="w-full"
                            />

                            {paymentInfo.walletUsed && paymentInfo.walletUsed > 0 && (
                              <FormInputModule
                                label="Wallet Used"
                                type="text"
                                placeholder=""
                                value={`-₹${paymentInfo.walletUsed.toFixed(2)}`}
                                onChange={() => {}}
                                className="w-full"
                              />
                            )}

                            {orderInfo.paymentStatusId !== 2 && (
                              <FormInputModule
                                label="Received Amount"
                                type="number"
                                name="receivedAmount"
                                placeholder="Enter received amount"
                                value={paymentInfo.receivedAmount.toString()}
                                onChange={(e) =>
                                  setPaymentInfo({ ...paymentInfo, receivedAmount: parseFloat(e.target.value) || 0 })
                                }
                                className="w-full"
                              />
                            )}

                            <motion.button
                              type="button"
                              onClick={() => setShowBreakdown(!showBreakdown)}
                              className="w-full rounded bg-blue-100 px-4 py-2 text-blue-700 hover:bg-blue-200"
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              {showBreakdown ? "Hide" : "Show"} Detailed Calculation
                            </motion.button>

                            {showBreakdown && (
                              <motion.div
                                className="mt-4 border-t pt-4"
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                              >
                                <h3 className="mb-2 text-sm font-semibold">Detailed Calculation Breakdown</h3>
                                {calculationBreakdown.itemBreakdown.map((item, index) => (
                                  <div key={index} className="mb-3 border-b pb-2 text-xs">
                                    <div className="mb-1 font-medium">{item.productName}</div>
                                    <div className="grid grid-cols-2 gap-1">
                                      <div>MRP per unit: ₹{Number(item.mrp ?? 0).toFixed(2)}</div>
                                      <div>Quantity: {item.quantity}</div>
                                      <div>Tax Rate: {item.taxRate}%</div>
                                      <div>Discount: {item.discountValue > 0 ? `${item.discountValue}%` : "None"}</div>
                                      <div className="col-span-2 mt-1 border-t pt-1">
                                        <div>Total MRP: ₹{Number(item.price ?? 0).toFixed(2)}</div>
                                        <div>
                                          Tax in MRP: ₹
                                          {(
                                            (Number(item.price ?? 0) * Number(item.taxRate ?? 0)) /
                                              (100 + Number(item.taxRate ?? 0)) || 0
                                          ).toFixed(3)}
                                        </div>
                                        <div>Base Amount: ₹{Number(item.amountWithoutTax ?? 0).toFixed(3)}</div>
                                        {item.discountValue > 0 && (
                                          <>
                                            <div>Discount: -₹{Number(item.discountAmount ?? 0).toFixed(4)}</div>
                                            <div>
                                              Discounted Base: ₹
                                              {Number(item.amountWithDiscountWithoutTax ?? 0).toFixed(4)}
                                            </div>
                                          </>
                                        )}
                                        <div>Final Tax: ₹{Number(item.taxAfterDiscount ?? 0).toFixed(4)}</div>
                                        <div className="font-semibold">
                                          Total Payable: ₹{Number(item.totalPayableAmount ?? 0).toFixed(4)}
                                        </div>
                                        <div className="text-gray-500">
                                          Tablets: {item.actualTabletCount} | Strips: {item.numberOfPacks}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                                <div className="mt-2 border-t pt-2 text-sm">
                                  <div className="flex justify-between">
                                    <span>Total MRP:</span>
                                    <span>₹{(calculationBreakdown.subtotal || 0).toFixed(2)}</span>
                                  </div>
                                  {calculationBreakdown.discountAmount > 0 && (
                                    <div className="flex justify-between text-red-600">
                                      <span>Total Discount:</span>
                                      <span>-₹{(calculationBreakdown.discountAmount || 0).toFixed(2)}</span>
                                    </div>
                                  )}
                                  <div className="flex justify-between">
                                    <span>Final Tax:</span>
                                    <span>₹{(calculationBreakdown.taxAmount || 0).toFixed(2)}</span>
                                  </div>
                                  {paymentInfo.walletUsed && paymentInfo.walletUsed > 0 && (
                                    <div className="flex justify-between text-green-600">
                                      <span>Wallet Used:</span>
                                      <span>-₹{paymentInfo.walletUsed.toFixed(2)}</span>
                                    </div>
                                  )}
                                  <div className="flex justify-between border-t pt-1 font-semibold">
                                    <span>Total Payable:</span>
                                    <span>₹{(calculationBreakdown.totalWithTax || 0).toFixed(2)}</span>
                                  </div>
                                  {orderInfo.paymentStatusId === 2 && (
                                    <>
                                      <div className="flex justify-between text-blue-600">
                                        <span>Received Amount:</span>
                                        <span>₹{paymentInfo.receivedAmount.toFixed(2)}</span>
                                      </div>
                                      <div className="flex justify-between text-orange-600">
                                        <span>Pending Amount:</span>
                                        <span>
                                          ₹
                                          {(
                                            calculationBreakdown.totalWithTax -
                                            paymentInfo.receivedAmount -
                                            (paymentInfo.walletUsed || 0)
                                          ).toFixed(2)}
                                        </span>
                                      </div>
                                    </>
                                  )}
                                </div>
                              </motion.div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </motion.div>

                    {/* Product Selection and Form */}
                    <motion.div className="w-3/4" variants={itemVariants}>
                      <div className="mb-4 rounded-lg bg-white p-4 shadow">
                        <div className="mb-4 flex items-center justify-between">
                          <h2 className="text-lg font-semibold">Sales Orders</h2>
                          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <ButtonModule onClick={addNewOrder} variant="ghost" size="sm">
                              + Add Another Product
                            </ButtonModule>
                          </motion.div>
                        </div>

                        {selectedCustomer ? (
                          <div>
                            <p className="mb-2 text-sm text-gray-600">
                              Customer: <span className="font-medium">{selectedCustomer.customerName}</span>
                              {customerWalletBalance > 0 && (
                                <span className="ml-2 font-medium text-green-600">
                                  (Wallet: ₹{customerWalletBalance.toFixed(2)})
                                </span>
                              )}
                              {orderInfo.promoCode && (
                                <span className="ml-2 font-medium text-purple-600">
                                  (Promo Code: {orderInfo.promoCode})
                                </span>
                              )}
                            </p>
                            <p className="text-sm text-gray-600">
                              Total Payable:{" "}
                              <span className="font-semibold">
                                ₹{(calculationBreakdown.totalWithTax || 0).toFixed(2)}
                              </span>{" "}
                              {calculationBreakdown.discountAmount > 0 ? (
                                <>
                                  (MRP: ₹{(calculationBreakdown.subtotal || 0).toFixed(2)} - Discount: ₹
                                  {(calculationBreakdown.discountAmount || 0).toFixed(2)} + Tax: ₹
                                  {(calculationBreakdown.taxAmount || 0).toFixed(2)})
                                </>
                              ) : (
                                <>
                                  (MRP: ₹{(calculationBreakdown.subtotal || 0).toFixed(2)} + Tax: ₹
                                  {(calculationBreakdown.taxAmount || 0).toFixed(2)})
                                </>
                              )}
                              {paymentInfo.walletUsed && paymentInfo.walletUsed > 0 && (
                                <>
                                  {" "}
                                  | Wallet:{" "}
                                  <span className="font-semibold text-green-600">
                                    -₹{paymentInfo.walletUsed.toFixed(2)}
                                  </span>
                                </>
                              )}
                              {orderInfo.paymentStatusId === 2 && (
                                <>
                                  {" "}
                                  | Received:{" "}
                                  <span className="font-semibold text-blue-600">
                                    ₹{paymentInfo.receivedAmount.toFixed(2)}
                                  </span>{" "}
                                  | Pending:{" "}
                                  <span className="font-semibold text-orange-600">
                                    ₹
                                    {(
                                      calculationBreakdown.totalWithTax -
                                      paymentInfo.receivedAmount -
                                      (paymentInfo.walletUsed || 0)
                                    ).toFixed(2)}
                                  </span>
                                </>
                              )}
                            </p>
                          </div>
                        ) : (
                          <p className="mb-4 text-sm text-red-500">Please select a customer first</p>
                        )}
                      </div>

                      <AnimatePresence>
                        {saleOrders.map((order, index) => {
                          const quantity = order.quantity || 1
                          const mrp = order.productForm.mrp || 0
                          const taxRate = order.productForm.taxRate || 5
                          const discountValue = order.productForm.saleDiscount || 0
                          const unit = units.find((unit) => unit.unitId === order.productForm.unitId)
                          const unitType =
                            order.productForm.selectedUnitType === "secondary" ? unit?.secondaryUnit : unit?.baseUnit
                          const packagingSize = order.productForm.packagingSize || 1
                          const isTablet = unitType?.toLowerCase() === "tablet"
                          const isStrip = unitType?.toLowerCase() === "strip"

                          // Calculate item amounts with unit conversion
                          const calculatedAmounts =
                            order.calculatedAmounts ||
                            calculateItemAmounts(
                              mrp,
                              quantity,
                              taxRate,
                              discountValue,
                              unitType || "base",
                              packagingSize
                            )

                          return (
                            <motion.div
                              key={index}
                              className="relative mb-4 rounded-lg bg-white p-4 shadow"
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.3 }}
                              layout
                            >
                              <div className=" flex items-center justify-between">
                                <div>
                                  <h3 className="text-md font-medium">Product Name: {order.productForm.productName}</h3>
                                  <p className="mb-2 text-xs">{order.productForm.description}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                  <motion.button
                                    onClick={() => toggleMinimizeOrder(index)}
                                    className="text-gray-500 hover:text-gray-700"
                                    title={order.isMinimized ? "Expand" : "Minimize"}
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                  >
                                    {order.isMinimized ? (
                                      <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="size-5"
                                        viewBox="0 0 20 20"
                                        fill="currentColor"
                                      >
                                        <path
                                          fillRule="evenodd"
                                          d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                          clipRule="evenodd"
                                        />
                                      </svg>
                                    ) : (
                                      <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="size-5"
                                        viewBox="0 0 20 20"
                                        fill="CurrentColor"
                                      >
                                        <path
                                          fillRule="evenodd"
                                          d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z"
                                          clipRule="evenodd"
                                        />
                                      </svg>
                                    )}
                                  </motion.button>
                                  {saleOrders.length > 1 && (
                                    <motion.button
                                      onClick={() => removeOrder(index)}
                                      className="text-red-500 hover:text-red-700"
                                      title="Remove this product"
                                      whileHover={{ scale: 1.1 }}
                                      whileTap={{ scale: 0.9 }}
                                    >
                                      <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="size-5"
                                        viewBox="0 0 20 20"
                                        fill="currentColor"
                                      >
                                        <path
                                          fillRule="evenodd"
                                          d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                                          clipRule="evenodd"
                                        />
                                      </svg>
                                    </motion.button>
                                  )}
                                </div>
                              </div>

                              {/* Product Calculation Preview */}
                              <motion.div
                                className="mb-4 rounded bg-gray-50 p-3"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.1 }}
                              >
                                <div className="grid grid-cols-4 gap-2 text-sm">
                                  <div>
                                    <span className="font-medium">MRP:</span> ₹{Number(mrp ?? 0).toFixed(2)}
                                  </div>
                                  <div>
                                    <span className="font-medium">Qty:</span> {quantity} {unitType || "PCS"}
                                  </div>
                                  <div>
                                    <span className="font-medium">Discount:</span>{" "}
                                    {discountValue > 0 ? `${discountValue}%` : "None"}
                                  </div>
                                  <div>
                                    <span className="font-medium">Tax:</span> {taxRate}%
                                  </div>
                                </div>
                                <div className="mt-1 text-xs text-gray-600">
                                  Total MRP: ₹{calculatedAmounts.price.toFixed(2)} | Base: ₹
                                  {calculatedAmounts.amountWithoutTax.toFixed(3)}
                                  {discountValue > 0 && (
                                    <> | Discount: -₹{calculatedAmounts.discountAmount.toFixed(4)}</>
                                  )}
                                  | Final Tax: ₹{calculatedAmounts.taxAfterDiscount.toFixed(4)} | Payable: ₹
                                  {calculatedAmounts.totalPayableAmount.toFixed(4)}
                                  {isTablet && (
                                    <>
                                      {" "}
                                      | Tablets: {calculatedAmounts.actualTabletCount} | Strips:{" "}
                                      {calculatedAmounts.numberOfPacks}
                                    </>
                                  )}
                                  {isStrip && <> | Tablets: {calculatedAmounts.actualTabletCount}</>}
                                </div>
                              </motion.div>

                              <AnimatePresence>
                                {!order.isMinimized && (
                                  <motion.div variants={formVariants} initial="hidden" animate="visible" exit="exit">
                                    {/* Product Selection */}
                                    <div className="mb-6">
                                      <label className="mb-2 block text-sm font-medium">
                                        Select Product (Optional)
                                      </label>
                                      <DropdownPopoverModule
                                        label=""
                                        options={products.map((product) => {
                                          // Find the unit for this product
                                          const productUnit = units.find((unit) => unit.unitId === product.unitId)
                                          const baseUnit = productUnit?.baseUnit || "PCS"
                                          const secondaryUnit = productUnit?.secondaryUnit || ""

                                          // Create plain string label with stock information (used for search)
                                          let label = product.productName

                                          const hasUnitsAvailable =
                                            product.unitsAvailable !== undefined && product.unitsAvailable !== null
                                          const hasSubUnitsPerUnit =
                                            product.subUnitsPerUnit !== undefined && product.subUnitsPerUnit !== null

                                          if (hasUnitsAvailable || hasSubUnitsPerUnit) {
                                            label += ` (`
                                            if (hasUnitsAvailable) {
                                              label += `Units: ${product.unitsAvailable} ${baseUnit}`
                                            }
                                            if (hasSubUnitsPerUnit) {
                                              label += ` | Sub Units per Unit: ${product.subUnitsPerUnit}`
                                            }
                                            label += `)`
                                          }

                                          // Create JSX label so units and sub-units can be styled
                                          const nodeLabel = (
                                            <span>
                                              <span>{product.productName}</span>
                                              {(hasUnitsAvailable || hasSubUnitsPerUnit) && (
                                                <span className="ml-1 text-xs text-gray-600">
                                                  (
                                                  {hasUnitsAvailable && (
                                                    <span className="text-blue-600">
                                                      Units: {product.unitsAvailable} {baseUnit}
                                                    </span>
                                                  )}
                                                  {hasUnitsAvailable && hasSubUnitsPerUnit && <span> | </span>}
                                                  {hasSubUnitsPerUnit && (
                                                    <span className="text-emerald-600">
                                                      Sub Units per Unit: {product.subUnitsPerUnit}
                                                    </span>
                                                  )}
                                                  )
                                                </span>
                                              )}
                                            </span>
                                          )

                                          return {
                                            value: product.productId.toString(),
                                            label: label,
                                            nodeLabel: nodeLabel,
                                          }
                                        })}
                                        placeholder="Select a product to auto-fill details"
                                        value={
                                          products
                                            .find((p) => p.productName === order.productForm.productName)
                                            ?.productId.toString() || ""
                                        }
                                        onChange={(value) => {
                                          const productId = parseInt(value)
                                          const product = products.find((p) => p.productId === productId)
                                          if (product) handleProductSelect(product, index)
                                        }}
                                      />
                                      <div className="mt-1 text-xs text-gray-500">
                                        Products show available units and sub-units conversion where applicable
                                      </div>
                                    </div>

                                    {/* Product Form */}
                                    <div className="space-y-4">
                                      <div className="grid grid-cols-4 gap-4">
                                        <FormInputModule
                                          label="Product Name *"
                                          type="text"
                                          name="productName"
                                          placeholder="Enter product name"
                                          value={order.productForm.productName}
                                          onChange={(e) => handleInputChange(e, index)}
                                          className="w-full"
                                        />

                                        <FormInputModule
                                          label="Quantity *"
                                          type="number"
                                          name="quantity"
                                          placeholder="Enter quantity"
                                          value={order.quantity?.toString() || "1"}
                                          onChange={(e) => handleInputChange(e, index)}
                                          className="w-full"
                                        />

                                        <FormInputModule
                                          label="MRP *"
                                          type="number"
                                          name="mrp"
                                          placeholder="Enter MRP"
                                          value={order.productForm.mrp.toString()}
                                          onChange={(e) => handleInputChange(e, index)}
                                          className="w-full"
                                        />

                                        <FormInputModule
                                          label="Tax Rate (%) *"
                                          type="number"
                                          name="taxRate"
                                          placeholder="Enter tax rate"
                                          value={order.productForm.taxRate.toString()}
                                          onChange={(e) => handleInputChange(e, index)}
                                          className="w-full"
                                        />
                                      </div>

                                      <div className="hidden">
                                        <label className="mb-1 block text-sm font-medium">Description</label>
                                        <textarea
                                          name="description"
                                          value={order.productForm.description}
                                          onChange={(e) => handleInputChange(e, index)}
                                          className="w-full rounded border bg-white p-2 "
                                          rows={2}
                                        />
                                      </div>

                                      <div className="grid grid-cols-4 gap-4">
                                        <FormInputModule
                                          label="Manufacturer"
                                          type="text"
                                          name="manufacturer"
                                          placeholder="Enter manufacturer"
                                          value={order.productForm.manufacturer}
                                          onChange={(e) => handleInputChange(e, index)}
                                          className="w-full"
                                        />

                                        <div className="hidden">
                                          <DropdownPopoverModule
                                            label="Category"
                                            options={[
                                              { value: "0", label: "Select Category" },
                                              ...categories.map((category) => ({
                                                value: category.catId.toString(),
                                                label: category.catName,
                                              })),
                                            ]}
                                            placeholder="Select Category"
                                            value={order.productForm.category.catId.toString()}
                                            onChange={(value) => {
                                              const catId = parseInt(value)
                                              const category = categories.find((cat) => cat.catId === catId)

                                              if (category) {
                                                setSaleOrders((prevOrders) => {
                                                  const updatedOrders = prevOrders.map(createOrderCopy)
                                                  const currentOrder = updatedOrders[index]
                                                  if (!currentOrder) return prevOrders

                                                  updatedOrders[index] = {
                                                    ...currentOrder,
                                                    productForm: {
                                                      ...currentOrder.productForm,
                                                      category: {
                                                        catId: category.catId,
                                                        catName: category.catName,
                                                      },
                                                    },
                                                  }
                                                  return updatedOrders
                                                })
                                              }
                                            }}
                                            className="w-full"
                                          />
                                        </div>

                                        <div>
                                          <label className="mb-1 block text-sm font-medium">Unit</label>
                                          <DropdownPopoverModule
                                            label=""
                                            options={(function () {
                                              const unit = units.find((u) => u.unitId === order.productForm.unitId)
                                              const opts: { value: string; label: string }[] = []
                                              if (unit?.baseUnit) opts.push({ value: "base", label: unit.baseUnit })
                                              if (unit?.secondaryUnit)
                                                opts.push({ value: "secondary", label: unit.secondaryUnit })
                                              return opts
                                            })()}
                                            placeholder="Select Unit"
                                            value={
                                              order.productForm.unitId ? order.productForm.selectedUnitType || "" : ""
                                            }
                                            onChange={(value) => {
                                              setSaleOrders((prevOrders) => {
                                                const updatedOrders = prevOrders.map(createOrderCopy)
                                                const currentOrder = updatedOrders[index]
                                                if (!currentOrder) return prevOrders

                                                updatedOrders[index] = {
                                                  ...currentOrder,
                                                  productForm: {
                                                    ...currentOrder.productForm,
                                                    selectedUnitType: value as "base" | "secondary",
                                                  },
                                                }
                                                return updatedOrders
                                              })
                                            }}
                                            className="w-full"
                                          />
                                          {unitsLoading && (
                                            <p className="mt-1 text-xs text-gray-500">Loading units...</p>
                                          )}
                                        </div>

                                        <FormInputModule
                                          label="Discount (%)"
                                          type="number"
                                          name="saleDiscount"
                                          placeholder="Enter discount"
                                          value={order.productForm.saleDiscount.toString()}
                                          onChange={(e) => handleInputChange(e, index)}
                                          className="w-full"
                                        />
                                        <FormInputModule
                                          label="HSN Code"
                                          type="number"
                                          name="hsn"
                                          placeholder="Enter HSN code"
                                          value={order.productForm.hsn.toString()}
                                          onChange={(e) => handleInputChange(e, index)}
                                          className="w-full"
                                        />
                                      </div>
                                      {order.batchOptions && order.batchOptions.length > 1 && (
                                        <div>
                                          <label className="mb-1 block text-sm font-medium">Choose Batch</label>
                                          <DropdownPopoverModule
                                            label=""
                                            options={order.batchOptions.map((b) => ({
                                              value: b.batchNo || "",
                                              label: `${b.batchNo || "N/A"} | MRP ₹${Number(b.mrp || 0).toFixed(2)}${
                                                b.expDate ? ` | Exp ${b.expDate}` : ""
                                              }${b.packing ? ` | ${b.packing}` : ""}`,
                                            }))}
                                            placeholder="Select batch"
                                            value={order.productForm.batchNo || ""}
                                            onChange={(value) => {
                                              setSaleOrders((prevOrders) => {
                                                const updatedOrders = prevOrders.map(createOrderCopy)
                                                const currentOrder = updatedOrders[index]
                                                if (!currentOrder) return prevOrders

                                                const selectedBatch = (currentOrder.batchOptions || []).find(
                                                  (b) => (b.batchNo || "") === value
                                                )

                                                updatedOrders[index] = {
                                                  ...currentOrder,
                                                  productForm: {
                                                    ...currentOrder.productForm,
                                                    batchNo: value,
                                                    mrp: Number(
                                                      selectedBatch?.mrp || currentOrder.productForm.mrp || 0
                                                    ),
                                                    mfgDate: selectedBatch?.mfgDate || currentOrder.productForm.mfgDate,
                                                    expDate: selectedBatch?.expDate || currentOrder.productForm.expDate,
                                                  },
                                                }
                                                return updatedOrders
                                              })
                                            }}
                                            className="w-full"
                                          />
                                        </div>
                                      )}
                                      <div className="grid grid-cols-4 gap-4">
                                        <FormInputModule
                                          label="Batch Number"
                                          type="text"
                                          name="batchNo"
                                          placeholder="Enter batch number"
                                          value={order.productForm.batchNo}
                                          onChange={(e) => handleInputChange(e, index)}
                                          className="w-full"
                                        />

                                        <div className="flex w-full flex-col">
                                          <label className="mb-1 block text-sm font-medium">Manufacturing Date</label>
                                          <DatePicker
                                            selected={
                                              order.productForm.mfgDate ? new Date(order.productForm.mfgDate) : null
                                            }
                                            onChange={(date) => handleMfgDateChange(date, index)}
                                            dateFormat="yyyy-MM-dd"
                                            placeholderText="Select manufacturing date"
                                            className="w-full rounded border border-gray-300 bg-white p-2"
                                          />
                                        </div>

                                        <div className="flex w-full flex-col">
                                          <label className="mb-1 block text-sm font-medium">Expiry Date</label>
                                          <DatePicker
                                            selected={
                                              order.productForm.expDate ? new Date(order.productForm.expDate) : null
                                            }
                                            onChange={(date) => handleExpDateChange(date, index)}
                                            dateFormat="yyyy-MM-dd"
                                            placeholderText="Select expiry date"
                                            className="w-full rounded border border-gray-300 bg-white p-2"
                                          />
                                        </div>
                                        <FormInputModule
                                          label="Packaging Size"
                                          type="number"
                                          name="packagingSize"
                                          placeholder="Enter packaging size"
                                          value={order.productForm.packagingSize.toString()}
                                          onChange={(e) => handleInputChange(e, index)}
                                          className="w-full"
                                        />
                                      </div>

                                      <div className="grid grid-cols-1 gap-4">
                                        <FormInputModule
                                          label="Item Location"
                                          type="text"
                                          name="itemLocation"
                                          placeholder="Enter item location"
                                          value={order.productForm.itemLocation}
                                          onChange={(e) => handleInputChange(e, index)}
                                          className="w-full"
                                        />

                                        {/* <FormInputModule
                                          label="Purchase Price"
                                          type="number"
                                          name="purchasePrice"
                                          placeholder="Enter purchase price"
                                          value={order.productForm.purchasePrice.toString()}
                                          onChange={(e) => handleInputChange(e, index)}
                                          className="w-full"
                                        /> */}

                                        <FormInputModule
                                          label="Model No"
                                          type="text"
                                          name="modelNo"
                                          placeholder="Enter model number"
                                          value={order.productForm.modelNo}
                                          onChange={(e) => handleInputChange(e, index)}
                                          className="hidden w-full"
                                        />
                                      </div>

                                      <div className="flex items-center">
                                        <input
                                          type="checkbox"
                                          name="productStatus"
                                          checked={order.productForm.productStatus}
                                          onChange={(e) => handleInputChange(e, index)}
                                          className="mr-2 bg-white"
                                          id={`productStatus-${index}`}
                                        />
                                        <label htmlFor={`productStatus-${index}`} className="text-sm font-medium">
                                          Product Active
                                        </label>
                                      </div>

                                      <div className="flex items-center">
                                        <input
                                          type="checkbox"
                                          name="inclusiveOfTax"
                                          checked={order.productForm.inclusiveOfTax}
                                          onChange={(e) => handleInputChange(e, index)}
                                          className="mr-2 bg-white"
                                          id={`inclusiveOfTax-${index}`}
                                        />
                                        <label htmlFor={`inclusiveOfTax-${index}`} className="text-sm font-medium">
                                          Price Inclusive of Tax
                                        </label>
                                      </div>

                                      {/* Added Checkout Type Checkbox */}
                                      <div className="flex items-center">
                                        <input
                                          type="checkbox"
                                          name="checkoutType"
                                          checked={orderInfo.checkoutType === "Express"}
                                          onChange={(e) => handleCheckoutTypeChange(e.target.checked)}
                                          className="mr-2 bg-white"
                                          id={`checkoutType-${index}`}
                                        />
                                        <label htmlFor={`checkoutType-${index}`} className="text-sm font-medium">
                                          Express Checkout
                                        </label>
                                      </div>
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </motion.div>
                          )
                        })}
                      </AnimatePresence>

                      <motion.div
                        className="mt-4 rounded-lg bg-white p-4 shadow"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-600">
                              {saleOrders.length} product{saleOrders.length !== 1 ? "s" : ""} in this order
                            </p>
                            <p className="text-sm font-semibold">
                              Total MRP: ₹{(calculationBreakdown.subtotal || 0).toFixed(2)}
                            </p>
                            {calculationBreakdown.discountAmount > 0 && (
                              <p className="text-sm font-semibold text-red-600">
                                Total Discount: -₹{(calculationBreakdown.discountAmount || 0).toFixed(2)}
                              </p>
                            )}
                            <p className="text-sm font-semibold">
                              Final Tax: ₹{(calculationBreakdown.taxAmount || 0).toFixed(2)}
                            </p>
                            {paymentInfo.walletUsed && paymentInfo.walletUsed > 0 && (
                              <p className="text-sm font-semibold text-green-600">
                                Wallet Used: -₹{paymentInfo.walletUsed.toFixed(2)}
                              </p>
                            )}
                            {orderInfo.promoCode && (
                              <p className="text-sm font-semibold text-purple-600">Promo Code: {orderInfo.promoCode}</p>
                            )}
                            <p className="text-lg font-bold text-green-700">
                              Total Payable: ₹{(calculationBreakdown.totalWithTax || 0).toFixed(2)}
                            </p>
                            {orderInfo.paymentStatusId === 2 && (
                              <>
                                <p className="text-sm font-semibold text-blue-600">
                                  Received Amount: ₹{paymentInfo.receivedAmount.toFixed(2)}
                                </p>
                                <p className="text-sm font-semibold text-orange-600">
                                  Pending Amount: ₹
                                  {(
                                    calculationBreakdown.totalWithTax -
                                    paymentInfo.receivedAmount -
                                    (paymentInfo.walletUsed || 0)
                                  ).toFixed(2)}
                                </p>
                              </>
                            )}
                          </div>
                          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <ButtonModule
                              onClick={handleSubmit}
                              variant="primary"
                              size="md"
                              disabled={loading || !selectedCustomer}
                            >
                              {loading ? "Creating..." : `Create Sales Order`}
                            </ButtonModule>
                          </motion.div>
                        </div>
                      </motion.div>
                    </motion.div>
                  </motion.div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

export default RaiseSalesOrder
