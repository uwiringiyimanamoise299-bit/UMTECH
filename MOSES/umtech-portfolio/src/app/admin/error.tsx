'use client';

import { useEffect } from 'react';

export default function AdminError({
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
    <div className="flex flex-col items-center justify-center h-64 text-center px-4">
      <div className="w-14 h-14 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-4">
        <span className="text-2xl font-bold text-red-400">!</span>
      </div>
      <h2 className="text-xl font-bold text-white mb-2">Error</h2>
      <p className="text-gray-500 text-sm mb-4 max-w-md">
        Something went wrong loading this page.
      </p>
      <button
        onClick={reset}
        className="btn-primary text-sm"
      >
        Try Again
      </button>
    </div>
  );
}