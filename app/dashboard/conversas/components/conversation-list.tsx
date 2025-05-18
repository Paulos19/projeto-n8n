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
import { User, MessageSquare, CalendarDays } from 'lucide-react'; 

interface ConversationListProps {
  selectedSellerId?: string;
  loggedInUserId?: string; 
}

export async function ConversationList({ selectedSellerId, loggedInUserId }: ConversationListProps) {



  if (!loggedInUserId) {
    return (
      <p className="text-muted-foreground text-center py-10">
        Usuário não autenticado ou ID não fornecido.
      </p>
    );
  }

  const whereCondition: any = {
    userId: loggedInUserId, 
  };

  if (selectedSellerId && selectedSellerId !== 'all') {
    whereCondition.sellerId = selectedSellerId; 
  }

  const chatInteractions = await prisma.chatInteraction.findMany({
    where: whereCondition,




    include: {
      user: { 
        select: { 
          name: true,

        }
      },
      seller: true, 
    },
    orderBy: {
      eventTimestamp: 'desc', 
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
            {}
            {}
             <p className="text-sm text-muted-foreground">
               Clique nos botões abaixo para mais detalhes.
             </p>
           </CardContent>
           <CardFooter className="flex flex-col sm:flex-row justify-end gap-2 pt-4">
            {interaction.remoteJid && ( 
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