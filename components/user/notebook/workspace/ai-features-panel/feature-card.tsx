"use client";

import { Button } from "@/components/ui/button";

interface FeatureCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
  actionLabel: string;
  onClick: () => void;
}

export default function FeatureCard({
  icon: Icon,
  title,
  description,
  actionLabel,
  onClick,
}: FeatureCardProps) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors group">
      <div className="p-2 rounded-lg bg-muted/50">
        <Icon className="size-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{title}</p>
        <p className="text-xs text-muted-foreground truncate">{description}</p>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={onClick}
        className="opacity-0 group-hover:opacity-100 transition-opacity text-xs"
      >
        {actionLabel}
      </Button>
    </div>
  );
}
