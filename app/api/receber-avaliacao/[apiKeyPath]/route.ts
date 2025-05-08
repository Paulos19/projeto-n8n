// app/api/receber-avaliacao/[apiKeyPath]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";

// A interface pode ser movida para um arquivo de tipos compartilhado
// O campo webhookApiKey não é mais necessário aqui, pois virá do path
export interface AvaliacaoPayload {
  nota_cliente: number;
  pontos_fortes: string[];
  pontos_fracos: string[];
  tempo_resposta: string;
  clareza_comunicacao: string;
  resolucao_problema: string;
  sugestoes_melhoria: string[];
  resumo_atendimento: string;
  remoteJid?: string | null;
}

interface RouteContext {
  params: {
    apiKeyPath?: string; // O path dinâmico da URL
  };
}

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { params } = context;
    const apiKeyPath = params.apiKeyPath;

    if (!apiKeyPath) {
      return NextResponse.json(
        { message: 'API Key path é obrigatório na URL.' },
        { status: 400 }
      );
    }

    const requestBody = await request.json();
    console.log('Corpo da requisição recebido pela API (POST /api/receber-avaliacao/[apiKeyPath]):', requestBody);

    if (!requestBody.text || typeof requestBody.text !== 'string') {
      return NextResponse.json(
        { message: 'Corpo da requisição inválido: campo "text" contendo a string JSON é esperado.' },
        { status: 400 }
      );
    }

    const formularioString: string = requestBody.text;
    // A interface AvaliacaoPayload não espera mais webhookApiKey, pois ela vem do path
    const parsedDataFromN8N: AvaliacaoPayload = JSON.parse(formularioString); 
    console.log('Dados do formulário (após parse do campo "text"):', parsedDataFromN8N);

    // Valida o apiKeyPath (que é a webhookApiKey)
    const user = await prisma.user.findUnique({
      where: { webhookApiKey: apiKeyPath }, // Usa o apiKeyPath para encontrar o usuário
    });

    if (!user) {
      return NextResponse.json(
        { message: 'Webhook API Key (path) inválida ou usuário não encontrado.' },
        { status: 403 }
      );
    }

    // Preparar dados para o Prisma
    const dataToSave = {
      nota_cliente: Number(parsedDataFromN8N.nota_cliente) || 0,
      pontos_fortes: Array.isArray(parsedDataFromN8N.pontos_fortes) ? parsedDataFromN8N.pontos_fortes : [],
      pontos_fracos: Array.isArray(parsedDataFromN8N.pontos_fracos) ? parsedDataFromN8N.pontos_fracos : [],
      tempo_resposta: String(parsedDataFromN8N.tempo_resposta || "Não informado"),
      clareza_comunicacao: String(parsedDataFromN8N.clareza_comunicacao || "Não informado"),
      resolucao_problema: String(parsedDataFromN8N.resolucao_problema || "Não informado"),
      sugestoes_melhoria: Array.isArray(parsedDataFromN8N.sugestoes_melhoria) ? parsedDataFromN8N.sugestoes_melhoria : [],
      resumo_atendimento: String(parsedDataFromN8N.resumo_atendimento || "Não informado"),
      remoteJid: parsedDataFromN8N.remoteJid || null,
      userId: user.id, // Associa ao usuário encontrado
    };

    const novaAvaliacao = await prisma.avaliacao.create({
      data: dataToSave,
    });

    console.log('Nova avaliação salva no banco:', novaAvaliacao);

    return NextResponse.json({ message: 'Avaliação recebida e salva com sucesso!', data: novaAvaliacao }, { status: 201 });

  } catch (error) {
    console.error('Erro ao processar a requisição POST (/api/receber-avaliacao/[apiKeyPath]):', error);
    let errorMessage = 'Erro desconhecido ao processar dados.';
     if (error instanceof SyntaxError) {
      errorMessage = 'Erro de parsing do JSON no campo "text". Verifique se a string JSON é válida.';
      try {
        // Tenta logar o corpo bruto se o parsing inicial falhar
        const rawBodyForErrorLog = await request.text(); // request.text() só pode ser chamado uma vez
        console.error("Corpo da requisição (string) que causou o erro de parsing:", rawBodyForErrorLog);
      } catch (e) {
        console.error("Não foi possível ler o corpo da requisição como texto para log de erro.");
      }
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }
    return NextResponse.json({ message: 'Erro ao salvar avaliação', error: errorMessage }, { status: 500 });
  }
}

// GET para buscar todas as avaliações (para o painel de admin do usuário logado)
// Esta função GET permanece como estava, pois ela é para o usuário logado no dashboard
// e não depende do apiKeyPath.
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Não autorizado' }, { status: 401 });
  }

  try {
    const avaliacoes = await prisma.avaliacao.findMany({
      where: { userId: session.user.id },
      orderBy: {
        createdAt: 'desc',
      },
    });
    return NextResponse.json(avaliacoes, { status: 200 });
  } catch (error) {
    console.error('Erro ao buscar avaliações (GET /api/receber-avaliacao/[apiKeyPath] - para usuário logado):', error);
    return NextResponse.json({ message: 'Erro ao buscar avaliações', error: (error as Error).message }, { status: 500 });
  }
}