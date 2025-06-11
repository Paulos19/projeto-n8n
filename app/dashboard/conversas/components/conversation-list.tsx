// app/dashboard/conversas/components/conversation-list.tsx

import prisma from '@/lib/prisma';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { 
  User, 
  MessageSquare, 
  CalendarDays, 
  ArrowLeft, 
  ArrowRight,
  Briefcase,
  ExternalLink
} from 'lucide-react';
import { Prisma, ChatInteraction } from '@prisma/client';
import { Badge } from '@/components/ui/badge';

interface ConversationListProps {
  selectedSellerId?: string;
  currentPage: number;
  loggedInUserId?: string;
}

// Tipagem para a interação, incluindo o seller e o chatHistory
type InteractionWithDetails = Omit<ChatInteraction, 'chatHistory'> & {
  seller: { name: string | null } | null;
  chatHistory: Prisma.JsonValue;
};


const ITEMS_PER_PAGE = 9;

// Função auxiliar para extrair o nome do cliente de forma mais robusta
const getCustomerName = (interaction: InteractionWithDetails): string => {
  // 1. Prioriza o campo 'customerName' que já existe no registro.
  if (interaction.customerName && interaction.customerName !== 'Cliente') {
    return interaction.customerName;
  }

  // 2. Se o campo principal falhar, busca no histórico de mensagens.
  if (Array.isArray(interaction.chatHistory)) {
    // Itera sobre as mensagens para encontrar a primeira do cliente com um nome de remetente.
    for (const msg of interaction.chatHistory) {
      // Type Guard: Garante que 'msg' é um objeto com as propriedades que precisamos.
      if (
        typeof msg === 'object' &&
        msg !== null &&
        !Array.isArray(msg) &&
        'fromMe' in msg &&
        msg.fromMe === false &&
        'sender' in msg &&
        typeof msg.sender === 'string'
      ) {
        // Se todas as condições forem atendidas, encontramos uma mensagem válida do cliente.
        return msg.sender;
      }
    }
  }

  // 3. Como último recurso, usa o número de telefone.
  return interaction.remoteJid.split('@')[0] || 'Cliente Desconhecido';
};


export async function ConversationList({ selectedSellerId, currentPage, loggedInUserId }: ConversationListProps) {
  if (!loggedInUserId) {
    return (
      <p className="text-muted-foreground text-center py-10">
        Usuário não autenticado. Por favor, faça login para ver as conversas.
      </p>
    );
  }

  const whereCondition: Prisma.ChatInteractionWhereInput = {
    userId: loggedInUserId,
  };

  if (selectedSellerId && selectedSellerId !== 'all') {
    whereCondition.sellerId = selectedSellerId;
  }

  const skip = (currentPage - 1) * ITEMS_PER_PAGE;

  const chatInteractions = await prisma.chatInteraction.findMany({
    where: whereCondition,
    select: {
        id: true,
        remoteJid: true,
        customerName: true,
        eventTimestamp: true,
        sellerInstanceName: true,
        analysisKeywords: true,
        userId: true,
        sellerId: true,
        analysisSummary: true,
        seller: { select: { name: true } },
        chatHistory: true
    },
    orderBy: {
      eventTimestamp: 'desc',
    },
    take: ITEMS_PER_PAGE,
    skip: skip,
  });

  const totalInteractions = await prisma.chatInteraction.count({ where: whereCondition });
  const hasNextPage = (skip + ITEMS_PER_PAGE) < totalInteractions;
  const hasPreviousPage = currentPage > 1;
  const gradientText = "bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400";


  if (chatInteractions.length === 0) {
    return (
      <div className="text-center py-16">
        <MessageSquare className="mx-auto h-12 w-12 text-gray-500" />
        <h3 className="mt-2 text-xl font-semibold text-gray-300">Nenhuma conversa encontrada</h3>
        <p className="mt-1 text-base text-gray-500">Tente ajustar os filtros ou aguarde novas interações.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        {chatInteractions.map((interaction) => {
          // Utiliza a nova função para determinar o nome a ser exibido
          const displayName = getCustomerName(interaction as InteractionWithDetails);

          return (
            <Card 
              key={interaction.id} 
              className="bg-gray-800/50 border-gray-700/80 text-white flex flex-col hover:border-purple-500/50 hover:shadow-2xl hover:shadow-purple-900/20 transition-all duration-300 ease-in-out transform hover:-translate-y-1"
            >
              <CardHeader className="pb-4">
                <div className="flex items-center gap-4">
                  <div className="bg-purple-900/50 p-3 rounded-full border border-purple-800">
                     <User className="h-6 w-6 text-purple-400" />
                  </div>
                  <div>
                    <CardTitle className={`text-xl font-bold ${gradientText}`}>
                      {displayName}
                    </CardTitle>
                    <CardDescription className="text-gray-400 text-xs font-mono">
                      ID: {interaction.remoteJid}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-grow space-y-3 pt-2">
                <div className="flex items-center text-sm text-gray-400">
                  <Briefcase className="mr-2 h-4 w-4 flex-shrink-0" />
                  <span className="font-medium mr-1">Vendedor:</span>
                  <span className="truncate">{interaction.seller?.name || interaction.sellerInstanceName || 'Não atribuído'}</span>
                </div>
                <div className="flex items-center text-sm text-gray-400">
                  <CalendarDays className="mr-2 h-4 w-4 flex-shrink-0" />
                  <span className="font-medium mr-1">Data:</span>
                  <span>{new Date(interaction.eventTimestamp).toLocaleString('pt-BR')}</span>
                </div>
                 {interaction.analysisKeywords && (interaction.analysisKeywords as string[]).length > 0 && (
                   <div className="pt-2">
                      <div className="flex flex-wrap gap-2">
                        {(interaction.analysisKeywords as string[]).slice(0, 3).map((keyword) => (
                          <Badge key={keyword} variant="secondary" className="bg-gray-700 text-gray-300 border-gray-600">
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                   </div>
                 )}
              </CardContent>
              <CardFooter className="flex justify-end gap-2 pt-4 bg-gray-900/30 rounded-b-lg border-t border-gray-700/80">
                {interaction.remoteJid && ( 
                  <Button asChild variant="outline" size="sm" className="border-sky-500 text-sky-400 hover:bg-sky-600 hover:text-white">
                    <Link href={`/dashboard/clientes/${interaction.remoteJid.replace('@', '_')}`}>
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Perfil Cliente
                    </Link>
                  </Button>
                )}
                <Button asChild variant="default" size="sm" className="bg-purple-600 hover:bg-purple-700">
                  <Link href={`/dashboard/conversas/${interaction.id}`}>
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Ver Conversa
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          )
        })}
      </div>

      {/* Controles de Paginação */}
      <div className="flex items-center justify-center space-x-4 mt-8">
        <Button asChild variant="outline" disabled={!hasPreviousPage} className="disabled:opacity-50">
          <Link href={`/dashboard/conversas?sellerId=${selectedSellerId}&page=${currentPage - 1}`}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Anterior
          </Link>
        </Button>
        <span className="text-sm font-medium text-gray-400">Página {currentPage}</span>
        <Button asChild variant="outline" disabled={!hasNextPage} className="disabled:opacity-50">
          <Link href={`/dashboard/conversas?sellerId=${selectedSellerId}&page=${currentPage + 1}`}>
            Próxima <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
