import { Skeleton } from "@/components/ui/Skeleton";

export default function EntdeckenLoading() {
  return (
    <div className="py-16">
      <div className="mx-auto max-w-6xl space-y-6">
        <Skeleton className="h-10 w-40" />
        <div className="h-24 rounded-xl" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {Array.from({ length: 10 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
}
