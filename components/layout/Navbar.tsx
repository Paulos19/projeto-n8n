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

  // Novas cores
  const corDestaque = "#84C1FA";
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
    <nav className={`sticky top-0 z-50 shadow-lg bg-[${corBackground}] bg-opacity-95 dark:bg-[${corBackgroundDark}] dark:bg-opacity-95 backdrop-blur-md text-[${corTexto}] dark:text-[${corTextoDark}]`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Link href="/" className={`flex items-center space-x-2 focus:outline-none focus:ring-2 focus:ring-[${corDestaque}] dark:focus:ring-[${corDestaqueDark}] rounded-sm`}>
              <Image
                src="/logo.svg" // Assumindo que o logo.svg já foi atualizado ou está ok com a cor interna
                alt="R.A.I.O Logo"
                width={32} 
                height={32} 
                className="h-8 w-8"
                priority 
              />
              <span className={`text-2xl font-bold text-[${corDestaque}] dark:text-[${corDestaqueDark}]`}> {/* Removido gradiente, usando cor de destaque */}
                R.A.I.O
              </span>
            </Link>
          </motion.div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-4"> {/* Ajustado space-x-6 para space-x-4 para acomodar o botão de tema */}
            {navLinks.map((link) => (
              <motion.div
                key={link.href}
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  href={link.href}
                  className={`px-3 py-2 rounded-md text-sm font-medium hover:bg-[${corHoverLinkBg}] dark:hover:bg-[${corHoverLinkBgDark}] transition-colors`}
                >
                  {link.label}
                </Link>
              </motion.div>
            ))}
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                href="/dashboard"
                className={`bg-[${corDestaque}] hover:bg-[${corHoverBotaoDestaque}] text-[${corTexto}] dark:bg-[${corDestaqueDark}] dark:hover:bg-[${corHoverBotaoDestaqueDark}] dark:text-white font-semibold px-4 py-2 rounded-lg shadow-md transition-all duration-300 ease-in-out transform hover:scale-105`}
              >
                Acessar Dashboard
              </Link>
            </motion.div>
            {/* Botão de Alternar Tema */}
            <motion.button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className={`p-2 rounded-md hover:bg-[${corHoverLinkBg}] dark:hover:bg-[${corHoverLinkBgDark}] transition-colors`}
              aria-label="Alternar tema"
              whileTap={{ scale: 0.9 }}
            >
              {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
            </motion.button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-2">
             {/* Botão de Alternar Tema para Mobile */}
            <motion.button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className={`p-2 rounded-md text-[${corTexto}] dark:text-[${corTextoDark}] hover:bg-[${corHoverLinkBg}] dark:hover:bg-[${corHoverLinkBgDark}] focus:outline-none`}
              aria-label="Alternar tema"
              whileTap={{ scale: 0.9 }}
            >
              {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
            </motion.button>
            <motion.button
              onClick={toggleMenu}
              className={`inline-flex items-center justify-center p-2 rounded-md text-[${corTexto}] dark:text-[${corTextoDark}] hover:bg-[${corHoverLinkBg}] dark:hover:bg-[${corHoverLinkBgDark}] focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[${corDestaque}] dark:focus:ring-[${corDestaqueDark}]`}
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
            className={`md:hidden absolute top-20 left-0 right-0 bg-[${corBackground}] bg-opacity-95 dark:bg-[${corBackgroundDark}] dark:bg-opacity-95 backdrop-blur-md shadow-lg pb-3`}
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
                    className={`block px-3 py-2 rounded-md text-base font-medium text-[${corTexto}] dark:text-[${corTextoDark}] hover:bg-[${corHoverLinkBg}] dark:hover:bg-[${corHoverLinkBgDark}]`}
                    onClick={() => setIsOpen(false)}
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
              <motion.div variants={menuItemVariants} className="pt-2">
                <Link
                  href="/dashboard"
                  className={`block w-full text-center bg-[${corDestaque}] hover:bg-[${corHoverBotaoDestaque}] text-[${corTexto}] dark:bg-[${corDestaqueDark}] dark:hover:bg-[${corHoverBotaoDestaqueDark}] dark:text-white font-semibold px-4 py-3 rounded-lg shadow-md transition-all duration-300 ease-in-out`}
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