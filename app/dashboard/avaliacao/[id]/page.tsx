// app/dashboard/avaliacao/[id]/page.tsx
'use client'; // Necessário para usar hooks e eventos

import { useState, useEffect } from 'react';
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MessageSquare, Star, ThumbsUp, ThumbsDown, User, CalendarDays, Activity } from "lucide-react";
import { Avaliacao } from "@prisma/client";
import { AnalysisTriggerButton } from '@/components/dashboard/AnalysisTriggerButton'; // Importe o novo componente
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface AvaliacaoData extends Avaliacao {}

export default function AvaliacaoDetalhePage({ params }: { params: { id: string } }) {
  const [avaliacao, setAvaliacao] = useState<AvaliacaoData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch(`/api/avaliacao-proxy/${params.id}`);
        if (!response.ok) {
          throw new Error('Falha ao buscar dados da avaliação');
        }
        const data = await response.json();
        setAvaliacao(data);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [params.id]);

  const gradientText = "bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-teal-300 to-green-300";

  if (isLoading) {
    return <LoadingSpinner message="Carregando avaliação..." />;
  }
  
  if (!avaliacao) {
    return notFound();
  }

  const getNotaBadgeVariant = (nota: number | null): "default" | "secondary" | "destructive" | "outline" | null => {
    if (nota === null) return "secondary";
    if (nota <= 2) return "destructive";
    if (nota <= 3) return "secondary"; 
    return "default"; 
  };
  
  const renderField = (
    label: string,
    value: string | number | string[] | null | Date,
    Icon?: React.ElementType,
    isBadgeList?: boolean, 
    badgeVariant?: "default" | "secondary" | "destructive" | "outline" | null
  ) => {
    if (!value || (Array.isArray(value) && value.length === 0)) return null;

    let displayValue: React.ReactNode;
    if (value instanceof Date) {
      displayValue = value.toLocaleDateString('pt-BR', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    } else if (isBadgeList && Array.isArray(value)) {
      displayValue = (
        <div className="flex flex-wrap gap-2">
          {value.map((item, index) => (
            <Badge key={index} variant={badgeVariant || "secondary"} className="text-sm">{String(item)}</Badge>
          ))}
        </div>
      );
    } else {
      displayValue = badgeVariant ? <Badge variant={badgeVariant} className="text-sm">{String(value)}</Badge> : String(value);
    }

    return (
      <div className="flex items-start space-x-3 py-3 border-b border-gray-700 last:border-b-0">
        {Icon && <Icon className="h-5 w-5 mt-1 text-blue-400 flex-shrink-0" />}
        <div className="flex-grow">
          <p className="text-sm font-medium text-gray-400">{label}</p>
          <div className="text-gray-200 mt-1">{displayValue}</div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <Button asChild variant="outline" className="border-blue-500 text-blue-400 hover:bg-blue-700 hover:text-white">
        <Link href="/dashboard/avaliacoes">
          <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para Avaliações
        </Link>
      </Button>

      <Card className="bg-gray-800 border-gray-700 text-white shadow-xl">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div>
              <CardTitle className={`text-2xl font-bold ${gradientText}`}>
                Detalhes da Avaliação
              </CardTitle>
              <CardDescription className="text-gray-400 mt-1">ID: {avaliacao.id}</CardDescription>
            </div>
             {/* Botão para gerar avaliação de desempenho */}
            <AnalysisTriggerButton
              customerJid={avaliacao.remoteJid}
              analysisType="customer_evaluation"
              interactionId={avaliacao.id}
              buttonText="Gerar Análise de Desempenho"
              className="bg-teal-600 hover:bg-teal-700 text-white"
            />
          </div>
        </CardHeader>
        <CardContent className="divide-y divide-gray-700">
          {renderField("Cliente (JID)", avaliacao.remoteJid ? avaliacao.remoteJid.split('@')[0] : 'N/A', User)}
          {renderField("Nota do Cliente", `${avaliacao.nota_cliente}/10`, Star, false, getNotaBadgeVariant(avaliacao.nota_cliente))}
          {renderField("Pontos Fortes", avaliacao.pontos_fortes, ThumbsUp, true, "default")}
          {renderField("Pontos Fracos", avaliacao.pontos_fracos, ThumbsDown, true, "destructive")}
          {renderField("Sugestões de Melhoria", avaliacao.sugestoes_melhoria, MessageSquare, true, "secondary")}
          {renderField("Tempo de Resposta", avaliacao.tempo_resposta, Activity)}
          {renderField("Clareza na Comunicação", avaliacao.clareza_comunicacao, Activity)}
          {renderField("Resolução do Problema", avaliacao.resolucao_problema, Activity)}
          {renderField("Resumo do Atendimento", avaliacao.resumo_atendimento, Activity)}
          {renderField("Data de Criação", avaliacao.createdAt, CalendarDays)}
        </CardContent>
        <CardFooter className="pt-6">
          <p className="text-xs text-gray-500">
            Gerenciado pelo sistema R.A.I.O.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
