import prisma from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Edit, UserCircle, Briefcase, Phone, Calendar, CheckCircle, XCircle } from "lucide-react";

interface SellerDetailsPageProps {
  params: {
    id: string;
  };
}

async function getSellerDetails(sellerId: string, userId: string) {
  try {
    const seller = await prisma.seller.findUnique({
      where: {
        id: sellerId,
        storeOwnerId: userId, 
      },
    });
    return seller;
  } catch (error) {
    console.error("Erro ao buscar detalhes do vendedor:", error);
    return null;
  }
}

export default async function SellerDetailsPage({ params }: SellerDetailsPageProps) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/auth/signin"); 
  }

  const seller = await getSellerDetails(params.id, session.user.id);

  if (!seller) {
    notFound();
  }
  
  const gradientText = "bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-teal-300 to-green-300";

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <Button asChild variant="outline" className="border-blue-500 text-blue-400 hover:bg-blue-700 hover:text-white">
        <Link href="/dashboard/sellers">
          <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para Vendedores
        </Link>
      </Button>

      <Card className="bg-gray-800 border-gray-700 text-white shadow-xl">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <div>
              <CardTitle className={`text-2xl font-bold ${gradientText} flex items-center`}>
                <UserCircle className="mr-3 h-8 w-8" /> {seller.name || "Vendedor Sem Nome"}
              </CardTitle>
              <CardDescription className="text-gray-400">
                Detalhes do Vendedor ID: {seller.id.substring(0,8)}...
              </CardDescription>
            </div>
            <Badge variant={seller.isActive ? "default" : "destructive"} className={`text-sm px-3 py-1 mt-2 sm:mt-0 ${seller.isActive ? "bg-green-600" : "bg-red-600"}`}>
              {seller.isActive ? <CheckCircle className="mr-1 h-4 w-4" /> : <XCircle className="mr-1 h-4 w-4" />}
              {seller.isActive ? "Ativo" : "Inativo"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          <div className="space-y-3">
            {seller.name && (
              <div className="flex items-center">
                <UserCircle className="h-5 w-5 mr-3 text-blue-400" />
                <span className="text-gray-400 font-medium">Nome:</span>
                <span className="ml-2 text-gray-200">{seller.name}</span>
              </div>
            )}
            <div className="flex items-center">
              <Briefcase className="h-5 w-5 mr-3 text-blue-400" />
              <span className="text-gray-400 font-medium">Instância Evolution:</span>
              <span className="ml-2 text-gray-200">{seller.evolutionInstanceName}</span>
            </div>
            <div className="flex items-center">
              <Phone className="h-5 w-5 mr-3 text-blue-400" />
              <span className="text-gray-400 font-medium">Nº WhatsApp:</span>
              <span className="ml-2 text-gray-200">{seller.sellerWhatsAppNumber}</span>
            </div>
            <div className="flex items-center">
              <Calendar className="h-5 w-5 mr-3 text-blue-400" />
              <span className="text-gray-400 font-medium">Cadastrado em:</span>
              <span className="ml-2 text-gray-200">{new Date(seller.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
            </div>
             <div className="flex items-center">
              <Calendar className="h-5 w-5 mr-3 text-blue-400" />
              <span className="text-gray-400 font-medium">Última Atualização:</span>
              <span className="ml-2 text-gray-200">{new Date(seller.updatedAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          </div>
        </CardContent>
        <CardFooter className="pt-6 flex justify-end">
          <Button asChild className="bg-yellow-500 hover:bg-yellow-600 text-white">
            <Link href={`/dashboard/sellers/${seller.id}/edit`}>
              <Edit className="mr-2 h-4 w-4" /> Editar Vendedor
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}