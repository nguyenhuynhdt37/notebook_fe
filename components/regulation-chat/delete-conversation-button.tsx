"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import api from "@/api/client/axios";
import { RegulationConversation } from "@/types/user/regulation-chat";

interface DeleteConversationButtonProps {
  conversationId: string;
  conversationTitle: string;
  onDeleted: (nextConversation?: RegulationConversation) => void;
}

export default function DeleteConversationButton({
  conversationId,
  conversationTitle,
  onDeleted,
}: DeleteConversationButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [open, setOpen] = useState(false);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      const response = await api.delete<RegulationConversation>(
        `/user/regulation/chat/conversations/${conversationId}`
      );

      // 200 = có conversation tiếp theo (đã xóa active conversation)
      // 204 = không còn conversation nào hoặc xóa non-active
      if (response.status === 200 && response.data) {
        onDeleted(response.data);
      } else {
        onDeleted();
      }

      setOpen(false);
    } catch (error) {
      console.error("Error deleting conversation:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="size-7 hover:bg-destructive/10 hover:text-destructive"
          onClick={(e) => {
            e.stopPropagation();
            setOpen(true);
          }}
        >
          <Trash2 className="size-3.5" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Xóa cuộc trò chuyện?</AlertDialogTitle>
          <AlertDialogDescription>
            Bạn có chắc muốn xóa "{conversationTitle || "Cuộc trò chuyện"}"?
            <br />
            Hành động này không thể hoàn tác.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Hủy</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleDelete();
            }}
            disabled={isDeleting}
            className="bg-destructive hover:bg-destructive/90"
          >
            {isDeleting ? "Đang xóa..." : "Xóa"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
