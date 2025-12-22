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
import { SubjectPagedResponse } from "@/types/admin/subject";
import { MajorDetailResponse } from "@/types/admin/major";

interface SubjectOption {
  id: string;
  code: string;
  name: string;
}

interface SubjectSelectProps {
  value: string | null;
  onChange: (value: string | null) => void;
  placeholder?: string;
  majorId?: string | null; // Added majorId prop
}

export default function SubjectSelect({
  value,
  onChange,
  placeholder = "Chọn môn học",
  majorId, // Destructure majorId
}: SubjectSelectProps) {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<SubjectOption[]>([]);

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        if (majorId) {
          // If majorId is selected, fetch subjects from that major strictly
          const res = await api.get<MajorDetailResponse>(
            `/admin/major/${majorId}`
          );
          if (res.data && res.data.subjects) {
            setOptions(
              res.data.subjects.map((s) => ({
                id: s.id,
                code: s.code,
                name: s.name,
              }))
            );
          } else {
            setOptions([]);
          }
        } else {
          // If no major selected, fetch all subjects
          const res = await api.get<SubjectPagedResponse>(
            "/admin/subject?size=1000"
          );
          setOptions(
            res.data.items.map((s) => ({
              id: s.id,
              code: s.code,
              name: s.name,
            }))
          );
        }
      } catch (error) {
        console.error("Failed to fetch subjects", error);
        setOptions([]);
      }
    };

    fetchSubjects();
  }, [majorId]); // Re-fetch when majorId changes

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
