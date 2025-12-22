import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn(
        // Base
        "rounded-lg",
        // Background - subtle gradient
        "bg-gradient-to-r from-muted/60 via-muted to-muted/60",
        "bg-[length:200%_100%]",
        // Animation - smoother shimmer
        "animate-pulse",
        className
      )}
      {...props}
    />
  );
}

export { Skeleton };
