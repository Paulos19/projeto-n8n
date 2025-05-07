// app/api/conversas/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

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

export async function POST(request: NextRequest) {
  try {
    const payloadArray: N8nMessagePayload[] = await request.json();
    console.log('Payload recebido pela API (/api/conversas):', payloadArray);

    if (!Array.isArray(payloadArray) || payloadArray.length === 0) {
      return NextResponse.json(
        { message: 'Corpo da requisição inválido: um array de mensagens é esperado.' },
        { status: 400 }
      );
    }

    const results = [];

    for (const item of payloadArray) {
      // Validação básica para cada item
      if (!item.remoteJid || !item.chat_history || !item.analysis || !item.customer || !item.timestamp) {
        console.warn('Item inválido no payload, pulando:', item);
        results.push({ success: false, message: 'Item inválido, dados faltando.', item });
        continue;
      }

      const dataToSave = {
        remoteJid: item.remoteJid,
        customerName: item.customer.name,
        chatHistory: item.chat_history as any, // Prisma espera Json
        analysisSummary: item.analysis.summary,
        analysisKeywords: item.analysis.keywords,
        eventTimestamp: new Date(item.timestamp),
      };

      const newInteraction = await prisma.chatInteraction.create({
        data: dataToSave,
      });
      results.push({ success: true, data: newInteraction });
      console.log('Nova interação de chat salva no banco:', newInteraction);
    }

    const allSuccessful = results.every(r => r.success);
    const status = allSuccessful ? 201 : (results.some(r => r.success) ? 207 : 400); // 207 Multi-Status if some succeed

    return NextResponse.json(
      { 
        message: allSuccessful ? 'Todas as interações foram salvas com sucesso!' : 'Processamento concluído com alguns erros/avisos.',
        results 
      }, 
      { status }
    );

  } catch (error) {
    console.error('Erro ao processar a requisição POST (/api/conversas):', error);
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
  try {
    const interactions = await prisma.chatInteraction.findMany({
      orderBy: {
        eventTimestamp: 'desc',
      },
    });
    return NextResponse.json(interactions, { status: 200 });
  } catch (error) {
    console.error('Erro ao buscar interações (GET /api/conversas):', error);
    return NextResponse.json({ message: 'Erro ao buscar interações', error: (error as Error).message }, { status: 500 });
  }
}