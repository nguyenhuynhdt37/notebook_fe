import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  [
    // Base
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium",
    // Transitions - smooth and premium
    "transition-all duration-200 ease-out",
    // Disabled state
    "disabled:pointer-events-none disabled:opacity-50",
    // SVG handling
    "[&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0",
    // Focus ring - subtle and elegant
    "outline-none focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    // Invalid state
    "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
    // Active press effect
    "active:scale-[0.98]",
  ].join(" "),
  {
    variants: {
      variant: {
        default: [
          "bg-foreground text-background",
          "hover:bg-foreground/90",
          "shadow-sm hover:shadow",
        ].join(" "),
        destructive: [
          "bg-destructive text-destructive-foreground",
          "hover:bg-destructive/90",
          "shadow-sm",
        ].join(" "),
        outline: [
          "border border-border/60 bg-background",
          "hover:bg-accent/50 hover:border-border",
          "shadow-xs",
        ].join(" "),
        secondary: ["bg-muted text-muted-foreground", "hover:bg-muted/80"].join(
          " "
        ),
        ghost: [
          "hover:bg-accent/50",
          "text-muted-foreground hover:text-foreground",
        ].join(" "),
        link: ["text-foreground underline-offset-4", "hover:underline"].join(
          " "
        ),
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 text-xs has-[>svg]:px-2.5",
        lg: "h-11 rounded-lg px-6 text-base has-[>svg]:px-5",
        icon: "size-9",
        "icon-sm": "size-8 rounded-md",
        "icon-lg": "size-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
