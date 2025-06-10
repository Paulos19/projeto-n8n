// app/api/trigger-analysis/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/auth';
import prisma from '@/lib/prisma';

// Tipagem para o corpo da requisição que virá do frontend
interface TriggerAnalysisPayload {
  customerJid: string;
  analysisType: 'customer_evaluation' | 'dashboard_summary';
  // Opcional: Podemos passar o ID da interação para referência futura
  interactionId?: string; 
}

/**
 * Esta API é responsável por receber uma solicitação do frontend do R.A.I.O
 * para iniciar um processo de análise de IA no workflow do n8n.
 * Ela atua como um gatilho seguro que substitui o comando manual /authorize_analysis.
 */
export async function POST(request: NextRequest) {
  // 1. Autenticação e Segurança: Verifica se o usuário está logado
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Não autorizado. Faça login para iniciar uma análise.' }, { status: 401 });
  }

  const userId = session.user.id;

  try {
    // 2. Validação da Requisição: Extrai e valida os dados do corpo da requisição
    const body = await request.json() as TriggerAnalysisPayload;
    const { customerJid, analysisType, interactionId } = body;

    if (!customerJid || !analysisType) {
      return NextResponse.json(
        { message: 'Dados insuficientes. É necessário fornecer "customerJid" e "analysisType".' },
        { status: 400 }
      );
    }

    if (analysisType !== 'customer_evaluation' && analysisType !== 'dashboard_summary') {
      return NextResponse.json({ message: 'Tipo de análise inválido.' }, { status: 400 });
    }

    // 3. Obtenção de Dados do Dono da Loja: Busca o usuário no banco para obter a chave do webhook
    const storeOwner = await prisma.user.findUnique({
      where: { id: userId },
      select: { webhookApiKey: true }
    });

    if (!storeOwner || !storeOwner.webhookApiKey) {
      return NextResponse.json({ message: 'Não foi possível encontrar a chave de API para este usuário.' }, { status: 404 });
    }

    // 4. Construção do Payload para o n8n: Cria um objeto JSON claro para o n8n processar.
    // Usamos um 'triggerSource' para diferenciar esta chamada de uma mensagem normal do WhatsApp.
    const n8nPayload = {
      triggerSource: "RAIO_DASHBOARD_BUTTON",
      storeOwnerApiKey: storeOwner.webhookApiKey, // A chave que identifica o dono da loja
      customerJid: customerJid,
      analysisType: analysisType,
      interactionId: interactionId, // Passa o ID da interação se disponível
      triggeredByUserId: userId,
      timestamp: new Date().toISOString()
    };
    
    // IMPORTANTE: Substitua pela URL do seu webhook principal do n8n
    const n8nWebhookUrl = 'https://n8n-n8n.go8xn6.easypanel.host/webhook/avaliacao-atendimento-webhook';
    
    console.log(`Disparando webhook para n8n: ${n8nWebhookUrl} com o payload:`, JSON.stringify(n8nPayload, null, 2));

    // 5. Chamada para o Webhook do n8n: Envia os dados para o workflow iniciar o processo.
    const n8nResponse = await fetch(n8nWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(n8nPayload),
    });

    // 6. Resposta ao Frontend: Informa ao frontend se a solicitação foi enviada com sucesso ao n8n.
    if (!n8nResponse.ok) {
      console.error('Erro na resposta do webhook do n8n:', await n8nResponse.text());
      return NextResponse.json({ message: 'Ocorreu um erro ao disparar o workflow de análise.' }, { status: 502 });
    }

    return NextResponse.json({ message: `Análise do tipo "${analysisType}" para o cliente ${customerJid} foi iniciada com sucesso.` }, { status: 202 });

  } catch (error) {
    console.error('Erro na API /api/trigger-analysis:', error);
    if (error instanceof SyntaxError) {
      return NextResponse.json({ message: 'Erro de sintaxe no JSON recebido.' }, { status: 400 });
    }
    return NextResponse.json({ message: 'Erro interno do servidor ao iniciar análise.' }, { status: 500 });
  }
}
