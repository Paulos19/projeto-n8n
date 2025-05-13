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
          orderBy: { createdAt: 'desc' }
        },
        chatInteractions: {
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
              orderBy: { createdAt: 'desc' }
            },
            chatInteractions: {
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