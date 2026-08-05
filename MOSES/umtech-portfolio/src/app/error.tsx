'use client';

import { useEffect } from 'react';

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-4">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/10 via-background to-background" />
      <div className="relative z-10 flex flex-col items-center gap-6 text-center">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-2xl shadow-primary/25">
          <span className="text-4xl font-bold text-white">!</span>
        </div>
        <h1 className="text-4xl font-bold text-foreground">Something went wrong</h1>
        <p className="max-w-md text-foreground/60">
          An unexpected error occurred. Please try again.
        </p>
        <button
          onClick={reset}
          className="btn-primary mt-2"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}