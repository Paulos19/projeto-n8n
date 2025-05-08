import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto'; // Para gerar a API key

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, identifier } = await request.json();

    if (!email || !password || !identifier) {
      return NextResponse.json(
        { message: 'Email, senha e identificador (CPF/CNPJ) são obrigatórios.' },
        { status: 400 }
      );
    }

    const existingUserByIdentifier = await prisma.user.findUnique({
      where: { identifier },
    });

    if (existingUserByIdentifier) {
      return NextResponse.json(
        { message: 'Identificador (CPF/CNPJ) já cadastrado.' },
        { status: 409 } // Conflict
      );
    }
    
    const existingUserByEmail = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUserByEmail) {
      return NextResponse.json(
        { message: 'Email já cadastrado.' },
        { status: 409 } // Conflict
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);

    // Gerar uma Webhook API Key única
    const webhookApiKey = randomBytes(16).toString('hex'); // Gera uma string hexadecimal de 32 caracteres

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        identifier,
        webhookApiKey, // Salva a chave gerada
        // Adicione o role aqui se já estiver implementando papéis
        // role: 'OWNER', // Exemplo, se o primeiro cadastro for sempre OWNER
      },
    });

    // Não retorne a senha ou o hash da senha
    const { passwordHash: _, ...userWithoutPassword } = newUser;

    // Você pode optar por retornar a webhookApiKey aqui para que o frontend a exiba ao usuário
    // ou instruí-lo a encontrá-la em seu perfil após o login.
    return NextResponse.json(
      { 
        message: 'Usuário cadastrado com sucesso!', 
        user: userWithoutPassword,
        webhookApiKey: webhookApiKey // Opcional: retornar para exibição imediata
      }, 
      { status: 201 }
    );

  } catch (error) {
    console.error('Erro ao registrar usuário:', error);
    const errorMessage = error instanceof Error ? error.message : 'Ocorreu um erro desconhecido.';
    return NextResponse.json(
      { message: 'Erro interno do servidor.', error: errorMessage },
      { status: 500 }
    );
  }
}