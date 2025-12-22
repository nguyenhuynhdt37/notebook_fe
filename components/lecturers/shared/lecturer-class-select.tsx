"use client";

import { useState, useEffect } from "react";
import { Check, ChevronsUpDown, Layers } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import api from "@/api/client/axios";
import {
  LecturerClassPagedResponse,
  LecturerClassResponse,
} from "@/types/lecturer";

interface LecturerClassSelectProps {
  assignmentId: string;
  value: string | null;
  onChange: (value: string | null) => void;
  placeholder?: string;
}

export default function LecturerClassSelect({
  assignmentId,
  value,
  onChange,
  placeholder = "Tất cả lớp",
}: LecturerClassSelectProps) {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<LecturerClassResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadClasses = async () => {
      if (!assignmentId) return;
      setIsLoading(true);
      try {
        const res = await api.get<LecturerClassPagedResponse>(
          `/lecturer/teaching-assignments/${assignmentId}/classes?size=100`
        );
        if (res.data?.items) {
          setOptions(res.data.items);
        }
      } catch {
        // Silently fail
      } finally {
        setIsLoading(false);
      }
    };
    loadClasses();
  }, [assignmentId]);

  const selectedOption = options.find((o) => o.id === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between font-normal h-10"
          disabled={isLoading}
        >
          <div className="flex items-center gap-2 min-w-0">
            <Layers className="size-4 text-muted-foreground shrink-0" />
            {selectedOption ? (
              <span className="truncate">
                {selectedOption.classCode} ({selectedOption.studentCount} SV)
              </span>
            ) : (
              <span className="text-muted-foreground">
                {isLoading ? "Đang tải..." : placeholder}
              </span>
            )}
          </div>
          <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[320px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Tìm lớp học phần..." />
          <CommandList>
            <CommandEmpty>Không tìm thấy lớp nào.</CommandEmpty>
            <CommandGroup>
              <CommandItem
                value="all"
                onSelect={() => {
                  onChange(null);
                  setOpen(false);
                }}
              >
                <Check
                  className={cn(
                    "mr-2 size-4",
                    value === null ? "opacity-100" : "opacity-0"
                  )}
                />
                <span className="text-muted-foreground">Tất cả lớp</span>
              </CommandItem>
              {options.map((option) => (
                <CommandItem
                  key={option.id}
                  value={option.classCode}
                  onSelect={() => {
                    onChange(option.id);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 size-4 shrink-0",
                      value === option.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <div className="flex flex-col min-w-0">
                    <span className="font-medium">{option.classCode}</span>
                    <span className="text-xs text-muted-foreground">
                      {option.room} • {option.studentCount} sinh viên
                    </span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
