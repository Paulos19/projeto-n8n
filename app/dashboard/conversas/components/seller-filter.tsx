// app/dashboard/conversas/components/seller-filter.tsx
'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Seller {
  id: string;
  name: string | null;
}

interface SellerFilterProps {
  sellers: Seller[];
}

export function SellerFilter({ sellers }: SellerFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentSellerId = searchParams.get('sellerId') || 'all';

  const handleSellerChange = (sellerId: string) => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));

    // Ao mudar o filtro, sempre volte para a página 1
    current.set('page', '1');

    if (!sellerId || sellerId === 'all') {
      current.delete('sellerId');
    } else {
      current.set('sellerId', sellerId);
    }

    const search = current.toString();
    const query = search ? `?${search}` : '';

    router.push(`${pathname}${query}`);
  };

  return (
    <div className="mb-6">
      <Select onValueChange={handleSellerChange} defaultValue={currentSellerId}>
        <SelectTrigger className="w-full sm:w-[280px]">
          <SelectValue placeholder="Filtrar por vendedor..." />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os Vendedores</SelectItem>
          {sellers.map((seller) => (
            <SelectItem key={seller.id} value={seller.id}>
              {seller.name || 'Vendedor Desconhecido'}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
