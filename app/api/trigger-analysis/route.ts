// app/api/trigger-analysis/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/auth';

interface TriggerAnalysisPayload {
  analysisType: 'customer_evaluation' | 'dashboard_summary';
  targetId: string; // JID do cliente ou ID da avaliação
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Não autorizado' }, { status: 401 });
  }

  try {
    const body = await request.json() as TriggerAnalysisPayload;
    const { analysisType, targetId } = body;

    if (!analysisType || !targetId) {
      return NextResponse.json(
        { message: 'Dados insuficientes. "analysisType" e "targetId" são necessários.' },
        { status: 400 }
      );
    }
    
    // **NOVO PAYLOAD PARA O N8N**
    // Adicionamos 'triggerSource' para identificação e os dados necessários já parseados.
    const n8nPayload = {
        triggerSource: "RAIO_DASHBOARD_API",
        commandData: {
            targetId: targetId,
            analysisType: analysisType
        }
    };
    
    const n8nWebhookUrl = 'https://n8n-n8n.go8xn6.easypanel.host/webhook/avaliacao-atendimento-webhook';
    
    console.log(`Disparando webhook para N8N com payload identificado:`, JSON.stringify(n8nPayload, null, 2));

    const n8nResponse = await fetch(n8nWebhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(n8nPayload),
    });

    if (!n8nResponse.ok) {
      const errorText = await n8nResponse.text();
      console.error('Erro na resposta do webhook do n8n:', errorText);
      return NextResponse.json({ message: 'Ocorreu um erro ao disparar o workflow de análise.' }, { status: 502 });
    }

    return NextResponse.json({ message: `Análise do tipo "${analysisType}" para o alvo ${targetId} foi iniciada com sucesso.` }, { status: 202 });

  } catch (error) {
    console.error('Erro na API /api/trigger-analysis:', error);
    return NextResponse.json({ message: 'Erro interno do servidor ao iniciar análise.' }, { status: 500 });
  }
}