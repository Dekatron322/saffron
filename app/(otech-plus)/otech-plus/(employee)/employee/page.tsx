"use client"
import DashboardNav from "components/Navbar/DashboardNav"
import { ButtonModule } from "components/ui/Button/Button"
import AddBusiness from "public/add-business"
import React, { useEffect, useRef, useState } from "react"
import AddBusinessModal from "components/ui/Modal/add-item-modal"
import { useRouter } from "next/navigation"
import Filtericon from "public/filter-icon"
import { RxDotsVertical } from "react-icons/rx"
import DeleteModal from "components/ui/Modal/delete-modal"
import EditModal from "components/ui/Modal/edit-modal"

const practitionersData = [
  {
    id: 1,
    name: "Adegboyega & Akinsanya LLC",
    description: "Lorem ipsum dolor sit amet consectetur",
    clients: 7,
    reports: 106,
    rating: 4.5,
    reviews: 12,
    status: "online",
    accountManagementPrice: "80,000",
    reportSigningPrice: "10,000",
    avatar: "AA",
  },
  {
    id: 2,
    name: "Johnson & Partners",
    description: "Lorem ipsum dolor sit amet consectetur",
    clients: 10,
    reports: 150,
    rating: 4.8,
    reviews: 20,
    status: "online",
    accountManagementPrice: "100,000",
    reportSigningPrice: "15,000",
    avatar: "JP",
  },
  {
    id: 3,
    name: "Kalu Consulting Firm",
    description: "Lorem ipsum dolor sit amet consectetur",
    clients: 5,
    reports: 80,
    rating: 4.2,
    reviews: 8,
    status: "offline",
    accountManagementPrice: "60,000",
    reportSigningPrice: "8,000",
    avatar: "KC",
  },
  {
    id: 4,
    name: "Williams Legal Associates",
    description: "Lorem ipsum dolor sit amet consectetur",
    clients: 12,
    reports: 200,
    rating: 4.9,
    reviews: 25,
    status: "online",
    accountManagementPrice: "120,000",
    reportSigningPrice: "20,000",
    avatar: "WA",
  },
]

