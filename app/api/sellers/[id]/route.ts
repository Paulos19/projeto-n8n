import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";

interface RouteContext {
  params: {
    id: string; // ID do vendedor
  };
}

// GET: Buscar um vendedor específico
export async function GET(request: NextRequest, context: RouteContext) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Não autorizado' }, { status: 401 });
  }

  const { params } = context;
  const sellerId = params.id;

  try {
    const seller = await prisma.seller.findUnique({
      where: {
        id: sellerId,
        storeOwnerId: session.user.id, // Garante que o vendedor pertence ao usuário logado
      },
    });

    if (!seller) {
      return NextResponse.json({ message: 'Vendedor não encontrado ou acesso negado' }, { status: 404 });
    }
    // Não retornar a API Key diretamente por padrão, a menos que seja estritamente necessário
    // e o frontend esteja preparado para lidar com isso de forma segura.
    // Para o formulário de edição, pode ser útil, mas considere os riscos.
    // Aqui, vamos retornar para que o formulário de edição possa saber a original,
    // mas o campo no formulário não será pré-preenchido.
    return NextResponse.json(seller, { status: 200 });
  } catch (error) {
    console.error(`Erro ao buscar vendedor por ID (${sellerId}):`, error);
    return NextResponse.json({ message: 'Erro ao buscar vendedor', error: (error as Error).message }, { status: 500 });
  }
}

// PATCH: Atualizar um vendedor específico
export async function PATCH(request: NextRequest, context: RouteContext) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Não autorizado' }, { status: 401 });
  }

  const { params } = context;
  const sellerId = params.id;
  const storeOwnerId = session.user.id;

  try {
    const body = await request.json();
    const { name, evolutionInstanceName, evolutionApiKey, sellerWhatsAppNumber, isActive } = body;

    // Verificar se o vendedor existe e pertence ao usuário
    const existingSeller = await prisma.seller.findUnique({
      where: { id: sellerId, storeOwnerId },
    });

    if (!existingSeller) {
      return NextResponse.json({ message: 'Vendedor não encontrado ou acesso negado' }, { status: 404 });
    }

    // Validar se os novos identificadores únicos (se alterados) já existem em outro vendedor da mesma loja
    if (evolutionInstanceName && evolutionInstanceName !== existingSeller.evolutionInstanceName) {
        const conflict = await prisma.seller.findFirst({ where: { evolutionInstanceName, storeOwnerId, id: { not: sellerId } } });
        if (conflict) return NextResponse.json({ message: `Instância Evolution '${evolutionInstanceName}' já em uso.` }, { status: 409 });
    }
    if (evolutionApiKey && evolutionApiKey !== existingSeller.evolutionApiKey) { // Apenas se uma NOVA API key for fornecida
        const conflict = await prisma.seller.findFirst({ where: { evolutionApiKey, storeOwnerId, id: { not: sellerId } } });
        if (conflict) return NextResponse.json({ message: `API Key da Evolution já em uso.` }, { status: 409 });
    }
    if (sellerWhatsAppNumber && sellerWhatsAppNumber !== existingSeller.sellerWhatsAppNumber) {
        const conflict = await prisma.seller.findFirst({ where: { sellerWhatsAppNumber, storeOwnerId, id: { not: sellerId } } });
        if (conflict) return NextResponse.json({ message: `Número WhatsApp '${sellerWhatsAppNumber}' já em uso.` }, { status: 409 });
    }
    
    const updatedSeller = await prisma.seller.update({
      where: {
        id: sellerId,
        storeOwnerId: storeOwnerId,
      },
      data: {
        name: name !== undefined ? name : existingSeller.name,
        evolutionInstanceName: evolutionInstanceName !== undefined ? evolutionInstanceName : existingSeller.evolutionInstanceName,
        // Atualizar a API Key apenas se uma nova for fornecida no payload
        evolutionApiKey: evolutionApiKey !== undefined ? evolutionApiKey : existingSeller.evolutionApiKey,
        sellerWhatsAppNumber: sellerWhatsAppNumber !== undefined ? sellerWhatsAppNumber : existingSeller.sellerWhatsAppNumber,
        isActive: isActive !== undefined ? isActive : existingSeller.isActive,
      },
    });

    return NextResponse.json({ message: 'Vendedor atualizado com sucesso!', seller: updatedSeller }, { status: 200 });
  } catch (error) {
    console.error(`Erro ao atualizar vendedor (${sellerId}):`, error);
    // Adicionar tratamento para erros de validação do Prisma (ex: P2002 para unique constraints)
    // if (error.code === 'P2002') { ... }
    return NextResponse.json({ message: 'Erro ao atualizar vendedor', error: (error as Error).message }, { status: 500 });
  }
}

// DELETE: Excluir um vendedor específico
export async function DELETE(request: NextRequest, context: RouteContext) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Não autorizado' }, { status: 401 });
  }

  const { params } = context;
  const sellerId = params.id;

  try {
    // Verificar se o vendedor existe e pertence ao usuário antes de deletar
    const sellerToDelete = await prisma.seller.findUnique({
        where: { id: sellerId, storeOwnerId: session.user.id },
    });

    if (!sellerToDelete) {
        return NextResponse.json({ message: 'Vendedor não encontrado ou acesso negado' }, { status: 404 });
    }

    await prisma.seller.delete({
      where: {
        id: sellerId,
        storeOwnerId: session.user.id, // Segurança extra
      },
    });

    return NextResponse.json({ message: 'Vendedor excluído com sucesso!' }, { status: 200 });
  } catch (error) {
    console.error(`Erro ao excluir vendedor (${sellerId}):`, error);
    // Adicionar tratamento para erros específicos do Prisma, como P2025 (Record to delete does not exist)
    // if (error.code === 'P2025') {
    //   return NextResponse.json({ message: 'Vendedor não encontrado para exclusão' }, { status: 404 });
    // }
    return NextResponse.json({ message: 'Erro ao excluir vendedor', error: (error as Error).message }, { status: 500 });
  }
}