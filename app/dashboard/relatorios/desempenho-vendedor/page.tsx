'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { toast } from 'sonner';
import { Loader2, Calendar as CalendarIcon, Users, Lightbulb } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format, subDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { DateRange } from 'react-day-picker';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from "recharts";

interface SellerPerformance {
  id: string;
  name: string;
  totalAvaliacoes: number;
  mediaGeral: string;
}

interface ReportData {
  performanceData: SellerPerformance[] | null;
  summary: string;
}

export default function SellerPerformancePage() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 29),
    to: new Date(),
  });
  const [report, setReport] = useState<ReportData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerateReport = async () => {
    if (!dateRange?.from || !dateRange?.to) {
      toast.error('Por favor, selecione um período.');
      return;
    }

    setIsLoading(true);
    setReport(null);
    const toastId = toast.loading('Analisando desempenho dos vendedores...');

    try {
      const response = await fetch('/api/reports/seller-performance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          startDate: dateRange.from.toISOString(),
          endDate: dateRange.to.toISOString()
        }),
      });

      toast.dismiss(toastId);
      const data = await response.json();

      if (!response.ok) throw new Error(data.error || 'Falha ao gerar relatório.');
      setReport(data);
      if(data.performanceData && data.performanceData.length > 0) toast.success('Relatório de desempenho gerado!');
      else toast.info('Nenhum dado encontrado', { description: data.summary });
    } catch (error) {
      toast.dismiss(toastId);
      toast.error('Erro ao gerar relatório', { description: (error as Error).message });
    } finally {
      setIsLoading(false);
    }
  };
  
  const gradientText = "bg-clip-text text-transparent bg-gradient-to-r from-teal-400 via-cyan-400 to-sky-400";

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className={`text-3xl font-bold ${gradientText}`}>Desempenho por Vendedor</h1>
          <p className="text-muted-foreground">Compare métricas de satisfação entre os membros da sua equipe.</p>
        </div>
        <div className="flex items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button id="date" variant={"outline"} className={cn("w-[300px] justify-start text-left font-normal", !dateRange && "text-muted-foreground")}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange?.from ? ( dateRange.to ? ( <> {format(dateRange.from, "LLL dd, y", { locale: ptBR })} - {format(dateRange.to, "LLL dd, y", { locale: ptBR })} </> ) : ( format(dateRange.from, "LLL dd, y", { locale: ptBR }) ) ) : ( <span>Escolha um período</span> )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar initialFocus mode="range" defaultMonth={dateRange?.from} selected={dateRange} onSelect={setDateRange} numberOfMonths={2} locale={ptBR} />
              </PopoverContent>
            </Popover>
          <Button onClick={handleGenerateReport} disabled={isLoading || !dateRange}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Users className="mr-2 h-4 w-4" />}
            Analisar Vendedores
          </Button>
        </div>
      </div>

      {isLoading && <LoadingSpinner message="A IA está compilando os dados de desempenho, por favor aguarde..." />}
      
      {report && report.performanceData && report.performanceData.length > 0 ? (
        <>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Lightbulb className="text-yellow-400"/> Análise Comparativa da IA</CardTitle>
                    <CardDescription>Resumo dos destaques e oportunidades para a equipe.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="prose prose-sm sm:prose-base prose-invert max-w-none p-4 bg-gray-900/50 rounded-md">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{report.summary}</ReactMarkdown>
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Gráfico de Desempenho</CardTitle>
                    <CardDescription>Nota média por vendedor no período selecionado.</CardDescription>
                </CardHeader>
                <CardContent>
                     <ResponsiveContainer width="100%" height={350}>
                        <BarChart data={report.performanceData.map(d => ({...d, mediaGeral: parseFloat(d.mediaGeral) || 0 }))}>
                            <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                            <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} interval={0}/>
                            <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} domain={[0, 10]} />
                            <Tooltip cursor={{fill: 'rgba(128, 128, 128, 0.2)'}} contentStyle={{backgroundColor: '#333', border: 'none'}}/>
                            <Legend wrapperStyle={{fontSize: "14px"}}/>
                            <Bar dataKey="mediaGeral" fill="#22c55e" radius={[4, 4, 0, 0]} name="Nota Média"/>
                            <Bar dataKey="totalAvaliacoes" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Total de Avaliações"/>
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </>
      ) : (
        !isLoading && (
            <div className="text-center py-16 border-2 border-dashed border-gray-700 rounded-lg">
                <Users className="mx-auto h-12 w-12 text-gray-600" />
                <h3 className="mt-2 text-xl font-semibold text-gray-400">Nenhum relatório gerado</h3>
                <p className="mt-1 text-base text-gray-500">Selecione um período e clique em "Analisar" para ver o desempenho dos vendedores.</p>
            </div>
        )
      )}
    </div>
  );
}