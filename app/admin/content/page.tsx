import { Suspense } from 'react';
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ContentEditor } from './ContentEditor';

export default function AdminContentPage() {
    const gradientText = "bg-clip-text text-transparent bg-gradient-to-r from-red-500 via-orange-500 to-amber-500";

    return (
        <div className="space-y-6">
            <div>
                <h1 className={`text-3xl font-bold ${gradientText}`}>Gerenciamento de Conteúdo</h1>
                <p className="text-muted-foreground">Edite o conteúdo das páginas de Termos de Uso e Política de Privacidade.</p>
            </div>
            <Suspense fallback={<LoadingSpinner message="Carregando editor..." />}>
              <ContentEditor />
            </Suspense>
        </div>
    );
}
