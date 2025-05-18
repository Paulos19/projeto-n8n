"use client";

import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, FormEvent, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { AlertTriangle, LogIn, Mail, Lock, Loader2, Building, User } from "lucide-react";


const SignInFormWrapper = () => {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Carregando...</div>}>
      <SignInFormProfessional />
    </Suspense>
  );
};

function SignInFormProfessional() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
  const error = searchParams.get("error");

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); 

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



      router.push(`/auth/signin?error=${result.error}&callbackUrl=${encodeURIComponent(callbackUrl)}`);
    } else if (result?.url) {
      router.push(result.url);
    } else {
      router.push(callbackUrl);
    }
  };

  const gradientText = "bg-clip-text text-transparent bg-gradient-to-r from-sky-500 via-cyan-400 to-emerald-500";

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-100 dark:bg-slate-900 p-4 selection:bg-sky-300/70 selection:text-sky-900">
      {}
      <div className="mb-8 text-center">
        <Link href="/" className="inline-block">
          <h1 className={`text-5xl font-bold ${gradientText}`}>
            R.A.I.O
          </h1>
        </Link>
        <p className="text-slate-600 dark:text-slate-400 mt-2">
          Robô Analisador e Identificador de Oportunidades
        </p>
      </div>

      <Card className="w-full max-w-md shadow-2xl dark:shadow-sky-500/20">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">Bem-vindo de volta!</CardTitle>
          <CardDescription>
            Acesse sua conta para continuar transformando dados em decisões.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <div className="flex items-center p-3 space-x-3 text-sm border rounded-md border-destructive/50 text-destructive bg-destructive/10">
              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
              <div>
                <p className="font-semibold">Falha no Login</p>
                <p>
                  {error === "CredentialsSignin"
                    ? "Identificador (CPF/CNPJ) ou senha inválidos. Por favor, verifique e tente novamente."
                    : "Ocorreu um erro ao tentar fazer login. Tente novamente mais tarde."}
                </p>
              </div>
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="identifier" className="font-medium text-slate-700 dark:text-slate-300">Identificador (CPF/CNPJ)</Label>
              <div className="relative flex items-center">
                <User className="absolute w-5 h-5 left-3 text-slate-400 dark:text-slate-500" />
                <Input
                  id="identifier"
                  type="text"
                  placeholder="Digite seu CPF ou CNPJ"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  required
                  disabled={isLoading}
                  className="pl-10 py-6 text-base border-slate-300 dark:border-slate-700 focus:border-sky-500 dark:focus:border-sky-500 focus:ring-sky-500 dark:focus:ring-sky-500"
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="font-medium text-slate-700 dark:text-slate-300">Senha</Label>
                <Link
                  href="/auth/forgot-password" 
                  className="text-sm font-medium text-sky-600 hover:text-sky-500 dark:text-sky-400 dark:hover:text-sky-300 hover:underline"
                >
                  Esqueceu a senha?
                </Link>
              </div>
              <div className="relative flex items-center">
                <Lock className="absolute w-5 h-5 left-3 text-slate-400 dark:text-slate-500" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Digite sua senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className="pl-10 pr-10 py-6 text-base border-slate-300 dark:border-slate-700 focus:border-sky-500 dark:focus:border-sky-500 focus:ring-sky-500 dark:focus:ring-sky-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-400"
                  aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                  disabled={isLoading}
                >
                  {showPassword ? <Mail size={20} /> : <Lock size={20} /> }
                </button>
              </div>
            </div>
            
            {}
            {}

            <Button type="submit" className="w-full py-6 text-base font-semibold bg-gradient-to-r from-sky-600 to-cyan-500 hover:from-sky-700 hover:to-cyan-600 dark:from-sky-500 dark:to-cyan-400 dark:hover:from-sky-600 dark:hover:to-cyan-500" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Entrando...
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5 mr-2" />
                  Entrar
                </>
              )}
            </Button>
          </form>

          {}
          {}

          {}
          {}
          {}
          {}

        </CardContent>
        <CardFooter className="flex flex-col items-center justify-center pt-6 border-t dark:border-slate-700">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Não tem uma conta?{" "}
            <Link
              href="/auth/signup" 
              className="font-semibold text-sky-600 hover:text-sky-500 dark:text-sky-400 dark:hover:text-sky-300 hover:underline"
            >
              Cadastre-se agora
            </Link>
          </p>
        </CardFooter>
      </Card>

      <p className="mt-8 text-xs text-center text-slate-500 dark:text-slate-400">
        &copy; {new Date().getFullYear()} R.A.I.O. Todos os direitos reservados. <br />
        <Link href="/termos" className="hover:underline">Termos de Serviço</Link> | <Link href="/privacidade" className="hover:underline">Política de Privacidade</Link>
      </p>
    </div>
  );
}


export default SignInFormWrapper;
