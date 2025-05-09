import NextAuth, { DefaultSession, DefaultUser } from "next-auth";
import { JWT, DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      webhookApiKey?: string | null;
    } & DefaultSession["user"]; // DefaultSession["user"] já inclui name, email, image
  }

  interface User extends DefaultUser {
    webhookApiKey?: string | null;
    // image já faz parte de DefaultUser
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id: string;
    webhookApiKey?: string | null;
    // picture (para imagem) já faz parte de DefaultJWT
  }
}