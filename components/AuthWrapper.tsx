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
      // Trigger signIn to redirect unauthenticated users, but don't immediately render the page
      signIn(); 
    }
  }, [status]);

  // Show loading while checking authentication status
  if (status === 'loading') {
    return <LoadingScreen />;
  }

  // If the user is authenticated, render the children
  if (status === 'authenticated') {
    return <>{children}</>;
  }

  // Render nothing while redirecting to avoid the loop
  return null;
};

export default AuthWrapper;
