"use client";

import * as React from "react";
import * as SwitchPrimitive from "@radix-ui/react-switch";

import { cn } from "@/lib/utils";

function Switch({
  className,
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        // Base
        "peer inline-flex h-5 w-9 shrink-0 items-center rounded-full",
        // Border
        "border-2 border-transparent",
        // Background states
        "data-[state=unchecked]:bg-muted",
        "data-[state=checked]:bg-foreground",
        // Shadow
        "shadow-sm",
        // Transition
        "transition-all duration-200",
        // Focus
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        // Disabled
        "disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          // Base
          "pointer-events-none block size-4 rounded-full",
          // Background
          "bg-background",
          // Shadow for depth
          "shadow-sm",
          // Ring for definition
          "ring-0",
          // Transition
          "transition-transform duration-200 ease-out",
          // Position states
          "data-[state=unchecked]:translate-x-0",
          "data-[state=checked]:translate-x-4"
        )}
      />
    </SwitchPrimitive.Root>
  );
}

export { Switch };
