"use client";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface FeatureCardProps {
  icon: React.ElementType;
  title: string;
  description?: string;
  onClick: () => void;
}

export default function FeatureCard({
  icon: Icon,
  title,
  description,
  onClick,
}: FeatureCardProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            onClick={onClick}
            className="flex items-center justify-center gap-1.5 h-9 px-2 w-full min-w-0 text-xs"
          >
            <Icon className="size-3.5 shrink-0" />
            <span className="truncate">{title}</span>
          </Button>
        </TooltipTrigger>
        {description && (
          <TooltipContent side="bottom" className="max-w-[200px]">
            <p className="text-xs">{description}</p>
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  );
}
