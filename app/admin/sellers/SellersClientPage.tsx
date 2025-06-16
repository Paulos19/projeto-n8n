'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow,
  TableCaption
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Eye, Key, User } from "lucide-react";
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { toast } from 'sonner';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Define a estrutura de dados que esperamos da API, incluindo o dono
interface SellerData {
  id: string;
  name: string | null;
  evolutionInstanceName: string;
  evolutionApiKey: string;
  sellerWhatsAppNumber: string;
  isActive: boolean;
  storeOwner: {
    id: string;
    name: string | null;
    email: string | null;
  } | null;
}

export function SellersClientPage() {
  const [sellers, setSellers] = useState<SellerData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSellers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/admin/sellers');
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Falha ao carregar a lista de vendedores.');
      }
      const data: SellerData[] = await response.json();
      setSellers(data);
    } catch (err: any) {
      setError(err.message);
      toast.error("Erro ao buscar vendedores", { description: err.message });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSellers();
  }, [fetchSellers]);

  if (isLoading) {
    return <LoadingSpinner message="Carregando lista de vendedores..." />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center text-center p-8 border border-destructive/50 bg-destructive/10 rounded-lg">
        <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
        <h3 className="text-xl font-semibold text-destructive">Ocorreu um Erro</h3>
        <p className="text-destructive/80">{error}</p>
        <Button onClick={fetchSellers} variant="destructive" className="mt-4">Tentar Novamente</Button>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
      <Table>
        <TableCaption>Lista de todos os vendedores registrados na plataforma.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Vendedor</TableHead>
            <TableHead>Dono da Loja</TableHead>
            <TableHead>Instância / WhatsApp</TableHead>
            <TableHead>API Key</TableHead>
            <TableHead className="text-center">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sellers.length > 0 ? (
            sellers.map((seller) => (
              <TableRow key={seller.id}>
                <TableCell className="font-medium">{seller.name || 'Não informado'}</TableCell>
                <TableCell>
                  <div>{seller.storeOwner?.name || 'Usuário Deletado'}</div>
                  <div className="text-xs text-muted-foreground">{seller.storeOwner?.email}</div>
                </TableCell>
                <TableCell>
                  <div>{seller.evolutionInstanceName}</div>
                  <div className="text-xs text-muted-foreground">{seller.sellerWhatsAppNumber}</div>
                </TableCell>
                <TableCell>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center gap-2 cursor-pointer">
                          <Key className="h-4 w-4 text-muted-foreground" />
                          <span className="font-mono">{seller.evolutionApiKey.substring(0, 8)}...</span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{seller.evolutionApiKey}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant={seller.isActive ? 'default' : 'secondary'}>
                    {seller.isActive ? 'Ativo' : 'Inativo'}
                  </Badge>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                Nenhum vendedor encontrado na plataforma.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
