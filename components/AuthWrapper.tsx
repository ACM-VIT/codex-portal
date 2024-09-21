'use client';

import { useSession, signIn } from 'next-auth/react';
import { useEffect } from 'react';
import LoadingScreen from './LoadingScreen'; // Adjust the path if necessary

interface AuthWrapperProps {
  children: React.ReactNode;
}

const AuthWrapper: React.FC<AuthWrapperProps> = ({ children }) => {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === 'unauthenticated') {
      // Trigger signIn to redirect unauthenticated users
      // Ensure signIn only gets called once and avoids unnecessary rendering
      signIn(); 
    }
  }, [status]);

  // Show loading while checking authentication status
  if (status === 'loading') {
    return <LoadingScreen />;
  }

  // If authenticated, render children
  if (status === 'authenticated') {
    return <>{children}</>;
  }

  // If unauthenticated, don't render anything until redirected
  return null;
};

export default AuthWrapper;
