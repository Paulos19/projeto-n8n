// app/dashboard/page.tsx
'use client'; // Indica que este é um Client Component

import { useEffect, useState } from 'react';

// Interface para os dados da avaliação (consistente com a API)
interface AvaliacaoData {
  nota_cliente: number;
  pontos_fortes: string[];
  pontos_fracos: string[];
  tempo_resposta: string;
  clareza_comunicacao: string;
  resolucao_problema: string;
  sugestoes_melhoria: string[];
  resumo_atendimento: string;
  remoteJid?: string;
}

export default function DashboardPage() {
  const [avaliacao, setAvaliacao] = useState<AvaliacaoData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAvaliacao = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/receber-avaliacao'); // Chama o endpoint GET
      if (!response.ok) {
        if (response.status === 404) {
          setAvaliacao(null); // Nenhuma avaliação ainda
        } else {
          throw new Error(`Falha ao buscar dados: ${response.statusText}`);
        }
      } else {
        const data: AvaliacaoData = await response.json();
        setAvaliacao(data);
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Ocorreu um erro desconhecido.');
      }
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAvaliacao();

    // Opcional: configurar um intervalo para buscar novas avaliações periodicamente
    // const intervalId = setInterval(fetchAvaliacao, 10000); // A cada 10 segundos
    // return () => clearInterval(intervalId); // Limpa o intervalo ao desmontar o componente
  }, []);

  if (isLoading) {
    return <div><p>Carregando avaliação...</p></div>;
  }

  if (error) {
    return <div><p>Erro ao carregar avaliação: {error}</p></div>;
  }

  if (!avaliacao) {
    return (
      <div>
        <p>Nenhuma avaliação recebida ainda.</p>
        <button onClick={fetchAvaliacao}>Tentar Novamente</button>
      </div>
    );
  }

  // Estilos básicos (você pode usar Tailwind CSS ou styled-components para algo mais robusto)
  const styles: { [key: string]: React.CSSProperties } = {
    container: { fontFamily: 'Arial, sans-serif', padding: '20px', maxWidth: '800px', margin: '0 auto' },
    header: { fontSize: '24px', fontWeight: 'bold', marginBottom: '20px', color: '#333' },
    card: { border: '1px solid #ddd', borderRadius: '8px', padding: '15px', marginBottom: '15px', backgroundColor: '#f9f9f9' },
    cardTitle: { fontSize: '18px', fontWeight: 'bold', marginBottom: '10px', color: '#555' },
    listItem: { marginBottom: '5px', listStyleType: 'disc', marginLeft: '20px' },
    paragraph: { lineHeight: '1.6' },
    button: { padding: '10px 15px', backgroundColor: '#0070f3', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', marginTop: '10px' },
    errorText: { color: 'red' },
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>Detalhes da Última Avaliação de Atendimento</h1>
      {avaliacao.remoteJid && <p><strong>ID do Cliente:</strong> {avaliacao.remoteJid}</p>}

      <div style={styles.card}>
        <h2 style={styles.cardTitle}>Nota do Cliente: {avaliacao.nota_cliente}/10</h2>
      </div>

      <div style={styles.card}>
        <h2 style={styles.cardTitle}>Pontos Fortes:</h2>
        <ul>
          {avaliacao.pontos_fortes.map((ponto, index) => (
            <li key={`forte-${index}`} style={styles.listItem}>{ponto}</li>
          ))}
        </ul>
      </div>

      <div style={styles.card}>
        <h2 style={styles.cardTitle}>Pontos Fracos:</h2>
        <ul>
          {avaliacao.pontos_fracos.map((ponto, index) => (
            <li key={`fraco-${index}`} style={styles.listItem}>{ponto}</li>
          ))}
        </ul>
      </div>

      <div style={styles.card}>
        <h2 style={styles.cardTitle}>Detalhes Adicionais:</h2>
        <p><strong>Tempo de Resposta:</strong> {avaliacao.tempo_resposta}</p>
        <p><strong>Clareza na Comunicação:</strong> {avaliacao.clareza_comunicacao}</p>
        <p><strong>Resolução do Problema:</strong> {avaliacao.resolucao_problema}</p>
      </div>

      <div style={styles.card}>
        <h2 style={styles.cardTitle}>Sugestões de Melhoria:</h2>
        <ul>
          {avaliacao.sugestoes_melhoria.map((sugestao, index) => (
            <li key={`sugestao-${index}`} style={styles.listItem}>{sugestao}</li>
          ))}
        </ul>
      </div>

      <div style={styles.card}>
        <h2 style={styles.cardTitle}>Resumo do Atendimento:</h2>
        <p style={styles.paragraph}>{avaliacao.resumo_atendimento}</p>
      </div>

      <button onClick={fetchAvaliacao} style={styles.button}>Atualizar Avaliação</button>
    </div>
  );
}