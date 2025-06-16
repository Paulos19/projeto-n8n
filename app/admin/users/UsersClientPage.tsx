'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link'; // Importar Link
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Edit, Trash2, AlertTriangle, ShieldAlert } from "lucide-react";
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Role } from '@prisma/client';
import { toast } from 'sonner';

interface UserData {
  id: string;
  name: string | null;
  email: string | null;
  identifier: string | null;
  role: Role;
  createdAt: string;
  _count: {
    sellers: number;
    avaliacoes: number;
  };
}

export function UsersClientPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/admin/users');
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Falha ao carregar a lista de usuários.');
      }
      const data: UserData[] = await response.json();
      setUsers(data);
    } catch (err: any) {
      setError(err.message);
      toast.error("Erro ao buscar usuários", { description: err.message });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);
  
  const handleDeleteUser = async (userId: string, userName: string | null) => {
    const toastId = toast.loading("Deletando usuário...");
    try {
      const response = await fetch(`/api/admin/users/${userId}`, { method: 'DELETE' });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Falha ao deletar usuário.");
      }
      toast.success(`Usuário "${userName || userId}" deletado com sucesso.`);
      setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
    } catch (err: any) {
      toast.error("Erro ao deletar", { description: err.message });
    } finally {
      toast.dismiss(toastId);
    }
  };

  if (isLoading) {
    return <LoadingSpinner message="Carregando lista de usuários..." />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center text-center p-8 border border-destructive/50 bg-destructive/10 rounded-lg">
        <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
        <h3 className="text-xl font-semibold text-destructive">Ocorreu um Erro</h3>
        <p className="text-destructive/80">{error}</p>
        <Button onClick={fetchUsers} variant="destructive" className="mt-4">Tentar Novamente</Button>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
      <Table>
        <TableCaption>Lista de todos os usuários registrados na plataforma.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Email / Identificador</TableHead>
            <TableHead>Cargo</TableHead>
            <TableHead className="text-center">Vendedores</TableHead>
            <TableHead className="text-center">Avaliações</TableHead>
            <TableHead>Data de Cadastro</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.length > 0 ? (
            users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.name || 'Não informado'}</TableCell>
                <TableCell>
                  <div>{user.email || 'N/A'}</div>
                  <div className="text-xs text-muted-foreground">{user.identifier}</div>
                </TableCell>
                <TableCell>
                  <Badge variant={user.role === 'ADMIN' ? 'destructive' : 'secondary'}>
                    {user.role === 'ADMIN' && <ShieldAlert className="h-3 w-3 mr-1" />}
                    {user.role}
                  </Badge>
                </TableCell>
                <TableCell className="text-center">{user._count.sellers}</TableCell>
                <TableCell className="text-center">{user._count.avaliacoes}</TableCell>
                <TableCell>{new Date(user.createdAt).toLocaleDateString('pt-BR')}</TableCell>
                <TableCell className="text-right">
                  {/* --- BOTÃO DE EDIÇÃO ATUALIZADO --- */}
                  <Button asChild variant="ghost" size="icon">
                    <Link href={`/admin/users/${user.id}/edit`}>
                      <Edit className="h-4 w-4" />
                    </Link>
                  </Button>
                  {/* --- FIM DA ATUALIZAÇÃO --- */}
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Você tem certeza absoluta?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Esta ação não pode ser desfeita. Isso irá deletar permanentemente o usuário <strong>{user.name || user.identifier}</strong> e todos os seus dados associados.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDeleteUser(user.id, user.name)}>
                          Sim, deletar usuário
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                    Nenhum usuário encontrado.
                </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
