import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Script from 'next/script';  // To load the Google API script dynamically

export default function SignIn() {
  const router = useRouter();

  // Initialize Google API once the component is mounted
  useEffect(() => {
    const startGoogleAuth = () => {
      window.gapi.load('auth2', () => {
        window.gapi.auth2.init({
          client_id: '273708013662-57dmf79tbujlodlh3m93oo16i4n6pho1.apps.googleusercontent.com',  // Replace with your GCP OAuth Client ID
          hosted_domain: 'vitstudent.ac.in',  // To restrict to the specific domain (optional)
        }).then(auth2 => {
          attachSignin(document.getElementById('googleSignInBtn'), auth2);
        });
      });
    };

    const attachSignin = (element, auth2) => {
      auth2.attachClickHandler(element, {},
        (googleUser) => {
          const profile = googleUser.getBasicProfile();
          const email = profile.getEmail();
          // Restrict to 'vitstudent.ac.in' domain
          if (email.endsWith('@vitstudent.ac.in')) {
            // Redirect or store the token
            router.push('/');
          } else {
            alert('Only VIT student emails are allowed.');
            auth2.signOut();  // Sign out if email is not valid
          }
        }, (error) => {
          console.log('Error:', error);
        });
    };

    // Initialize Google API when the component is mounted
    startGoogleAuth();
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="p-6 rounded-lg shadow-lg bg-white max-w-sm w-full text-center">
        <h1 className="text-xl font-semibold mb-4">Codex Cryptum</h1>
        <div id="googleSignInBtn" className="bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-blue-600 transition-all cursor-pointer">
          Login with Google
        </div>
      </div>
      {/* Load Google API script dynamically */}
      <Script
        src="https://apis.google.com/js/platform.js"
        strategy="afterInteractive"
        onLoad={() => console.log('Google API loaded')}
      />
    </div>
  );
}
