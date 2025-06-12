// app/dashboard/relatorios/diario/page.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { toast } from 'sonner';
import { Loader2, Download, Calendar as CalendarIcon, FileText } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import jsPDF from 'jspdf';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function DailyReportPage() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [report, setReport] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerateReport = async () => {
    if (!date) {
      toast.error('Por favor, selecione uma data para gerar o relatório.');
      return;
    }

    setIsLoading(true);
    setReport(null);
    const toastId = toast.loading('Gerando relatório com a IA...');

    try {
      const response = await fetch('/api/reports/daily-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: date.toISOString() }),
      });

      toast.dismiss(toastId);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Falha ao gerar o relatório.');
      }

      setReport(data.report);
      toast.success('Relatório gerado com sucesso!');

    } catch (error) {
      toast.dismiss(toastId);
      const errorMessage = error instanceof Error ? error.message : 'Ocorreu um erro desconhecido.';
      toast.error('Erro ao gerar relatório', { description: errorMessage });
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleExportPDF = () => {
    if (!report) {
      toast.error("Nenhum relatório para exportar.");
      return;
    }

    const doc = new jsPDF({
      orientation: 'p',
      unit: 'mm',
      format: 'a4'
    });

    const formattedDate = date ? format(date, 'dd/MM/yyyy') : 'data não selecionada';
    let y = 22; // Posição Y inicial
    const pageHeight = doc.internal.pageSize.height;
    const margin = 14;
    const listIndent = 5;
    const contentWidth = 180;

    // Função auxiliar para adicionar nova página se o conteúdo não couber
    const addPageIfNeeded = (spaceNeeded: number) => {
      if (y + spaceNeeded > pageHeight - margin) {
        doc.addPage();
        y = margin;
      }
    };

    // Título do Documento
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(`Relatório Diário R.A.I.O - ${formattedDate}`, margin, y);
    y += 15;

    // Processa o relatório linha por linha
    const lines = report.split('\n');

    lines.forEach(line => {
      line = line.trim();
      
      // Títulos (## e ###)
      if (line.startsWith('## ')) {
        addPageIfNeeded(12);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text(line.replace('## ', ''), margin, y);
        y += 10;
      } else if (line.startsWith('###')) {
        addPageIfNeeded(10);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        const cleanLine = line.replace(/### \*\*|\*\*$/g, '').trim();
        doc.text(cleanLine, margin, y);
        y += 8;
      } 
      // Itens de lista (ex: * **Volume:** 2 interações)
      else if (line.startsWith('*')) {
        addPageIfNeeded(7);
        doc.setFontSize(11);
        let cleanLine = line.substring(1).trim().replace(/\*\*/g, ''); // Remove '*' e '**'
        
        // Separa o rótulo do valor no primeiro ':'
        const parts = cleanLine.split(':');
        const label = `${parts[0]}:`;
        const value = parts.slice(1).join(':').trim();

        // Renderiza o rótulo em negrito
        doc.setFont('helvetica', 'bold');
        doc.text(label, margin + listIndent, y);

        // Calcula a largura do rótulo para posicionar o valor ao lado
        const labelWidth = doc.getStringUnitWidth(label) * (doc.getFontSize() / doc.internal.scaleFactor);
        const valueXPosition = margin + listIndent + labelWidth + 2; // Adiciona um espaço

        // Renderiza o valor com quebra de linha automática
        doc.setFont('helvetica', 'normal');
        const valueLines = doc.splitTextToSize(value, contentWidth - valueXPosition + margin);
        doc.text(valueLines, valueXPosition, y);
        
        // Incrementa a posição Y com base na altura das linhas do valor
        y += (valueLines.length * 5) + 2;
      }
      // Parágrafos normais
      else if (line.length > 0) {
        addPageIfNeeded(7);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        const textLines = doc.splitTextToSize(line, contentWidth);
        doc.text(textLines, margin, y);
        y += (textLines.length * 5) + 3;
      } 
      // Linhas em branco
      else {
        y += 4;
      }
    });

    doc.save(`relatorio_raio_${formattedDate.replace(/\//g, '-')}.pdf`);
  };

  const gradientText = "bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-teal-300 to-green-300";

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className={`text-3xl font-bold ${gradientText}`}>Relatório Diário de Desempenho</h1>
          <p className="text-muted-foreground">Analise o desempenho da sua equipe em um dia específico.</p>
        </div>
        <div className="flex items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn("w-[280px] justify-start text-left font-normal", !date && "text-muted-foreground")}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP", { locale: ptBR }) : <span>Escolha uma data</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                  locale={ptBR}
                  disabled={(d: Date) => d > new Date() || d < new Date("2024-01-01")}
                />
              </PopoverContent>
            </Popover>
          <Button onClick={handleGenerateReport} disabled={isLoading || !date}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileText className="mr-2 h-4 w-4" />}
            Gerar Relatório
          </Button>
        </div>
      </div>

      {isLoading && <LoadingSpinner message="A IA está analisando as conversas do dia, por favor aguarde..." />}

      {report && (
        <Card className="bg-gray-800/50 border-gray-700/80">
          <CardHeader className="flex flex-row justify-between items-center">
            <div>
              <CardTitle className="text-2xl text-white">Resultado da Análise</CardTitle>
              <CardDescription className="text-gray-400">Gerado para {date ? format(date, "dd/MM/yyyy") : ''}</CardDescription>
            </div>
            <Button onClick={handleExportPDF} variant="outline">
              <Download className="mr-2 h-4 w-4"/>
              Exportar para PDF
            </Button>
          </CardHeader>
          <CardContent>
            <div id="report-content-for-pdf" className="prose prose-sm sm:prose-base prose-invert max-w-none p-4 bg-gray-900/50 rounded-md">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {report}
              </ReactMarkdown>
            </div>
          </CardContent>
        </Card>
      )}

      {!report && !isLoading && (
         <div className="text-center py-16 border-2 border-dashed border-gray-700 rounded-lg">
            <FileText className="mx-auto h-12 w-12 text-gray-600" />
            <h3 className="mt-2 text-xl font-semibold text-gray-400">Nenhum relatório gerado</h3>
            <p className="mt-1 text-base text-gray-500">Selecione uma data e clique em "Gerar Relatório" para começar.</p>
        </div>
      )}
    </div>
  );
}
