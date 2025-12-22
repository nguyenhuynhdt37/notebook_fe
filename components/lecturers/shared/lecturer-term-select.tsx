"use client";

import { useState, useEffect } from "react";
import { Check, ChevronsUpDown, Calendar } from "lucide-react";
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
import { LecturerTermPagedResponse } from "@/types/lecturer";

interface TermOption {
  id: string;
  code: string;
  name: string;
}

interface LecturerTermSelectProps {
  value: string | null;
  onChange: (value: string | null) => void;
  placeholder?: string;
}

export default function LecturerTermSelect({
  value,
  onChange,
  placeholder = "Chọn học kỳ",
}: LecturerTermSelectProps) {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<TermOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadTerms = async () => {
      setIsLoading(true);
      try {
        const res = await api.get<LecturerTermPagedResponse>(
          "/lecturer/terms?size=100"
        );
        if (res.data?.items) {
          setOptions(
            res.data.items.map((t) => ({
              id: t.id,
              code: t.code,
              name: t.name,
            }))
          );
        }
      } catch {
        // Silently fail - keep options empty
      } finally {
        setIsLoading(false);
      }
    };
    loadTerms();
  }, []);

  const selectedOption = options.find((o) => o.id === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between font-normal h-9"
          disabled={isLoading}
        >
          <div className="flex items-center gap-2">
            <Calendar className="size-4 text-muted-foreground" />
            {selectedOption ? (
              <span className="truncate">{selectedOption.name}</span>
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
          <CommandInput placeholder="Tìm học kỳ..." />
          <CommandList>
            <CommandEmpty>Không tìm thấy học kỳ nào.</CommandEmpty>
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
                <span className="text-muted-foreground">Tất cả học kỳ</span>
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
                      "mr-2 size-4",
                      value === option.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <div className="flex flex-col">
                    <span className="font-medium">{option.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {option.code}
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
