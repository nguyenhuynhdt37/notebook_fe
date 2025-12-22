"use client";

import { useState, useEffect } from "react";
import { Check, ChevronsUpDown, Building2 } from "lucide-react";
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
  LecturerMajorResponse,
  LecturerMajorPagedResponse,
} from "@/types/lecturer";

interface LecturerMajorSelectProps {
  value: string | null;
  onChange: (value: string | null) => void;
  placeholder?: string;
}

export default function LecturerMajorSelect({
  value,
  onChange,
  placeholder = "Chọn ngành học",
}: LecturerMajorSelectProps) {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<LecturerMajorResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadMajors = async () => {
      setIsLoading(true);
      try {
        const res = await api.get<LecturerMajorPagedResponse>(
          "/lecturer/majors?size=100"
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
    loadMajors();
  }, []);

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
            <Building2 className="size-4 text-muted-foreground shrink-0" />
            {selectedOption ? (
              <span className="truncate">
                {selectedOption.code} - {selectedOption.name}
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
      <PopoverContent className="w-[360px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Tìm ngành học..." />
          <CommandList>
            <CommandEmpty>Không tìm thấy ngành học nào.</CommandEmpty>
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
                <span className="text-muted-foreground">Tất cả ngành</span>
              </CommandItem>
              {options.map((option) => (
                <CommandItem
                  key={option.id}
                  value={`${option.code} ${option.name}`}
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
                    <span className="font-medium truncate">{option.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {option.code} • {option.subjectCount} môn học
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
