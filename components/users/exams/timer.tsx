"use client";

import { Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface TimerProps {
  timeRemaining: number;
}

export function Timer({ timeRemaining }: TimerProps) {
  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;
  
  const getTimerColor = () => {
    if (timeRemaining <= 300) return "bg-red-100 text-red-800"; // 5 minutes
    if (timeRemaining <= 900) return "bg-orange-100 text-orange-800"; // 15 minutes
    return "bg-blue-100 text-blue-800";
  };

  const formatTime = () => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${mins}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <Badge className={`${getTimerColor()} flex items-center gap-2 px-3 py-1 text-sm font-mono`}>
      <Clock className="h-4 w-4" />
      {formatTime()}
    </Badge>
  );
}