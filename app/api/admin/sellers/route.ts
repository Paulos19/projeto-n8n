import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/auth';
import { isAdmin } from '@/lib/auth-utils';
import prisma from '@/lib/prisma';

/**
 * GET /api/admin/sellers
 * Retorna uma lista de todos os vendedores de todos os usuários para o administrador.
 */
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);

  // Protege a rota, permitindo acesso apenas para administradores
  if (!isAdmin(session)) {
    return NextResponse.json({ message: 'Acesso negado.' }, { status: 403 });
  }

  try {
    const sellers = await prisma.seller.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      // Inclui os dados do usuário dono do vendedor
      include: {
        storeOwner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(sellers);
  } catch (error) {
    console.error('Erro ao buscar todos os vendedores para o painel de admin:', error);
    return NextResponse.json({ message: 'Erro interno do servidor ao buscar vendedores.' }, { status: 500 });
  }
}
