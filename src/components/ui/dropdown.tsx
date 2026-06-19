'use client';

import * as React from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

export interface DropdownProps extends React.HTMLAttributes<HTMLDivElement> {
  trigger: React.ReactNode;
  children: React.ReactNode;
}

export function Dropdown({ trigger, children, className, ...props }: DropdownProps) {
  // We use open/onOpenChange internally if needed, but Radix handles most for us
  const [open, setOpen] = React.useState(false);

  return (
    <div className={cn("inline-block", className)} {...props}>
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <div className="cursor-pointer inline-flex items-center justify-center">
            {trigger}
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          align="end" 
          className="w-56 p-1 z-50"
          onClick={() => setOpen(false)} // Close on any item click by default
        >
          {children}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
