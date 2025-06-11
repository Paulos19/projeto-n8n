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
import { User, MessageSquare, CalendarDays, ArrowLeft, ArrowRight } from 'lucide-react';
import { Prisma } from '@prisma/client';

interface ConversationListProps {
  selectedSellerId?: string;
  currentPage: number;
  loggedInUserId?: string;
}

const ITEMS_PER_PAGE = 9; // Define quantos itens por página

export async function ConversationList({ selectedSellerId, currentPage, loggedInUserId }: ConversationListProps) {
  if (!loggedInUserId) {
    return (
      <p className="text-muted-foreground text-center py-10">
        Usuário não autenticado ou ID não fornecido.
      </p>
    );
  }

  // Constrói a condição de busca para o Prisma
  const whereCondition: Prisma.ChatInteractionWhereInput = {
    userId: loggedInUserId,
  };

  if (selectedSellerId && selectedSellerId !== 'all') {
    whereCondition.sellerId = selectedSellerId;
  }

  // Lógica de Paginação
  const skip = (currentPage - 1) * ITEMS_PER_PAGE;

  const chatInteractions = await prisma.chatInteraction.findMany({
    where: whereCondition,
    include: {
      seller: {
        select: { name: true },
      },
    },
    orderBy: {
      eventTimestamp: 'desc',
    },
    take: ITEMS_PER_PAGE,
    skip: skip,
  });

  // Conta o total de itens para saber se há uma próxima página
  const totalInteractions = await prisma.chatInteraction.count({ where: whereCondition });
  const hasNextPage = (skip + ITEMS_PER_PAGE) < totalInteractions;
  const hasPreviousPage = currentPage > 1;

  if (chatInteractions.length === 0) {
    return (
      <p className="text-muted-foreground text-center py-10">
        Nenhuma conversa encontrada para os filtros selecionados.
      </p>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        {chatInteractions.map((interaction) => (
          <Card key={interaction.id} className="flex flex-col">
            <CardHeader>
              <CardTitle className="text-lg">Cliente: {interaction.customerName || 'Não informado'}</CardTitle>
              <CardDescription className="flex items-center text-sm pt-1">
                <User className="mr-2 h-4 w-4 text-muted-foreground" />
                Vendedor: {interaction.seller?.name || interaction.sellerInstanceName || 'Não atribuído'}
              </CardDescription>
              <CardDescription className="flex items-center text-xs pt-1">
                <CalendarDays className="mr-2 h-3 w-3 text-muted-foreground" />
                Data: {new Date(interaction.eventTimestamp).toLocaleString('pt-BR')}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <p className="text-sm text-muted-foreground">
                Clique em "Ver Conversa" para ver o histórico de mensagens e análises.
              </p>
            </CardContent>
            <CardFooter className="flex justify-end gap-2 pt-4">
              <Button asChild variant="default" size="sm">
                <Link href={`/dashboard/conversas/${interaction.id}`}>
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Ver Conversa
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Controles de Paginação */}
      <div className="flex items-center justify-center space-x-4 mt-8">
        <Button asChild variant="outline" disabled={!hasPreviousPage}>
          <Link href={`/dashboard/conversas?sellerId=${selectedSellerId}&page=${currentPage - 1}`}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Anterior
          </Link>
        </Button>
        <span className="text-sm font-medium">Página {currentPage}</span>
        <Button asChild variant="outline" disabled={!hasNextPage}>
          <Link href={`/dashboard/conversas?sellerId=${selectedSellerId}&page=${currentPage + 1}`}>
            Próxima <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
