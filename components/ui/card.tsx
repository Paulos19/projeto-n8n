import * as React from "react"
import { cn } from "@/lib/utils"

// --- Definição das Cores para Cards (alinhado com a paleta do projeto) ---

// Modo Claro
const cardBgLight = "#FFFFFF";        // corCardBackground
const cardFgLight = "#091C53";        // corTexto
const cardBorderLight = "#DDE7F7";    // corCardBorda
const cardMutedFgLight = "rgba(9, 28, 83, 0.7)"; // corTexto com opacidade para descrições
const cardHeaderFooterBgLight = "#E8EEFC"; // corBackground (para cabeçalho/rodapé se diferenciado)

// Modo Escuro
const cardBgDark = "#1F2937";         // corCardBackgroundDark
const cardFgDark = "#E5E7EB";         // corTextoDark
const cardBorderDark = "#374151";     // corCardBordaDark
const cardMutedFgDark = "rgba(229, 231, 235, 0.7)"; // corTextoDark com opacidade para descrições
const cardHeaderFooterBgDark = "#111827"; // corBackgroundSecaoAlternativaDark (para cabeçalho/rodapé se diferenciado)


const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-lg border shadow-sm",
      `bg-[${cardBgLight}] text-[${cardFgLight}] border-[${cardBorderLight}]`,
      `dark:bg-[${cardBgDark}] dark:text-[${cardFgDark}] dark:border-[${cardBorderDark}]`,
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
      // Opcional: diferenciar fundo do header
      // `bg-[${cardHeaderFooterBgLight}] dark:bg-[${cardHeaderFooterBgDark}] rounded-t-lg`, 
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
      "text-2xl font-semibold leading-none tracking-tight",
      // A cor do título já é herdada de Card (cardFgLight/Dark)
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
      "text-sm",
      `text-[${cardMutedFgLight}] dark:text-[${cardMutedFgDark}]`,
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
