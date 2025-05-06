"use client";

import Link from "next/link";
import Image from "next/image"; // Adicionado para usar o componente Image do Next.js
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";

const navLinks = [
  { href: "#beneficios", label: "Benefícios" },
  { href: "#funcionalidades", label: "Funcionalidades" },
  { href: "#sobre", label: "Sobre o R.A.I.O" },
  { href: "#contato", label: "Contato" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

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

  return (
    <nav className="sticky top-0 z-50 bg-gradient-to-r from-gray-900 via-blue-900 to-blue-800 text-white shadow-lg">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Link href="/" className="flex items-center space-x-2 focus:outline-none focus:ring-2 focus:ring-blue-400 rounded-sm"> {/* Adicionado space-x-2 para espaçamento entre logo e texto */}
              <Image
                src="/logo.svg"
                alt="R.A.I.O Logo"
                width={32} // Ajustado para um tamanho menor para melhor alinhamento com o texto
                height={32} 
                className="h-8 w-8" // Usando w-8 para manter proporção quadrada, ajuste se necessário
                priority 
              />
              <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-teal-300 to-green-300">
                R.A.I.O
              </span>
            </Link>
          </motion.div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
            {navLinks.map((link) => (
              <motion.div
                key={link.href}
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  href={link.href}
                  className="px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  {link.label}
                </Link>
              </motion.div>
            ))}
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                href="/dashboard" // Ou sua rota de login/dashboard
                className="bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 text-white font-semibold px-4 py-2 rounded-lg shadow-md transition-all duration-300 ease-in-out transform hover:scale-105"
              >
                Acessar Dashboard
              </Link>
            </motion.div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <motion.button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-300 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
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
            className="md:hidden absolute top-20 left-0 right-0 bg-gray-800 bg-opacity-95 backdrop-blur-sm shadow-lg pb-3"
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={menuVariants}
          >
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {navLinks.map((link) => (
                <motion.div key={link.href} variants={menuItemVariants}>
                  <Link
                    href={link.href}
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-700"
                    onClick={() => setIsOpen(false)} // Fecha o menu ao clicar
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
              <motion.div variants={menuItemVariants} className="pt-2">
                <Link
                  href="/dashboard" // Ou sua rota de login/dashboard
                  className="block w-full text-center bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 text-white font-semibold px-4 py-3 rounded-lg shadow-md transition-all duration-300 ease-in-out"
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