import React, { useState, useRef, useEffect } from "react"
import { RxCaretSort, RxDotsVertical } from "react-icons/rx"
import { MdOutlineArrowBackIosNew, MdOutlineArrowForwardIos, MdOutlineCheckBoxOutlineBlank } from "react-icons/md"
import { ButtonModule } from "components/ui/Button/Button"
import { SearchModule } from "components/ui/Search/search-module"
import EmptyState from "public/empty-state"
import { useRouter } from "next/navigation"
import { useAppDispatch, useAppSelector } from "app/api/store/store"
import { fetchAllUsers, fetchUserDetail } from "app/api/store/userManagementSlice"
import { PlusIcon } from "components/Icons/Icons"
import UserDetailsModal from "components/ui/Modal/user-details-modal"
import EditUserModal from "components/ui/Modal/edit-user-modal"
import AddUserModal from "components/ui/Modal/add-user-modal"

type SortOrder = "asc" | "desc" | null

interface User {
  userId: number
  userName: string
  email: string
  mobileNo: string
  organisationId: number
  firstName: string | null
  lastName: string | null
  isActive: boolean | null
}

interface DropdownMenuProps {
  user: User
  onClose: () => void
  onViewDetails: (userId: number) => void
  onEdit: (user: User) => void
}

const DropdownMenu = ({ user, onClose, onViewDetails, onEdit }: DropdownMenuProps) => {
  const handleEdit = () => {
    onEdit(user)
    onClose()
  }
  const handleViewDetails = () => {
    onViewDetails(user.userId)
    onClose()
  }

  const handleToggleStatus = () => {
    console.log("Toggle status for user:", user.userId)
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
          onClick={handleToggleStatus}
          className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
        >
          {user.isActive ? "Deactivate" : "Activate"}
        </button>
      </div>
    </div>
  )
}

const SkeletonRow = () => (
  <tr>
    {[...Array(7)].map((_, i) => (
      <td key={i} className="whitespace-nowrap border-b px-4 py-2 text-sm">
        <div className="h-6 w-full animate-pulse rounded bg-gray-200"></div>
      </td>
    ))}
  </tr>
)

