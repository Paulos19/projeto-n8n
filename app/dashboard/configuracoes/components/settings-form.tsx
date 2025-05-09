'use client';

import { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import Image from 'next/image'; // Importar Image do Next.js
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { UserCircle, Mail, Camera } from 'lucide-react'; // Adicionado Camera
import { storage } from '@/lib/firebase'; // Importar storage do Firebase
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"; // Para exibir a imagem

interface SettingsFormProps {
  currentUser: {
    name: string;
    email: string;
    image: string | null; // Adicionado image
  };
}

export function SettingsForm({ currentUser }: SettingsFormProps) {
  const [name, setName] = useState(currentUser.name);
  const [email, setEmail] = useState(currentUser.email);
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(currentUser.image);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(currentUser.image);
  const [isLoading, setIsLoading] = useState(false);
  const [isChanged, setIsChanged] = useState(false);

  useEffect(() => {
    if (name !== currentUser.name || email !== currentUser.email || imageFile !== null) {
      setIsChanged(true);
    } else {
      setIsChanged(false);
    }
  }, [name, email, imageFile, currentUser.name, currentUser.email]);

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    toast.loading("Salvando alterações...");

    let imageUrl = currentImageUrl; // Usar a imagem atual por padrão

    try {
      if (imageFile) {
        // Fazer upload da nova imagem para o Firebase Storage
        const imageRef = ref(storage, `user-avatars/${currentUser.email}/${imageFile.name}-${Date.now()}`); // Usar email ou ID do usuário para path
        await uploadBytes(imageRef, imageFile);
        imageUrl = await getDownloadURL(imageRef);
        setCurrentImageUrl(imageUrl); // Atualiza a URL da imagem atual no estado
      }

      const response = await fetch('/api/user/settings', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, image: imageUrl }), // Enviar a URL da imagem
      });

      const result = await response.json();
      toast.dismiss();

      if (response.ok) {
        toast.success(result.message || "Configurações atualizadas com sucesso!");
        setIsChanged(false);
        setImageFile(null); // Limpar o arquivo selecionado após o sucesso
        if (imageUrl) setImagePreview(imageUrl); // Atualizar preview com a imagem do Firebase
        // Para atualizar a imagem na navbar/sidebar imediatamente, pode ser necessário
        // forçar um refresh da sessão ou usar um estado global/contexto.
        // A forma mais simples é um reload da página ou confiar que o próximo fetch da sessão trará a imagem atualizada.
        // window.location.reload(); // Descomente se quiser forçar o reload
      } else {
        toast.error(result.message || "Falha ao atualizar configurações.");
      }
    } catch (error) {
      toast.dismiss();
      toast.error("Ocorreu um erro ao conectar com o servidor ou fazer upload da imagem.");
      console.error("Erro ao submeter formulário de configurações:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCircle className="h-5 w-5 text-blue-500" />
            Informações Pessoais e Avatar
          </CardTitle>
          <CardDescription>
            Atualize seu nome, endereço de email e foto de perfil.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="avatar" className="flex items-center gap-1">
              <Camera size={14} className="text-muted-foreground" /> Foto de Perfil
            </Label>
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={imagePreview || undefined} alt={name || "Avatar do usuário"} />
                <AvatarFallback>
                  {name ? name.substring(0, 2).toUpperCase() : <UserCircle size={24} />}
                </AvatarFallback>
              </Avatar>
              <Input
                id="avatar"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                disabled={isLoading}
                className="max-w-xs"
              />
            </div>
             <p className="text-xs text-muted-foreground mt-1">Recomendado: imagem quadrada, .jpg ou .png, até 2MB.</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name" className="flex items-center gap-1">
              <UserCircle size={14} className="text-muted-foreground" /> Nome
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Seu nome completo"
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-1">
              <Mail size={14} className="text-muted-foreground" /> Email
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              disabled={isLoading}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isLoading || !isChanged} className="w-full sm:w-auto">
            {isLoading ? "Salvando..." : "Salvar Alterações"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}