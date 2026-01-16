import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-muted",
        className
      )}
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="space-y-3">
      <Skeleton className="aspect-[3/4] w-full rounded-lg" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
    </div>
  );
}

export function SkeletonText({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn(
            "h-4",
            i === lines - 1 ? "w-2/3" : "w-full"
          )}
        />
      ))}
    </div>
  );
}

export function SkeletonAvatar({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-20 h-20",
  };

  return <Skeleton className={cn("rounded-full", sizeClasses[size])} />;
}

// 水墨晕染加载效果
export function InkLoader({ className }: { className?: string }) {
  return (
    <div className={cn("relative", className)}>
      <div className="animate-ink-spread w-16 h-16 rounded-full bg-primary/30" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="animate-ink-spread animation-delay-150 w-10 h-10 rounded-full bg-primary/50" />
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="animate-ink-spread animation-delay-300 w-6 h-6 rounded-full bg-primary/70" />
      </div>
    </div>
  );
}
