import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";

interface RouteContext {
  params: {
    id: string; 
  };
}


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
        storeOwnerId: session.user.id, 
      },
    });

    if (!seller) {
      return NextResponse.json({ message: 'Vendedor não encontrado ou acesso negado' }, { status: 404 });
    }





    return NextResponse.json(seller, { status: 200 });
  } catch (error) {
    console.error(`Erro ao buscar vendedor por ID (${sellerId}):`, error);
    return NextResponse.json({ message: 'Erro ao buscar vendedor', error: (error as Error).message }, { status: 500 });
  }
}


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


    const existingSeller = await prisma.seller.findUnique({
      where: { id: sellerId, storeOwnerId },
    });

    if (!existingSeller) {
      return NextResponse.json({ message: 'Vendedor não encontrado ou acesso negado' }, { status: 404 });
    }


    if (evolutionInstanceName && evolutionInstanceName !== existingSeller.evolutionInstanceName) {
        const conflict = await prisma.seller.findFirst({ where: { evolutionInstanceName, storeOwnerId, id: { not: sellerId } } });
        if (conflict) return NextResponse.json({ message: `Instância Evolution '${evolutionInstanceName}' já em uso.` }, { status: 409 });
    }
    if (evolutionApiKey && evolutionApiKey !== existingSeller.evolutionApiKey) { 
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

        evolutionApiKey: evolutionApiKey !== undefined ? evolutionApiKey : existingSeller.evolutionApiKey,
        sellerWhatsAppNumber: sellerWhatsAppNumber !== undefined ? sellerWhatsAppNumber : existingSeller.sellerWhatsAppNumber,
        isActive: isActive !== undefined ? isActive : existingSeller.isActive,
      },
    });

    return NextResponse.json({ message: 'Vendedor atualizado com sucesso!', seller: updatedSeller }, { status: 200 });
  } catch (error) {
    console.error(`Erro ao atualizar vendedor (${sellerId}):`, error);


    return NextResponse.json({ message: 'Erro ao atualizar vendedor', error: (error as Error).message }, { status: 500 });
  }
}


export async function DELETE(request: NextRequest, context: RouteContext) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Não autorizado' }, { status: 401 });
  }

  const { params } = context;
  const sellerId = params.id;

  try {

    const sellerToDelete = await prisma.seller.findUnique({
        where: { id: sellerId, storeOwnerId: session.user.id },
    });

    if (!sellerToDelete) {
        return NextResponse.json({ message: 'Vendedor não encontrado ou acesso negado' }, { status: 404 });
    }

    await prisma.seller.delete({
      where: {
        id: sellerId,
        storeOwnerId: session.user.id, 
      },
    });

    return NextResponse.json({ message: 'Vendedor excluído com sucesso!' }, { status: 200 });
  } catch (error) {
    console.error(`Erro ao excluir vendedor (${sellerId}):`, error);




    return NextResponse.json({ message: 'Erro ao excluir vendedor', error: (error as Error).message }, { status: 500 });
  }
}