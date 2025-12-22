"use client";

import { useState } from "react";
import { Check, ChevronsUpDown, Search } from "lucide-react";
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

interface ParentOption {
  id: string;
  code: string;
  name: string;
}

interface OrgUnitParentSelectProps {
  value: string | null;
  onChange: (value: string | null) => void;
  options: ParentOption[];
  excludeId?: string;
  placeholder?: string;
}

export default function OrgUnitParentSelect({
  value,
  onChange,
  options,
  excludeId,
  placeholder = "Chọn đơn vị cha",
}: OrgUnitParentSelectProps) {
  const [open, setOpen] = useState(false);

  const filteredOptions = excludeId
    ? options.filter((o) => o.id !== excludeId)
    : options;

  const selectedOption = filteredOptions.find((o) => o.id === value);

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
          <CommandInput placeholder="Tìm kiếm theo tên hoặc mã..." />
          <CommandList>
            <CommandEmpty>Không tìm thấy đơn vị nào.</CommandEmpty>
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
                <span className="text-muted-foreground">Không có</span>
              </CommandItem>
              {filteredOptions.map((option) => (
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
