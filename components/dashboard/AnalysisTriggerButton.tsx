// components/dashboard/AnalysisTriggerButton.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles, Loader2, BrainCircuit } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

// Define as propriedades que o nosso botão vai aceitar
interface AnalysisTriggerButtonProps {
  customerJid: string | null;
  analysisType: 'customer_evaluation' | 'dashboard_summary';
  interactionId: string;
  buttonText: string;
  className?: string;
}

/**
 * Um botão reutilizável que chama a API /api/trigger-analysis
 * para iniciar um workflow de análise da IA no n8n.
 * Ele gerencia o estado de carregamento e exibe notificações para o usuário.
 */
export function AnalysisTriggerButton({
  customerJid,
  analysisType,
  interactionId,
  buttonText,
  className,
}: AnalysisTriggerButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  // Função para lidar com o clique do botão
  const handleTriggerAnalysis = async () => {
    if (!customerJid) {
      toast.error('Não foi possível iniciar a análise.', {
        description: 'O JID do cliente não foi encontrado nesta interação.',
      });
      return;
    }

    setIsLoading(true);
    toast.loading(`Iniciando análise de "${buttonText}"...`, {
      description: 'Isso pode levar alguns instantes.',
    });

    try {
      // Faz a chamada para a nossa nova API
      const response = await fetch('/api/trigger-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerJid,
          analysisType,
          interactionId,
        }),
      });

      const result = await response.json();
      toast.dismiss(); // Remove o toast de "carregando"

      if (!response.ok) {
        throw new Error(result.message || 'Falha ao se comunicar com o servidor.');
      }
      
      toast.success('Análise iniciada!', {
        description: result.message,
      });

    } catch (error) {
      toast.dismiss(); // Remove o toast de "carregando"
      const errorMessage = error instanceof Error ? error.message : 'Um erro desconhecido ocorreu.';
      toast.error('Falha ao iniciar a análise.', {
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
      disabled={isLoading || !customerJid}
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
