'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableCaption } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, User, Star } from "lucide-react";
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { toast } from 'sonner';
import { Avaliacao, Seller } from '@prisma/client';

interface AvaliacaoComRelacoes extends Avaliacao {
  user: { name: string | null; email: string | null; } | null;
  seller: { name: string | null; } | null;
}

export function AvaliacoesClientPage() {
  const [avaliacoes, setAvaliacoes] = useState<AvaliacaoComRelacoes[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAvaliacoes = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/admin/avaliacoes');
      if (!response.ok) throw new Error('Falha ao carregar as avaliações.');
      const data = await response.json();
      setAvaliacoes(data);
    } catch (err: any) {
      setError(err.message);
      toast.error("Erro ao buscar avaliações", { description: err.message });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAvaliacoes();
  }, [fetchAvaliacoes]);
  
  const getNotaBadgeVariant = (nota: number | null) => {
    if (nota === null) return "secondary";
    if (nota <= 2) return "destructive";
    if (nota <= 3) return "secondary";
    return "default";
  };

  if (isLoading) return <LoadingSpinner message="Carregando todas as avaliações..." />;
  if (error) return (
      <div className="flex flex-col items-center text-center p-8 border border-destructive/50 bg-destructive/10 rounded-lg">
        <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
        <h3 className="text-xl font-semibold text-destructive">Ocorreu um Erro</h3>
        <p className="text-destructive/80">{error}</p>
      </div>
  );

  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
      <Table>
        <TableCaption>Lista de todas as avaliações na plataforma.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Dono</TableHead>
            <TableHead>Vendedor</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead className="text-center">Nota</TableHead>
            <TableHead>Resumo IA</TableHead>
            <TableHead>Data</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {avaliacoes.map((item) => (
            <TableRow key={item.id}>
              <TableCell>
                  <div>{item.user?.name || 'N/A'}</div>
                  <div className="text-xs text-muted-foreground">{item.user?.email}</div>
              </TableCell>
              <TableCell>{item.seller?.name || 'N/A'}</TableCell>
              <TableCell>{item.remoteJid?.split('@')[0] || 'N/A'}</TableCell>
              <TableCell className="text-center">
                <Badge variant={getNotaBadgeVariant(item.nota_cliente)}>
                  <Star className="h-3 w-3 mr-1"/>
                  {item.nota_cliente ?? 'N/A'}
                </Badge>
              </TableCell>
              <TableCell className="max-w-xs truncate text-muted-foreground">
                {item.resumo_atendimento}
              </TableCell>
              <TableCell>{new Date(item.createdAt).toLocaleDateString('pt-BR')}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
