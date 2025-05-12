import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next'; // Supondo que suas opções do NextAuth estão aqui
import prisma from '@/lib/prisma'; // Seu cliente Prisma
import { authOptions } from '@/auth';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Não autorizado. Faça login para adicionar vendedores.' }, { status: 401 });
    }

    const storeOwnerId = session.user.id;
    const body = await request.json();

    const {
      name,
      evolutionInstanceName,
      evolutionApiKey,
      sellerWhatsAppNumber,
    } = body;

    // Validação básica dos campos obrigatórios
    if (!evolutionInstanceName || !evolutionApiKey || !sellerWhatsAppNumber) {
      return NextResponse.json(
        { message: 'Campos obrigatórios faltando: Nome da Instância Evolution, API Key da Evolution e Número do WhatsApp do Vendedor são necessários.' },
        { status: 400 }
      );
    }

    // Verificar se já existe um vendedor com os mesmos identificadores únicos para esta loja
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

    const newSeller = await prisma.seller.create({
      data: {
        name: name || null, // Nome é opcional
        evolutionInstanceName,
        evolutionApiKey,
        sellerWhatsAppNumber,
        storeOwnerId,
        isActive: true, // Por padrão, o vendedor é ativo
      },
    });

    return NextResponse.json({ message: 'Vendedor adicionado com sucesso!', seller: newSeller }, { status: 201 });
  } catch (error) {
    console.error('Erro ao adicionar vendedor:', error);
    if (error instanceof SyntaxError) {
      return NextResponse.json({ message: 'Erro de sintaxe no JSON recebido.' }, { status: 400 });
    }
    // Adicionar verificação para erros do Prisma (ex: violação de constraint única se não coberta acima)
    // if (error.code === 'P2002') { ... } 
    return NextResponse.json({ message: 'Erro interno do servidor ao adicionar vendedor.' }, { status: 500 });
  }
}