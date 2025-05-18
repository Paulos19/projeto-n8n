import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

interface RouteContext {
  params: {
    apiKeyPath?: string; 
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

        avaliacoes: {
          where: dateFilterAvaliacoes, 
          orderBy: { createdAt: 'desc' }
        },
        chatInteractions: {
          where: dateFilterChatInteractions, 
          orderBy: { eventTimestamp: 'desc' }
        },

        sellers: {
          select: {
            id: true,
            name: true,
            evolutionInstanceName: true,
            sellerWhatsAppNumber: true,
            isActive: true,

            avaliacoes: {
              where: dateFilterAvaliacoes, 
              orderBy: { createdAt: 'desc' }
            },
            chatInteractions: {
              where: dateFilterChatInteractions, 
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