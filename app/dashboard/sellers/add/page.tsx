'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ArrowLeft, UserPlus, Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"; 

export default function AddSellerPage() {
  const [name, setName] = useState('');
  const [evolutionInstanceName, setEvolutionInstanceName] = useState('');
  const [evolutionApiKey, setEvolutionApiKey] = useState('');
  const [sellerWhatsAppNumber, setSellerWhatsAppNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const router = useRouter();
  const gradientText = "bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-teal-300 to-green-300";

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    if (!evolutionInstanceName || !evolutionApiKey || !sellerWhatsAppNumber) {
      setError('Por favor, preencha todos os campos obrigatórios: Nome da Instância Evolution, API Key da Evolution e Número do WhatsApp.');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/sellers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name || undefined,
          evolutionInstanceName,
          evolutionApiKey,
          sellerWhatsAppNumber,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Falha ao adicionar vendedor.');
      }

      setSuccessMessage('Vendedor adicionado com sucesso! Redirecionando em breve...');
      setName('');
      setEvolutionInstanceName('');
      setEvolutionApiKey('');
      setSellerWhatsAppNumber('');
      
      setTimeout(() => {
        router.push('/dashboard/sellers');
      }, 2500);

    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro desconhecido.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <Button asChild variant="outline" className="border-blue-500 text-blue-400 hover:bg-blue-700 hover:text-white">
        <Link href="/dashboard/sellers">
          <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para Vendedores
        </Link>
      </Button>

      <Card className="bg-gray-800 border-gray-700 text-white shadow-xl">
        <CardHeader>
          <CardTitle className={`text-2xl font-bold ${gradientText} flex items-center`}>
            <UserPlus className="mr-3 h-7 w-7" /> Adicionar Novo Vendedor
          </CardTitle>
          <CardDescription className="text-gray-400">
            Preencha os detalhes abaixo para cadastrar um novo vendedor.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertTitle>Erro!</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {successMessage && (
            <Alert variant="default" className="mb-4 bg-green-700/30 border-green-600 text-green-300">
               <AlertTitle>Sucesso!</AlertTitle>
              <AlertDescription>{successMessage}</AlertDescription>
            </Alert>
          )}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Label htmlFor="name" className="text-gray-300">Nome do Vendedor (Opcional)</Label>
              <Input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 bg-gray-700 border-gray-600 placeholder-gray-500 text-white focus:ring-blue-500 focus:border-blue-500"
                disabled={isLoading}
              />
            </div>
            <div>
              <Label htmlFor="evolutionInstanceName" className="text-gray-300">
                Nome da Instância Evolution <span className="text-red-400">*</span>
              </Label>
              <Input
                type="text"
                id="evolutionInstanceName"
                value={evolutionInstanceName}
                onChange={(e) => setEvolutionInstanceName(e.target.value)}
                placeholder="Ex: Atendente01"
                className="mt-1 bg-gray-700 border-gray-600 placeholder-gray-500 text-white focus:ring-blue-500 focus:border-blue-500"
                required
                disabled={isLoading}
              />
            </div>
            <div>
              <Label htmlFor="evolutionApiKey" className="text-gray-300">
                API Key da Evolution (da instância) <span className="text-red-400">*</span>
              </Label>
              <Input
                type="text"
                id="evolutionApiKey"
                value={evolutionApiKey}
                onChange={(e) => setEvolutionApiKey(e.target.value)}
                placeholder="Cole a API Key aqui"
                className="mt-1 bg-gray-700 border-gray-600 placeholder-gray-500 text-white focus:ring-blue-500 focus:border-blue-500"
                required
                disabled={isLoading}
              />
            </div>
            <div>
              <Label htmlFor="sellerWhatsAppNumber" className="text-gray-300">
                Número WhatsApp do Vendedor <span className="text-red-400">*</span>
              </Label>
              <Input
                type="text"
                id="sellerWhatsAppNumber"
                value={sellerWhatsAppNumber}
                onChange={(e) => setSellerWhatsAppNumber(e.target.value)}
                placeholder="Formato internacional: 55DDDNUMERO"
                className="mt-1 bg-gray-700 border-gray-600 placeholder-gray-500 text-white focus:ring-blue-500 focus:border-blue-500"
                required
                disabled={isLoading}
              />
               <p className="mt-1 text-xs text-gray-400">Ex: 5511987654321</p>
            </div>
            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 text-white font-semibold shadow-md disabled:opacity-70" 
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adicionando...
                </>
              ) : (
                'Adicionar Vendedor'
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter>
          <p className="text-xs text-gray-500">
            Campos marcados com <span className="text-red-400">*</span> são obrigatórios.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}