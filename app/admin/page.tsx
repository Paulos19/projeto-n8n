import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, BarChart } from "lucide-react";

export default function AdminDashboardPage() {
    const gradientText = "bg-clip-text text-transparent bg-gradient-to-r from-red-500 via-orange-500 to-amber-500";

    return (
        <div className="space-y-8">
            <h1 className={`text-3xl font-bold ${gradientText}`}>
                Dashboard do Administrador
            </h1>
            <p className="text-muted-foreground">
                Visão geral e gerenciamento da plataforma R.A.I.O.
            </p>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Usuários Totais</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">1</div>
                        <p className="text-xs text-muted-foreground">
                            +1 no último mês (Exemplo)
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Relatórios Gerados</CardTitle>
                        <BarChart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">125</div>
                         <p className="text-xs text-muted-foreground">
                            +15% no último mês (Exemplo)
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
