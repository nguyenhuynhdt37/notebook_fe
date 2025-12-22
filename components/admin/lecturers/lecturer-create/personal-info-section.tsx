import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  CreateLecturerRequest,
  UpdateLecturerRequest,
} from "@/types/admin/lecturer";

type FormData = CreateLecturerRequest | UpdateLecturerRequest;

interface PersonalInfoSectionProps {
  formData: FormData;
  onChange: (data: FormData) => void;
}

export default function PersonalInfoSection({
  formData,
  onChange,
}: PersonalInfoSectionProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-muted-foreground">
        Thông tin cá nhân
      </h3>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="fullName">
            Họ và tên <span className="text-destructive">*</span>
          </Label>
          <Input
            id="fullName"
            placeholder="Nguyễn Văn A"
            value={formData.fullName}
            onChange={(e) =>
              onChange({ ...formData, fullName: e.target.value })
            }
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Số điện thoại</Label>
          <Input
            id="phone"
            placeholder="0901234567"
            value={formData.phone || ""}
            onChange={(e) => onChange({ ...formData, phone: e.target.value })}
          />
        </div>
      </div>
    </div>
  );
}
