'use client'; // Componentes de erro precisam ser Client Components

import { useEffect } from 'react';
import { Button } from '@/components/ui/button'; // Supondo que você tenha um componente Button

export default function ErrorConversasPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Você pode logar o erro para um serviço de monitoramento aqui
    console.error(error);
  }, [error]);

  return (
    <div className="container mx-auto py-10 text-center">
      <h2 className="text-2xl font-semibold mb-4 text-destructive">
        Oops! Algo deu errado.
      </h2>
      <p className="mb-6 text-muted-foreground">
        Não foi possível carregar as informações das conversas.
      </p>
      {error?.message && (
        <p className="mb-2 text-sm text-muted-foreground">Detalhes do erro: {error.message}</p>
      )}
      <Button
        onClick={
          // Tenta renderizar novamente o segmento da rota
          () => reset()
        }
      >
        Tentar Novamente
      </Button>
    </div>
  );
}