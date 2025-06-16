import { Suspense } from 'react';
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { AvaliacoesClientPage } from './AvaliacoesClientPage';

export default function AdminAvaliacoesPage() {
    const gradientText = "bg-clip-text text-transparent bg-gradient-to-r from-red-500 via-orange-500 to-amber-500";

    return (
        <div className="space-y-6">
            <div>
                <h1 className={`text-3xl font-bold ${gradientText}`}>Todas as Avaliações</h1>
                <p className="text-muted-foreground">Visualize todas as avaliações de clientes recebidas na plataforma.</p>
            </div>
            <Suspense fallback={<LoadingSpinner message="Carregando avaliações..." />}>
              <AvaliacoesClientPage />
            </Suspense>
        </div>
    );
}
