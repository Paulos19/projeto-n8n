// app/auth/signup/SignUpFormProfessional.tsx
"use client";

import { useRouter } from "next/navigation";
import { useState, FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { AlertTriangle, CheckCircle2, LogIn, Mail, Lock, Loader2, User, Briefcase, ShieldQuestion, Eye, EyeOff } from "lucide-react";

export default function SignUpFormProfessional() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [identifier, setIdentifier] = useState("");
  const [email, setEmail] = useState(""); // Opcional
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    if (password !== confirmPassword) {
      setError("As senhas não coincidem. Por favor, verifique.");
      setIsLoading(false);
      return;
    }

    // Validação simples de CPF/CNPJ (apenas comprimento)
    if (identifier.length !== 11 && identifier.length !== 14) {
        setError("O CPF deve ter 11 dígitos e o CNPJ 14 dígitos.");
        setIsLoading(false);
        return;
    }
    
    // Validação de força da senha (exemplo: mínimo 8 caracteres, letra maiúscula, minúscula, número)
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d\S]{8,}$/; // Permite caracteres especiais também
    if (!passwordRegex.test(password)) {
        setError("A senha deve ter no mínimo 8 caracteres, incluindo uma letra maiúscula, uma minúscula e um número.");
        setIsLoading(false);
        return;
    }


    try {
      const response = await fetch("/api/auth/register", { // Endpoint da sua API de registro
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, identifier, email: email || undefined, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Falha ao cadastrar. Verifique os dados ou tente novamente.");
      } else {
        setSuccess("Cadastro realizado com sucesso! Você será redirecionado para o login em instantes.");
        setName("");
        setIdentifier("");
        setEmail("");
        setPassword("");
        setConfirmPassword("");
        setTimeout(() => {
          router.push("/auth/signin"); // Redireciona para a tela de login
        }, 3000);
      }
    } catch (err) {
      console.error("Erro de rede ou inesperado:", err);
      setError("Ocorreu um erro inesperado. Verifique sua conexão e tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const gradientText = "bg-clip-text text-transparent bg-gradient-to-r from-sky-500 via-cyan-400 to-emerald-500";

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-100 dark:bg-slate-900 p-4 selection:bg-sky-300/70 selection:text-sky-900">
      {/* Logo ou Nome do Produto */}
      <div className="mb-8 text-center">
        <Link href="/" className="inline-block">
          <h1 className={`text-5xl font-bold ${gradientText}`}>
            R.A.I.O
          </h1>
        </Link>
        <p className="text-slate-600 dark:text-slate-400 mt-2">
          Crie sua conta para explorar o futuro da análise de dados.
        </p>
      </div>

      <Card className="w-full max-w-lg shadow-2xl dark:shadow-sky-500/20">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">Crie sua Conta</CardTitle>
          <CardDescription>
            Preencha os campos abaixo para começar.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <div className="flex items-start p-3 space-x-3 text-sm border rounded-md border-destructive/50 text-destructive bg-destructive/10">
              <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Erro no Cadastro</p>
                <p>{error}</p>
              </div>
            </div>
          )}
          {success && (
            <div className="flex items-start p-3 space-x-3 text-sm border rounded-md border-green-600/50 text-green-700 dark:text-green-400 bg-green-500/10">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Sucesso!</p>
                <p>{success}</p>
              </div>
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Nome Completo */}
            <div className="space-y-2">
              <Label htmlFor="name" className="font-medium text-slate-700 dark:text-slate-300">Nome Completo</Label>
              <div className="relative flex items-center">
                <User className="absolute w-5 h-5 left-3 text-slate-400 dark:text-slate-500" />
                <Input
                  id="name"
                  type="text"
                  placeholder="Seu nome completo"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  disabled={isLoading || !!success}
                  className="pl-10 py-6 text-base border-slate-300 dark:border-slate-700 focus:border-sky-500 dark:focus:border-sky-500 focus:ring-sky-500 dark:focus:ring-sky-500"
                />
              </div>
            </div>

            {/* Identificador (CPF/CNPJ) */}
            <div className="space-y-2">
              <Label htmlFor="identifier" className="font-medium text-slate-700 dark:text-slate-300">Identificador (CPF/CNPJ)</Label>
              <div className="relative flex items-center">
                <Briefcase className="absolute w-5 h-5 left-3 text-slate-400 dark:text-slate-500" />
                <Input
                  id="identifier"
                  type="text"
                  placeholder="Seu CPF ou CNPJ (apenas números)"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value.replace(/\D/g, ''))}
                  required
                  disabled={isLoading || !!success}
                  minLength={11}
                  maxLength={14}
                  className="pl-10 py-6 text-base border-slate-300 dark:border-slate-700 focus:border-sky-500 dark:focus:border-sky-500 focus:ring-sky-500 dark:focus:ring-sky-500"
                />
              </div>
            </div>

            {/* Email (Opcional) */}
            <div className="space-y-2">
              <Label htmlFor="email" className="font-medium text-slate-700 dark:text-slate-300">Email <span className="text-xs text-slate-500 dark:text-slate-400">(Opcional)</span></Label>
              <div className="relative flex items-center">
                <Mail className="absolute w-5 h-5 left-3 text-slate-400 dark:text-slate-500" />
                <Input
                  id="email"
                  type="email"
                  placeholder="seu.email@exemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading || !!success}
                  className="pl-10 py-6 text-base border-slate-300 dark:border-slate-700 focus:border-sky-500 dark:focus:border-sky-500 focus:ring-sky-500 dark:focus:ring-sky-500"
                />
              </div>
            </div>
            
            {/* Senha */}
            <div className="space-y-2">
              <Label htmlFor="password" className="font-medium text-slate-700 dark:text-slate-300">Senha</Label>
              <div className="relative flex items-center">
                <Lock className="absolute w-5 h-5 left-3 text-slate-400 dark:text-slate-500" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Crie uma senha forte"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading || !!success}
                  minLength={8} // Mínimo 8 caracteres para a senha
                  className="pl-10 pr-10 py-6 text-base border-slate-300 dark:border-slate-700 focus:border-sky-500 dark:focus:border-sky-500 focus:ring-sky-500 dark:focus:ring-sky-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-400 p-1"
                  aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                  disabled={isLoading || !!success}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
               <p className="text-xs text-slate-500 dark:text-slate-400 px-1">Mínimo 8 caracteres, com maiúscula, minúscula e número.</p>
            </div>

            {/* Confirmar Senha */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="font-medium text-slate-700 dark:text-slate-300">Confirmar Senha</Label>
              <div className="relative flex items-center">
                <ShieldQuestion className="absolute w-5 h-5 left-3 text-slate-400 dark:text-slate-500" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirme sua senha"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={isLoading || !!success}
                  minLength={8}
                  className="pl-10 pr-10 py-6 text-base border-slate-300 dark:border-slate-700 focus:border-sky-500 dark:focus:border-sky-500 focus:ring-sky-500 dark:focus:ring-sky-500"
                />
                 <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-400 p-1"
                  aria-label={showConfirmPassword ? "Ocultar senha" : "Mostrar senha"}
                  disabled={isLoading || !!success}
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
            
            <div className="pt-2">
                <Button type="submit" className="w-full py-6 text-base font-semibold bg-gradient-to-r from-sky-600 to-cyan-500 hover:from-sky-700 hover:to-cyan-600 dark:from-sky-500 dark:to-cyan-400 dark:hover:from-sky-600 dark:hover:to-cyan-500" disabled={isLoading || !!success}>
                {isLoading ? (
                    <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Criando conta...
                    </>
                ) : (
                    <>
                    <LogIn className="w-5 h-5 mr-2" />
                    Criar Conta
                    </>
                )}
                </Button>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col items-center justify-center pt-6 border-t dark:border-slate-700">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Já possui uma conta?{" "}
            <Link
              href="/auth/signin"
              className="font-semibold text-sky-600 hover:text-sky-500 dark:text-sky-400 dark:hover:text-sky-300 hover:underline"
            >
              Faça Login
            </Link>
          </p>
        </CardFooter>
      </Card>

      <p className="mt-8 text-xs text-center text-slate-500 dark:text-slate-400">
        &copy; {new Date().getFullYear()} R.A.I.O. Todos os direitos reservados. <br />
        Ao se cadastrar, você concorda com nossos{" "}
        <Link href="/termos" className="hover:underline">Termos de Serviço</Link> e{" "}
        <Link href="/privacidade" className="hover:underline">Política de Privacidade</Link>.
      </p>
    </div>
  );
}
