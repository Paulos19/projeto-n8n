"use client";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MobileMenuButtonProps {
  isOpen: boolean;
  toggleMenu: () => void;
}

export function MobileMenuButton({ isOpen, toggleMenu }: MobileMenuButtonProps) {
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleMenu}
      className="relative overflow-hidden"
      aria-label="Menu principal"
      aria-expanded={isOpen}
    >
      <AnimatePresence initial={false} mode="wait">
        <motion.div
          key={isOpen ? "x" : "menu"}
          initial={{ rotate: isOpen ? -90 : 90, opacity: 0, scale: 0.7 }}
          animate={{ rotate: 0, opacity: 1, scale: 1 }}
          exit={{ rotate: isOpen ? 90 : -90, opacity: 0, scale: 0.7 }}
          transition={{ duration: 0.25, ease: "circOut" }}
          className="absolute inset-0 flex items-center justify-center"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </motion.div>
      </AnimatePresence>
    </Button>
  );
}