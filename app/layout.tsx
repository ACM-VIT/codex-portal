import { ReactNode } from 'react';
import '../globals.css';
import { VT323 } from 'next/font/google';
import SessionProviderWrapper from '../components/SessionProviderWrapper'; // Import the client-side SessionProvider wrapper

const vt323 = VT323({ weight: '400', subsets: ['latin'] });

export const metadata = {
  title: 'Codex Cryptum',
  description: 'A cybersecurity hackathon workshop',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className={`${vt323.className} bg-black text-green-500 flex flex-col h-full relative`}>
        {/* Background Overlay */}
        <div className="cyber-bg fixed inset-0 opacity-10 pointer-events-none z-[-2]" />

        {/* Watermark */}
        <div className="watermark fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-10 pointer-events-none z-[-1]">
          <img
            src="/images/cx.png"
            alt="Watermark"
            aria-hidden="true"
            className="max-w-xs sm:max-w-sm md:max-w-md"
          />
        </div>

        {/* Use the Client Component for the session provider */}
        <SessionProviderWrapper>
          <div className="flex-grow relative z-0">{children}</div>
        </SessionProviderWrapper>
      </body>
    </html>
  );
}
