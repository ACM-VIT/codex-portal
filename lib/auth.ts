// lib/auth.ts

import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import pool from './db';

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "select_account",
          hd: 'vitstudent.ac.in',
        },
      },
    }),
  ],
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error', 
  },
  callbacks: {
    async signIn({ user, account }) {
      console.log('Sign-in attempt:', user.email); // Log sign-in attempts
      if (user.email?.endsWith('@vitstudent.ac.in')) {
        try {
          const client = await pool.connect();

          const checkUser = await client.query(
            'SELECT user_name FROM leaderboard WHERE user_name = $1',
            [user.name]
          );

          if (checkUser.rowCount === 0) {
            await client.query(
              'INSERT INTO leaderboard (user_name, points) VALUES ($1, 0)',
              [user.name]
            );
          }

          client.release();
          console.log('User authenticated successfully:', user.email);
          return true; 
        } catch (error) {
          console.error('Error during signIn callback:', error);
          return false; 
        }
      } else {
        console.log('Access denied for:', user.email);
        return false;
      }
    },
    async redirect({ url, baseUrl }) {
      console.log('Redirect callback - URL:', url, 'Base URL:', baseUrl);
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
    async session({ session, token }) {
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};