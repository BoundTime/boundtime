import { Skeleton } from "@/components/ui/Skeleton";

export default function NachrichtenLoading() {
  return (
    <div className="py-16">
      <div className="mx-auto max-w-4xl space-y-6">
        <Skeleton className="h-8 w-32" />
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
}
