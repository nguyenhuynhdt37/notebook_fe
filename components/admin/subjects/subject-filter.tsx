"use client";

import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { useDebouncedCallback } from "use-debounce";
import api from "@/api/client/axios";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

interface MajorOption {
  id: string;
  code: string;
  name: string;
}

interface SubjectFilterProps {
  q: string;
  isActive: string;
  majorId: string;
  onQChange: (q: string) => void;
  onIsActiveChange: (isActive: string) => void;
  onMajorIdChange: (majorId: string) => void;
}

export default function SubjectFilter({
  q,
  isActive,
  majorId,
  onQChange,
  onIsActiveChange,
  onMajorIdChange,
}: SubjectFilterProps) {
  const [inputValue, setInputValue] = useState(q);
  const [majors, setMajors] = useState<MajorOption[]>([]);
  const [majorSearch, setMajorSearch] = useState("");
  const [majorOpen, setMajorOpen] = useState(false);
  const [isSearchingMajor, setIsSearchingMajor] = useState(false);
  const [selectedMajor, setSelectedMajor] = useState<MajorOption | null>(null);

  useEffect(() => {
    loadMajors("");
  }, []);

  const loadMajors = async (search: string) => {
    setIsSearchingMajor(true);
    try {
      const params = new URLSearchParams({ size: "20", isActive: "true" });
      if (search) params.set("q", search);
      const response = await api.get<{ items: MajorOption[] }>(
        `/admin/major?${params}`
      );
      setMajors(response.data.items || []);
    } catch {
      // Ignore
    } finally {
      setIsSearchingMajor(false);
    }
  };

  const debouncedSearch = useDebouncedCallback((value: string) => {
    onQChange(value);
  }, 300);

  const debouncedMajorSearch = useDebouncedCallback((value: string) => {
    loadMajors(value);
  }, 300);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    debouncedSearch(value);
  };

  const handleMajorSearch = (value: string) => {
    setMajorSearch(value);
    debouncedMajorSearch(value);
  };

  const handleMajorSelect = (major: MajorOption | null) => {
    setSelectedMajor(major);
    onMajorIdChange(major ? major.id : "ALL");
    setMajorOpen(false);
    setMajorSearch("");
  };

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
        <Input
          placeholder="Tìm theo mã, tên..."
          className="w-56 pl-9 h-9"
          value={inputValue}
          onChange={handleInputChange}
        />
      </div>

      <Popover open={majorOpen} onOpenChange={setMajorOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={majorOpen}
            className="w-48 h-9 justify-between font-normal"
          >
            {selectedMajor ? (
              <span className="truncate">
                {selectedMajor.code} - {selectedMajor.name}
              </span>
            ) : (
              "Tất cả ngành"
            )}
            <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[280px] p-0" align="start">
          <Command shouldFilter={false}>
            <CommandInput
              placeholder="Tìm ngành học..."
              value={majorSearch}
              onValueChange={handleMajorSearch}
            />
            <CommandList>
              {isSearchingMajor ? (
                <div className="py-6 text-center text-sm text-muted-foreground">
                  Đang tìm...
                </div>
              ) : (
                <>
                  <CommandGroup>
                    <CommandItem
                      value="ALL"
                      onSelect={() => handleMajorSelect(null)}
                    >
                      Tất cả ngành
                    </CommandItem>
                    {majors.map((major) => (
                      <CommandItem
                        key={major.id}
                        value={major.id}
                        onSelect={() => handleMajorSelect(major)}
                      >
                        <span className="font-mono text-xs mr-2">
                          {major.code}
                        </span>
                        <span className="truncate">{major.name}</span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                  {majors.length === 0 && (
                    <CommandEmpty>Không tìm thấy</CommandEmpty>
                  )}
                </>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      <Select value={isActive || "ALL"} onValueChange={onIsActiveChange}>
        <SelectTrigger className="w-40 h-9">
          <SelectValue placeholder="Trạng thái" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">Tất cả</SelectItem>
          <SelectItem value="true">Hoạt động</SelectItem>
          <SelectItem value="false">Không hoạt động</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
