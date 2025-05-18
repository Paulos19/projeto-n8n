
import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold, Content } from '@google/generative-ai';
import prisma  from '@/lib/prisma';
import { getServerSession } from "next-auth/next"; 
import { authOptions } from "@/auth"; 

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY || "");

const generationConfig = {
  temperature: 0.7, 
  topK: 1,
  topP: 1,
  maxOutputTokens: 2048, 
};

const safetySettings = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
];

export async function POST(req: NextRequest) {
  if (!GEMINI_API_KEY) {
    return NextResponse.json({ error: 'API key for Gemini not configured' }, { status: 500 });
  }

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Usuário não autenticado' }, { status: 401 });
  }
  const userId = session.user.id;

  try {
    const { message: userCurrentMessage } = await req.json(); 

    if (!userCurrentMessage) {
      return NextResponse.json({ error: 'Mensagem é obrigatória' }, { status: 400 });
    }


    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      include: { 
        sellers: {
          select: { name: true, evolutionInstanceName: true } 
        },
        customerReviews: { 
          select: { rating: true, comment: true, createdAt: true },
          orderBy: { createdAt: 'desc' },
          take: 20 
        }
      },
    });

    const sellersExist = currentUser?.sellers && currentUser.sellers.length > 0;
    const reviewsExist = currentUser?.customerReviews && currentUser.customerReviews.length > 0;

    let userInfoForPrompt = `O usuário logado é ${currentUser?.name || 'um usuário desconhecido'}.`;
    if (sellersExist && currentUser?.sellers) {
      const sellerNames = currentUser.sellers.map(s => s.name || s.evolutionInstanceName).filter(Boolean);
      if (sellerNames.length > 0) {
        userInfoForPrompt += ` Seus vendedores cadastrados são: ${sellerNames.join(', ')}.`;
      } else {
        userInfoForPrompt += " Ele(a) possui registros de vendedores, mas alguns podem não ter nomes definidos.";
      }
    } else {
      userInfoForPrompt += " Ele(a) ainda não possui vendedores cadastrados.";
    }

    let reviewsInfoForPrompt = "";
    if (reviewsExist && currentUser?.customerReviews) {
      reviewsInfoForPrompt = ` O usuário possui ${currentUser.customerReviews.length} avaliações de clientes recentes. Você pode usar essas informações para análises e sugestões. Exemplo das últimas avaliações (nota e comentário): `;
      currentUser.customerReviews.slice(0, 3).forEach(review => { 
        reviewsInfoForPrompt += `[Nota: ${review.rating || 'N/A'}, Comentário: "${review.comment.substring(0, 100)}..."] `;
      });
    } else {
      reviewsInfoForPrompt = " Atualmente, não há avaliações de clientes registradas no sistema para este usuário.";
    }

    const baseSystemMessage = "Você é R.A.I.O, um assistente IA especialista em gestão de vendas e análise de feedback de clientes. Seu objetivo é ajudar usuários a gerenciar suas equipes de vendas, analisar dados (incluindo avaliações de clientes), otimizar processos e melhorar a satisfação do cliente. Seja proativo e prestativo.";
    let fullSystemMessage = `${baseSystemMessage} ${userInfoForPrompt} ${reviewsInfoForPrompt}`;
    
    if (!sellersExist) {
      fullSystemMessage += " Importante: Atualmente, não há vendedores cadastrados no sistema. Se o usuário expressar a necessidade de gerenciar a equipe de vendas, ou se a conversa indicar que vendedores são necessários para a tarefa solicitada (como gerar relatórios de vendas por vendedor), informe que, para prosseguir, é preciso primeiro cadastrar um vendedor. Pergunte se ele gostaria de fazer isso agora. Se sim, explique que ele pode usar o comando 'cadastrar vendedor: Nome (opcional), NomeDaInstancia, ChaveDaAPI, NumeroWhatsApp' ou peça os dados individualmente: Nome do Vendedor (opcional), Nome da Instância da Evolution API, Chave da API da Evolution e o Número do WhatsApp do vendedor para que você possa ajudar no cadastro.";
    }


    const dbChatMessages = await prisma.geminiChatMessage.findMany({
      where: { 
        userId: userId,
        isArchived: false 
      },
      orderBy: { createdAt: 'asc' },
      take: 30, 
    });

    const geminiHistory: Content[] = dbChatMessages.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model', 
      parts: [{ text: msg.content }],
    }));


    await prisma.geminiChatMessage.create({
      data: {
        userId: userId,
        role: 'user',
        content: userCurrentMessage,
      },
    });
    
    const contents: Content[] = [
      {
        role: "user", 
        parts: [{ text: fullSystemMessage }],
      },
      {
        role: "model",
        parts: [{ text: "Entendido. Olá! Sou R.A.I.O, seu assistente de vendas. Como posso te ajudar hoje?" }], 
      },
      ...geminiHistory,
      {
        role: "user",
        parts: [{ text: userCurrentMessage }],
      },
    ];

    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY); 
    const geminiModel = genAI
      .getGenerativeModel({ model: "gemini-2.0-flash", generationConfig, safetySettings }); 
      
    const geminiStreamResult = await geminiModel.generateContentStream({ contents });

    let accumulatedAssistantResponse = "";

    const stream = new ReadableStream({
      async start(controller) {
        for await (const chunk of geminiStreamResult.stream) {
          try {
            const chunkText = chunk.text();
            accumulatedAssistantResponse += chunkText;
            controller.enqueue(new TextEncoder().encode(chunkText));
          } catch (error) {
            console.error("Error processing stream chunk:", error);

          }
        }

        if (accumulatedAssistantResponse.trim()) {
          await prisma.geminiChatMessage.create({
            data: {
              userId: userId,
              role: 'model', 
              content: accumulatedAssistantResponse.trim(),
            },
          });
        }
        controller.close();
      },
      cancel(reason) {
        console.log("Stream cancelled:", reason);

      }
    });

    return new Response(stream, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });

  } catch (error: any) {
    console.error("Error in /api/chatbot:", error);
    return NextResponse.json({ error: error.message || 'Failed to process chat message' }, { status: 500 });
  }
}