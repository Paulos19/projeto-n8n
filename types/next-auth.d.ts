import 'next-auth';
import 'next-auth/jwt';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      identifier?: string | null; // Ensure this matches your needs
    } & DefaultSession['user']; // DefaultSession['user'] usually has name, email, image
  }

  /**
   * The User object returned by the `authorize` callback and received by the `jwt` callback.
   * It should include all properties you expect on the user object.
   */
  interface User {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    identifier?: string | null; // Custom property, ensure it can be null if DB can be null
  }
}

declare module 'next-auth/jwt' {
  /** Returned by the `jwt` callback and `getToken`, when using JWT sessions */
  interface JWT {
    id?: string; // Standard field often added
    name?: string | null;
    email?: string | null;
    picture?: string | null; // 'image' from User often becomes 'picture' in JWT
    identifier?: string | null; // Custom property
  }
}