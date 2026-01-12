import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Code2 } from "lucide-react";
import CodeExerciseGenerator from "./code-exercise-generator";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  notebookId: string;
  selectedFileIds: string[];
  onSuccess: (aiSetId: string) => void;
}

export default function CodeExerciseGenerateModal({
  open,
  onOpenChange,
  notebookId,
  selectedFileIds,
  onSuccess,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-background overflow-hidden p-0 gap-0">
        <div className="p-6 pb-0">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Code2 className="size-5" />
              Tạo bài tập lập trình
            </DialogTitle>
            <DialogDescription>
              Tạo bài tập code tự động từ {selectedFileIds.length} tài liệu đã
              chọn
            </DialogDescription>
          </DialogHeader>
        </div>

        <CodeExerciseGenerator
          notebookId={notebookId}
          selectedFileIds={selectedFileIds}
          onGenerated={(aiSetId) => {
            onSuccess(aiSetId);
            onOpenChange(false);
          }}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
