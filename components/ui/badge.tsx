import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  [
    // Base
    "inline-flex items-center justify-center rounded-md border px-2.5 py-0.5 text-xs font-medium",
    // Layout
    "w-fit whitespace-nowrap shrink-0 gap-1.5",
    // Icons
    "[&>svg]:size-3 [&>svg]:pointer-events-none",
    // Focus
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
    // Transition
    "transition-colors duration-150",
  ].join(" "),
  {
    variants: {
      variant: {
        default: [
          "border-transparent bg-foreground text-background",
          "[a&]:hover:bg-foreground/90",
        ].join(" "),
        secondary: [
          "border-transparent bg-muted/80 text-muted-foreground",
          "[a&]:hover:bg-muted",
        ].join(" "),
        destructive: [
          "border-transparent bg-destructive/10 text-destructive",
          "[a&]:hover:bg-destructive/20",
        ].join(" "),
        outline: [
          "border-border/50 text-muted-foreground bg-transparent",
          "[a&]:hover:bg-muted/50 [a&]:hover:text-foreground",
        ].join(" "),
        success: [
          "border-transparent bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
        ].join(" "),
        warning: [
          "border-transparent bg-amber-500/10 text-amber-600 dark:text-amber-400",
        ].join(" "),
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span";

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
