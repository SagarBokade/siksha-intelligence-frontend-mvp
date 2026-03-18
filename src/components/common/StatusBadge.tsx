import { cn } from "@/lib/utils";

type BadgeVariant = "active" | "inactive" | "pending" | "default";

const variants: Record<BadgeVariant, string> = {
  active:
    "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
  inactive:
    "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20",
  pending:
    "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
  default:
    "bg-muted text-muted-foreground border-border",
};

interface StatusBadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

export default function StatusBadge({
  variant = "default",
  children,
  className,
}: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize transition-colors",
        variants[variant],
        className
      )}
    >
      <span
        className={cn(
          "mr-1.5 h-1.5 w-1.5 rounded-full",
          variant === "active" && "bg-emerald-500",
          variant === "inactive" && "bg-red-500",
          variant === "pending" && "bg-amber-500",
          variant === "default" && "bg-muted-foreground"
        )}
      />
      {children}
    </span>
  );
}
