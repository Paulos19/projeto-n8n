import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/auth';
import { isAdmin } from '@/lib/auth-utils';
import prisma from '@/lib/prisma';

/**
 * GET /api/admin/avaliacoes
 * Retorna uma lista de todas as avaliações da plataforma para o administrador.
 */
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!isAdmin(session)) {
    return NextResponse.json({ message: 'Acesso negado.' }, { status: 403 });
  }

  try {
    const avaliacoes = await prisma.avaliacao.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      // Inclui dados do dono e do vendedor para contextualizar
      include: {
        user: {
          select: { name: true, email: true },
        },
        seller: {
            select: { name: true }
        }
      },
    });

    return NextResponse.json(avaliacoes);
  } catch (error) {
    console.error('Erro ao buscar todas as avaliações para o painel de admin:', error);
    return NextResponse.json({ message: 'Erro interno do servidor.' }, { status: 500 });
  }
}
