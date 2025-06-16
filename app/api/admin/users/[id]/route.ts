import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/auth';
import { isAdmin } from '@/lib/auth-utils';
import prisma from '@/lib/prisma';

interface RouteContext {
  params: {
    id: string;
  };
}

/**
 * GET /api/admin/users/[id]
 * Retorna os dados de um usuário específico para o admin.
 */
export async function GET(request: NextRequest, { params }: RouteContext) {
  const session = await getServerSession(authOptions);

  if (!isAdmin(session)) {
    return NextResponse.json({ message: 'Acesso negado.' }, { status: 403 });
  }
  
  try {
    const user = await prisma.user.findUnique({
      where: { id: params.id },
       // Seleciona apenas os campos seguros
      select: {
        id: true,
        name: true,
        email: true,
        identifier: true,
        role: true,
      }
    });

    if (!user) {
      return NextResponse.json({ message: 'Usuário não encontrado.' }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error(`Erro ao buscar usuário ${params.id}:`, error);
    return NextResponse.json({ message: 'Erro interno do servidor.' }, { status: 500 });
  }
}


/**
 * PATCH /api/admin/users/[id]
 * Atualiza os dados de um usuário específico.
 */
export async function PATCH(request: NextRequest, { params }: RouteContext) {
    const session = await getServerSession(authOptions);

    if (!isAdmin(session)) {
        return NextResponse.json({ message: 'Acesso negado.' }, { status: 403 });
    }

    const { id } = params;
    
    try {
        const body = await request.json();
        const { name, email, identifier, role } = body;

        // Impede que um admin remova a própria role de ADMIN
        if (session?.user?.id === id && role && role !== 'ADMIN') {
            return NextResponse.json({ message: 'Não é possível remover a própria permissão de administrador.' }, { status: 400 });
        }

        const updatedUser = await prisma.user.update({
            where: { id },
            data: { name, email, identifier, role },
        });

        const { passwordHash, ...safeUser } = updatedUser;
        return NextResponse.json(safeUser, { status: 200 });

    } catch (error: any) {
        console.error(`Erro ao atualizar usuário ${id}:`, error);
        if (error.code === 'P2002') {
             return NextResponse.json({ message: `O campo '${error.meta.target}' já está em uso.` }, { status: 409 });
        }
        return NextResponse.json({ message: 'Erro interno do servidor ao atualizar usuário.' }, { status: 500 });
    }
}


/**
 * DELETE /api/admin/users/[id]
 * Deleta um usuário específico.
 */
export async function DELETE(request: NextRequest, { params }: RouteContext) {
  const session = await getServerSession(authOptions);

  if (!isAdmin(session)) {
    return NextResponse.json({ message: 'Acesso negado.' }, { status: 403 });
  }

  const { id } = params;

  if (session?.user?.id === id) {
    return NextResponse.json({ message: 'Não é possível deletar a própria conta de administrador.' }, { status: 400 });
  }

  try {
    await prisma.user.delete({
      where: { id },
    });
    return NextResponse.json({ message: 'Usuário deletado com sucesso.' }, { status: 200 });
  } catch (error) {
    console.error(`Erro ao deletar usuário ${id}:`, error);
    return NextResponse.json({ message: 'Erro interno do servidor ao deletar usuário.' }, { status: 500 });
  }
}
