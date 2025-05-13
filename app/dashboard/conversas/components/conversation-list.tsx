import prisma from '@/lib/prisma';
import Link from 'next/link';
import { Button } from '@/components/ui/button'; // Assumindo que você tem este componente
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'; // Assumindo que você tem estes componentes
import { User, MessageSquare, CalendarDays } from 'lucide-react'; // Ícones para detalhes

interface ConversationListProps {
  selectedSellerId?: string;
  loggedInUserId?: string; // Adicionado para receber o ID do usuário logado
}

export async function ConversationList({ selectedSellerId, loggedInUserId }: ConversationListProps) {
  // Opcional: Simular um atraso para testar o Suspense
  // await new Promise(resolve => setTimeout(resolve, 2000));

  if (!loggedInUserId) {
    return (
      <p className="text-muted-foreground text-center py-10">
        Usuário não autenticado ou ID não fornecido.
      </p>
    );
  }

  const whereCondition: any = {
    userId: loggedInUserId, // Filtra sempre pelo ID do dono da loja logado
  };

  if (selectedSellerId && selectedSellerId !== 'all') {
    whereCondition.sellerId = selectedSellerId; // Adiciona filtro por sellerId se um vendedor específico for selecionado
  }

  const chatInteractions = await prisma.chatInteraction.findMany({
    where: whereCondition,
    // O include para 'user' (dono da loja) pode ser mantido se você usar o nome do dono da loja em outro lugar.
    // Para o nome do vendedor, 'sellerInstanceName' já está no modelo ChatInteraction.
    // Se precisar de mais dados do vendedor, pode adicionar: include: { seller: true }
    // Por ora, o include existente para user é:
    include: {
      user: { 
        select: { 
          name: true,
          // instanceName: true // instanceName no User é o da loja, não do vendedor
        }
      },
      seller: true, // Adicionado para incluir os dados completos do vendedor
    },
    orderBy: {
      eventTimestamp: 'desc', // Ordenar por data do evento da interação
    },
  });

  if (chatInteractions.length === 0) {
    return (
      <p className="text-muted-foreground text-center py-10">
        {selectedSellerId && selectedSellerId !== 'all' 
          ? 'Nenhuma conversa encontrada para este vendedor.' 
          : 'Nenhuma conversa encontrada para este usuário.'}
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
            {/* Você pode adicionar um breve resumo da conversa aqui se desejar */}
            {/* Exemplo:
            <p className="text-sm text-muted-foreground line-clamp-3">
              {typeof interaction.chatHistory === 'string' 
                ? interaction.chatHistory.substring(0, 100) + "..." 
                : "Prévia do histórico não disponível."}
            </p>
            */}
             <p className="text-sm text-muted-foreground">
               Clique nos botões abaixo para mais detalhes.
             </p>
           </CardContent>
           <CardFooter className="flex flex-col sm:flex-row justify-end gap-2 pt-4">
            {interaction.remoteJid && ( // Renderiza o botão se remoteJid existir e não for uma string vazia
              <Button asChild variant="outline" size="sm">
                <Link href={`/dashboard/clientes/${interaction.remoteJid.replace('@', '_')}`}>
                  Detalhes Cliente
                </Link>
              </Button>
            )}
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
  );
}