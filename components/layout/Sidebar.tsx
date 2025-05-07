"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, BarChart2, MessageSquare, Users, Settings, FileText, LogOut, MessageCircle } from "lucide-react"; // Adicionado FileText e MessageCircle
import Image from "next/image";

// Definição das cores para uso no componente
const corDestaque = "#84C1FA";
const corTexto = "#091C53";
const corBackgroundSidebar = "#DDE7F7"; // Um tom ligeiramente diferente do background principal para destacar a sidebar
const corTextoHover = corDestaque;
const corBackgroundAtivo = corDestaque;
const corTextoAtivo = corTexto; // Texto escuro no item ativo para contraste com fundo de destaque

const navItems = [
  { href: "/dashboard", label: "Início", icon: Home },
  { href: "/dashboard/avaliacoes", label: "Avaliações", icon: MessageSquare },
  { href: "/dashboard/conversas", label: "Conversas n8n", icon: MessageCircle }, // Novo item
  { href: "/dashboard/relatorios", label: "Relatórios", icon: FileText },
  { href: "/dashboard/clientes", label: "Clientes", icon: Users },
  // { href: "/dashboard/configuracoes", label: "Configurações", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className={`w-64 bg-[${corBackgroundSidebar}] p-6 flex flex-col shadow-lg`}>
      <div className="mb-8 flex items-center space-x-2">
        <Image
          src="/logo.svg" // Verifique se o SVG está com a cor de preenchimento desejada (ex: corDestaque)
          alt="R.A.I.O Logo"
          width={32}
          height={32}
          className="h-8 w-8"
        />
        <span className={`text-2xl font-bold text-[${corDestaque}]`}>R.A.I.O</span>
      </div>
      <nav className="flex-grow">
        <ul>
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
            return (
              <li key={item.label} className="mb-2">
                <Link
                  href={item.href}
                  className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors
                    ${
                      isActive
                        ? `bg-[${corBackgroundAtivo}] text-[${corTextoAtivo}] font-medium shadow-sm`
                        : `text-[${corTexto}] hover:bg-[${corDestaque}] hover:text-[${corTextoAtivo}]`
                    }`}
                >
                  <item.icon className={`h-5 w-5 ${isActive ? `text-[${corTextoAtivo}]` : `text-[${corTexto}] group-hover:text-[${corTextoAtivo}]`}`} />
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