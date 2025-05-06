// app/api/receber-avaliacao/route.ts
import { NextRequest, NextResponse } from 'next/server';

// Interface para tipar os dados da avaliação
export interface AvaliacaoData {
  nota_cliente: number;
  pontos_fortes: string[];
  pontos_fracos: string[];
  tempo_resposta: string;
  clareza_comunicacao: string;
  resolucao_problema: string;
  sugestoes_melhoria: string[];
  resumo_atendimento: string;
  remoteJid?: string; // Opcional, caso você envie
}

// Em um aplicativo real, você armazenaria isso em um banco de dados.
// Para este exemplo, usamos uma variável em memória.
let ultimaAvaliacaoRecebida: AvaliacaoData | null = null;

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    console.log('Dados da avaliação recebidos pela API:', data);

    // Validação básica para garantir que os campos de array existam
    // O N8N já deve estar garantindo isso com o nó "Formatar Formulário" atualizado
    const validatedData: AvaliacaoData = {
      ...data,
      pontos_fortes: Array.isArray(data.pontos_fortes) ? data.pontos_fortes : [],
      pontos_fracos: Array.isArray(data.pontos_fracos) ? data.pontos_fracos : [],
      sugestoes_melhoria: Array.isArray(data.sugestoes_melhoria) ? data.sugestoes_melhoria : [],
    };

    ultimaAvaliacaoRecebida = validatedData;

    return NextResponse.json({ message: 'Dados recebidos com sucesso!', dataRecebida: validatedData }, { status: 200 });
  } catch (error) {
    console.error('Erro ao processar a requisição POST:', error);
    let errorMessage = 'Erro desconhecido ao processar dados.';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    // Adicionar mais detalhes ao log se for um erro de parsing de JSON
    if (error instanceof SyntaxError && request.body) {
        try {
            const rawBody = await (request as any).text(); // Tenta ler o corpo como texto
            console.error("Corpo da requisição que causou o erro de parsing:", rawBody);
        } catch (e) {
            console.error("Não foi possível ler o corpo da requisição como texto.");
        }
    }
    return NextResponse.json({ message: 'Erro ao receber dados', error: errorMessage }, { status: 400 });
  }
}

export async function GET(request: NextRequest) {
  if (ultimaAvaliacaoRecebida) {
    return NextResponse.json(ultimaAvaliacaoRecebida, { status: 200 });
  } else {
    return NextResponse.json({ message: 'Nenhuma avaliação disponível ainda.' }, { status: 404 });
  }
}