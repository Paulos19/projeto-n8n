import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/auth'; 
import prisma from '@/lib/prisma'; 

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}


export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Não autorizado' }, { status: 401 });
  }
  const userId = session.user.id;

  try {
    const activeSession = await prisma.chatbotActiveSession.findUnique({
      where: { userId },
    });

    if (activeSession) {
      return NextResponse.json({ messages: activeSession.messages });
    } else {
      return NextResponse.json({ messages: [] }); 
    }
  } catch (error) {
    console.error('Erro ao carregar chat ativo:', error);
    return NextResponse.json({ message: 'Erro interno do servidor ao carregar chat' }, { status: 500 });
  }
}


export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Não autorizado' }, { status: 401 });
  }
  const userId = session.user.id;

  try {
    const { messages } = (await request.json()) as { messages: ChatMessage[] };

    if (!Array.isArray(messages)) {
      return NextResponse.json({ message: 'Formato de mensagens inválido' }, { status: 400 });
    }




    await prisma.chatbotActiveSession.upsert({
      where: { userId },

      update: { messages: messages as any }, 
      create: { userId, messages: messages as any },
    });

    return NextResponse.json({ message: 'Chat ativo salvo com sucesso' }, { status: 200 });
  } catch (error) {
    console.error('Erro ao salvar chat ativo:', error);
    return NextResponse.json({ message: 'Erro interno do servidor ao salvar chat' }, { status: 500 });
  }
}