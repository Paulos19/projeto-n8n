"use client";
import Link from "next/link";
import { motion } from "framer-motion";

interface NavLinkItemProps {
  href: string;
  label: string;
  onClick?: () => void;
  isMobile?: boolean;
}

export function NavLinkItem({ href, label, onClick, isMobile }: NavLinkItemProps) {
  const commonClasses = "px-3 py-2 rounded-md font-medium transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background";
  const desktopClasses = "text-sm text-foreground/80 hover:text-foreground hover:bg-accent";
  const mobileClasses = "block text-base text-foreground/90 hover:text-foreground hover:bg-accent w-full text-left";

  const variants = {
    initial: { opacity: 0, y: -10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
    hoverDesktop: { scale: 1.05, y: -2, color: "var(--foreground)" }, // Use CSS var for color
    tap: { scale: 0.95 }
  };

  return (
    <motion.div
      variants={isMobile ? { initial: variants.initial, animate: variants.animate, exit: variants.exit } : variants}
      whileHover={!isMobile ? "hoverDesktop" : undefined}
      whileTap={!isMobile ? "tap" : undefined}
      className={isMobile ? "w-full" : ""}
    >
      <Link
        href={href}
        className={`${commonClasses} ${isMobile ? mobileClasses : desktopClasses}`}
        onClick={onClick}
      >
        {label}
      </Link>
    </motion.div>
  );
}