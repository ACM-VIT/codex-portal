// layout.tsx

import { ReactNode } from 'react';
import '../globals.css';
import { VT323 } from 'next/font/google';
import SessionProviderWrapper from '../components/SessionProviderWrapper';
import AuthWrapper from '../components/AuthWrapper';
import { Analytics } from "@vercel/analytics/react"
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const vt323 = VT323({ weight: '400', subsets: ['latin'] });

export const metadata = {
  title: 'Codex Cryptum',
  description: 'Gravitas 2024 Portal',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className={`${vt323.className} bg-black text-green-500 flex flex-col h-full relative`}>
        <SessionProviderWrapper>
          <AuthWrapper>
            <div className="flex-grow relative z-0">{children}</div>
          </AuthWrapper>
        </SessionProviderWrapper>
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
      </body>
    </html>
  );
}
