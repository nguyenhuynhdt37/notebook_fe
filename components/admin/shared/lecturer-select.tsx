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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import api from "@/api/client/axios";
import { LecturerPagedResponse } from "@/types/admin/lecturer";

interface LecturerOption {
  id: string;
  code: string;
  name: string;
  email: string;
  avatarUrl: string | null;
}

interface LecturerSelectProps {
  value: string | null;
  onChange: (value: string | null) => void;
  placeholder?: string;
}

export default function LecturerSelect({
  value,
  onChange,
  placeholder = "Chọn giảng viên",
}: LecturerSelectProps) {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<LecturerOption[]>([]);

  useEffect(() => {
    // Tang size de lay duoc nhieu giang vien hon
    api.get<LecturerPagedResponse>("/admin/lecturer?size=1000").then((res) => {
      setOptions(
        res.data.items.map((l) => ({
          id: l.id,
          code: l.lecturerCode || "",
          name: l.fullName,
          email: l.email,
          avatarUrl: l.avatarUrl,
        }))
      );
    });
  }, []);

  const selectedOption = options.find((o) => o.id === value);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

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
            <div className="flex items-center gap-2 truncate">
              <Avatar className="h-6 w-6">
                <AvatarImage src={selectedOption.avatarUrl || undefined} />
                <AvatarFallback className="text-[10px]">
                  {getInitials(selectedOption.name)}
                </AvatarFallback>
              </Avatar>
              <span className="truncate">{selectedOption.name}</span>
            </div>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Tìm giảng viên..." />
          <CommandList>
            <CommandEmpty>Không tìm thấy giảng viên nào.</CommandEmpty>
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
                <span className="text-muted-foreground">Tất cả giảng viên</span>
              </CommandItem>
              {options.map((option) => (
                <CommandItem
                  key={option.id}
                  value={`${option.code} ${option.name} ${option.email}`}
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
                  <Avatar className="h-8 w-8 mr-2">
                    <AvatarImage src={option.avatarUrl || undefined} />
                    <AvatarFallback>{getInitials(option.name)}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="font-medium">{option.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {option.code && `${option.code} • `}
                      {option.email}
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
