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
import OrgUnitParentSelect from "../org-unit-parent-select";

export default function OrgUnitCreate() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [parentOptions, setParentOptions] = useState<OrgUnitResponse[]>([]);
  const [formData, setFormData] = useState<OrgUnitRequest>({
    code: "",
    name: "",
    type: undefined,
    parentId: null,
    isActive: true,
  });

  useEffect(() => {
    api.get<OrgUnitPagedResponse>("/admin/org-units?size=100").then((res) => {
      setParentOptions(res.data.items);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.code.trim() || !formData.name.trim()) {
      toast.error("Vui lòng nhập mã và tên đơn vị");
      return;
    }

    setIsLoading(true);
    try {
      await api.post("/admin/org-units", formData);
      toast.success("Tạo đơn vị thành công");
      router.push("/admin/org-units");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Không thể tạo đơn vị");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/org-units">
            <ArrowLeft className="size-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Thêm đơn vị mới</h1>
          <p className="text-muted-foreground mt-1">
            Tạo mới đơn vị tổ chức trong hệ thống
          </p>
        </div>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Thông tin đơn vị</CardTitle>
          <CardDescription>Nhập thông tin đơn vị tổ chức mới</CardDescription>
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
                Tạo đơn vị
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
