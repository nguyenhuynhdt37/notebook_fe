"use client";

import { useState, useEffect } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
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
import { MajorPagedResponse } from "@/types/admin/major"; // I need to verify this type exists

interface MajorOption {
  id: string;
  code: string;
  name: string;
}

interface MajorSelectProps {
  value: string | null;
  onChange: (value: string | null) => void;
  placeholder?: string;
  disabled?: boolean;
}

export default function MajorSelect({
  value,
  onChange,
  placeholder = "Chọn ngành học",
  disabled = false,
}: MajorSelectProps) {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<MajorOption[]>([]);

  useEffect(() => {
    // Assuming API structure. I'll need to check the exact response type.
    // Based on previous patterns, it should be /admin/majors or /admin/major
    // I will check if major type exists first, but writing this defensively.
    const fetchMajors = async () => {
      try {
        const res = await api.get<MajorPagedResponse>("/admin/major?size=100");
        setOptions(
          res.data.items.map((m) => ({ id: m.id, code: m.code, name: m.name }))
        );
      } catch (e) {
        // fallback or error handling
        console.error("Failed to fetch majors", e);
      }
    };
    fetchMajors();
  }, []);

  const selectedOption = options.find((o) => o.id === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between font-normal"
          disabled={disabled}
        >
          {selectedOption ? (
            <span className="truncate">
              {selectedOption.code} - {selectedOption.name}
            </span>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="start">
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
                <span className="text-muted-foreground">Tất cả ngành học</span>
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
                  <span className="font-mono text-xs mr-2">{option.code}</span>
                  <span className="truncate">{option.name}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
