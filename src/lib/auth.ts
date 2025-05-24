import { NextAuthOptions } from 'next-auth';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/db';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      image?: string;
      role: string;
      organizationId?: string;
      emailVerified?: boolean;
    };
    accessToken?: string;
  }

  interface User {
    id: string;
    email: string;
    name: string;
    image?: string;
    role: string;
    organizationId?: string;
    emailVerified?: boolean;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role?: string;
    organizationId?: string;
    emailVerified?: boolean;
    accessToken?: string;
    refreshToken?: string;
  }
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope:
            'openid email profile https://www.googleapis.com/auth/business.manage',
          access_type: 'offline',
          prompt: 'consent',
          include_granted_scopes: true,
        },
      },
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: {
            organization: true,
            ownedOrganization: true,
          },
        });

        if (!user || !user.password) {
          return null;
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          return null;
        }

        if (!user.isActive) {
          throw new Error('Account is deactivated');
        }

        // Update last login
        await prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() },
        });

        // Log activity
        await prisma.activityLog.create({
          data: {
            userId: user.id,
            action: 'LOGIN',
            resource: 'user',
            resourceId: user.id,
            description: 'User logged in with credentials',
          },
        });

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          image: user.avatar || undefined,
          organizationId: user.organizationId || undefined,
          emailVerified: !!user.emailVerified,
        };
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.role = user.role;
        token.organizationId = user.organizationId;
        token.emailVerified = !!user.emailVerified;
      }

      // Store Google access token for API calls
      if (account?.provider === 'google') {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub!;
        session.user.role = token.role!;
        session.user.organizationId = token.organizationId;
        session.user.emailVerified = token.emailVerified;
        session.accessToken = token.accessToken;
      }
      return session;
    },
    async signIn({ user, account, profile }) {
      try {
        if (account?.provider === 'google' && user.email) {
          // Check if user already exists with this email
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email },
            include: {
              accounts: true,
              organization: true,
              ownedOrganization: true,
            },
          });

          if (existingUser) {
            // Check if user is active
            if (!existingUser.isActive) {
              console.log('User account is deactivated:', user.email);
              return false;
            }

            // Check if Google account is already linked
            const googleAccount = existingUser.accounts.find(
              (acc: any) =>
                acc.provider === 'google' &&
                acc.providerAccountId === account.providerAccountId
            );

            if (!googleAccount) {
              // Link Google account to existing user
              await prisma.account.create({
                data: {
                  userId: existingUser.id,
                  type: account.type,
                  provider: account.provider,
                  providerAccountId: account.providerAccountId!,
                  access_token: account.access_token,
                  refresh_token: account.refresh_token,
                  expires_at: account.expires_at,
                  token_type: account.token_type,
                  scope: account.scope,
                  id_token: account.id_token,
                  session_state: account.session_state,
                },
              });

              // Update user with Google profile info if available
              await prisma.user.update({
                where: { id: existingUser.id },
                data: {
                  name: user.name || existingUser.name,
                  avatar: user.image || existingUser.avatar,
                  emailVerified: new Date(),
                  lastLoginAt: new Date(),
                },
              });

              console.log(
                'Linked Google account to existing user:',
                user.email
              );
            } else {
              // Update last login for existing linked account
              await prisma.user.update({
                where: { id: existingUser.id },
                data: { lastLoginAt: new Date() },
              });
            }

            // Update user object with existing user data
            Object.assign(user, {
              id: existingUser.id,
              role: existingUser.role,
              organizationId: existingUser.organizationId,
              emailVerified: true,
            });

            // Log activity
            await prisma.activityLog.create({
              data: {
                userId: existingUser.id,
                action: 'LOGIN',
                resource: 'user',
                resourceId: existingUser.id,
                description: 'User logged in with Google OAuth',
              },
            });

            return true;
          } else {
            // Create new user with Google account
            console.log('Creating new user with Google OAuth:', user.email);

            const result = await prisma.$transaction(async (tx: any) => {
              // Create user
              const newUser = await tx.user.create({
                data: {
                  email: user.email!,
                  name: user.name || 'Google User',
                  avatar: user.image,
                  role: 'BUSINESS_OWNER',
                  emailVerified: new Date(),
                  isActive: true,
                },
              });

              // Create organization
              const organization = await tx.organization.create({
                data: {
                  name: `${user.name || 'Google User'}'s Organization`,
                  type: 'BUSINESS',
                  ownerId: newUser.id,
                },
              });

              // Update user with organization
              const updatedUser = await tx.user.update({
                where: { id: newUser.id },
                data: { organizationId: organization.id },
              });

              // Create Google account link
              await tx.account.create({
                data: {
                  userId: newUser.id,
                  type: account.type,
                  provider: account.provider,
                  providerAccountId: account.providerAccountId!,
                  access_token: account.access_token,
                  refresh_token: account.refresh_token,
                  expires_at: account.expires_at,
                  token_type: account.token_type,
                  scope: account.scope,
                  id_token: account.id_token,
                  session_state: account.session_state,
                },
              });

              // Log activity
              await tx.activityLog.create({
                data: {
                  userId: newUser.id,
                  action: 'CREATE',
                  resource: 'user',
                  resourceId: newUser.id,
                  description: 'User registered with Google OAuth',
                },
              });

              return { user: updatedUser, organization };
            });

            // Update user object with new user data
            Object.assign(user, {
              id: result.user.id,
              role: result.user.role,
              organizationId: result.user.organizationId,
              emailVerified: true,
            });

            console.log('New user created successfully:', result.user.id);
            return true;
          }
        }

        return true;
      } catch (error) {
        console.error('Error in signIn callback:', error);
        return false;
      }
    },
  },
  pages: {
    signIn: '/auth/login',
    error: '/auth/error',
  },
  events: {
    async signIn({ user, account, isNewUser }) {
      console.log('SignIn event:', {
        userId: user.id,
        email: user.email,
        provider: account?.provider,
        isNewUser,
      });
    },
    async signOut({ session, token }) {
      console.log('SignOut event:', { userId: session?.user?.id });
    },
  },
  debug: true, // Enable debug mode for development
};
