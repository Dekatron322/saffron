"use client"
import DashboardNav from "components/Navbar/DashboardNav"
import { ButtonModule } from "components/ui/Button/Button"
import { SearchModule } from "components/ui/Search/search-module"
import { useRouter } from "next/navigation"
import React, { useState, useEffect } from "react"
import { useAppDispatch, useAppSelector } from "app/api/store/store"
import { fetchAllSuppliers, selectSuppliers } from "app/api/store/supplierSlice"
import { selectProducts, fetchAllProducts, selectCategories, fetchAllCategories } from "app/api/store/productSlice"
import { createPurchaseOrder } from "app/api/store/purchaseSlice"
import { FormInputModule } from "components/ui/Input/Input"
import { DropdownPopoverModule } from "components/ui/Input/DropdownModule"
import { motion, AnimatePresence } from "framer-motion"
import { notify, NotificationProvider } from "components/ui/Notification/Notification"
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

interface Discount {
  discountType: string
  discountValue: number
  discountedAmount: number
}

interface PurchaseOrderItem {
  productForm: ProductFormData
  quantity?: number
  subtotal?: number
  taxAmount?: number
  total?: number
  discountAmount?: number
  isMinimized: boolean
  discount?: Discount // Product-level discount
}

interface PaymentInfo {
  paymentType: string
  totalAmount: string
  totalAmountWithTax: string
  paidAmount: string
  linkPayment: boolean
  deductibleWalletAmount: number
  discount?: Discount // Payment-level discount
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

const RaisePurchaseOrder = () => {
  const router = useRouter()
  const dispatch = useAppDispatch()

  // Helper function to create deep copy of an order
  const createOrderCopy = (order: PurchaseOrderItem): PurchaseOrderItem => ({
    ...order,
    productForm: {
      ...order.productForm,
      category: { ...order.productForm.category },
      batchDetails: { ...order.productForm.batchDetails },
    },
    quantity: order.quantity,
    subtotal: order.subtotal,
    taxAmount: order.taxAmount,
    total: order.total,
    discountAmount: order.discountAmount,
    isMinimized: order.isMinimized,
    discount: order.discount ? { ...order.discount } : undefined,
  })

  // Helper function to create order copy with minimized state
  const createOrderCopyWithMinimize = (order: PurchaseOrderItem, isMinimized: boolean): PurchaseOrderItem => ({
    ...order,
    productForm: {
      ...order.productForm,
      category: { ...order.productForm.category },
      batchDetails: { ...order.productForm.batchDetails },
    },
    quantity: order.quantity,
    subtotal: order.subtotal,
    taxAmount: order.taxAmount,
    total: order.total,
    discountAmount: order.discountAmount,
    isMinimized,
    discount: order.discount ? { ...order.discount } : undefined,
  })

  const handleMfgDateChange = (date: Date | null, index: number) => {
    setPurchaseOrders((prevOrders) => {
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
    setPurchaseOrders((prevOrders) => {
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
  const { suppliers, loading: suppliersLoading } = useAppSelector(selectSuppliers)
  const { products, loading: productsLoading } = useAppSelector(selectProducts)
  const { categories, loading: categoriesLoading } = useAppSelector(selectCategories)
  const { units, loading: unitsLoading } = useAppSelector(selectUnits)
  const [filteredSuppliers, setFilteredSuppliers] = useState<any[]>([])

  const [searchText, setSearchText] = useState("")
  const [selectedSupplier, setSelectedSupplier] = useState<any>(null)
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrderItem[]>([
    {
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
        supplierId: 0,
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
    },
  ])

  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo>({
    paymentType: "CASH",
    totalAmount: "0",
    totalAmountWithTax: "0",
    paidAmount: "0",
    linkPayment: false,
    deductibleWalletAmount: 0,
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
  const [discountLevel, setDiscountLevel] = useState<"product" | "payment">("product") // Track discount level

  useEffect(() => {
    dispatch(fetchAllSuppliers())
    dispatch(fetchAllProducts(0, 100))
    dispatch(fetchAllCategories())
    dispatch(fetchAllUnits())
  }, [dispatch])

  useEffect(() => {
    calculateTotals()
  }, [purchaseOrders, paymentInfo.discount, discountLevel])

  const calculateTotals = () => {
    let subtotal = 0
    let taxAmount = 0
    let totalWithTax = 0
    let totalDiscountAmount = 0
    const itemBreakdown: CalculationBreakdown["itemBreakdown"] = []

    // Calculate product-level discounts first
    purchaseOrders.forEach((order, index) => {
      const quantity = order.quantity || 1
      const purchasePrice = order.productForm.purchasePrice || 0
      const taxRate = order.productForm.taxRate || 0

      // Calculate item subtotal
      const itemSubtotal = purchasePrice * quantity

      // Calculate discount amount based on discount level
      let itemDiscountAmount = 0

      if (discountLevel === "product") {
        // Use product-level discount
        const discountType = order.productForm.discountType || "Percentage"
        const discountValue = order.productForm.saleDiscount || 0

        if (discountType === "Percentage") {
          itemDiscountAmount = itemSubtotal * (discountValue / 100)
        } else {
          itemDiscountAmount = discountValue // Fixed amount, not multiplied by quantity
        }
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
        discountType: discountLevel === "product" ? order.productForm.discountType || "Percentage" : "None",
        discountValue: discountLevel === "product" ? order.productForm.saleDiscount || 0 : 0,
        discountAmount: itemDiscountAmount,
        subtotal: itemSubtotal,
        taxAmount: itemTaxAmount,
        total: itemTotal,
      })
    })

    // Apply payment-level discount if selected
    if (discountLevel === "payment" && paymentInfo.discount) {
      const paymentDiscount = paymentInfo.discount
      let paymentDiscountAmount = 0

      if (paymentDiscount.discountType === "Percentage") {
        // Payment-level discount is a percentage of the subtotal
        paymentDiscountAmount = subtotal * (paymentDiscount.discountValue / 100)
      } else {
        paymentDiscountAmount = paymentDiscount.discountValue
      }

      // Calculate tax on the discounted amount
      const taxableAmountAfterDiscount = subtotal - paymentDiscountAmount
      const taxAmountAfterDiscount = taxableAmountAfterDiscount * (taxAmount / subtotal)

      totalDiscountAmount = paymentDiscountAmount
      totalWithTax = taxableAmountAfterDiscount + taxAmountAfterDiscount
    }

    setCalculationBreakdown({
      subtotal,
      taxAmount,
      totalWithTax,
      discountAmount: totalDiscountAmount,
      itemBreakdown,
    })

    setPaymentInfo((prev) => ({
      ...prev,
      totalAmount: subtotal.toFixed(2),
      totalAmountWithTax: totalWithTax.toFixed(2),
      paidAmount: totalWithTax.toFixed(2),
    }))
  }

  const handleCancelSearch = () => {
    setSearchText("")
  }

  const handleSupplierSelect = (supplier: any) => {
    setSelectedSupplier(supplier)
    setPurchaseOrders((prevOrders) =>
      prevOrders.map((order) => ({
        ...order,
        productForm: {
          ...order.productForm,
          category: { ...order.productForm.category },
          batchDetails: { ...order.productForm.batchDetails },
          supplierId: supplier.id,
        },
      }))
    )
  }

  const handleProductSelect = (product: any, index: number) => {
    setPurchaseOrders((prevOrders) => {
      const updatedOrders = prevOrders.map(createOrderCopy)
      const currentOrder = updatedOrders[index]
      if (!currentOrder) return prevOrders

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
      return updatedOrders
    })
  }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
    index: number
  ) => {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked

    setPurchaseOrders((prevOrders) => {
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
      } else if (name.startsWith("batchDetails.")) {
        const batchField = name.split(".")[1]
        if (!batchField) return prevOrders

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

      return updatedOrders
    })
  }

  const handlePaymentInfoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked

    setPaymentInfo((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  const handlePaymentDiscountChange = (field: string, value: string | number) => {
    setPaymentInfo((prev) => ({
      ...prev,
      discount: {
        ...prev.discount,
        [field]: value,
        discountedAmount: 0, // This will be calculated on the server
      } as Discount,
    }))
  }

  const addNewOrder = () => {
    setPurchaseOrders((prevOrders) => {
      // Minimize all existing orders
      const minimizedExistingOrders = prevOrders.map((order) => createOrderCopyWithMinimize(order, true))

      // Add new order at the beginning of the array
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

      setExpandedOrderIndex(0)
      return [newOrder, ...minimizedExistingOrders]
    })
  }

  const removeOrder = (index: number) => {
    if (purchaseOrders.length > 1) {
      setPurchaseOrders((prevOrders) => {
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
    setPurchaseOrders((prevOrders) => {
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
    setSuccess("")

    try {
      if (!selectedSupplier) {
        throw new Error("Please select a supplier")
      }

      // Prepare the request data with both payment-level and product-level discounts
      const requestData = {
        supplierId: selectedSupplier.id,
        paymentInfo: {
          ...paymentInfo,
          totalAmount: calculationBreakdown.subtotal.toFixed(2),
          totalAmountWithTax: calculationBreakdown.totalWithTax.toFixed(2),
          paidAmount: calculationBreakdown.totalWithTax.toFixed(2),
        },
        products: purchaseOrders.map((order) => ({
          ...order.productForm,
          openingStockQuantity: order.quantity || 1,
          modelNo: order.productForm.modelNo ? parseInt(order.productForm.modelNo) || 0 : 0,
          // Include product-level discount if applicable
          ...(discountLevel === "product" && {
            discount: {
              discountType: order.productForm.discountType,
              discountValue: order.productForm.saleDiscount,
              discountedAmount: 0, // This will be calculated on the server
            },
          }),
        })),
      }

      await dispatch(createPurchaseOrder(requestData))
      const successMessage = `Successfully created purchase order with ${purchaseOrders.length} product${
        purchaseOrders.length !== 1 ? "s" : ""
      }!`

      setSuccess(successMessage)
      notify("success", successMessage)

      // Reset form
      setPurchaseOrders([
        {
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
        },
      ])

      setExpandedOrderIndex(0)

      setPaymentInfo({
        paymentType: "CASH",
        totalAmount: "0",
        totalAmountWithTax: "0",
        paidAmount: "0",
        linkPayment: false,
        deductibleWalletAmount: 0,
      })

      setCalculationBreakdown({
        subtotal: 0,
        taxAmount: 0,
        totalWithTax: 0,
        discountAmount: 0,
        itemBreakdown: [],
      })
    } catch (err: any) {
      const errorMessage = err.message || "Failed to create purchase order"
      setError(errorMessage)
      notify("error", errorMessage)
    } finally {
      setLoading(false)
    }
  }

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

  useEffect(() => {
    dispatch(fetchAllSuppliers())
    dispatch(fetchAllProducts(0, 100))
    dispatch(fetchAllCategories())
    dispatch(fetchAllUnits())
  }, [dispatch])

  // Add useEffect to filter suppliers when searchText changes
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

  return (
    <section className="h-auto w-full bg-[#F4F9F8]">
      <NotificationProvider position="top-center" />
      <div className="flex min-h-screen w-full">
        <div className="flex w-full flex-col">
          <div className="flex flex-col items-start">
            <div className="flex w-full">
              <div className="w-full p-4">
                <motion.h1
                  className="mb-6 text-2xl font-bold"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  Raise Purchase Order
                </motion.h1>

                {/* {error && (
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
                )} */}

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

                        {/* Discount Level Selection */}
                        <div className="mb-4">
                          <label className="mb-2 block text-sm font-medium">Discount Level</label>
                          <div className="flex space-x-4">
                            <label className="flex items-center">
                              <input
                                type="radio"
                                value="product"
                                checked={discountLevel === "product"}
                                onChange={() => setDiscountLevel("product")}
                                className="mr-2"
                              />
                              <span className="text-sm">Product Level</span>
                            </label>
                            <label className="flex items-center">
                              <input
                                type="radio"
                                value="payment"
                                checked={discountLevel === "payment"}
                                onChange={() => setDiscountLevel("payment")}
                                className="mr-2"
                              />
                              <span className="text-sm">Payment Level</span>
                            </label>
                          </div>
                        </div>

                        {/* Payment Level Discount Fields */}
                        {discountLevel === "payment" && (
                          <div className="mb-4 space-y-3 rounded bg-blue-50 p-3">
                            <h3 className="text-sm font-semibold">Payment Level Discount</h3>
                            <div>
                              <label className="mb-1 block text-sm font-medium">Discount Type</label>
                              <DropdownPopoverModule
                                label=""
                                options={[
                                  { value: "Percentage", label: "Percentage" },
                                  { value: "Amount", label: "Amount" },
                                ]}
                                placeholder="Select Discount Type"
                                value={paymentInfo.discount?.discountType || "Percentage"}
                                onChange={(value) => handlePaymentDiscountChange("discountType", value)}
                                className="w-full"
                              />
                            </div>
                            <FormInputModule
                              label="Discount Value"
                              type="number"
                              placeholder="Enter discount value"
                              value={paymentInfo.discount?.discountValue?.toString() || "0"}
                              onChange={(e) =>
                                handlePaymentDiscountChange("discountValue", parseFloat(e.target.value) || 0)
                              }
                              className="w-full"
                            />
                          </div>
                        )}

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
                            value={`₹${(calculationBreakdown.subtotal || 0).toFixed(2)}`}
                            onChange={() => {}}
                            className="w-full"
                          />

                          <FormInputModule
                            label="Discount"
                            type="text"
                            placeholder=""
                            value={`-₹${(calculationBreakdown.discountAmount || 0).toFixed(2)}`}
                            onChange={() => {}}
                            className="w-full"
                          />

                          <FormInputModule
                            label="Tax Amount"
                            type="text"
                            placeholder=""
                            value={`₹${(calculationBreakdown.taxAmount || 0).toFixed(2)}`}
                            onChange={() => {}}
                            className="w-full"
                          />

                          <FormInputModule
                            label="Total Amount with Tax"
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
                                  {discountLevel === "product" && (
                                    <div>
                                      Discount:{" "}
                                      {item.discountType === "Percentage"
                                        ? `${item.discountValue}%`
                                        : `₹${item.discountValue}`}{" "}
                                      = -₹{item.discountAmount.toFixed(2)}
                                    </div>
                                  )}
                                  <div>
                                    Tax: {item.taxRate}% = ₹{item.taxAmount.toFixed(2)}
                                  </div>
                                  <div>Total: ₹{item.total.toFixed(2)}</div>
                                </div>
                              ))}
                              {discountLevel === "payment" && paymentInfo.discount && (
                                <div className="mb-2 text-xs text-blue-600">
                                  <div className="font-medium">Payment Level Discount</div>
                                  <div>
                                    {paymentInfo.discount.discountType === "Percentage"
                                      ? `${paymentInfo.discount.discountValue}%`
                                      : `₹${paymentInfo.discount.discountValue}`}{" "}
                                    = -₹{(calculationBreakdown.discountAmount || 0).toFixed(2)}
                                  </div>
                                </div>
                              )}
                              <div className="mt-2 border-t pt-2 text-sm">
                                <div className="flex justify-between">
                                  <span>Subtotal:</span>
                                  <span>₹{(calculationBreakdown.subtotal || 0).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-red-600">
                                  <span>Discount:</span>
                                  <span>-₹{(calculationBreakdown.discountAmount || 0).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Tax:</span>
                                  <span>₹{(calculationBreakdown.taxAmount || 0).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between font-semibold">
                                  <span>Total:</span>
                                  <span>₹{(calculationBreakdown.totalWithTax || 0).toFixed(2)}</span>
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
                            <span className="font-semibold">
                              ₹{(calculationBreakdown.totalWithTax || 0).toFixed(2)}
                            </span>{" "}
                            (Subtotal: ₹{(calculationBreakdown.subtotal || 0).toFixed(2)} - Discount: ₹
                            {(calculationBreakdown.discountAmount || 0).toFixed(2)} + Tax: ₹
                            {(calculationBreakdown.taxAmount || 0).toFixed(2)})
                          </p>
                          <p className="text-sm text-blue-600">
                            Discount Level: <span className="font-medium">{discountLevel.toUpperCase()}</span>
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
                        if (discountLevel === "product") {
                          if (discountType === "Percentage") {
                            itemDiscountAmount = itemSubtotal * (discountValue / 100)
                          } else {
                            itemDiscountAmount = discountValue * quantity
                          }
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
                            <div className=" flex items-center justify-between">
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
                                      className="h-5 w-5"
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
                                      className="h-5 w-5"
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
                                      className="h-5 w-5"
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
                                {discountLevel === "product" && (
                                  <div>
                                    <span className="font-medium">Discount:</span>{" "}
                                    {discountType === "Percentage" ? `${discountValue}%` : `₹${discountValue}`}
                                  </div>
                                )}
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
                                            const catId = parseInt(value)
                                            const category = categories.find((cat) => cat.catId === catId)

                                            if (category) {
                                              setPurchaseOrders((prevOrders) => {
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
                                            const unitId = parseInt(value)
                                            setPurchaseOrders((prevOrders) => {
                                              const updatedOrders = prevOrders.map(createOrderCopy)
                                              const currentOrder = updatedOrders[index]
                                              if (!currentOrder) return prevOrders

                                              updatedOrders[index] = {
                                                ...currentOrder,
                                                productForm: {
                                                  ...currentOrder.productForm,
                                                  unitId: unitId,
                                                },
                                              }
                                              return updatedOrders
                                            })
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

                                      {/* Replace the Expiry Date input with DatePicker */}
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

                                    {/* Product-level Discount Fields (only show when product-level discount is selected) */}
                                    {discountLevel === "product" && (
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
                                              setPurchaseOrders((prevOrders) => {
                                                const updatedOrders = prevOrders.map(createOrderCopy)
                                                const currentOrder = updatedOrders[index]
                                                if (!currentOrder) return prevOrders

                                                updatedOrders[index] = {
                                                  ...currentOrder,
                                                  productForm: {
                                                    ...currentOrder.productForm,
                                                    discountType: value,
                                                  },
                                                }
                                                return updatedOrders
                                              })
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
                                    )}

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
                          <p className="text-sm font-semibold">
                            Subtotal: ₹{(calculationBreakdown.subtotal || 0).toFixed(2)}
                          </p>
                          <p className="text-sm font-semibold text-red-600">
                            Discount: -₹{(calculationBreakdown.discountAmount || 0).toFixed(2)}
                          </p>
                          <p className="text-sm font-semibold">
                            Tax: ₹{(calculationBreakdown.taxAmount || 0).toFixed(2)}
                          </p>
                          <p className="text-lg font-bold text-green-700">
                            Total: ₹{(calculationBreakdown.totalWithTax || 0).toFixed(2)}
                          </p>
                          <p className="text-sm text-blue-600">
                            Discount Level: <span className="font-medium">{discountLevel.toUpperCase()}</span>
                          </p>
                        </div>
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                          <ButtonModule
                            onClick={handleSubmit}
                            variant="primary"
                            size="md"
                            disabled={loading || !selectedSupplier}
                          >
                            {loading ? "Creating..." : `Create Purchase Order`}
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
  )
}

export default RaisePurchaseOrder
