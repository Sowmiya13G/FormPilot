import NextAuth, { type DefaultSession } from 'next-auth';
import Google from 'next-auth/providers/google';
import connectToDatabase from '@/lib/db/mongoose';
import User from '@/models/User';
import { Role } from '@/types';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: Role;
    } & DefaultSession['user'];
  }

  interface User {
    role?: Role;
  }
}

declare module '@auth/core/jwt' {
  interface JWT {
    id?: string;
    role?: Role;
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID || process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.AUTH_GOOGLE_SECRET || process.env.GOOGLE_CLIENT_SECRET || '',
    }),
  ],
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async signIn({ user, account }) {
      if (!user.email) return false;
      const normalizedEmail = user.email.toLowerCase().trim();

      try {
        await connectToDatabase();

        const initialAdmins = (process.env.INITIAL_ADMIN_EMAILS || '')
          .split(',')
          .map((e) => e.trim().toLowerCase())
          .filter(Boolean);

        let dbUser = await User.findOne({ email: normalizedEmail });

        if (!dbUser) {
          const isInitialAdmin = initialAdmins.includes(normalizedEmail);
          if (!isInitialAdmin) {
            // Not allowlisted
            return '/unauthorized';
          }

          // Auto-bootstrap initial admin
          dbUser = await User.create({
            email: normalizedEmail,
            name: user.name || 'System Admin',
            image: user.image || undefined,
            role: 'ADMIN',
            active: true,
            authProvider: account?.provider || 'google',
            providerSubject: account?.providerAccountId,
            lastLoginAt: new Date(),
            createdBy: 'initial-bootstrap',
          });
        } else {
          if (!dbUser.active) {
            return '/unauthorized';
          }

          dbUser.lastLoginAt = new Date();
          if (user.image && user.image !== dbUser.image) {
            dbUser.image = user.image;
          }
          await dbUser.save();
        }

        user.id = dbUser._id.toString();
        user.role = dbUser.role;
        return true;
      } catch (error) {
        console.error('Error during signIn callback:', error);
        return false;
      }
    },

    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      } else if (token.email && !token.role) {
        try {
          await connectToDatabase();
          const dbUser = await User.findOne({ email: token.email.toLowerCase().trim() });
          if (dbUser) {
            token.id = dbUser._id.toString();
            token.role = dbUser.role;
          }
        } catch (e) {
          console.error('Error fetching user role in jwt callback:', e);
        }
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        if (token.id) session.user.id = token.id as string;
        if (token.role) session.user.role = token.role as Role;
      }
      return session;
    },
  },
  trustHost: true,
});
