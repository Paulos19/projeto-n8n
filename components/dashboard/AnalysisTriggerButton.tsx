'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

interface AnalysisTriggerButtonProps {
  // ID do registro a ser atualizado (ex: avaliacao.id ou chatInteraction.id)
  targetId: string | null;
  // ID usado para buscar o histórico no Redis (sempre o JID do cliente)
  chatHistoryId: string | null; 
  analysisType: 'customer_evaluation' | 'dashboard_summary';
  buttonText: string;
  className?: string;
  onAnalysisComplete?: () => void;
}

export function AnalysisTriggerButton({
  targetId,
  chatHistoryId, // <-- Novo parâmetro
  analysisType,
  buttonText,
  className,
  onAnalysisComplete,
}: AnalysisTriggerButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleTriggerAnalysis = async () => {
    if (!targetId || !chatHistoryId) { // <-- Validação atualizada
      toast.error('Não foi possível iniciar a análise.', {
        description: 'Faltam identificadores essenciais (ID do Alvo ou ID do Histórico).',
      });
      return;
    }

    setIsLoading(true);
    const toastId = toast.loading(`Iniciando análise: "${buttonText}"...`);

    try {
      const response = await fetch('/api/trigger-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetId,
          chatHistoryId, // <-- Enviando o novo parâmetro
          analysisType,
        }),
      });

      const result = await response.json();
      toast.dismiss(toastId);

      if (!response.ok) {
        throw new Error(result.message || 'Falha ao se comunicar com o servidor.');
      }
      
      toast.success('Análise concluída!', {
        description: "Os dados foram atualizados. A página será recarregada.",
        duration: 4000,
        onAutoClose: () => {
          if (onAnalysisComplete) {
            onAnalysisComplete();
          } else {
            router.refresh(); 
          }
        },
      });

    } catch (error) {
      toast.dismiss(toastId);
      const errorMessage = error instanceof Error ? error.message : 'Um erro desconhecido ocorreu.';
      toast.error('Falha ao concluir a análise.', { description: errorMessage });
      console.error("Erro ao disparar análise:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleTriggerAnalysis}
      disabled={isLoading || !targetId || !chatHistoryId}
      className={cn("gap-2", className)}
    >
      {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
      {isLoading ? 'Analisando...' : buttonText}
    </Button>
  );
}