// components/dashboard/AnalysisTriggerButton.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation'; // Importa o useRouter para refresh

// Define as propriedades que o nosso botão vai aceitar
interface AnalysisTriggerButtonProps {
  // O JID do cliente para análise de conversa, ou o ID da avaliação para análise de nota
  targetId: string | null;
  analysisType: 'customer_evaluation' | 'dashboard_summary';
  buttonText: string;
  className?: string;
  onAnalysisComplete?: () => void; // Callback opcional
}

/**
 * Um botão reutilizável que chama a API /api/trigger-analysis
 * para iniciar um workflow de análise da IA no n8n.
 */
export function AnalysisTriggerButton({
  targetId,
  analysisType,
  buttonText,
  className,
  onAnalysisComplete,
}: AnalysisTriggerButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter(); // Hook para refresh da página

  const handleTriggerAnalysis = async () => {
    if (!targetId) {
      toast.error('Não foi possível iniciar a análise.', {
        description: 'O identificador do alvo (ID da avaliação ou JID do cliente) não foi encontrado.',
      });
      return;
    }

    setIsLoading(true);
    const toastId = toast.loading(`Iniciando análise: "${buttonText}"...`, {
      description: 'A IA está processando os dados. Isso pode levar um momento.',
    });

    try {
      // Faz a chamada para a nossa nova API
      const response = await fetch('/api/trigger-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetId,
          analysisType,
        }),
      });

      const result = await response.json();
      toast.dismiss(toastId);

      if (!response.ok) {
        throw new Error(result.message || 'Falha ao se comunicar com o servidor.');
      }
      
      toast.success('Análise concluída!', {
        description: "Os dados foram atualizados com os insights da IA. A página será atualizada.",
        duration: 5000,
        onAutoClose: () => {
          if (onAnalysisComplete) {
            onAnalysisComplete();
          } else {
            router.refresh(); // Recarrega os dados do servidor para a página atual
          }
        },
      });

    } catch (error) {
      toast.dismiss(toastId);
      const errorMessage = error instanceof Error ? error.message : 'Um erro desconhecido ocorreu.';
      toast.error('Falha ao iniciar ou concluir a análise.', {
        description: errorMessage,
      });
      console.error("Erro ao disparar análise:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleTriggerAnalysis}
      disabled={isLoading || !targetId}
      className={cn("gap-2", className)}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Sparkles className="h-4 w-4" />
      )}
      {isLoading ? 'Analisando...' : buttonText}
    </Button>
  );
}
