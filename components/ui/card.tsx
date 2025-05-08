import * as React from "react"
import { cn } from "@/lib/utils"

// --- Removidas as definições de cores JavaScript ---
// const cardBgLight = "#FFFFFF";
// const cardFgLight = "#091C53";
// const cardBorderLight = "#DDE7F7";
// const cardMutedFgLight = "rgba(9, 28, 83, 0.7)";
// const cardHeaderFooterBgLight = "#E8EEFC";

// const cardBgDark = "#1F2937";
// const cardFgDark = "#E5E7EB";
// const cardBorderDark = "#374151";
// const cardMutedFgDark = "rgba(229, 231, 235, 0.7)";
// const cardHeaderFooterBgDark = "#111827";


const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-lg border bg-card text-card-foreground shadow-sm", // Usando variáveis CSS via Tailwind
      className
    )}
    {...props}
  />
))
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex flex-col space-y-1.5 p-6",
      // Opcional: diferenciar fundo do header - geralmente não é necessário se o card já tem bg-card
      className
    )}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-2xl font-semibold leading-none tracking-tight", // A cor é herdada de Card (text-card-foreground)
      className
    )}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn(
      "text-sm text-muted-foreground", // Usando text-muted-foreground
      className
    )}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex items-center p-6 pt-0",
      // Opcional: diferenciar fundo do footer
      // `bg-[${cardHeaderFooterBgLight}] dark:bg-[${cardHeaderFooterBgDark}] rounded-b-lg`,
      className
    )}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
