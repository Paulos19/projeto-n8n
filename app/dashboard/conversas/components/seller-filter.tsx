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
  currentSellerId?: string;
}

export function SellerFilter({ sellers, currentSellerId }: SellerFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleSellerChange = (sellerId: string) => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));

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
      <Select onValueChange={handleSellerChange} defaultValue={currentSellerId || 'all'}>
        <SelectTrigger className="w-[280px]">
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