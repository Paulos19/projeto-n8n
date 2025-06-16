'use client';

import { useState, useEffect, useCallback, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from 'lucide-react';
import { Role } from '@prisma/client';
import { toast } from 'sonner';

interface EditUserFormProps {
  userId: string;
}

interface UserFormData {
  name: string;
  email: string;
  identifier: string;
  role: Role;
}

export function EditUserForm({ userId }: EditUserFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<Partial<UserFormData>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUserData = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/users/${userId}`);
      if (!response.ok) throw new Error("Falha ao buscar dados do usuário.");
      const data = await response.json();
      setFormData({
        name: data.name || '',
        email: data.email || '',
        identifier: data.identifier || '',
        role: data.role,
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    const toastId = toast.loading("Salvando alterações...");

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Erro ao salvar.");
      
      toast.success("Usuário atualizado com sucesso!");
      router.push('/admin/users'); // Redireciona de volta para a lista

    } catch (err: any) {
      toast.error("Falha ao salvar", { description: err.message });
    } finally {
      setIsSubmitting(false);
      toast.dismiss(toastId);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRoleChange = (value: Role) => {
    setFormData(prev => ({ ...prev, role: value }));
  };

  if (isLoading) return <LoadingSpinner message="Carregando dados..." />;
  if (error) return (
      <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Erro</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
      </Alert>
  );

  return (
    <Card>
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <CardTitle>Dados do Usuário</CardTitle>
          <CardDescription>Faça as alterações necessárias nos campos abaixo.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome</Label>
            <Input id="name" name="name" value={formData.name || ''} onChange={handleInputChange} disabled={isSubmitting} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" value={formData.email || ''} onChange={handleInputChange} disabled={isSubmitting} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="identifier">Identificador (CPF/CNPJ)</Label>
            <Input id="identifier" name="identifier" value={formData.identifier || ''} onChange={handleInputChange} disabled={isSubmitting} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="role">Cargo</Label>
            <Select value={formData.role} onValueChange={handleRoleChange} disabled={isSubmitting}>
              <SelectTrigger id="role">
                <SelectValue placeholder="Selecione um cargo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USER">USER</SelectItem>
                <SelectItem value="ADMIN">ADMIN</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Salvando..." : "Salvar Alterações"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
