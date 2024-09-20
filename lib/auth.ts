import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import pool from './db'; // Assuming your db connection is here

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
      // Only allow users with @vitstudent.ac.in email
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
          return true; // Continue with sign-in
        } catch (error) {
          console.error('Error during signIn callback:', error);
          return false; // Reject sign-in if something goes wrong
        }
      } else {
        return false; // Reject sign-in if not @vitstudent.ac.in domain
      }
    },
    async session({ session, token }) {
      // Add custom properties to session if needed
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
