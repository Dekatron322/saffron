import SideBar from "components/Sidebar/Sidebar"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Altima Dashboard | Payment",
  description: "We are a family with a major focus in both primary and secondary healthcare service.",
  twitter: {
    card: "summary_large_image",
  },
  openGraph: {
    url: "https://smarthavensystems.com/",
    images: [
      {
        width: 1200,
        height: 630,
        url: "https://raw.githubusercontent.com/Dekatron322/Caregiverhospital/main/public/img.png",
      },
    ],
  },
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen w-screen flex-col-reverse border-0 border-blue-700 lg:flex-row">
      <div className="">
        <SideBar />
      </div>
      <div className="grow overflow-y-auto border-0 border-black ">{children}</div>
    </div>
  )
}
