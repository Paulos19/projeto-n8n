import { Role } from "@prisma/client"; // Importe o Enum do seu Prisma Client
import NextAuth, { DefaultSession, DefaultUser } from "next-auth";
import { JWT, DefaultJWT } from "next-auth/jwt";

// Defina o tipo Role para uso em toda a aplicação
type UserRole = Role; // Use o tipo gerado pelo Prisma

declare module "next-auth" {
  /**
   * Retornado por `useSession`, `getSession` e recebido como prop para o `SessionProvider`
   */
  interface Session {
    user: {
      id: string;
      role: UserRole; // Adiciona role à sessão do usuário
      webhookApiKey?: string | null;
    } & DefaultSession["user"]; // Mantém as propriedades padrão como name, email, image
  }

  /**
   * O objeto User que você obtém do seu banco de dados e passa para o callback authorize.
   */
  interface User extends DefaultUser {
    role: UserRole; // Adiciona role ao objeto User principal
    webhookApiKey?: string | null;
  }
}

declare module "next-auth/jwt" {
  /** Retornado pelo callback `jwt` e pela função `getToken` */
  interface JWT extends DefaultJWT {
    id: string;
    role: UserRole; // Adiciona role ao token JWT
    webhookApiKey?: string | null;
  }
}
