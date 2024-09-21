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
          hd: 'vitstudent.ac.in',
        },
      },
    }),
  ],
  pages: {
    signIn: '/auth/signin',
  },
  callbacks: {
    async signIn({ user }) {
      if (user.email?.endsWith('@vitstudent.ac.in')) {
        try {
          const client = await pool.connect();
          
          // Check if the user exists in the database
          const checkUser = await client.query(
            'SELECT * FROM users WHERE email = $1', [user.email]
          );
          
          // If the user doesn't exist, insert them into the database
          if (checkUser.rowCount === 0) {
            await client.query(
              'INSERT INTO users (name, email) VALUES ($1, $2)', 
              [user.name, user.email]
            );
          }
          
          client.release();
          return true; 
        } catch (error) {
          console.error('Error during signIn callback:', error);
          return false; 
        }
      } else {
        return false; 
      }
    },
    async session({ session, token }) {
      // Ensure session.user is defined before assigning email
      if (session?.user) {
        session.user.email = token.email;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },  
  secret: process.env.NEXTAUTH_SECRET, 
};