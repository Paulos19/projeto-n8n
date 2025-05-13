import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; // Assuming prisma client is correctly set up
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth"; // Assuming authOptions are correctly set up

/**
 * Interface for the expected payload from N8N for each message.
 */
interface N8nMessagePayload {
  remoteJid: string;
  chat_history: Array<{
    sender: string;
    senderName: string;
    text: string;
    timestamp: number;
    messageType: string;
    fromMe: boolean;
  }>;
  analysis: {
    summary: string;
    keywords: string[];
  };
  customer: {
    name: string;
    number: string; // Same as remoteJid
  };
  timestamp: string; // ISO 8601 date string
  sellerId?: string; // <--- ADICIONE ESTA LINHA
  instanceName?: string; 
  sellerEvolutionApiKey?: string; 
}

/**
 * Interface for the route context, expecting apiKeyPath from dynamic route.
 */
interface RouteContext {
  params: {
    apiKeyPath?: string;
  };
}

/**
 * POST handler to receive chat interaction data from N8N.
 * It expects an array of N8nMessagePayload objects.
 * The apiKeyPath is extracted from the URL.
 */
export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { params } = context;
    const apiKeyPath = params.apiKeyPath; // User.webhookApiKey (dono da loja)

    // Validate if apiKeyPath is provided in the URL
    if (!apiKeyPath) {
      return NextResponse.json({ message: "API Key path é obrigatório na URL." }, { status: 400 });
    }

    // Parse the JSON payload from the request
    const payloadArray: N8nMessagePayload[] = await request.json();

    // Validate if the payload is an array and not empty
    if (!Array.isArray(payloadArray) || payloadArray.length === 0) {
      return NextResponse.json(
        { message: 'Corpo da requisição inválido: um array de mensagens é esperado.' },
        { status: 400 }
      );
    }

    // Find the user associated with the provided API key
    const user = await prisma.user.findUnique({
      where: { webhookApiKey: apiKeyPath },
    });

    if (!user) {
      return NextResponse.json({ message: "Webhook API Key (path) inválida ou usuário não encontrado." }, { status: 403 });
    }

    const results = [];

    for (const item of payloadArray) {
      // Validate required fields for each item
      if (!item.remoteJid || !item.chat_history || !item.analysis || !item.customer || !item.timestamp) {
        results.push({ success: false, message: 'Item inválido, dados faltando (remoteJid, chat_history, analysis, customer, ou timestamp).', item });
        continue; // Skip to the next item
      }
    
      // Prepare data for saving to the database
      let sellerIdToSave: string | null = null;
      let dbSellerInstanceName: string | null = null;
  
      // 1. Tentar encontrar pelo sellerId do payload, se fornecido
      if (item.sellerId) {
        const seller = await prisma.seller.findFirst({
          where: {
            id: item.sellerId,
            storeOwnerId: user.id, // Garante que o vendedor pertence ao dono da loja correto
          },
        });
        if (seller) {
          sellerIdToSave = seller.id;
          dbSellerInstanceName = seller.evolutionInstanceName;
        } else {
          console.warn(`Vendedor com sellerId (do payload) '${item.sellerId}' não encontrado ou não pertence ao usuário '${user.id}'. Verificando outros campos.`);
        }
      }
  
      // 2. Se não encontrado pelo sellerId do payload, tentar pelo sellerEvolutionApiKey
      if (!sellerIdToSave && item.sellerEvolutionApiKey) {
        const seller = await prisma.seller.findFirst({
          where: {
            storeOwnerId: user.id,
            evolutionApiKey: item.sellerEvolutionApiKey,
          },
        });
        if (seller) {
          sellerIdToSave = seller.id;
          dbSellerInstanceName = seller.evolutionInstanceName;
        } else {
          console.warn(`Vendedor com sellerEvolutionApiKey '${item.sellerEvolutionApiKey}' não encontrado para o usuário '${user.id}'. Payload instanceName: ${item.instanceName || 'N/A'}`);
        }
      } 
      
      // 3. Se ainda não encontrado, tentar pelo instanceName
      else if (!sellerIdToSave && item.instanceName) {
        const seller = await prisma.seller.findFirst({
          where: {
            storeOwnerId: user.id,
            evolutionInstanceName: item.instanceName,
          },
        });
        if (seller) {
          sellerIdToSave = seller.id;
          dbSellerInstanceName = seller.evolutionInstanceName; 
        } else {
          console.warn(`Vendedor com instanceName '${item.instanceName}' não encontrado (e sellerEvolutionApiKey/sellerId não fornecido ou inválido) para o usuário '${user.id}'`);
        }
      }
  
      if (!sellerIdToSave) {
         console.warn(`Nenhum vendedor pôde ser associado para o item do payload com remoteJid '${item.remoteJid}' para o usuário '${user.id}'. Item:`, JSON.stringify(item));
      }
      
      const dataToSave = {
        remoteJid: item.remoteJid,
        customerName: item.customer.name,
        chatHistory: item.chat_history as any,
        analysisSummary: item.analysis.summary,
        analysisKeywords: item.analysis.keywords,
        eventTimestamp: new Date(item.timestamp),
        userId: user.id,
        sellerId: sellerIdToSave, 
        sellerInstanceName: dbSellerInstanceName || item.instanceName || null,
      };
      
      const newInteraction = await prisma.chatInteraction.create({
        data: dataToSave,
      });
      results.push({ success: true, data: newInteraction });
    }

    // Determine the overall success and appropriate status code
    const allSuccessful = results.every(r => r.success);
    const status = allSuccessful ? 201 : (results.some(r => r.success) ? 207 : 400); // 207 for partial success

    // Return a summary response
    return NextResponse.json(
      {
        message: allSuccessful ? 'Todas as interações foram salvas com sucesso!' : 'Processamento concluído com alguns erros/avisos.',
        results
      },
      { status }
    );

  } catch (error) {
    let errorMessage = 'Erro desconhecido ao processar dados.';
    if (error instanceof SyntaxError) {
      errorMessage = 'Erro de parsing do JSON. Verifique se o corpo da requisição é um JSON array válido.';
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }
    console.error("Error in POST /api/conversas:", error); // Log the error for debugging
    return NextResponse.json({ message: 'Erro ao salvar interações', error: errorMessage }, { status: 500 });
  }
}
