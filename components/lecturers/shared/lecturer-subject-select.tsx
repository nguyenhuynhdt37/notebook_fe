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
import {
  LecturerSubjectPagedResponse,
  LecturerSubjectResponse,
} from "@/types/lecturer";

interface LecturerSubjectSelectProps {
  value: string | null;
  onChange: (value: string | null) => void;
  majorId?: string | null;
  placeholder?: string;
}

export default function LecturerSubjectSelect({
  value,
  onChange,
  majorId,
  placeholder = "Chọn môn học",
}: LecturerSubjectSelectProps) {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<LecturerSubjectResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadSubjects = async () => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams({ size: "200" });
        if (majorId) params.set("majorId", majorId);

        const res = await api.get<LecturerSubjectPagedResponse>(
          `/lecturer/subjects?${params}`
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
    loadSubjects();
  }, [majorId]);

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
            <BookOpen className="size-4 text-muted-foreground shrink-0" />
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
      <PopoverContent className="w-[400px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Tìm môn học..." />
          <CommandList>
            <CommandEmpty>Không tìm thấy môn học nào.</CommandEmpty>
            <CommandGroup>
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
                    <div className="flex items-center gap-2">
                      <code className="text-xs font-mono text-muted-foreground">
                        {option.code}
                      </code>
                      <span className="text-xs text-muted-foreground">
                        ({option.credit} tín chỉ)
                      </span>
                    </div>
                    <span className="font-medium truncate">{option.name}</span>
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
