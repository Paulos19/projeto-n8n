import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/auth';
import prisma from '@/lib/prisma';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

// Inicializa o Gemini
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
  console.error('Chave da API do Gemini não configurada!');
}
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash",
  generationConfig: {
    temperature: 0.3,
    responseMimeType: "text/plain",
  },
  safetySettings: [
    { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  ],
});

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  try {
    const { startDate: startDateStr, endDate: endDateStr } = await request.json();
    if (!startDateStr || !endDateStr) {
      return NextResponse.json({ error: 'As datas de início e fim são obrigatórias.' }, { status: 400 });
    }

    const startDate = new Date(startDateStr);
    const endDate = new Date(endDateStr);
    endDate.setHours(23, 59, 59, 999);

    const avaliacoes = await prisma.avaliacao.findMany({
      where: {
        userId: session.user.id,
        createdAt: { gte: startDate, lte: endDate },
        OR: [
          { pontos_fortes: { isEmpty: false } },
          { pontos_fracos: { isEmpty: false } },
        ],
      },
      select: { pontos_fortes: true, pontos_fracos: true },
    });

    if (avaliacoes.length === 0) {
      return NextResponse.json({
        trends: null,
        summary: "Nenhum feedback qualitativo (pontos fortes/fracos) encontrado no período."
      });
    }
    
    // Contagem de frequência
    const countFrequency = (arr: string[]) => {
      return arr.reduce((acc, curr) => {
        acc[curr] = (acc[curr] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
    };

    const allStrengths = avaliacoes.flatMap(a => a.pontos_fortes);
    const allWeaknesses = avaliacoes.flatMap(a => a.pontos_fracos);
    
    const strengthCounts = countFrequency(allStrengths);
    const weaknessCounts = countFrequency(allWeaknesses);
    
    const topStrengths = Object.entries(strengthCounts).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([text, count]) => ({ text, count }));
    const topWeaknesses = Object.entries(weaknessCounts).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([text, count]) => ({ text, count }));

    const trends = { topStrengths, topWeaknesses };

    // Análise com IA
    const prompt = `
      Você é um analista de Customer Experience. Com base na lista de pontos fortes e fracos mais mencionados pelos clientes, identifique os principais temas e gere uma análise concisa em Markdown.

      **Dados de Feedback:**
      - Pontos Fortes Mais Comuns: ${JSON.stringify(topStrengths)}
      - Pontos Fracos Mais Comuns: ${JSON.stringify(topWeaknesses)}

      **Estrutura da Análise:**

      ### Análise de Tendências de Feedback

      **Temas Positivos Recorrentes:** (Descreva 2-3 temas que emergem dos pontos fortes. Ex: "Os clientes consistentemente elogiam a agilidade e a simpatia no atendimento.")
      
      **Principais Oportunidades de Melhoria:** (Descreva 2-3 temas que emergem dos pontos fracos. Ex: "A principal queixa está relacionada ao tempo de espera, seguida por falta de clareza nas informações do produto X.")

      **Recomendação Prioritária:** (Forneça UMA recomendação clara e acionável com base na análise. Ex: "Focar em um treinamento sobre o produto X para a equipe para resolver as dúvidas dos clientes de forma mais eficaz.")
    `;

    const result = await model.generateContent(prompt);
    const summary = result.response.text();

    return NextResponse.json({ trends, summary });

  } catch (error) {
    console.error("Erro ao gerar relatório de tendências:", error);
    return NextResponse.json({ error: 'Erro interno do servidor.' }, { status: 500 });
  }
}