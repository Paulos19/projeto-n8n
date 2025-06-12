'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { toast } from 'sonner';
import { Loader2, Calendar as CalendarIcon, Download } from 'lucide-react';
import { DateRange } from 'react-day-picker';
import { format, subDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface ExportReportModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const reportOptions = [
  { value: 'satisfacao', label: 'Relatório de Satisfação' },
  { value: 'desempenho-vendedor', label: 'Relatório de Desempenho por Vendedor' },
];

export function ExportReportModal({ isOpen, onOpenChange }: ExportReportModalProps) {
  const [reportType, setReportType] = useState<string>('');
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 29),
    to: new Date(),
  });
  const [isLoading, setIsLoading] = useState(false);

  const generatePdf = (data: any[], reportName: string, headers: string[][], bodyKeys: string[]) => {
    if (!data || data.length === 0) {
      toast.info("Nenhum dado para exportar", { description: "Não foram encontrados registros para os filtros selecionados." });
      return;
    }

    const doc = new jsPDF({ orientation: 'landscape' }); // <-- PDF na horizontal
    const dateStr = format(new Date(), 'yyyy-MM-dd');
    
    doc.setFontSize(18);
    doc.text(`${reportName}`, 14, 22);
    doc.setFontSize(11);
    doc.text(`Período: ${format(dateRange?.from!, "P", { locale: ptBR })} a ${format(dateRange?.to!, "P", { locale: ptBR })}`, 14, 30);

    const body = data.map(item => bodyKeys.map(key => {
        const value = item[key];
        // Formata arrays com quebra de linha para o PDF
        if (Array.isArray(value)) return value.join('\n'); 
        if (value instanceof Date) return format(value, 'Pp', { locale: ptBR });
        return value !== null && value !== undefined ? value : '';
    }));

    autoTable(doc, {
        head: headers,
        body: body,
        startY: 35,
        theme: 'striped',
        styles: { cellPadding: 2, fontSize: 8 },
        headStyles: { fillColor: [22, 163, 74] },
    });
    
    doc.save(`${reportName.replace(/ /g, '_')}_${dateStr}.pdf`);
    toast.success("Download do PDF iniciado!");
  };

  const handleExport = async () => {
    if (!reportType || !dateRange?.from || !dateRange?.to) {
      toast.error('Por favor, selecione o tipo de relatório e o período.');
      return;
    }
    
    setIsLoading(true);
    const toastId = toast.loading('Gerando dados para exportação...');

    try {
        const response = await fetch('/api/reports/export', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                reportType,
                startDate: dateRange.from.toISOString(),
                endDate: dateRange.to.toISOString()
            })
        });

        toast.dismiss(toastId);
        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || "Falha ao buscar dados para exportação.");
        }

        const selectedReport = reportOptions.find(opt => opt.value === reportType);

        if (reportType === 'satisfacao') {
          generatePdf(
            result.data, 
            selectedReport!.label, 
            [['Data', 'Vendedor', 'Cliente', 'Nota', 'Pontos Fortes', 'Pontos Fracos', 'Sugestões', 'Resumo IA']],
            ['createdAt', 'vendedor', 'cliente', 'nota_cliente', 'pontos_fortes', 'pontos_fracos', 'sugestoes_melhoria', 'resumo_atendimento']
          );
        } else if (reportType === 'desempenho-vendedor') {
          generatePdf(
            result.data,
            selectedReport!.label,
            [['Nome do Vendedor', 'Total de Avaliações', 'Nota Média']],
            ['nome_vendedor', 'total_avaliacoes', 'nota_media']
          );
        }

    } catch (error) {
        toast.dismiss(toastId);
        toast.error("Erro ao exportar", { description: (error as Error).message });
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Exportar Relatório</DialogTitle>
          <DialogDescription>
            Selecione o tipo de relatório e o período desejado para exportar os dados em formato PDF.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="report-type" className="text-right">Relatório</label>
                <Select value={reportType} onValueChange={setReportType}>
                    <SelectTrigger id="report-type" className="col-span-3">
                        <SelectValue placeholder="Selecione um tipo..." />
                    </SelectTrigger>
                    <SelectContent>
                        {reportOptions.map(opt => (
                            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <label className="text-right">Período</label>
                <Popover>
                    <PopoverTrigger asChild>
                        <Button id="date" variant="outline" className={cn("col-span-3 justify-start text-left font-normal", !dateRange && "text-muted-foreground")}>
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateRange?.from ? ( dateRange.to ? ( <> {format(dateRange.from, "LLL dd, y", { locale: ptBR })} - {format(dateRange.to, "LLL dd, y", { locale: ptBR })} </> ) : ( format(dateRange.from, "LLL dd, y", { locale: ptBR }) ) ) : ( <span>Escolha um período</span> )}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                        <Calendar initialFocus mode="range" defaultMonth={dateRange?.from} selected={dateRange} onSelect={setDateRange} numberOfMonths={2} locale={ptBR} />
                    </PopoverContent>
                </Popover>
            </div>
        </div>
        <DialogFooter>
          <Button onClick={handleExport} disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
            Gerar e Exportar PDF
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}