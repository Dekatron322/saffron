"use client"
import DashboardNav from "components/Navbar/DashboardNav"
import { useEffect, useState } from "react"
import { Accounts, Dash } from "utils"
import FinanceChart from "components/Chart/FinanceChart"
import TransactionTable from "components/Tables/RecentActivityTable"

interface Patient {
  id: string
  name: string
  gender: string
  dob: string
  appointments: {
    id: number
    doctor: string
    detail: string
    pub_date: string
  }[]
  // Add other fields as needed
}

interface PaymentAccount {
  id: number
  src: any
  name: string
  balance: string
}

interface Department {
  name: string
}

interface Staff {
  username: string
}

export default function Dashboard() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [patientsWithAppointments, setPatientsWithAppointments] = useState<Patient[]>([])
  const [departmentCount, setDepartmentCount] = useState(0)
  const [staffCount, setStaffCount] = useState(0)

  useEffect(() => {
    async function fetchPatients() {
      try {
        const response = await fetch("https://api.caregiverhospital.com/patient/patient/")
        if (!response.ok) {
          throw new Error("Failed to fetch patients")
        }
        const data = (await response.json()) as Patient[]
        setPatients(data)

        // Filter patients with appointments
        const patientsWithApps = data.filter((patient) => patient.appointments.length > 0)
        setPatientsWithAppointments(patientsWithApps)
      } catch (error) {
        console.error("Error fetching patients:", error)
        // Optionally, handle errors
      }
    }

    fetchPatients()
  }, [])

  useEffect(() => {
    async function fetchDepartmentCount() {
      try {
        const response = await fetch("https://api.caregiverhospital.com/department/department/")
        if (!response.ok) {
          throw new Error("Failed to fetch department count")
        }
        const data = (await response.json()) as Department[]
        setDepartmentCount(data.length)
      } catch (error) {
        console.error("Error fetching department count:", error)
      }
    }

    fetchDepartmentCount()
  }, [])

  const getStatusColor = (status: string): string => {
    switch (status) {
      case "income":
        return "text-[#179402]"
      case "expense":
        return "text-[#FF6A5A]"
      default:
        return "text-[#EEC202]"
    }
  }

  const getBgColor = (status: string): string => {
    switch (status) {
      case "income":
        return "bg-[#179402]"
      case "expense":
        return "bg-[#FF6A5A]"
      default:
        return "bg-[#EEC202]"
    }
  }

  useEffect(() => {
    async function fetchStaffCount() {
      try {
        const response = await fetch("https://api.caregiverhospital.com/app_user/all/")
        if (!response.ok) {
          throw new Error("Failed to fetch staff count")
        }
        const data = (await response.json()) as Staff[]
        setStaffCount(data.length)
      } catch (error) {
        console.error("Error fetching staff count:", error)
      }
    }

    fetchStaffCount()
  }, [])

  return (
    <section className="size-full">
      <div className="flex min-h-screen w-full">
        <div className="flex  w-full flex-col">
          <DashboardNav />
          <div className="flex flex-col">
            <div className="flex items-center justify-between border-b px-8 py-4">
              <p className="text-2xl font-medium">Dashboard</p>
              <div className="flex gap-4">
                <button className="button-oulined" type="button">
                  <img src="/DashboardImages/Export.png" alt="dekalo" className="icon-style" />
                  <img src="/DashboardImages/Export-dark.png" alt="dekalo" className="dark-icon-style " />
                  <p>Export Data</p>
                </button>
                <button className="button-oulined" type="button">
                  <img src="/DashboardImages/BellSimple.png" alt="dekalo" className="icon-style" />
                  <img src="/DashboardImages/BellSimple-dark.png" alt="dekalo" className="dark-icon-style" />
                  <p>Send Payment Reminder </p>
                </button>
                <button className="button-oulined" type="button">
                  <img src="/DashboardImages/MailStar.png" alt="dekalo" className="icon-style" />
                  <img src="/DashboardImages/MailStar-dark.png" alt="dekalo" className="dark-icon-style" />
                  <p>Start Email Campaign</p>
                </button>
                <div className="border-l"></div>
                <button className="button-primary-two" type="button">
                  <img src="/DashboardImages/Plus.png" alt="dekalo" />
                  <p>Add Pre-order</p>
                </button>
              </div>
            </div>

            <div className="max-sm-my-4 flex w-full gap-6 px-8  max-md:flex-col max-md:px-0 max-sm:px-3 md:my-8">
              <div className="w-full">
                <div className="flex w-full gap-6 max-lg:grid max-lg:grid-cols-2">
                  {Dash.map((account: PaymentAccount, index: number) => (
                    <div key={account.id} className="flex w-full cursor-pointer gap-2">
                      <div
                        // onClick={() => handlePaymentClick(account.id)}
                        className="small-card  rounded-md p-2 transition duration-500 md:border"
                      >
                        <div className=" flex items-center justify-between max-sm:mb-2">
                          <img src={account.src} width={32} height={32} alt="" />
                          <img src="/DashboardImages/CaretRight.png" alt="" className="icon-style" />
                          <img src="/DashboardImages/CaretRight-dark.png" alt="" className="dark-icon-style" />
                        </div>

                        <h5 className="my-4 font-medium text-[#727272]">{account.name}</h5>
                        <div className="flex items-end justify-between">
                          <div>
                            <h5 className="text-3xl font-medium max-sm:text-lg  ">{account.balance}</h5>
                          </div>
                        </div>

                        <div className="mt-2 flex items-center gap-4">
                          <div className="flex items-center justify-center gap-3 rounded-full bg-[#EEF5F0] px-4 py-2 text-[#589E67]">
                            <img src="/DashboardImages/TrendUp.png" />
                            <p className="text-xs font-medium">2.4%</p>
                            <p className="text-xs font-medium">From Last Month</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {/* <DashboardMain /> */}
                <FinanceChart />

                <TransactionTable />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
