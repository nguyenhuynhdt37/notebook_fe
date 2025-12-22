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
import { TermPagedResponse } from "@/types/admin/term";

interface TermOption {
  id: string;
  code: string;
  name: string;
}

interface TermSelectProps {
  value: string | null;
  onChange: (value: string | null) => void;
  placeholder?: string;
}

export default function TermSelect({
  value,
  onChange,
  placeholder = "Chọn học kỳ",
}: TermSelectProps) {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<TermOption[]>([]);

  useEffect(() => {
    // API la /admin/term (so it), khong phai /admin/terms
    api.get<TermPagedResponse>("/admin/term?size=1000").then((res) => {
      setOptions(
        res.data.items.map((t) => ({ id: t.id, code: t.code, name: t.name }))
      );
    });
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
        >
          {selectedOption ? (
            <span className="truncate">{selectedOption.name}</span>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="start">
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
