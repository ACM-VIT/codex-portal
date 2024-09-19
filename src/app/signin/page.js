"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Script from 'next/script';

export default function SignIn() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const loadGoogleAPI = () => {
    if (window.gapi) {
      window.gapi.load('auth2', () => {
        const auth2 = window.gapi.auth2.init({
          client_id: '273708013662-57dmf79tbujlodlh3m93oo16i4n6pho1.apps.googleusercontent.com',
          scope: 'profile email',
          hosted_domain: 'vitstudent.ac.in',
        });

        auth2.attachClickHandler(document.getElementById('googleSignInBtn'), {},
          (googleUser) => {
            const profile = googleUser.getBasicProfile();
            const email = profile.getEmail();

            if (email.endsWith('@vitstudent.ac.in')) {
              setLoading(true); // Show loading spinner during redirection
              router.push('/');  // Redirect to the portal (home page)
            } else {
              alert('Only VIT student emails are allowed.');
              auth2.signOut();
            }
          }, (error) => {
            console.log('Error during sign-in:', error);
          }
        );
      });
    } else {
      console.error('Google API not loaded.');
    }
  };

  useEffect(() => {
    if (window.gapi) {
      loadGoogleAPI();
    }
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="p-6 rounded-lg shadow-lg bg-white max-w-sm w-full text-center">
        <h1 className="text-xl font-semibold mb-4">Codex Cryptum</h1>
        <div
          id="googleSignInBtn"
          className="bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-blue-600 transition-all cursor-pointer"
        >
          {loading ? "Redirecting..." : "Login with Google"}
        </div>
      </div>
      <Script
        src="https://apis.google.com/js/platform.js"
        strategy="afterInteractive"
        onLoad={() => {
          if (window.gapi) {
            loadGoogleAPI();
          }
        }}
      />
    </div>
  );
}
