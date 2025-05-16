import { NextAuthOptions, User as NextAuthUser } from "next-auth"; // Import User for explicit typing
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import prisma from "@/lib/prisma"; // Certifique-se de que o prisma client está importado
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

// Define a type for the user object returned by authorize, matching your next-auth.d.ts User
// This helps ensure the object shape is correct.
type AuthorizeUserType = NextAuthUser & {
  identifier?: string | null;
  webhookApiKey?: string | null; // Adicionado
};

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        identifier: { label: "Identificador (CPF/CNPJ)", type: "text", placeholder: "Seu CPF ou CNPJ" },
        password: { label: "Senha", type: "password" }
      },
      // For NextAuth.js v4, authorize typically doesn't take `req` unless types are mixed.
      // If the error about `req` persists, you might need to add it: async authorize(credentials, req)
      async authorize(credentials): Promise<AuthorizeUserType | null> {
        if (!credentials?.identifier || !credentials.password) {
          return null;
        }

        const identifier = credentials.identifier as string;
        const password = credentials.password as string;

        const dbUser = await prisma.user.findUnique({
          where: { identifier: identifier }
        });

        if (!dbUser || !dbUser.passwordHash) {
          return null;
        }

        const isValidPassword = await bcrypt.compare(password, dbUser.passwordHash);

        if (!isValidPassword) {
          return null;
        }

        // Construct user object that matches the `User` interface in next-auth.d.ts
        const authorizedUser: AuthorizeUserType = {
          id: dbUser.id,
          name: dbUser.name,
          email: dbUser.email,
          image: dbUser.image,
          identifier: dbUser.identifier, // Custom field
          webhookApiKey: dbUser.webhookApiKey, // Adicionado
        };
        return authorizedUser;
      }
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session: newSessionData }) {
      if (user) {
        token.id = user.id;
        // @ts-ignore
        token.webhookApiKey = user.webhookApiKey; // Adicionado ao buscar usuário inicial
        // @ts-ignore
        token.image = user.image; // Adicionado ao buscar imagem inicial
      }

      // Se a sessão for atualizada (ex: após salvar configurações do usuário)
      if (trigger === "update" && newSessionData) {
        if (newSessionData.user?.name) {
          token.name = newSessionData.user.name;
        }
        if (newSessionData.user?.email) {
          token.email = newSessionData.user.email;
        }
        if (newSessionData.user?.image) {
          // @ts-ignore
          token.image = newSessionData.user.image;
        }
        // Se a webhookApiKey puder ser atualizada via sessão, adicione aqui também
        // if (newSessionData.user?.webhookApiKey) {
        //   token.webhookApiKey = newSessionData.user.webhookApiKey;
        // }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        // @ts-ignore
        session.user.webhookApiKey = token.webhookApiKey as string | null;
        // @ts-ignore
        session.user.image = token.image as string | null;
      }
      return session;
    },
    // Adicione o evento de createUser se ainda não existir, para gerar a webhookApiKey
    // async events: {
    //   async createUser({ user }) {
    //     if (user.id) {
    //       const apiKey = `RAIO-${crypto.randomUUID()}`;
    //       await prisma.user.update({
    //         where: { id: user.id },
    //         data: { webhookApiKey: apiKey },
    //       });
    //     }
    //   },
    // },
  },
  adapter: PrismaAdapter(prisma), // Se você estiver usando o PrismaAdapter
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: '/auth/signin',
  },
  // debug: process.env.NODE_ENV === "development", // Uncomment for debugging if needed
};