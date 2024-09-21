import { useEffect, useState } from 'react';

interface LoadingScreenProps {
  duration?: number; 
  onComplete?: () => void; 
}

export default function LoadingScreen({ duration = 3000, onComplete }: LoadingScreenProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      if (onComplete) {
        onComplete(); 
      }
    }, duration);

    return () => clearTimeout(timer); 
  }, [duration, onComplete]);

  if (!isVisible) return null;

  return (
    <div className="flex items-center justify-center h-screen bg-black">
      <img
        src="/images/load.gif" 
        alt="Loading"
        className="h-auto w-auto" 
      />
    </div>
  );
}