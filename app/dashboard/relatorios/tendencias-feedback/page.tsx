'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { toast } from 'sonner';
import { Loader2, Calendar as CalendarIcon, TrendingUp, ThumbsUp, ThumbsDown, Lightbulb } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format, subDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { DateRange } from 'react-day-picker';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from "recharts";
import { Badge } from '@/components/ui/badge';

interface Trend {
  text: string;
  count: number;
}

interface TrendData {
  topStrengths: Trend[];
  topWeaknesses: Trend[];
}

interface ReportData {
  trends: TrendData | null;
  summary: string;
}

export default function FeedbackTrendsPage() {
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
    const toastId = toast.loading('Analisando tendências de feedback...');

    try {
      const response = await fetch('/api/reports/feedback-trends', {
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
      if(data.trends) toast.success('Relatório de tendências gerado!');
      else toast.info('Nenhum dado encontrado', { description: data.summary });
    } catch (error) {
      toast.dismiss(toastId);
      toast.error('Erro ao gerar relatório', { description: (error as Error).message });
    } finally {
      setIsLoading(false);
    }
  };
  
  const gradientText = "bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 via-cyan-400 to-sky-400";

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className={`text-3xl font-bold ${gradientText}`}>Tendências de Feedback</h1>
          <p className="text-muted-foreground">Identifique os temas mais comuns nos comentários dos clientes.</p>
        </div>
        <div className="flex items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button id="date" variant="outline" className={cn("w-[300px] justify-start text-left font-normal", !dateRange && "text-muted-foreground")}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange?.from ? ( dateRange.to ? ( <> {format(dateRange.from, "LLL dd, y", { locale: ptBR })} - {format(dateRange.to, "LLL dd, y", { locale: ptBR })} </> ) : ( format(dateRange.from, "LLL dd, y", { locale: ptBR }) ) ) : ( <span>Escolha um período</span> )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar initialFocus mode="range" defaultMonth={dateRange?.from} selected={dateRange} onSelect={setDateRange} numberOfMonths={2} locale={ptBR} />
              </PopoverContent>
            </Popover>
          <Button onClick={handleGenerateReport} disabled={isLoading || !dateRange}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <TrendingUp className="mr-2 h-4 w-4" />}
            Analisar Tendências
          </Button>
        </div>
      </div>

      {isLoading && <LoadingSpinner message="A IA está processando os feedbacks, isso pode levar um momento..." />}
      
      {report && report.trends ? (
        <>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Lightbulb className="text-yellow-400"/> Análise da IA</CardTitle>
                    <CardDescription>Resumo dos principais temas e recomendações gerado por IA.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="prose prose-sm sm:prose-base prose-invert max-w-none p-4 bg-gray-900/50 rounded-md">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{report.summary}</ReactMarkdown>
                    </div>
                </CardContent>
            </Card>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><ThumbsUp className="text-green-500" /> Principais Pontos Fortes</CardTitle>
                        <CardDescription>Os elogios mais frequentes dos seus clientes.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-2">
                            {report.trends.topStrengths.map(item => (
                                <li key={item.text} className="flex justify-between items-center text-sm p-2 bg-gray-800/50 rounded-md">
                                    <span>{item.text}</span>
                                    <Badge variant="secondary">{item.count}x</Badge>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><ThumbsDown className="text-red-500" /> Principais Pontos a Melhorar</CardTitle>
                        <CardDescription>As queixas e sugestões mais comuns.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-2">
                            {report.trends.topWeaknesses.map(item => (
                                <li key={item.text} className="flex justify-between items-center text-sm p-2 bg-gray-800/50 rounded-md">
                                    <span>{item.text}</span>
                                    <Badge variant="destructive">{item.count}x</Badge>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
            </div>
        </>
      ) : (
        !isLoading && (
            <div className="text-center py-16 border-2 border-dashed border-gray-700 rounded-lg">
                <TrendingUp className="mx-auto h-12 w-12 text-gray-600" />
                <h3 className="mt-2 text-xl font-semibold text-gray-400">Nenhum relatório gerado</h3>
                <p className="mt-1 text-base text-gray-500">Selecione um período e clique em "Analisar" para ver as tendências.</p>
            </div>
        )
      )}
    </div>
  );
}