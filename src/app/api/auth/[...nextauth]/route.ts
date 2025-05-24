import NextAuth from 'next-auth';
import { NextRequest } from 'next/server';
import { authOptions } from '@/lib/auth';

/**
 * NextAuth handler for authentication
 * Handles all auth-related API requests
 */
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
