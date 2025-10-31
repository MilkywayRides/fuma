import { ComponentPropsWithoutRef, CSSProperties, FC } from "react"
import { cn } from "@/lib/utils"

export interface AnimatedShinyTextProps
  extends ComponentPropsWithoutRef<"span"> {
  shimmerWidth?: number
}

export const AnimatedShinyText: FC<AnimatedShinyTextProps> = ({
  children,
  className,
  shimmerWidth = 100,
  ...props
}) => {
  return (
    <span
      style={
        {
          "--shiny-width": `${shimmerWidth}px`,
        } as CSSProperties
      }
      className={cn(
        "animate-shiny-text bg-clip-text text-transparent [background-size:var(--shiny-width)_100%] [background-position:0_0] bg-no-repeat",
        "bg-gradient-to-r from-transparent via-foreground via-50% to-transparent",
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
}
