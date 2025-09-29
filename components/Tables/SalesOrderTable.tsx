"use client"
import React, { useState, useRef, useEffect } from "react"
import { RxCaretSort, RxDotsVertical } from "react-icons/rx"
import { MdOutlineArrowBackIosNew, MdOutlineArrowForwardIos, MdOutlineCheckBoxOutlineBlank } from "react-icons/md"
import OutgoingIcon from "public/outgoing-icon"
import IncomingIcon from "public/incoming-icon"
import EmptyState from "public/empty-state"
import DeleteModal from "components/ui/Modal/delete-modal"
import { ButtonModule } from "components/ui/Button/Button"
import AddItemModal from "components/ui/Modal/add-item-modal"

type SortOrder = "asc" | "desc" | null
type Order = {
  sn: number
  itemName: string
  manufacturer: string
  mfgdate: string
  expirydate: string
  unitPrice: string
  quantity: string
  discount: string
  subtotal: string
  tax: string
  totalPrice: string
}

const SalesOrderTable = () => {
  const [sortColumn, setSortColumn] = useState<string | null>(null)
  const [sortOrder, setSortOrder] = useState<SortOrder>(null)
  const [searchText, setSearchText] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(7)
  const [activeDropdown, setActiveDropdown] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Modal state
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false)
  const [deleteReason, setDeleteReason] = useState("")
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [isAddModalOpen, setAddModalOpen] = useState(false)
  const [addLoading, setAddLoading] = useState(false)

  const dropdownRefs = useRef<(HTMLDivElement | null)[]>([])

  // Handle click outside dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (activeDropdown !== null) {
        const dropdownElement = dropdownRefs.current[activeDropdown]
        if (dropdownElement && !dropdownElement.contains(event.target as Node)) {
          setActiveDropdown(null)
        }
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [activeDropdown])

  const [orders, setOrders] = useState<Order[]>([
    {
      sn: 1,
      itemName: "Paracetamol 500mg",
      manufacturer: "XYZ Pharma",
      mfgdate: "01-10-2024",
      expirydate: "01-10-2024",
      unitPrice: "5.00",
      quantity: "2",
      discount: "5",
      subtotal: "9.50",
      tax: "0.48",
      totalPrice: "9.98",
    },
    {
      sn: 2,
      itemName: "Vitamin C 1000mg",
      manufacturer: "ABC Meds",
      mfgdate: "01-10-2024",
      expirydate: "01-10-2024",
      unitPrice: "5.00",
      quantity: "2",
      discount: "5",
      subtotal: "9.50",
      tax: "0.48",
      totalPrice: "9.98",
    },
  ])

  // SORTING
  const toggleSort = (column: keyof Order) => {
    const isAsc = sortColumn === column && sortOrder === "asc"
    setSortOrder(isAsc ? "desc" : "asc")
    setSortColumn(column)
    const sorted = [...orders].sort((a, b) =>
      a[column] < b[column] ? (isAsc ? 1 : -1) : a[column] > b[column] ? (isAsc ? -1 : 1) : 0
    )
    setOrders(sorted)
  }

  // PAGINATION
  const filteredOrders = orders.filter((order) =>
    Object.values(order).some((val) => val != null && String(val).toLowerCase().includes(searchText.toLowerCase()))
  )
  const indexOfLast = currentPage * itemsPerPage
  const indexOfFirst = indexOfLast - itemsPerPage
  const currentOrders = filteredOrders.slice(indexOfFirst, indexOfLast)
  const paginate = (num: number) => setCurrentPage(num)

  // DROPDOWN
  const toggleDropdown = (idx: number) => setActiveDropdown(activeDropdown === idx ? null : idx)

  // OPEN DELETE MODAL
  const handleDeleteClick = (order: Order, idx: number) => {
    setSelectedOrder(order)
    setDeleteReason("")
    setDeleteModalOpen(true)
    setActiveDropdown(null)
  }

  // CONFIRM DELETE FROM MODAL
  const handleConfirmDelete = (reason: string) => {
    setDeleteLoading(true)
    // replace with real API call if needed
    setTimeout(() => {
      setOrders((prev) => prev.filter((o) => o.itemName !== selectedOrder?.itemName))
      setDeleteLoading(false)
      setDeleteModalOpen(false)
    }, 800)
  }

  const handleAddItem = (data: {
    itemName: string
    manufacturer: string
    mfgdate: string
    expirydate: string
    unitPrice: string
    quantity: string
    discount: string
    subtotal: string
    tax: string
    totalPrice: string
  }) => {
    setAddLoading(true)
    setTimeout(() => {
      const newSn = orders.length + 1
      const newOrder: Order = {
        sn: newSn,
        itemName: data.itemName,
        manufacturer: data.manufacturer,
        mfgdate: data.mfgdate,
        expirydate: data.expirydate,
        unitPrice: data.unitPrice,
        quantity: data.quantity,
        discount: data.discount,
        subtotal: data.subtotal,
        tax: data.tax,
        totalPrice: data.totalPrice,
      }
      setOrders((prev) => [...prev, newOrder])
      setAddLoading(false)
      setAddModalOpen(false)
    }, 800)
  }

  return (
    <div className="flex-3 mt-3 flex flex-col rounded-md  bg-white ">
      {/* Header */}
      <div className="items-center justify-between border-b py-2 md:flex md:py-4">
        <p className="text-lg font-semibold md:text-xl">Sales Order</p>
        <ButtonModule variant="primary" size="md" onClick={() => setAddModalOpen(true)}>
          <p className="max-sm:hidden">Add New Item</p>
        </ButtonModule>
      </div>

      {/* Error / Empty */}
      {error ? (
        <div className="flex h-60 flex-col items-center justify-center bg-[#F4F9F8]">
          <EmptyState />
          <p className="mt-2 text-xl font-bold text-[#D82E2E]">Failed to load Sales order.</p>
          <p>Please refresh or try again later.</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="flex h-60 flex-col items-center justify-center bg-[#F4F9F8]">
          <EmptyState />
          <p className="mt-2 text-base font-bold text-[#202B3C]">No Sales Order found.</p>
        </div>
      ) : (
        <>
          {/* Table */}
          <div className="w-full overflow-x-auto border-x">
            <table className="w-full min-w-[800px] border-separate border-spacing-0 text-left">
              <thead>
                <tr className="bg-[#F4F9F8]">
                  <th
                    className="flex cursor-pointer items-center gap-2 border-b p-4 text-sm"
                    onClick={() => toggleSort("sn")}
                  >
                    <MdOutlineCheckBoxOutlineBlank className="text-lg" />
                    SN <RxCaretSort />
                  </th>

                  <th className="cursor-pointer border-b p-4 text-sm" onClick={() => toggleSort("itemName")}>
                    <div className="flex items-center gap-2 whitespace-nowrap">
                      Product Name <RxCaretSort />
                    </div>
                  </th>

                  <th className="cursor-pointer border-b p-4 text-sm" onClick={() => toggleSort("manufacturer")}>
                    <div className="flex items-center gap-2 whitespace-nowrap">
                      Manufacturer <RxCaretSort />
                    </div>
                  </th>
                  <th className="cursor-pointer border-b p-4 text-sm" onClick={() => toggleSort("mfgdate")}>
                    <div className="flex items-center gap-2 whitespace-nowrap">
                      MFG Date <RxCaretSort />
                    </div>
                  </th>
                  <th className="cursor-pointer border-b p-4 text-sm" onClick={() => toggleSort("expirydate")}>
                    <div className="flex items-center gap-2 whitespace-nowrap">
                      Expiry Date <RxCaretSort />
                    </div>
                  </th>
                  <th className="cursor-pointer border-b p-4 text-sm" onClick={() => toggleSort("unitPrice")}>
                    <div className="flex items-center gap-2 whitespace-nowrap">
                      Unit Price <RxCaretSort />
                    </div>
                  </th>
                  <th className="cursor-pointer border-b p-4 text-sm" onClick={() => toggleSort("quantity")}>
                    <div className="flex items-center gap-2">
                      Quantity <RxCaretSort />
                    </div>
                  </th>
                  <th className="cursor-pointer border-b p-4 text-sm" onClick={() => toggleSort("discount")}>
                    <div className="flex items-center gap-2">
                      Discount <RxCaretSort />
                    </div>
                  </th>
                  <th className="cursor-pointer border-b p-4 text-sm" onClick={() => toggleSort("subtotal")}>
                    <div className="flex items-center gap-2">
                      Subtotal <RxCaretSort />
                    </div>
                  </th>
                  <th className="cursor-pointer border-b p-4 text-sm" onClick={() => toggleSort("tax")}>
                    <div className="flex items-center gap-2">
                      Tax <RxCaretSort />
                    </div>
                  </th>
                  <th className="cursor-pointer border-b p-4 text-sm" onClick={() => toggleSort("totalPrice")}>
                    <div className="flex items-center gap-2 whitespace-nowrap">
                      Total Price <RxCaretSort />
                    </div>
                  </th>

                  <th className="border-b p-4 text-sm">Action</th>
                </tr>
              </thead>
              <tbody>
                {currentOrders.map((order, idx) => (
                  <tr key={idx}>
                    <td className="whitespace-nowrap border-b px-4 py-2 text-sm">
                      <div className="flex items-center gap-2">
                        <MdOutlineCheckBoxOutlineBlank className="text-lg" />
                        {order.sn}
                      </div>
                    </td>

                    <td className="whitespace-nowrap border-b px-4 py-2 text-sm">
                      <div className="flex items-center gap-2">{order.itemName}</div>
                    </td>

                    <td className="whitespace-nowrap border-b px-4 py-2 text-sm">
                      <div className="flex items-center gap-2">{order.manufacturer}</div>
                    </td>
                    <td className="border-b px-4 py-2 text-sm">
                      <div className="flex items-center gap-2">{order.mfgdate}</div>
                    </td>
                    <td className="border-b px-4 py-2 text-sm">
                      <div className="flex items-center gap-2">{order.expirydate}</div>
                    </td>
                    <td className="border-b px-4 py-2 text-sm">
                      <div className="flex items-center gap-2">₹{order.unitPrice}</div>
                    </td>
                    <td className="whitespace-nowrap border-b px-4 py-3 text-sm">
                      <div className="flex">
                        <div className="flex items-center justify-center gap-1 rounded-full px-2 py-1">
                          {order.quantity}
                        </div>
                      </div>
                    </td>
                    <td className="border-b px-4 py-2 text-sm">
                      <div className="flex items-center gap-2">{order.discount}%</div>
                    </td>
                    <td className="border-b px-4 py-2 text-sm">
                      <div className="flex items-center gap-2">₹{order.subtotal}</div>
                    </td>
                    <td className="border-b px-4 py-2 text-sm">
                      <div className="flex items-center gap-2">{order.tax}%</div>
                    </td>
                    <td className="whitespace-nowrap border-b px-4 py-3 text-sm">
                      <div className="flex">
                        <div className="flex items-center justify-center gap-1 rounded-full px-2 py-1">
                          <span className="text-grey-400">₹</span>
                          {order.totalPrice}
                        </div>
                      </div>
                    </td>

                    <td className="relative border-b px-4 py-1 text-sm">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleDropdown(idx)
                          }}
                          className="rounded p-1 hover:bg-gray-100"
                        >
                          <RxDotsVertical />
                        </button>
                        {activeDropdown === idx && (
                          <div
                            ref={(el) => {
                              dropdownRefs.current[idx] = el
                            }}
                            className="absolute right-0 z-10 mt-2 w-32 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5"
                          >
                            <div className="py-1">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  // your edit handler
                                }}
                                className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                              >
                                Edit
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleDeleteClick(order, idx)
                                }}
                                className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between border-t px-4 py-3">
            <div className="text-sm text-gray-700">
              Showing {indexOfFirst + 1} to {Math.min(indexOfLast, filteredOrders.length)} of {filteredOrders.length}{" "}
              entries
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className={`rounded-full px-2 py-1 ${
                  currentPage === 1 ? "cursor-not-allowed bg-gray-200 text-gray-500" : "bg-gray-200 hover:bg-gray-300"
                }`}
              >
                <MdOutlineArrowBackIosNew />
              </button>
              {Array.from({
                length: Math.ceil(filteredOrders.length / itemsPerPage),
              }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => paginate(i + 1)}
                  className={`rounded-full px-3 py-1 ${
                    currentPage === i + 1 ? "bg-primary text-white" : "bg-gray-200 hover:bg-gray-300"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === Math.ceil(filteredOrders.length / itemsPerPage)}
                className={`rounded-full px-2 py-1 ${
                  currentPage === Math.ceil(filteredOrders.length / itemsPerPage)
                    ? "cursor-not-allowed bg-gray-200 text-gray-500"
                    : "bg-gray-200 hover:bg-gray-300"
                }`}
              >
                <MdOutlineArrowForwardIos />
              </button>
            </div>
          </div>
        </>
      )}

      <AddItemModal
        isOpen={isAddModalOpen}
        onRequestClose={() => setAddModalOpen(false)}
        onSubmit={handleAddItem}
        loading={addLoading}
      />

      {/* Delete Confirmation Modal */}
      <DeleteModal
        isOpen={isDeleteModalOpen}
        onRequestClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        loading={deleteLoading}
        businessName={selectedOrder?.itemName || ""}
      />
    </div>
  )
}

export default SalesOrderTable
