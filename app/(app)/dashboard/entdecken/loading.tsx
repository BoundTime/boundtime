import { Container } from "@/components/Container";
import { Skeleton } from "@/components/ui/Skeleton";

function CardSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-white/[0.08] bg-black/30 shadow-[0_18px_40px_-35px_rgba(0,0,0,0.8)] backdrop-blur-sm">
      <Skeleton className="aspect-square w-full rounded-none rounded-t-xl" />
      <div className="space-y-2 border-t border-white/[0.06] p-3">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-3 w-2/3" />
      </div>
    </div>
  );
}

export default function EntdeckenLoading() {
  return (
    <Container className="py-10 md:py-12">
      <div className="mb-10 space-y-3">
        <Skeleton className="h-3 w-40" />
        <Skeleton className="h-8 w-48 max-w-full" />
        <Skeleton className="h-4 w-full max-w-xl" />
        <Skeleton className="h-4 w-full max-w-lg" />
        <Skeleton className="mt-4 h-px w-full max-w-md" />
      </div>

      <div className="relative mb-8 overflow-hidden rounded-[1.2rem] border border-white/[0.08] bg-black/25 p-5 backdrop-blur-md sm:p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-10 w-full rounded-xl" />
            </div>
          ))}
        </div>
        <div className="mt-5 flex flex-wrap gap-3 border-t border-white/[0.06] pt-4">
          <Skeleton className="h-11 w-28 rounded-xl" />
          <Skeleton className="h-11 w-32 rounded-xl" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 md:gap-5 lg:grid-cols-5 lg:gap-6">
        {Array.from({ length: 10 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    </Container>
  );
}
