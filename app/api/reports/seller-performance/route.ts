import { NextRequest as NextApiRequest, NextResponse as NextApiResponse } from 'next/server'; // Renomeando para evitar conflito
import { getServerSession as getApiServerSession } from 'next-auth/next';
import { authOptions as apiAuthOptions } from '@/auth';
import prisma from '@/lib/prisma';
import { GoogleGenerativeAI as ApiGoogleGenerativeAI, HarmCategory as ApiHarmCategory, HarmBlockThreshold as ApiHarmBlockThreshold } from '@google/generative-ai';

// Inicializa o Gemini
const API_GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!API_GEMINI_API_KEY) {
  console.error('Chave da API do Gemini não configurada!');
}
const apiGenAI = new ApiGoogleGenerativeAI(API_GEMINI_API_KEY || "");
const apiModel = apiGenAI.getGenerativeModel({
  model: "gemini-2.0-flash",
  generationConfig: {
    temperature: 0.4,
    responseMimeType: "text/plain",
  },
  safetySettings: [
    { category: ApiHarmCategory.HARM_CATEGORY_HARASSMENT, threshold: ApiHarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  ],
});


export async function POST(request: NextApiRequest) {
  const session = await getApiServerSession(apiAuthOptions);
  if (!session?.user?.id) {
    return new NextApiResponse(JSON.stringify({ error: 'Não autorizado' }), { status: 401 });
  }

  try {
    const { startDate: startDateStr, endDate: endDateStr } = await request.json();
    if (!startDateStr || !endDateStr) {
        return new NextApiResponse(JSON.stringify({ error: 'As datas de início e fim são obrigatórias.' }), { status: 400 });
    }

    const startDate = new Date(startDateStr);
    const endDate = new Date(endDateStr);
    endDate.setHours(23, 59, 59, 999);

    const sellers = await prisma.seller.findMany({
      where: { storeOwnerId: session.user.id },
      include: {
        avaliacoes: {
          where: { createdAt: { gte: startDate, lte: endDate }, nota_cliente: { not: null } },
          select: { nota_cliente: true }
        }
      }
    });

    if (sellers.length === 0) {
      return new NextApiResponse(JSON.stringify({ performanceData: [], summary: "Nenhum vendedor encontrado para este usuário." }));
    }

    const performanceData = sellers.map(seller => {
      const totalAvaliacoes = seller.avaliacoes.length;
      if (totalAvaliacoes === 0) {
        return {
          id: seller.id,
          name: seller.name || seller.evolutionInstanceName,
          totalAvaliacoes: 0,
          mediaGeral: 'N/A',
        };
      }
      const somaNotas = seller.avaliacoes.reduce((acc, av) => acc + av.nota_cliente!, 0);
      const mediaGeral = (somaNotas / totalAvaliacoes).toFixed(2);

      return {
        id: seller.id,
        name: seller.name || seller.evolutionInstanceName,
        totalAvaliacoes,
        mediaGeral,
      };
    }).sort((a,b) => b.totalAvaliacoes - a.totalAvaliacoes);

    // Análise com IA
     const dataForAI = `
      **Dados de Desempenho por Vendedor:**\n${performanceData.map(p => `- Vendedor: ${p.name}, Total de Avaliações: ${p.totalAvaliacoes}, Nota Média: ${p.mediaGeral}`).join('\n')}
    `;

    const prompt = `
      Você é um gerente de vendas experiente. Analise os dados de desempenho dos vendedores e gere um resumo comparativo em Markdown.
      
      **Dados:**
      ${dataForAI}

      **Estrutura da Análise:**

      ### Análise Comparativa de Vendedores

      **Visão Geral:** (Faça um resumo geral. Quem teve mais atendimentos? Quem teve a melhor média? Há alguma discrepância notável?)
      
      **Destaques de Performance:** (Identifique o vendedor com melhor desempenho geral (considerando volume e nota) e explique o porquê.)

      **Oportunidades de Desenvolvimento:** (Identifique o vendedor que pode precisar de mais atenção ou treinamento e sugira o motivo com base nos dados.)

      **Recomendação:** (Dê uma sugestão de ação para a equipe, como compartilhar as boas práticas do vendedor destaque ou focar em treinamento para os com nota mais baixa.)
    `;

    const result = await apiModel.generateContent(prompt);
    const summary = result.response.text();

    return new NextApiResponse(JSON.stringify({ performanceData, summary }));

  } catch (error) {
    console.error("Erro ao gerar relatório de desempenho:", error);
    return new NextApiResponse(JSON.stringify({ error: 'Erro interno do servidor.' }), { status: 500 });
  }
}