import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from "next-auth/next"; 
import { authOptions } from "@/auth"; 

interface RouteContext {
  params: {
    id?: string;
  };
}

// Seu método GET continua aqui...
export async function GET(request: NextRequest, { params }: RouteContext) {
  const session = await getServerSession(authOptions); 
  if (!session?.user?.id) { 
    return NextResponse.json({ message: 'Não autorizado' }, { status: 401 });
  }
  
  const avaliacaoId = params.id;
  if (!avaliacaoId) {
    return NextResponse.json({ message: 'ID da avaliação é obrigatório' }, { status: 400 });
  }

  try {
    const avaliacao = await prisma.avaliacao.findUnique({ where: { id: avaliacaoId } });
    if (!avaliacao) {
      return NextResponse.json({ message: 'Avaliação não encontrada' }, { status: 404 });
    }
    if (avaliacao.userId !== session.user.id) {
      return NextResponse.json({ message: 'Acesso negado a esta avaliação' }, { status: 403 });
    }
    return NextResponse.json(avaliacao, { status: 200 });
  } catch (error) {
    console.error(`Erro ao buscar avaliação por ID (${avaliacaoId}):`, error);
    return NextResponse.json({ message: 'Erro ao buscar avaliação', error: (error as Error).message }, { status: 500 });
  }
}

// ** MÉTODO PATCH ATUALIZADO **
export async function PATCH(request: NextRequest, { params }: RouteContext) {
  const avaliacaoId = params.id;

  if (!avaliacaoId) {
    return NextResponse.json({ message: 'ID da avaliação é obrigatório para atualização.' }, { status: 400 });
  }

  try {
    const body = await request.json();
    
    // Extrai todos os campos gerados pela IA, incluindo tempo_resposta
    const { 
      pontos_fortes, 
      pontos_fracos, 
      sugestoes_melhoria, 
      resumo_atendimento,
      tempo_resposta, // <-- Adicionado
      clareza_comunicacao, // <-- Adicionado
      resolucao_problema // <-- Adicionado
    } = body;

    const updateData: any = {};
    if (pontos_fortes) updateData.pontos_fortes = pontos_fortes;
    if (pontos_fracos) updateData.pontos_fracos = pontos_fracos;
    if (sugestoes_melhoria) updateData.sugestoes_melhoria = sugestoes_melhoria;
    if (resumo_atendimento) updateData.resumo_atendimento = resumo_atendimento;
    if (tempo_resposta) updateData.tempo_resposta = tempo_resposta;
    if (clareza_comunicacao) updateData.clareza_comunicacao = clareza_comunicacao;
    if (resolucao_problema) updateData.resolucao_problema = resolucao_problema;

    const updatedAvaliacao = await prisma.avaliacao.update({
      where: { id: avaliacaoId },
      data: updateData,
    });

    return NextResponse.json({ message: 'Avaliação atualizada com a análise da IA.', data: updatedAvaliacao }, { status: 200 });

  } catch (error) {
    console.error(`Erro ao atualizar avaliação [${avaliacaoId}]:`, error);
    return NextResponse.json({ message: 'Erro ao atualizar avaliação.' }, { status: 500 });
  }
}