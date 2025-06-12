import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/auth';
import prisma from '@/lib/prisma';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold, Content } from '@google/generative-ai';
import { Prisma } from '@prisma/client';

// Helper para inicializar o Gemini
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
  console.error('Chave da API do Gemini não configurada!');
}
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash",
  generationConfig: {
    temperature: 0.5,
    topP: 0.95,
    topK: 64,
    maxOutputTokens: 8192,
    responseMimeType: "text/plain",
  },
  safetySettings: [
    { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    // ... outras configurações de segurança
  ],
});

// Interface para mensagens de chat
interface ChatMessage {
  fromMe: boolean;
  senderName?: string;
  text?: string;
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  try {
    const { date } = await request.json();
    if (!date) {
      return NextResponse.json({ error: 'A data é obrigatória.' }, { status: 400 });
    }

    // Define o período de 24h para a data fornecida
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);

    // 1. Buscar todas as interações de chat do dia para o usuário
    const interactions = await prisma.chatInteraction.findMany({
      where: {
        userId: session.user.id,
        eventTimestamp: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        seller: {
          select: { name: true },
        },
      },
      orderBy: {
        eventTimestamp: 'asc',
      },
    });

    if (interactions.length === 0) {
      return NextResponse.json({ report: 'Nenhuma conversa encontrada para esta data.' });
    }

    // 2. Formatar as conversas para o prompt da IA
    let conversationsText = "A seguir estão as transcrições das conversas do dia:\n\n";
    const sellerPerformance: { [key: string]: { interactions: number } } = {};

    interactions.forEach((interaction, index) => {
      const sellerName = interaction.seller?.name || interaction.sellerInstanceName || 'Vendedor Desconhecido';
      if (!sellerPerformance[sellerName]) {
        sellerPerformance[sellerName] = { interactions: 0 };
      }
      sellerPerformance[sellerName].interactions++;

      conversationsText += `--- Conversa ${index + 1} | Vendedor: ${sellerName} | Cliente: ${interaction.customerName} ---\n`;
      if (Array.isArray(interaction.chatHistory)) {
        (interaction.chatHistory as unknown as ChatMessage[]).forEach(msg => {
          const author = msg.fromMe ? sellerName : (msg.senderName || interaction.customerName || 'Cliente');
          conversationsText += `${author}: ${msg.text || '[Mensagem sem texto]'}\n`;
        });
      }
      conversationsText += `--- Fim da Conversa ${index + 1} ---\n\n`;
    });

    // 3. Montar o prompt final para o Gemini
    const prompt = `
      Você é um analista de vendas sênior e especialista em atendimento ao cliente.
      Sua tarefa é gerar um relatório diário de desempenho com base nas conversas fornecidas.
      Analise todas as interações e crie um relatório conciso, profissional e acionável.

      **Dados Brutos:**
      ${conversationsText}

      **Estrutura do Relatório (use Markdown):**

      # Relatório Diário de Atendimento - ${startDate.toLocaleDateString('pt-BR')}

      ## Resumo Executivo
      (Um parágrafo resumindo o dia. Mencione o volume de interações, o sentimento geral dos clientes e os destaques positivos e negativos.)

      ## Análise de Desempenho por Vendedor
      (Para cada vendedor listado, forneça uma análise individual. Se houver apenas um, analise-o. Exemplo:)
      
      ### **Vendedor: [Nome do Vendedor]**
      * **Volume:** [Número] interações.
      * **Pontos Fortes:** (Descreva 1-2 pontos positivos observados nas conversas, como clareza, proatividade, etc.)
      * **Pontos a Melhorar:** (Descreva 1-2 pontos que podem ser aprimorados, como tempo de resposta, profundidade do conhecimento do produto, etc.)
      * **Interação Destaque (ID):** (Se houver, mencione o ID de uma conversa notável, seja positiva ou negativa: ${interactions.map(i => i.id).join(', ')})

      ## Tendências e Padrões Observados
      (Liste 2-3 temas ou padrões recorrentes que surgiram nas conversas do dia. Ex: "Muitas dúvidas sobre o produto X", "Problemas recorrentes com o método de pagamento Y", "Elogios sobre a rapidez na entrega".)

      ## Sugestões de Melhoria e Plano de Ação
      (Forneça 2-3 sugestões práticas e acionáveis para a equipe ou para a gestão com base na análise do dia. As sugestões devem ser claras e diretas.)
    `;

    // 4. Chamar a API do Gemini
    const result = await model.generateContent(prompt);
    const report = result.response.text();

    return NextResponse.json({ report });

  } catch (error) {
    console.error("Erro ao gerar relatório diário:", error);
    return NextResponse.json({ error: 'Erro interno do servidor ao gerar relatório.' }, { status: 500 });
  }
}