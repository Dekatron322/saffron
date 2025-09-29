import SideBar from "components/Sidebar/Sidebar"
import { NotificationProvider } from "components/ui/Notification/Notification"
import { Metadata } from "next"
import "styles/tailwind.css"

export const metadata: Metadata = {
  title: "Otech MFB Admin Dashboard",
  description:
    "This is the central admin dashboard for Otech MFB, the licensed bank that powers and manages all platforms and financial operations under its infrastructure.",
  icons: {
    icon: [
      { url: "/otech logo.svg" },
      { url: "/otech logo.svg", sizes: "16x16", type: "image/svg" },
      { url: "/otech logo.svg", sizes: "32x32", type: "image/svg" },
    ],
    apple: [{ url: "/otech logo.svf" }],
    other: [{ rel: "mask-icon", url: "/safari-pinned-tab.svg", color: "#5bbad5" }],
  },
  twitter: {
    card: "summary_large_image",
  },
  openGraph: {
    url: "https://otechpay.com/",
    images: [
      {
        width: 1200,
        height: 630,
        url: "https://raw.githubusercontent.com/Dekatron322/amd-dashboard/main/public/venus.png?token=GHSAT0AAAAAACSXKXAZP2KPMRTJS6WATSS6ZU5PHZQ",
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
      <NotificationProvider position="top-center" />
    </div>
  )
}
