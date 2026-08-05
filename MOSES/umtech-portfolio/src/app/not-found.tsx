import Link from "next/link";

export default function NotFound() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/10 via-background to-background" />

      <div className="absolute inset-0">
        <div className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 animate-pulse rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute left-1/3 top-1/4 h-[300px] w-[300px] animate-pulse rounded-full bg-secondary/10 blur-3xl [animation-delay:1s]" />
        <div className="absolute right-1/3 bottom-1/4 h-[350px] w-[350px] animate-pulse rounded-full bg-accent/10 blur-3xl [animation-delay:2s]" />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-6 px-4 text-center">
        <h1 className="gradient-text text-[12rem] font-black leading-none sm:text-[16rem]">
          404
        </h1>

        <p className="max-w-md text-lg text-foreground/60 sm:text-xl">
          Oops! The page you&apos;re looking for has drifted into the digital
          void.
        </p>

        <Link
          href="/"
          className="mt-4 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary to-secondary px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/25 transition-all duration-300 hover:shadow-xl hover:shadow-primary/40 hover:scale-105 active:scale-95"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M2.25 12l8.954-8.955a1.126 1.126 0 011.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
            />
          </svg>
          Go Home
        </Link>
      </div>

      <div className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2">
        <div className="flex gap-3">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-2 w-2 animate-bounce rounded-full bg-primary/60"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
