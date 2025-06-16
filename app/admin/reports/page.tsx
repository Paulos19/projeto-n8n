import { Suspense } from 'react';
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { PlatformReportClientPage } from './PlatformReportClientPage';

export default function AdminReportsPage() {
    const gradientText = "bg-clip-text text-transparent bg-gradient-to-r from-red-500 via-orange-500 to-amber-500";

    return (
        <div className="space-y-6">
            <div>
                <h1 className={`text-3xl font-bold ${gradientText}`}>Relatórios da Plataforma</h1>
                <p className="text-muted-foreground">Gere relatórios analíticos sobre a saúde e atividade geral do R.A.I.O.</p>
            </div>
            <Suspense fallback={<LoadingSpinner />}>
              <PlatformReportClientPage />
            </Suspense>
        </div>
    );
}
