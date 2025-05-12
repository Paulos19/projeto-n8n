import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; // Certifique-se que o caminho para o Prisma Client está correto

interface InitializeSellerProfilePayload {
  webhookApiKey: string;
  name?: string; // Nome de exibição para o vendedor (opcional)
  evolutionInstanceName: string; // Nome da instância na Evolution API
  evolutionApiKey: string; // Chave da Evolution API específica deste vendedor
  sellerWhatsAppNumber: string; // Número do WhatsApp da instância Evolution do vendedor
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as InitializeSellerProfilePayload;

    const {
      webhookApiKey,
      name,
      evolutionInstanceName,
      evolutionApiKey,
      sellerWhatsAppNumber,
    } = body;

    // Validação dos campos obrigatórios
    if (!webhookApiKey || !evolutionInstanceName || !evolutionApiKey || !sellerWhatsAppNumber) {
      return NextResponse.json(
        { message: 'Campos obrigatórios faltando: webhookApiKey, evolutionInstanceName, evolutionApiKey e sellerWhatsAppNumber são necessários.' },
        { status: 400 }
      );
    }

    // 1. Encontrar o User (dono da loja) usando a webhookApiKey
    const storeOwner = await prisma.user.findUnique({
      where: { webhookApiKey: webhookApiKey },
    });

    if (!storeOwner) {
      return NextResponse.json(
        { message: 'webhookApiKey inválida ou usuário (dono da loja) não encontrado.' },
        { status: 403 } // Forbidden ou Not Found
      );
    }

    const storeOwnerId = storeOwner.id;

    // 2. Verificar se já existe um vendedor com os mesmos identificadores únicos para esta loja
    const existingSeller = await prisma.seller.findFirst({
      where: {
        storeOwnerId,
        OR: [
          { evolutionInstanceName },
          { evolutionApiKey },
          { sellerWhatsAppNumber },
        ],
      },
    });

    if (existingSeller) {
      let conflictField = '';
      if (existingSeller.evolutionInstanceName === evolutionInstanceName) conflictField = 'Nome da Instância Evolution';
      else if (existingSeller.evolutionApiKey === evolutionApiKey) conflictField = 'API Key da Evolution';
      else if (existingSeller.sellerWhatsAppNumber === sellerWhatsAppNumber) conflictField = 'Número do WhatsApp do Vendedor';
      
      return NextResponse.json(
        { message: `Um vendedor com este ${conflictField} já existe para sua loja.` },
        { status: 409 } // Conflict
      );
    }

    // 3. Criar o novo Seller
    const newSeller = await prisma.seller.create({
      data: {
        name: name || null, // Nome é opcional
        evolutionInstanceName,
        evolutionApiKey,
        sellerWhatsAppNumber,
        storeOwnerId, // ID do dono da loja encontrado
        isActive: true, // Por padrão, o vendedor é ativo
      },
    });

    return NextResponse.json({ message: 'Perfil do vendedor inicializado e salvo com sucesso!', seller: newSeller }, { status: 201 });

  } catch (error) {
    console.error('Erro ao inicializar perfil do vendedor:', error);
    if (error instanceof SyntaxError) {
      return NextResponse.json({ message: 'Erro de sintaxe no JSON recebido.' }, { status: 400 });
    }
    // @ts-ignore
    if (error.code === 'P2002') { // Exemplo de tratamento de erro específico do Prisma para unique constraint
        // @ts-ignore
      const target = error.meta?.target as string[] | undefined;
      let fieldMessage = "um campo único";
      if (target?.includes('evolutionInstanceName')) fieldMessage = "Nome da Instância Evolution";
      else if (target?.includes('evolutionApiKey')) fieldMessage = "API Key da Evolution";
      else if (target?.includes('sellerWhatsAppNumber')) fieldMessage = "Número do WhatsApp do Vendedor";
      
      return NextResponse.json(
        { message: `Já existe um vendedor com este ${fieldMessage} para sua loja.` },
        { status: 409 }
      );
    }
    return NextResponse.json({ message: 'Erro interno do servidor ao inicializar perfil do vendedor.' }, { status: 500 });
  }
}