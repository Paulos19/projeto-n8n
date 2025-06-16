'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableCaption } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { AlertTriangle, User, MessageCircle } from "lucide-react";
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { toast } from 'sonner';
import { ChatInteraction, Seller } from '@prisma/client';

interface ConversaComRelacoes extends Pick<ChatInteraction, 'id' | 'remoteJid' | 'customerName' | 'eventTimestamp' | 'analysisSummary'> {
  user: { name: string | null; email: string | null; } | null;
  seller: { name: string | null; } | null;
}

export function ConversasClientPage() {
  const [conversas, setConversas] = useState<ConversaComRelacoes[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConversas = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/admin/conversas');
      if (!response.ok) throw new Error('Falha ao carregar as conversas.');
      const data = await response.json();
      setConversas(data);
    } catch (err: any) {
      setError(err.message);
      toast.error("Erro ao buscar conversas", { description: err.message });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConversas();
  }, [fetchConversas]);
  
  if (isLoading) return <LoadingSpinner message="Carregando todas as conversas..." />;
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
        <TableCaption>Lista das últimas 100 interações de chat na plataforma.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Dono</TableHead>
            <TableHead>Vendedor</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>Resumo IA</TableHead>
            <TableHead>Data</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {conversas.map((item) => (
            <TableRow key={item.id}>
              <TableCell>
                  <div>{item.user?.name || 'N/A'}</div>
                  <div className="text-xs text-muted-foreground">{item.user?.email}</div>
              </TableCell>
              <TableCell>{item.seller?.name || 'N/A'}</TableCell>
              <TableCell>
                <div>{item.customerName || 'Não informado'}</div>
                <div className="text-xs text-muted-foreground">{item.remoteJid}</div>
              </TableCell>
              <TableCell className="max-w-xs truncate text-muted-foreground">
                {item.analysisSummary}
              </TableCell>
              <TableCell>{new Date(item.eventTimestamp).toLocaleString('pt-BR')}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
