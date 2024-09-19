import { useEffect, useState } from 'react';
import firebase from '../firebase';
import { useRouter } from 'next/router';

export default function Portal() {
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    firebase.auth().onAuthStateChanged((user) => {
      if (!user) {
        router.push('/signin');  // Redirect to sign-in if not authenticated
      } else {
        setUser(user);
      }
    });
  }, []);

  if (!user) return <p>Loading...</p>;

  return (
    <div>
      <h1>Welcome to the Portal</h1>
      <p>Logged in as {user.email}</p>
      <button onClick={() => firebase.auth().signOut()}>Sign Out</button>
    </div>
  );
}
