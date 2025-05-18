"use client";
import Link from "next/link";
import NextImage from "next/image";
import { motion } from "framer-motion";

// Defina as classes do gradiente para reutilização
const gradientTextClasses = "bg-clip-text text-transparent bg-gradient-to-r from-sky-500 via-cyan-400 to-emerald-500";

export function Logo() {
  return (
    <motion.div
      initial={{ opacity: 0, x: -30, scale: 0.8, rotate: -5 }}
      animate={{ opacity: 1, x: 0, scale: 1, rotate: 0 }}
      transition={{ duration: 0.6, ease: "circOut", delay: 0.1 }}
      whileHover={{ scale: 1.08, rotate: 3, transition: { duration: 0.3 } }}
      whileTap={{ scale: 0.95 }}
    >
      <Link
        href="/"
        className="flex items-center space-x-2.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-md p-1 -ml-1"
      >
        <NextImage
          src="/logo.svg" // Mantendo o SVG que definimos anteriormente
          alt="R.A.I.O Logo"
          width={28} 
          height={42} 
          className="h-9" 
          priority
        />
        <span className={`text-3xl font-bold tracking-tight ${gradientTextClasses}`}> {/* Aplicando o gradiente */}
          R.A.I.O
        </span>
      </Link>
    </motion.div>
  );
}