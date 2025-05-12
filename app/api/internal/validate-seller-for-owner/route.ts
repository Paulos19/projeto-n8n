import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; // Certifique-se que o caminho para o Prisma Client está correto

// Interface atualizada para o payload de validação
interface ValidateSellerPayload {
  storeOwnerWebhookApiKey: string; // Chave API principal do dono da loja (User.webhookApiKey)
  sellerEvolutionInstanceName: string; // Nome da instância na Evolution API do vendedor
  sellerEvolutionApiKey: string; // Chave da Evolution API específica deste vendedor
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as ValidateSellerPayload;

    const {
      storeOwnerWebhookApiKey,
      sellerEvolutionInstanceName,
      sellerEvolutionApiKey,
    } = body;

    // Validação dos campos obrigatórios
    if (!storeOwnerWebhookApiKey || !sellerEvolutionInstanceName || !sellerEvolutionApiKey) {
      return NextResponse.json(
        { message: 'Campos obrigatórios faltando: storeOwnerWebhookApiKey, sellerEvolutionInstanceName e sellerEvolutionApiKey são necessários.' },
        { status: 400 }
      );
    }

    // 1. Encontrar o User (dono da loja) usando a storeOwnerWebhookApiKey
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

    // 2. Validar se o vendedor existe com os dados fornecidos e pertence ao dono da loja
    const seller = await prisma.seller.findFirst({
      where: {
        storeOwnerId,
        evolutionApiKey: sellerEvolutionApiKey,
        evolutionInstanceName: sellerEvolutionInstanceName,
        // isActive: true, // Descomente se quiser validar apenas vendedores ativos
      },
    });

    if (!seller) {
      return NextResponse.json(
        { message: 'Vendedor não encontrado ou não associado a este proprietário com os dados fornecidos (evolutionApiKey e evolutionInstanceName).' },
        { status: 404 }
      );
    }

    // Se o vendedor for encontrado e validado
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
    // A tratativa de erro P2002 (unique constraint) é menos provável de ocorrer aqui,
    // pois não estamos criando registros, mas pode ser mantida para outros erros do Prisma.
    // @ts-ignore
    if (error.code === 'P2002') {
        // @ts-ignore
      const target = error.meta?.target as string[] | undefined;
      let fieldMessage = "um campo único";
      if (target?.includes('evolutionInstanceName')) fieldMessage = "Nome da Instância Evolution";
      else if (target?.includes('evolutionApiKey')) fieldMessage = "API Key da Evolution";
      else if (target?.includes('sellerWhatsAppNumber')) fieldMessage = "Número do WhatsApp do Vendedor";
      
      // Esta mensagem pode precisar de ajuste, pois não estamos criando um vendedor.
      // Poderia ser um erro inesperado se P2002 ocorrer neste contexto.
      return NextResponse.json(
        { message: `Conflito de dados: ${fieldMessage} já existe de forma inesperada.` },
        { status: 409 }
      );
    }
    return NextResponse.json({ message: 'Erro interno do servidor ao validar vendedor.' }, { status: 500 });
  }
}