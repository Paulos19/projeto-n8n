import NextAuth, { DefaultSession, DefaultUser } from "next-auth";
import { JWT as DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: {
      id: string;
      identifier?: string | null;
      webhookApiKey?: string | null; // Adicionado para corresponder ao que você adiciona no callback de sessão
    } & DefaultSession["user"]; // Mantém as propriedades padrão como name, email, image
  }

  /**
   * The shape of the user object returned in the OAuth providers' `profile` callback,
   * or the second parameter of the `session` callback, when using a database.
   */
  interface User extends DefaultUser {
    identifier?: string | null;
    webhookApiKey?: string | null; // Adicionado para corresponder ao que você retorna no `authorize`
  }
}

declare module "next-auth/jwt" {
  /** Returned by the `jwt` callback and `getToken`, when using JWT sessions */
  interface JWT extends DefaultJWT {
    id?: string; // Adicionado para corresponder ao que você adiciona no callback jwt
    identifier?: string | null;
    webhookApiKey?: string | null; // Adicionado
  }
}