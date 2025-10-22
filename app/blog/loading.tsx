import { Skeleton } from '@/components/ui/skeleton';

export default function BlogLoading() {
  return (
    <div className="flex gap-6">
      <aside className="hidden md:block w-64 space-y-4">
        <Skeleton className="h-8 w-32" />
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-6 w-full" />
        ))}
      </aside>
      <main className="flex-1 space-y-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="space-y-3 p-6 border rounded-lg">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        ))}
      </main>
    </div>
  );
}
