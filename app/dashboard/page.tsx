// app/dashboard/page.tsx (Painel de Administração)
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
// A interface AvaliacaoData pode vir do endpoint ou ser definida localmente
// Idealmente, você teria um arquivo de tipos compartilhado (ex: types/index.ts)
interface AvaliacaoData {
  id: string; // Agora temos ID do banco
  nota_cliente: number;
  pontos_fortes: string[];
  pontos_fracos: string[];
  tempo_resposta: string;
  clareza_comunicacao: string;
  resolucao_problema: string;
  sugestoes_melhoria: string[];
  resumo_atendimento: string;
  remoteJid?: string | null;
  createdAt: string; // Prisma retorna Date, mas JSON stringifica para string
}

// Componente Card (pode ser movido para um arquivo separado)
const AvaliacaoCard = ({ avaliacao }: { avaliacao: AvaliacaoData }) => {
  return (
    <Link href={`/dashboard/avaliacao/${avaliacao.id}`} legacyBehavior>
      <a className="block bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-200 ease-in-out transform hover:-translate-y-1">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-xl font-semibold text-slate-800">
            Avaliação: {avaliacao.remoteJid ? avaliacao.remoteJid.split('@')[0] : 'ID N/A'}
          </h3>
          <span className={`px-3 py-1 text-sm font-semibold rounded-full text-white ${
            avaliacao.nota_cliente >= 8 ? 'bg-green-500' : avaliacao.nota_cliente >= 5 ? 'bg-yellow-500' : 'bg-red-500'
          }`}>
            Nota: {avaliacao.nota_cliente}/10
          </span>
        </div>
        <p className="text-gray-600 text-sm mb-3">
          Recebida em: {new Date(avaliacao.createdAt).toLocaleString('pt-BR')}
        </p>
        <p className="text-gray-700 truncate">
          {avaliacao.resumo_atendimento}
        </p>
        <div className="mt-4 text-right">
            <span className="text-blue-600 hover:text-blue-800 font-medium">Ver Detalhes &rarr;</span>
        </div>
      </a>
    </Link>
  );
};


export default function AdminDashboardPage() {
  const [avaliacoes, setAvaliacoes] = useState<AvaliacaoData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAvaliacoes = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/receber-avaliacao'); // Chama o GET endpoint
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `Falha ao buscar dados: ${response.statusText}` }));
        throw new Error(errorData.message || `Falha ao buscar dados: ${response.statusText}`);
      }
      const data: AvaliacaoData[] = await response.json();
      console.log("Avaliações recebidas no painel:", data);
      setAvaliacoes(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ocorreu um erro desconhecido.';
      setError(errorMessage);
      console.error("Erro ao buscar avaliações:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAvaliacoes();
    // Opcional: configurar um intervalo para buscar novas avaliações periodicamente
    // ou implementar WebSockets/SSE para atualizações em tempo real.
    // const intervalId = setInterval(fetchAvaliacoes, 30000); // A cada 30 segundos
    // return () => clearInterval(intervalId);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <p className="text-xl text-slate-600">Carregando avaliações...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-lg shadow-xl text-center max-w-md">
          <p className="text-xl text-red-600 mb-4">Erro ao carregar avaliações:</p>
          <p className="text-slate-700 mb-6">{error}</p>
          <button
            onClick={fetchAvaliacoes}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-sky-100 py-8 px-4 sm:px-6 lg:px-8">
      <header className="mb-10 text-center">
        <h1 className="text-4xl font-bold text-slate-800">Painel de Avaliações</h1>
      </header>

      {avaliacoes.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow-xl text-center max-w-lg mx-auto">
            <p className="text-xl text-slate-700 mb-6">Nenhuma avaliação encontrada no banco de dados.</p>
            <p className="text-sm text-slate-500">Aguardando novas avaliações do N8N...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {avaliacoes.map((avaliacao) => (
            <AvaliacaoCard key={avaliacao.id} avaliacao={avaliacao} />
          ))}
        </div>
      )}
       <div className="mt-12 text-center">
          <button
            onClick={fetchAvaliacoes}
            className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-all duration-150 ease-in-out"
          >
            Atualizar Lista de Avaliações
          </button>
        </div>
    </div>
  );
}