import { Plus, GraduationCap } from "lucide-react";
import { MajorAssignment } from "@/types/admin/subject";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AssignmentItem } from "./assignment-item";

interface MajorOption {
  id: string;
  code: string;
  name: string;
}

interface AssignmentSectionProps {
  value: MajorAssignment[];
  onChange: (assignments: MajorAssignment[]) => void;
  // Initialize map for displaying selected major names { index: MajorOption }
  initialSelectedMajors?: Record<number, MajorOption>;
}

export default function AssignmentSection({
  value = [],
  onChange,
  initialSelectedMajors = {},
}: AssignmentSectionProps) {
  const addMajorAssignment = () => {
    onChange([
      ...value,
      { majorId: "", termNo: 1, isRequired: true, knowledgeBlock: "" },
    ]);
  };

  const removeMajorAssignment = (index: number) => {
    const newAssignments = [...value];
    newAssignments.splice(index, 1);
    onChange(newAssignments);
  };

  const updateMajorAssignment = (index: number, updated: MajorAssignment) => {
    const newAssignments = [...value];
    newAssignments[index] = updated;
    onChange(newAssignments);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
              <GraduationCap className="size-5 text-primary" />
            </div>
            <div>
              <CardTitle>Gán vào ngành học</CardTitle>
              <CardDescription>
                Thêm môn vào chương trình đào tạo
              </CardDescription>
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addMajorAssignment}
          >
            <Plus className="mr-2 size-4" />
            Thêm ngành
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {value.length > 0 ? (
          <div className="space-y-4">
            {value.map((assignment, index) => (
              <AssignmentItem
                key={index}
                index={index}
                assignment={assignment}
                onChange={(updated) => updateMajorAssignment(index, updated)}
                onRemove={() => removeMajorAssignment(index)}
                initialMajor={initialSelectedMajors[index]}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
            <GraduationCap className="size-10 mx-auto mb-3 opacity-50" />
            <p className="text-sm font-medium">Chưa gán vào ngành học nào</p>
            <p className="text-xs mt-1">
              Nhấn &quot;Thêm ngành&quot; để bắt đầu
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
