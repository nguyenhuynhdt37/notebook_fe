import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import {
  CreateLecturerRequest,
  UpdateLecturerRequest,
} from "@/types/admin/lecturer";

type FormData = CreateLecturerRequest | UpdateLecturerRequest;

interface AccountInfoSectionProps {
  formData: FormData;
  onChange: (data: FormData) => void;
  isEditMode?: boolean;
}

export default function AccountInfoSection({
  formData,
  onChange,
  isEditMode = false,
}: AccountInfoSectionProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-muted-foreground">
        Thông tin tài khoản
      </h3>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="email">
            Email <span className="text-destructive">*</span>
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="example@email.com"
            value={formData.email}
            onChange={(e) => onChange({ ...formData, email: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">
            {isEditMode ? "Mật khẩu mới" : "Mật khẩu"}{" "}
            {!isEditMode && <span className="text-destructive">*</span>}
          </Label>
          <Input
            id="password"
            type="password"
            placeholder={
              isEditMode ? "Để trống nếu không đổi" : "Tối thiểu 6 ký tự"
            }
            value={formData.password}
            onChange={(e) =>
              onChange({ ...formData, password: e.target.value })
            }
          />
        </div>
      </div>
    </div>
  );
}
