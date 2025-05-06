// app/dashboard/page.tsx
'use client';

import { useEffect, useState } from 'react';
// Importa a interface do arquivo da API para manter consistência
import type { AvaliacaoData } from '../api/receber-avaliacao/route';

export default function DashboardPage() {
  const [avaliacao, setAvaliacao] = useState<AvaliacaoData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAvaliacao = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/receber-avaliacao');
      if (!response.ok) {
        if (response.status === 404) {
          setAvaliacao(null);
        } else {
          const errorData = await response.json().catch(() => ({ message: `Falha ao buscar dados: ${response.statusText}` }));
          throw new Error(errorData.message || `Falha ao buscar dados: ${response.statusText}`);
        }
      } else {
        const data: AvaliacaoData = await response.json();
        console.log("Dados da avaliação recebidos no frontend:", data);
        setAvaliacao(data);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ocorreu um erro desconhecido.';
      setError(errorMessage);
      console.error("Erro ao buscar avaliação:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAvaliacao();
    // Para atualizações automáticas, considere WebSockets ou Server-Sent Events em vez de polling para produção.
    // const intervalId = setInterval(fetchAvaliacao, 15000); // Ex: a cada 15 segundos
    // return () => clearInterval(intervalId);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-lg shadow-xl text-center">
          <p className="text-xl text-gray-700">Carregando avaliação...</p>
          {/* Você pode adicionar um spinner aqui */}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-lg shadow-xl text-center max-w-md">
          <p className="text-xl text-red-600 mb-4">Erro ao carregar avaliação:</p>
          <p className="text-gray-700 mb-6">{error}</p>
          <button
            onClick={fetchAvaliacao}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  if (!avaliacao) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-lg shadow-xl text-center">
          <p className="text-xl text-gray-700 mb-6">Nenhuma avaliação recebida ainda.</p>
          <button
            onClick={fetchAvaliacao}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Verificar Novamente
          </button>
        </div>
      </div>
    );
  }

  const cardClasses = "bg-white p-6 rounded-lg shadow-lg mb-6";
  const cardTitleClasses = "text-2xl font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200";
  const listItemClasses = "text-gray-700 mb-1 ml-5 list-disc";
  const paragraphClasses = "text-gray-700 leading-relaxed whitespace-pre-wrap";
  const detailItemClasses = "text-gray-700 mb-2";
  const detailLabelClasses = "font-semibold text-gray-800";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-sky-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <header className="mb-10 text-center">
          <h1 className="text-4xl font-bold text-slate-800">
            Detalhes da Última Avaliação de Atendimento
          </h1>
          {avaliacao.remoteJid && (
             <p className="text-md text-slate-600 mt-2">
              Cliente: <span className="font-medium">{avaliacao.remoteJid.split('@')[0]}</span>
            </p>
          )}
        </header>

        <div className={cardClasses}>
          <h2 className={cardTitleClasses}>Nota do Cliente</h2>
          <p className="text-4xl font-bold text-blue-600 text-center py-4">
            {avaliacao.nota_cliente} <span className="text-2xl text-gray-500">/ 10</span>
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className={cardClasses}>
            <h2 className={cardTitleClasses}>Pontos Fortes</h2>
            {(avaliacao.pontos_fortes && avaliacao.pontos_fortes.length > 0) ? (
              <ul className="space-y-1">
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
              <ul className="space-y-1">
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
            <ul className="space-y-1">
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

        <div className="mt-8 text-center">
          <button
            onClick={fetchAvaliacao}
            className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-all duration-150 ease-in-out"
          >
            Atualizar Avaliação
          </button>
        </div>
      </div>
    </div>
  );
}