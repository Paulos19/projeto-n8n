'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  BarChartBig, 
  PieChart, 
  TrendingUp, 
  Download, 
  CalendarCheck, 
  Users 
} from "lucide-react";
import Link from "next/link";
import { ExportReportModal } from '@/components/dashboard/ExportReportModal';
import { Badge } from '@/components/ui/badge';

const reportTypes = [
  {
    title: "Relatório Diário de Desempenho",
    description: "Uma análise detalhada gerada por IA sobre as interações e o desempenho dos vendedores em um dia específico.",
    icon: CalendarCheck,
    actionText: "Gerar Relatório Diário",
    href: "/dashboard/relatorios/diario",
    tags: ["IA", "Desempenho", "Diário"],
  },
  {
    title: "Relatório de Satisfação do Cliente",
    description: "Analise a satisfação geral, a distribuição de notas e o NPS dos seus clientes em um período.",
    icon: PieChart,
    actionText: "Analisar Satisfação",
    href: "/dashboard/relatorios/satisfacao-cliente",
    tags: ["Satisfação", "NPS", "Feedback"],
  },
  {
    title: "Tendências de Feedback",
    description: "Identifique padrões e temas recorrentes nos pontos fortes e fracos mencionados pelos clientes.",
    icon: TrendingUp,
    actionText: "Ver Tendências",
    href: "/dashboard/relatorios/tendencias-feedback",
    tags: ["Qualitativo", "Insights", "Melhorias"],
  },
  {
    title: "Desempenho por Vendedor",
    description: "Compare métricas como volume de atendimento, notas médias e tempo de resposta entre vendedores.",
    icon: Users,
    actionText: "Analisar Vendedores",
    href: "/dashboard/relatorios/desempenho-vendedor",
    tags: ["Equipe", "Performance", "Comparativo"],
  },
];

export default function RelatoriosPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const gradientText = "bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-teal-300 to-green-300";

  return (
    <>
      <ExportReportModal isOpen={isModalOpen} onOpenChange={setIsModalOpen} />
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
          <div>
            <h1 className={`text-3xl font-bold ${gradientText}`}>Central de Relatórios</h1>
            <p className="text-gray-400">Gere e visualize relatórios detalhados para obter insights sobre sua operação.</p>
          </div>
          <Button 
            onClick={() => setIsModalOpen(true)}
            className="bg-gradient-to-r from-green-500 to-cyan-500 hover:from-green-600 hover:to-cyan-600 text-white font-semibold shadow-md"
          >
            <Download className="mr-2 h-5 w-5" /> Exportar Dados
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
          {reportTypes.map((report) => (
            <Card 
              key={report.title} 
              className="bg-gray-800 border-gray-700 text-white flex flex-col hover:border-blue-500/50 hover:shadow-xl hover:shadow-blue-900/20 transition-all duration-300 ease-in-out"
            >
              <CardHeader>
                <div className="flex items-center space-x-4 mb-2">
                  <div className="bg-blue-900/50 p-3 rounded-full border border-blue-800">
                      <report.icon className="h-8 w-8 text-blue-400" />
                  </div>
                  <CardTitle className={`text-xl ${gradientText}`}>{report.title}</CardTitle>
                </div>
                <CardDescription className="text-gray-400 h-16">{report.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <div className="flex flex-wrap gap-2 mb-4">
                  {report.tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="bg-gray-700 text-gray-300 border-gray-600">{tag}</Badge>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Button asChild variant="outline" className="w-full border-blue-500 text-blue-400 hover:bg-blue-700 hover:text-white">
                  <Link href={report.href}>
                    {report.actionText}
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </>
  );
}