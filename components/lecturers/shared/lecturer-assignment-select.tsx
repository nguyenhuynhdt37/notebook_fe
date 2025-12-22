"use client";

import { useState, useEffect } from "react";
import { Check, ChevronsUpDown, BookOpen } from "lucide-react";
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
import { LecturerAssignmentPagedResponse } from "@/types/lecturer";

interface AssignmentOption {
  id: string;
  subjectName: string;
  subjectCode: string;
  termName: string;
}

interface LecturerAssignmentSelectProps {
  value: string | null;
  onChange: (value: string | null) => void;
  termId?: string | null;
  placeholder?: string;
  disabled?: boolean;
}

export default function LecturerAssignmentSelect({
  value,
  onChange,
  termId,
  placeholder = "Chọn môn học",
  disabled = false,
}: LecturerAssignmentSelectProps) {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<AssignmentOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadAssignments = async () => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams({
          size: "100",
          ...(termId && { termId }),
        });

        const res = await api.get<LecturerAssignmentPagedResponse>(
          `/lecturer/teaching-assignments?${params}`
        );

        if (res.data?.items) {
          setOptions(
            res.data.items.map((a) => ({
              id: a.id,
              subjectName: a.subjectName,
              subjectCode: a.subjectCode,
              termName: a.termName,
            }))
          );
        }
      } catch {
        // Silently fail
        setOptions([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadAssignments();
  }, [termId]);

  // Reset value if options change and current value is not in new options
  // But be careful not to reset if it's just loading or if value is null
  useEffect(() => {
    if (value && options.length > 0 && !options.find((o) => o.id === value)) {
      onChange(null);
    }
  }, [options, value, onChange]);

  const selectedOption = options.find((o) => o.id === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between font-normal h-9"
          disabled={disabled || isLoading}
        >
          <div className="flex items-center gap-2 truncate">
            <BookOpen className="size-4 text-muted-foreground shrink-0" />
            {selectedOption ? (
              <span className="truncate">
                {selectedOption.subjectName} ({selectedOption.subjectCode}) -{" "}
                {selectedOption.termName}
              </span>
            ) : (
              <span className="text-muted-foreground truncate">
                {isLoading ? "Đang tải..." : placeholder}
              </span>
            )}
          </div>
          <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[320px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Tìm môn học..." />
          <CommandList>
            <CommandEmpty>Không tìm thấy môn học nào.</CommandEmpty>
            <CommandGroup>
              <CommandItem
                value="none"
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
                <span className="text-muted-foreground">Tất cả môn học</span>
              </CommandItem>
              {options.map((option) => (
                <CommandItem
                  key={option.id}
                  value={`${option.subjectCode} ${option.subjectName} ${option.termName} ${option.id}`}
                  onSelect={() => {
                    onChange(option.id);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 size-4",
                      value === option.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <div className="flex flex-col">
                    <span className="font-medium">{option.subjectName}</span>
                    <span className="text-xs text-muted-foreground">
                      {option.subjectCode} - {option.termName}
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
