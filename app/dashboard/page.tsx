import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Activity, ArrowUpRight, Users, MessageSquareText, BarChart2, Settings } from "lucide-react";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { Avaliacao } from "@prisma/client";


export default async function DashboardPage() {
  const gradientText = "bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-teal-300 to-green-300";

  // Lógica para buscar dados do Prisma
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

  const totalAvaliacoes = await prisma.avaliacao.count();

  const avaliacoesUltimoMes = await prisma.avaliacao.findMany({
    where: { createdAt: { gte: oneMonthAgo } },
    select: { remoteJid: true },
  });

  const novosClientesMesSet = new Set<string>();
  avaliacoesUltimoMes.forEach(av => {
    if (av.remoteJid) {
      novosClientesMesSet.add(av.remoteJid);
    }
  });
  const novosClientesMes = novosClientesMesSet.size;

  const satisfacaoMediaData = await prisma.avaliacao.aggregate({
    _avg: { nota_cliente: true },
  });
  const satisfacaoMedia = satisfacaoMediaData._avg.nota_cliente !== null
    ? satisfacaoMediaData._avg.nota_cliente.toFixed(1) + "/10"
    : "N/A";

  const numAvaliacoesEsteMes = await prisma.avaliacao.count({
    where: { createdAt: { gte: oneMonthAgo } },
  });

  // Dados para os cards de estatísticas
  const stats = [
    { title: "Total de Avaliações", value: totalAvaliacoes.toString(), icon: MessageSquareText },
    { title: "Novos Clientes (Mês)", value: novosClientesMes.toString(), icon: Users },
    { title: "Satisfação Média", value: satisfacaoMedia, icon: Activity },
    { title: "Avaliações este Mês", value: numAvaliacoesEsteMes.toString(), icon: ArrowUpRight },
  ];

  // Dados para atividades recentes
  const recentAvaliacoesData = await prisma.avaliacao.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5,
    select: { id: true, remoteJid: true, createdAt: true },
  });

  const recentActivities = recentAvaliacoesData.map(avaliacao => ({
    id: avaliacao.id,
    description: `Nova avaliação ${avaliacao.remoteJid ? `de ${avaliacao.remoteJid.split('@')[0]}` : `(ID: ${avaliacao.id.substring(0, 8)})`}`,
    time: new Date(avaliacao.createdAt).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
    type: "avaliacao", // Usado para estilizar o ponto colorido
  }));

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
        <div>
          <h1 className={`text-3xl font-bold ${gradientText}`}>Visão Geral do Dashboard</h1>
          <p className="text-muted-foreground">Bem-vindo de volta! Aqui está um resumo da sua atividade.</p>
        </div>
        <Button asChild className="bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 text-white font-semibold shadow-md transition-all duration-300 ease-in-out transform hover:scale-105">
          <Link href="/dashboard/avaliacoes/nova">Nova Avaliação</Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
              <stat.icon className="h-5 w-5 text-blue-500 dark:text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity & Quick Actions */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className={`text-xl ${gradientText}`}>Atividade Recente</CardTitle>
            <CardDescription className="text-muted-foreground">Últimas avaliações recebidas.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-1">
            {recentActivities.map((activity) => (
              <Link key={activity.id} href={`/dashboard/avaliacao/${activity.id}`} passHref>
                <div className="block p-3 rounded-md hover:bg-muted/50 dark:hover:bg-muted/30 transition-colors">
                  <div className="flex items-start space-x-3">
                    <div className={`mt-1 flex-shrink-0 h-3 w-3 rounded-full ${activity.type === 'alerta' ? 'bg-red-500' : 'bg-blue-500'}`}></div>
                    <div>
                      <p className="text-sm text-foreground">{activity.description}</p>
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
            {recentActivities.length === 0 && (
              <p className="text-sm text-muted-foreground">Nenhuma atividade recente.</p>
            )}
            <Button asChild variant="outline" className="w-full mt-4 border-primary text-primary hover:bg-primary/10">
              <Link href="/dashboard/avaliacoes">
                <span>Ver todas as atividades</span>
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className={`text-xl ${gradientText}`}>Ações Rápidas</CardTitle>
            <CardDescription className="text-muted-foreground">Acessos diretos às funcionalidades.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Button asChild variant="default" className="w-full bg-blue-600 hover:bg-blue-700 text-white justify-start space-x-2">
              <Link href="/dashboard/avaliacoes">
                <>
                  <MessageSquareText size={18}/> <span>Ver Avaliações</span>
                </>
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full border-teal-500 text-teal-500 hover:text-teal-400 hover:bg-teal-500/10 justify-start space-x-2">
              <Link href="/dashboard/clientes">
                <>
                  <Users size={18}/> <span>Gerenciar Clientes</span>
                </>
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full border-indigo-500 text-indigo-500 hover:text-indigo-400 hover:bg-indigo-500/10 justify-start space-x-2">
              <Link href="/dashboard/relatorios">
                <>
                  <BarChart2 size={18}/> <span>Gerar Relatório</span>
                </>
              </Link>
            </Button>
             <Button asChild variant="outline" className="w-full border-muted-foreground text-muted-foreground hover:bg-muted/30 justify-start space-x-2">
              <Link href="/dashboard/configuracoes">
                <>
                  <Settings size={18}/> <span>Configurações</span>
                </>
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}