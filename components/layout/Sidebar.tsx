"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, MessageSquare, Users, FileText, LogOut, MessageCircle, X } from "lucide-react";
import Image from "next/image";
import React from "react";

// ATENÇÃO: Classes Tailwind dinâmicas como `bg-[${cor...}]` podem não funcionar
// sem configuração adicional (CSS variables ou substituição por classes estáticas).
const corDestaque = "#84C1FA"; // Ex: substitua por 'text-blue-400'
const corTexto = "#091C53";    // Ex: substitua por 'text-slate-800'
const corBackgroundSidebar = "#DDE7F7"; // Ex: substitua por 'bg-slate-100'
const corTextoHover = corDestaque; // Ex: substitua por 'hover:text-blue-400'
const corBackgroundAtivo = corDestaque; // Ex: substitua por 'bg-blue-400'
const corTextoAtivo = corTexto; // Ex: substitua por 'text-slate-800'

const navItems = [
  { href: "/dashboard", label: "Início", icon: Home },
  { href: "/dashboard/avaliacoes", label: "Avaliações", icon: MessageSquare },
  { href: "/dashboard/conversas", label: "Conversas n8n", icon: MessageCircle },
  { href: "/dashboard/relatorios", label: "Relatórios", icon: FileText },
  { href: "/dashboard/clientes", label: "Clientes", icon: Users },
  // { href: "/dashboard/configuracoes", label: "Configurações", icon: Settings },
];

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export default function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  const pathname = usePathname();

  // Classes base da sidebar
  const sidebarBaseClasses = `w-64 p-6 flex flex-col shadow-lg transition-transform duration-300 ease-in-out z-30 print:hidden`;
  // Classes para mobile: fixa, fora da tela inicialmente, desliza para dentro
  const mobileClasses = `fixed inset-y-0 left-0 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'}`;
  // Classes para desktop: estática, parte do layout
  const desktopClasses = `md:relative md:translate-x-0 md:flex`;
  
  // Esta classe dinâmica precisa ser um nome de classe Tailwind válido ou usar CSS var.
  // Exemplo: const dynamicBgClass = 'bg-slate-100';
  const dynamicBgClass = `bg-[${corBackgroundSidebar}]`; 

  return (
    <aside className={`${sidebarBaseClasses} ${dynamicBgClass} ${mobileClasses} ${desktopClasses}`}>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Image
            src="/logo.svg" 
            alt="R.A.I.O Logo"
            width={32}
            height={32}
            className="h-8 w-8"
          />
          {/* Esta classe dinâmica precisa ser um nome de classe Tailwind válido ou usar CSS var. */}
          <span className={`text-2xl font-bold text-[${corDestaque}]`}>R.A.I.O</span>
        </div>
        {/* Botão de fechar para mobile */}
        <button
            onClick={() => setIsOpen(false)}
            className="md:hidden p-1 text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-white"
            aria-label="Fechar menu"
        >
            <X size={24} />
        </button>
      </div>
      <nav className="flex-grow">
        <ul>
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
            // Estas classes dinâmicas precisam ser nomes de classes Tailwind válidos ou usar CSS vars.
            const activeClasses = `bg-[${corBackgroundAtivo}] text-[${corTextoAtivo}] font-medium shadow-sm`;
            const inactiveClasses = `text-[${corTexto}] hover:bg-[${corDestaque}] hover:text-[${corTextoAtivo}]`;
            const iconActiveColor = `text-[${corTextoAtivo}]`;
            const iconInactiveColor = `text-[${corTexto}] group-hover:text-[${corTextoAtivo}]`;

            return (
              <li key={item.label} className="mb-2">
                <Link
                  href={item.href}
                  onClick={() => { if (window.innerWidth < 768) setIsOpen(false); }} // Fecha sidebar no clique em mobile
                  className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors group
                    ${isActive ? activeClasses : inactiveClasses}`}
                >
                  <item.icon className={`h-5 w-5 ${isActive ? iconActiveColor : iconInactiveColor}`} />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <div>
        <button
          // onClick={() => signOut()} // Implementar logout
          className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors w-full text-left
                     text-[${corTexto}] hover:bg-[${corDestaque}] hover:text-[${corTextoAtivo}]`}
        >
          <LogOut className="h-5 w-5" />
          <span>Sair</span>
        </button>
      </div>
    </aside>
  );
}