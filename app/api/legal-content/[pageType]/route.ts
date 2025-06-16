import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

interface RouteContext {
  params: {
    pageType: string; // 'termos' ou 'privacidade'
  };
}

export async function GET(request: NextRequest, { params }: RouteContext) {
  try {
    const { pageType } = params;
    
    const legalContent = await prisma.legalContent.findUnique({
      where: { pageType },
    });

    if (!legalContent) {
      // Retorna um conteúdo padrão se nada for encontrado no banco de dados
      return NextResponse.json({ 
        content: `# ${pageType.charAt(0).toUpperCase() + pageType.slice(1)}\n\nConteúdo ainda não definido.` 
      });
    }

    return NextResponse.json(legalContent);
  } catch (error) {
    return NextResponse.json({ message: 'Erro ao buscar conteúdo.' }, { status: 500 });
  }
}
