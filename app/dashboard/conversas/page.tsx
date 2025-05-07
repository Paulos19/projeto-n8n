import Link from "next/link";
import prisma from "@/lib/prisma";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageCircle, User, Calendar, ExternalLink, Eye } from "lucide-react"; // Adicionado Eye
import { ChatInteraction } from "@prisma/client"; // Importe o tipo gerado

export const dynamic = 'force-dynamic';

async function getConversas(): Promise<ChatInteraction[]> {
  const conversas = await prisma.chatInteraction.findMany({
    orderBy: {
      eventTimestamp: 'desc',
    },
  });
  return conversas;
}

export default async function ConversasPage() {
  const conversas = await getConversas();
  const gradientText = "bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400"; // Mantido para o efeito de gradiente específico

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
        <div>
          <h1 className={`text-3xl font-bold ${gradientText}`}>
            {/* O ícone pode usar uma cor primária do tema, ou manter a cor do gradiente se preferir */}
            <MessageCircle className="inline-block text-primary mr-1 h-8 w-8" /> 
            Conversas Recebidas (n8n)
          </h1>
          <p className="text-muted-foreground mt-2">Visualize as interações e análises recebidas via n8n.</p>
        </div>
      </div>

      {conversas.length === 0 && (
        <Card> {/* Usa bg-card, border-border, text-card-foreground por padrão do ShadCN */}
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">Nenhuma conversa encontrada.</p>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
        {conversas.map((conversa) => (
          <Card key={conversa.id} className="flex flex-col"> {/* Usa bg-card, border-border, text-card-foreground por padrão */}
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl text-primary flex items-center"> {/* Cor primária para o título do card */}
                    <User className="mr-2 h-5 w-5" /> {conversa.customerName}
                  </CardTitle>
                  <CardDescription className="text-xs"> {/* text-muted-foreground é aplicado por CardDescription */}
                    {conversa.remoteJid}
                  </CardDescription>
                </div>
                <div className="text-xs text-muted-foreground flex items-center">
                  <Calendar className="mr-1 h-4 w-4" />
                  {new Date(conversa.eventTimestamp).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-grow space-y-3">
              <div>
                <h4 className="text-sm font-semibold text-foreground/90 mb-1">Resumo da Análise:</h4> {/* Um pouco mais suave que o foreground principal */}
                <p className="text-sm text-muted-foreground leading-relaxed max-h-20 overflow-y-auto">
                  {conversa.analysisSummary || "Nenhum resumo disponível."}
                </p>
              </div>
              {conversa.analysisKeywords && conversa.analysisKeywords.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-foreground/90 mb-1">Palavras-chave:</h4>
                  <div className="flex flex-wrap gap-1">
                    {conversa.analysisKeywords.map(keyword => (
                      <span key={keyword} className="text-xs bg-accent text-accent-foreground px-2 py-0.5 rounded-full">{keyword}</span>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex flex-col gap-2 pt-4 w-full">
              <Button asChild variant="outline" className="w-full text-primary border-primary hover:bg-primary hover:text-primary-foreground">
                <Link href={`/dashboard/conversas/${conversa.id}`}>
                  <span> {/* Envolver com span para o Link */}
                    <Eye className="mr-2 h-4 w-4" /> Ver Detalhes da Conversa
                  </span>
                </Link>
              </Button>
              {conversa.remoteJid && (
                <Button asChild variant="outline" className="w-full text-sky-500 border-sky-500 hover:bg-sky-500 hover:text-white dark:text-sky-400 dark:border-sky-400 dark:hover:bg-sky-400 dark:hover:text-background">
                  {/* Para cores específicas como 'sky', você pode precisar de variáveis CSS personalizadas ou manter classes específicas se o tema padrão não cobrir */}
                  {/* Exemplo mantendo cores sky, mas com variantes dark. Se quiser usar cores do tema, seria algo como text-accent-foreground border-accent... */}
                  <Link href={`/dashboard/clientes/${conversa.remoteJid.replace('@', '_')}`}>
                    <span> {/* Envolver com span para o Link */}
                      <ExternalLink className="mr-2 h-4 w-4" /> Ver Perfil do Cliente
                    </span>
                  </Link>
                </Button>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}