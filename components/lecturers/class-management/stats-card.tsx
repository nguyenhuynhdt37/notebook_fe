"use client";

import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: "default" | "green" | "blue" | "yellow" | "red";
  className?: string;
}

const colorVariants = {
  default: {
    icon: "text-primary",
    bg: "bg-primary/10",
    value: "text-primary",
  },
  green: {
    icon: "text-green-600",
    bg: "bg-green-500/10",
    value: "text-green-600",
  },
  blue: {
    icon: "text-blue-600", 
    bg: "bg-blue-500/10",
    value: "text-blue-600",
  },
  yellow: {
    icon: "text-yellow-600",
    bg: "bg-yellow-500/10", 
    value: "text-yellow-600",
  },
  red: {
    icon: "text-red-600",
    bg: "bg-red-500/10",
    value: "text-red-600",
  },
};

export default function StatsCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  color = "default",
  className,
}: StatsCardProps) {
  const colors = colorVariants[color];

  return (
    <Card className={cn("transition-all duration-200 hover:shadow-md", className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <div className="flex items-baseline space-x-2">
              <p className={cn("text-3xl font-bold", colors.value)}>
                {typeof value === 'number' ? value.toLocaleString() : value}
              </p>
              {trend && (
                <span className={cn(
                  "text-xs font-medium px-2 py-1 rounded-full",
                  trend.isPositive 
                    ? "text-green-600 bg-green-100 dark:bg-green-900/20" 
                    : "text-red-600 bg-red-100 dark:bg-red-900/20"
                )}>
                  {trend.isPositive ? "+" : ""}{trend.value}%
                </span>
              )}
            </div>
            {description && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
          </div>
          <div className={cn("p-3 rounded-lg", colors.bg)}>
            <Icon className={cn("h-6 w-6", colors.icon)} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}