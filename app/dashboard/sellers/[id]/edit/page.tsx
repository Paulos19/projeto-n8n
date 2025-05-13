'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Edit, Loader2, UserCircle, Briefcase, Phone } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from 'sonner';

interface SellerData {
  name: string | null;
  evolutionInstanceName: string;
  evolutionApiKey: string;
  sellerWhatsAppNumber: string;
  isActive: boolean;
}

export default function EditSellerPage() {
  const router = useRouter();
  const params = useParams();
  const sellerId = params.id as string;

  const [formData, setFormData] = useState<SellerData>({
    name: '',
    evolutionInstanceName: '',
    evolutionApiKey: '', // Não vamos exibir a API Key por segurança, mas ela pode ser atualizada.
    sellerWhatsAppNumber: '',
    isActive: true,
  });
  const [originalApiKey, setOriginalApiKey] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const gradientText = "bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400";

  useEffect(() => {
    if (sellerId) {
      const fetchSellerData = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const response = await fetch(`/api/sellers/${sellerId}`);
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Falha ao carregar dados do vendedor.');
          }
          const data: SellerData & { evolutionApiKey: string } = await response.json();
          setFormData({
            name: data.name || '',
            evolutionInstanceName: data.evolutionInstanceName,
            evolutionApiKey: '', // Não preencher o campo da API Key por segurança
            sellerWhatsAppNumber: data.sellerWhatsAppNumber,
            isActive: data.isActive,
          });
          setOriginalApiKey(data.evolutionApiKey); // Guardar a original caso não seja alterada
        } catch (err: any) {
          setError(err.message);
          toast.error(err.message || "Erro ao buscar dados do vendedor.");
        } finally {
          setIsLoading(false);
        }
      };
      fetchSellerData();
    }
  }, [sellerId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (checked: boolean) => {
    setFormData(prev => ({ ...prev, isActive: checked }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);
    toast.loading("Salvando alterações...");

    const payload = { ...formData };
    // Se o campo da API Key estiver vazio, significa que o usuário não quer atualizá-la.
    // Nesse caso, não enviamos `evolutionApiKey` ou enviamos a original se a lógica da API exigir.
    // Para esta implementação, se o campo `evolutionApiKey` no formulário estiver vazio, não o incluímos no payload de PATCH,
    // ou a API deve ser inteligente para não atualizar se não for fornecido.
    // Melhor: só envie a API key se ela for alterada.
    if (!payload.evolutionApiKey) {
      // @ts-ignore
      delete payload.evolutionApiKey; // Não envia se estiver vazia, para não apagar a existente sem querer
    }


    try {
      const response = await fetch(`/api/sellers/${sellerId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      toast.dismiss();

      if (!response.ok) {
        throw new Error(data.message || 'Falha ao atualizar vendedor.');
      }

      toast.success('Vendedor atualizado com sucesso!');
      router.push(`/dashboard/sellers/${sellerId}`); // Volta para a página de detalhes
      // Ou router.push('/dashboard/sellers'); para a lista
    } catch (err: any) {
      toast.dismiss();
      setError(err.message);
      toast.error(err.message || 'Ocorreu um erro desconhecido.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <p className="ml-2 text-muted-foreground">Carregando dados do vendedor...</p>
      </div>
    );
  }

  if (error && !isLoading) { // Mostrar erro apenas se não estiver mais carregando
     return (
        <div className="space-y-6 max-w-2xl mx-auto">
             <Button asChild variant="outline">
                <Link href="/dashboard/sellers">
                <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para Vendedores
                </Link>
            </Button>
            <Alert variant="destructive">
                <AlertTitle>Erro ao carregar vendedor</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        </div>
     )
  }


  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <Button asChild variant="outline" className="border-yellow-500 text-yellow-400 hover:bg-yellow-700 hover:text-white">
        <Link href={`/dashboard/sellers/${sellerId}`}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Cancelar Edição
        </Link>
      </Button>

      <Card className="bg-gray-800 border-gray-700 text-white shadow-xl">
        <CardHeader>
          <CardTitle className={`text-2xl font-bold ${gradientText} flex items-center`}>
            <Edit className="mr-3 h-7 w-7" /> Editar Vendedor
          </CardTitle>
          <CardDescription className="text-gray-400">
            Modifique os detalhes do vendedor abaixo.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-5 pt-6">
            {error && !isSubmitting && ( // Mostrar erro de submissão apenas se não estiver submetendo
              <Alert variant="destructive" className="mb-4">
                <AlertTitle>Erro!</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div>
              <Label htmlFor="name" className="text-gray-300 flex items-center">
                <UserCircle className="h-4 w-4 mr-2 text-gray-400" />Nome do Vendedor (Opcional)
              </Label>
              <Input
                type="text"
                id="name"
                name="name"
                value={formData.name || ''}
                onChange={handleChange}
                className="mt-1 bg-gray-700 border-gray-600 placeholder-gray-500 text-white focus:ring-yellow-500 focus:border-yellow-500"
                disabled={isSubmitting}
              />
            </div>
            <div>
              <Label htmlFor="evolutionInstanceName" className="text-gray-300 flex items-center">
                <Briefcase className="h-4 w-4 mr-2 text-gray-400" />Nome da Instância Evolution <span className="text-red-400 ml-1">*</span>
              </Label>
              <Input
                type="text"
                id="evolutionInstanceName"
                name="evolutionInstanceName"
                value={formData.evolutionInstanceName}
                onChange={handleChange}
                placeholder="Ex: Atendente01"
                className="mt-1 bg-gray-700 border-gray-600 placeholder-gray-500 text-white focus:ring-yellow-500 focus:border-yellow-500"
                required
                disabled={isSubmitting}
              />
            </div>
            <div>
              <Label htmlFor="evolutionApiKey" className="text-gray-300">
                Nova API Key da Evolution (deixe em branco para não alterar)
              </Label>
              <Input
                type="password" // Mudar para password para não exibir a chave
                id="evolutionApiKey"
                name="evolutionApiKey"
                value={formData.evolutionApiKey}
                onChange={handleChange}
                placeholder="Insira nova API Key se desejar alterar"
                className="mt-1 bg-gray-700 border-gray-600 placeholder-gray-500 text-white focus:ring-yellow-500 focus:border-yellow-500"
                disabled={isSubmitting}
              />
            </div>
            <div>
              <Label htmlFor="sellerWhatsAppNumber" className="text-gray-300 flex items-center">
                <Phone className="h-4 w-4 mr-2 text-gray-400" />Número WhatsApp do Vendedor <span className="text-red-400 ml-1">*</span>
              </Label>
              <Input
                type="text"
                id="sellerWhatsAppNumber"
                name="sellerWhatsAppNumber"
                value={formData.sellerWhatsAppNumber}
                onChange={handleChange}
                placeholder="Formato internacional: 55DDDNUMERO"
                className="mt-1 bg-gray-700 border-gray-600 placeholder-gray-500 text-white focus:ring-yellow-500 focus:border-yellow-500"
                required
                disabled={isSubmitting}
              />
            </div>
            <div className="flex items-center space-x-2 pt-2">
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={handleSwitchChange}
                disabled={isSubmitting}
              />
              <Label htmlFor="isActive" className="text-gray-300">
                Vendedor Ativo
              </Label>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-semibold shadow-md disabled:opacity-70" 
              disabled={isSubmitting || isLoading}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                'Salvar Alterações'
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}