// lib/auth.ts

import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          hd: 'vitstudent.ac.in', // Restrict to vitstudent.ac.in domain
        },
      },
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      if (user.email?.endsWith('@vitstudent.ac.in')) {
        return true;
      } else {
        return false;
      }
    },
    async session({ session }) {
      // Add custom properties to session if needed
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
