'use client';

import { useState, useEffect, FormEvent } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner"; // Para notificações
import { UserCircle, Mail } from 'lucide-react';

interface SettingsFormProps {
  currentUser: {
    name: string;
    email: string;
  };
}

export function SettingsForm({ currentUser }: SettingsFormProps) {
  const [name, setName] = useState(currentUser.name);
  const [email, setEmail] = useState(currentUser.email);
  const [isLoading, setIsLoading] = useState(false);
  const [isChanged, setIsChanged] = useState(false);

  useEffect(() => {
    if (name !== currentUser.name || email !== currentUser.email) {
      setIsChanged(true);
    } else {
      setIsChanged(false);
    }
  }, [name, email, currentUser.name, currentUser.email]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    toast.loading("Salvando alterações...");

    try {
      const response = await fetch('/api/user/settings', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email }),
      });

      const result = await response.json();
      toast.dismiss(); // Remove o toast de loading

      if (response.ok) {
        toast.success(result.message || "Configurações atualizadas com sucesso!");
        // Atualizar currentUser se a API retornar os dados atualizados
        // ou forçar um refresh da sessão se necessário (mais complexo)
        // Por agora, apenas resetamos o estado de 'alterado'
        setIsChanged(false); 
      } else {
        toast.error(result.message || "Falha ao atualizar configurações.");
      }
    } catch (error) {
      toast.dismiss();
      toast.error("Ocorreu um erro ao conectar com o servidor.");
      console.error("Erro ao submeter formulário de configurações:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCircle className="h-5 w-5 text-blue-500" />
            Informações Pessoais
          </CardTitle>
          <CardDescription>
            Atualize seu nome e endereço de email.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name" className="flex items-center gap-1">
              <UserCircle size={14} className="text-muted-foreground" /> Nome
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Seu nome completo"
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-1">
              <Mail size={14} className="text-muted-foreground" /> Email
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              disabled={isLoading}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isLoading || !isChanged} className="w-full sm:w-auto">
            {isLoading ? "Salvando..." : "Salvar Alterações"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}