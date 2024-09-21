import { ReactNode } from 'react';
import '../globals.css';
import { VT323 } from 'next/font/google';
import SessionProviderWrapper from '../../../components/SessionProviderWrapper';

const vt323 = VT323({ weight: '400', subsets: ['latin'] });

export const metadata = {
  title: 'Codex Cryptum',
  description: 'A cybersecurity hackathon workshop',
};

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className={`${vt323.className} bg-black text-green-500 flex flex-col h-full relative`}>
        <SessionProviderWrapper>
          <div className="flex-grow relative z-0">{children}</div>
        </SessionProviderWrapper>
      </body>
    </html>
  );
}
