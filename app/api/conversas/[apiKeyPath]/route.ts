// app/api/conversas/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";

interface N8nMessagePayload {
  remoteJid: string;
  chat_history: Array<{ // Este é o campo que corresponde ao seu parâmetro n8n
    sender: string;
    senderName: string;
    text: string;
    timestamp: number;
    messageType: string;
    fromMe: boolean;
  }>;
  analysis: {
    summary: string;
    keywords: string[];
  };
  customer: {
    name: string;
    number: string; // Same as remoteJid
  };
  timestamp: string; // ISO 8601 date string
}

interface RouteContext {
  params: {
    apiKeyPath?: string;
  };
}

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { params } = context;
    const apiKeyPath = params.apiKeyPath;

    if (!apiKeyPath) {
      return NextResponse.json({ message: "API Key path é obrigatório na URL." }, { status: 400 });
    }

    const payloadArray: N8nMessagePayload[] = await request.json();

    if (!Array.isArray(payloadArray) || payloadArray.length === 0) {
      return NextResponse.json(
        { message: 'Corpo da requisição inválido: um array de mensagens é esperado.' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { webhookApiKey: apiKeyPath },
    });

    if (!user) {
      return NextResponse.json({ message: "Webhook API Key (path) inválida ou usuário não encontrado." }, { status: 403 });
    }

    const results = [];

    for (const item of payloadArray) {
      if (!item.remoteJid || !item.chat_history || !item.analysis || !item.customer || !item.timestamp) {
        results.push({ success: false, message: 'Item inválido, dados faltando.', item });
        continue;
      }

      const dataToSave = {
        remoteJid: item.remoteJid,
        customerName: item.customer.name,
        chatHistory: item.chat_history as any,
        analysisSummary: item.analysis.summary,
        analysisKeywords: item.analysis.keywords,
        eventTimestamp: new Date(item.timestamp),
        userId: user.id,
      };

      const newInteraction = await prisma.chatInteraction.create({
        data: dataToSave,
      });
      results.push({ success: true, data: newInteraction });
    }

    const allSuccessful = results.every(r => r.success);
    const status = allSuccessful ? 201 : (results.some(r => r.success) ? 207 : 400);

    return NextResponse.json(
      {
        message: allSuccessful ? 'Todas as interações foram salvas com sucesso!' : 'Processamento concluído com alguns erros/avisos.',
        results
      },
      { status }
    );

  } catch (error) {
    let errorMessage = 'Erro desconhecido ao processar dados.';
    if (error instanceof SyntaxError) {
      errorMessage = 'Erro de parsing do JSON. Verifique se o corpo da requisição é um JSON array válido.';
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }
    return NextResponse.json({ message: 'Erro ao salvar interações', error: errorMessage }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Não autorizado' }, { status: 401 });
  }

  try {
    const interactions = await prisma.chatInteraction.findMany({
      where: { userId: session.user.id },
      orderBy: {
        eventTimestamp: 'desc',
      },
    });
    return NextResponse.json(interactions, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Erro ao buscar interações', error: (error as Error).message }, { status: 500 });
  }
}