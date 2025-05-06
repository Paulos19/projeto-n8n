import Link from "next/link";
import { Home, BarChart2, Settings, Users, MessageSquare, Bell, UserCircle } from "lucide-react";
import { Button } from "@/components/ui/button"; // Assuming shadcn/ui is set up
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"; // Assuming shadcn/ui is set up
import Navbar from "@/components/layout/Navbar"; // Main site navbar
import Footer from "@/components/layout/Footer"; // Main site footer

const sidebarNavItems = [
  { href: "/dashboard", label: "Visão Geral", icon: Home },
  { href: "/dashboard/avaliacoes", label: "Avaliações", icon: MessageSquare },
  { href: "/dashboard/relatorios", label: "Relatórios", icon: BarChart2 },
  { href: "/dashboard/clientes", label: "Clientes", icon: Users },
  { href: "/dashboard/configuracoes", label: "Configurações", icon: Settings },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-white">
      <Navbar /> {/* Using the main site Navbar */}
      <div className="flex flex-1 pt-20"> {/* pt-20 to offset fixed Navbar height */}
        {/* Sidebar */}
        <aside className="w-64 p-4 bg-gray-800 border-r border-gray-700 hidden md:flex flex-col justify-between">
          <nav>
            <ul className="space-y-2">
              {sidebarNavItems.map((item) => (
                <li key={item.label}>
                  <TooltipProvider delayDuration={100}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Link
                          href={item.href}
                          className="flex items-center space-x-3 p-2 rounded-md text-gray-300 hover:bg-blue-700 hover:text-white transition-colors"
                        >
                          <item.icon size={20} />
                          <span>{item.label}</span>
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent side="right" className="bg-gray-700 text-white border-gray-600">
                        <p>{item.label}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </li>
              ))}
            </ul>
          </nav>
          <div className="mt-auto">
             <TooltipProvider delayDuration={100}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" className="w-full justify-start space-x-3 text-gray-300 hover:bg-blue-700 hover:text-white">
                      <UserCircle size={20} />
                      <span>Minha Conta</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="bg-gray-700 text-white border-gray-600">
                    <p>Gerenciar sua conta</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 p-6 md:p-10 overflow-y-auto">
          {/* Mobile Header (Optional - can be more complex) */}
          <div className="md:hidden flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-teal-300 to-green-300">R.A.I.O Dashboard</h1>
            {/* Mobile menu toggle could go here if sidebar is collapsible */}
          </div>
          {children}
        </main>
      </div>
      {/* Consider if a separate, simpler dashboard footer is needed or if the main one is okay */}
      {/* <Footer /> */}
    </div>
  );
}