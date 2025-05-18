"use client";
import { motion } from "framer-motion";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

interface ThemeToggleButtonProps {
  className?: string;
  iconSize?: number;
}

export function ThemeToggleButton({ className, iconSize = 22 }: ThemeToggleButtonProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <Button variant="ghost" size="icon" className={`animate-pulse ${className}`} style={{ width: iconSize + 18, height: iconSize + 18 }} disabled />;
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className={`relative overflow-hidden ${className}`}
      aria-label="Alternar tema"
    >
      <motion.div
        key={theme}
        initial={{ y: theme === "dark" ? -20 : 20, opacity: 0, scale: 0.8, rotate: theme === "dark" ? -90 : 90 }}
        animate={{ y: 0, opacity: 1, scale: 1, rotate: 0 }}
        exit={{ y: theme === "dark" ? 20 : -20, opacity: 0, scale: 0.8, rotate: theme === "dark" ? 90 : -90 }}
        transition={{ duration: 0.25, ease: "circOut" }}
        className="absolute inset-0 flex items-center justify-center"
      >
        {theme === "dark" ? <Sun size={iconSize} /> : <Moon size={iconSize} />}
      </motion.div>
    </Button>
  );
}