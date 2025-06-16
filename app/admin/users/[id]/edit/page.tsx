import { Suspense } from 'react';
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { EditUserForm } from './EditUserForm';

interface EditUserPageProps {
    params: {
        id: string;
    }
}

export default function EditUserPage({ params }: EditUserPageProps) {
    const gradientText = "bg-clip-text text-transparent bg-gradient-to-r from-red-500 via-orange-500 to-amber-500";
    
    return (
        <div className="space-y-6 max-w-2xl mx-auto">
             <Button asChild variant="outline">
                <Link href="/admin/users">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para a lista de usuários
                </Link>
            </Button>
            <div>
                <h1 className={`text-3xl font-bold ${gradientText}`}>Editar Usuário</h1>
                <p className="text-muted-foreground">
                    Altere as informações do usuário selecionado.
                </p>
            </div>
            <Suspense fallback={<LoadingSpinner message="Carregando formulário..." />}>
              <EditUserForm userId={params.id} />
            </Suspense>
        </div>
    );
}
