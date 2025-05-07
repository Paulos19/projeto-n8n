// app/dashboard/conversas/page.tsx
import Link from "next/link";
import prisma from "@/lib/prisma";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageCircle, User, Calendar, ExternalLink } from "lucide-react";
import { ChatInteraction } from "@prisma/client"; // Importe o tipo gerado

export const dynamic = 'force-dynamic';

async function getConversas(): Promise<ChatInteraction[]> {
  const conversas = await prisma.chatInteraction.findMany({
    orderBy: {
      eventTimestamp: 'desc',
    },
  });
  return conversas;
}

export default async function ConversasPage() {
  const conversas = await getConversas();
  const gradientText = "bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400"; // Novo gradiente para diferenciar

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
        <div>
          <h1 className={`text-3xl font-bold ${gradientText}`}>
            <MessageCircle className="inline-block mr-3 h-8 w-8" />
            Conversas Recebidas (n8n)
          </h1>
          <p className="text-gray-400">Visualize as interações e análises recebidas via n8n.</p>
        </div>
      </div>

      {conversas.length === 0 && (
        <Card className="bg-gray-800 border-gray-700 text-white">
          <CardContent className="pt-6">
            <p className="text-center text-gray-400">Nenhuma conversa encontrada.</p>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
        {conversas.map((conversa) => (
          <Card key={conversa.id} className="bg-gray-800 border-gray-700 text-white flex flex-col">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl text-blue-400 flex items-center">
                    <User className="mr-2 h-5 w-5" /> {conversa.customerName}
                  </CardTitle>
                  <CardDescription className="text-gray-500 text-xs">
                    {conversa.remoteJid}
                  </CardDescription>
                </div>
                <div className="text-xs text-gray-400 flex items-center">
                   <Calendar className="mr-1 h-4 w-4" /> 
                   {new Date(conversa.eventTimestamp).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-grow space-y-3">
              <div>
                <h4 className="text-sm font-semibold text-gray-300 mb-1">Resumo da Análise:</h4>
                <p className="text-sm text-gray-400 leading-relaxed max-h-20 overflow-y-auto">
                  {conversa.analysisSummary || "Nenhum resumo disponível."}
                </p>
              </div>
              {conversa.analysisKeywords && conversa.analysisKeywords.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-300 mb-1">Palavras-chave:</h4>
                  <div className="flex flex-wrap gap-1">
                    {conversa.analysisKeywords.map(keyword => (
                      <span key={keyword} className="text-xs bg-gray-700 text-gray-300 px-2 py-0.5 rounded-full">{keyword}</span>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button asChild variant="outline" className="w-full border-blue-500 text-blue-400 hover:bg-blue-700 hover:text-white">
                <Link href={`/dashboard/clientes/${conversa.remoteJid.replace('@', '_')}`}>
                  <ExternalLink className="mr-2 h-4 w-4" /> Ver Detalhes do Cliente
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}