import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChartBig, PieChart, TrendingUp, Download, Filter } from "lucide-react";
import Link from "next/link";


const reportTypes = [
  {
    title: "Relatório de Satisfação do Cliente",
    description: "Analise a satisfação geral e por nota dos seus clientes.",
    icon: PieChart,
    actionText: "Gerar Relatório",
    href: "/dashboard/relatorios/satisfacao-cliente", 
    tags: ["Satisfação", "NPS", "Feedback"],
  },
  {
    title: "Tendências de Feedback",
    description: "Identifique padrões e tendências nos pontos fortes e fracos mencionados.",
    icon: TrendingUp,
    actionText: "Ver Tendências",
    href: "/dashboard/relatorios/tendencias-feedback",
    tags: ["Análise Qualitativa", "Insights", "Melhorias"],
  },
  {
    title: "Desempenho por Tags",
    description: "Visualize o desempenho e o volume de feedback por tags específicas.",
    icon: BarChartBig,
    actionText: "Analisar Tags",
    href: "/dashboard/relatorios/desempenho-tags",
    tags: ["Categorização", "Segmentação", "Produto"],
  },
  {
    title: "Relatório de Tempo de Resposta",
    description: "Monitore a eficiência da sua equipe no tempo de resposta às avaliações.",
    icon: Filter, 
    actionText: "Ver Detalhes",
    href: "/dashboard/relatorios/tempo-resposta",
    tags: ["Eficiência", "SLA", "Atendimento"],
  },
];

export default function RelatoriosPage() {
  const gradientText = "bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-teal-300 to-green-300";

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
        <div>
          <h1 className={`text-3xl font-bold ${gradientText}`}>Central de Relatórios</h1>
          <p className="text-gray-400">Gere e visualize relatórios detalhados sobre suas avaliações.</p>
        </div>
        <Button className="bg-gradient-to-r from-green-500 to-cyan-500 hover:from-green-600 hover:to-cyan-600 text-white font-semibold shadow-md">
          <Download className="mr-2 h-5 w-5" /> Exportar Todos os Dados
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
        {reportTypes.map((report) => (
          <Card key={report.title} className="bg-gray-800 border-gray-700 text-white flex flex-col">
            <CardHeader>
              <div className="flex items-center space-x-3 mb-2">
                <report.icon className="h-8 w-8 text-blue-400" />
                <CardTitle className={`text-xl ${gradientText}`}>{report.title}</CardTitle>
              </div>
              <CardDescription className="text-gray-400 h-16">{report.description}</CardDescription> {}
            </CardHeader>
            <CardContent className="flex-grow">
              <div className="flex flex-wrap gap-2 mb-4">
                {report.tags.map(tag => (
                  <span key={tag} className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded-full">{tag}</span>
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

      {}
      <Card className="bg-gray-800 border-gray-700 text-white">
        <CardHeader>
          <CardTitle className={`text-lg ${gradientText}`}>Filtros Avançados</CardTitle>
          <CardDescription className="text-gray-400">
            Refine seus relatórios com filtros de período, tags ou outros critérios. (Funcionalidade futura)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">Em breve: Opções de filtragem detalhada aqui.</p>
        </CardContent>
      </Card>
    </div>
  );
}