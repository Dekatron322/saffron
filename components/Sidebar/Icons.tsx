import Image from "next/image"
import Link from "next/link"
import PricingIcon from "public/pricing-icon"
export const LogoIcon = () => (
  <>
    <Link href="/" className="icon-style mb-5 content-center">
      <div className=" flex items-center justify-center gap-2">
        <img src="/saffronLogo.png" alt="logo" className="h-16" />
      </div>
    </Link>
  </>
)

export const CollapsedLogoIcon = () => (
  <>
    <Link href="/" className="icon-style content-center">
      <div className=" flex items-center justify-center gap-2">
        <img src="/collapsedLogo.png" alt="logo" className="h-10" />
      </div>
    </Link>
    <Link href="/" className="dark-icon-style content-center ">
      <div className=" flex items-center justify-center gap-2">
        <img src="/collapsedLogo.png" alt="logo" className="h-7 w-7" />
      </div>
    </Link>
  </>
)

export const DashboardIcon = ({ isActive }: { isActive: boolean }) => (
  <Image
    src={isActive ? "/Icons/element-3-active.svg" : "/Icons/element-3.svg"}
    alt="Dashboard"
    width={20}
    height={20}
  />
)

export const Pricing = ({ isActive }: { isActive: boolean }) => <PricingIcon />

export const EstatesIcon = ({ isActive }: { isActive: boolean }) => (
  <Image src={isActive ? "/Icons/Estates-active.svg" : "/Icons/Estates.svg"} alt="Estates" width={20} height={20} />
)

export const SetingIcon = ({ isActive }: { isActive: boolean }) => (
  <Image src={isActive ? "<SetingIcon />" : "<SetingIcon />"} alt="Estates" width={20} height={20} />
)

export const InventoryIcon = ({ isActive }: { isActive: boolean }) => (
  <Image src={isActive ? "/Icons/3dcube-active.svg" : "/Icons/3dcube.svg"} alt="Inventory" width={20} height={20} />
)

export const SalesIcon = ({ isActive }: { isActive: boolean }) => (
  <Image
    src={isActive ? "/Icons/shopping-cart-active.svg" : "/Icons/shopping-cart.svg"}
    alt="Inventory"
    width={20}
    height={20}
  />
)

export const HomeIcon = ({ isActive }: { isActive: boolean }) => (
  <Image src={isActive ? "/Icons/Home-active.svg" : "/Icons/Home.svg"} alt="Home" width={20} height={20} />
)

export const PurchaseIcon = ({ isActive }: { isActive: boolean }) => (
  <Image src={isActive ? "/Icons/purchases-active.svg" : "/Icons/purchases.svg"} alt="Utility" width={20} height={20} />
)

export const BusinessLogo = ({ isActive }: { isActive: boolean }) => (
  <Image
    src={isActive ? "/Icons/stickynote-active.svg" : "/Icons/stickynote.svg"}
    alt="Briefcase"
    width={20}
    height={20}
  />
)

export const EmployeeLogo = ({ isActive }: { isActive: boolean }) => (
  <Image src={isActive ? "/Icons/employee.svg" : "/Icons/employee.svg"} alt="Briefcase" width={20} height={20} />
)

export const FinanceIcon = ({ isActive }: { isActive: boolean }) => (
  <Image src={isActive ? "/Icons/bank-active.svg" : "/Icons/bank.svg"} alt="Utility" width={20} height={20} />
)

export const GrowIcon = ({ isActive }: { isActive: boolean }) => (
  <Image src={isActive ? "/Icons/status-up-active.svg" : "/Icons/status-up.svg"} alt="Utility" width={20} height={20} />
)

export const CustomerIcon = ({ isActive }: { isActive: boolean }) => (
  <Image src={isActive ? "/Icons/people-active.svg" : "/Icons/people.svg"} alt="customers" width={20} height={20} />
)

export const SupportIcon = ({ isActive }: { isActive: boolean }) => (
  <Image src={isActive ? "/Icons/Door.png" : "/Icons/Door.png"} alt="Utility" width={20} height={20} />
)

export const AdminIcon = ({ isActive }: { isActive: boolean }) => (
  <Image src={isActive ? "/Icons/user-active.svg" : "/Icons/user.svg"} alt="Utility" width={20} height={20} />
)

export const LogoutIcon = ({ isActive }: { isActive: boolean }) => (
  <Image src={isActive ? "/Icons/Utility-active.svg" : "/Icons/Logout.svg"} alt="Utility" width={20} height={20} />
)

export const PropertyIcon = ({ isActive }: { isActive: boolean }) => (
  <Image src={isActive ? "/Icons/Property-active.svg" : "/Icons/Property.svg"} alt="Utility" width={20} height={20} />
)

export const SettingsIcon = ({ isActive = false }: { isActive?: boolean }) => (
  <Image src={isActive ? "/Icons/setting-2-active.svg" : "/Icons/setting-2.svg"} alt="Utility" width={20} height={20} />
)
