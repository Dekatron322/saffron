"use client"
import DashboardNav from "components/Navbar/DashboardNav"
import { ButtonModule } from "components/ui/Button/Button"
import { SearchModule } from "components/ui/Search/search-module"
import { useRouter } from "next/navigation"
import CardPosIcon from "public/card-pos-icon"
import EmptyState from "public/empty-state"
import FilterIcon from "public/Icons/filter-icon"
import React, { useState, useEffect } from "react"

interface Customer {
  id: string
  name: string
}

interface Order {
  id: string
  customerId: string
  date: string
  amount: number
  invoiceNumber: string
  status: "Pending" | "Completed" | "Failed" | "Processing"
}

const OrderCreation = () => {
  const router = useRouter()
  const [searchText, setSearchText] = useState("")
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([])
  const [orders, setOrders] = useState<Order[]>([])

  // Mock data
  const customers: Customer[] = [
    { id: "1", name: "Fateemah Sweetena" },
    { id: "2", name: "Muritala Ibrahim" },
    { id: "3", name: "John Doe" },
    { id: "4", name: "Jane Smith" },
  ]

  const mockOrders: Order[] = [
    {
      id: "101",
      customerId: "1",
      date: "2023-05-15",
      amount: 120.5,
      invoiceNumber: "INV-2023-101",
      status: "Completed",
    },
    {
      id: "102",
      customerId: "1",
      date: "2023-05-10",
      amount: 85.0,
      invoiceNumber: "INV-2023-102",
      status: "Completed",
    },
    {
      id: "103",
      customerId: "2",
      date: "2023-05-12",
      amount: 210.75,
      invoiceNumber: "INV-2023-103",
      status: "Pending",
    },
    { id: "104", customerId: "3", date: "2023-05-08", amount: 45.99, invoiceNumber: "INV-2023-104", status: "Failed" },
    {
      id: "105",
      customerId: "1",
      date: "2023-05-05",
      amount: 75.25,
      invoiceNumber: "INV-2023-105",
      status: "Processing",
    },
  ]

  useEffect(() => {
    // Filter customers based on search text
    if (searchText) {
      const filtered = customers.filter((customer) => customer.name.toLowerCase().includes(searchText.toLowerCase()))
      setFilteredCustomers(filtered)
    } else {
      setFilteredCustomers(customers)
    }
  }, [searchText])

  useEffect(() => {
    // Load orders when a customer is selected
    if (selectedCustomer) {
      const customerOrders = mockOrders
        .filter((order) => order.customerId === selectedCustomer.id)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) // Sort by most recent
      setOrders(customerOrders)
    } else {
      setOrders([])
    }
  }, [selectedCustomer])

  const handleCancelSearch = () => {
    setSearchText("")
    setFilteredCustomers(customers)
  }

  const handleCustomerClick = (customer: Customer) => {
    setSelectedCustomer(customer)
  }

  const handleRepeatOrder = (orderId: string) => {
    // Implement repeat order functionality
    console.log(`Repeating order ${orderId}`)
    // In a real app, you would likely navigate to an order creation page with this order's details
  }

  const handleViewInvoice = () => {
    router.push(`transactions/invoice-detail`)
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

  return (
    <section className="h-auto w-full bg-[#F4F9F8]">
      <div className="flex min-h-screen w-full">
        <div className="flex w-full flex-col">
          <DashboardNav />
          <div className="flex flex-col items-start">
            <div className="max-sm-my-4 flex w-full gap-6 px-8 max-md:flex-col  max-sm:px-3 max-sm:py-4 md:my-8">
              <div className="flex w-full items-start gap-4">
                <div className="w-1/3 rounded-md bg-white p-4">
                  <div className="flex h-10 items-center gap-2">
                    <SearchModule
                      value={searchText}
                      onChange={(e) => setSearchText(e.target.value)}
                      onCancel={handleCancelSearch}
                      className="w-full rounded-md"
                    />
                    <FilterIcon />
                  </div>
                  <div className="mt-3">
                    <p className="text-lg font-semibold">Recent Customers</p>
                  </div>
                  <div className="mt-3 flex flex-col gap-2">
                    {filteredCustomers.map((customer) => (
                      <p
                        key={customer.id}
                        className={`cursor-pointer rounded-md p-2 text-sm ${
                          selectedCustomer?.id === customer.id ? "bg-[#e6f7f7] text-[#00a4a6]" : "hover:bg-gray-100"
                        }`}
                        onClick={() => handleCustomerClick(customer)}
                      >
                        {customer.name}
                      </p>
                    ))}
                  </div>
                </div>
                <div className="w-2/3 rounded-md bg-white p-4">
                  {selectedCustomer ? (
                    <div>
                      <h2 className="mb-4 border-b text-lg font-semibold">
                        Recent Transactions for {selectedCustomer.name}
                      </h2>
                      {orders.length > 0 ? (
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                  S/N
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                  Last Purchase
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                  Invoice #
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
                              {orders.map((order, index) => (
                                <tr key={order.id}>
                                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{index + 1}</td>
                                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                    {new Date(order.date).toLocaleDateString()}
                                  </td>
                                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                    {order.invoiceNumber}
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
                                    <button
                                      onClick={() => handleRepeatOrder(order.id)}
                                      className="flex items-center gap-1 text-blue-600 hover:text-blue-900"
                                    >
                                      Repeat
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                          <div className="mt-4 flex w-full justify-end gap-2">
                            <ButtonModule variant="ghost" size="sm" icon={<CardPosIcon />} iconPosition="start">
                              <p className="max-sm:hidden">Make Payment</p>
                            </ButtonModule>
                            <ButtonModule variant="primary" size="sm" onClick={() => handleViewInvoice()}>
                              <p className="max-sm:hidden">Refresh</p>
                            </ButtonModule>
                          </div>
                        </div>
                      ) : (
                        <div className="flex w-full flex-col items-center justify-center gap-3">
                          <EmptyState />
                          <p>No recent transactions found for this customer.</p>

                          <ButtonModule variant="primary" size="sm" onClick={() => handleViewInvoice()}>
                            <p className="max-sm:hidden">Create Order</p>
                          </ButtonModule>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <p className="text-gray-500">Select a customer to view their recent transactions</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default OrderCreation
