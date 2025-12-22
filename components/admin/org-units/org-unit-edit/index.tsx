"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import api from "@/api/client/axios";
import {
  OrgUnitRequest,
  OrgUnitPagedResponse,
  OrgUnitResponse,
  ORG_UNIT_TYPE_LABELS,
} from "@/types/admin/org-unit";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import OrgUnitParentSelect from "../org-unit-parent-select";

interface OrgUnitEditProps {
  orgUnitId: string;
}

export default function OrgUnitEdit({ orgUnitId }: OrgUnitEditProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [parentOptions, setParentOptions] = useState<OrgUnitResponse[]>([]);
  const [formData, setFormData] = useState<OrgUnitRequest>({
    code: "",
    name: "",
    type: undefined,
    parentId: null,
    isActive: true,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [orgUnitRes, parentsRes] = await Promise.all([
          api.get<OrgUnitResponse>(`/admin/org-units/${orgUnitId}`),
          api.get<OrgUnitPagedResponse>("/admin/org-units?size=100"),
        ]);

        const orgUnit = orgUnitRes.data;
        setFormData({
          code: orgUnit.code,
          name: orgUnit.name,
          type: orgUnit.type || undefined,
          parentId: orgUnit.parent?.id || null,
          isActive: orgUnit.isActive,
        });
        setParentOptions(
          parentsRes.data.items.filter((p) => p.id !== orgUnitId)
        );
      } catch (error) {
        toast.error("Không thể tải thông tin đơn vị");
        router.push("/admin/org-units");
      } finally {
        setIsFetching(false);
      }
    };

    fetchData();
  }, [orgUnitId, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.code.trim() || !formData.name.trim()) {
      toast.error("Vui lòng nhập mã và tên đơn vị");
      return;
    }

    setIsLoading(true);
    try {
      await api.put(`/admin/org-units/${orgUnitId}`, formData);
      toast.success("Cập nhật đơn vị thành công");
      router.push("/admin/org-units");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Không thể cập nhật đơn vị");
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="size-10 rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
        <Card className="max-w-2xl">
          <CardHeader>
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-48" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/org-units">
            <ArrowLeft className="size-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Chỉnh sửa đơn vị
          </h1>
          <p className="text-muted-foreground mt-1">
            Cập nhật thông tin đơn vị tổ chức
          </p>
        </div>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Thông tin đơn vị</CardTitle>
          <CardDescription>Chỉnh sửa thông tin đơn vị tổ chức</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="code">
                  Mã đơn vị <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="code"
                  placeholder="VD: VINH_IET, VINH_SOE..."
                  value={formData.code}
                  onChange={(e) =>
                    setFormData({ ...formData, code: e.target.value })
                  }
                />
                <p className="text-xs text-muted-foreground">
                  Format: VINH_MÃ (VD: VINH_IET, VINH_SOE, VINH_FIT)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">
                  Tên đơn vị <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="VD: Khoa Công nghệ Thông tin..."
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Loại đơn vị</Label>
                <Select
                  value={formData.type || "NONE"}
                  onValueChange={(val) =>
                    setFormData({
                      ...formData,
                      type: val === "NONE" ? undefined : val,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn loại" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NONE">Không chọn</SelectItem>
                    {Object.entries(ORG_UNIT_TYPE_LABELS).map(
                      ([key, label]) => (
                        <SelectItem key={key} value={key}>
                          {label}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Đơn vị cha</Label>
                <OrgUnitParentSelect
                  value={formData.parentId ?? null}
                  onChange={(val) =>
                    setFormData({ ...formData, parentId: val })
                  }
                  options={parentOptions.map((p) => ({
                    id: p.id,
                    code: p.code,
                    name: p.name,
                  }))}
                  excludeId={orgUnitId}
                />
              </div>
            </div>

            <div className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <Label htmlFor="isActive">Trạng thái hoạt động</Label>
                <p className="text-sm text-muted-foreground">
                  Đơn vị này có đang hoạt động không?
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
                <Link href="/admin/org-units">Hủy</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
