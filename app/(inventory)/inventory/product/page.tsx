"use client"
import DashboardNav from "components/Navbar/DashboardNav"
import { ButtonModule } from "components/ui/Button/Button"
import { SearchModule } from "components/ui/Search/search-module"
import { useRouter } from "next/navigation"
import AddBusiness from "public/add-business"
import ArrowForwardIcon from "public/arrow-forward-icon"
import CardPosIcon from "public/card-pos-icon"
import EmptyState from "public/empty-state"
import FilterIcon from "public/Icons/filter-icon"
import PurchaseIcon from "public/Icons/purchase-icon"
import SalesIcon from "public/Icons/sales-icon"
import React, { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import {
  fetchAllProducts,
  fetchProductTransactions,
  fetchStockSummary,
  fetchTransactionDetails,
  selectProducts,
  selectProductTransactions,
  selectStockSummary,
  selectTransactionDetails,
} from "app/api/store/productSlice"
import { AnimatePresence, motion } from "framer-motion"
import { useAppDispatch } from "app/api/store/store"
import TransactionDetailsModal from "components/ui/Modal/transaction-details-modal"
import {
  AvailableStockIcon,
  PurchasesIcon,
  SaleIcon,
  StockChangeIcon,
  StockIcon,
  StockProductIcon,
  StockQuantityIcon,
  StockValueIcon,
} from "components/Icons/Icons"

interface Transaction {
  id: string
  type: string
  customerId: string
  name: string
  date: string
  amount: number
  invoiceNumber: string
  status: "Pending" | "Completed" | "Failed" | "Processing"
  quantity: number
  pricePerUnit: number
  unit: string
  customer?: string
  supplier?: string
  invoiceNo?: string
  totalPrice?: number
  invoiceDate?: string
}

const SkeletonLoader = ({ className }: { className: string }) => (
  <motion.div
    className={`animate-pulse rounded bg-gray-200 ${className}`}
    initial={{ opacity: 0.5 }}
    animate={{ opacity: 1 }}
    transition={{ repeat: Infinity, duration: 1.5 }}
  />
)

const Products = () => {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { products, loading, error, pagination } = useSelector(selectProducts)
  const { stockSummary, loading: stockSummaryLoading, error: stockSummaryError } = useSelector(selectStockSummary)
  const {
    productTransactions,
    loading: productTransactionsLoading,
    error: productTransactionsError,
  } = useSelector(selectProductTransactions)
  const {
    transactionDetails,
    loading: transactionDetailsLoading,
    error: transactionDetailsError,
  } = useSelector(selectTransactionDetails)

  const [searchText, setSearchText] = useState("")
  const [selectedProduct, setSelectedProduct] = useState<any>(null)
  const [filteredProducts, setFilteredProducts] = useState<any[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [currentPage, setCurrentPage] = useState(0)
  const [pageSize] = useState(5)
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false)

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        when: "beforeChildren",
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 10,
      },
    },
    hover: {
      y: -3,
      scale: 1.02,
      boxShadow: "0px 5px 15px rgba(0, 0, 0, 0.1)",
      transition: { duration: 0.2 },
    },
  }

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.3,
      },
    },
  }

  const tableRowVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: i * 0.05,
        duration: 0.3,
      },
    }),
  }

  // Load all products at once
  useEffect(() => {
    // Fetch all products without pagination - use a large number to get all products
    dispatch(fetchAllProducts(0, 1000)) // Load 1000 products at once

    // Fetch stock summary for the current year
    const currentYear = new Date().getFullYear()
    dispatch(fetchStockSummary(`${currentYear}-01-01`, `${currentYear}-12-31`))
  }, [dispatch])

  // Filter products based on search
  useEffect(() => {
    if (searchText && products.length > 0) {
      const filtered = products.filter((product) =>
        product.productName.toLowerCase().includes(searchText.toLowerCase())
      )
      setFilteredProducts(filtered)
    } else {
      setFilteredProducts(products)
    }
  }, [searchText, products])

  // Transform transactions when product is selected
  useEffect(() => {
    if (selectedProduct && productTransactions) {
      const transformedTransactions: Transaction[] =
        productTransactions.transactionSummary?.map((transaction: any, index: number) => ({
          id: `trans-${index}-${transaction.invoiceNo}`,
          type: transaction.type,
          customerId: transaction.customer || transaction.supplier || "N/A",
          name: transaction.customer || transaction.supplier || "N/A",
          date: transaction.invoiceDate,
          amount: transaction.totalPrice,
          invoiceNumber: transaction.invoiceNo?.toString() || "N/A",
          status: transaction.status === "Paid" ? ("Completed" as const) : ("Pending" as const),
          quantity: transaction.quantity,
          pricePerUnit: transaction.pricePerUnit,
          unit: transaction.unit,
        })) || []

      setTransactions(transformedTransactions)
    } else {
      setTransactions([])
    }
  }, [selectedProduct, productTransactions])

  const handleCancelSearch = () => {
    setSearchText("")
    setFilteredProducts(products)
  }

  const handleProductClick = async (product: any) => {
    setSelectedProduct(product)
    setCurrentPage(0) // Reset to first page when selecting new product
    try {
      await dispatch(
        fetchProductTransactions({
          name: product.productName,
          page: 0,
          size: pageSize,
          sortBy: "invoiceDate",
          sortDir: "desc",
        })
      )
    } catch (error) {
      console.error("Failed to fetch product transactions:", error)
    }
  }

  const handleLoadMore = async () => {
    if (!selectedProduct) return

    const nextPage = currentPage + 1
    try {
      await dispatch(
        fetchProductTransactions({
          name: selectedProduct.productName,
          page: nextPage,
          size: pageSize,
          sortBy: "invoiceDate",
          sortDir: "desc",
        })
      )
      setCurrentPage(nextPage)
    } catch (error) {
      console.error("Failed to load more transactions:", error)
    }
  }

  const handleViewTransaction = async (transaction: Transaction) => {
    setSelectedTransaction(transaction)
    try {
      await dispatch(
        fetchTransactionDetails({
          type: transaction.type,
          invoiceNo: parseInt(transaction.invoiceNumber),
        })
      )
      setIsTransactionModalOpen(true)
    } catch (error) {
      console.error("Failed to fetch transaction details:", error)
      setIsTransactionModalOpen(true)
    }
  }

  const handleCloseTransactionModal = () => {
    setIsTransactionModalOpen(false)
    setSelectedTransaction(null)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
      case "Paid":
        return "bg-green-100 text-green-800"
      case "Pending":
        return "bg-yellow-100 text-yellow-800"
      case "Failed":
        return "bg-red-100 text-red-800"
      case "Processing":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getTransactionIcon = (type: string) => {
    return type === "Sale" ? <SalesIcon /> : <PurchaseIcon />
  }

  const calculateAvailableQuantity = (product: any) => {
    return product.currentStockLevel ?? 0
  }

  const handleAddProduct = () => {
    router.push(`product/add-product`)
  }

  const handleRefresh = () => {
    // Reload all products
    dispatch(fetchAllProducts(0, 1000))

    const currentYear = new Date().getFullYear()
    dispatch(fetchStockSummary(`${currentYear}-01-01`, `${currentYear}-12-31`))

    // Refresh transactions if a product is selected
    if (selectedProduct) {
      dispatch(
        fetchProductTransactions({
          name: selectedProduct.productName,
          page: 0,
          size: pageSize,
          sortBy: "invoiceDate",
          sortDir: "desc",
        })
      )
      setCurrentPage(0)
    }
  }

  if (error) {
    return (
      <motion.div
        className="flex h-[60vh] flex-col items-center justify-center gap-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className="rounded-full bg-red-100 p-4"
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 5, -5, 0],
          }}
          transition={{ duration: 0.6 }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="size-12 text-red-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </motion.div>
        <h3 className="text-xl font-semibold text-gray-800">{error}</h3>
        <p className="text-gray-600">Please try again later or contact support if the problem persists.</p>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <ButtonModule variant="primary" size="sm" onClick={handleRefresh}>
            Retry
          </ButtonModule>
        </motion.div>
      </motion.div>
    )
  }

  return (
    <motion.section
      className="h-auto w-full bg-[#F4F9F8]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex min-h-screen w-full">
        <div className="flex w-full flex-col">
          <DashboardNav />
          <div className="mt-6 flex flex-col items-start px-8">
            <motion.div
              className="mb-5 flex w-full justify-between"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.4 }}
            >
              <div className="flex items-center gap-2">
                <p className="text-[#94A3B8]">Inventory</p>
                <ArrowForwardIcon />
                <p>Products</p>
              </div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <ButtonModule
                  variant="primary"
                  size="sm"
                  icon={<AddBusiness color="#ffffff" />}
                  iconPosition="start"
                  onClick={handleAddProduct}
                >
                  <p className="max-sm:hidden">Add Product</p>
                </ButtonModule>
              </motion.div>
            </motion.div>

            {/* Stock Summary Cards */}
            <motion.div
              className="mb-6 grid w-full grid-cols-4 gap-4"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {stockSummaryLoading ? (
                [...Array(4)].map((_, i) => (
                  <motion.div key={i} className="rounded-lg border bg-white p-4" variants={itemVariants}>
                    <SkeletonLoader className="mb-2 h-4 w-1/2" />
                    <SkeletonLoader className="h-8 w-3/4" />
                  </motion.div>
                ))
              ) : stockSummaryError ? (
                <motion.div
                  className="col-span-4 rounded-lg border border-red-200 bg-red-50 p-4 text-center text-red-600"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring" }}
                >
                  {stockSummaryError}
                </motion.div>
              ) : stockSummary ? (
                <>
                  <motion.div className="rounded-lg border bg-white p-4" variants={itemVariants} whileHover="hover">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-2">
                        <div className="rounded-lg bg-[#B1EEE226] p-3 ">
                          <StockIcon />
                        </div>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Total Stock</h3>

                        <motion.p
                          className="text-2xl font-bold"
                          initial={{ scale: 0.9 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.1 }}
                        >
                          {stockSummary.totalStock}
                        </motion.p>
                      </div>
                    </div>
                  </motion.div>
                  <motion.div className="rounded-lg border bg-white p-4" variants={itemVariants} whileHover="hover">
                    <div className="flex items-center gap-2">
                      <div className="rounded-lg bg-[#B1EEE226] p-3 ">
                        <StockValueIcon />
                      </div>

                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Total Stock Value</h3>
                        <motion.p
                          className="text-2xl font-bold"
                          initial={{ scale: 0.9 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.2 }}
                        >
                          ₹{stockSummary.totalStockAmount?.toFixed(2) || "0.00"}
                        </motion.p>
                      </div>
                    </div>
                  </motion.div>
                  <motion.div className="rounded-lg border bg-white p-4" variants={itemVariants} whileHover="hover">
                    <div className="flex items-center gap-2">
                      <div className="rounded-lg bg-[#B1EEE226] p-3 ">
                        <StockChangeIcon />
                      </div>

                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Change</h3>
                        <motion.p
                          className="text-2xl font-bold text-[#00a4a6]"
                          initial={{ scale: 0.9 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.3 }}
                        >
                          {stockSummary.percentChange}
                        </motion.p>
                      </div>
                    </div>
                  </motion.div>
                  <motion.div className="rounded-lg border bg-white p-4" variants={itemVariants} whileHover="hover">
                    <div className="flex items-center gap-2">
                      <div className="rounded-lg bg-[#B1EEE226] p-3 ">
                        <StockProductIcon />
                      </div>

                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Products</h3>
                        <motion.p
                          className="text-2xl font-bold"
                          initial={{ scale: 0.9 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.4 }}
                        >
                          {stockSummary.productDto?.length || 0}
                        </motion.p>
                      </div>
                    </div>
                  </motion.div>
                </>
              ) : null}
            </motion.div>

            <div className="max-sm-my-4 flex w-full gap-6 max-md:flex-col">
              <div className="flex w-full items-start gap-4">
                {/* Left Panel - Product List */}
                <motion.div
                  className="w-1/5 rounded-md bg-white p-4"
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.4 }}
                >
                  <div className="flex h-10 items-center gap-2">
                    <SearchModule
                      value={searchText}
                      onChange={(e) => setSearchText(e.target.value)}
                      onCancel={handleCancelSearch}
                      className="w-full rounded-md"
                    />
                    <motion.div whileHover={{ rotate: 90 }} whileTap={{ scale: 0.9 }}>
                      <FilterIcon />
                    </motion.div>
                  </div>

                  {loading && filteredProducts.length === 0 ? (
                    <div className="mt-3 flex flex-col gap-2">
                      {[...Array(5)].map((_, i) => (
                        <SkeletonLoader key={i} className="h-8 w-full" />
                      ))}
                    </div>
                  ) : filteredProducts.length > 0 ? (
                    <div className="mt-3 flex max-h-[400px] flex-col gap-2 overflow-y-auto">
                      {filteredProducts.map((product, index) => (
                        <motion.p
                          key={product.productId}
                          className={`cursor-pointer rounded-md p-2 text-sm ${
                            selectedProduct?.productId === product.productId
                              ? "bg-[#e6f7f7] text-[#00a4a6]"
                              : "hover:bg-gray-100"
                          }`}
                          onClick={() => handleProductClick(product)}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          whileHover={{
                            x: 5,
                            backgroundColor:
                              selectedProduct?.productId === product.productId
                                ? "rgb(230, 247, 247)"
                                : "rgb(243, 244, 246)",
                          }}
                        >
                          {product.productName}
                        </motion.p>
                      ))}
                    </div>
                  ) : (
                    <motion.div
                      className="mt-4 text-center text-gray-500"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      {products.length === 0 ? "No products available" : "No matching products found"}
                    </motion.div>
                  )}
                </motion.div>

                {/* Right Panel - Product Details */}
                <motion.div
                  className="w-4/5 rounded-md bg-white p-4"
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.4 }}
                >
                  {loading && filteredProducts.length === 0 ? (
                    <div>
                      <SkeletonLoader className="mb-4 h-6 w-1/3" />
                      <div className="mb-6 grid grid-cols-4 gap-4">
                        {[...Array(4)].map((_, i) => (
                          <motion.div
                            key={i}
                            className="rounded-lg border p-4"
                            variants={cardVariants}
                            initial="hidden"
                            animate="visible"
                            transition={{ delay: i * 0.1 }}
                          >
                            <SkeletonLoader className="mb-2 h-4 w-1/2" />
                            <SkeletonLoader className="h-8 w-3/4" />
                          </motion.div>
                        ))}
                      </div>
                      <SkeletonLoader className="mb-4 h-6 w-1/4" />
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              {[...Array(9)].map((_, i) => (
                                <th key={i} className="px-6 py-3 text-left">
                                  <SkeletonLoader className="h-4 w-3/4" />
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200 bg-white">
                            {[...Array(3)].map((_, i) => (
                              <tr key={i}>
                                {[...Array(9)].map((_, j) => (
                                  <td key={j} className="whitespace-nowrap px-6 py-4">
                                    <SkeletonLoader className="h-4 w-3/4" />
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ) : selectedProduct ? (
                    <div>
                      <motion.h2
                        className="mb-4 border-b text-lg font-semibold"
                        initial={{ x: -10, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                      >
                        Product Details for {selectedProduct.productName}
                      </motion.h2>

                      {/* Product Summary Cards */}
                      <div className="mb-6 grid grid-cols-4 gap-4">
                        <motion.div
                          className="rounded-lg border p-4"
                          variants={cardVariants}
                          initial="hidden"
                          animate="visible"
                          transition={{ delay: 0.1 }}
                        >
                          <div className="flex items-center gap-2">
                            <div className="rounded-lg bg-[#B1EEE226] p-3 ">
                              <SaleIcon />
                            </div>

                            <div>
                              <h3 className="text-sm font-medium text-gray-500">Sales Price</h3>
                              <motion.p className="text-2xl font-bold" initial={{ scale: 0.9 }} animate={{ scale: 1 }}>
                                ₹
                                {productTransactions?.salePrice?.toFixed(2) ||
                                  selectedProduct.salePrice?.toFixed(2) ||
                                  "N/A"}
                              </motion.p>
                            </div>
                          </div>
                        </motion.div>
                        <motion.div
                          className="rounded-lg border p-4"
                          variants={cardVariants}
                          initial="hidden"
                          animate="visible"
                          transition={{ delay: 0.2 }}
                        >
                          <div className="flex items-center gap-2">
                            <div className="rounded-lg bg-[#B1EEE226] p-3 ">
                              <PurchasesIcon />
                            </div>

                            <div>
                              <h3 className="text-sm font-medium text-gray-500">Purchase Price</h3>
                              <motion.p className="text-2xl font-bold" initial={{ scale: 0.9 }} animate={{ scale: 1 }}>
                                ₹
                                {productTransactions?.purchasePrice?.toFixed(2) ||
                                  selectedProduct.purchasePrice?.toFixed(2) ||
                                  "N/A"}
                              </motion.p>
                            </div>
                          </div>
                        </motion.div>
                        <motion.div
                          className="rounded-lg border p-4"
                          variants={cardVariants}
                          initial="hidden"
                          animate="visible"
                          transition={{ delay: 0.3 }}
                        >
                          <div className="flex items-center gap-2">
                            <div className="rounded-lg bg-[#B1EEE226] p-3 ">
                              <StockQuantityIcon />
                            </div>

                            <div>
                              <h3 className="text-sm font-medium text-gray-500">Stock Quantity</h3>
                              <motion.p className="text-2xl font-bold" initial={{ scale: 0.9 }} animate={{ scale: 1 }}>
                                {productTransactions?.stockQuantity || selectedProduct.currentStockLevel || "N/A"}
                              </motion.p>
                            </div>
                          </div>
                        </motion.div>
                        <motion.div
                          className="rounded-lg border p-4"
                          variants={cardVariants}
                          initial="hidden"
                          animate="visible"
                          transition={{ delay: 0.4 }}
                        >
                          <div className="flex items-center gap-2">
                            <div className="rounded-lg bg-[#B1EEE226] p-3 ">
                              <AvailableStockIcon />
                            </div>

                            <div>
                              <h3 className="text-sm font-medium text-gray-500">Available Units</h3>
                              <motion.p className="text-2xl font-bold" initial={{ scale: 0.9 }} animate={{ scale: 1 }}>
                                {productTransactions?.availableUnit || calculateAvailableQuantity(selectedProduct)}
                              </motion.p>
                            </div>
                          </div>
                        </motion.div>
                      </div>

                      <motion.h3
                        className="mb-4 text-lg font-semibold"
                        initial={{ x: -10, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                      >
                        Recent Transactions
                      </motion.h3>

                      {productTransactionsError && (
                        <motion.div
                          className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-red-600"
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                        >
                          {productTransactionsError}
                        </motion.div>
                      )}

                      <AnimatePresence>
                        {productTransactionsLoading ? (
                          <div className="space-y-4">
                            {[...Array(3)].map((_, i) => (
                              <motion.div
                                key={i}
                                className="flex items-center justify-between"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                              >
                                <SkeletonLoader className="h-12 w-full" />
                              </motion.div>
                            ))}
                          </div>
                        ) : transactions.length > 0 ? (
                          <>
                            <div className="overflow-x-auto">
                              <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                  <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                      S/N
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                      Type
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                      Invoice #
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                      Name
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                      Date
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                      Quantity
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                      Price/Unit
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                      Amount
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                      Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                      Action
                                    </th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                  {transactions.map((transaction, index) => (
                                    <motion.tr
                                      key={transaction.id}
                                      variants={tableRowVariants}
                                      initial="hidden"
                                      animate="visible"
                                      custom={index}
                                      whileHover={{ backgroundColor: "rgba(0, 0, 0, 0.02)" }}
                                    >
                                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{index + 1}</td>
                                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                        <div className="flex items-center gap-1">
                                          {getTransactionIcon(transaction.type)}
                                          {transaction.type}
                                        </div>
                                      </td>
                                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                        {transaction.invoiceNumber}
                                      </td>
                                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                        {transaction.name}
                                      </td>
                                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                        {new Date(transaction.date).toLocaleDateString()}
                                      </td>
                                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                        {transaction.quantity} {transaction.unit || "units"}
                                      </td>
                                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                        ₹
                                        {transaction.pricePerUnit?.toFixed(2) ||
                                          (transaction.amount / transaction.quantity).toFixed(2)}
                                      </td>
                                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                        ₹{transaction.amount?.toFixed(2)}
                                      </td>
                                      <td className="whitespace-nowrap px-6 py-4">
                                        <motion.span
                                          className={`rounded-full px-2 py-1 text-xs ${getStatusColor(
                                            transaction.status
                                          )}`}
                                          whileHover={{ scale: 1.05 }}
                                        >
                                          {transaction.status}
                                        </motion.span>
                                      </td>
                                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                        <motion.button
                                          onClick={() => handleViewTransaction(transaction)}
                                          className="flex items-center gap-1 text-blue-600 hover:text-blue-900"
                                          whileHover={{ scale: 1.05 }}
                                          whileTap={{ scale: 0.95 }}
                                        >
                                          View Details
                                        </motion.button>
                                      </td>
                                    </motion.tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>

                            {/* Load More Button */}
                            {productTransactions && !productTransactions.lastPage && (
                              <motion.div
                                className="mt-4 flex justify-center"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                              >
                                <ButtonModule
                                  variant="outline"
                                  size="sm"
                                  onClick={handleLoadMore}
                                  disabled={productTransactionsLoading}
                                >
                                  {productTransactionsLoading ? "Loading..." : "Load More"}
                                </ButtonModule>
                              </motion.div>
                            )}

                            <motion.div
                              className="mt-4 flex w-full justify-end gap-2"
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.3 }}
                            >
                              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                <ButtonModule variant="ghost" size="sm" icon={<CardPosIcon />} iconPosition="start">
                                  <p className="max-sm:hidden">Make Payment</p>
                                </ButtonModule>
                              </motion.div>
                              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                <ButtonModule variant="primary" size="sm" onClick={handleRefresh}>
                                  <p className="max-sm:hidden">Refresh</p>
                                </ButtonModule>
                              </motion.div>
                            </motion.div>
                          </>
                        ) : (
                          <motion.div
                            className="flex w-full flex-col items-center justify-center gap-3 py-8"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.5 }}
                          >
                            <EmptyState />
                            <p className="text-gray-500">No recent transactions found for this product.</p>
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                              <ButtonModule
                                variant="primary"
                                size="sm"
                                onClick={() => router.push("/transactions/invoice-detail")}
                              >
                                <p className="max-sm:hidden">Create Order</p>
                              </ButtonModule>
                            </motion.div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ) : (
                    <motion.div
                      className="flex h-full items-center justify-center py-12"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <div className="text-center">
                        <EmptyState />
                        <p className="mt-4 text-gray-500">Select a product to view details and transactions</p>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Transaction Details Modal */}
      <TransactionDetailsModal
        isOpen={isTransactionModalOpen}
        transaction={selectedTransaction}
        transactionDetails={transactionDetails}
        loading={transactionDetailsLoading}
        error={transactionDetailsError}
        onRequestClose={handleCloseTransactionModal}
      />
    </motion.section>
  )
}

export default Products
