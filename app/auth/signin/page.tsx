
import SignInFormWrapper from '@/components/auth/SignInFormActual';
import { Suspense } from 'react'; 


function LoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <p className="text-lg">Carregando formulário de login...</p>
      {}
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <SignInFormWrapper />
    </Suspense>
  );
}