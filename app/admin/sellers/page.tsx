import { Suspense } from 'react';
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { SellersClientPage } from './SellersClientPage';

export default function AdminSellersPage() {
    const gradientText = "bg-clip-text text-transparent bg-gradient-to-r from-red-500 via-orange-500 to-amber-500";

    return (
        <div className="space-y-6">
            <div>
                <h1 className={`text-3xl font-bold ${gradientText}`}>Gerenciamento de Vendedores</h1>
                <p className="text-muted-foreground">Visualize todos os vendedores cadastrados na plataforma e a quem pertencem.</p>
            </div>
            <Suspense fallback={<LoadingSpinner message="Carregando vendedores..." />}>
              <SellersClientPage />
            </Suspense>
        </div>
    );
}
