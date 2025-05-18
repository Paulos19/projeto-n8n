import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto'; 

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
        { status: 409 } 
      );
    }
    
    const existingUserByEmail = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUserByEmail) {
      return NextResponse.json(
        { message: 'Email já cadastrado.' },
        { status: 409 } 
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);


    const webhookApiKey = randomBytes(16).toString('hex'); 

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        identifier,
        webhookApiKey, 


      },
    });


    const { passwordHash: _, ...userWithoutPassword } = newUser;



    return NextResponse.json(
      { 
        message: 'Usuário cadastrado com sucesso!', 
        user: userWithoutPassword,
        webhookApiKey: webhookApiKey 
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