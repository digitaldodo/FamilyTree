import * as React from "react"
import { cn } from "@/lib/utils"

const RadioGroupContext = React.createContext<{
  value?: string
  onValueChange?: (value: string) => void
}>({})

export const RadioGroup = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    value?: string
    onValueChange?: (value: string) => void
  }
>(({ className, value, onValueChange, ...props }, ref) => {
  return (
    <RadioGroupContext.Provider value={{ value, onValueChange }}>
      <div ref={ref} className={cn("grid gap-2", className)} {...props} />
    </RadioGroupContext.Provider>
  )
})
RadioGroup.displayName = "RadioGroup"

export const RadioGroupItem = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { value: string }
>(({ className, value, id, ...props }, ref) => {
  const context = React.useContext(RadioGroupContext)
  const checked = context.value === value

  return (
    <button
      type="button"
      role="radio"
      aria-checked={checked}
      id={id}
      ref={ref}
      onClick={() => context.onValueChange?.(value)}
      className={cn(
        "aspect-square h-4 w-4 rounded-full border border-primary text-primary shadow focus:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 flex items-center justify-center",
        className
      )}
      {...props}
    >
      {checked && (
        <span className="h-2.5 w-2.5 rounded-full bg-primary" />
      )}
    </button>
  )
})
RadioGroupItem.displayName = "RadioGroupItem"
