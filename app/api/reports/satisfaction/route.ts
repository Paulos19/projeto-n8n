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
    temperature: 0.4,
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

    // 1. Busca as avaliações no banco de dados
    const avaliacoes = await prisma.avaliacao.findMany({
      where: {
        userId: session.user.id,
        createdAt: { gte: startDate, lte: endDate },
        nota_cliente: { not: null },
      },
      select: { nota_cliente: true, pontos_fortes: true, pontos_fracos: true },
    });

    if (avaliacoes.length === 0) {
      return NextResponse.json({
        metrics: null,
        summary: "Nenhuma avaliação com nota encontrada para o período selecionado."
      });
    }

    // 2. Calcula as métricas
    const totalAvaliacoes = avaliacoes.length;
    let somaNotas = 0;
    let promotores = 0;
    let neutros = 0;
    let detratores = 0;
    const distribuicaoNotas: { [key: number]: number } = {};

    avaliacoes.forEach(av => {
      const nota = av.nota_cliente!;
      somaNotas += nota;
      if (nota >= 9) promotores++;
      else if (nota >= 7) neutros++;
      else detratores++;
      distribuicaoNotas[nota] = (distribuicaoNotas[nota] || 0) + 1;
    });

    const mediaGeral = (somaNotas / totalAvaliacoes).toFixed(2);
    const npsScore = Math.round(((promotores / totalAvaliacoes) - (detratores / totalAvaliacoes)) * 100);

    const metrics = {
      totalAvaliacoes,
      mediaGeral,
      npsScore,
      distribuicao: Object.entries(distribuicaoNotas).map(([nota, count]) => ({ nota: Number(nota), contagem: count })).sort((a,b) => a.nota - b.nota),
      npsCounts: { promotores, neutros, detratores },
    };

    // 3. Prepara os dados para a análise da IA
    const dataForAI = `
      **Período de Análise:** ${startDate.toLocaleDateString('pt-BR')} a ${endDate.toLocaleDateString('pt-BR')}
      **Total de Avaliações:** ${metrics.totalAvaliacoes}
      **Média Geral de Satisfação:** ${metrics.mediaGeral} / 10
      **NPS (Net Promoter Score):** ${metrics.npsScore}
      **Distribuição das Notas:** ${JSON.stringify(metrics.distribuicao)}
      **Pontos Fortes Mencionados:** ${avaliacoes.map(a => a.pontos_fortes).flat().join(', ')}
      **Pontos Fracos Mencionados:** ${avaliacoes.map(a => a.pontos_fracos).flat().join(', ')}
    `;

    // 4. Gera o resumo com a IA
    const prompt = `
      Você é um analista de dados especialista em Customer Experience.
      Analise os seguintes dados de satisfação do cliente e gere um resumo executivo em Markdown.
      Seja conciso, profissional e foque em insights acionáveis.
      
      **Dados:**
      ${dataForAI}

      **Estrutura do Resumo:**

      ### Análise de Satisfação do Cliente

      **Visão Geral:** (Comente sobre a média geral e o NPS. O NPS está bom, ruim ou na média? O que a média indica?)
      
      **Destaques Positivos:** (Com base nos pontos fortes e nas notas altas, o que os clientes mais gostam?)

      **Áreas de Melhoria:** (Com base nos pontos fracos e nas notas baixas, quais são as principais reclamações ou áreas para focar?)

      **Recomendação Estratégica:** (Forneça uma recomendação clara e direta baseada nos dados.)
    `;

    const result = await model.generateContent(prompt);
    const summary = result.response.text();

    return NextResponse.json({ metrics, summary });

  } catch (error) {
    console.error("Erro ao gerar relatório de satisfação:", error);
    return NextResponse.json({ error: 'Erro interno do servidor.' }, { status: 500 });
  }
}