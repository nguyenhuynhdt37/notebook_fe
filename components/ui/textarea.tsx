import * as React from "react";

import { cn } from "@/lib/utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        // Base
        "flex min-h-20 w-full rounded-lg border bg-background px-3 py-2.5 text-sm",
        // Border - subtle
        "border-border/50",
        // Placeholder
        "placeholder:text-muted-foreground/60",
        // Transition
        "transition-all duration-200",
        // Focus - elegant ring
        "focus:outline-none focus:border-ring focus:ring-2 focus:ring-ring/20",
        // Hover
        "hover:border-border",
        // Field sizing
        "field-sizing-content",
        // Selection
        "selection:bg-primary/20 selection:text-foreground",
        // Disabled
        "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-muted/50",
        // Dark mode
        "dark:bg-background/50",
        // Invalid state
        "aria-invalid:border-destructive aria-invalid:ring-destructive/20",
        className
      )}
      {...props}
    />
  );
}

export { Textarea };
