import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/auth';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  try {
    const { reportType, startDate: startDateStr, endDate: endDateStr } = await request.json();
    if (!reportType || !startDateStr || !endDateStr) {
      return NextResponse.json({ error: 'Tipo de relatório e período são obrigatórios.' }, { status: 400 });
    }

    const startDate = new Date(startDateStr);
    const endDate = new Date(endDateStr);
    endDate.setHours(23, 59, 59, 999);
    
    let dataToExport;

    switch (reportType) {
      case 'satisfacao':
        const satisfacaoData = await prisma.avaliacao.findMany({
          where: {
            userId: session.user.id,
            createdAt: { gte: startDate, lte: endDate },
          },
          select: {
            createdAt: true,
            remoteJid: true,
            nota_cliente: true,
            pontos_fortes: true,
            pontos_fracos: true,
            sugestoes_melhoria: true,
            resumo_atendimento: true,
            seller: {
              select: {
                name: true,
                evolutionInstanceName: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        });
        // Mapeia os dados para o formato final, incluindo nomes
        dataToExport = satisfacaoData.map(item => ({
          ...item,
          vendedor: item.seller?.name || item.seller?.evolutionInstanceName || 'N/A',
          cliente: item.remoteJid?.split('@')[0] || 'N/A'
        }));
        break;

      case 'desempenho-vendedor':
        const sellers = await prisma.seller.findMany({
          where: { storeOwnerId: session.user.id },
          select: {
            name: true,
            evolutionInstanceName: true,
            avaliacoes: {
              where: { createdAt: { gte: startDate, lte: endDate } },
              select: { nota_cliente: true }
            }
          }
        });
        dataToExport = sellers.map(seller => {
            const totalAvaliacoes = seller.avaliacoes.length;
            const somaNotas = seller.avaliacoes.reduce((acc, av) => acc + (av.nota_cliente || 0), 0);
            return {
                nome_vendedor: seller.name || seller.evolutionInstanceName,
                total_avaliacoes: totalAvaliacoes,
                nota_media: totalAvaliacoes > 0 ? (somaNotas / totalAvaliacoes).toFixed(2) : 'N/A'
            };
        });
        break;

      default:
        return NextResponse.json({ error: 'Tipo de relatório inválido.' }, { status: 400 });
    }

    if (!dataToExport || dataToExport.length === 0) {
        return NextResponse.json({ data: [] });
    }
    
    return NextResponse.json({ data: dataToExport });

  } catch (error) {
    console.error("Erro ao exportar dados:", error);
    return NextResponse.json({ error: 'Erro interno do servidor.' }, { status: 500 });
  }
}