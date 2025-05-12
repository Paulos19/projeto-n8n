'use client'; // Se for usar hooks como useRouter para navegação via Link do Next.js

import Link from 'next/link';

// No futuro, esta página poderia listar os vendedores existentes
// import { useEffect, useState } from 'react';
// interface Seller { id: string; name: string; evolutionInstanceName: string; /* ... */ }

export default function SellersPage() {
  // const [sellers, setSellers] = useState<Seller[]>([]);
  // const [loading, setLoading] = useState(true);

  // useEffect(() => {
  //   async function fetchSellers() {
  //     try {
  //       const response = await fetch('/api/sellers'); // Precisaria de um GET em /api/sellers
  //       if (!response.ok) throw new Error('Falha ao buscar vendedores');
  //       const data = await response.json();
  //       setSellers(data.sellers || []);
  //     } catch (error) {
  //       console.error(error);
  //     } finally {
  //       setLoading(false);
  //     }
  //   }
  //   fetchSellers();
  // }, []);

  const buttonStyle = "px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2";

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Gerenciar Vendedores</h1>
        <Link href="/dashboard/sellers/add" legacyBehavior>
          <a className={buttonStyle}>
            Adicionar Novo Vendedor
          </a>
        </Link>
      </div>

      {/* {loading && <p>Carregando vendedores...</p>}
      {!loading && sellers.length === 0 && <p>Nenhum vendedor cadastrado ainda.</p>}
      {!loading && sellers.length > 0 && (
        <ul className="space-y-2">
          {sellers.map(seller => (
            <li key={seller.id} className="p-3 border rounded-md">
              <p><strong>Nome:</strong> {seller.name || 'N/A'}</p>
              <p><strong>Instância:</strong> {seller.evolutionInstanceName}</p>
              {/* Mais detalhes do vendedor aqui *}
            </li>
          ))}
        </ul>
      )} */}
      <p className="mt-4">A listagem de vendedores será implementada aqui.</p>
    </div>
  );
}