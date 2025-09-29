"use client"
import { ButtonModule } from "components/ui/Button/Button"
import AddSupplierModal from "components/ui/Modal/add-supplier-modal"
import { SearchModule } from "components/ui/Search/search-module"
import { useRouter } from "next/navigation"
import AddBusiness from "public/add-business"
import CardPosIcon from "public/card-pos-icon"
import ExportIcon from "public/export-icon"
import FilterIcon from "public/Icons/filter-icon"
import EmptyState from "public/empty-state"
import React, { useEffect, useState } from "react"
import { useAppDispatch, useAppSelector } from "app/api/store/store"
import { fetchAllSuppliers, selectSuppliers } from "app/api/store/supplierSlice"
import { AnimatePresence, motion } from "framer-motion"

interface Supplier {
  id: number
  name: string
  contactDetails: string
  address: string
  email: string
  gstNumber: string
  gstAddress: string
}

interface Order {
  id: string
  supplierId: number
  date: string
  amount: number
  invoiceNumber: string
  status: "Pending" | "Completed" | "Failed" | "Processing"
  items: {
    name: string
    quantity: number
    price: number
  }[]
}

const SkeletonLoader = () => {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex w-full items-start gap-4">
      <div className="flex h-[calc(80vh-180px)] w-1/3 flex-col rounded-md bg-white p-4">
        <div className="flex h-10 items-center gap-2">
          <div className="h-10 w-full animate-pulse rounded-md bg-gray-200"></div>
          <div className="h-10 w-10 animate-pulse rounded-md bg-gray-200"></div>
        </div>
        <div className="mt-3">
          <div className="h-6 w-32 animate-pulse rounded-md bg-gray-200"></div>
        </div>
        <div className="mt-3 flex flex-1 flex-col gap-2 overflow-y-auto">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="animate-pulse rounded-md p-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <div className="h-5 w-3/4 rounded bg-gray-200"></div>
              <div className="mt-1 h-3 w-1/2 rounded bg-gray-200"></div>
            </motion.div>
          ))}
        </div>
      </div>
      <div className="flex w-2/3 animate-pulse flex-col rounded-md bg-white p-4">
        <div className="mb-6 space-y-4 border-b pb-4">
          <div className="h-8 w-1/3 rounded bg-gray-200"></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="h-4 w-1/4 rounded bg-gray-200"></div>
              <div className="h-4 w-3/4 rounded bg-gray-200"></div>
              <div className="h-4 w-3/4 rounded bg-gray-200"></div>
              <div className="h-4 w-1/2 rounded bg-gray-200"></div>
            </div>
            <div className="space-y-2">
              <div className="h-4 w-1/4 rounded bg-gray-200"></div>
              <div className="h-4 w-3/4 rounded bg-gray-200"></div>
              <div className="h-4 w-1/4 rounded bg-gray-200"></div>
              <div className="h-4 w-3/4 rounded bg-gray-200"></div>
            </div>
          </div>
        </div>
        <div className="h-6 w-1/3 rounded bg-gray-200"></div>
        <div className="mt-4 space-y-4">
          <div className="h-10 w-full rounded bg-gray-200"></div>
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="h-20 w-full rounded bg-gray-200"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.15 }}
            ></motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

