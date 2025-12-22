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
import { OrgUnitPagedResponse } from "@/types/admin/org-unit";

interface OrgUnitOption {
  id: string;
  code: string;
  name: string;
}

interface OrgUnitSelectProps {
  value: string | null;
  onChange: (value: string | null) => void;
  placeholder?: string;
}

export default function OrgUnitSelect({
  value,
  onChange,
  placeholder = "Chọn đơn vị",
}: OrgUnitSelectProps) {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<OrgUnitOption[]>([]);

  useEffect(() => {
    api.get<OrgUnitPagedResponse>("/admin/org-units?size=100").then((res) => {
      setOptions(
        res.data.items.map((o) => ({ id: o.id, code: o.code, name: o.name }))
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
                <span className="text-muted-foreground">Tất cả đơn vị</span>
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
