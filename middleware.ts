import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(req: NextRequest) {
  const secret = process.env.AUTH_SECRET;
  const { pathname } = req.nextUrl;
  
  // A rota /auth/signin usa uma variável de ambiente diferente para o segredo,
  // por isso é importante ter a variável de ambiente AUTH_SECRET definida.
  if (!secret) {
    console.error("AUTH_SECRET não está definido. O middleware de autenticação não pode funcionar.");
    return NextResponse.next();
  }

  const token = await getToken({ req, secret });

  // Se o usuário tentar acessar o painel de admin
  if (pathname.startsWith('/admin')) {
    // Se não houver token ou a role não for ADMIN, redireciona para o dashboard normal
    if (!token || token.role !== 'ADMIN') {
      const url = new URL('/dashboard', req.url);
      console.log(`Acesso não autorizado à rota de admin negado para o token: ${JSON.stringify(token)}. Redirecionando para ${url.toString()}`);
      return NextResponse.redirect(url);
    }
  }

  // Se o usuário não estiver logado e tentar acessar uma rota protegida do dashboard comum
  if (!token && pathname.startsWith('/dashboard')) {
    const signInUrl = new URL('/auth/signin', req.url);
    signInUrl.searchParams.set('callbackUrl', req.url);
    return NextResponse.redirect(signInUrl);
  }

  // Se o usuário estiver logado e tentar acessar a página de login, redirecione para o dashboard
  if (token && (pathname === '/auth/signin' || pathname === '/auth/signup')) {
    // Se for admin, redireciona para o painel de admin, senão para o dashboard comum
    const redirectUrl = token.role === 'ADMIN' ? '/admin' : '/dashboard';
    return NextResponse.redirect(new URL(redirectUrl, req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Corresponde a todas as rotas, exceto aquelas que começam com:
     * - api (rotas de API) - Protegemos rotas de API dentro de cada arquivo
     * - _next/static (arquivos estáticos)
     * - _next/image (otimização de imagem)
     * - favicon.ico (arquivo favicon)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
