// app/api/all-data/[apiKeyPath]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

interface RouteContext {
  params: {
    apiKeyPath?: string; // User.webhookApiKey (dono da loja)
  };
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { params } = context;
    const apiKeyPath = params.apiKeyPath;

    if (!apiKeyPath) {
      return NextResponse.json(
        { message: 'API Key path (webhookApiKey do usuário) é obrigatório na URL.' },
        { status: 400 }
      );
    }

    const { searchParams } = request.nextUrl;
    const startDateParam = searchParams.get('startDate');
    const endDateParam = searchParams.get('endDate');

    let dateFilterAvaliacoes = {};
    let dateFilterChatInteractions = {};

    if (startDateParam) {
      const startDate = new Date(startDateParam);
      if (!isNaN(startDate.getTime())) {
        dateFilterAvaliacoes = { ...dateFilterAvaliacoes, createdAt: { ...((dateFilterAvaliacoes as any).createdAt), gte: startDate } };
        dateFilterChatInteractions = { ...dateFilterChatInteractions, eventTimestamp: { ...((dateFilterChatInteractions as any).eventTimestamp), gte: startDate } };
      } else {
        return NextResponse.json({ message: 'Formato de startDate inválido. Use YYYY-MM-DD ou um formato de data ISO válido.' }, { status: 400 });
      }
    }

    if (endDateParam) {
      const endDate = new Date(endDateParam);
      if (!isNaN(endDate.getTime())) {
        // Para incluir o dia final, ajustamos para o final do dia
        endDate.setHours(23, 59, 59, 999);
        dateFilterAvaliacoes = { ...dateFilterAvaliacoes, createdAt: { ...((dateFilterAvaliacoes as any).createdAt), lte: endDate } };
        dateFilterChatInteractions = { ...dateFilterChatInteractions, eventTimestamp: { ...((dateFilterChatInteractions as any).eventTimestamp), lte: endDate } };
      } else {
        return NextResponse.json({ message: 'Formato de endDate inválido. Use YYYY-MM-DD ou um formato de data ISO válido.' }, { status: 400 });
      }
    }

    const userWithData = await prisma.user.findUnique({
      where: { webhookApiKey: apiKeyPath },
      select: {
        id: true,
        name: true,
        email: true,
        webhookApiKey: true,
        instanceName: true,
        // Avaliações e interações de chat diretamente ligadas ao dono da loja
        avaliacoes: {
          where: dateFilterAvaliacoes, // Aplicar filtro de data
          orderBy: { createdAt: 'desc' }
        },
        chatInteractions: {
          where: dateFilterChatInteractions, // Aplicar filtro de data
          orderBy: { eventTimestamp: 'desc' }
        },
        // Dados dos vendedores associados a este dono de loja
        sellers: {
          select: {
            id: true,
            name: true,
            evolutionInstanceName: true,
            sellerWhatsAppNumber: true,
            isActive: true,
            // Avaliações e interações de chat específicas de cada vendedor
            avaliacoes: {
              where: dateFilterAvaliacoes, // Aplicar filtro de data
              orderBy: { createdAt: 'desc' }
            },
            chatInteractions: {
              where: dateFilterChatInteractions, // Aplicar filtro de data
              orderBy: { eventTimestamp: 'desc' }
            }
          },
          orderBy: { name: 'asc' }
        }
      }
    });

    if (!userWithData) {
      return NextResponse.json(
        { message: 'Usuário não encontrado com a Webhook API Key fornecida.' },
        { status: 404 }
      );
    }

    return NextResponse.json(userWithData, { status: 200 });

  } catch (error) {
    console.error('Erro ao buscar todos os dados (GET /api/all-data/[apiKeyPath]):', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido ao buscar dados.';
    return NextResponse.json(
      { message: 'Erro interno do servidor ao buscar dados.', error: errorMessage },
      { status: 500 }
    );
  }
}