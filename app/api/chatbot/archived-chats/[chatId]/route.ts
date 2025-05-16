import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/auth';
import prisma from '@/lib/prisma';

interface RouteParams {
  params: {
    chatId: string;
  };
}

// DELETE: Deletar um chat arquivado específico
export async function DELETE(request: Request, { params }: RouteParams) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Não autorizado' }, { status: 401 });
  }
  const userId = session.user.id;
  const { chatId } = params;

  if (!chatId) {
    return NextResponse.json({ message: 'ID do chat não fornecido' }, { status: 400 });
  }

  try {
    const chatToDelete = await prisma.chatbotArchivedChat.findUnique({
      where: { id: chatId },
    });

    if (!chatToDelete) {
      return NextResponse.json({ message: 'Chat arquivado não encontrado' }, { status: 404 });
    }

    if (chatToDelete.userId !== userId) {
      return NextResponse.json({ message: 'Não autorizado a deletar este chat' }, { status: 403 });
    }

    await prisma.chatbotArchivedChat.delete({
      where: { id: chatId },
    });

    return NextResponse.json({ message: 'Chat arquivado deletado com sucesso' }, { status: 200 });
  } catch (error) {
    console.error('Erro ao deletar chat arquivado:', error);
    return NextResponse.json({ message: 'Erro interno do servidor' }, { status: 500 });
  }
}