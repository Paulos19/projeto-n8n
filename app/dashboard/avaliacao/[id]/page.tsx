// app/dashboard/avaliacao/[id]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation'; // Hooks para rotas dinâmicas
import Link from 'next/link';

// Interface para os dados da avaliação (pode ser importada de um arquivo de tipos)
interface AvaliacaoData {
  id: string;
  nota_cliente: number;
  pontos_fortes: string[];
  pontos_fracos: string[];
  tempo_resposta: string;
  clareza_comunicacao: string;
  resolucao_problema: string;
  sugestoes_melhoria: string[];
  resumo_atendimento: string;
  remoteJid?: string | null;
  createdAt: string;
}

// Novo endpoint na API para buscar uma avaliação específica por ID
async function fetchAvaliacaoById(id: string): Promise<AvaliacaoData | null> {
  try {
    const response = await fetch(`/api/avaliacao/${id}`); // Novo endpoint
    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error('Falha ao buscar dados da avaliação');
    }
    return await response.json();
  } catch (error) {
    console.error("Erro ao buscar avaliação por ID:", error);
    throw error; // Re-throw para ser pego pelo componente
  }
}


export default function AvaliacaoDetalhePage() {
  const router = useRouter();
  const params = useParams(); // Obtém o { id: 'valor-do-id' } da URL
  const id = typeof params.id === 'string' ? params.id : undefined;

  const [avaliacao, setAvaliacao] = useState<AvaliacaoData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      setIsLoading(true);
      setError(null);
      fetchAvaliacaoById(id)
        .then(data => {
          if (data) {
            setAvaliacao(data);
          } else {
            setError('Avaliação não encontrada.');
          }
        })
        .catch(err => {
          setError(err.message || 'Ocorreu um erro ao buscar a avaliação.');
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else if (!params.id) {
        // Este caso pode acontecer brevemente durante a renderização inicial
        // ou se a rota for acessada sem ID (o que não deveria acontecer com uma estrutura de arquivo correta)
        setIsLoading(false);
        setError("ID da avaliação não fornecido na rota.");
    }
  }, [id, params.id]); // Dependência no 'id'

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <p className="text-xl text-slate-600">Carregando detalhes da avaliação...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-lg shadow-xl text-center max-w-md">
          <p className="text-xl text-red-600 mb-4">Erro:</p>
          <p className="text-slate-700 mb-6">{error}</p>
          <Link href="/dashboard" legacyBehavior>
            <a className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
              Voltar ao Painel
            </a>
          </Link>
        </div>
      </div>
    );
  }

  if (!avaliacao) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <p className="text-xl text-slate-700">Avaliação não encontrada.</p>
         <Link href="/dashboard" legacyBehavior>
            <a className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
              Voltar ao Painel
            </a>
          </Link>
      </div>
    );
  }

  const cardClasses = "bg-white p-6 rounded-lg shadow-lg mb-6";
  const cardTitleClasses = "text-xl font-semibold text-gray-700 mb-3 pb-2 border-b border-gray-200";
  const listItemClasses = "text-gray-600 mb-1 ml-4 list-disc";
  const paragraphClasses = "text-gray-600 leading-relaxed whitespace-pre-wrap";
  const detailItemClasses = "text-gray-700 mb-2";
  const detailLabelClasses = "font-semibold text-gray-800";


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-sky-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <header className="mb-8">
            <Link href="/dashboard" legacyBehavior>
                <a className="text-blue-600 hover:text-blue-800 hover:underline inline-flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Voltar ao Painel
                </a>
            </Link>
          <h1 className="mt-4 text-3xl font-bold text-slate-800 text-center">
            Detalhes da Avaliação
          </h1>
           {avaliacao.remoteJid && (
             <p className="text-md text-slate-600 mt-1 text-center">
              Cliente: <span className="font-medium">{avaliacao.remoteJid.split('@')[0]}</span>
            </p>
          )}
           <p className="text-sm text-slate-500 mt-1 text-center">
            ID da Avaliação: {avaliacao.id}
          </p>
           <p className="text-sm text-slate-500 mt-1 text-center">
            Registrada em: {new Date(avaliacao.createdAt).toLocaleString('pt-BR')}
          </p>
        </header>

        <div className={cardClasses}>
          <h2 className={cardTitleClasses}>Nota do Cliente</h2>
          <p className="text-3xl font-bold text-blue-600 text-center py-3">
            {avaliacao.nota_cliente} <span className="text-xl text-gray-500">/ 10</span>
          </p>
        </div>

         <div className="grid md:grid-cols-2 gap-6">
            <div className={cardClasses}>
                <h2 className={cardTitleClasses}>Pontos Fortes</h2>
                {(avaliacao.pontos_fortes && avaliacao.pontos_fortes.length > 0) ? (
                <ul>
                    {(avaliacao.pontos_fortes || []).map((ponto, index) => (
                    <li key={`forte-${index}`} className={listItemClasses}>{ponto}</li>
                    ))}
                </ul>
                ) : (
                <p className={paragraphClasses}>Nenhum ponto forte informado.</p>
                )}
            </div>

            <div className={cardClasses}>
                <h2 className={cardTitleClasses}>Pontos Fracos</h2>
                {(avaliacao.pontos_fracos && avaliacao.pontos_fracos.length > 0) ? (
                <ul>
                    {(avaliacao.pontos_fracos || []).map((ponto, index) => (
                    <li key={`fraco-${index}`} className={listItemClasses}>{ponto}</li>
                    ))}
                </ul>
                ) : (
                <p className={paragraphClasses}>Nenhum ponto fraco informado.</p>
                )}
            </div>
        </div>


        <div className={cardClasses}>
          <h2 className={cardTitleClasses}>Métricas de Atendimento</h2>
           <div className="space-y-2">
            <p className={detailItemClasses}>
              <span className={detailLabelClasses}>Tempo de Resposta:</span> {avaliacao.tempo_resposta || 'Não informado'}
            </p>
            <p className={detailItemClasses}>
              <span className={detailLabelClasses}>Clareza na Comunicação:</span> {avaliacao.clareza_comunicacao || 'Não informado'}
            </p>
            <p className={detailItemClasses}>
              <span className={detailLabelClasses}>Resolução do Problema:</span> {avaliacao.resolucao_problema || 'Não informado'}
            </p>
          </div>
        </div>

        <div className={cardClasses}>
          <h2 className={cardTitleClasses}>Sugestões de Melhoria</h2>
          {(avaliacao.sugestoes_melhoria && avaliacao.sugestoes_melhoria.length > 0) ? (
            <ul>
              {(avaliacao.sugestoes_melhoria || []).map((sugestao, index) => (
                <li key={`sugestao-${index}`} className={listItemClasses}>{sugestao}</li>
              ))}
            </ul>
          ) : (
            <p className={paragraphClasses}>Nenhuma sugestão de melhoria informada.</p>
          )}
        </div>

        <div className={cardClasses}>
          <h2 className={cardTitleClasses}>Resumo do Atendimento</h2>
          <p className={paragraphClasses}>{avaliacao.resumo_atendimento || 'Resumo não disponível.'}</p>
        </div>
      </div>
    </div>
  );
}