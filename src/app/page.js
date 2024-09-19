import Link from 'next/link';

export default function Home() {
  return (
    <div>
      <h1>Welcome to My Website</h1>
      <p>This is the home page for my app.</p>
      <Link href="/signin">
        Go to Portal
      </Link>
    </div>
  );
}
