import { NextAuthOptions, User as NextAuthUser } from "next-auth"; // Import User for explicit typing
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import prisma from "@/lib/prisma";
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
    async jwt({ token, user }) {
      if (user) {
        // user object here is from authorize
        const u = user as AuthorizeUserType; // Cast to ensure access to identifier
        token.id = u.id;
        token.identifier = u.identifier;
        token.webhookApiKey = u.webhookApiKey; // Adicionado
        // Optionally map to standard JWT claims if needed elsewhere
        token.name = u.name;
        token.email = u.email;
        token.picture = u.image; // 'image' often mapped to 'picture' in JWT
      }
      return token;
    },
    async session({ session, token }) {
      // token object here is from jwt callback
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.name = token.name;
        session.user.email = token.email;
        session.user.image = token.picture; // Map 'picture' back to 'image'

        // Assign custom 'identifier' property to session.user
        // This relies on Session.user in next-auth.d.ts being augmented
        session.user.identifier = token.identifier as (string | null | undefined);
        session.user.webhookApiKey = token.webhookApiKey as (string | null | undefined); // Adicionado
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
  // debug: process.env.NODE_ENV === "development", // Uncomment for debugging if needed
};