const UsersTable = () => {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { users, loading, error } = useAppSelector((state) => ({
    users: state.userManagement?.users || [],
    loading: state.userManagement?.loading || false,
    error: state.userManagement?.error || null,
  }))
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null)
  const [isUserDetailsModalOpen, setIsUserDetailsModalOpen] = useState(false)

  const [sortColumn, setSortColumn] = useState<string | null>(null)
  const [sortOrder, setSortOrder] = useState<SortOrder>(null)
  const [searchText, setSearchText] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(15)
  const [activeDropdown, setActiveDropdown] = useState<number | null>(null)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [userToEdit, setUserToEdit] = useState<User | null>(null)
  const dropdownRefs = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    dispatch(fetchAllUsers())
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

  const getStatusStyle = (isActive: boolean | null) => {
    return isActive
      ? { backgroundColor: "#EEF5F0", color: "#589E67" }
      : { backgroundColor: "#F7EDED", color: "#AF4B4B" }
  }

  const dotStyle = (isActive: boolean | null) => {
    return isActive ? { backgroundColor: "#589E67" } : { backgroundColor: "#AF4B4B" }
  }

  const toggleSort = (column: keyof User) => {
    const isAscending = sortColumn === column && sortOrder === "asc"
    setSortOrder(isAscending ? "desc" : "asc")
    setSortColumn(column)
  }

  const handleCancelSearch = () => {
    setSearchText("")
  }

  const handleAddUser = () => {
    setIsAddUserModalOpen(true)
  }

  const handleUserCreated = () => {
    dispatch(fetchAllUsers())
  }

  const filteredUsers = users.filter((user) =>
    Object.values(user).some((value) => {
      if (value === null || value === undefined) return false
      return String(value).toLowerCase().includes(searchText.toLowerCase())
    })
  )

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    if (!sortColumn) return 0

    const aValue = a[sortColumn as keyof User]
    const bValue = b[sortColumn as keyof User]

    if (aValue === null || bValue === null) return 0

    if (aValue < bValue) return sortOrder === "asc" ? -1 : 1
    if (aValue > bValue) return sortOrder === "asc" ? 1 : -1
    return 0
  })

  const indexOfLastUser = currentPage * itemsPerPage
  const indexOfFirstUser = indexOfLastUser - itemsPerPage
  const currentUsers = sortedUsers.slice(indexOfFirstUser, indexOfLastUser)

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber)

  return (
    <div className="flex-3 mt-5 flex flex-col rounded-md border bg-white p-3 md:p-5">
      {/* Header */}
      <div className="items-center justify-between border-b py-2 md:flex md:py-4">
        <p className="text-lg font-semibold max-sm:pb-3 md:text-2xl">Inventory Users</p>
        <div className="flex gap-4">
          <SearchModule
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onCancel={handleCancelSearch}
          />
          <ButtonModule variant="ghost" size="md" icon={<PlusIcon />} iconPosition="end" onClick={handleAddUser}>
            <p className="whitespace-nowrap max-sm:hidden">Add New User</p>
          </ButtonModule>
        </div>
      </div>

      {loading ? (
        <div className="flex h-60 flex-col items-center justify-center gap-2 bg-[#F4F9F8]">
          <div className="w-full overflow-x-auto border-l border-r">
            <table className="w-full min-w-[800px] border-separate border-spacing-0 text-left">
              <thead>
                <tr>
                  <th className="whitespace-nowrap border-b bg-[#F4F9F8] p-4 text-sm">
                    <MdOutlineCheckBoxOutlineBlank className="text-lg" />
                  </th>
                  <th className="whitespace-nowrap border-b bg-[#F4F9F8] p-4 text-sm">
                    <div className="flex items-center gap-2">Username</div>
                  </th>
                  <th className="whitespace-nowrap border-b bg-[#F4F9F8] p-4 text-sm">
                    <div className="flex items-center gap-2">Email</div>
                  </th>
                  <th className="whitespace-nowrap border-b bg-[#F4F9F8] p-4 text-sm">
                    <div className="flex items-center gap-2">Phone</div>
                  </th>
                  <th className="whitespace-nowrap border-b bg-[#F4F9F8] p-4 text-sm">
                    <div className="flex items-center gap-2">Name</div>
                  </th>
                  <th className="whitespace-nowrap border-b bg-[#F4F9F8] p-4 text-sm">
                    <div className="flex items-center gap-2">Status</div>
                  </th>
                  <th className="whitespace-nowrap border-b bg-[#F4F9F8] p-4 text-sm">
                    <div className="flex items-center gap-2">Action</div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {[...Array(itemsPerPage)].map((_, index) => (
                  <SkeletonRow key={index} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : error ? (
        <div className="flex h-60 flex-col items-center justify-center gap-2 bg-[#F4F9F8]">
          <div className="text-center">
            <EmptyState />
            <p className="text-xl font-bold text-[#D82E2E]">Failed to load users.</p>
            <p>{error}</p>
          </div>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="flex h-60 flex-col items-center justify-center gap-2 bg-[#F4F9F8]">
          <EmptyState />
          <p className="text-base font-bold text-[#202B3C]">No users found.</p>
        </div>
      ) : (
        <>
          <div className="w-full overflow-x-auto border-l border-r">
            <table className="w-full min-w-[800px] border-separate border-spacing-0 text-left">
              <thead>
                <tr>
                  <th className="whitespace-nowrap border-b bg-[#F4F9F8] p-4 text-sm">
                    <MdOutlineCheckBoxOutlineBlank className="text-lg" />
                  </th>
                  <th
                    className="cursor-pointer whitespace-nowrap border-b bg-[#F4F9F8] p-4 text-sm"
                    onClick={() => toggleSort("userName")}
                  >
                    <div className="flex items-center gap-2">
                      Username {sortColumn === "userName" && <RxCaretSort />}
                    </div>
                  </th>
                  <th
                    className="cursor-pointer whitespace-nowrap border-b bg-[#F4F9F8] p-4 text-sm"
                    onClick={() => toggleSort("email")}
                  >
                    <div className="flex items-center gap-2">Email {sortColumn === "email" && <RxCaretSort />}</div>
                  </th>
                  <th
                    className="cursor-pointer whitespace-nowrap border-b bg-[#F4F9F8] p-4 text-sm"
                    onClick={() => toggleSort("mobileNo")}
                  >
                    <div className="flex items-center gap-2">Phone {sortColumn === "mobileNo" && <RxCaretSort />}</div>
                  </th>
                  <th
                    className="cursor-pointer whitespace-nowrap border-b bg-[#F4F9F8] p-4 text-sm"
                    onClick={() => toggleSort("firstName")}
                  >
                    <div className="flex items-center gap-2">Name {sortColumn === "firstName" && <RxCaretSort />}</div>
                  </th>
                  <th className="whitespace-nowrap border-b bg-[#F4F9F8] p-4 text-sm">
                    <div className="flex items-center gap-2">Status</div>
                  </th>
                  <th className="whitespace-nowrap border-b bg-[#F4F9F8] p-4 text-sm">
                    <div className="flex items-center gap-2">Action</div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {currentUsers.map((user, index) => (
                  <tr key={user.userId}>
                    <td className="whitespace-nowrap border-b px-4 py-2 text-sm">
                      <MdOutlineCheckBoxOutlineBlank className="text-lg" />
                    </td>
                    <td className="whitespace-nowrap border-b px-4 py-2 text-sm">{user.userName}</td>
                    <td className="whitespace-nowrap border-b px-4 py-2 text-sm">{user.email}</td>
                    <td className="whitespace-nowrap border-b px-4 py-2 text-sm">{user.mobileNo}</td>
                    <td className="whitespace-nowrap border-b px-4 py-2 text-sm">
                      {user.firstName || user.lastName ? `${user.firstName || ""} ${user.lastName || ""}`.trim() : "-"}
                    </td>
                    <td className="whitespace-nowrap border-b px-4 py-3 text-sm">
                      <div className="flex">
                        <div
                          style={getStatusStyle(user.isActive)}
                          className="flex items-center justify-center gap-1 rounded-full px-2 py-1"
                        >
                          <span className="size-2 rounded-full" style={dotStyle(user.isActive)}></span>
                          {user.isActive ? "Active" : "Inactive"}
                        </div>
                      </div>
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
                          <DropdownMenu
                            user={user}
                            onClose={() => setActiveDropdown(null)}
                            onViewDetails={(userId) => {
                              setSelectedUserId(userId)
                              setIsUserDetailsModalOpen(true)
                            }}
                            onEdit={(user) => {
                              setUserToEdit(user)
                              setEditModalOpen(true)
                            }}
                          />
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
              Showing {indexOfFirstUser + 1} to {Math.min(indexOfLastUser, filteredUsers.length)} of{" "}
              {filteredUsers.length} entries
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

              {Array.from({ length: Math.ceil(filteredUsers.length / itemsPerPage) }).map((_, index) => (
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
                disabled={currentPage === Math.ceil(filteredUsers.length / itemsPerPage)}
                className={`rounded-full px-2 py-1 ${
                  currentPage === Math.ceil(filteredUsers.length / itemsPerPage)
                    ? "cursor-not-allowed bg-gray-200 text-gray-500"
                    : "bg-gray-200 hover:bg-gray-300"
                }`}
              >
                <MdOutlineArrowForwardIos />
              </button>
            </div>
          </div>
          <UserDetailsModal
            isOpen={isUserDetailsModalOpen}
            userId={selectedUserId}
            onRequestClose={() => {
              setIsUserDetailsModalOpen(false)
              setSelectedUserId(null)
            }}
          />
          <AddUserModal
            isOpen={isAddUserModalOpen}
            onClose={() => setIsAddUserModalOpen(false)}
            onUserCreated={handleUserCreated}
          />

          <EditUserModal
            isOpen={editModalOpen}
            onRequestClose={() => {
              setEditModalOpen(false)
              setUserToEdit(null)
            }}
            userId={userToEdit?.userId || null}
            userData={{
              userName: userToEdit?.userName || "",
              firstName: userToEdit?.firstName || null,
              email: userToEdit?.email || "",
              mobileNo: userToEdit?.mobileNo || "",
              organisationId: userToEdit?.organisationId || 0,
            }}
          />
        </>
      )}
    </div>
  )
}

export default UsersTable
