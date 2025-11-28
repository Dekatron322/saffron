"use client"

import DashboardNav from "components/Navbar/DashboardNav"
import { ButtonModule } from "components/ui/Button/Button"
import { SearchModule } from "components/ui/Search/search-module"
import { useParams, useRouter } from "next/navigation"
import React, { useEffect, useState } from "react"
import { useAppDispatch, useAppSelector } from "app/api/store/store"
import { fetchAllSuppliers, selectSuppliers } from "app/api/store/supplierSlice"
import { fetchAllCategories, fetchAllProducts, selectCategories, selectProducts } from "app/api/store/productSlice"
import {
  fetchPurchaseOrderById,
  selectCurrentPurchaseOrder,
  selectCurrentPurchaseOrderError,
  selectCurrentPurchaseOrderLoading,
  selectUpdatePurchaseOrderError,
  selectUpdatingPurchaseOrder,
  updatePurchaseOrder,
} from "app/api/store/purchaseSlice"
import { FormInputModule } from "components/ui/Input/Input"
import { DropdownPopoverModule } from "components/ui/Input/DropdownModule"
import { AnimatePresence, motion } from "framer-motion"
import { NotificationProvider, notify } from "components/ui/Notification/Notification"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import { fetchAllUnits, selectUnits } from "app/api/store/unitSlice"

interface ProductFormData {
  batchNo: string
  productName: string
  description: string
  category: {
    catId: number
    catName: string
  }
  batchDetails: {
    mrp: string
    batchNo: string
    mfg: string
    mfgDate: string
    expDate: string
    packing: string
  }
  supplierId: number
  manufacturer: string
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
  branch: number
  modelNo: string
  size: string
  mfgDate: string
  expDate: string
  mrp: number
  hsn: number
  reorderQuantity: number
  currentStockLevel: number
  reorderThreshold: number
  packagingSize: number
  unitId: number
  refundable: string
  productStatus: boolean
  paymentCategory: string
  type: string
  paidAmount: string
  linkPayment: boolean
  deductibleWalletAmount: number
}

interface DiscountDto {
  discountType: string
  discountValue: number
  discountedAmount: number
}

interface PaymentInfo {
  paymentType: string
  totalAmount: string
  totalAmountWithTax: string
  paidAmount: string
  linkPayment: boolean
  deductibleWalletAmount: number
}

interface PurchaseOrderItem {
  productForm: ProductFormData
  quantity?: number
  subtotal?: number
  taxAmount?: number
  total?: number
  discountAmount?: number
  isMinimized?: boolean
}

interface CalculationBreakdown {
  subtotal: number
  taxAmount: number
  totalWithTax: number
  discountAmount: number
  itemBreakdown: Array<{
    productName: string
    quantity: number
    purchasePrice: number
    taxRate: number
    discountType: string
    discountValue: number
    discountAmount: number
    subtotal: number
    taxAmount: number
    total: number
  }>
}

