import { useState, useEffect } from "react";
import { Plus, Trash2, Search, GraduationCap } from "lucide-react";
import { useDebouncedCallback } from "use-debounce";
import api from "@/api/client/axios";
import { MajorAssignment } from "@/types/admin/subject";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
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

const KNOWLEDGE_BLOCKS = [
  "Đại cương",
  "Cơ sở ngành",
  "Chuyên ngành",
  "Tự chọn",
  "Thực tập",
  "Đồ án",
];

interface AssignmentItemProps {
  assignment: MajorAssignment;
  index: number;
  onChange: (assignment: MajorAssignment) => void;
  onRemove: () => void;
  initialMajor?: MajorOption;
}

export function AssignmentItem({
  assignment,
  index,
  onChange,
  onRemove,
  initialMajor,
}: AssignmentItemProps) {
  const [open, setOpen] = useState(false);
  const [majors, setMajors] = useState<MajorOption[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedMajor, setSelectedMajor] = useState<MajorOption | undefined>(
    initialMajor
  );

  useEffect(() => {
    if (open) {
      loadMajors("");
    }
  }, [open]);

  // Sync selectedMajor if initialMajor changes (important for Edit mode)
  useEffect(() => {
    if (initialMajor && !selectedMajor) {
      setSelectedMajor(initialMajor);
    }
  }, [initialMajor]);

  const loadMajors = async (q: string) => {
    setIsSearching(true);
    try {
      const params = new URLSearchParams({ size: "20", isActive: "true" });
      if (q) params.set("q", q);
      const response = await api.get<{ items: MajorOption[] }>(
        `/admin/major?${params}`
      );
      setMajors(response.data.items || []);
    } catch {
      // Ignore
    } finally {
      setIsSearching(false);
    }
  };

  const debouncedSearch = useDebouncedCallback((value: string) => {
    loadMajors(value);
  }, 300);

  const handleSelectMajor = (major: MajorOption) => {
    setSelectedMajor(major);
    onChange({ ...assignment, majorId: major.id });
    setOpen(false);
  };

  return (
    <div className="rounded-lg border p-4 space-y-4 bg-muted/20">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-2">
          <Label className="text-xs text-muted-foreground">Ngành học</Label>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="w-full justify-between font-normal h-9"
              >
                {selectedMajor ? (
                  <span className="truncate">
                    {selectedMajor.code} - {selectedMajor.name}
                  </span>
                ) : (
                  <span className="text-muted-foreground">Chọn ngành...</span>
                )}
                <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[320px] p-0" align="start">
              <Command shouldFilter={false}>
                <CommandInput
                  placeholder="Tìm ngành học..."
                  onValueChange={debouncedSearch}
                />
                <CommandList>
                  {isSearching ? (
                    <div className="py-6 text-center text-sm text-muted-foreground">
                      Đang tìm...
                    </div>
                  ) : majors.length === 0 ? (
                    <CommandEmpty>Không tìm thấy</CommandEmpty>
                  ) : (
                    <CommandGroup>
                      {majors.map((major) => (
                        <CommandItem
                          key={major.id}
                          value={major.id}
                          onSelect={() => handleSelectMajor(major)}
                        >
                          <span className="font-mono text-xs mr-2">
                            {major.code}
                          </span>
                          <span className="truncate">{major.name}</span>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  )}
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-9 w-9 text-muted-foreground hover:text-destructive shrink-0 mt-6"
          onClick={onRemove}
        >
          <Trash2 className="size-4" />
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Học kỳ</Label>
          <Select
            value={String(assignment.termNo || 1)}
            onValueChange={(val) =>
              onChange({ ...assignment, termNo: parseInt(val) })
            }
          >
            <SelectTrigger className="h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                <SelectItem key={num} value={String(num)}>
                  Học kỳ {num}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">
            Khối kiến thức
          </Label>
          <Select
            value={assignment.knowledgeBlock || "NONE"}
            onValueChange={(val) =>
              onChange({
                ...assignment,
                knowledgeBlock: val === "NONE" ? "" : val,
              })
            }
          >
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Chọn khối..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="NONE">-- Không chọn --</SelectItem>
              {KNOWLEDGE_BLOCKS.map((block) => (
                <SelectItem key={block} value={block}>
                  {block}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Loại môn</Label>
          <div className="flex items-center h-9 px-3 rounded-md border bg-background">
            <Checkbox
              id={`required-${index}`}
              checked={assignment.isRequired !== false}
              onCheckedChange={(checked) =>
                onChange({ ...assignment, isRequired: !!checked })
              }
            />
            <Label
              htmlFor={`required-${index}`}
              className="ml-2 text-sm font-normal cursor-pointer"
            >
              Môn bắt buộc
            </Label>
          </div>
        </div>
      </div>
    </div>
  );
}
