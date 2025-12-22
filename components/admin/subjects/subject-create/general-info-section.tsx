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
import { CreateSubjectRequest } from "@/types/admin/subject";

interface GeneralInfoSectionProps {
  formData: CreateSubjectRequest;
  onChange: (data: CreateSubjectRequest) => void;
}

export default function GeneralInfoSection({
  formData,
  onChange,
}: GeneralInfoSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Thông tin môn học</CardTitle>
        <CardDescription>Nhập thông tin cơ bản của môn học</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="code">
              Mã môn học <span className="text-destructive">*</span>
            </Label>
            <Input
              id="code"
              placeholder="VD: CS101, IT201..."
              value={formData.code}
              onChange={(e) => onChange({ ...formData, code: e.target.value })}
              maxLength={50}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="credit">Số tín chỉ</Label>
            <Input
              id="credit"
              type="number"
              min={0}
              placeholder="VD: 3"
              value={formData.credit ?? ""}
              onChange={(e) =>
                onChange({
                  ...formData,
                  credit: e.target.value ? parseInt(e.target.value) : undefined,
                })
              }
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="name">
            Tên môn học <span className="text-destructive">*</span>
          </Label>
          <Input
            id="name"
            placeholder="VD: Nhập môn lập trình..."
            value={formData.name}
            onChange={(e) => onChange({ ...formData, name: e.target.value })}
            maxLength={255}
          />
        </div>

        <div className="flex items-center justify-between rounded-lg border p-4">
          <div>
            <Label htmlFor="isActive">Trạng thái hoạt động</Label>
            <p className="text-sm text-muted-foreground">
              Môn học này có đang hoạt động không?
            </p>
          </div>
          <Switch
            id="isActive"
            checked={formData.isActive}
            onCheckedChange={(checked) =>
              onChange({ ...formData, isActive: checked })
            }
          />
        </div>
      </CardContent>
    </Card>
  );
}
