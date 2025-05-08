"use client";

import Link from "next/link";
import Image from "next/image"; // Adicionado para usar o componente Image do Next.js
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Sun, Moon } from "lucide-react"; // Adicionado Sun e Moon
import { useTheme } from "next-themes"; // Importado useTheme

const navLinks = [
  { href: "#beneficios", label: "Benefícios" },
  { href: "#funcionalidades", label: "Funcionalidades" },
  { href: "#sobre", label: "Sobre o R.A.I.O" },
  { href: "#contato", label: "Contato" },
];

const corHoverBotaoDestaqueDark = "#2563EB"; // azul um pouco mais escuro para hover de botão

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { theme, setTheme } = useTheme(); // Hook para gerenciar o tema

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const menuVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.1 } },
  };

  const menuItemVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: { opacity: 1, y: 0 },
  };

  // Removidas as constantes de cor JavaScript
  // const corDestaque = "#84C1FA";
  const corTexto = "#091C53";
  const corBackground = "#E8EEFC";
  // Cor para hover em links, um pouco mais escura que o background ou um tom do destaque
  const corHoverLinkBg = "#DDE7F7"; // Um tom mais escuro do background
  const corHoverBotaoDestaque = "#67B3F9"; // Um tom mais escuro do destaque

  // Cores para o modo escuro (exemplo, ajuste conforme seu design anterior)
  const corDestaqueDark = "#3B82F6"; // Um azul mais vibrante para o modo escuro
  const corTextoDark = "#E5E7EB"; // cinza claro para texto
  const corBackgroundDark = "#111827"; // cinza bem escuro para o fundo
  const corHoverLinkBgDark = "#1F2937"; // cinza um pouco mais claro para hover de links
  const corHoverBotaoDestaqueDark = "#2563EB"; // azul um pouco mais escuro para hover de botão

  return (
    <nav className="sticky top-0 z-50 shadow-lg bg-background/95 dark:bg-background/95 backdrop-blur-md text-foreground"> {/* Usando variáveis CSS */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Link href="/" className="flex items-center space-x-2 focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-primary rounded-sm">
              <Image
                src="/logo.svg"
                alt="R.A.I.O Logo"
                width={32}
                height={32}
                className="h-8 w-8"
                priority
              />
              <span className="text-2xl font-bold text-primary dark:text-primary"> {/* Usando cor primária do tema */}
                R.A.I.O
              </span>
            </Link>
          </motion.div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {navLinks.map((link) => (
              <motion.div
                key={link.href}
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  href={link.href}
                  className="px-3 py-2 rounded-md text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors" // Usando accent para hover
                >
                  {link.label}
                </Link>
              </motion.div>
            ))}
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                href="/dashboard"
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-4 py-2 rounded-lg shadow-md transition-all duration-300 ease-in-out transform hover:scale-105" // Usando cores primárias
              >
                Acessar Dashboard
              </Link>
            </motion.div>
            {/* Botão de Alternar Tema */}
            <motion.button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors" // Usando accent para hover
              aria-label="Alternar tema"
              whileTap={{ scale: 0.9 }}
            >
              {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
            </motion.button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-2">
            <motion.button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 rounded-md text-foreground hover:bg-accent hover:text-accent-foreground focus:outline-none" // Usando accent para hover
              aria-label="Alternar tema"
              whileTap={{ scale: 0.9 }}
            >
              {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
            </motion.button>
            <motion.button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-foreground hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary" // Usando accent e primary
              aria-label="Menu principal"
              whileTap={{ scale: 0.9 }}
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="md:hidden absolute top-20 left-0 right-0 bg-background shadow-lg pb-3" // Usando bg-background
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            variants={menuVariants} // Reutilizando menuVariants para consistência se aplicável
          >
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {navLinks.map((link) => (
                <motion.div key={link.href} variants={menuItemVariants}>
                  <Link
                    href={link.href}
                    className="block px-3 py-2 rounded-md text-base font-medium text-foreground hover:bg-accent hover:text-accent-foreground" // Usando accent para hover
                    onClick={() => setIsOpen(false)}
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
              <motion.div variants={menuItemVariants} className="pt-2">
                <Link
                  href="/dashboard"
                  className="block w-full text-center bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-4 py-3 rounded-lg shadow-md transition-all duration-300 ease-in-out" // Usando cores primárias
                  onClick={() => setIsOpen(false)}
                >
                  Acessar Dashboard
                </Link>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}