import { cn } from "@/lib/utils";

interface TableSkeletonProps {
  rows?: number;
  columns?: number;
}

export default function TableSkeleton({
  rows = 5,
  columns = 5,
}: TableSkeletonProps) {
  return (
    <div className="w-full overflow-hidden rounded-lg border border-border">
      {/* Header */}
      <div className="flex gap-4 border-b border-border bg-muted/50 px-4 py-3">
        {Array.from({ length: columns }).map((_, i) => (
          <div key={i} className="h-4 flex-1 rounded shimmer-bar" />
        ))}
      </div>

      {/* Rows */}
      {Array.from({ length: rows }).map((_, row) => (
        <div
          key={row}
          className="flex items-center gap-4 border-b border-border/50 px-4 py-4 last:border-0"
          style={{ animationDelay: `${row * 75}ms` }}
        >
          {Array.from({ length: columns }).map((_, col) => (
            <div
              key={col}
              className={cn(
                "h-3.5 rounded shimmer-bar",
                col === 0 ? "w-10 flex-none" : "flex-1",
                col === columns - 1 && "max-w-[80px]"
              )}
              style={{ animationDelay: `${(row * columns + col) * 40}ms` }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
