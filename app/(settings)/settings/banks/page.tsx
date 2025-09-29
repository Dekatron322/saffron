"use client"
import DashboardNav from "components/Navbar/DashboardNav"
import { ButtonModule } from "components/ui/Button/Button"
import AddBusiness from "public/add-business"
import React, { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import Filtericon from "public/filter-icon"
import { RxDotsVertical } from "react-icons/rx"
import DeleteModal from "components/ui/Modal/delete-modal"
import Image from "next/image"
import AddBankModal from "components/ui/Modal/add-bank-modal"

interface Bank {
  id: number
  name: string
  code: string
  logo: string
  accountNumber: string
  country: string
}

export default function Banks() {
  const [isAddBusinessModalOpen, setIsAddBusinessModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [openDropdownId, setOpenDropdownId] = useState<number | null>(null)
  const [editModalState, setEditModalState] = useState({
    isOpen: false,
    bank: null as Bank | null,
  })
  const [isEditing, setIsEditing] = useState(false)

  const banksData: Bank[] = [
    {
      id: 1,
      name: "Zenith Bank",
      code: "057",
      logo: "/Banks/zenith.svg",
      accountNumber: "****1234",
      country: "Nigeria",
    },
    {
      id: 2,
      name: "First Bank",
      code: "011",
      logo: "/Banks/firstbank.svg",
      accountNumber: "****5678",
      country: "Nigeria",
    },
    {
      id: 3,
      name: "Guaranty Trust Bank",
      code: "058",
      logo: "/Banks/gtbank.svg",
      accountNumber: "****9012",
      country: "Nigeria",
    },
    {
      id: 4,
      name: "Access Bank",
      code: "044",
      logo: "/Banks/access.svg",
      accountNumber: "****3456",
      country: "Nigeria",
    },
    {
      id: 5,
      name: "United Bank for Africa",
      code: "033",
      logo: "/Banks/uba.svg",
      accountNumber: "****7890",
      country: "Nigeria",
    },
    {
      id: 6,
      name: "Ecobank",
      code: "050",
      logo: "/Banks/ecobank.svg",
      accountNumber: "****2345",
      country: "Pan-African",
    },
    {
      id: 7,
      name: "Stanbic IBTC",
      code: "221",
      logo: "/Banks/stanbic.svg",
      accountNumber: "****6789",
      country: "Nigeria",
    },
    {
      id: 8,
      name: "Fidelity Bank",
      code: "070",
      logo: "/Banks/fidelity.svg",
      accountNumber: "****0123",
      country: "Nigeria",
    },
    {
      id: 9,
      name: "Polaris Bank",
      code: "070",
      logo: "/Banks/polaris.svg",
      accountNumber: "****0123",
      country: "Nigeria",
    },
    {
      id: 10,
      name: "ALAT by WEMA",
      code: "070",
      logo: "/Banks/alat.svg",
      accountNumber: "****0123",
      country: "Nigeria",
    },
    {
      id: 11,
      name: "Bowen MFB",
      code: "070",
      logo: "/Banks/bowen.svg",
      accountNumber: "****0123",
      country: "Nigeria",
    },
    {
      id: 12,
      name: "FCMB",
      code: "070",
      logo: "/Banks/fcmb.svg",
      accountNumber: "****0123",
      country: "Nigeria",
    },
    {
      id: 13,
      name: "Unity Bank",
      code: "070",
      logo: "/Banks/unity.svg",
      accountNumber: "****0123",
      country: "Nigeria",
    },
    {
      id: 14,
      name: "Sterling Bank",
      code: "070",
      logo: "/Banks/sterling.svg",
      accountNumber: "****0123",
      country: "Nigeria",
    },
    {
      id: 15,
      name: "Standard Chartered Bank",
      code: "070",
      logo: "/Banks/standard.svg",
      accountNumber: "****0123",
      country: "Nigeria",
    },
    {
      id: 16,
      name: "Union Bank",
      code: "070",
      logo: "/Banks/union.svg",
      accountNumber: "****0123",
      country: "Nigeria",
    },
    {
      id: 17,
      name: "Providus Bank",
      code: "070",
      logo: "/Banks/providus.svg",
      accountNumber: "****0123",
      country: "Nigeria",
    },
  ]

  const [deleteModalState, setDeleteModalState] = useState({
    isOpen: false,
    bankId: null as number | null,
    bankName: "",
  })
  const [isDeleting, setIsDeleting] = useState(false)
  const dropdownRefs = useRef<{ [key: number]: HTMLDivElement | null }>({})

  const setDropdownRef = (id: number) => (el: HTMLDivElement | null) => {
    dropdownRefs.current[id] = el
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const clickedOutsideAll = Object.values(dropdownRefs.current).every((ref) => {
        return ref && !ref.contains(event.target as Node)
      })

      if (clickedOutsideAll) {
        setOpenDropdownId(null)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const handleConfirmDelete = async (reason: string) => {
    setIsDeleting(true)
    try {
      console.log(`Deleting bank ${deleteModalState.bankId} with reason: ${reason}`)
      await new Promise((resolve) => setTimeout(resolve, 1000))
    } catch (error) {
      console.error("Error deleting bank:", error)
    } finally {
      setIsDeleting(false)
      setDeleteModalState({
        isOpen: false,
        bankId: null,
        bankName: "",
      })
    }
  }

  const closeDeleteModal = () => {
    setDeleteModalState({
      isOpen: false,
      bankId: null,
      bankName: "",
    })
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
            <div className="flex items-center justify-between border-b px-8 py-4 max-sm:px-3">
              <p className="text-2xl font-medium">Banks</p>
              <ButtonModule
                variant="primary"
                size="md"
                icon={<AddBusiness />}
                iconPosition="start"
                onClick={() => setIsAddBusinessModalOpen(true)}
              >
                Add New Bank
              </ButtonModule>
            </div>

            <div className="flex w-full gap-6 px-8 max-md:flex-col max-md:px-0 max-sm:my-4 max-sm:px-3 md:my-8">
              <div className="flex h-screen w-full max-sm:flex-col">
                <div className={`w-full flex-1 ${isFilterOpen ? "mr-0" : ""}`}>
                  <div className="mb-5 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm max-sm:text-xs">
                      <p className="text-grey-300">Banks Count:</p>
                      <p>{banksData.length}</p>
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
                    className={`mb-4 grid w-full gap-4 max-sm:grid-cols-1 max-sm:px-0 lg:grid-cols-3 2xl:grid-cols-4 ${
                      isFilterOpen ? "lg:grid-cols-2 2xl:grid-cols-3" : ""
                    }`}
                  >
                    {banksData.map((bank) => (
                      <div key={bank.id} className="relative rounded-lg bg-white p-4 shadow-lg">
                        <div className="flex gap-4">
                          <div className="relative h-[46px] w-[46px]">
                            <div className="text-grey-600 flex h-[44px] w-[44px] items-center justify-center rounded-md bg-[#F5F8FA] font-medium">
                              <Image src={bank.logo} alt={bank.name} width={60} height={60} />
                            </div>
                          </div>

                          <div className="flex-1">
                            <h3 className="text-base font-bold">{bank.name}</h3>
                            <p className="text-sm">Code: {bank.code}</p>
                            <p className="text-sm">Country: {bank.country}</p>
                          </div>
                          <div className="relative" ref={setDropdownRef(bank.id)}>
                            <button
                              className="text-gray-500 hover:text-gray-700 focus:outline-none"
                              onClick={() => setOpenDropdownId(openDropdownId === bank.id ? null : bank.id)}
                            >
                              <RxDotsVertical />
                            </button>
                            {openDropdownId === bank.id && (
                              <div className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5">
                                <div className="py-1">
                                  <button
                                    onClick={() => {
                                      setEditModalState({
                                        isOpen: true,
                                        bank: bank,
                                      })
                                      setOpenDropdownId(null)
                                    }}
                                    className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => {
                                      setDeleteModalState({
                                        isOpen: true,
                                        bankId: bank.id,
                                        bankName: bank.name,
                                      })
                                      setOpenDropdownId(null)
                                    }}
                                    className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                                  >
                                    Delete
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AddBankModal
        isOpen={isAddBusinessModalOpen}
        onRequestClose={() => setIsAddBusinessModalOpen(false)}
        loading={isSubmitting}
        onSubmit={function (businessData: { bank: string; code: string; logo: File | null }): void {
          throw new Error("Function not implemented.")
        }}
      />

      <DeleteModal
        isOpen={deleteModalState.isOpen}
        onRequestClose={closeDeleteModal}
        onConfirm={handleConfirmDelete}
        loading={isDeleting}
        businessName={deleteModalState.bankName}
      />
    </section>
  )
}
