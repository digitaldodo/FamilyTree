// 404 Not Found Page
// TODO: Implement styled 404 page with navigation back

import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-6xl font-bold">404</h1>
      <p>Page not found</p>
      {/* TODO: Style the link */}
      <Link href="/">Go back home</Link>
    </div>
  );
}
