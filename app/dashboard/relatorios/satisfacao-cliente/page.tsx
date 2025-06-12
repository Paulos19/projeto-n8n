'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { toast } from 'sonner';
import { Loader2, Calendar as CalendarIcon, TrendingUp, Smile, Meh, Frown, MessageSquare, Star, PieChart } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format, subDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { DateRange } from 'react-day-picker';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from "recharts";

// Interfaces para nossos dados
interface Metrics {
  totalAvaliacoes: number;
  mediaGeral: string;
  npsScore: number;
  distribuicao: { nota: number; contagem: number }[];
  npsCounts: { promotores: number; neutros: number; detratores: number };
}

interface ReportData {
  metrics: Metrics | null;
  summary: string;
}

export default function SatisfactionReportPage() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 29),
    to: new Date(),
  });
  const [report, setReport] = useState<ReportData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerateReport = async () => {
    if (!dateRange?.from || !dateRange?.to) {
      toast.error('Por favor, selecione um período para gerar o relatório.');
      return;
    }

    setIsLoading(true);
    setReport(null);
    const toastId = toast.loading('Gerando relatório de satisfação...');

    try {
      const response = await fetch('/api/reports/satisfaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          startDate: dateRange.from.toISOString(),
          endDate: dateRange.to.toISOString()
        }),
      });

      toast.dismiss(toastId);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Falha ao gerar o relatório.');
      }

      setReport(data);
      if(data.metrics) {
        toast.success('Relatório gerado com sucesso!');
      } else {
        toast.info('Nenhuma avaliação encontrada', { description: data.summary });
      }

    } catch (error) {
      toast.dismiss(toastId);
      const errorMessage = error instanceof Error ? error.message : 'Ocorreu um erro desconhecido.';
      toast.error('Erro ao gerar relatório', { description: errorMessage });
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const gradientText = "bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-teal-300 to-green-300";

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className={`text-3xl font-bold ${gradientText}`}>Relatório de Satisfação do Cliente</h1>
          <p className="text-muted-foreground">Analise o NPS e a distribuição de notas em um período.</p>
        </div>
        <div className="flex items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="date"
                  variant={"outline"}
                  className={cn("w-[300px] justify-start text-left font-normal", !dateRange && "text-muted-foreground")}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange?.from ? (
                    dateRange.to ? ( <> {format(dateRange.from, "LLL dd, y", { locale: ptBR })} -{" "} {format(dateRange.to, "LLL dd, y", { locale: ptBR })} </>
                    ) : ( format(dateRange.from, "LLL dd, y", { locale: ptBR }) )
                  ) : ( <span>Escolha um período</span> )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={dateRange?.from}
                  selected={dateRange}
                  onSelect={setDateRange}
                  numberOfMonths={2}
                  locale={ptBR}
                />
              </PopoverContent>
            </Popover>
          <Button onClick={handleGenerateReport} disabled={isLoading || !dateRange}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <TrendingUp className="mr-2 h-4 w-4" />}
            Analisar Período
          </Button>
        </div>
      </div>

      {isLoading && <LoadingSpinner message="A IA está analisando os dados de satisfação, por favor aguarde..." />}
      
      {report && report.metrics ? (
        <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Total de Avaliações</CardTitle><MessageSquare className="h-4 w-4 text-muted-foreground"/></CardHeader><CardContent><div className="text-2xl font-bold">{report.metrics.totalAvaliacoes}</div></CardContent></Card>
                <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Média Geral</CardTitle><Star className="h-4 w-4 text-muted-foreground"/></CardHeader><CardContent><div className="text-2xl font-bold">{report.metrics.mediaGeral}/10</div></CardContent></Card>
                <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">NPS Score</CardTitle><TrendingUp className="h-4 w-4 text-muted-foreground"/></CardHeader><CardContent><div className="text-2xl font-bold">{report.metrics.npsScore}</div></CardContent></Card>
                <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Promotores (9-10)</CardTitle><Smile className="h-4 w-4 text-green-500"/></CardHeader><CardContent><div className="text-2xl font-bold">{report.metrics.npsCounts.promotores}</div></CardContent></Card>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Análise da IA</CardTitle>
                        <CardDescription>Resumo executivo gerado com base nos dados do período.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="prose prose-sm sm:prose-base prose-invert max-w-none p-4 bg-gray-900/50 rounded-md">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>{report.summary}</ReactMarkdown>
                        </div>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle>Distribuição das Notas</CardTitle>
                        <CardDescription>Contagem de cada nota recebida no período.</CardDescription>
                    </CardHeader>
                    <CardContent>
                         <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={report.metrics.distribuicao}>
                                <XAxis dataKey="nota" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value: any) => `${value}`} />
                                <Tooltip cursor={{fill: 'rgba(128, 128, 128, 0.2)'}} contentStyle={{backgroundColor: '#333', border: 'none'}}/>
                                <Bar dataKey="contagem" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Avaliações"/>
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
        </>
      ) : (
        !isLoading && (
            <div className="text-center py-16 border-2 border-dashed border-gray-700 rounded-lg">
                <PieChart className="mx-auto h-12 w-12 text-gray-600" />
                <h3 className="mt-2 text-xl font-semibold text-gray-400">Nenhum relatório gerado</h3>
                <p className="mt-1 text-base text-gray-500">Selecione um período e clique em "Analisar" para começar.</p>
            </div>
        )
      )}
    </div>
  );
}