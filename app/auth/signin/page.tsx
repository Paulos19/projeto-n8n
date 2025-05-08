// app/auth/signin/page.tsx (ou o caminho correto da sua página)
import { SignInFormActual } from '@/components/auth/SignInFormActual';
import { Suspense } from 'react'; // Ajuste o caminho se necessário

// Um componente de fallback para mostrar enquanto o formulário está carregando
function LoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <p className="text-lg">Carregando formulário de login...</p>
      {/* Você pode adicionar um spinner ou um skeleton screen aqui */}
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <SignInFormActual />
    </Suspense>
  );
}