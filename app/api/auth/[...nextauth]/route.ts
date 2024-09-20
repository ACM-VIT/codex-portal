// app/api/auth/[...nextauth]/route.ts

import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { NextAuthOptions } from 'next-auth';

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          // Restrict sign-in to vitstudent.ac.in domain
          hd: 'vitstudent.ac.in',
        },
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (user.email?.endsWith('@vitstudent.ac.in')) {
        return true;
      } else {
        return false;
      }
    },
    async session({ session, token }) {
      // Add custom properties to session if needed
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
