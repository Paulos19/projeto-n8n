import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/auth';
import { isAdmin } from '@/lib/auth-utils';
import prisma from '@/lib/prisma';

/**
 * GET /api/admin/users
 * Retorna uma lista de todos os usuários para o administrador.
 */
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);

  // Verifica se o usuário é um administrador
  if (!isAdmin(session)) {
    return NextResponse.json({ message: 'Acesso negado. Apenas administradores podem visualizar todos os usuários.' }, { status: 403 });
  }

  try {
    const users = await prisma.user.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      // Seleciona os campos para evitar expor dados sensíveis como o hash da senha
      select: {
        id: true,
        name: true,
        email: true,
        identifier: true,
        role: true,
        createdAt: true,
        _count: {
          select: { sellers: true, avaliacoes: true },
        },
      },
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error('Erro ao buscar usuários para o painel de admin:', error);
    return NextResponse.json({ message: 'Erro interno do servidor ao buscar usuários.' }, { status: 500 });
  }
}
