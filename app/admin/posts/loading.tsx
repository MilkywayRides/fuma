import { Skeleton } from '@/components/ui/skeleton';

export default function PostsLoading() {
  return (
    <div className="container py-8 space-y-6">
      <Skeleton className="h-10 w-48" />
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="p-6 border rounded-lg space-y-3">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        ))}
      </div>
    </div>
  );
}
