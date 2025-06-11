// app/dashboard/conversas/page.tsx

import prisma from '@/lib/prisma';
import { SellerFilter } from './components/seller-filter';
import { Suspense } from 'react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ConversationList } from './components/conversation-list';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/auth';

// Garante que a página seja renderizada dinamicamente
export const dynamic = 'force-dynamic';

interface ConversasPageProps {
  searchParams?: {
    sellerId?: string;
    page?: string;
  };
}

export default async function ConversasPage({ searchParams }: ConversasPageProps) {
  const session = await getServerSession(authOptions);
  const loggedInUserId = session?.user?.id;

  // Busca os vendedores para o filtro.
  // Esta lógica permanece aqui pois é necessária para o componente de filtro.
  let sellers: { id: string; name: string | null; }[] = [];
  if (loggedInUserId) {
    const fetchedSellers = await prisma.seller.findMany({
      where: {
        storeOwnerId: loggedInUserId,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        name: 'asc',
      },
    });
    sellers = fetchedSellers;
  }

  // Extrai os parâmetros da URL de forma segura
  const selectedSellerId = searchParams?.sellerId || 'all';
  const currentPage = Number(searchParams?.page) || 1;

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Conversas</h1>

      <SellerFilter sellers={sellers} />

      {/* O Suspense agora envolve um componente que faz o fetch dos dados */}
      <Suspense key={selectedSellerId + currentPage} fallback={<LoadingSpinner message="Carregando conversas..." />}>
        <ConversationList
          selectedSellerId={selectedSellerId}
          currentPage={currentPage}
          loggedInUserId={loggedInUserId}
        />
      </Suspense>
    </div>
  );
}
