import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/auth';
import { isAdmin } from '@/lib/auth-utils';
import prisma from '@/lib/prisma';

interface RouteContext {
  params: {
    pageType: string;
  };
}

// GET: Busca o conteúdo para o editor do admin
export async function GET(request: NextRequest, { params }: RouteContext) {
  const session = await getServerSession(authOptions);
  if (!isAdmin(session)) return NextResponse.json({ message: 'Acesso negado' }, { status: 403 });

  const { pageType } = params;
  const content = await prisma.legalContent.findUnique({ where: { pageType } });
  
  return NextResponse.json(content);
}

// PATCH: Salva o conteúdo atualizado pelo admin
export async function PATCH(request: NextRequest, { params }: RouteContext) {
  const session = await getServerSession(authOptions);
  if (!isAdmin(session)) return NextResponse.json({ message: 'Acesso negado' }, { status: 403 });

  try {
    const { pageType } = params;
    const { content } = await request.json();

    if (typeof content !== 'string') {
      return NextResponse.json({ message: 'O conteúdo deve ser um texto.' }, { status: 400 });
    }

    const updatedContent = await prisma.legalContent.upsert({
      where: { pageType },
      update: { content },
      create: { pageType, content },
    });

    return NextResponse.json(updatedContent);
  } catch (error) {
    return NextResponse.json({ message: 'Erro ao salvar conteúdo.' }, { status: 500 });
  }
}
