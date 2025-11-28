"use client"
import React, { useEffect, useRef, useState } from "react"
import { RxDotsVertical } from "react-icons/rx"
import { MdOutlineArrowBackIosNew, MdOutlineArrowForwardIos, MdOutlineCheckBoxOutlineBlank } from "react-icons/md"
import { ButtonModule } from "components/ui/Button/Button"
import ExportIcon from "public/export-icon"
import { SearchModule } from "components/ui/Search/search-module"
import EmptyState from "public/empty-state"
import AddBusiness from "public/add-business"
import { useRouter } from "next/navigation"
import { useDispatch, useSelector } from "react-redux"
import AddUnitModal from "components/ui/Modal/add-unit-modal"
import { fetchAllUnits, selectUnits } from "app/api/store/unitSlice"
import DashboardNav from "components/Navbar/DashboardNav"
import ArrowForwardIcon from "public/arrow-forward-icon"

type SortOrder = "asc" | "desc" | null

interface Unit {
  unitId: number
  baseUnit: string
  secondaryUnit: string
  shortName: string
}

const SkeletonLoader = () => {
  return (
    <div className="w-full overflow-x-auto border-l border-r">
      <table className="w-full min-w-[800px] border-separate border-spacing-0 text-left">
        <thead>
          <tr>
            <th className="whitespace-nowrap border-b bg-[#F4F9F8] p-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="size-5 animate-pulse rounded bg-gray-200"></div>
                <div className="h-4 w-16 animate-pulse rounded bg-gray-200"></div>
              </div>
            </th>
            <th className="whitespace-nowrap border-b bg-[#F4F9F8] p-4 text-sm">
              <div className="h-4 w-24 animate-pulse rounded bg-gray-200"></div>
            </th>
            <th className="whitespace-nowrap border-b bg-[#F4F9F8] p-4 text-sm">
              <div className="h-4 w-24 animate-pulse rounded bg-gray-200"></div>
            </th>
            <th className="whitespace-nowrap border-b bg-[#F4F9F8] p-4 text-sm">
              <div className="h-4 w-24 animate-pulse rounded bg-gray-200"></div>
            </th>
            <th className="whitespace-nowrap border-b bg-[#F4F9F8] p-4 text-sm">
              <div className="h-4 w-16 animate-pulse rounded bg-gray-200"></div>
            </th>
          </tr>
        </thead>
        <tbody>
          {[...Array(5)].map((_, index) => (
            <tr key={index}>
              <td className="whitespace-nowrap border-b px-4 py-3 text-sm">
                <div className="flex items-center gap-2">
                  <div className="size-5 animate-pulse rounded bg-gray-200"></div>
                  <div className="h-4 w-8 animate-pulse rounded bg-gray-200"></div>
                </div>
              </td>
              <td className="whitespace-nowrap border-b px-4 py-3 text-sm">
                <div className="h-4 w-32 animate-pulse rounded bg-gray-200"></div>
              </td>
              <td className="whitespace-nowrap border-b px-4 py-3 text-sm">
                <div className="h-4 w-32 animate-pulse rounded bg-gray-200"></div>
              </td>
              <td className="whitespace-nowrap border-b px-4 py-3 text-sm">
                <div className="h-4 w-16 animate-pulse rounded bg-gray-200"></div>
              </td>
              <td className="whitespace-nowrap border-b px-4 py-3 text-sm">
                <div className="size-8 animate-pulse rounded-full bg-gray-200"></div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

const DropdownMenu = ({ unit, onClose }: { unit: Unit; onClose: () => void }) => {
  const router = useRouter()

  const handleViewDetails = () => {
    console.log("View details for unit:", unit.unitId)
    onClose()
  }

  const handleEdit = () => {
    console.log("Edit unit:", unit.unitId)
    onClose()
  }

  const handleDelete = () => {
    console.log("Delete unit:", unit.unitId)
    onClose()
  }

  return (
    <div className="absolute right-0 z-50 mt-2 w-48 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
      <div className="py-1">
        <button
          onClick={handleViewDetails}
          className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
        >
          View Details
        </button>
        <button
          onClick={handleEdit}
          className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
        >
          Edit
        </button>
        <button
          onClick={handleDelete}
          className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-100"
        >
          Delete
        </button>
      </div>
    </div>
  )
}

const exportToCSV = (data: Unit[], filename: string) => {
  // Create CSV headers
  const headers = ["ID", "Base Unit", "Secondary Unit", "Short Name"]

  // Create CSV rows
  const rows = data.map((unit) => [unit.unitId, `"${unit.baseUnit}"`, `"${unit.secondaryUnit}"`, `"${unit.shortName}"`])

  // Combine headers and rows
  const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n")

  // Create blob and download
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
  const link = document.createElement("a")
  const url = URL.createObjectURL(blob)

  link.setAttribute("href", url)
  link.setAttribute("download", filename)
  link.style.visibility = "hidden"

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

const AllUnits = () => {
  const router = useRouter()
  const dispatch = useDispatch()
  const { units, loading, error } = useSelector(selectUnits)

  const [sortColumn, setSortColumn] = useState<string | null>(null)
  const [sortOrder, setSortOrder] = useState<SortOrder>(null)
  const [searchText, setSearchText] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(7)
  const [activeDropdown, setActiveDropdown] = useState<number | null>(null)
  const dropdownRefs = useRef<(HTMLDivElement | null)[]>([])
  const [isAddUnitOpen, setIsAddUnitOpen] = useState(false)

  useEffect(() => {
    dispatch(fetchAllUnits() as any)
  }, [dispatch])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        activeDropdown !== null &&
        dropdownRefs.current[activeDropdown] &&
        !dropdownRefs.current[activeDropdown]?.contains(event.target as Node)
      ) {
        setActiveDropdown(null)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [activeDropdown])

  const toggleDropdown = (index: number) => {
    setActiveDropdown(activeDropdown === index ? null : index)
  }

  const toggleSort = (column: keyof Unit) => {
    const isAscending = sortColumn === column && sortOrder === "asc"
    setSortOrder(isAscending ? "desc" : "asc")
    setSortColumn(column)

    const sortedUnits = [...units].sort((a, b) => {
      if (a[column] < b[column]) return isAscending ? 1 : -1
      if (a[column] > b[column]) return isAscending ? -1 : 1
      return 0
    })
  }

  const handleCancelSearch = () => {
    setSearchText("")
  }

  const toggleAddUnit = () => {
    setIsAddUnitOpen((prev) => !prev)
  }

  const handleExport = () => {
    const dataToExport = searchText ? filteredUnits : units
    exportToCSV(dataToExport, "units_export.csv")
  }

  const filteredUnits = units.filter((unit) =>
    Object.values(unit).some((value) => {
      if (value === null || value === undefined) return false
      return String(value).toLowerCase().includes(searchText.toLowerCase())
    })
  )

  const indexOfLastUnit = currentPage * itemsPerPage
  const indexOfFirstUnit = indexOfLastUnit - itemsPerPage
  const currentUnits = filteredUnits.slice(indexOfFirstUnit, indexOfLastUnit)

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber)

  return (
    <section className="h-auto w-full bg-[#F4F9F8]">
      <div className="flex min-h-screen w-full">
        <div className="flex w-full flex-col">
          <DashboardNav />
          <div className="mt-4 flex flex-col items-start px-8">
            <div className="mb-5 flex w-full justify-between">
              <div className="flex items-center gap-2">
                <p className="text-[#94A3B8]">Inventory</p>
                <ArrowForwardIcon />
                <p>Units</p>
              </div>
              <ButtonModule
                variant="primary"
                size="sm"
                icon={<AddBusiness color="#ffffff" />}
                iconPosition="start"
                onClick={toggleAddUnit}
              >
                <p className="max-sm:hidden">Add Unit</p>
              </ButtonModule>
            </div>
            <AddUnitModal isOpen={isAddUnitOpen} onClose={toggleAddUnit} />

            <div className="flex w-full flex-col rounded-md border bg-white p-3 md:p-5">
              {/* Header */}
              <div className="items-center justify-between border-b py-2 md:flex md:py-4">
                <p className="text-lg font-semibold max-sm:pb-3 md:text-2xl">All Units</p>
                <div className="flex gap-4">
                  <SearchModule
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    onCancel={handleCancelSearch}
                  />
                  <ButtonModule
                    variant="black"
                    size="md"
                    icon={<ExportIcon />}
                    iconPosition="end"
                    onClick={handleExport}
                  >
                    <p className="max-sm:hidden">Export</p>
                  </ButtonModule>
                </div>
              </div>

              {loading ? (
                <SkeletonLoader />
              ) : error ? (
                <div className="flex h-60 flex-col items-center justify-center gap-2 bg-[#F4F9F8]">
                  <div className="text-center">
                    <EmptyState />
                    <p className="text-xl font-bold text-[#D82E2E]">Failed to load units.</p>
                    <p>{error}</p>
                  </div>
                </div>
              ) : filteredUnits.length === 0 ? (
                <div className="flex h-60 flex-col items-center justify-center gap-2 bg-[#F4F9F8]">
                  <EmptyState />
                  <p className="text-base font-bold text-[#202B3C]">No units found.</p>
                </div>
              ) : (
                <>
                  <div className="w-full overflow-x-auto border-l border-r">
                    <table className="w-full min-w-[800px] border-separate border-spacing-0 text-left">
                      <thead>
                        <tr>
                          <th className="whitespace-nowrap border-b bg-[#F4F9F8] p-4 text-sm">
                            <div className="flex items-center gap-2">
                              <MdOutlineCheckBoxOutlineBlank className="text-lg" />
                              ID
                            </div>
                          </th>
                          <th
                            className="cursor-pointer whitespace-nowrap border-b bg-[#F4F9F8] p-4 text-sm"
                            onClick={() => toggleSort("baseUnit")}
                          >
                            <div className="flex items-center gap-2">
                              Base Unit {sortColumn === "baseUnit" && (sortOrder === "asc" ? "↑" : "↓")}
                            </div>
                          </th>
                          <th
                            className="cursor-pointer whitespace-nowrap border-b bg-[#F4F9F8] p-4 text-sm"
                            onClick={() => toggleSort("secondaryUnit")}
                          >
                            <div className="flex items-center gap-2">
                              Secondary Unit {sortColumn === "secondaryUnit" && (sortOrder === "asc" ? "↑" : "↓")}
                            </div>
                          </th>
                          <th
                            className="cursor-pointer whitespace-nowrap border-b bg-[#F4F9F8] p-4 text-sm"
                            onClick={() => toggleSort("shortName")}
                          >
                            <div className="flex items-center gap-2">
                              Short Name {sortColumn === "shortName" && (sortOrder === "asc" ? "↑" : "↓")}
                            </div>
                          </th>
                          <th className="whitespace-nowrap border-b bg-[#F4F9F8] p-4 text-sm">
                            <div className="flex items-center gap-2">Action</div>
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentUnits.map((unit, index) => (
                          <tr key={unit.unitId}>
                            <td className="whitespace-nowrap border-b px-4 py-2 text-sm">
                              <div className="flex items-center gap-2">
                                <MdOutlineCheckBoxOutlineBlank className="text-lg" />
                                {unit.unitId}
                              </div>
                            </td>
                            <td className="whitespace-nowrap border-b px-4 py-2 text-sm">
                              <div className="flex items-center gap-2">{unit.baseUnit}</div>
                            </td>
                            <td className="whitespace-nowrap border-b px-4 py-2 text-sm">
                              <div className="flex items-center gap-2">{unit.secondaryUnit}</div>
                            </td>
                            <td className="whitespace-nowrap border-b px-4 py-2 text-sm">
                              <div className="flex items-center gap-2">{unit.shortName}</div>
                            </td>
                            <td className="whitespace-nowrap border-b px-4 py-1 text-sm">
                              <div
                                className="relative flex items-center gap-2"
                                ref={(el) => {
                                  dropdownRefs.current[index] = el
                                }}
                              >
                                <button
                                  onClick={() => toggleDropdown(index)}
                                  className="flex items-center gap-2 rounded p-1 hover:bg-gray-100"
                                >
                                  <RxDotsVertical />
                                </button>
                                {activeDropdown === index && (
                                  <DropdownMenu unit={unit} onClose={() => setActiveDropdown(null)} />
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
                      Showing {indexOfFirstUnit + 1} to {Math.min(indexOfLastUnit, filteredUnits.length)} of{" "}
                      {filteredUnits.length} entries
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => paginate(currentPage - 1)}
                        disabled={currentPage === 1}
                        className={`rounded-full px-2 py-1 ${
                          currentPage === 1
                            ? "cursor-not-allowed bg-gray-200 text-gray-500"
                            : "bg-gray-200 hover:bg-gray-300"
                        }`}
                      >
                        <MdOutlineArrowBackIosNew />
                      </button>

                      {Array.from({ length: Math.ceil(filteredUnits.length / itemsPerPage) }).map((_, index) => (
                        <button
                          key={index}
                          onClick={() => paginate(index + 1)}
                          className={`rounded-full px-3 py-1 ${
                            currentPage === index + 1 ? "bg-primary text-[#ffffff]" : "bg-gray-200 hover:bg-gray-300"
                          }`}
                        >
                          {index + 1}
                        </button>
                      ))}

                      <button
                        onClick={() => paginate(currentPage + 1)}
                        disabled={currentPage === Math.ceil(filteredUnits.length / itemsPerPage)}
                        className={`rounded-full px-2 py-1 ${
                          currentPage === Math.ceil(filteredUnits.length / itemsPerPage)
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
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default AllUnits
