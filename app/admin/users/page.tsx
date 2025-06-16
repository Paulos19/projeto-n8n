
import { Suspense } from 'react';
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { UsersClientPage } from './UsersClientPage';

export default function AdminUsersPage() {
    const gradientText = "bg-clip-text text-transparent bg-gradient-to-r from-red-500 via-orange-500 to-amber-500";

    return (
        <div className="space-y-6">
            <div>
                <h1 className={`text-3xl font-bold ${gradientText}`}>Gerenciamento de Usuários</h1>
                <p className="text-muted-foreground">Visualize, edite e gerencie todos os usuários da plataforma.</p>
            </div>
            <Suspense fallback={<LoadingSpinner message="Carregando usuários..." />}>
              <UsersClientPage />
            </Suspense>
        </div>
    );
}
