import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, MessageSquare, Star, ThumbsUp, ThumbsDown, User, CalendarDays, Activity } from "lucide-react";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";


interface AvaliacaoData {
  id: string;
  remoteJid: string | null;
  nota_cliente: number | null;
  pontos_fortes: string[] | null;
  pontos_fracos: string[] | null;
  sugestoes_melhoria: string[] | null;
  tempo_resposta: string | null;
  clareza_comunicacao: string | null;
  resolucao_problema: string | null;
  resumo_atendimento: string | null;
  createdAt: Date;
  updatedAt: Date;


}

async function fetchAvaliacaoById(id: string, userId: string): Promise<AvaliacaoData | null> {
  try {
    const avaliacao = await prisma.avaliacao.findUnique({
      where: { id },
    });

    if (!avaliacao) {
      return null;
    }




    if (avaliacao.userId !== userId) {
      console.warn(`Tentativa de acesso negado à avaliação ${id} pelo usuário ${userId}. Avaliação pertence a ${avaliacao.userId}`);
      return null;
    }
    return avaliacao as AvaliacaoData;
  } catch (error) {
    console.error("Erro ao buscar avaliação:", error);
    return null;
  }
}

export default async function AvaliacaoDetalhePage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {


    notFound();
  }

  const avaliacao = await fetchAvaliacaoById(params.id, session.user.id);
  const gradientText = "bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-teal-300 to-green-300";

  if (!avaliacao) {
    notFound(); 
  }

  const getNotaBadgeVariant = (nota: number | null): "default" | "secondary" | "destructive" | "outline" | null => {
    if (nota === null) return "secondary";
    if (nota <= 2) return "destructive";
    if (nota <= 3) return "secondary"; 
    return "default"; 
  };

  const renderField = (
    label: string,
    value: string | number | string[] | null | Date,
    Icon?: React.ElementType,
    isBadgeList?: boolean, 
    badgeVariant?: "default" | "secondary" | "destructive" | "outline" | null
  ) => {
    if (value === null || value === undefined || (typeof value === 'string' && value.trim() === "") || (Array.isArray(value) && value.length === 0)) {
      return null;
    }

    let displayValue: React.ReactNode;

    if (value instanceof Date) {
      displayValue = value.toLocaleDateString('pt-BR', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    } else if (isBadgeList && Array.isArray(value)) {
      displayValue = (
        <div className="flex flex-wrap gap-2">
          {value.map((item, index) => (
            <Badge 
              key={index} 
              variant={badgeVariant || "secondary"} 
              className="text-sm break-words whitespace-normal max-w-full" 
            >
              {String(item)}
            </Badge>
          ))}
        </div>
      );
    } else if (typeof value === 'number' || (typeof value === 'string' && !isBadgeList)) {


        if (badgeVariant && typeof value !== 'object') { 
             displayValue = <Badge variant={badgeVariant} className="text-sm break-words whitespace-normal">{String(value)}</Badge>;
        } else {
            displayValue = String(value);
        }
    } else {
      displayValue = String(value); 
    }

    return (
      <div className="flex items-start space-x-3 py-3 border-b border-gray-700 last:border-b-0">
        {Icon && <Icon className="h-5 w-5 mt-1 text-blue-400 flex-shrink-0" />}
        <div className="flex-grow min-w-0"> {}
          <p className="text-sm font-medium text-gray-400">{label}</p>
          {}
          <div className="text-gray-200 break-words whitespace-normal mt-1">{displayValue}</div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 w-full max-w-full px-2 sm:px-0"> {}
      <Button asChild variant="outline" className="border-blue-500 text-blue-400 hover:bg-blue-700 hover:text-white">
        <Link href="/dashboard/avaliacoes">
          <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para Avaliações
        </Link>
      </Button>

      <Card className="bg-gray-800 border-gray-700 text-white shadow-xl w-full">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 min-w-0">
            <div className="min-w-0 flex-1"> {}
              <CardTitle className={`text-2xl font-bold ${gradientText} break-words whitespace-normal`}>
                Detalhes da Avaliação
              </CardTitle>
              <CardDescription className="text-gray-400 break-words whitespace-normal mt-1">
                ID: {avaliacao.id}
              </CardDescription>
            </div>
            {avaliacao.nota_cliente !== null && (
              <Badge 
                variant={getNotaBadgeVariant(avaliacao.nota_cliente)} 
                className="text-lg px-3 py-1 mt-2 sm:mt-0 flex-shrink-0" 
              >
                Nota: {avaliacao.nota_cliente}/10
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="divide-y divide-gray-700">
          {renderField("Cliente (JID)", avaliacao.remoteJid ? avaliacao.remoteJid.split('@')[0] : 'N/A', User)}
          {renderField("Nota do Cliente", avaliacao.nota_cliente, Star, false, getNotaBadgeVariant(avaliacao.nota_cliente))}
          {renderField("Pontos Fortes", avaliacao.pontos_fortes, ThumbsUp, true, "default")}
          {renderField("Pontos Fracos", avaliacao.pontos_fracos, ThumbsDown, true, "destructive")}
          {renderField("Sugestões de Melhoria", avaliacao.sugestoes_melhoria, MessageSquare, true, "secondary")}
          {renderField("Tempo de Resposta", avaliacao.tempo_resposta, Activity)}
          {renderField("Clareza na Comunicação", avaliacao.clareza_comunicacao, Activity)}
          {renderField("Resolução do Problema", avaliacao.resolucao_problema, Activity)}
          {renderField("Resumo do Atendimento", avaliacao.resumo_atendimento, Activity)}
          {renderField("Data de Criação", avaliacao.createdAt, CalendarDays)}
          {renderField("Última Atualização", avaliacao.updatedAt, CalendarDays)}
        </CardContent>
        <CardFooter className="pt-6">
          <p className="text-xs text-gray-500">
            Gerenciado pelo sistema R.A.I.O.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}