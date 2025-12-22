"use client";

import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";

import { cn } from "@/lib/utils";

function Tabs({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      className={cn("flex flex-col gap-3", className)}
      {...props}
    />
  );
}

function TabsList({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn(
        // Base
        "inline-flex h-10 w-fit items-center justify-center gap-1",
        // Background
        "bg-muted/50 rounded-lg p-1",
        className
      )}
      {...props}
    />
  );
}

function TabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        // Base
        "inline-flex h-full flex-1 items-center justify-center gap-1.5",
        "rounded-md px-3 py-1.5 text-sm font-medium",
        // Colors
        "text-muted-foreground",
        // Transition
        "transition-all duration-200",
        // Hover
        "hover:text-foreground",
        // Active state
        "data-[state=active]:bg-background data-[state=active]:text-foreground",
        "data-[state=active]:shadow-sm",
        // Focus
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
        // Disabled
        "disabled:pointer-events-none disabled:opacity-50",
        // Icons
        "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    />
  );
}

function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn(
        "flex-1 outline-none",
        // Animation
        "data-[state=active]:animate-in data-[state=active]:fade-in-0 data-[state=active]:slide-in-from-bottom-1",
        "duration-200",
        className
      )}
      {...props}
    />
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent };
