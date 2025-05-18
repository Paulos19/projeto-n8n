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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UserPlus, Users, Eye } from "lucide-react";
import { getServerSession } from "next-auth/next"; 
import { authOptions } from "@/auth"; 

export const dynamic = 'force-dynamic'; 

interface ClienteInfo {
  jid: string;
  nomeCliente: string;
  totalAvaliacoes: number;
  ultimaAvaliacao: Date | null;
}

async function getClientes(): Promise<ClienteInfo[]> {
  const session = await getServerSession(authOptions); 
  if (!session?.user?.id) {
    return []; 
  }
  const userId = session.user.id;

  const avaliacoes = await prisma.avaliacao.findMany({
    where: { userId: userId }, 
    select: { remoteJid: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
  });

  if (avaliacoes.length === 0) {
    return [];
  }

  const clientesMap = new Map<string, { totalAvaliacoes: number; ultimaAvaliacao: Date | null }>();

  for (const avaliacao of avaliacoes) {
    if (avaliacao.remoteJid) {
      const clienteData = clientesMap.get(avaliacao.remoteJid) || { totalAvaliacoes: 0, ultimaAvaliacao: null };
      clienteData.totalAvaliacoes += 1;
      if (!clienteData.ultimaAvaliacao || avaliacao.createdAt > clienteData.ultimaAvaliacao) {
        clienteData.ultimaAvaliacao = avaliacao.createdAt;
      }
      clientesMap.set(avaliacao.remoteJid, clienteData);
    }
  }

  const clientesInfo: ClienteInfo[] = [];
  for (const [jid, data] of clientesMap.entries()) {
    clientesInfo.push({
      jid,
      nomeCliente: jid.split('@')[0], 
      totalAvaliacoes: data.totalAvaliacoes,
      ultimaAvaliacao: data.ultimaAvaliacao,
    });
  }


  clientesInfo.sort((a, b) => {
    if (a.ultimaAvaliacao && b.ultimaAvaliacao) {
      return b.ultimaAvaliacao.getTime() - a.ultimaAvaliacao.getTime();
    }
    if (a.ultimaAvaliacao) return -1;
    if (b.ultimaAvaliacao) return 1;
    return 0;
  });

  return clientesInfo;
}

export default async function ClientesPage() {
  const clientes = await getClientes();
  const gradientText = "bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-teal-300 to-green-300";

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
        <div>
          <h1 className={`text-3xl font-bold ${gradientText}`}>
            <Users className="inline-block mr-3 h-8 w-8" /> Gerenciamento de Clientes
          </h1>
          <p className="text-gray-400">Visualize e gerencie os clientes que interagiram com o R.A.I.O.</p>
        </div>
        <Button asChild className="bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 text-white font-semibold shadow-md">
          <Link href="/dashboard/clientes/novo">
            <UserPlus className="mr-2 h-5 w-5" /> Adicionar Novo Cliente
          </Link>
        </Button>
      </div>

      <Card className="bg-gray-800 border-gray-700 text-white">
        <CardHeader>
          <CardTitle>Lista de Clientes</CardTitle>
          <CardDescription className="text-gray-400">
            Total de {clientes.length} clientes únicos encontrados.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableCaption className="text-gray-500">Uma lista dos seus clientes e suas atividades recentes.</TableCaption>
            <TableHeader>
              <TableRow className="border-gray-700 hover:bg-gray-750">
                <TableHead className="text-white">Nome/ID Cliente</TableHead>
                <TableHead className="text-white text-center">Total de Avaliações</TableHead>
                <TableHead className="text-white">Última Avaliação</TableHead>
                <TableHead className="text-right text-white">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clientes.map((cliente) => (
                <TableRow key={cliente.jid} className="border-gray-700 hover:bg-gray-700">
                  <TableCell className="font-medium text-gray-300">{cliente.nomeCliente}</TableCell>
                  <TableCell className="text-center text-gray-300">{cliente.totalAvaliacoes}</TableCell>
                  <TableCell className="text-gray-400">
                    {cliente.ultimaAvaliacao ? new Date(cliente.ultimaAvaliacao).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button asChild variant="ghost" size="sm" className="text-blue-400 hover:text-blue-300 hover:bg-blue-800">
                      {}
                      <Link href={`/dashboard/clientes/${cliente.jid.replace('@', '_')}`}> 
                        <Eye className="mr-2 h-4 w-4" /> Ver Detalhes
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {clientes.length === 0 && (
                <TableRow className="border-gray-700">
                  <TableCell colSpan={4} className="text-center text-gray-400 py-8">
                    Nenhum cliente encontrado.
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