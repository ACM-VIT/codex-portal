'use client';

import { ReactNode } from 'react';

// Add `className` prop to accept optional class names
export const Table = ({ children, className = '' }: { children: ReactNode; className?: string }) => (
  <table className={`min-w-full divide-y divide-gray-200 ${className}`}>{children}</table>
);

export const TableHeader = ({ children, className = '' }: { children: ReactNode; className?: string }) => (
  <thead className={`bg-gray-800 ${className}`}>{children}</thead>
);

export const TableBody = ({ children, className = '' }: { children: ReactNode; className?: string }) => (
  <tbody className={`bg-gray-800 ${className}`}>{children}</tbody>
);

export const TableRow = ({ children, className = '' }: { children: ReactNode; className?: string }) => (
  <tr className={`hover:bg-gray-900 ${className}`}>{children}</tr>
);

export const TableHead = ({ children, className = '' }: { children: ReactNode; className?: string }) => (
  <th className={`px-6 py-3 text-left text-xs font-medium text-green-500 uppercase tracking-wider ${className}`}>
    {children}
  </th>
);

export const TableCell = ({ children, className = '' }: { children: ReactNode; className?: string }) => (
  <td className={`px-6 py-4 whitespace-nowrap text-sm text-gray-500 ${className}`}>{children}</td>
);