import { useEffect, useState } from "react";
import api from "@/api/client/axios";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CreateLecturerRequest,
  UpdateLecturerRequest,
  ACADEMIC_DEGREE_LABELS,
  ACADEMIC_RANK_LABELS,
} from "@/types/admin/lecturer";
import { OrgUnitPagedResponse, OrgUnitResponse } from "@/types/admin/org-unit";
import OrgUnitParentSelect from "../../org-units/org-unit-parent-select";

type FormData = CreateLecturerRequest | UpdateLecturerRequest;

interface ProfessionalInfoSectionProps {
  formData: FormData;
  onChange: (data: FormData) => void;
}

export default function ProfessionalInfoSection({
  formData,
  onChange,
}: ProfessionalInfoSectionProps) {
  const [orgUnits, setOrgUnits] = useState<OrgUnitResponse[]>([]);

  useEffect(() => {
    // Load OrgUnits once for the select dropdown
    const loadOrgUnits = async () => {
      try {
        const res = await api.get<OrgUnitPagedResponse>(
          "/admin/org-units?size=100"
        );
        setOrgUnits(res.data.items);
      } catch (err) {
        // Ignore error
      }
    };
    loadOrgUnits();
  }, []);

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-muted-foreground">
        Thông tin giảng viên
      </h3>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="lecturerCode">
            Mã giảng viên <span className="text-destructive">*</span>
          </Label>
          <Input
            id="lecturerCode"
            placeholder="GV001"
            value={formData.lecturerCode || ""}
            onChange={(e) =>
              onChange({ ...formData, lecturerCode: e.target.value })
            }
          />
        </div>
        <div className="space-y-2">
          <Label>Đơn vị</Label>
          <OrgUnitParentSelect
            value={formData.orgUnitId ?? null}
            onChange={(val) =>
              onChange({ ...formData, orgUnitId: val || undefined })
            }
            options={orgUnits.map((p) => ({
              id: p.id,
              code: p.code,
              name: p.name,
            }))}
            placeholder="Chọn đơn vị"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Học vị</Label>
          <Select
            value={formData.academicDegree || "NONE"}
            onValueChange={(val) =>
              onChange({
                ...formData,
                academicDegree: val === "NONE" ? undefined : val,
              })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Chọn học vị" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="NONE">Không chọn</SelectItem>
              {Object.entries(ACADEMIC_DEGREE_LABELS).map(([key, label]) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Học hàm</Label>
          <Select
            value={formData.academicRank || "NONE"}
            onValueChange={(val) =>
              onChange({
                ...formData,
                academicRank: val === "NONE" ? undefined : val,
              })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Chọn học hàm" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="NONE">Không chọn</SelectItem>
              {Object.entries(ACADEMIC_RANK_LABELS).map(([key, label]) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="specialization">Chuyên ngành</Label>
        <Input
          id="specialization"
          placeholder="Công nghệ phần mềm"
          value={formData.specialization || ""}
          onChange={(e) =>
            onChange({ ...formData, specialization: e.target.value })
          }
        />
      </div>
    </div>
  );
}
