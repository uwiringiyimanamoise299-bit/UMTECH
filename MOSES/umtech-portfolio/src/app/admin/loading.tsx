export default function AdminLoading() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary animate-spin" />
        </div>
        <p className="text-sm text-gray-500 animate-pulse">Loading...</p>
      </div>
    </div>
  );
}