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
    error: '/auth/error', // Add this line to specify a custom error page
  },
  callbacks: {
    async signIn({ user, account }) {
      console.log('Sign-in attempt:', user.email); // Log sign-in attempts
      if (user.email?.endsWith('@vitstudent.ac.in')) {
        try {
          const client = await pool.connect();

          // Check if the user exists in the leaderboard
          const checkUser = await client.query(
            'SELECT user_name FROM leaderboard WHERE user_name = $1',
            [user.name]
          );

          // If the user does not exist, insert them with 0 points
          if (checkUser.rowCount === 0) {
            await client.query(
              'INSERT INTO leaderboard (user_name, points) VALUES ($1, 0)',
              [user.name]
            );
          }

          client.release();
          console.log('User authenticated successfully:', user.email);
          return true; // Continue with sign-in
        } catch (error) {
          console.error('Error during signIn callback:', error);
          return false; // Reject sign-in if something goes wrong
        }
      } else {
        console.log('Access denied for:', user.email);
        return false; // Reject sign-in if not @vitstudent.ac.in domain
      }
    },
    async redirect({ url, baseUrl }) {
      console.log('Redirect callback - URL:', url, 'Base URL:', baseUrl);
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
    async session({ session, token }) {
      // Add custom properties to session if needed
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};