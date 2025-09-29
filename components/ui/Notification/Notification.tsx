// components/ui/Notification/Notification.tsx
"use client"
import { toast, Toaster } from "sonner"
import type { ToasterProps } from "sonner"

type NotificationType = "success" | "error" | "warning" | "info"

interface NotificationOptions {
  title?: string
  description?: string
  duration?: number
  position?: ToasterProps["position"]
}

export const notify = (type: NotificationType, message: string, options?: NotificationOptions) => {
  const { title, description, duration = 5000 } = options || {}

  const commonOptions = {
    description: description || undefined,
    duration,
    cancel: {
      label: "Close",
      onClick: () => {},
    },
  }

  switch (type) {
    case "success":
      toast.success(title || message, commonOptions)
      break
    case "error":
      toast.error(title || message, commonOptions)
      break
    case "warning":
      toast.warning(title || message, commonOptions)
      break
    case "info":
      toast.info(title || message, commonOptions)
      break
    default:
      toast(message, {
        duration,
        cancel: {
          label: "Close",
          onClick: () => {},
        },
      })
  }
}

export const NotificationProvider = ({ position = "top-center", ...props }: ToasterProps) => {
  return <Toaster position={position} richColors {...props} />
}
