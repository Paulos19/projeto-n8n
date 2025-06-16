import { NextAuthOptions, User as NextAuthUser } from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import prisma from "@/lib/prisma";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { Role } from "@prisma/client"; // Importe o Enum do Prisma Client

// Tipo auxiliar para o usuário autorizado
type AuthorizeUserType = NextAuthUser & {
  identifier?: string | null;
  webhookApiKey?: string | null;
  role: Role; // Adicionado
};

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        identifier: { label: "Identificador (CPF/CNPJ)", type: "text" },
        password: { label: "Senha", type: "password" }
      },
      async authorize(credentials): Promise<AuthorizeUserType | null> {
        if (!credentials?.identifier || !credentials.password) {
          return null;
        }

        const dbUser = await prisma.user.findUnique({
          where: { identifier: credentials.identifier }
        });

        if (!dbUser || !dbUser.passwordHash) {
          return null;
        }

        const isValidPassword = await bcrypt.compare(credentials.password, dbUser.passwordHash);

        if (!isValidPassword) {
          return null;
        }

        // Retorna o objeto do usuário completo, incluindo a role
        return {
          id: dbUser.id,
          name: dbUser.name,
          email: dbUser.email,
          image: dbUser.image,
          identifier: dbUser.identifier,
          webhookApiKey: dbUser.webhookApiKey,
          role: dbUser.role, // <-- Incluído
        };
      }
    }),
  ],
  callbacks: {
    // O callback 'jwt' é chamado sempre que um JWT é criado ou atualizado.
    async jwt({ token, user }) {
      // Se o objeto 'user' existir (ocorre no login inicial), transfira os dados para o token.
      if (user) {
        token.id = user.id;
        token.role = user.role; // <-- Adiciona a role ao token
        // @ts-ignore - Necessário pois os tipos padrão podem não incluir campos customizados
        token.webhookApiKey = user.webhookApiKey;
        // @ts-ignore
        token.image = user.image;
      }
      return token;
    },
    // O callback 'session' é chamado sempre que uma sessão é acessada.
    async session({ session, token }) {
      // Garante que o objeto de sessão tenha os dados do token.
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as Role; // <-- Adiciona a role à sessão
        // @ts-ignore
        session.user.webhookApiKey = token.webhookApiKey as string | null;
        // @ts-ignore
        session.user.image = token.image as string | null;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
};
