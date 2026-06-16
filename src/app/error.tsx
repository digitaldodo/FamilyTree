'use client';

// Root Error Boundary
// TODO: Implement styled error UI with retry action

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h2>Something went wrong!</h2>
      <p>{error.message}</p>
      {/* TODO: Style the retry button */}
      <button onClick={() => reset()}>Try again</button>
    </div>
  );
}
