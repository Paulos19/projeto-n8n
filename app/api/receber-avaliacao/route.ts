// app/api/receber-avaliacao/route.ts
import { NextRequest, NextResponse } from 'next/server';

// Interface para tipar os dados da avaliação (opcional, mas bom para TypeScript)
interface AvaliacaoData {
  nota_cliente: number;
  pontos_fortes: string[];
  pontos_fracos: string[];
  tempo_resposta: string;
  clareza_comunicacao: string;
  resolucao_problema: string;
  sugestoes_melhoria: string[];
  resumo_atendimento: string;
  // Adicione aqui quaisquer outros campos que possam vir do N8N
  remoteJid?: string; // Exemplo, se você também enviar o ID do cliente
}

// Variável para armazenar a última avaliação recebida (em memória - para um exemplo simples)
// Em um aplicativo real, você armazenaria isso em um banco de dados.
let ultimaAvaliacaoRecebida: AvaliacaoData | null = null;

export async function POST(request: NextRequest) {
  try {
    const data: AvaliacaoData = await request.json();
    console.log('Dados da avaliação recebidos:', data);

    // Armazena a avaliação recebida
    ultimaAvaliacaoRecebida = data;

    // Responda ao N8N que os dados foram recebidos com sucesso
    return NextResponse.json({ message: 'Dados recebidos com sucesso!', dataRecebida: data }, { status: 200 });
  } catch (error) {
    console.error('Erro ao processar a requisição:', error);
    let errorMessage = 'Erro desconhecido';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return NextResponse.json({ message: 'Erro ao receber dados', error: errorMessage }, { status: 400 });
  }
}

export async function GET(request: NextRequest) {
  // Endpoint para o frontend buscar a última avaliação
  if (ultimaAvaliacaoRecebida) {
    return NextResponse.json(ultimaAvaliacaoRecebida, { status: 200 });
  } else {
    return NextResponse.json({ message: 'Nenhuma avaliação disponível ainda.' }, { status: 404 });
  }
}