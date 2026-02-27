import { Skeleton } from "@/components/ui/Skeleton";

export default function AppLoading() {
  return (
    <div className="py-16">
      <div className="mx-auto max-w-3xl space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    </div>
  );
}
