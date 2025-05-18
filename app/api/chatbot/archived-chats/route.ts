import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/auth';
import prisma from '@/lib/prisma';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface ArchivedChatPayload {
  name: string;
  messages: ChatMessage[];
}


export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Não autorizado' }, { status: 401 });
  }
  const userId = session.user.id;

  try {
    const archivedChats = await prisma.chatbotArchivedChat.findMany({
      where: { userId },
      orderBy: { timestamp: 'desc' },
    });
    return NextResponse.json(archivedChats);
  } catch (error) {
    console.error('Erro ao carregar chats arquivados:', error);
    return NextResponse.json({ message: 'Erro interno do servidor' }, { status: 500 });
  }
}


export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Não autorizado' }, { status: 401 });
  }
  const userId = session.user.id;

  try {
    const { name, messages } = (await request.json()) as ArchivedChatPayload;

    if (!name || !Array.isArray(messages)) {
      return NextResponse.json({ message: 'Dados inválidos para arquivar chat' }, { status: 400 });
    }

    const newArchivedChat = await prisma.chatbotArchivedChat.create({
      data: {
        userId,
        name,
        messages: messages as any, 
        timestamp: new Date(),
      },
    });
    return NextResponse.json(newArchivedChat, { status: 201 });
  } catch (error) {
    console.error('Erro ao arquivar chat:', error);
    return NextResponse.json({ message: 'Erro interno do servidor' }, { status: 500 });
  }
}