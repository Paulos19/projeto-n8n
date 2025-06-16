import { Suspense } from 'react';
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ConversasClientPage } from './ConversasClientPage';

export default function AdminConversasPage() {
    const gradientText = "bg-clip-text text-transparent bg-gradient-to-r from-red-500 via-orange-500 to-amber-500";

    return (
        <div className="space-y-6">
            <div>
                <h1 className={`text-3xl font-bold ${gradientText}`}>Todas as Conversas</h1>
                <p className="text-muted-foreground">Visualize todas as interações de chat que ocorreram na plataforma.</p>
            </div>
            <Suspense fallback={<LoadingSpinner message="Carregando conversas..." />}>
              <ConversasClientPage />
            </Suspense>
        </div>
    );
}
