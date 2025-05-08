import Link from "next/link";
import prisma from "@/lib/prisma";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, PlusCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";

export const dynamic = 'force-dynamic'; // Garante que os dados sejam sempre frescos

async function getAvaliacoes(userId: string) {
  const avaliacoes = await prisma.avaliacao.findMany({
    where: {
      userId: userId,
    },
    orderBy: {
      createdAt: 'desc',
    },
    // Poderia adicionar paginação aqui no futuro
  });
  return avaliacoes;
}

export default async function AvaliacoesPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return (
      <div>
        <h1 className="text-2xl font-bold">Acesso Negado</h1>
        <p>Você precisa estar logado para ver suas avaliações.</p>
      </div>
    );
  }
  const userId = session.user.id;
  const webhookApiKey = session.user.webhookApiKey;

  const avaliacoes = await getAvaliacoes(userId);
  const gradientText = "bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-teal-300 to-green-300";

  const getNotaBadgeVariant = (nota: number | null) => {
    if (nota === null) return "secondary";
    if (nota <= 2) return "destructive";
    if (nota <= 3) return "secondary"; // Amarelo/Laranja seria ideal, mas ShadCN default não tem. Usando secondary.
    return "default"; // Verde para notas boas (default é azulado/verdeado no tema)
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
        <div>
          <h1 className={`text-3xl font-bold ${gradientText}`}>Todas as Avaliações</h1>
          <p className="text-gray-400">Visualize e gerencie todas as avaliações recebidas.</p>
        </div>
        <Button asChild className="bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 text-white font-semibold shadow-md transition-all duration-300 ease-in-out transform hover:scale-105">
          <Link href="/dashboard/avaliacoes/nova">
            <PlusCircle className="mr-2 h-5 w-5" /> Nova Avaliação
          </Link>
        </Button>
      </div>

      <Card className="bg-gray-800 border-gray-700 text-white">
        <CardHeader>
          <CardTitle>Lista de Avaliações</CardTitle>
          <CardDescription className="text-gray-400">
            Total de {avaliacoes.length} avaliações encontradas.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableCaption className="text-gray-500">Uma lista das suas avaliações recentes.</TableCaption>
            <TableHeader>
              <TableRow className="border-gray-700 hover:bg-gray-750">
                <TableHead className="w-[150px] text-white">ID da Avaliação</TableHead>
                <TableHead className="text-white">Cliente (JID)</TableHead>
                <TableHead className="text-white text-center">Nota Cliente</TableHead>
                <TableHead className="text-white">Data</TableHead>
                <TableHead className="text-right text-white">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {avaliacoes.map((avaliacao) => (
                <TableRow key={avaliacao.id} className="border-gray-700 hover:bg-gray-700">
                  <TableCell className="font-medium text-gray-300">{avaliacao.id.substring(0, 8)}...</TableCell>
                  <TableCell className="text-gray-300">{avaliacao.remoteJid ? avaliacao.remoteJid.split('@')[0] : 'N/A'}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant={getNotaBadgeVariant(avaliacao.nota_cliente)} className="text-sm">
                      {avaliacao.nota_cliente !== null ? avaliacao.nota_cliente : 'N/A'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-gray-400">{new Date(avaliacao.createdAt).toLocaleDateString('pt-BR')}</TableCell>
                  <TableCell className="text-right">
                    <Button asChild variant="ghost" size="sm" className="text-blue-400 hover:text-blue-300 hover:bg-blue-800">
                      <Link href={`/dashboard/avaliacao/${avaliacao.id}`}>
                        <Eye className="mr-2 h-4 w-4" /> Ver Detalhes
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {avaliacoes.length === 0 && (
                <TableRow className="border-gray-700">
                  <TableCell colSpan={5} className="text-center text-gray-400 py-8">
                    Nenhuma avaliação encontrada.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}