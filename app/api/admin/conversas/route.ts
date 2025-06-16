import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/auth';
import { isAdmin } from '@/lib/auth-utils';
import prisma from '@/lib/prisma';

/**
 * GET /api/admin/conversas
 * Retorna uma lista de todas as interações de chat da plataforma para o administrador.
 */
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!isAdmin(session)) {
    return NextResponse.json({ message: 'Acesso negado.' }, { status: 403 });
  }

  try {
    const conversas = await prisma.chatInteraction.findMany({
      orderBy: {
        eventTimestamp: 'desc',
      },
      // Inclui dados do dono e do vendedor
      select: {
        id: true,
        remoteJid: true,
        customerName: true,
        eventTimestamp: true,
        analysisSummary: true,
        user: {
          select: { name: true, email: true },
        },
        seller: {
            select: { name: true }
        }
      },
      take: 100, // Limita a busca inicial para performance
    });

    return NextResponse.json(conversas);
  } catch (error) {
    console.error('Erro ao buscar todas as conversas para o painel de admin:', error);
    return NextResponse.json({ message: 'Erro interno do servidor.' }, { status: 500 });
  }
}
