'use client';

import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import LoadingScreen from './LoadingScreen';

interface AuthWrapperProps {
  children: React.ReactNode;
}

const AuthWrapper: React.FC<AuthWrapperProps> = ({ children }) => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === 'unauthenticated' && pathname !== '/auth/signin') {
      router.push('/auth/signin');
    }
  }, [status, router, pathname]);

  if (status === 'loading') {
    return <LoadingScreen />;
  }

  if (status === 'authenticated' || pathname === '/auth/signin') {
    return <>{children}</>;
  }

  return null;
};

export default AuthWrapper;