// No projeto Next.js: app/api/dashboard/summary/route.ts

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { subDays } from 'date-fns';
import jwt from 'jsonwebtoken'; // Usaremos a biblioteca JWT diretamente

// Uma interface para o que esperamos encontrar dentro do nosso token
interface UserTokenPayload {
  id: string;
  name?: string;
  email?: string;
  role?: string;
}

// Cabeçalhos de CORS que já configuramos
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Handler para a requisição de pre-flight
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  });
}

// Handler principal para a requisição GET
export async function GET(request: NextRequest) {
  try {
    // 1. Pegar o token do cabeçalho 'Authorization'
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Não autorizado: token não fornecido.' },
        { status: 401, headers: corsHeaders }
      );
    }
    const token = authHeader.split(' ')[1];

    // 2. Verificar e decodificar o token
    let decodedPayload: UserTokenPayload;
    try {
      decodedPayload = jwt.verify(token, process.env.AUTH_SECRET as string) as UserTokenPayload;
    } catch (err) {
      return NextResponse.json({ error: 'Não autorizado: token inválido ou expirado.' }, { status: 403, headers: corsHeaders });
    }

    const userId = decodedPayload.id;
    if (!userId) {
      return NextResponse.json({ error: 'Token inválido: ID do usuário não encontrado.' }, { status: 403, headers: corsHeaders });
    }
    
    // 3. Com o userId validado, buscar os dados no banco
    const oneMonthAgo = subDays(new Date(), 30);

    const totalAvaliacoes = await prisma.avaliacao.count({
      where: { userId: userId },
    });
    
    const avaliacoesUltimoMes = await prisma.avaliacao.findMany({
      where: { createdAt: { gte: oneMonthAgo }, userId: userId },
      select: { remoteJid: true },
    });
    
    const novosClientesMes = new Set(avaliacoesUltimoMes.map(av => av.remoteJid).filter(Boolean)).size;

    const satisfacaoMediaData = await prisma.avaliacao.aggregate({
      _avg: { nota_cliente: true },
      where: { userId: userId, nota_cliente: { not: null } },
    });
    
    const satisfacaoMedia = satisfacaoMediaData._avg.nota_cliente
      ? `${satisfacaoMediaData._avg.nota_cliente.toFixed(1)}/10`
      : "N/A";

    // 4. Retornar os dados com sucesso
    return NextResponse.json({
      totalAvaliacoes,
      novosClientesMes,
      satisfacaoMedia,
    }, {
      headers: corsHeaders
    });

  } catch (error) {
    console.error("ERRO na API /api/dashboard/summary:", error);
    return NextResponse.json(
      { error: 'Erro interno do servidor.' }, 
      { status: 500, headers: corsHeaders }
    );
  }
}