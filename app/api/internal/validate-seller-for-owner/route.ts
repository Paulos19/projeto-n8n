import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; 


interface ValidateSellerPayload {
  storeOwnerWebhookApiKey: string; 
  sellerEvolutionInstanceName: string; 
  sellerEvolutionApiKey: string; 
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as ValidateSellerPayload;

    const {
      storeOwnerWebhookApiKey,
      sellerEvolutionInstanceName,
      sellerEvolutionApiKey,
    } = body;


    if (!storeOwnerWebhookApiKey || !sellerEvolutionInstanceName || !sellerEvolutionApiKey) {
      return NextResponse.json(
        { message: 'Campos obrigatórios faltando: storeOwnerWebhookApiKey, sellerEvolutionInstanceName e sellerEvolutionApiKey são necessários.' },
        { status: 400 }
      );
    }


    const storeOwner = await prisma.user.findUnique({
      where: { webhookApiKey: storeOwnerWebhookApiKey },
    });

    if (!storeOwner) {
      return NextResponse.json(
        { message: 'storeOwnerWebhookApiKey inválida ou proprietário da loja não encontrado.' },
        { status: 403 }
      );
    }

    const storeOwnerId = storeOwner.id;


    const seller = await prisma.seller.findFirst({
      where: {
        storeOwnerId,
        evolutionApiKey: sellerEvolutionApiKey,
        evolutionInstanceName: sellerEvolutionInstanceName,

      },
    });

    if (!seller) {
      return NextResponse.json(
        { message: 'Vendedor não encontrado ou não associado a este proprietário com os dados fornecidos (evolutionApiKey e evolutionInstanceName).' },
        { status: 404 }
      );
    }


    return NextResponse.json({
      message: 'Vendedor validado com sucesso para este proprietário.',
      seller: {
        id: seller.id,
        name: seller.name,
        evolutionInstanceName: seller.evolutionInstanceName,
        sellerWhatsAppNumber: seller.sellerWhatsAppNumber,
        isActive: seller.isActive,
      }
    }, { status: 200 });

  } catch (error) {
    console.error('Erro ao validar vendedor:', error);
    if (error instanceof SyntaxError) {
      return NextResponse.json({ message: 'Erro de sintaxe no JSON recebido.' }, { status: 400 });
    }


    // @ts-ignore
    if (error.code === 'P2002') {
      // @ts-ignore
      const target = error.meta?.target as string[] | undefined;
      let fieldMessage = "um campo único";
      if (target?.includes('evolutionInstanceName')) fieldMessage = "Nome da Instância Evolution";
      else if (target?.includes('evolutionApiKey')) fieldMessage = "API Key da Evolution";
      else if (target?.includes('sellerWhatsAppNumber')) fieldMessage = "Número do WhatsApp do Vendedor";
      


      return NextResponse.json(
        { message: `Conflito de dados: ${fieldMessage} já existe de forma inesperada.` },
        { status: 409 }
      );
    }
    return NextResponse.json({ message: 'Erro interno do servidor ao validar vendedor.' }, { status: 500 });
  }
}