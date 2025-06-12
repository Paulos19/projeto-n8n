"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, MessageSquare, Users, FileText, LogOut, MessageCircle, X, Sun, Moon, Settings, UserCircle as UserIcon, Bot } from "lucide-react"; 
import NextImage from "next/image"; 
import React, { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { useSession, signOut } from "next-auth/react"; 
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"; 
import { motion } from "framer-motion"; 


const gradientTextClassesSideBar = "bg-clip-text text-transparent bg-gradient-to-r from-sky-500 via-cyan-400 to-emerald-500";


const navItems = [
  { href: "/dashboard", label: "Início", icon: Home },
  { href: "/dashboard/avaliacoes", label: "Avaliações", icon: MessageSquare },
  { href: "/dashboard/conversas", label: "Conversas", icon: MessageCircle },
  { href: "/dashboard/clientes", label: "Clientes", icon: Users },
  { href: "/dashboard/sellers", label: "Vendedores", icon: UserIcon },
  { href: "/dashboard/chatbot", label: "Assistente IA", icon: Bot },
  { href: "/dashboard/relatorios", label: "Relatórios", icon: FileText },
  { href: "/dashboard/configuracoes", label: "Configurações", icon: Settings },
];

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export default function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const { data: session, status } = useSession(); 

  useEffect(() => {
    setMounted(true);
  }, []);

  const sidebarBaseClasses = `w-64 p-6 flex flex-col shadow-lg transition-transform duration-300 ease-in-out z-30 print:hidden`;
  const mobileClasses = `fixed inset-y-0 left-0 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'}`;
  const desktopClasses = `md:relative md:translate-x-0 md:flex`;
  



  return (
    <aside 
      className={`${sidebarBaseClasses} bg-[var(--sidebar-transparent-bg)] backdrop-blur-md ${mobileClasses} ${desktopClasses}`}
    >
      <div className="mb-4 flex items-center justify-between">
        <Link href='/'>
        <motion.div
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut", delay: 0.2 }}
          className="flex items-center space-x-2"
        >
          <NextImage
            src="/logo.svg" 
            alt="R.A.I.O Logo"
            width={26} 
            height={39} 
            className="h-8 w-auto" 
          />
          
          <span className={`text-2xl font-bold ${gradientTextClassesSideBar}`}>R.A.I.O</span>
        </motion.div>
        </Link>
        <button
            onClick={() => setIsOpen(false)}
            className="md:hidden p-1 text-muted-foreground hover:text-foreground" 
            aria-label="Fechar menu"
        >
            <X size={24} />
        </button>
      </div>
      <nav className="flex-grow">
        <ul>
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
            const activeClasses = `bg-sidebar-primary text-sidebar-primary-foreground font-medium shadow-sm`; 
            const inactiveClasses = `text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground`; 

            return (
              <li key={item.label} className="mb-2">
                <Link
                  href={item.href}
                  onClick={() => { if (window.innerWidth < 768) setIsOpen(false); }}
                  className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors group
                    ${isActive ? activeClasses : inactiveClasses}`}
                >
                  <item.icon className={`h-5 w-5 ${isActive ? 'text-sidebar-primary-foreground' : 'text-sidebar-foreground group-hover:text-sidebar-accent-foreground'}`} /> {}
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="mt-auto space-y-2"> {}
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors w-full text-left
                     text-sidebar-foreground cursor-pointer hover:bg-sidebar-accent hover:text-sidebar-accent-foreground`}
          aria-label="Alternar tema"
          disabled={!mounted} 
        >
          {mounted ? (theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />) : <div className="h-5 w-5" /> }
          <span>Alternar Tema</span>
        </button>
        {status === "authenticated" && (
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors w-full text-left
                       text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground`}
          >
            <LogOut className="h-5 w-5" />
            <span>Sair</span>
          </button>
        )}
      </div>
    </aside>
  );
}
