import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/auth'; // Certifique-se que o caminho para authOptions está correto

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await request.json();
    const { name, email } = body;

    if (!name && !email) {
      return NextResponse.json({ message: 'Nenhum dado fornecido para atualização.' }, { status: 400 });
    }

    const dataToUpdate: { name?: string; email?: string } = {};
    if (name) {
      dataToUpdate.name = name;
    }
    if (email) {
      // Validação básica de email (pode ser mais robusta)
      if (!/\S+@\S+\.\S+/.test(email)) {
        return NextResponse.json({ message: 'Formato de email inválido.' }, { status: 400 });
      }
      // Opcional: Verificar se o novo email já está em uso por outro usuário
      const existingUserWithEmail = await prisma.user.findFirst({
        where: {
          email: email,
          NOT: {
            id: userId,
          },
        },
      });
      if (existingUserWithEmail) {
        return NextResponse.json({ message: 'Este email já está em uso por outra conta.' }, { status: 409 });
      }
      dataToUpdate.email = email;
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: dataToUpdate,
      select: { id: true, name: true, email: true, webhookApiKey: true }, // Retorna os dados atualizados
    });

    return NextResponse.json({ message: 'Configurações atualizadas com sucesso!', user: updatedUser }, { status: 200 });

  } catch (error) {
    console.error('Erro ao atualizar configurações do usuário:', error);
    const errorMessage = error instanceof Error ? error.message : 'Ocorreu um erro desconhecido.';
    return NextResponse.json({ message: 'Erro interno do servidor.', error: errorMessage }, { status: 500 });
  }
}