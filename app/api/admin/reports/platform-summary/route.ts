import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/auth';
import { isAdmin } from '@/lib/auth-utils';
import prisma from '@/lib/prisma';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import { subDays } from 'date-fns';

// Configuração da API do Gemini
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
  console.error('Chave da API do Gemini não configurada!');
}
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash",
  generationConfig: {
    temperature: 0.6,
    maxOutputTokens: 4096,
  },
  safetySettings: [
    { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  ]
});

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!isAdmin(session)) {
    return NextResponse.json({ message: 'Acesso negado.' }, { status: 403 });
  }

  try {
    // 1. Coletar dados agregados da plataforma
    const thirtyDaysAgo = subDays(new Date(), 30);

    const totalUsers = await prisma.user.count();
    const newUsersLast30Days = await prisma.user.count({ where: { createdAt: { gte: thirtyDaysAgo } } });
    const totalSellers = await prisma.seller.count();
    const totalAvaliacoes = await prisma.avaliacao.count();
    const totalConversas = await prisma.chatInteraction.count();

    const usersWithMostSellers = await prisma.user.findMany({
      take: 5,
      orderBy: { sellers: { _count: 'desc' } },
      select: { name: true, _count: { select: { sellers: true } } },
    });
    
    const usersWithMostAvaliacoes = await prisma.user.findMany({
      take: 5,
      orderBy: { avaliacoes: { _count: 'desc' } },
      select: { name: true, _count: { select: { avaliacoes: true } } },
    });
    
    // 2. Montar o prompt para a IA
    const dataForAI = `
      - Total de Usuários: ${totalUsers}
      - Novos Usuários (últimos 30 dias): ${newUsersLast30Days}
      - Total de Vendedores Cadastrados: ${totalSellers}
      - Total de Avaliações Recebidas: ${totalAvaliacoes}
      - Total de Conversas Analisadas: ${totalConversas}
      - Top 5 Usuários por nº de Vendedores: ${usersWithMostSellers.map(u => `${u.name} (${u._count.sellers} vendedores)`).join(', ')}
      - Top 5 Usuários por nº de Avaliações: ${usersWithMostAvaliacoes.map(u => `${u.name} (${u._count.avaliacoes} avaliações)`).join(', ')}
    `;

    const prompt = `
      Aja como um Diretor de Operações (COO) analisando a saúde da plataforma R.A.I.O.
      Com base nos dados agregados a seguir, gere um relatório executivo em formato Markdown.
      O relatório deve ser conciso, estratégico e focado em insights e pontos de ação.

      **Dados da Plataforma:**
      ${dataForAI}

      **Estrutura do Relatório:**

      # Relatório Executivo da Plataforma R.A.I.O

      ## 1. Sumário Geral de Atividade
      (Faça uma análise geral dos números. O crescimento de usuários é saudável? A atividade de avaliações e conversas é alta? Compare os totais.)

      ## 2. Análise de Engajamento dos Usuários
      (Com base nos usuários com mais vendedores e avaliações, identifique os "power users". O que o perfil desses usuários pode indicar sobre o uso da plataforma?)

      ## 3. Pontos de Atenção e Oportunidades
      (Identifique possíveis pontos de atenção. Por exemplo: "O número de vendedores está crescendo mais rápido que o de avaliações, indicando uma possível dificuldade na coleta de feedback." ou "O crescimento de novos usuários é baixo, sugerindo a necessidade de ações de marketing.")

      ## 4. Recomendações Estratégicas
      (Forneça 2-3 recomendações claras para a equipe de produto/negócios. Ex: "Focar em estratégias para aumentar o engajamento dos usuários menos ativos.", "Criar um case de sucesso com os 'power users'.", "Investigar por que o volume de conversas é baixo em comparação com o de avaliações.")
    `;

    // 3. Gerar o conteúdo com o Gemini
    const result = await model.generateContent(prompt);
    const report = result.response.text();

    return NextResponse.json({ report });

  } catch (error) {
    console.error('Erro ao gerar relatório da plataforma:', error);
    return NextResponse.json({ message: 'Erro interno do servidor.' }, { status: 500 });
  }
}
