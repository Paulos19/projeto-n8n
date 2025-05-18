import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next'; 
import prisma from '@/lib/prisma'; 
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


    if (!evolutionInstanceName || !evolutionApiKey || !sellerWhatsAppNumber) {
      return NextResponse.json(
        { message: 'Campos obrigatórios faltando: Nome da Instância Evolution, API Key da Evolution e Número do WhatsApp do Vendedor são necessários.' },
        { status: 400 }
      );
    }


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
        { status: 409 } 
      );
    }

    const newSeller = await prisma.seller.create({
      data: {
        name: name || null, 
        evolutionInstanceName,
        evolutionApiKey,
        sellerWhatsAppNumber,
        storeOwnerId,
        isActive: true, 
      },
    });

    return NextResponse.json({ message: 'Vendedor adicionado com sucesso!', seller: newSeller }, { status: 201 });
  } catch (error) {
    console.error('Erro ao adicionar vendedor:', error);
    if (error instanceof SyntaxError) {
      return NextResponse.json({ message: 'Erro de sintaxe no JSON recebido.' }, { status: 400 });
    }


    return NextResponse.json({ message: 'Erro interno do servidor ao adicionar vendedor.' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Não autorizado.' }, { status: 401 });
    }

    const storeOwnerId = session.user.id;

    const sellers = await prisma.seller.findMany({
      where: {
        storeOwnerId: storeOwnerId,
      },
      orderBy: {
        createdAt: 'desc', 
      },
    });

    return NextResponse.json({ sellers }, { status: 200 });
  } catch (error) {
    console.error('Erro ao buscar vendedores:', error);
    return NextResponse.json({ message: 'Erro interno do servidor ao buscar vendedores.' }, { status: 500 });
  }
}