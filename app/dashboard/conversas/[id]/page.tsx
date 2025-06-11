'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, notFound, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, User, Calendar, MessageSquare, Tag, Bot, UserCircle } from "lucide-react";
import { ChatInteraction } from "@prisma/client";
import { AnalysisTriggerButton } from '@/components/dashboard/AnalysisTriggerButton';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

// Interface para garantir a tipagem correta do histórico de chat
interface ChatMessage {
  sender: string;
  senderName: string;
  text: string;
  timestamp: number;
  messageType: string;
  fromMe: boolean;
}

// Interface para os dados completos da conversa
interface ConversaDetalhes extends Omit<ChatInteraction, 'chatHistory'> {
  chatHistory: ChatMessage[];
}

export default function ConversaDetalhePage() {
  const params = useParams();
  const conversaId = params.id as string;

  const [conversa, setConversa] = useState<ConversaDetalhes | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Função para buscar os dados da conversa
  const fetchData = async () => {
    if (!conversaId) return;
    
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/chat-interaction/${conversaId}`);
      if (!response.ok) {
        if (response.status === 404) notFound();
        throw new Error('Falha ao buscar dados da conversa');
      }
      const data = await response.json();
      const typedChatHistory = Array.isArray(data.chatHistory) ? data.chatHistory : [];
      setConversa({ ...data, chatHistory: typedChatHistory });
    } catch (err) {
      console.error(err);
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [conversaId]);

  const gradientText = "bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400";

  if (isLoading) return <LoadingSpinner message="Carregando conversa..." />;
  if (error) return (
    <div className="text-center p-8">
        <p className="text-destructive font-semibold">Erro ao carregar a conversa</p>
        <p className="text-muted-foreground text-sm mb-4">{error}</p>
        <Button onClick={() => router.back()} variant="outline">Voltar</Button>
    </div>
  );
  if (!conversa) return notFound();

  return (
    <div className="space-y-6">
      <Button asChild variant="outline" className="border-purple-500 text-purple-400 hover:bg-purple-700 hover:text-white">
        <Link href="/dashboard/conversas">
          <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para Conversas
        </Link>
      </Button>

      <Card className="bg-gray-800 border-gray-700 text-white shadow-xl">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div>
              <CardTitle className={`text-2xl font-bold ${gradientText} flex items-center`}>
                <MessageSquare className="mr-3 h-8 w-8" /> Detalhes da Conversa
              </CardTitle>
              <CardDescription className="text-gray-400">
                Cliente: {conversa.customerName || 'Não Informado'} ({conversa.remoteJid})
              </CardDescription>
            </div>
            {/* *** CORREÇÃO PRINCIPAL AQUI *** */}
            {/* Agora estamos passando o ID da interação (conversa.id) em vez do JID do cliente */}
            <AnalysisTriggerButton
              targetId={conversa.id} 
              analysisType="dashboard_summary"
              buttonText="Gerar Resumo com IA"
              className="bg-purple-600 hover:bg-purple-700 text-white"
              onAnalysisComplete={fetchData}
            />
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="p-4 bg-gray-850 rounded-lg border border-gray-700">
            <h3 className="text-lg font-semibold text-gray-200 mb-2 flex items-center">
              <Bot className="mr-2 h-5 w-5 text-purple-400" /> Análise da Conversa
            </h3>
            {conversa.analysisSummary && conversa.analysisSummary !== "Aguardando análise da IA." ? (
              <div className="mb-3">
                <h4 className="text-sm font-medium text-gray-400">Resumo:</h4>
                <p className="text-sm text-gray-300 whitespace-pre-wrap">{conversa.analysisSummary}</p>
              </div>
            ) : <p className="text-sm text-gray-500">Nenhum resumo gerado ainda. Clique no botão para processar.</p>}
            {conversa.analysisKeywords && conversa.analysisKeywords.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-400 mb-1">Palavras-chave:</h4>
                <div className="flex flex-wrap gap-2">
                  {conversa.analysisKeywords.map((keyword) => (
                    <Badge key={keyword} variant="secondary" className="bg-purple-600 hover:bg-purple-500 text-purple-100">
                      <Tag className="mr-1 h-3 w-3" /> {keyword}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-200 mb-3 mt-6">Histórico da Conversa</h3>
            {conversa.chatHistory && conversa.chatHistory.length > 0 ? (
              <div className="space-y-4 max-h-[500px] overflow-y-auto p-4 bg-gray-850 rounded-lg border border-gray-700">
                {conversa.chatHistory.map((msg, index) => (
                  <div key={index} className={`flex flex-col ${ msg.fromMe ? "items-end" : "items-start" }`}>
                    <div className={`max-w-xl p-3 rounded-lg shadow ${ msg.fromMe ? "bg-blue-600 text-white" : "bg-gray-700 text-gray-200" }`}>
                      <div className="flex items-center mb-1">
                        {msg.fromMe ? <UserCircle className="mr-2 h-5 w-5 opacity-80" /> : <User className="mr-2 h-5 w-5 opacity-80" />}
                        <span className="text-xs font-semibold opacity-90">
                          {msg.fromMe ? conversa.sellerInstanceName || "Vendedor" : msg.senderName || "Cliente"}
                        </span>
                      </div>
                      <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                      <p className="text-xs opacity-70 mt-1 text-right">
                        {new Date(Number(msg.timestamp) * 1000).toLocaleString('pt-BR', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 p-4 bg-gray-850 rounded-lg border border-gray-700">
                Nenhum histórico de chat disponível para esta interação.
              </p>
            )}
          </div>
        </CardContent>
        <CardFooter className="pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-gray-500">
            ID da Interação: {conversa.id}
          </p>
          {conversa.remoteJid && (
            <Button asChild variant="outline" size="sm" className="border-sky-500 text-sky-400 hover:bg-sky-600 hover:text-white">
              <Link href={`/dashboard/clientes/${conversa.remoteJid.replace('@', '_')}`}>
                <User className="mr-2 h-4 w-4" /> Ver Perfil do Cliente
              </Link>
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}