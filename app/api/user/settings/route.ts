import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/auth'; 
import prisma from '@/lib/prisma'; 

export async function PATCH(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Não autorizado' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, email, image } = body; 

    const updateData: { name?: string; email?: string; image?: string | null } = {};

    if (typeof name === 'string') {
      updateData.name = name;
    }
    if (typeof email === 'string') {

      updateData.email = email;
    }
    if (typeof image === 'string' || image === null) { 
      updateData.image = image;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ message: 'Nenhum dado para atualizar fornecido.' }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
    });


    const safeUser = {
      name: updatedUser.name,
      email: updatedUser.email,
      image: updatedUser.image,
    };

    return NextResponse.json({ message: 'Configurações atualizadas com sucesso!', user: safeUser }, { status: 200 });
  } catch (error) {
    console.error('Erro ao atualizar configurações do usuário:', error);

    // @ts-ignore
    if (error.code === 'P2002' && error.meta?.target?.includes('email')) {
      return NextResponse.json({ message: 'Este endereço de email já está em uso.' }, { status: 409 });
    }
    return NextResponse.json({ message: 'Erro interno do servidor ao atualizar configurações.' }, { status: 500 });
  }
}