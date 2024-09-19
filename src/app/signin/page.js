"use client";

import { useEffect } from 'react';
import Script from 'next/script';

export default function SignIn() {
  // Callback function to handle Google credential response
  const handleCredentialResponse = (response) => {
    const decodedJWT = JSON.parse(atob(response.credential.split('.')[1]));
    const email = decodedJWT.email;

    if (email.endsWith('@vitstudent.ac.in')) {
      console.log("Signed in successfully with: " + email);
      // Handle successful login, e.g., redirect or set session
    } else {
      alert("Only VIT student emails are allowed.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="p-6 rounded-lg shadow-lg bg-white max-w-sm w-full text-center">
        <h1 className="text-xl font-semibold mb-4">Codex Cryptum</h1>
        <div id="googleSignInBtn"></div>
      </div>

      {/* Load the Google Identity Services (GIS) script dynamically */}
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onLoad={() => {
          // Initialize Google Identity Services after the script loads
          window.google.accounts.id.initialize({
            client_id: "273708013662-57dmf79tbujlodlh3m93oo16i4n6pho1.apps.googleusercontent.com",
            callback: handleCredentialResponse,
            hosted_domain: 'vitstudent.ac.in',
          });

          // Render the sign-in button after initialization
          window.google.accounts.id.renderButton(
            document.getElementById("googleSignInBtn"),
            { theme: "outline", size: "large" }  // Customize the button appearance
          );
        }}
      />
    </div>
  );
}