const EditPurchaseOrder = () => {
  const router = useRouter()
  const params = useParams()
  const dispatch = useAppDispatch()
  const purchaseOrderId = params.id ? parseInt(params.id as string) : null

  // Redux state selectors
  const { suppliers, loading: suppliersLoading } = useAppSelector(selectSuppliers)
  const { products, loading: productsLoading } = useAppSelector(selectProducts)
  const { categories, loading: categoriesLoading } = useAppSelector(selectCategories)
  const { units, loading: unitsLoading } = useAppSelector(selectUnits)
  const currentPurchaseOrder = useAppSelector(selectCurrentPurchaseOrder)
  const currentLoading = useAppSelector(selectCurrentPurchaseOrderLoading)
  const currentError = useAppSelector(selectCurrentPurchaseOrderError)
  const updating = useAppSelector(selectUpdatingPurchaseOrder)
  const updateError = useAppSelector(selectUpdatePurchaseOrderError)
  const [filteredSuppliers, setFilteredSuppliers] = useState<any[]>([])

  const [searchText, setSearchText] = useState("")
  const [selectedSupplier, setSelectedSupplier] = useState<any>(null)
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrderItem[]>([])
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo>({
    paymentType: "CASH",
    totalAmount: "0",
    totalAmountWithTax: "0",
    paidAmount: "0",
    linkPayment: false,
    deductibleWalletAmount: 0,
  })

  const [discountDto, setDiscountDto] = useState<DiscountDto>({
    discountType: "Percentage",
    discountValue: 0,
    discountedAmount: 0,
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
  const [success, setSuccess] = useState("")
  const [showBreakdown, setShowBreakdown] = useState(false)
  const [expandedOrderIndex, setExpandedOrderIndex] = useState<number>(0)

  useEffect(() => {
    dispatch(fetchAllSuppliers())
    dispatch(fetchAllProducts(0, 100))
    dispatch(fetchAllCategories())
    dispatch(fetchAllUnits())

    if (purchaseOrderId) {
      dispatch(fetchPurchaseOrderById(purchaseOrderId))
    }
  }, [dispatch, purchaseOrderId])

  useEffect(() => {
    if (currentPurchaseOrder) {
      // Set selected supplier
      const supplier = suppliers.find((s) => s.id === currentPurchaseOrder.supplierId)
      if (supplier) {
        setSelectedSupplier(supplier)
      }

      // Calculate total amount with tax from purchase order items if not provided
      const calculatedTotalWithTax =
        currentPurchaseOrder.totalAmountWithTax ||
        calculateTotalWithTaxFromItems(currentPurchaseOrder.purchaseOrderItems)

      // Set payment info
      setPaymentInfo({
        paymentType: currentPurchaseOrder.paymentCategory || "CASH",
        totalAmount: currentPurchaseOrder.totalAmount.toString(),
        totalAmountWithTax: calculatedTotalWithTax.toString(),
        paidAmount: currentPurchaseOrder.paidAmount?.toString() || "0",
        linkPayment: currentPurchaseOrder.linkPayment || false,
        deductibleWalletAmount: currentPurchaseOrder.deductibleWalletAmount || 0,
      })

      // Set discount DTO if available, otherwise calculate from discount
      if (currentPurchaseOrder.discountDto) {
        setDiscountDto(currentPurchaseOrder.discountDto)
      } else if (currentPurchaseOrder.discount && currentPurchaseOrder.discount > 0) {
        // Calculate discount DTO from discount percentage
        const discountValue = currentPurchaseOrder.discount
        const subtotal = currentPurchaseOrder.totalAmount
        const discountedAmount = (subtotal * discountValue) / 100

        setDiscountDto({
          discountType: "Percentage",
          discountValue: discountValue,
          discountedAmount: discountedAmount,
        })
      } else {
        // Initialize with default values
        setDiscountDto({
          discountType: "Percentage",
          discountValue: 0,
          discountedAmount: 0,
        })
      }

      // Transform purchase order items to form data
      const transformedOrders: PurchaseOrderItem[] = currentPurchaseOrder.purchaseOrderItems.map((item, index) => {
        // Get the category from your categories list based on categoryId
        const categoryId = item.itemDetails?.categoryId || 0
        const category = categories.find((cat) => cat.catId === categoryId) || { catId: 0, catName: "" }

        return {
          productForm: {
            productName: item.itemDetails?.productName || "",
            description: item.itemDetails?.description || "",
            category: {
              catId: category.catId,
              catName: category.catName,
            },
            batchDetails: {
              mrp: item.itemDetails?.batchDetails?.mrp || "0",
              batchNo: item.itemDetails?.batchDetails?.batchNo || "",
              mfg: item.itemDetails?.batchDetails?.mfg || "",
              mfgDate: item.itemDetails?.batchDetails?.mfgDate || "",
              expDate: item.itemDetails?.batchDetails?.expDate || "",
              packing: item.itemDetails?.batchDetails?.packing || "Box",
            },
            supplierId: currentPurchaseOrder.supplierId,
            manufacturer: item.itemDetails?.manufacturer || "",
            defaultMRP: item.itemDetails?.defaultMRP || 0,
            salePrice: item.itemDetails?.salePrice || 0,
            purchasePrice: item.unitPrice,
            discountType: item.itemDetails?.discountType || "Percentage",
            saleDiscount: item.itemDetails?.saleDiscount || 0,
            openingStockQuantity: item.quantity,
            minimumStockQuantity: item.itemDetails?.minimumStockQuantity || 0,
            itemLocation: item.itemDetails?.itemLocation || "",
            taxRate: item.itemDetails?.taxRate || 0,
            inclusiveOfTax: item.itemDetails?.inclusiveOfTax || false,
            branch: item.itemDetails?.branch || 1,
            modelNo: item.itemDetails?.modelNo || "",
            size: item.itemDetails?.size || "",
            mfgDate: item.itemDetails?.mfgDate || "",
            expDate: item.itemDetails?.expDate || "",
            mrp: item.itemDetails?.mrp || 0,
            hsn: item.itemDetails?.hsn || 0,
            reorderQuantity: item.itemDetails?.reorderQuantity || 0,
            currentStockLevel: item.itemDetails?.currentStockLevel || 0,
            reorderThreshold: item.itemDetails?.reorderThreshold || 0,
            packagingSize: item.itemDetails?.packagingSize || 1,
            unitId: item.itemDetails?.unitId || 0,
            refundable: item.itemDetails?.refundable || "Y",
            productStatus: item.itemDetails?.productStatus !== undefined ? item.itemDetails.productStatus : true,
            paymentCategory: currentPurchaseOrder.paymentCategory || "cash",
            type: currentPurchaseOrder.type || "STOCK",
            paidAmount: currentPurchaseOrder.paidAmount?.toString() || "0",
            linkPayment: currentPurchaseOrder.linkPayment || false,
            deductibleWalletAmount: currentPurchaseOrder.deductibleWalletAmount || 0,
            batchNo: item.itemDetails?.batchNo || "",
          },
          quantity: item.quantity,
          isMinimized: index !== 0, // Only expand the first item initially
        }
      })

      setPurchaseOrders(transformedOrders)
      setExpandedOrderIndex(0)
    }
  }, [currentPurchaseOrder, suppliers, categories])

  // Helper function to calculate total with tax from purchase order items
  const calculateTotalWithTaxFromItems = (items: any[]) => {
    let totalWithTax = 0

    items.forEach((item) => {
      const quantity = item.quantity || 1
      const unitPrice = item.unitPrice || 0
      const taxRate = item.itemDetails?.taxRate || 0

      const subtotal = unitPrice * quantity
      const taxAmount = subtotal * (taxRate / 100)
      totalWithTax += subtotal + taxAmount
    })

    return totalWithTax
  }

  // Fixed calculation logic - order discount should be calculated from final amount with tax
  const calculateTotals = () => {
    let subtotal = 0
    let taxAmount = 0
    let totalWithTax = 0
    let totalDiscountAmount = 0
    const itemBreakdown: CalculationBreakdown["itemBreakdown"] = []

    purchaseOrders.forEach((order, index) => {
      const quantity = order.quantity || 1
      const purchasePrice = order.productForm.purchasePrice || 0
      const taxRate = order.productForm.taxRate || 0
      const discountType = order.productForm.discountType || "Percentage"
      const discountValue = order.productForm.saleDiscount || 0

      // Calculate item subtotal
      const itemSubtotal = purchasePrice * quantity

      // Calculate discount amount
      let itemDiscountAmount = 0
      if (discountType === "Percentage") {
        itemDiscountAmount = itemSubtotal * (discountValue / 100)
      } else {
        itemDiscountAmount = discountValue // Fixed amount, not multiplied by quantity
      }

      // Calculate taxable amount after discount
      const taxableAmount = itemSubtotal - itemDiscountAmount

      // Calculate tax and total
      const itemTaxAmount = taxableAmount * (taxRate / 100)
      const itemTotal = taxableAmount + itemTaxAmount

      subtotal += itemSubtotal
      taxAmount += itemTaxAmount
      totalWithTax += itemTotal
      totalDiscountAmount += itemDiscountAmount

      itemBreakdown.push({
        productName: order.productForm.productName || `Product ${index + 1}`,
        quantity,
        purchasePrice,
        taxRate,
        discountType,
        discountValue,
        discountAmount: itemDiscountAmount,
        subtotal: itemSubtotal,
        taxAmount: itemTaxAmount,
        total: itemTotal,
      })
    })

    // Calculate order-level discount (this should be calculated from the final amount with tax)
    let orderDiscount = 0
    if (discountDto.discountValue > 0) {
      if (discountDto.discountType === "Percentage") {
        // Apply order discount to the final amount with tax
        orderDiscount = totalWithTax * (discountDto.discountValue / 100)
      } else {
        orderDiscount = discountDto.discountValue
      }
    }

    // Calculate final amount after ALL discounts
    const finalTotalWithTax = Math.max(0, totalWithTax - orderDiscount)

    setCalculationBreakdown({
      subtotal,
      taxAmount,
      totalWithTax: finalTotalWithTax, // Final amount after ALL discounts and tax
      discountAmount: totalDiscountAmount + orderDiscount, // Total of all discounts (item + order)
      itemBreakdown,
    })

    setPaymentInfo((prev) => ({
      ...prev,
      totalAmount: subtotal.toFixed(2),
      totalAmountWithTax: finalTotalWithTax.toFixed(2),
      paidAmount: finalTotalWithTax.toFixed(2),
    }))

    // Update discount DTO with the calculated order discount amount
    if (discountDto.discountValue > 0) {
      setDiscountDto((prev) => ({
        ...prev,
        discountedAmount: orderDiscount,
      }))
    }
  }

  useEffect(() => {
    calculateTotals()
  }, [purchaseOrders, discountDto])

  const handleMfgDateChange = (date: Date | null, index: number) => {
    const updatedOrders = [...purchaseOrders]
    const currentOrder = updatedOrders[index]
    if (!currentOrder) return

    updatedOrders[index] = {
      ...currentOrder,
      productForm: {
        ...currentOrder.productForm,
        mfgDate: date ? date.toISOString().split("T")[0] ?? "" : "",
      },
    }
    setPurchaseOrders(updatedOrders)
  }

  const handleExpDateChange = (date: Date | null, index: number) => {
    const updatedOrders = [...purchaseOrders]
    const currentOrder = updatedOrders[index]
    if (!currentOrder) return

    updatedOrders[index] = {
      ...currentOrder,
      productForm: {
        ...currentOrder.productForm,
        expDate: date ? date.toISOString().split("T")[0] ?? "" : "",
      },
    }
    setPurchaseOrders(updatedOrders)
  }

  const handleDiscountDtoChange = (field: keyof DiscountDto, value: string | number) => {
    setDiscountDto((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleCancelSearch = () => {
    setSearchText("")
  }

  const handleSupplierSelect = (supplier: any) => {
    setSelectedSupplier(supplier)
    const updatedOrders = purchaseOrders.map((order) => ({
      ...order,
      productForm: {
        ...order.productForm,
        supplierId: supplier.id,
      },
    }))
    setPurchaseOrders(updatedOrders)
  }

  const handleProductSelect = (product: any, index: number) => {
    const updatedOrders = [...purchaseOrders]
    const currentOrder = updatedOrders[index]

    if (!currentOrder) return

    updatedOrders[index] = {
      ...currentOrder,
      quantity: currentOrder.quantity || 1,
      productForm: {
        ...currentOrder.productForm,
        productName: product.productName || "",
        description: product.description || "",
        category: product.category || { catId: 0, catName: "" },
        manufacturer: product.manufacturer || "",
        defaultMRP: product.defaultMRP || 0,
        salePrice: product.salePrice || 0,
        purchasePrice: product.purchasePrice || 0,
        discountType: product.discountType || "Percentage",
        saleDiscount: product.saleDiscount || 0,
        taxRate: product.taxRate || 0,
        mrp: product.mrp || 0,
        hsn: product.hsn || 0,
        batchNo: product.batchNo || "",
        modelNo: product.modelNo || "",
        size: product.size || "",
        mfgDate: product.mfgDate || "",
        expDate: product.expDate || "",
        itemLocation: product.itemLocation || "",
        openingStockQuantity: product.openingStockQuantity || 0,
        minimumStockQuantity: product.minimumStockQuantity || 0,
        reorderQuantity: product.reorderQuantity || 0,
        reorderThreshold: product.reorderThreshold || 0,
        packagingSize: product.packagingSize || 1,
        unitId: product.unitId || 0,
        refundable: product.refundable || "Y",
        productStatus: product.productStatus !== undefined ? product.productStatus : true,
        supplierId: selectedSupplier?.id || 0,
      },
    }
    setPurchaseOrders(updatedOrders)
  }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
    index: number
  ) => {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked

    const updatedOrders = [...purchaseOrders]
    const currentOrder = updatedOrders[index]

    if (!currentOrder) return

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
      if (!categoryField) return

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
    } else if (name.startsWith("batchDetails.")) {
      const batchField = name.split(".")[1]
      if (!batchField) return

      updatedOrders[index] = {
        ...currentOrder,
        productForm: {
          ...currentForm,
          batchDetails: {
            ...currentForm.batchDetails,
            [batchField]: value,
          },
        },
      }
    } else if (name === "quantity") {
      updatedOrders[index] = {
        ...currentOrder,
        quantity: parseInt(value) || 1,
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

    setPurchaseOrders(updatedOrders)
  }

  const handlePaymentInfoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked

    setPaymentInfo((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  const addNewOrder = () => {
    // First, minimize all existing orders
    const minimizedExistingOrders = purchaseOrders.map((order) => ({
      ...order,
      isMinimized: true,
    }))

    // Add the new order at the top of the array (index 0)
    const newOrder = {
      productForm: {
        productName: "",
        description: "",
        category: { catId: 0, catName: "" },
        batchDetails: {
          mrp: "0",
          batchNo: "",
          mfg: "",
          mfgDate: "",
          expDate: "",
          packing: "Box",
        },
        supplierId: selectedSupplier?.id || 0,
        manufacturer: "",
        defaultMRP: 0,
        salePrice: 0,
        purchasePrice: 0,
        discountType: "Percentage",
        saleDiscount: 0,
        openingStockQuantity: 0,
        minimumStockQuantity: 0,
        itemLocation: "",
        taxRate: 0,
        inclusiveOfTax: false,
        branch: 1,
        modelNo: "",
        size: "",
        mfgDate: "",
        expDate: "",
        mrp: 0,
        hsn: 0,
        reorderQuantity: 0,
        currentStockLevel: 0,
        reorderThreshold: 0,
        packagingSize: 1,
        unitId: 0,
        refundable: "Y",
        productStatus: true,
        paymentCategory: "cash",
        type: "STOCK",
        paidAmount: "0",
        linkPayment: false,
        deductibleWalletAmount: 0,
        batchNo: "",
      },
      quantity: 1,
      isMinimized: false,
    }

    // Add new order at the beginning of the array
    setPurchaseOrders([newOrder, ...minimizedExistingOrders])
    setExpandedOrderIndex(0)
  }

  const removeOrder = (index: number) => {
    if (purchaseOrders.length > 1) {
      const updatedOrders = [...purchaseOrders]
      updatedOrders.splice(index, 1)

      // If we're removing the expanded order, set the first order as expanded
      if (index === expandedOrderIndex) {
        setExpandedOrderIndex(0)
        const firstOrder = updatedOrders[0]
        if (firstOrder) {
          firstOrder.isMinimized = false
        }
      } else if (index < expandedOrderIndex) {
        // Adjust the expanded index if we're removing an order before it
        setExpandedOrderIndex(expandedOrderIndex - 1)
      }

      setPurchaseOrders(updatedOrders)
    }
  }

  const toggleMinimizeOrder = (index: number) => {
    const updatedOrders = [...purchaseOrders]

    const targetOrder = updatedOrders[index]
    if (!targetOrder) return

    if (targetOrder.isMinimized) {
      // If we're expanding this order, minimize all others
      updatedOrders.forEach((order, i) => {
        order.isMinimized = i !== index
      })
      setExpandedOrderIndex(index)
    } else {
      // If we're minimizing this order
      targetOrder.isMinimized = true
      setExpandedOrderIndex(-1)
    }

    setPurchaseOrders(updatedOrders)
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError("")
    setSuccess("")

    try {
      if (!selectedSupplier) {
        throw new Error("Please select a supplier")
      }

      if (!purchaseOrderId) {
        throw new Error("Purchase order ID is missing")
      }

      const requestData = {
        purchaseOrderId: purchaseOrderId,
        manualPurchaseOrderRequest: {
          supplierId: selectedSupplier.id,
          paymentInfo: paymentInfo,
          products: purchaseOrders.map((order) => ({
            ...order.productForm,
            // Ensure modelNo conforms to the API's expected number type
            modelNo: Number(order.productForm.modelNo) || 0,
            openingStockQuantity: order.quantity || 1,
          })),
        },
        totalAmountWithTax: parseFloat(paymentInfo.totalAmountWithTax),
        discountDto: discountDto.discountValue > 0 ? discountDto : null,
      }

      const result = await dispatch(updatePurchaseOrder(requestData)).unwrap()

      if (result.success) {
        const successMessage =
          result.message ||
          `Successfully updated purchase order with ${purchaseOrders.length} product${
            purchaseOrders.length !== 1 ? "s" : ""
          }!`

        setSuccess(successMessage)
        notify("success", successMessage)

        // Optionally, refetch the updated purchase order
        dispatch(fetchPurchaseOrderById(purchaseOrderId))

        // Redirect back to purchases list after a short delay
        setTimeout(() => {
          router.push("/purchases")
        }, 2000)
      } else {
        throw new Error(result.message || "Failed to update purchase order")
      }
    } catch (err: any) {
      const errorMessage = err.message || "Failed to update purchase order"
      setError(errorMessage)
      notify("error", errorMessage)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (suppliers.length > 0) {
      if (searchText.trim() === "") {
        setFilteredSuppliers(suppliers)
      } else {
        const filtered = suppliers.filter(
          (supplier) =>
            supplier.name.toLowerCase().includes(searchText.toLowerCase()) ||
            (supplier.email && supplier.email.toLowerCase().includes(searchText.toLowerCase())) ||
            (supplier.contactDetails && supplier.contactDetails.toLowerCase().includes(searchText.toLowerCase()))
        )
        setFilteredSuppliers(filtered)
      }
    }
  }, [searchText, suppliers])

  // Animation variants for framer motion
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

  if (currentLoading) {
    return (
      <div className="h-auto w-full bg-[#F4F9F8]">
        <DashboardNav />
        <div className="flex min-h-screen w-full">
          <div className="flex w-full flex-col">
            <div className="flex flex-col items-start">
              <div className="flex w-full">
                <div className="w-full p-4">
                  {/* Skeleton for back button and title */}
                  <div className="mb-6 flex items-center gap-3">
                    <div className="size-9 animate-pulse rounded-md bg-gray-300"></div>
                    <div className="h-8 w-48 animate-pulse rounded bg-gray-300"></div>
                  </div>

                  <div className="flex w-full items-start gap-6">
                    {/* Supplier Selection Skeleton */}
                    <div className="w-1/4 rounded-lg bg-white p-4 shadow">
                      <div className="mb-4 h-7 w-40 animate-pulse rounded bg-gray-300"></div>

                      {/* Search Skeleton */}
                      <div className="mb-4">
                        <div className="h-10 w-full animate-pulse rounded bg-gray-300"></div>
                      </div>

                      {/* Supplier List Skeleton */}
                      <div className="max-h-96 space-y-3 overflow-y-auto">
                        {[1, 2, 3, 4].map((item) => (
                          <div key={item} className="border-b p-3">
                            <div className="mb-2 h-5 w-32 animate-pulse rounded bg-gray-300"></div>
                            <div className="mb-1 size-40 animate-pulse rounded bg-gray-300"></div>
                            <div className="h-4 w-36 animate-pulse rounded bg-gray-300"></div>
                          </div>
                        ))}
                      </div>

                      {/* Payment Information Skeleton */}
                      <div className="mt-6 space-y-3 border-t pt-4">
                        <div className="mb-4 h-7 w-44 animate-pulse rounded bg-gray-300"></div>

                        {[1, 2, 3, 4, 5].map((item) => (
                          <div key={item} className="space-y-2">
                            <div className="h-4 w-24 animate-pulse rounded bg-gray-300"></div>
                            <div className="h-10 w-full animate-pulse rounded bg-gray-300"></div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Product Section Skeleton */}
                    <div className="w-3/4">
                      <div className="mb-4 rounded-lg bg-white p-4 shadow">
                        <div className="mb-4 h-7 w-48 animate-pulse rounded bg-gray-300"></div>
                        <div className="h-5 w-64 animate-pulse rounded bg-gray-300"></div>
                      </div>

                      {/* Product Cards Skeleton */}
                      {[1, 2].map((item) => (
                        <div key={item} className="relative mb-4 rounded-lg bg-white p-4 shadow">
                          <div className="mb-4 flex items-center justify-between">
                            <div className="h-6 w-56 animate-pulse rounded bg-gray-300"></div>
                            <div className="size-6 animate-pulse rounded bg-gray-300"></div>
                          </div>

                          {/* Calculation Preview Skeleton */}
                          <div className="mb-4 rounded bg-gray-50 p-3">
                            <div className="grid grid-cols-4 gap-2">
                              {[1, 2, 3, 4].map((subItem) => (
                                <div key={subItem} className="h-4 w-28 animate-pulse rounded bg-gray-300"></div>
                              ))}
                            </div>
                            <div className="mt-2 h-3 w-64 animate-pulse rounded bg-gray-300"></div>
                          </div>

                          {/* Form Fields Skeleton */}
                          <div className="space-y-4">
                            <div className="grid grid-cols-4 gap-4">
                              {[1, 2, 3, 4].map((field) => (
                                <div key={field} className="space-y-2">
                                  <div className="h-4 w-20 animate-pulse rounded bg-gray-300"></div>
                                  <div className="h-10 w-full animate-pulse rounded bg-gray-300"></div>
                                </div>
                              ))}
                            </div>

                            <div className="space-y-2">
                              <div className="h-4 w-24 animate-pulse rounded bg-gray-300"></div>
                              <div className="h-20 w-full animate-pulse rounded bg-gray-300"></div>
                            </div>

                            <div className="grid grid-cols-4 gap-4">
                              {[1, 2, 3, 4].map((field) => (
                                <div key={field} className="space-y-2">
                                  <div className="h-4 w-20 animate-pulse rounded bg-gray-300"></div>
                                  <div className="h-10 w-full animate-pulse rounded bg-gray-300"></div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}

                      {/* Total Section Skeleton */}
                      <div className="mt-4 rounded-lg bg-white p-4 shadow">
                        <div className="flex items-center justify-between">
                          <div className="space-y-2">
                            {[1, 2, 3, 4].map((item) => (
                              <div key={item} className="h-5 w-32 animate-pulse rounded bg-gray-300"></div>
                            ))}
                          </div>
                          <div className="h-10 w-32 animate-pulse rounded bg-gray-300"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (categoriesLoading) {
    return (
      <div className="h-auto w-full bg-[#F4F9F8]">
        <div className="flex min-h-screen w-full items-center justify-center">
          <div className="text-center">
            <div className="text-lg">Loading categories...</div>
          </div>
        </div>
      </div>
    )
  }

  if (currentError) {
    return (
      <div className="h-auto w-full bg-[#F4F9F8]">
        <div className="flex min-h-screen w-full items-center justify-center">
          <div className="text-center text-red-500">
            <div className="text-lg">Error loading purchase order: {currentError}</div>
            <ButtonModule onClick={() => router.push("/purchases")} variant="primary" className="mt-4">
              Back to Purchases
            </ButtonModule>
          </div>
        </div>
      </div>
    )
  }

  if (!currentPurchaseOrder) {
    return (
      <div className="h-auto w-full bg-[#F4F9F8]">
        <div className="flex min-h-screen w-full items-center justify-center">
          <div className="text-center">
            <div className="text-lg">Purchase order not found</div>
            <ButtonModule onClick={() => router.push("/purchases")} variant="primary" className="mt-4">
              Back to Purchases
            </ButtonModule>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-auto w-full bg-[#F4F9F8]">
      <DashboardNav />
      <NotificationProvider position="top-center" />
      <div className="flex min-h-screen w-full">
        <div className="flex w-full flex-col">
          <div className="flex flex-col items-start">
            <div className="flex w-full">
              <div className="w-full p-4">
                <div className="mb-6 flex items-center gap-3">
                  <motion.button
                    type="button"
                    onClick={() => router.back()}
                    className="flex size-9 items-center justify-center rounded-md border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2 }}
                    aria-label="Go back"
                    title="Go back"
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
                  </motion.button>
                  <motion.h1
                    className="text-2xl font-bold"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    Edit Purchase Order #{purchaseOrderId}
                  </motion.h1>
                </div>

                {error && (
                  <motion.div
                    className="mb-4 rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                  >
                    {error}
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
                  {/* Supplier Selection */}
                  <motion.div className="w-1/4 rounded-lg bg-white p-4 shadow" variants={itemVariants}>
                    <h2 className="mb-4 text-lg font-semibold">Select Supplier</h2>

                    <div className="mb-4">
                      <SearchModule
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        onCancel={handleCancelSearch}
                        placeholder="Search suppliers..."
                      />
                    </div>

                    <div className="max-h-96 overflow-y-auto">
                      {suppliersLoading ? (
                        <div className="py-4 text-center">Loading suppliers...</div>
                      ) : filteredSuppliers.length > 0 ? (
                        filteredSuppliers.map((supplier) => (
                          <motion.div
                            key={supplier.id}
                            className={`cursor-pointer border-b p-3 hover:bg-gray-50 ${
                              selectedSupplier?.id === supplier.id ? "border-blue-200 bg-blue-50" : ""
                            }`}
                            onClick={() => handleSupplierSelect(supplier)}
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                          >
                            <div className="font-medium">{supplier.name}</div>
                            <div className="text-sm text-gray-600">{supplier.email}</div>
                            <div className="text-sm text-gray-600">{supplier.contactDetails}</div>
                          </motion.div>
                        ))
                      ) : (
                        <div className="py-4 text-center">
                          {searchText ? "No matching suppliers found" : "No suppliers found"}
                        </div>
                      )}
                    </div>

                    {/* Payment Information */}
                    {selectedSupplier && (
                      <motion.div
                        className="mt-6 border-t pt-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                      >
                        <h2 className="mb-4 text-lg font-semibold">Payment Information</h2>

                        <div className="space-y-3">
                          <div>
                            <label className="mb-1 block text-sm font-medium">Payment Type</label>
                            <DropdownPopoverModule
                              label=""
                              options={[
                                { value: "CASH", label: "Cash" },
                                { value: "CARD", label: "Card" },
                                { value: "UPI", label: "UPI" },
                                { value: "BANK_TRANSFER", label: "Bank Transfer" },
                                { value: "CREDIT", label: "Credit" },
                              ]}
                              placeholder="Select Payment Type"
                              value={paymentInfo.paymentType}
                              onChange={(value) => setPaymentInfo({ ...paymentInfo, paymentType: value })}
                            />
                          </div>

                          <FormInputModule
                            label="Subtotal"
                            type="text"
                            placeholder=""
                            value={`₹${calculationBreakdown.subtotal.toFixed(2)}`}
                            onChange={() => {}}
                            className="w-full"
                          />

                          <FormInputModule
                            label="Item Discounts"
                            type="text"
                            placeholder=""
                            value={`-₹${(calculationBreakdown.discountAmount - discountDto.discountedAmount).toFixed(
                              2
                            )}`}
                            onChange={() => {}}
                            className="w-full"
                          />

                          <FormInputModule
                            label="Tax Amount"
                            type="text"
                            placeholder=""
                            value={`₹${calculationBreakdown.taxAmount.toFixed(2)}`}
                            onChange={() => {}}
                            className="w-full"
                          />

                          <FormInputModule
                            label="Amount Before Order Discount"
                            type="text"
                            placeholder=""
                            value={`₹${(
                              calculationBreakdown.subtotal -
                              (calculationBreakdown.discountAmount - discountDto.discountedAmount) +
                              calculationBreakdown.taxAmount
                            ).toFixed(2)}`}
                            onChange={() => {}}
                            className="w-full"
                          />

                          {/* Order-level Discount Section */}
                          <div className="border-t pt-3">
                            <h3 className="text-md mb-3 font-semibold">Order Discount</h3>

                            <div className="mb-3">
                              <label className="mb-1 block text-sm font-medium">Discount Type</label>
                              <DropdownPopoverModule
                                label=""
                                options={[
                                  { value: "Percentage", label: "Percentage" },
                                  { value: "Amount", label: "Amount" },
                                ]}
                                placeholder="Select Discount Type"
                                value={discountDto.discountType}
                                onChange={(value) => handleDiscountDtoChange("discountType", value)}
                              />
                            </div>

                            <FormInputModule
                              label="Discount Value"
                              type="number"
                              placeholder="Enter discount value"
                              value={discountDto.discountValue.toString()}
                              onChange={(e) =>
                                handleDiscountDtoChange("discountValue", parseFloat(e.target.value) || 0)
                              }
                              className="w-full"
                            />

                            <FormInputModule
                              label="Order Discount Amount"
                              type="number"
                              placeholder=""
                              value={`-₹${discountDto.discountedAmount.toFixed(2)}`}
                              onChange={() => {}}
                              className="w-full"
                            />
                          </div>

                          <FormInputModule
                            label="Final Amount"
                            type="text"
                            placeholder=""
                            value={`₹${paymentInfo.totalAmountWithTax}`}
                            onChange={() => {}}
                            className="w-full"
                          />

                          <FormInputModule
                            label="Paid Amount"
                            type="number"
                            name="paidAmount"
                            placeholder="Enter paid amount"
                            value={paymentInfo.paidAmount}
                            onChange={(e) => handlePaymentInfoChange(e)}
                            className="w-full"
                          />

                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              name="linkPayment"
                              checked={paymentInfo.linkPayment}
                              onChange={handlePaymentInfoChange}
                              className="mr-2"
                              id="linkPayment"
                            />
                            <label htmlFor="linkPayment" className="text-sm font-medium">
                              Link Payment
                            </label>
                          </div>

                          <FormInputModule
                            label="Deductible Wallet Amount"
                            type="number"
                            name="deductibleWalletAmount"
                            placeholder="Enter deductible amount"
                            value={paymentInfo.deductibleWalletAmount.toString()}
                            onChange={(e) => handlePaymentInfoChange(e)}
                            className="w-full"
                          />

                          <motion.button
                            type="button"
                            onClick={() => setShowBreakdown(!showBreakdown)}
                            className="w-full rounded bg-blue-100 px-4 py-2 text-blue-700 hover:bg-blue-200"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            {showBreakdown ? "Hide" : "Show"} Calculation Breakdown
                          </motion.button>

                          {showBreakdown && (
                            <motion.div
                              className="mt-4 border-t pt-4"
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                            >
                              <h3 className="mb-2 text-sm font-semibold">Calculation Breakdown</h3>
                              {calculationBreakdown.itemBreakdown.map((item, index) => (
                                <div key={index} className="mb-2 text-xs">
                                  <div className="font-medium">{item.productName}</div>
                                  <div>
                                    Qty: {item.quantity} × ₹{item.purchasePrice.toFixed(2)}
                                  </div>
                                  <div>
                                    Discount:{" "}
                                    {item.discountType === "Percentage"
                                      ? `${item.discountValue}%`
                                      : `₹${item.discountValue}`}{" "}
                                    = -₹{item.discountAmount.toFixed(2)}
                                  </div>
                                  <div>
                                    Tax: {item.taxRate}% = ₹{item.taxAmount.toFixed(2)}
                                  </div>
                                  <div>Total: ₹{item.total.toFixed(2)}</div>
                                </div>
                              ))}
                              <div className="mt-2 border-t pt-2 text-sm">
                                <div className="flex justify-between">
                                  <span>Subtotal:</span>
                                  <span>₹{calculationBreakdown.subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-red-600">
                                  <span>Item Discounts:</span>
                                  <span>
                                    -₹{(calculationBreakdown.discountAmount - discountDto.discountedAmount).toFixed(2)}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Tax:</span>
                                  <span>₹{calculationBreakdown.taxAmount.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Amount Before Order Discount:</span>
                                  <span>
                                    ₹
                                    {(
                                      calculationBreakdown.subtotal -
                                      (calculationBreakdown.discountAmount - discountDto.discountedAmount) +
                                      calculationBreakdown.taxAmount
                                    ).toFixed(2)}
                                  </span>
                                </div>
                                <div className="flex justify-between text-red-600">
                                  <span>Order Discount:</span>
                                  <span>-₹{discountDto.discountedAmount.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between font-semibold">
                                  <span>Final Amount:</span>
                                  <span>₹{calculationBreakdown.totalWithTax.toFixed(2)}</span>
                                </div>
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
                        <h2 className="text-lg font-semibold">Purchase Orders</h2>
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                          <ButtonModule onClick={addNewOrder} variant="ghost" size="sm">
                            + Add Another Product
                          </ButtonModule>
                        </motion.div>
                      </div>

                      {selectedSupplier ? (
                        <div>
                          <p className="mb-2 text-sm text-gray-600">
                            Supplier: <span className="font-medium">{selectedSupplier.name}</span>
                          </p>
                          <p className="text-sm text-gray-600">
                            Total:{" "}
                            <span className="font-semibold">₹{calculationBreakdown.totalWithTax.toFixed(2)}</span>{" "}
                            (Subtotal: ₹{calculationBreakdown.subtotal.toFixed(2)} - Item Discounts: ₹
                            {(calculationBreakdown.discountAmount - discountDto.discountedAmount).toFixed(2)} + Tax: ₹
                            {calculationBreakdown.taxAmount.toFixed(2)} - Order Discount: ₹
                            {discountDto.discountedAmount.toFixed(2)})
                          </p>
                        </div>
                      ) : (
                        <p className="mb-4 text-sm text-red-500">Please select a supplier first</p>
                      )}
                    </div>

                    <AnimatePresence>
                      {purchaseOrders.map((order, index) => {
                        const quantity = order.quantity || 1
                        const purchasePrice = order.productForm.purchasePrice || 0
                        const taxRate = order.productForm.taxRate || 0
                        const discountType = order.productForm.discountType || "Percentage"
                        const discountValue = order.productForm.saleDiscount || 0

                        // Calculate item subtotal
                        const itemSubtotal = purchasePrice * quantity

                        // Calculate discount amount
                        let itemDiscountAmount = 0
                        if (discountType === "Percentage") {
                          itemDiscountAmount = itemSubtotal * (discountValue / 100)
                        } else {
                          itemDiscountAmount = discountValue
                        }

                        // Calculate taxable amount after discount
                        const taxableAmount = itemSubtotal - itemDiscountAmount

                        // Calculate tax and total
                        const itemTaxAmount = taxableAmount * (taxRate / 100)
                        const itemTotal = taxableAmount + itemTaxAmount

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
                            <div className="flex items-center justify-between">
                              <h3 className="text-md font-medium">Product Name: {order.productForm.productName}</h3>
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
                                {purchaseOrders.length > 1 && (
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
                                  <span className="font-medium">Price:</span> ₹{purchasePrice.toFixed(2)}
                                </div>
                                <div>
                                  <span className="font-medium">Qty:</span> {quantity}
                                </div>
                                <div>
                                  <span className="font-medium">Discount:</span>{" "}
                                  {discountType === "Percentage" ? `${discountValue}%` : `₹${discountValue}`}
                                </div>
                                <div>
                                  <span className="font-medium">Tax:</span> {taxRate}%
                                </div>
                              </div>
                              <div className="mt-1 text-xs text-gray-600">
                                (₹{itemSubtotal.toFixed(2)} - ₹{itemDiscountAmount.toFixed(2)} discount + ₹
                                {itemTaxAmount.toFixed(2)} tax = ₹{itemTotal.toFixed(2)})
                              </div>
                            </motion.div>

                            <AnimatePresence>
                              {!order.isMinimized && (
                                <motion.div variants={formVariants} initial="hidden" animate="visible" exit="exit">
                                  {/* Product Selection */}
                                  <div className="mb-6">
                                    <label className="mb-2 block text-sm font-medium">Select Product (Optional)</label>
                                    <DropdownPopoverModule
                                      label=""
                                      options={products.map((product) => ({
                                        value: product.productId.toString(),
                                        label: product.productName,
                                      }))}
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
                                        label="Purchase Price *"
                                        type="number"
                                        name="purchasePrice"
                                        placeholder="Enter purchase price"
                                        value={order.productForm.purchasePrice.toString()}
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

                                    <div>
                                      <label className="mb-1 block text-sm font-medium">Description</label>
                                      <textarea
                                        name="description"
                                        value={order.productForm.description}
                                        onChange={(e) => handleInputChange(e, index)}
                                        className="w-full rounded border bg-white p-2"
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

                                      <div>
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
                                            const updatedOrders = [...purchaseOrders]
                                            const catId = parseInt(value)
                                            const category = categories.find((cat) => cat.catId === catId)

                                            if (category) {
                                              const currentOrder = updatedOrders[index]
                                              if (!currentOrder) return
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
                                            }

                                            setPurchaseOrders(updatedOrders)
                                          }}
                                          className="w-full"
                                        />
                                      </div>

                                      <div>
                                        <label className="mb-1 block text-sm font-medium">Unit</label>
                                        <DropdownPopoverModule
                                          label=""
                                          options={[
                                            { value: "0", label: "Select Unit" },
                                            ...units.map((unit) => ({
                                              value: unit.unitId.toString(),
                                              label: unit.baseUnit,
                                            })),
                                          ]}
                                          placeholder="Select Unit"
                                          value={order.productForm.unitId.toString()}
                                          onChange={(value) => {
                                            const updatedOrders = [...purchaseOrders]
                                            const unitId = parseInt(value)
                                            const currentOrder = updatedOrders[index]
                                            if (!currentOrder) return
                                            updatedOrders[index] = {
                                              ...currentOrder,
                                              productForm: {
                                                ...currentOrder.productForm,
                                                unitId: unitId,
                                              },
                                            }
                                            setPurchaseOrders(updatedOrders)
                                          }}
                                          className="w-full"
                                        />
                                      </div>

                                      <FormInputModule
                                        label="MRP"
                                        type="number"
                                        name="mrp"
                                        placeholder="Enter MRP"
                                        value={order.productForm.mrp.toString()}
                                        onChange={(e) => handleInputChange(e, index)}
                                        className="w-full"
                                      />
                                    </div>

                                    <div className="grid grid-cols-4 gap-4">
                                      <FormInputModule
                                        label="HSN Code"
                                        type="number"
                                        name="hsn"
                                        placeholder="Enter HSN code"
                                        value={order.productForm.hsn.toString()}
                                        onChange={(e) => handleInputChange(e, index)}
                                        className="w-full"
                                      />

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
                                    </div>

                                    <div className="grid grid-cols-4 gap-4">
                                      <FormInputModule
                                        label="Minimum Stock Quantity"
                                        type="number"
                                        name="minimumStockQuantity"
                                        placeholder="Enter min stock quantity"
                                        value={order.productForm.minimumStockQuantity.toString()}
                                        onChange={(e) => handleInputChange(e, index)}
                                        className="w-full"
                                      />

                                      <FormInputModule
                                        label="Reorder Quantity"
                                        type="number"
                                        name="reorderQuantity"
                                        placeholder="Enter reorder quantity"
                                        value={order.productForm.reorderQuantity.toString()}
                                        onChange={(e) => handleInputChange(e, index)}
                                        className="w-full"
                                      />

                                      <FormInputModule
                                        label="Item Location"
                                        type="text"
                                        name="itemLocation"
                                        placeholder="Enter item location"
                                        value={order.productForm.itemLocation}
                                        onChange={(e) => handleInputChange(e, index)}
                                        className="w-full"
                                      />
                                      <FormInputModule
                                        label="Sale Price"
                                        type="number"
                                        name="salePrice"
                                        placeholder="Enter sale price"
                                        value={order.productForm.salePrice.toString()}
                                        onChange={(e) => handleInputChange(e, index)}
                                        className="w-full"
                                      />
                                    </div>

                                    {/* Discount Type and Sale Discount Fields */}
                                    <div className="grid grid-cols-4 gap-4">
                                      <div>
                                        <label className="mb-1 block text-sm font-medium">Discount Type</label>
                                        <DropdownPopoverModule
                                          label=""
                                          options={[
                                            { value: "Percentage", label: "Percentage" },
                                            { value: "Amount", label: "Amount" },
                                          ]}
                                          placeholder="Select Discount Type"
                                          value={order.productForm.discountType}
                                          onChange={(value) => {
                                            const updatedOrders = [...purchaseOrders]
                                            const currentOrder = updatedOrders[index]
                                            if (!currentOrder) return

                                            updatedOrders[index] = {
                                              ...currentOrder,
                                              productForm: {
                                                ...currentOrder.productForm,
                                                discountType: value,
                                              },
                                            }
                                            setPurchaseOrders(updatedOrders)
                                          }}
                                          className="w-full"
                                        />
                                      </div>
                                      <FormInputModule
                                        label="Sale Discount"
                                        type="number"
                                        name="saleDiscount"
                                        placeholder="Enter discount value"
                                        value={order.productForm.saleDiscount.toString()}
                                        onChange={(e) => handleInputChange(e, index)}
                                        className="w-full"
                                      />
                                      <div className="col-span-2"></div> {/* Empty space for layout */}
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
                            {purchaseOrders.length} product{purchaseOrders.length !== 1 ? "s" : ""} in this order
                          </p>
                          <p className="text-sm font-semibold">Subtotal: ₹{calculationBreakdown.subtotal.toFixed(2)}</p>
                          <p className="text-sm font-semibold text-red-600">
                            Item Discounts: -₹
                            {(calculationBreakdown.discountAmount - discountDto.discountedAmount).toFixed(2)}
                          </p>
                          <p className="text-sm font-semibold">Tax: ₹{calculationBreakdown.taxAmount.toFixed(2)}</p>
                          <p className="text-sm font-semibold text-red-600">
                            Order Discount: -₹{discountDto.discountedAmount.toFixed(2)}
                          </p>
                          <p className="text-lg font-bold text-green-700">
                            Final Amount: ₹{calculationBreakdown.totalWithTax.toFixed(2)}
                          </p>
                        </div>
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                          <ButtonModule
                            onClick={handleSubmit}
                            variant="primary"
                            size="md"
                            disabled={loading || !selectedSupplier || updating}
                          >
                            {updating ? "Updating..." : `Update Purchase Order`}
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
    </div>
  )
}

export default EditPurchaseOrder
