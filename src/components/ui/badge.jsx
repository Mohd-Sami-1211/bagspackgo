import * as React from "react"
import { cva } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-emerald-600 text-white shadow-sm",
        secondary: "border-transparent bg-gray-100 text-gray-900",
        destructive: "border-transparent bg-red-500 text-white shadow-sm",
        outline: "border-gray-200 text-gray-700",
        success: "border-transparent bg-emerald-50 text-emerald-700 border-emerald-200",
        warning: "border-transparent bg-amber-50 text-amber-700 border-amber-200",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({ className, variant, ...props }) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
