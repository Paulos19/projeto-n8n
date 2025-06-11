// app/api/chat-interaction/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";

interface RouteContext {
  params: {
    id: string;
  };
}

// O método GET para buscar os detalhes da conversa
export async function GET(request: NextRequest, { params }: RouteContext) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Não autorizado' }, { status: 401 });
  }

  const { id } = params;
  if (!id) {
    return NextResponse.json({ message: 'ID da conversa é obrigatório' }, { status: 400 });
  }

  try {
    const interaction = await prisma.chatInteraction.findUnique({
      where: { id: id },
    });

    if (!interaction) {
      return NextResponse.json({ message: 'Conversa não encontrada' }, { status: 404 });
    }

    if (interaction.userId !== session.user.id) {
      return NextResponse.json({ message: 'Acesso negado' }, { status: 403 });
    }

    return NextResponse.json(interaction, { status: 200 });
  } catch (error) {
    console.error(`Erro ao buscar detalhes da conversa (${id}):`, error);
    return NextResponse.json({ message: 'Erro ao buscar detalhes da conversa' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
    const interactionId = params.id;

    if (!interactionId) {
        return NextResponse.json({ message: 'ID da interação é obrigatório.' }, { status: 400 });
    }

    try {
        const body = await request.json();
        const { analysisSummary, analysisKeywords } = body;

        // Validação básica do corpo da requisição
        if (typeof analysisSummary !== 'string' || !Array.isArray(analysisKeywords)) {
            return NextResponse.json({ message: 'Corpo da requisição inválido. "analysisSummary" (string) e "analysisKeywords" (array) são obrigatórios.' }, { status: 400 });
        }

        const updatedInteraction = await prisma.chatInteraction.update({
            where: { id: interactionId },
            data: {
                analysisSummary,
                analysisKeywords,
            },
        });

        return NextResponse.json({ message: 'Interação atualizada com sucesso pela IA.', data: updatedInteraction }, { status: 200 });
    } catch (error) {
        console.error(`Erro ao atualizar interação [${interactionId}]:`, error);
        return NextResponse.json({ message: 'Erro ao atualizar interação.' }, { status: 500 });
    }
}