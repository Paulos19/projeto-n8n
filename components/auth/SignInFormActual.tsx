// app/auth/signin/SignInFormActual.tsx
"use client";

import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export function SignInFormActual() {
  const router = useRouter();
  const searchParams = useSearchParams(); // Este hook requer o Suspense boundary na página que o utiliza
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
  const error = searchParams.get("error");

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setIsLoading(true);

    const result = await signIn("credentials", {
      redirect: false,
      identifier,
      password,
      callbackUrl,
    });

    setIsLoading(false);

    if (result?.error) {
      console.error("Erro de login:", result.error);
      // Recarrega a página de signin com a mensagem de erro e o callbackUrl original
      router.push(`/auth/signin?error=${result.error}&callbackUrl=${encodeURIComponent(callbackUrl)}`);
    } else if (result?.url) {
      // Se next-auth retornar uma URL (pode acontecer em cenários específicos)
      router.push(result.url);
    } else {
      // Login bem-sucedido, redireciona para o callbackUrl
      router.push(callbackUrl);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Login R.A.I.O</CardTitle>
          <CardDescription className="text-center">
            Acesse o painel para visualizar as interações.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-center text-destructive bg-destructive/10 rounded-md">
                Falha no login. Verifique suas credenciais ou tente novamente.
                {error === "CredentialsSignin" && " (Identificador ou senha inválidos)"}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="identifier">Identificador (CPF/CNPJ)</Label>
              <Input
                id="identifier"
                type="text"
                placeholder="Seu CPF ou CNPJ"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="Sua senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Entrando..." : "Entrar"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}