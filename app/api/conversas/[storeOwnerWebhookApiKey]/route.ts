import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; // Assuming prisma client is correctly set up
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth"; // Assuming authOptions are correctly set up

/**
 * Interface for the expected payload from N8N for each message.
 */
interface N8nMessagePayload {
  // Campos existentes da conversa
  remoteJid: string; // JID do cliente
  chat_history: Array<{ /* ... */ }>;
  analysis: {
    summary: string;
    keywords: string[];
  };
  customer: { // Informações do cliente
    name: string; // Ex: webhook body.data.pushName
    number: string; // Ex: webhook body.data.key.remoteJid (se fromMe=false) ou body.sender
  };
  timestamp: string; // ISO 8601 date string

  // Novos campos esperados do N8N para identificar a instância do vendedor
  // Estes virão do webhook da Evolution API que o N8N recebe
  sellerEvolutionInstanceName: string; // Do webhook: body.instance (ex: "Paulo Henrique")
  sellerEvolutionApiKey: string;       // Do webhook: body.apikey (ex: "948D0A6EDFA1-4BC3-AFFD-70CE70DD89D7")
}

/**
 * Interface for the route context, expecting apiKeyPath from dynamic route.
 */
interface RouteContext {
  params: {
    storeOwnerWebhookApiKey?: string; // Parâmetro da URL atualizado
  };
}

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { params } = context;
    const storeOwnerWebhookApiKey = params.storeOwnerWebhookApiKey;

    if (!storeOwnerWebhookApiKey) {
      return NextResponse.json({ message: "Webhook API Key da loja é obrigatória na URL." }, { status: 400 });
    }

    const payloadArray: N8nMessagePayload[] = await request.json();

    if (!Array.isArray(payloadArray) || payloadArray.length === 0) {
      return NextResponse.json(
        { message: 'Corpo da requisição inválido: um array de mensagens é esperado.' },
        { status: 400 }
      );
    }

    // 1. Encontrar o dono da loja pela webhookApiKey da URL
    const storeOwner = await prisma.user.findUnique({
      where: { webhookApiKey: storeOwnerWebhookApiKey },
    });

    if (!storeOwner) {
      return NextResponse.json({ message: "Webhook API Key da loja inválida ou dono não encontrado." }, { status: 403 });
    }

    const results = [];

    for (const item of payloadArray) {
      // Validação dos campos obrigatórios, incluindo os novos para o vendedor
      if (!item.remoteJid || !item.chat_history || !item.analysis || !item.customer || !item.timestamp ||
          !item.sellerEvolutionInstanceName || !item.sellerEvolutionApiKey) {
        results.push({ success: false, message: 'Item inválido, dados faltando (incluindo sellerEvolutionInstanceName ou sellerEvolutionApiKey).', item });
        continue;
      }

      // 2. Encontrar o vendedor registrado sob este dono de loja usando a API Key e o Nome da Instância da Evolution
      // A API Key da Evolution é um identificador forte.
      const seller = await prisma.seller.findFirst({
        where: {
          storeOwnerId: storeOwner.id,
          evolutionApiKey: item.sellerEvolutionApiKey,
          // Opcionalmente, adicionar evolutionInstanceName para uma checagem mais estrita se necessário,
          // mas a evolutionApiKey já deve ser única por loja no schema.
          // evolutionInstanceName: item.sellerEvolutionInstanceName 
        },
      });

      if (!seller || !seller.isActive) {
        results.push({ success: false, message: `Vendedor com Evolution API Key ${item.sellerEvolutionApiKey} não encontrado, não ativo ou não pertence a esta loja.`, item });
        continue;
      }
      
      // Opcional: Validar se o item.sellerEvolutionInstanceName corresponde ao seller.evolutionInstanceName
      // se você quiser ser extra rigoroso, assumindo que o dono da loja registrou ambos corretamente.
      if (seller.evolutionInstanceName !== item.sellerEvolutionInstanceName) {
        console.warn(`Possível divergência de nome de instância para o vendedor ${seller.id}. Esperado: ${seller.evolutionInstanceName}, Recebido: ${item.sellerEvolutionInstanceName}`);
        // Decida se isso deve ser um erro bloqueante ou apenas um aviso.
        // Por ora, vamos permitir, pois a API Key é o principal.
      }


      // Se todas as validações passaram, prossiga para salvar a interação
      const dataToSave = {
        remoteJid: item.remoteJid, // JID do cliente
        customerName: item.customer.name,
        chatHistory: item.chat_history as any,
        analysisSummary: item.analysis.summary,
        analysisKeywords: item.analysis.keywords,
        eventTimestamp: new Date(item.timestamp),
        userId: storeOwner.id, // ID do dono da loja
        sellerId: seller.id,   // ID do vendedor validado
        sellerInstanceName: seller.name || seller.evolutionInstanceName, // Nome de exibição do vendedor
      };

      const newInteraction = await prisma.chatInteraction.create({
        data: dataToSave,
      });
      results.push({ success: true, data: newInteraction });
    }

    const allSuccessful = results.every(r => r.success);
    const status = allSuccessful ? 201 : (results.some(r => r.success) ? 207 : 400);

    return NextResponse.json(
      {
        message: allSuccessful ? 'Todas as interações foram salvas com sucesso!' : 'Processamento concluído com alguns erros/avisos.',
        results
      },
      { status }
    );

  } catch (error) {
    console.error('Erro na API de conversas:', error);
    let errorMessage = 'Erro desconhecido ao processar dados.';
    if (error instanceof SyntaxError) { // Erro de parse do JSON
      errorMessage = 'Erro de sintaxe no JSON recebido.';
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }
    return NextResponse.json({ message: 'Erro interno do servidor.', error: errorMessage }, { status: 500 });
  }
}


export async function GET(request: NextRequest, context: RouteContext) { // Adicionado context
  const session = await getServerSession(authOptions);

  // Check if the user is authenticated
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Não autorizado' }, { status: 401 });
  }

  const { params } = context;
  const storeOwnerWebhookApiKey = params.storeOwnerWebhookApiKey;

  if (!storeOwnerWebhookApiKey) {
    return NextResponse.json({ message: "Webhook API Key da loja é obrigatória na URL." }, { status: 400 });
  }

  try {
    // 1. Find the store owner by the webhookApiKey from the URL
    const targetStoreOwner = await prisma.user.findUnique({
      where: { webhookApiKey: storeOwnerWebhookApiKey },
    });

    if (!targetStoreOwner) {
      return NextResponse.json({ message: "Webhook API Key da loja inválida ou dono não encontrado." }, { status: 404 });
    }

    // 2. Security check: Ensure the authenticated user is the owner of this webhookApiKey
    if (targetStoreOwner.id !== session.user.id) {
      return NextResponse.json({ message: 'Acesso negado. Você não tem permissão para acessar os dados desta loja.' }, { status: 403 });
    }

    // Fetch chat interactions for the validated store owner, ordered by timestamp
    const interactions = await prisma.chatInteraction.findMany({
      where: { userId: targetStoreOwner.id }, // Use o ID do dono da loja validado
      orderBy: {
        eventTimestamp: 'desc',
      },
      // Você pode querer incluir dados relacionados aqui, se necessário
      // include: {
      //   seller: true, // Se houver uma relação Seller no ChatInteraction
      // }
    });
    return NextResponse.json(interactions, { status: 200 });
  } catch (error) {
    console.error("Error in GET /api/conversas/[storeOwnerWebhookApiKey]:", error); // Log the error for debugging
    return NextResponse.json({ message: 'Erro ao buscar interações', error: (error as Error).message }, { status: 500 });
  }
}
