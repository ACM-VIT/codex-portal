'use client';

import { ReactNode } from 'react';

// Table component with min-width and border dividing styles
export const Table = ({ children }: { children: ReactNode }) => (
  <table className="min-w-full divide-y divide-gray-200">{children}</table>
);

// TableHeader with background style
export const TableHeader = ({ children }: { children: ReactNode }) => (
  <thead className="bg-gray-800">{children}</thead>
);

// TableBody with background style
export const TableBody = ({ children }: { children: ReactNode }) => (
  <tbody className="bg-gray-800">{children}</tbody>
);

// TableRow with hover effect
export const TableRow = ({ children }: { children: ReactNode }) => (
  <tr className="hover:bg-gray-900">{children}</tr>
);

// TableHead with text styling and an optional className prop for additional customization
export const TableHead = ({ children, className = '' }: { children: ReactNode; className?: string }) => (
  <th className={`px-6 py-3 text-left text-xs font-medium text-green-500 uppercase tracking-wider ${className}`}>
    {children}
  </th>
);

// TableCell with text styling and an optional className prop for additional customization
export const TableCell = ({ children, className = '' }: { children: ReactNode; className?: string }) => (
  <td className={`px-6 py-4 whitespace-nowrap text-sm text-gray-500 ${className}`}>{children}</td>
);