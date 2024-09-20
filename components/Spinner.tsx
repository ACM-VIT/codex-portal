
import React from 'react';

interface SpinnerProps {
  size?: string; // Optional prop to adjust the size
  color?: string; // Optional prop to adjust the color
}

const Spinner: React.FC<SpinnerProps> = ({ size = 'h-8 w-8', color = 'border-green-500' }) => {
  return (
    <div className="flex justify-center items-center">
      <div className={`animate-spin rounded-full ${size} border-t-2 border-b-2 ${color}`}></div>
    </div>
  );
};

export default Spinner;