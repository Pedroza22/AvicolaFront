"use client"

import * as React from "react"

export function Popover({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>
}

export function PopoverTrigger({ children }: { children: React.ReactNode; asChild?: boolean }) {
  return <>{children}</>
}

export function PopoverContent({ children, className, align }: { children: React.ReactNode; className?: string; align?: string }) {
  return <div className={className} data-align={align}>{children}</div>
}

export default Popover
