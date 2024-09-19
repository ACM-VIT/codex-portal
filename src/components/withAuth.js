// hoc/withAuth.js
import { useEffect, useState } from 'react';
import firebase from '../firebase';
import { useRouter } from 'next/router';

export default function withAuth(Component) {
  return function AuthenticatedComponent(props) {
    const [loading, setLoading] = useState(true);
    const [authenticated, setAuthenticated] = useState(false);
    const router = useRouter();

    useEffect(() => {
      firebase.auth().onAuthStateChanged((user) => {
        if (user && user.email.endsWith('@vitstudent.ac.in')) {
          setAuthenticated(true);
        } else {
          router.push('/signin');
        }
        setLoading(false);
      });
    }, []);

    if (loading) return <p>Loading...</p>;

    if (!authenticated) return null;

    return <Component {...props} />;
  };
}
