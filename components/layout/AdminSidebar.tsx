"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { Home, Users, BookText, LogOut, ShieldCheck, Sun, Moon, Briefcase, MessageSquare, MessageCircle, BarChartHorizontal } from "lucide-react";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";

// ATUALIZADO: Adicionados links para dados
const adminNavItems = [
  { href: "/admin", label: "Dashboard", icon: Home },
  { href: "/admin/users", label: "Usuários", icon: Users },
  { href: "/admin/sellers", label: "Vendedores", icon: Briefcase },
  { href: "/admin/avaliacoes", label: "Avaliações", icon: MessageSquare },
  { href: "/admin/conversas", label: "Conversas", icon: MessageCircle },
  { href: "/admin/reports", label: "Relatórios", icon: BarChartHorizontal }
];

interface AdminSidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export default function AdminSidebar({ isOpen, setIsOpen }: AdminSidebarProps) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const sidebarBaseClasses = "w-64 bg-card text-card-foreground p-6 flex flex-col shadow-lg transition-transform duration-300 ease-in-out z-30 print:hidden";
  const mobileClasses = `fixed inset-y-0 left-0 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'}`;
  const desktopClasses = `md:relative md:translate-x-0 md:flex`;
  const gradientText = "bg-clip-text text-transparent bg-gradient-to-r from-red-500 via-orange-500 to-amber-500";

  return (
    <aside className={`${sidebarBaseClasses} ${mobileClasses} ${desktopClasses}`}>
      <div className="mb-8 flex items-center gap-2">
        <span className={`text-2xl font-bold ${gradientText}`}>Admin R.A.I.O</span>
      </div>
      <nav className="flex-grow">
        <ul>
          {adminNavItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
            const activeClasses = "bg-primary text-primary-foreground font-semibold shadow-sm";
            const inactiveClasses = "text-foreground hover:bg-accent hover:text-accent-foreground";

            return (
              <li key={item.label} className="mb-2">
                <Link
                  href={item.href}
                  onClick={() => { if (window.innerWidth < 768) setIsOpen(false); }}
                  className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors group ${isActive ? activeClasses : inactiveClasses}`}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="mt-auto space-y-2">
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors w-full text-left text-foreground hover:bg-accent"
          disabled={!mounted}
        >
          {mounted ? (theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />) : <div className="h-5 w-5" />}
          <span>Alternar Tema</span>
        </button>
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className="flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors w-full text-left text-destructive hover:bg-destructive/10"
        >
          <LogOut className="h-5 w-5" />
          <span>Sair</span>
        </button>
      </div>
    </aside>
  );
}
