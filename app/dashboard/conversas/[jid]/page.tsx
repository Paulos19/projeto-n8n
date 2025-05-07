// app/dashboard/conversas/[jid]/page.tsx
import prisma from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, User, Calendar, MessageSquare, Tag, Bot, UserCircle } from "lucide-react";
import { ChatInteraction } from "@prisma/client";

export const dynamic = 'force-dynamic';

// Define a estrutura para mensagens individuais no chatHistory
interface ChatMessage {
  sender: string;
  senderName: string;
  text: string;
  timestamp: number; // Unix timestamp em segundos
  messageType: string;
  fromMe: boolean;
}

// Tipo para os detalhes da conversa, garantindo que chatHistory seja tipado corretamente
interface ConversaDetalhes extends Omit<ChatInteraction, 'chatHistory'> {
  chatHistory: ChatMessage[];
}

async function getConversaDetalhes(id: string): Promise<ConversaDetalhes | null> {
  try {
    const conversa = await prisma.chatInteraction.findUnique({
      where: { id },
    });

    if (!conversa) {
      return null;
    }

    // Garante que chatHistory seja parseado e tipado corretamente
    // Prisma armazena JSON como JsonValue, então precisamos fazer o cast.
    // O campo chatHistory no banco é um JSON que corresponde a ChatMessage[]
    const typedChatHistory = conversa.chatHistory as unknown as ChatMessage[];

    return {
      ...conversa,
      chatHistory: typedChatHistory || [], // Fallback para array vazio se for null/undefined
    };
  } catch (error) {
    console.error("Erro ao buscar detalhes da conversa:", error);
    return null;
  }
}

export default async function ConversaDetalhePage({ params }: { params: { jid: string } }) {
  // params.jid aqui é o ID da ChatInteraction
  const conversa = await getConversaDetalhes(params.jid); 
  const gradientText = "bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400";

  if (!conversa) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <Button asChild variant="outline" className="border-purple-500 text-purple-400 hover:bg-purple-700 hover:text-white">
        <Link href="/dashboard/conversas">
          <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para Conversas
        </Link>
      </Button>

      <Card className="bg-gray-800 border-gray-700 text-white shadow-xl">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <div>
              <CardTitle className={`text-2xl font-bold ${gradientText} flex items-center`}>
                <MessageSquare className="mr-3 h-8 w-8" /> Detalhes da Conversa
              </CardTitle>
              <CardDescription className="text-gray-400">
                Cliente: {conversa.customerName} ({conversa.remoteJid})
              </CardDescription>
            </div>
            <div className="text-sm text-gray-400 mt-2 sm:mt-0">
              <Calendar className="inline-block mr-1 h-4 w-4" />
              {new Date(conversa.eventTimestamp).toLocaleString('pt-BR', {
                dateStyle: 'long',
                timeStyle: 'short',
              })}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Seção de Análise */}
          <div className="p-4 bg-gray-850 rounded-lg border border-gray-700">
            <h3 className="text-lg font-semibold text-gray-200 mb-2 flex items-center">
              <Bot className="mr-2 h-5 w-5 text-purple-400" /> Análise da Conversa
            </h3>
            {conversa.analysisSummary && (
              <div className="mb-3">
                <h4 className="text-sm font-medium text-gray-400">Resumo:</h4>
                <p className="text-sm text-gray-300 whitespace-pre-wrap">{conversa.analysisSummary}</p>
              </div>
            )}
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
            {(!conversa.analysisSummary && (!conversa.analysisKeywords || conversa.analysisKeywords.length === 0)) && (
                 <p className="text-sm text-gray-500">Nenhuma análise disponível para esta interação.</p>
            )}
          </div>

          {/* Seção de Histórico de Chat */}
          <div>
            <h3 className="text-lg font-semibold text-gray-200 mb-3 mt-6">Histórico da Conversa</h3>
            {conversa.chatHistory && conversa.chatHistory.length > 0 ? (
              <div className="space-y-4 max-h-[500px] overflow-y-auto p-4 bg-gray-850 rounded-lg border border-gray-700">
                {conversa.chatHistory.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex flex-col ${
                      msg.fromMe ? "items-end" : "items-start"
                    }`}
                  >
                    <div
                      className={`max-w-xl p-3 rounded-lg shadow ${
                        msg.fromMe
                          ? "bg-blue-600 text-white" // Mensagens do vendedor/atendente
                          : "bg-gray-700 text-gray-200" // Mensagens do cliente
                      }`}
                    >
                      <div className="flex items-center mb-1">
                        {msg.fromMe ? (
                            <UserCircle className="mr-2 h-5 w-5 opacity-80" />
                        ) : (
                            <User className="mr-2 h-5 w-5 opacity-80" />
                        )}
                        <span className="text-xs font-semibold opacity-90">
                          {msg.fromMe ? "Vendedor" : msg.senderName || "Cliente"}
                        </span>
                      </div>
                      <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                      <p className="text-xs opacity-70 mt-1 text-right">
                        {new Date(msg.timestamp * 1000).toLocaleString('pt-BR', { // Convertendo Unix timestamp (segundos) para ms
                          hour: '2-digit',
                          minute: '2-digit',
                          day: '2-digit',
                          month: 'short'
                        })}
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
            <Button asChild variant="outline" size="sm" className="border-sky-500 text-sky-400 hover:bg-sky-600 hover:text-white dark:border-sky-600 dark:text-sky-500 dark:hover:bg-sky-700 dark:hover:text-white">
              <Link href={`/dashboard/clientes/${conversa.remoteJid.replace('@', '_')}`}>
                <>
                  <User className="mr-2 h-4 w-4" /> Ver Perfil do Cliente
                </>
              </Link>
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}