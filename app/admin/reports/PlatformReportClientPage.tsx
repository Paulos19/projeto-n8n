'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Bot, FileText, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export function PlatformReportClientPage() {
    const [report, setReport] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleGenerateReport = async () => {
        setIsLoading(true);
        setReport(null);
        const toastId = toast.loading("Coletando dados e gerando relatório com a IA...");

        try {
            const response = await fetch('/api/admin/reports/platform-summary');
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Falha ao gerar o relatório.");
            }
            
            setReport(data.report);
            toast.success("Relatório gerado com sucesso!");

        } catch (error: any) {
            toast.error("Erro ao gerar relatório", { description: error.message });
        } finally {
            setIsLoading(false);
            toast.dismiss(toastId);
        }
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Gerador de Relatório Executivo</CardTitle>
                    <CardDescription>
                        Clique no botão para solicitar à IA uma análise completa sobre o estado atual da plataforma, 
                        incluindo crescimento de usuários, engajamento e pontos de atenção.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Button onClick={handleGenerateReport} disabled={isLoading}>
                        <Sparkles className="mr-2 h-4 w-4" />
                        {isLoading ? "Gerando, por favor aguarde..." : "Gerar Relatório da Plataforma"}
                    </Button>
                </CardContent>
            </Card>

            {isLoading && <LoadingSpinner message="Analisando dados..."/>}

            {report && (
                <Card>
                     <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                           <FileText/> Relatório Gerado
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="prose prose-sm dark:prose-invert max-w-none rounded-md border bg-muted/20 p-6">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>{report}</ReactMarkdown>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
