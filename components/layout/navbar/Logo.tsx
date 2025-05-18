"use client";
import Link from "next/link";
import NextImage from "next/image";
import { motion } from "framer-motion";

export function Logo() {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, ease: "circOut" }}
    >
      <Link
        href="/"
        className="flex items-center space-x-2.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-md p-1 -ml-1"
      >
        <NextImage
          src="/logo.svg"
          alt="R.A.I.O Logo"
          width={36} // Slightly larger
          height={36}
          className="h-9 w-9" // Slightly larger
          priority
        />
        <span className="text-3xl font-bold text-primary tracking-tight"> {/* Bolder, tighter tracking */}
          R.A.I.O
        </span>
      </Link>
    </motion.div>
  );
}