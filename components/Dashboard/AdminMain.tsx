import React, { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight"

import CustomTable from "components/Tables/EstateTable"
import CustomPagination from "components/Pagination/CustomPagination"
import AddAdminModal from "components/Modals/AddAdminModal"
import AddRoleModal from "components/Modals/AddRoleModal"

interface Admin {
  sn: number
  name: string
  email: string
  role: string
  date: string
}

interface Role {
  sn: number
  name: string
  date: string
}

const AdminMain: React.FC = () => {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<string>("admin")

  return (
    <div className="flex w-full flex-col">
      <div className="tab-bg flex w-[345px] items-center gap-3 p-1">
        <button
          className={`${activeTab === "admin" ? "active-tab" : "inactive-tab"}`}
          onClick={() => setActiveTab("admin")}
        >
          Admin
        </button>
        <button
          className={`${activeTab === "occupancy-rate" ? "active-tab" : "inactive-tab"}`}
          onClick={() => setActiveTab("occupancy-rate")}
        >
          Roles
        </button>
      </div>
      {activeTab === "admin" ? <AdminTab /> : null}
      {activeTab === "occupancy-rate" ? <RolesTab /> : null}
    </div>
  )
}

const AdminTab: React.FC = () => {
  const [admins, setAdmins] = useState<Admin[]>([
    { sn: 1, name: "John Doe", email: "Johndoe@gmail.com", role: "Superadmin", date: "15 May, 2020 8:00 am" },
    { sn: 2, name: "John Doe", email: "Johndoe@gmail.com", role: "Technician", date: "15 May, 2020 8:00 am" },
    // ...other admins
  ])
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(4)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const columns = useMemo(
    () => [
      { Header: "S/N", accessor: "sn" },
      { Header: "Admin Name", accessor: "name" },
      { Header: "Email", accessor: "email" },
      { Header: "Date", accessor: "date" },
      { Header: "Role", accessor: "role" },
    ],
    []
  )

  const filteredAdmins = useMemo(
    () =>
      admins.filter(
        (admin) =>
          admin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          admin.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
          admin.email.toString().includes(searchQuery) ||
          admin.date.toString().includes(searchQuery.toLowerCase())
      ),
    [admins, searchQuery]
  )

  const paginatedData = useMemo(
    () => filteredAdmins.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage),
    [filteredAdmins, currentPage, itemsPerPage]
  )

  const handleAddAdmin = (newAdmin: Admin) => {
    setAdmins((prevAdmin) => [...prevAdmin, { ...newAdmin, sn: prevAdmin.length + 1 }])
  }

  return (
    <div className="w-full bg-[#F7F7F9]">
      <div className="mx-7 flex items-center justify-between pt-4">
        <h5 className="text-[28px] font-medium">Admins</h5>
        <div className="flex items-center gap-2">
          <p className="opacity-50">Admins </p>
          <KeyboardArrowRightIcon className="opacity-50" />
          <p className="opacity-50">Dashboard</p>
        </div>
      </div>
      <div className="rounded-lg bg-white py-4 max-sm:my-4 lg:m-7">
        <div className="mb-4 flex items-center justify-between px-6">
          <div className="flex items-center gap-5">
            <div className="flex justify-center gap-2 max-sm:hidden">
              <div className="flex h-10 items-center">
                <p>Show</p>
              </div>
              <input
                type="number"
                value={itemsPerPage}
                onChange={(e) => setItemsPerPage(Number(e.target.value))}
                className="h-10 w-[50px] rounded-md bg-[#F3F3F3] px-3 py-2 outline-none focus:outline-none "
                placeholder="Items per page"
              />
              <div className="flex h-10 items-center">
                <p>Entries</p>
              </div>
            </div>
            <div className="flex items-center">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="h-[56px] w-[328px] rounded-md bg-[#F3F3F3] px-3 py-2 outline-none focus:outline-none max-sm:h-10 max-sm:w-[200px]"
              />
            </div>
          </div>
          <button onClick={() => setIsModalOpen(true)} className="button-rounded flex items-center gap-2 rounded-md">
            <p className="max-sm:hidden">Add New Admin</p>
            <Image src="DashboardImages/Vector.svg" width={11.88} height={11.88} alt="" />
          </button>
        </div>
        <CustomTable tableType="estate" columns={columns} data={paginatedData} />
        <CustomPagination
          totalItems={filteredAdmins.length}
          itemsPerPage={itemsPerPage}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
        />
        <AddAdminModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleAddAdmin} />
      </div>
    </div>
  )
}

const RolesTab: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>([
    { sn: 1, name: "Dantata Estate 1", date: "15 May, 2020 8:00 am" },
    { sn: 2, name: "Dantata Estate 2", date: "15 May, 2020 8:00 am" },
    // ...other roles
  ])
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(5)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const columns = useMemo(
    () => [
      { Header: "S/N", accessor: "sn" },
      { Header: "Role Name", accessor: "name" },
      { Header: "Date Added", accessor: "date" },
    ],
    []
  )

  const filteredRoles = useMemo(
    () =>
      roles.filter(
        (role) =>
          role.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          role.date.toString().includes(searchQuery.toLowerCase())
      ),
    [roles, searchQuery]
  )

  const paginatedData = useMemo(
    () => filteredRoles.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage),
    [filteredRoles, currentPage, itemsPerPage]
  )

  const handleAddRole = (newRole: Role) => {
    setRoles((prevRoles) => [...prevRoles, { ...newRole, sn: prevRoles.length + 1 }])
  }

  return (
    <div className="w-full bg-[#F7F7F9]">
      <div className="mx-7 flex items-center justify-between pt-4">
        <h5 className="text-[28px] font-medium">Roles</h5>
        <div className="flex items-center gap-2">
          <p className="opacity-50">Roles </p>
          <KeyboardArrowRightIcon className="opacity-50" />
          <p className="opacity-50">Dashboard</p>
        </div>
      </div>
      <div className="rounded-lg bg-white py-4 max-sm:my-4 lg:m-7">
        <div className="mb-4 flex items-center justify-between px-6">
          <div className="flex items-center gap-5">
            <div className="flex justify-center gap-2 max-sm:hidden">
              <div className="flex h-10 items-center">
                <p>Show</p>
              </div>
              <input
                type="number"
                value={itemsPerPage}
                onChange={(e) => setItemsPerPage(Number(e.target.value))}
                className="h-10 w-[50px] rounded-md bg-[#F3F3F3] px-3 py-2 outline-none focus:outline-none"
                placeholder="Items per page"
              />
              <div className="flex h-10 items-center">
                <p>Entries</p>
              </div>
            </div>
            <div className="flex items-center">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="h-[56px] w-[328px] rounded-md bg-[#F3F3F3] px-3 py-2 outline-none focus:outline-none max-sm:h-10 max-sm:w-[200px]"
              />
            </div>
          </div>
          <button onClick={() => setIsModalOpen(true)} className="button-rounded flex items-center gap-2 rounded-md">
            <p className="max-sm:hidden">Add New Role</p>
            <Image src="DashboardImages/Vector.svg" width={11.88} height={11.88} alt="" />
          </button>
        </div>
        <CustomTable tableType="estate" columns={columns} data={paginatedData} />
        <CustomPagination
          totalItems={filteredRoles.length}
          itemsPerPage={itemsPerPage}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
        />
        <AddRoleModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleAddRole} />
      </div>
    </div>
  )
}

export default AdminMain
