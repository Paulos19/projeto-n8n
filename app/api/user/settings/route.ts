import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/auth'; // Certifique-se que o caminho está correto
import prisma from '@/lib/prisma'; // Certifique-se que o caminho está correto

export async function PATCH(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Não autorizado' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, email, image } = body; // 'image' será a URL da imagem do Firebase

    const updateData: { name?: string; email?: string; image?: string | null } = {};

    if (typeof name === 'string') {
      updateData.name = name;
    }
    if (typeof email === 'string') {
      // Adicionar validação de email se necessário
      updateData.email = email;
    }
    if (typeof image === 'string' || image === null) { // Permite string ou null para remover imagem
      updateData.image = image;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ message: 'Nenhum dado para atualizar fornecido.' }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
    });

    // Não retorne a senha ou outros dados sensíveis
    const safeUser = {
      name: updatedUser.name,
      email: updatedUser.email,
      image: updatedUser.image,
    };

    return NextResponse.json({ message: 'Configurações atualizadas com sucesso!', user: safeUser }, { status: 200 });
  } catch (error) {
    console.error('Erro ao atualizar configurações do usuário:', error);
    // Verificar se é um erro de constraint única (ex: email já existe)
    // @ts-ignore
    if (error.code === 'P2002' && error.meta?.target?.includes('email')) {
      return NextResponse.json({ message: 'Este endereço de email já está em uso.' }, { status: 409 });
    }
    return NextResponse.json({ message: 'Erro interno do servidor ao atualizar configurações.' }, { status: 500 });
  }
}