export default function LoginLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-bg">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary animate-spin" />
      </div>
    </div>
  );
}