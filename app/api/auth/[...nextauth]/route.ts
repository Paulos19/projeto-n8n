import NextAuth from "next-auth";
import { authOptions } from "@/auth"; // Assuming auth.ts is at the root (e.g., c:/.../frontend/auth.ts)
                                     // and you have a path alias `@/*` in tsconfig.json

// This is the NextAuth.js v4 style for App Router
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };