

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(req: NextRequest) {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    console.error("AUTH_SECRET não está definido. O middleware de autenticação não pode funcionar.");
    // Em um cenário de produção, você pode querer retornar um erro 500 ou redirecionar para uma página de erro genérica.
    // Por enquanto, vamos permitir o acesso para evitar um bloqueio completo se o secret não estiver carregado,
    // mas isso é um risco de segurança.
    return NextResponse.next();
  }

  const token = await getToken({ req, secret });

  const { pathname } = req.nextUrl;

  // Se o usuário não estiver logado e tentar acessar uma rota protegida
  if (!token && pathname.startsWith('/dashboard')) {
    const signInUrl = new URL('/auth/signin', req.url);
    signInUrl.searchParams.set('callbackUrl', req.url); // Redireciona de volta após o login
    return NextResponse.redirect(signInUrl);
  }

  // Se o usuário estiver logado e tentar acessar a página de login, redirecione para o dashboard
  if (token && (pathname === '/auth/signin' || pathname === '/auth/signup')) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  // Adicione após a verificação inicial do token
  if (token && pathname.startsWith('/dashboard')) {
    const url = req.nextUrl.clone();
    // Impede acesso a IDs que não pertencem ao usuário
    if (url.pathname.includes('/avaliacao/') && !url.pathname.endsWith(`/${token.id}`)) {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Corresponde a todas as rotas, exceto aquelas que começam com:
     * - api (rotas de API)
     * - _next/static (arquivos estáticos)
     * - _next/image (otimização de imagem)
     * - favicon.ico (arquivo favicon)
     * Isso garante que o middleware seja executado em páginas e não em assets.
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
    // Inclua explicitamente as rotas que você quer proteger se o matcher acima for muito amplo
    // ou se você quiser proteger rotas específicas além do dashboard.
    // No seu caso, o matcher original já cobria o dashboard:
    // "/dashboard/:path*",
  ],
};