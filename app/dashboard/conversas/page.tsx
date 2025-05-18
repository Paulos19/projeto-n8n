import prisma from '@/lib/prisma';
import { SellerFilter } from './components/seller-filter';
import { Suspense } from 'react'; 
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ConversationList } from './components/conversation-list';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/auth'; 

interface ConversasPageProps {
  searchParams?: {
    sellerId?: string;

  };
}

export default async function ConversasPage({ searchParams }: ConversasPageProps) {
  const selectedSellerId = searchParams?.sellerId;
  const session = await getServerSession(authOptions);
  const loggedInUserId = session?.user?.id; 


  let sellers: { id: string; name: string | null; instanceName: string }[] = [];



  if (loggedInUserId) { 




    const fetchedSellers = await prisma.seller.findMany({
      where: {
        storeOwnerId: loggedInUserId, 
        isActive: true, 
      },
      select: {
        id: true,
        name: true, 
        evolutionInstanceName: true, 
      },
      orderBy: {
        name: 'asc',
      },
    });


    sellers = fetchedSellers.map(seller => ({
      id: seller.id,
      name: seller.name,
      instanceName: seller.evolutionInstanceName, 
    }));
  }





  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Conversas</h1>

      <SellerFilter sellers={sellers} currentSellerId={selectedSellerId} />

      {}
      <Suspense fallback={<LoadingSpinner message="Carregando conversas..." />}>
        <ConversationList selectedSellerId={selectedSellerId} loggedInUserId={loggedInUserId} />
      </Suspense>
    </div>
  );
}