const SuppliersTab = () => {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { suppliers, loading, error } = useAppSelector(selectSuppliers)

  const [searchText, setSearchText] = useState("")
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null)
  const [filteredSuppliers, setFilteredSuppliers] = useState<Supplier[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [isAddSupplierOpen, setIsAddSupplierOpen] = useState(false)

  // Mock orders data - replace with actual API calls when available
  const mockOrders: Order[] = [
    {
      id: "101",
      supplierId: 1,
      date: "2023-05-15",
      amount: 120.5,
      invoiceNumber: "INV-2023-101",
      status: "Completed",
      items: [
        { name: "Product A", quantity: 2, price: 50 },
        { name: "Product B", quantity: 1, price: 20.5 },
      ],
    },
    {
      id: "102",
      supplierId: 1,
      date: "2023-05-10",
      amount: 85.0,
      invoiceNumber: "INV-2023-102",
      status: "Completed",
      items: [
        { name: "Product C", quantity: 3, price: 25 },
        { name: "Product D", quantity: 1, price: 10 },
      ],
    },
  ]

  useEffect(() => {
    // Fetch suppliers on component mount
    dispatch(fetchAllSuppliers())
  }, [dispatch])

  useEffect(() => {
    // Filter suppliers based on search text
    if (searchText) {
      const filtered = suppliers.filter(
        (supplier) =>
          supplier.name.toLowerCase().includes(searchText.toLowerCase()) ||
          supplier.email.toLowerCase().includes(searchText.toLowerCase()) ||
          supplier.contactDetails.includes(searchText)
      )
      setFilteredSuppliers(filtered)
    } else {
      setFilteredSuppliers(suppliers)
    }
  }, [searchText, suppliers])

  useEffect(() => {
    // Load orders when a supplier is selected
    if (selectedSupplier) {
      const supplierOrders = mockOrders
        .filter((order) => order.supplierId === selectedSupplier.id)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) // Sort by most recent
      setOrders(supplierOrders)
    } else {
      setOrders([])
    }
  }, [selectedSupplier])

  const handleCancelSearch = () => {
    setSearchText("")
    setFilteredSuppliers(suppliers)
  }

  const handleSupplierClick = (supplier: Supplier) => {
    setSelectedSupplier(supplier)
  }

  const handleRepeatOrder = (orderId: string) => {
    console.log(`Repeating order ${orderId}`)
    // Implement order repetition logic here
  }

  const handleViewInvoice = () => {
    router.push(`transactions/invoice-detail`)
  }

  const toggleAddSupplier = () => {
    setIsAddSupplierOpen((prev) => !prev)
  }

  const getStatusColor = (status: Order["status"]) => {
    switch (status) {
      case "Completed":
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

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: "numeric", month: "long", day: "numeric" }
    return new Date(dateString).toLocaleDateString(undefined, options)
  }

  if (loading && suppliers.length === 0) {
    return (
      <>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-4 flex w-full justify-between">
          <div className="h-8 w-32 animate-pulse rounded-md bg-gray-200"></div>
          <div className="flex gap-4">
            <div className="h-10 w-24 animate-pulse rounded-md bg-gray-200"></div>
            <div className="h-10 w-40 animate-pulse rounded-md bg-gray-200"></div>
          </div>
        </motion.div>
        <SkeletonLoader />
      </>
    )
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex h-full items-center justify-center text-red-500"
      >
        Error: {error}
      </motion.div>
    )
  }

  return (
    <>
      <AddSupplierModal isOpen={isAddSupplierOpen} onClose={toggleAddSupplier} />

      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-4 flex w-full justify-between"
      >
        <p className="text-xl font-semibold">Suppliers</p>
        <motion.div
          className="flex gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <ButtonModule
              variant="black"
              size="md"
              icon={<ExportIcon />}
              iconPosition="end"
              onClick={() => alert("Export functionality coming soon")}
            >
              <p className="max-sm:hidden">Export</p>
            </ButtonModule>
          </motion.div>

          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <ButtonModule
              variant="ghost"
              size="md"
              icon={<AddBusiness />}
              iconPosition="end"
              onClick={toggleAddSupplier}
            >
              <p className="max-sm:hidden">Add New Supplier</p>
            </ButtonModule>
          </motion.div>
        </motion.div>
      </motion.div>

      <div className="flex w-full items-start gap-4">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="flex h-[calc(80vh-180px)] w-1/3 flex-col rounded-md bg-white p-4"
        >
          <div className="flex h-10 items-center gap-2">
            <SearchModule
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onCancel={handleCancelSearch}
              className="w-full rounded-md"
            />
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <FilterIcon />
            </motion.div>
          </div>
          <div className="mt-3">
            <p className="text-lg font-semibold">Recent Suppliers</p>
          </div>
          <div className="mt-3 flex flex-1 flex-col gap-2 overflow-y-auto">
            {filteredSuppliers.length > 0 ? (
              <AnimatePresence>
                {filteredSuppliers.map((supplier) => (
                  <motion.div
                    key={supplier.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className={`cursor-pointer rounded-md p-2 text-sm ${
                      selectedSupplier?.id === supplier.id ? "bg-[#e6f7f7] text-[#00a4a6]" : "hover:bg-gray-100"
                    }`}
                    onClick={() => handleSupplierClick(supplier)}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <p className="font-medium">{supplier.name}</p>
                    <p className="text-xs text-gray-500">{supplier.email}</p>
                  </motion.div>
                ))}
              </AnimatePresence>
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 text-center text-gray-500">
                {searchText ? "No matching suppliers found" : "No suppliers available"}
              </motion.div>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="w-2/3 rounded-md bg-white p-4"
        >
          {selectedSupplier ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
              <div className="mb-6 border-b pb-4">
                <motion.h2 className="text-xl font-semibold" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  {selectedSupplier.name}
                </motion.h2>
                <div className="mt-2 grid grid-cols-1 gap-4 md:grid-cols-2">
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <h3 className="text-sm font-medium text-gray-500">Contact Information</h3>
                    <p className="mt-1">{selectedSupplier.email}</p>
                    <p>{selectedSupplier.contactDetails}</p>
                    <p className="mt-2 text-sm">GST Number: {selectedSupplier.gstNumber}</p>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                  >
                    <h3 className="text-sm font-medium text-gray-500">Address</h3>
                    <p className="mt-1">{selectedSupplier.address}</p>
                    <h3 className="mt-3 text-sm font-medium text-gray-500">GST Address</h3>
                    <p className="mt-1">{selectedSupplier.gstAddress}</p>
                  </motion.div>
                </div>
              </div>

              <h2 className="mb-4 border-b text-lg font-semibold">Recent Transactions</h2>
              {orders.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                          S/N
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                          Invoice #
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                          Items
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                          Total Amount
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
                      <AnimatePresence>
                        {orders.map((order, index) => (
                          <motion.tr
                            key={order.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.2, delay: index * 0.05 }}
                          >
                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{index + 1}</td>
                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                              {new Date(order.date).toLocaleDateString()}
                            </td>
                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{order.invoiceNumber}</td>
                            <td className="px-6 py-4 text-sm text-gray-500">
                              <div className="flex flex-col">
                                {order.items.map((item, i) => (
                                  <span key={i}>
                                    {item.quantity}x {item.name} (${item.price.toFixed(2)})
                                  </span>
                                ))}
                              </div>
                            </td>
                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                              ${order.amount.toFixed(2)}
                            </td>
                            <td className="whitespace-nowrap px-6 py-4">
                              <span className={`rounded-full px-2 py-1 text-xs ${getStatusColor(order.status)}`}>
                                {order.status}
                              </span>
                            </td>
                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                              <motion.button
                                onClick={() => handleRepeatOrder(order.id)}
                                className="flex items-center gap-1 text-blue-600 hover:text-blue-900"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                Repeat
                              </motion.button>
                            </td>
                          </motion.tr>
                        ))}
                      </AnimatePresence>
                    </tbody>
                  </table>
                  <motion.div
                    className="mt-4 flex w-full justify-end gap-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <ButtonModule variant="ghost" size="sm" icon={<CardPosIcon />} iconPosition="start">
                        <p className="max-sm:hidden">Make Payment</p>
                      </ButtonModule>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <ButtonModule variant="primary" size="sm" onClick={() => handleViewInvoice()}>
                        <p className="max-sm:hidden">Refresh</p>
                      </ButtonModule>
                    </motion.div>
                  </motion.div>
                </div>
              ) : (
                <motion.div
                  className="flex w-full flex-col items-center justify-center gap-3"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <EmptyState />
                  <p>No recent transactions found for this supplier.</p>
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <ButtonModule variant="primary" size="sm" onClick={() => handleViewInvoice()}>
                      <p className="max-sm:hidden">Create Order</p>
                    </ButtonModule>
                  </motion.div>
                </motion.div>
              )}
            </motion.div>
          ) : (
            <motion.div
              className="flex h-full flex-col items-center justify-center gap-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <EmptyState />
              <p className="text-gray-500">Select a supplier to view details</p>
            </motion.div>
          )}
        </motion.div>
      </div>
    </>
  )
}

export default SuppliersTab
