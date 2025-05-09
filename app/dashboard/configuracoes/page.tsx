import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { CopyToClipboardButton } from "@/components/ui/copy-to-clipboard-button"; // Componente criado anteriormente // Criaremos este componente cliente
import { KeyRound } from "lucide-react";
import { SettingsForm } from "./components/settings-form";

export default async function ConfiguracoesPage() {
  const session = await getServerSession(authOptions);
  const gradientText = "bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-teal-300 to-green-300";

  if (!session?.user) {
    return (
      <div className="space-y-6">
        <h1 className={`text-3xl font-bold ${gradientText}`}>Configurações</h1>
        <p>Você precisa estar logado para ver suas configurações.</p>
      </div>
    );
  }

  const { name, email, webhookApiKey, image } = session.user; // Adicionado 'image'

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <div>
        <h1 className={`text-3xl font-bold ${gradientText}`}>Configurações da Conta</h1>
        <p className="text-muted-foreground">Gerencie as informações da sua conta e chave de API.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <KeyRound className="h-5 w-5 text-blue-500" />
            Sua Chave de API Webhook
          </CardTitle>
          <CardDescription>
            Use esta chave para integrar com serviços externos como o N8N. Mantenha-a segura.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {webhookApiKey ? (
            <div className="flex items-center space-x-2">
              <Input id="webhookApiKey" value={webhookApiKey} readOnly disabled className="font-mono" />
              <CopyToClipboardButton textToCopy={webhookApiKey} buttonText="Copiar Chave" />
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Chave de API não disponível.</p>
          )}
           <p className="mt-3 text-xs text-muted-foreground">
              Sua URL para o N8N enviar dados será: 
              <code className="ml-1 font-mono bg-muted p-1 rounded text-xs">
              https://projeto-n8n.vercel.app/api/receber-avaliacao/{webhookApiKey ? `${webhookApiKey.substring(0,4)}...` : '[SUA_API_KEY]'}
              </code>
              <br/>
             
            </p>
        </CardContent>
      </Card>

      <SettingsForm currentUser={{ name: name || "", email: email || "", image: image || null }} />
      
    </div>
  );
}
