import * as React from "react"

import { cn } from "@/lib/utils"

const Card = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("rounded-xl border bg-card text-card-foreground shadow", className)}
    {...props} />
))
Card.displayName = "Card"

const CardHeader = React.forwardRef(({ className, style, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col", className)}
    style={{ padding: '24px', paddingBottom: '0', gap: '6px', ...style }}
    {...props} />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("font-semibold leading-none tracking-tight", className)}
    {...props} />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props} />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef(({ className, style, ...props }, ref) => (
  <div
    ref={ref}
    className={className}
    style={{ padding: '24px', paddingTop: '0', ...style }}
    {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef(({ className, style, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center", className)}
    style={{ padding: '24px', paddingTop: '0', ...style }}
    {...props} />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