export default function AllTransactions() {
  const [isAddBusinessModalOpen, setIsAddBusinessModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [openDropdownId, setOpenDropdownId] = useState<number | null>(null)
  const [editModalState, setEditModalState] = useState({
    isOpen: false,
    practitioner: null as {
      id: number
      name: string
      description: string
      accountManagementPrice: string
      reportSigningPrice: string
    } | null,
  })
  const [isEditing, setIsEditing] = useState(false)

  const handleEdit = (id: number) => {
    const practitioner = practitionersData.find((p) => p.id === id)
    if (practitioner) {
      setEditModalState({
        isOpen: true,
        practitioner: {
          id: practitioner.id,
          name: practitioner.name,
          description: practitioner.description,
          accountManagementPrice: practitioner.accountManagementPrice,
          reportSigningPrice: practitioner.reportSigningPrice,
        },
      })
    }
    setOpenDropdownId(null)
  }

  const handleSaveEdit = async (data: {
    name: string
    description: string
    accountManagementPrice: string
    reportSigningPrice: string
  }) => {
    setIsEditing(true)
    try {
      console.log(`Saving changes for practitioner ${editModalState.practitioner?.id}:`, data)
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setEditModalState({
        isOpen: false,
        practitioner: null,
      })
    } catch (error) {
      console.error("Error saving practitioner:", error)
    } finally {
      setIsEditing(false)
    }
  }

  const closeEditModal = () => {
    setEditModalState({
      isOpen: false,
      practitioner: null,
    })
  }

  const [deleteModalState, setDeleteModalState] = useState({
    isOpen: false,
    practitionerId: null as number | null,
    practitionerName: "",
  })
  const [isDeleting, setIsDeleting] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdownId(null)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const toggleDropdown = (id: number) => {
    setOpenDropdownId(openDropdownId === id ? null : id)
  }

  const handleDelete = (id: number) => {
    const practitioner = practitionersData.find((p) => p.id === id)
    if (practitioner) {
      setDeleteModalState({
        isOpen: true,
        practitionerId: id,
        practitionerName: practitioner.name,
      })
    }
    setOpenDropdownId(null)
  }

  const handleConfirmDelete = async (reason: string) => {
    setIsDeleting(true)
    try {
      console.log(`Deleting practitioner ${deleteModalState.practitionerId} with reason: ${reason}`)
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))
      // Add your actual delete logic here (API call, etc.)
      // After successful deletion, you might want to update the practitionersData state
    } catch (error) {
      console.error("Error deleting practitioner:", error)
    } finally {
      setIsDeleting(false)
      setDeleteModalState({
        isOpen: false,
        practitionerId: null,
        practitionerName: "",
      })
    }
  }

  const closeDeleteModal = () => {
    setDeleteModalState({
      isOpen: false,
      practitionerId: null,
      practitionerName: "",
    })
  }

  const handleHire = () => {
    router.push("employee/employee-detail")
  }

  const toggleFilter = () => {
    setIsFilterOpen(!isFilterOpen)
  }

  const handleAddBusiness = async (businessData: { name: string; email: string; phone: string; address: string }) => {
    setIsSubmitting(true)
    try {
      console.log("Adding business:", businessData)
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setIsAddBusinessModalOpen(false)
    } catch (error) {
      console.error("Error adding business:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="h-full w-full">
      <div className="flex min-h-screen w-full">
        <div className="flex w-full flex-col">
          <DashboardNav />
          <div className="flex flex-col">
            <div className="flex items-center justify-between border-b px-8 py-4">
              <p className="text-2xl font-medium">Employee Page</p>
              <ButtonModule
                variant="primary"
                size="md"
                icon={<AddBusiness />}
                iconPosition="start"
                onClick={() => setIsAddBusinessModalOpen(true)}
              >
                Add Employee
              </ButtonModule>
            </div>

            <div className="max-sm-my-4 flex w-full gap-6 px-8 max-md:flex-col max-md:px-0 max-sm:px-3 md:my-8">
              <div className="flex h-screen w-full max-sm:flex-col">
                <div className={`w-full flex-1 ${isFilterOpen ? "mr-0" : ""}`}>
                  <div className="mb-5 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm max-sm:text-xs">
                      <p className="text-grey-300">Employees Count:</p>
                      <p>40</p>
                    </div>
                    <ButtonModule
                      variant="secondary"
                      size="md"
                      icon={<Filtericon />}
                      iconPosition="end"
                      onClick={toggleFilter}
                    >
                      Filter
                    </ButtonModule>
                  </div>
                  <div
                    className={`grid w-full gap-4 max-sm:grid-cols-1 max-sm:px-0 lg:grid-cols-3 2xl:grid-cols-4 ${
                      isFilterOpen ? "lg-grid-cols-2 2xl:grid-cols-3" : ""
                    }`}
                  >
                    {practitionersData.map((practitioner) => (
                      <div key={practitioner.id} className="relative rounded-lg bg-white p-4 shadow-lg">
                        <div className="flex gap-4">
                          <div className="relative h-[46px] w-[46px]">
                            <div className="text-grey-600 flex h-[44px] w-[44px] items-center justify-center rounded-md bg-[#F5F8FA] font-medium">
                              {practitioner.avatar}
                            </div>
                            <div
                              className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white ${
                                practitioner.status === "online" ? "bg-[#27AE60]" : "bg-[#94A3B8]"
                              }`}
                            ></div>
                          </div>

                          <div className="flex-1">
                            <h3 className="text-base font-bold">{practitioner.name}</h3>
                            <p className="text-sm">{practitioner.description}</p>
                          </div>
                          <div className="relative" ref={dropdownRef}>
                            <button
                              onClick={() => toggleDropdown(practitioner.id)}
                              className="text-gray-500 hover:text-gray-700 focus:outline-none"
                            >
                              <RxDotsVertical />
                            </button>
                            {openDropdownId === practitioner.id && (
                              <div className="absolute right-0 z-10 mt-2 w-32 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5">
                                <div className="py-1">
                                  <button
                                    onClick={() => handleEdit(practitioner.id)}
                                    className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => handleDelete(practitioner.id)}
                                    className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-100"
                                  >
                                    Delete
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="my-4 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1">
                              <span className="text-grey-400">Clients:</span>
                              <span className="font-medium">{practitioner.clients}</span>
                            </div>
                          </div>

                          <div className="flex flex-col items-end text-sm">
                            <span className="flex items-center gap-2">
                              <span className="text-base font-semibold">
                                {practitioner.rating}
                                <span className="text-grey-300 text-sm font-normal">/5</span>
                              </span>
                              <span className="text-sm text-[#D82E2E]">({practitioner.reviews} Reviews)</span>
                            </span>
                          </div>
                        </div>

                        <div className="mt-2 flex items-center justify-between gap-2 text-sm">
                          <div className="flex items-center gap-2">
                            <span className="text-grey-400">Reports:</span>
                            <span className="font-medium">{practitioner.reports}</span>
                          </div>
                        </div>

                        <div className="text-grey-600 mt-4 rounded-md bg-[#F5F8FA] p-3">
                          <div className="flex justify-between text-sm">
                            <span>Account Management:</span>
                            <span className="text-grey-300">
                              NGN{" "}
                              <span className="text-base font-bold text-[#202B3C]">
                                {practitioner.accountManagementPrice}
                              </span>
                              /month
                            </span>
                          </div>
                          <div className="mt-2 flex justify-between text-sm">
                            <span>Report Signing only:</span>
                            <span className="text-grey-300">
                              NGN{" "}
                              <span className="text-base font-bold text-[#202B3C]">
                                {practitioner.reportSigningPrice}
                              </span>
                              /report
                            </span>
                          </div>
                        </div>

                        <ButtonModule
                          className="mt-4"
                          variant="black"
                          size="md"
                          iconPosition="end"
                          onClick={handleHire}
                        >
                          View Details
                        </ButtonModule>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AddBusinessModal
        isOpen={isAddBusinessModalOpen}
        onRequestClose={() => setIsAddBusinessModalOpen(false)}
        onSubmit={handleAddBusiness}
        loading={isSubmitting}
      />

      <DeleteModal
        isOpen={deleteModalState.isOpen}
        onRequestClose={closeDeleteModal}
        onConfirm={handleConfirmDelete}
        loading={isDeleting}
        businessName={deleteModalState.practitionerName}
      />

      <EditModal
        isOpen={editModalState.isOpen}
        onRequestClose={closeEditModal}
        onSave={handleSaveEdit}
        loading={isEditing}
        practitioner={
          editModalState.practitioner || {
            name: "",
            description: "",
            accountManagementPrice: "",
            reportSigningPrice: "",
          }
        }
      />
    </section>
  )
}
