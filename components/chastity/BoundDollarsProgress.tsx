"use client";

type Props = {
  boundDollars: number;
  rewardGoalBoundDollars: number | null | undefined;
  showLabel?: boolean;
  className?: string;
};

export function BoundDollarsProgress({
  boundDollars,
  rewardGoalBoundDollars,
  showLabel = true,
  className = "",
}: Props) {
  const goal = rewardGoalBoundDollars ?? 0;
  const hasGoal = goal > 0;
  const percent = hasGoal ? Math.min(100, Math.round((boundDollars / goal) * 100)) : 0;

  return (
    <div className={className}>
      {showLabel && (
        <p className="text-sm text-gray-400">
          <span className="font-medium text-accent">{boundDollars}</span>
          {hasGoal ? (
            <> / {goal} BD</>
          ) : (
            <> BD</>
          )}
        </p>
      )}
      {hasGoal && (
        <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-gray-700">
          <div
            className="h-full rounded-full bg-accent transition-all duration-300"
            style={{ width: `${percent}%` }}
            role="progressbar"
            aria-valuenow={boundDollars}
            aria-valuemin={0}
            aria-valuemax={goal}
          />
        </div>
      )}
    </div>
  );
}
