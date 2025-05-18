"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Logo } from "./navbar/Logo";
import { NavLinks } from "./navbar/NavLinks";
import { UserMenu } from "./navbar/UserMenu";
import { LoginButton } from "./navbar/LoginButton";
import { ThemeToggleButton } from "./navbar/ThemeToggleButton";
import { MobileMenuButton } from "./navbar/MobileMenuButton";
import { MobileMenu } from "./navbar/MobileMenu";

const navLinks = [
  { href: "#beneficios", label: "Benefícios" },
  { href: "#funcionalidades", label: "Funcionalidades" },
  { href: "#sobre", label: "Sobre o R.A.I.O" },
  { href: "#contato", label: "Contato" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { data: session, status } = useSession();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav className="sticky top-0 z-50 shadow-lg bg-background/80 dark:bg-background/80 backdrop-blur-lg text-foreground border-b border-border/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <Logo />
          <div className="hidden md:flex items-center space-x-6">
            <NavLinks links={navLinks} />
            <div className="flex items-center space-x-3">
              {status === "loading" ? (
                <div className="h-10 w-28 bg-muted animate-pulse rounded-md"></div>
              ) : session ? (
                <UserMenu session={session} />
              ) : (
                <LoginButton />
              )}
              <ThemeToggleButton />
            </div>
          </div>
          <div className="md:hidden flex items-center space-x-2">
            <ThemeToggleButton iconSize={20} />
            <MobileMenuButton isOpen={isOpen} toggleMenu={toggleMenu} />
          </div>
        </div>
      </div>
      <MobileMenu
        isOpen={isOpen}
        navLinks={navLinks}
        status={status}
        setIsOpen={setIsOpen}
      />
    </nav>
  );
}