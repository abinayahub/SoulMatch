import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex min-h-[clamp(43px,12.72vw,57px)] w-full rounded-full border border-white/35 bg-white/45 backdrop-blur-[16px] px-5 py-2 text-base text-[#7A2D13] shadow-inner transition-all placeholder:text-[#707070]/60 focus:bg-white/65 focus:border-[#F6A8B7] focus:ring-2 focus:ring-[#F6A8B7]/25 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
