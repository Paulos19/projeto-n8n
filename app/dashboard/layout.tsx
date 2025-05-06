 // Será atualizado abaixo
import Sidebar from "@/components/layout/Sidebar";
import { Toaster } from "sonner";

// Definição das cores para uso no componente
const corDestaque = "#84C1FA";
const corTexto = "#091C53";
const corBackgroundDashboard = "#FFFFFF"; // Usar branco puro para a área de conteúdo do dashboard para melhor leitura
const corBackgroundLayout = "#E8EEFC"; // Cor de fundo geral do layout, se diferente da área de conteúdo

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`flex h-screen bg-[${corBackgroundLayout}] text-[${corTexto}]`}>
      <Sidebar /> {/* Sidebar será atualizada para a nova paleta */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header do Dashboard (se você tiver um separado da Navbar principal) */}
        {/* Exemplo:
        <header className={`bg-[${corBackgroundDashboard}] shadow p-4`}>
          <h1 className={`text-xl font-semibold text-[${corTexto}]`}>Dashboard Header</h1>
        </header>
        */}
        <main className={`flex-1 overflow-x-hidden overflow-y-auto bg-[${corBackgroundDashboard}] p-6`}>
          {children}
        </main>
      </div>
      <Toaster />
    </div>
  );
}