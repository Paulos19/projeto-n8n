import Link from 'next/link';
import prisma from "@/lib/prisma"; // Usaremos Prisma diretamente para Server Component
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";
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
import { UserPlus, Users, Eye, Edit, Trash2, ToggleLeft, ToggleRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
// import { SellerActions } from './components/seller-actions'; // Componente cliente para ações futuras

export const dynamic = 'force-dynamic'; // Garante que os dados sejam sempre frescos

interface Seller {
  id: string;
  name: string | null;
  evolutionInstanceName: string;
  evolutionApiKey: string; // Considerar não exibir diretamente na lista por segurança
  sellerWhatsAppNumber: string;
  isActive: boolean;
  createdAt: Date;
}

async function getSellers(): Promise<Seller[]> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return [];
  }
  const userId = session.user.id;

  const sellers = await prisma.seller.findMany({
    where: { storeOwnerId: userId },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      evolutionInstanceName: true,
      evolutionApiKey: true, // Apenas para ter o dado, mas não exibir na tabela principal
      sellerWhatsAppNumber: true,
      isActive: true,
      createdAt: true,
    }
  });
  return sellers as Seller[]; // Cast para Seller, assumindo que os campos correspondem
}

export default async function SellersPage() {
  const sellers = await getSellers();
  const gradientText = "bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-teal-300 to-green-300";

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
        <div>
          <h1 className={`text-3xl font-bold ${gradientText}`}>
            <Users className="inline-block mr-3 h-8 w-8" /> Gerenciar Vendedores
          </h1>
          <p className="text-gray-400">Visualize e gerencie os vendedores da sua loja.</p>
        </div>
        <Button asChild className="bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 text-white font-semibold shadow-md">
          <Link href="/dashboard/sellers/add">
            <UserPlus className="mr-2 h-5 w-5" /> Adicionar Novo Vendedor
          </Link>
        </Button>
      </div>

      <Card className="bg-gray-800 border-gray-700 text-white">
        <CardHeader>
          <CardTitle>Lista de Vendedores Cadastrados</CardTitle>
          <CardDescription className="text-gray-400">
            Total de {sellers.length} vendedor(es) encontrado(s).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableCaption className="text-gray-500">Uma lista dos seus vendedores cadastrados.</TableCaption>
            <TableHeader>
              <TableRow className="border-gray-700 hover:bg-gray-750">
                <TableHead className="text-white">Nome</TableHead>
                <TableHead className="text-white">Instância Evolution</TableHead>
                <TableHead className="text-white">Nº WhatsApp</TableHead>
                <TableHead className="text-white text-center">Status</TableHead>
                <TableHead className="text-white">Cadastrado em</TableHead>
                <TableHead className="text-right text-white">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sellers.map((seller) => (
                <TableRow key={seller.id} className="border-gray-700 hover:bg-gray-700">
                  <TableCell className="font-medium text-gray-300">{seller.name || 'N/A'}</TableCell>
                  <TableCell className="text-gray-300">{seller.evolutionInstanceName}</TableCell>
                  <TableCell className="text-gray-300">{seller.sellerWhatsAppNumber}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant={seller.isActive ? "default" : "destructive"} className={seller.isActive ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}>
                      {seller.isActive ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-gray-400">
                    {new Date(seller.createdAt).toLocaleDateString('pt-BR')}
                  </TableCell>
                  <TableCell className="text-right space-x-1">
                    {/* Ações atualizadas */}
                    <Button asChild variant="ghost" size="icon" className="text-blue-400 hover:text-blue-300 hover:bg-blue-800/50" title="Ver Detalhes">
                        <Link href={`/dashboard/sellers/${seller.id}`}>
                            <Eye className="h-4 w-4" />
                        </Link>
                    </Button>
                    <Button asChild variant="ghost" size="icon" className="text-yellow-400 hover:text-yellow-300 hover:bg-yellow-800/50" title="Editar">
                        <Link href={`/dashboard/sellers/${seller.id}/edit`}>
                            <Edit className="h-4 w-4" />
                        </Link>
                    </Button>
                     {/* O botão de excluir precisará de um componente cliente para confirmação e chamada da API */}
                     <Button variant="ghost" size="icon" className="text-red-400 hover:text-red-300 hover:bg-red-800/50" title="Excluir (implementar ação)" disabled>
                        <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {sellers.length === 0 && (
                <TableRow className="border-gray-700">
                  <TableCell colSpan={6} className="text-center text-gray-400 py-8">
                    Nenhum vendedor cadastrado ainda.
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