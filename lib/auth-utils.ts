import { Session } from 'next-auth';

/**
 * Verifica se a sessão do usuário pertence a um administrador.
 * @param session - O objeto de sessão do NextAuth.
 * @returns `true` se o usuário for um administrador, caso contrário `false`.
 */
export function isAdmin(session: Session | null): boolean {
  // Retorna true apenas se a sessão existir e a role do usuário for 'ADMIN'
  return !!session?.user?.role && session.user.role === 'ADMIN';
}
