'use client';

import { useSession } from 'next-auth/react';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  image?: string;
  role: string;
  organizationId?: string;
  emailVerified?: boolean;
}

export function useAuth() {
  const { data: session, status } = useSession();

  const user: AuthUser | null = session?.user ? {
    id: session.user.id,
    email: session.user.email,
    name: session.user.name,
    image: session.user.image,
    role: session.user.role,
    organizationId: session.user.organizationId,
    emailVerified: session.user.emailVerified,
  } : null;

  return {
    user,
    isLoading: status === 'loading',
    isAuthenticated: status === 'authenticated',
    isUnauthenticated: status === 'unauthenticated',
    accessToken: session?.accessToken,
  };
} 