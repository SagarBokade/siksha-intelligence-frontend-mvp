import { cn } from "@/lib/utils";
import type { TableShimmerProps } from "../types";

/**
 * Premium shimmer skeleton loader that mimics a data table.
 * Uses a custom CSS linear-gradient animation for a polished sweep effect,
 * with staggered row delays for a cascading appearance.
 */
export default function TableShimmer({
  rows = 8,
  columns = 5,
}: TableShimmerProps) {
  return (
    <div className="w-full overflow-hidden rounded-lg border border-border">
      {/* ── Header row ────────────────────────────────────────────── */}
      <div className="flex gap-px bg-muted/60 p-3">
        {Array.from({ length: columns }).map((_, colIdx) => (
          <div
            key={`header-${colIdx}`}
            className={cn(
              "h-4 flex-1 rounded-md bg-muted-foreground/10 shimmer-bar",
              colIdx === 0 && "max-w-[140px]"
            )}
            style={{ animationDelay: `${colIdx * 0.08}s` }}
          />
        ))}
      </div>

      {/* ── Body rows ─────────────────────────────────────────────── */}
      {Array.from({ length: rows }).map((_, rowIdx) => (
        <div
          key={`row-${rowIdx}`}
          className={cn(
            "flex gap-px border-t border-border/50 p-3",
            rowIdx % 2 === 0 ? "bg-background" : "bg-muted/20"
          )}
        >
          {Array.from({ length: columns }).map((_, colIdx) => {
            // Vary the widths for a more realistic skeleton
            const widthVariant =
              colIdx === 0
                ? "max-w-[120px]"
                : colIdx === columns - 1
                  ? "max-w-[80px]"
                  : "";

            return (
              <div
                key={`cell-${rowIdx}-${colIdx}`}
                className={cn(
                  "h-3.5 flex-1 rounded-md bg-muted-foreground/8 shimmer-bar",
                  widthVariant
                )}
                style={{
                  animationDelay: `${rowIdx * 0.06 + colIdx * 0.04}s`,
                }}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}
