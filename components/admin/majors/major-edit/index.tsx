"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, Search } from "lucide-react";
import { toast } from "sonner";
import { useDebouncedCallback } from "use-debounce";
import api from "@/api/client/axios";
import { MajorDetailResponse, UpdateMajorRequest } from "@/types/admin/major";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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

interface OrgUnit {
  id: string;
  code: string;
  name: string;
}

interface MajorEditProps {
  majorId: string;
}

export default function MajorEdit({ majorId }: MajorEditProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [orgUnits, setOrgUnits] = useState<OrgUnit[]>([]);
  const [orgUnitSearch, setOrgUnitSearch] = useState("");
  const [orgUnitOpen, setOrgUnitOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedOrgUnit, setSelectedOrgUnit] = useState<OrgUnit | null>(null);
  const [formData, setFormData] = useState<UpdateMajorRequest>({
    code: "",
    name: "",
    orgUnitId: undefined,
    isActive: true,
  });

  useEffect(() => {
    loadOrgUnits("");
    loadMajor();
  }, [majorId]);

  const loadOrgUnits = async (q: string) => {
    setIsSearching(true);
    try {
      const params = new URLSearchParams({ size: "20" });
      if (q) params.set("q", q);
      const response = await api.get<{ items: OrgUnit[] }>(
        `/admin/org-units?${params}`
      );
      setOrgUnits(response.data.items || []);
    } catch {
      // Ignore
    } finally {
      setIsSearching(false);
    }
  };

  const debouncedSearch = useDebouncedCallback((value: string) => {
    loadOrgUnits(value);
  }, 300);

  const handleOrgUnitSearch = (value: string) => {
    setOrgUnitSearch(value);
    debouncedSearch(value);
  };

  const loadMajor = async () => {
    try {
      const response = await api.get<MajorDetailResponse>(
        `/admin/major/${majorId}`
      );
      const major = response.data;
      setFormData({
        code: major.code,
        name: major.name,
        orgUnitId: major.orgUnit?.id,
        isActive: major.isActive,
      });
      if (major.orgUnit) {
        setSelectedOrgUnit({
          id: major.orgUnit.id,
          code: major.orgUnit.code,
          name: major.orgUnit.name,
        });
      }
    } catch {
      toast.error("Không thể tải thông tin ngành học");
      router.push("/admin/majors");
    } finally {
      setIsFetching(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.code?.trim() || !formData.name?.trim()) {
      toast.error("Vui lòng nhập mã và tên ngành học");
      return;
    }

    setIsLoading(true);
    try {
      await api.put(`/admin/major/${majorId}`, formData);
      toast.success("Cập nhật ngành học thành công");
      router.push("/admin/majors");
    } catch (error: unknown) {
      const err = error as {
        response?: { status?: number; data?: { message?: string } };
      };
      const status = err.response?.status;
      if (status === 404) {
        toast.error("Không tìm thấy ngành học hoặc đơn vị tổ chức");
      } else if (status === 409) {
        toast.error("Mã ngành học mới đã tồn tại");
      } else {
        toast.error(
          err.response?.data?.message || "Không thể cập nhật ngành học"
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 rounded bg-muted animate-pulse" />
          <div className="space-y-2">
            <div className="h-8 w-48 rounded bg-muted animate-pulse" />
            <div className="h-4 w-64 rounded bg-muted animate-pulse" />
          </div>
        </div>
        <div className="max-w-2xl h-80 rounded-lg bg-muted animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/majors">
            <ArrowLeft className="size-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Chỉnh sửa ngành học
          </h1>
          <p className="text-muted-foreground mt-1">
            Cập nhật thông tin ngành học
          </p>
        </div>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Thông tin ngành học</CardTitle>
          <CardDescription>Chỉnh sửa thông tin ngành học</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="code">
                  Mã ngành <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="code"
                  placeholder="VD: CNTT, KTPM..."
                  value={formData.code}
                  onChange={(e) =>
                    setFormData({ ...formData, code: e.target.value })
                  }
                  maxLength={50}
                />
              </div>

              <div className="space-y-2">
                <Label>Đơn vị tổ chức</Label>
                <Popover open={orgUnitOpen} onOpenChange={setOrgUnitOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={orgUnitOpen}
                      className="w-full justify-between font-normal"
                    >
                      {selectedOrgUnit
                        ? selectedOrgUnit.name
                        : "Chọn đơn vị..."}
                      <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[300px] p-0" align="start">
                    <Command shouldFilter={false}>
                      <CommandInput
                        placeholder="Tìm đơn vị..."
                        value={orgUnitSearch}
                        onValueChange={handleOrgUnitSearch}
                      />
                      <CommandList>
                        {isSearching ? (
                          <div className="py-6 text-center text-sm text-muted-foreground">
                            Đang tìm...
                          </div>
                        ) : orgUnits.length === 0 ? (
                          <CommandEmpty>Không tìm thấy</CommandEmpty>
                        ) : (
                          <CommandGroup>
                            {orgUnits.map((org) => (
                              <CommandItem
                                key={org.id}
                                value={org.id}
                                onSelect={() => {
                                  setSelectedOrgUnit(org);
                                  setFormData({
                                    ...formData,
                                    orgUnitId: org.id,
                                  });
                                  setOrgUnitOpen(false);
                                }}
                              >
                                <span className="font-mono text-xs mr-2">
                                  {org.code}
                                </span>
                                {org.name}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        )}
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">
                Tên ngành <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                placeholder="VD: Công nghệ thông tin..."
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                maxLength={255}
              />
            </div>

            <div className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <Label htmlFor="isActive">Trạng thái hoạt động</Label>
                <p className="text-sm text-muted-foreground">
                  Ngành học này có đang hoạt động không?
                </p>
              </div>
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isActive: checked })
                }
              />
            </div>

            <div className="flex items-center gap-4 pt-4">
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 size-4 animate-spin" />}
                Cập nhật
              </Button>
              <Button variant="outline" asChild>
                <Link href="/admin/majors">Hủy</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
