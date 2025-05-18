'use client'; 

import { useEffect } from 'react';
import { Button } from '@/components/ui/button'; 

export default function ErrorConversasPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {

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

          () => reset()
        }
      >
        Tentar Novamente
      </Button>
    </div>
  );
}