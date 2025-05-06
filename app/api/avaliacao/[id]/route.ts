// app/api/avaliacao/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

interface RouteContext {
  params: {
    id?: string;
  };
}

export async function GET(request: NextRequest, context: RouteContext) {
  const { params } = context;
  const avaliacaoId = params.id;

  if (!avaliacaoId) {
    return NextResponse.json({ message: 'ID da avaliação é obrigatório' }, { status: 400 });
  }

  try {
    const avaliacao = await prisma.avaliacao.findUnique({
      where: { id: avaliacaoId },
    });

    if (!avaliacao) {
      return NextResponse.json({ message: 'Avaliação não encontrada' }, { status: 404 });
    }

    return NextResponse.json(avaliacao, { status: 200 });
  } catch (error) {
    console.error(`Erro ao buscar avaliação por ID (${avaliacaoId}):`, error);
    return NextResponse.json({ message: 'Erro ao buscar avaliação', error: (error as Error).message }, { status: 500 });
  }
}