import prisma from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableCaption } from "@/components/ui/table";
import { ArrowLeft, UserCircle, MessageSquare, Star, CalendarDays, Eye, Hash } from "lucide-react";
import { Avaliacao } from "@prisma/client";
import { getServerSession } from "next-auth/next"; // Adicionado
import { authOptions } from "@/auth"; // Adicionado

export const dynamic = 'force-dynamic';

interface ClienteDetalhes {
  jid: string;
  nomeCliente: string;
  totalAvaliacoes: number;
  mediaNotas: number | null;
  primeiraAvaliacao: Date | null;
  ultimaAvaliacao: Date | null;
  avaliacoes: Avaliacao[];
}

async function getClienteDetalhes(jidSlug: string): Promise<ClienteDetalhes | null> {
  const session = await getServerSession(authOptions); // Adicionado
  if (!session?.user?.id) {
    return null; // Retorna nulo se não houver sessão
  }
  const userId = session.user.id;

  const originalJid = jidSlug.replace('_', '@');

  const avaliacoesCliente = await prisma.avaliacao.findMany({
    where: { 
      remoteJid: originalJid,
      userId: userId, // Adicionado filtro por userId
    },
    orderBy: { createdAt: 'desc' },
  });

  if (avaliacoesCliente.length === 0) {
    return null; // Cliente não encontrado ou sem avaliações
  }

  let somaNotas = 0;
  let countNotas = 0;
  avaliacoesCliente.forEach(av => {
    if (av.nota_cliente !== null) {
      somaNotas += av.nota_cliente;
      countNotas++;
    }
  });

  const mediaNotas = countNotas > 0 ? parseFloat((somaNotas / countNotas).toFixed(1)) : null;

  return {
    jid: originalJid,
    nomeCliente: originalJid.split('@')[0],
    totalAvaliacoes: avaliacoesCliente.length,
    mediaNotas,
    primeiraAvaliacao: avaliacoesCliente[avaliacoesCliente.length - 1]?.createdAt || null,
    ultimaAvaliacao: avaliacoesCliente[0]?.createdAt || null,
    avaliacoes: avaliacoesCliente,
  };
}

const getNotaBadgeVariant = (nota: number | null) => {
  if (nota === null) return "secondary";
  if (nota <= 2) return "destructive";
  if (nota <= 3) return "secondary";
  return "default";
};

export default async function ClienteDetalhePage({ params }: { params: { jid: string } }) {
  const cliente = await getClienteDetalhes(params.jid);
  const gradientText = "bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-teal-300 to-green-300";

  if (!cliente) {
    notFound();
  }

  const renderField = (label: string, value: string | number | null | Date, Icon?: React.ElementType) => {
    if (value === null || value === undefined || value === "") return null;
    
    let displayValue: React.ReactNode = String(value);
    if (value instanceof Date) {
      displayValue = value.toLocaleDateString('pt-BR', { year: 'numeric', month: 'long', day: 'numeric' });
    } else if (label === "Média de Notas" && typeof value === 'number') {
      displayValue = `${value}/10`;
    }


    return (
      <div className="flex items-center space-x-2 py-1">
        {Icon && <Icon className="h-4 w-4 text-gray-400 flex-shrink-0" />}
        <span className="text-sm font-medium text-gray-400">{label}:</span>
        <span className="text-sm text-gray-200">{displayValue}</span>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <Button asChild variant="outline" className="border-blue-500 text-blue-400 hover:bg-blue-700 hover:text-white">
        <Link href="/dashboard/clientes">
          <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para Clientes
        </Link>
      </Button>

      <Card className="bg-gray-800 border-gray-700 text-white shadow-xl">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <div>
              <CardTitle className={`text-2xl font-bold ${gradientText} flex items-center`}>
                <UserCircle className="mr-3 h-8 w-8" /> {cliente.nomeCliente}
              </CardTitle>
              <CardDescription className="text-gray-400">
                JID: {cliente.jid}
              </CardDescription>
            </div>
            {cliente.mediaNotas !== null && (
                <Badge variant={getNotaBadgeVariant(cliente.mediaNotas)} className="text-lg px-3 py-1 mt-2 sm:mt-0">
                  Média: {cliente.mediaNotas}/10
                </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 p-4 bg-gray-850 rounded-lg border border-gray-700">
            {renderField("Total de Avaliações", cliente.totalAvaliacoes, MessageSquare)}
            {renderField("Média de Notas", cliente.mediaNotas, Star)}
            {renderField("Primeira Avaliação", cliente.primeiraAvaliacao, CalendarDays)}
            {renderField("Última Avaliação", cliente.ultimaAvaliacao, CalendarDays)}
          </div>

          <div>
            <h3 className={`text-xl font-semibold mt-6 mb-3 ${gradientText}`}>Histórico de Avaliações</h3>
            <Table>
              <TableCaption className="text-gray-500">Todas as avaliações fornecidas por este cliente.</TableCaption>
              <TableHeader>
                <TableRow className="border-gray-700 hover:bg-gray-750">
                  <TableHead className="text-white">ID Avaliação</TableHead>
                  <TableHead className="text-white text-center">Nota</TableHead>
                  <TableHead className="text-white">Data</TableHead>
                  <TableHead className="text-right text-white">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cliente.avaliacoes.map((avaliacao) => (
                  <TableRow key={avaliacao.id} className="border-gray-700 hover:bg-gray-700">
                    <TableCell className="font-medium text-gray-300">
                      <Link href={`/dashboard/avaliacao/${avaliacao.id}`} className="hover:underline flex items-center">
                        <Hash className="h-4 w-4 mr-1 text-blue-400"/>{avaliacao.id.substring(0, 8)}...
                      </Link>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant={getNotaBadgeVariant(avaliacao.nota_cliente)} className="text-sm">
                        {avaliacao.nota_cliente !== null ? `${avaliacao.nota_cliente}/10` : 'N/A'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-400">{new Date(avaliacao.createdAt).toLocaleDateString('pt-BR')}</TableCell>
                    <TableCell className="text-right">
                      <Button asChild variant="ghost" size="sm" className="text-blue-400 hover:text-blue-300 hover:bg-blue-800">
                        <Link href={`/dashboard/avaliacao/${avaliacao.id}`}>
                          <Eye className="mr-2 h-4 w-4" /> Ver
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
        <CardFooter className="pt-6">
          <p className="text-xs text-gray-500">
            Informações detalhadas do cliente {cliente.nomeCliente}.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}