import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0" +
" hover-elevate active-elevate-2",
  {
    variants: {
      variant: {
        default:
           "bg-gradient-to-r from-[#FAC985] via-[#F6A8B7] to-[#F6A8B7] text-white border-none shadow-[0_4px_18px_rgba(229,119,46,0.3)] hover:shadow-[0_6px_22px_rgba(229,119,46,0.45)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/0 before:via-white/20 before:to-white/0 before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-1000",
        destructive:
           "bg-destructive text-destructive-foreground shadow-sm border-destructive-border",
        outline:
           " border [border-color:var(--button-outline)] shadow-xs active:shadow-none ",
        secondary:
           "border bg-secondary/30 backdrop-blur-md text-secondary-foreground border-white/20 hover:bg-secondary/40",
        ghost: "border border-transparent hover:bg-white/10",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "min-h-[clamp(46px,13.74vw,62px)] rounded-full px-8 py-3 text-base font-semibold tracking-wide",
        sm: "min-h-10 rounded-full px-4 text-xs font-medium",
        lg: "min-h-14 rounded-full px-10 text-lg font-semibold",
        icon: "h-11 w-11 rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
