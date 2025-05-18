"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

interface LoginButtonProps {
  isMobile?: boolean;
  onClick?: () => void;
}

export function LoginButton({ isMobile, onClick }: LoginButtonProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      className={isMobile ? "w-full" : ""}
    >
      <Button
        asChild
        variant="default" 
        size={isMobile ? "lg" : "default"}
        className="w-full group shadow-lg hover:shadow-primary/40 transition-shadow duration-300"
      >
        <Link
          href="/api/auth/signin" 
          onClick={onClick}
        >
          Acessar Plataforma
          <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
        </Link>
      </Button>
    </motion.div>
  );
}