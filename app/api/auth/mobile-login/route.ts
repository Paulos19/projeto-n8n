// No projeto Next.js: app/api/auth/mobile-login/route.ts

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export async function POST(request: NextRequest) {
  try {
    const { identifier, password } = await request.json();

    if (!identifier || !password) {
      return NextResponse.json({ message: 'Identificador e senha são obrigatórios.' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { identifier },
    });

    if (!user || !user.passwordHash) {
      return NextResponse.json({ message: 'Credenciais inválidas.' }, { status: 401 });
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      return NextResponse.json({ message: 'Credenciais inválidas.' }, { status: 401 });
    }

    // Se a senha for válida, gere o Token JWT
    const token = jwt.sign(
      { 
        id: user.id, 
        name: user.name, 
        email: user.email, 
        role: user.role,
        image: user.image
      },
      process.env.AUTH_SECRET as string, // Usamos o mesmo segredo do NextAuth
      { expiresIn: '7d' } // Token expira em 7 dias
    );

    return NextResponse.json({ message: "Login bem-sucedido!", token: token, user: { id: user.id, name: user.name, email: user.email, role: user.role, image: user.image } });

  } catch (error) {
    console.error("Erro na rota mobile-login: ", error);
    return NextResponse.json({ message: 'Erro interno do servidor.' }, { status: 500 });
  }
}