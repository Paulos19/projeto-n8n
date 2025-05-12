import prisma from '@/lib/prisma';
import { SellerFilter } from './components/seller-filter';
import { Suspense } from 'react'; 
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ConversationList } from './components/conversation-list';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/auth'; // Certifique-se que este caminho para authOptions está correto

interface ConversasPageProps {
  searchParams?: {
    sellerId?: string;
    // outros searchParams que você possa ter
  };
}

export default async function ConversasPage({ searchParams }: ConversasPageProps) {
  const selectedSellerId = searchParams?.sellerId;
  const session = await getServerSession(authOptions);
  const loggedInUserId = session?.user?.id; // Adicionado para clareza

  // Ajustada a tipagem para incluir instanceName, que virá de Seller.evolutionInstanceName
  let sellers: { id: string; name: string | null; instanceName: string }[] = [];

  // 1. Buscar vendedores (do modelo Seller) para o filtro,
  //    associados ao usuário logado (dono da loja).
  if (loggedInUserId) { // Verifica se há um usuário logado
    // const loggedInUserId = session.user.id; // Movido para cima

    // Busca os vendedores do modelo Seller que estão associados ao usuário logado (storeOwnerId)
    // e estão ativos.
    const fetchedSellers = await prisma.seller.findMany({
      where: {
        storeOwnerId: loggedInUserId, // AQUI GARANTE QUE SÃO OS VENDEDORES DO DONO LOGADO
        isActive: true, // Opcional: considera apenas vendedores ativos
      },
      select: {
        id: true,
        name: true, // Nome de exibição do vendedor
        evolutionInstanceName: true, // Nome da instância Evolution, será usado como instanceName
      },
      orderBy: {
        name: 'asc',
      },
    });

    // Mapeia os dados dos vendedores para o formato esperado pelo SellerFilter
    sellers = fetchedSellers.map(seller => ({
      id: seller.id,
      name: seller.name,
      instanceName: seller.evolutionInstanceName, // Mapeia evolutionInstanceName para instanceName
    }));
  }
  // Se não houver sessão, 'sellers' permanecerá uma lista vazia.

  // A busca e renderização das interações de chat agora são feitas
  // dentro do componente ConversationList, envolvido por Suspense.

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Conversas</h1>

      <SellerFilter sellers={sellers} currentSellerId={selectedSellerId} />

      {/* 
        Envolvemos o ConversationList com Suspense.
        O fallback (LoadingSpinner) será exibido enquanto ConversationList busca os dados.
      */}
      <Suspense fallback={<LoadingSpinner message="Carregando conversas..." />}>
        <ConversationList selectedSellerId={selectedSellerId} loggedInUserId={loggedInUserId} />
      </Suspense>
    </div>
  );
}