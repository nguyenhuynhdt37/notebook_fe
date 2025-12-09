"use client";

import { useState } from "react";
import { Loader2, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import api from "@/api/client/axios";
import { ChatConversation } from "@/types/user/chatbot";
import { formatConversationTime } from "./utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface HistoryItemProps {
  conversation: ChatConversation;
  isSelected: boolean;
  notebookId: string;
  onClick: () => void;
  onDelete: (conversationId: string) => void;
}

export default function HistoryItem({
  conversation,
  isSelected,
  notebookId,
  onClick,
  onDelete,
}: HistoryItemProps) {
  const [isSettingActive, setIsSettingActive] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleClick = async () => {
    if (isSettingActive || isSelected) {
      onClick();
      return;
    }

    try {
      setIsSettingActive(true);
      await api.post(
        `/user/notebooks/${notebookId}/bot-chat/conversations/${conversation.id}/active`
      );
      onClick();
    } catch (error: any) {
      console.error("Error setting active conversation:", error);
      // Still call onClick to select the conversation even if API fails
      onClick();
    } finally {
      setIsSettingActive(false);
    }
  };

  const handleDelete = async () => {
    if (isDeleting) return;

    try {
      setIsDeleting(true);
      await api.delete(
        `/user/notebooks/${notebookId}/bot-chat/conversations/${conversation.id}`
      );
      onDelete(conversation.id);
      setShowDeleteDialog(false);
    } catch (error: any) {
      console.error("Error deleting conversation:", error);
      // Show error message to user
      const errorMessage =
        error.response?.data?.message || "Không thể xóa cuộc trò chuyện";
      alert(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div
        onClick={handleClick}
        className={cn(
          "px-3.5 py-3 rounded-xl cursor-pointer transition-all group relative",
          isSelected
            ? "bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 shadow-sm"
            : "bg-transparent hover:bg-muted/40 border border-transparent hover:border-border/50",
          isSettingActive && "opacity-70 cursor-wait"
        )}
      >
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2.5">
            <h4
              className={cn(
                "text-sm line-clamp-1 flex-1 transition-colors",
                isSelected
                  ? "font-semibold text-foreground"
                  : "font-medium text-foreground/90 group-hover:text-foreground"
              )}
            >
              {conversation.title || "Cuộc trò chuyện"}
            </h4>
            <div className="flex items-center gap-1.5 shrink-0">
              {isSettingActive ? (
                <Loader2 className="size-3.5 animate-spin text-primary" />
              ) : isSelected ? (
                <div className="size-2 rounded-full bg-primary shadow-sm ring-2 ring-primary/20" />
              ) : null}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDeleteDialog(true);
                }}
                className={cn(
                  "size-6 rounded-md opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center",
                  "hover:bg-destructive/10 hover:text-destructive text-muted-foreground",
                  "focus:outline-none focus:ring-2 focus:ring-destructive/20"
                )}
                title="Xóa cuộc trò chuyện"
              >
                <Trash2 className="size-3.5" />
              </button>
            </div>
          </div>
          {conversation.firstMessage && (
            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
              {conversation.firstMessage}
            </p>
          )}
          <div className="flex items-center justify-between mt-1">
            <span className="text-xs text-muted-foreground/70 font-medium">
              {formatConversationTime(conversation.createdAt)}
            </span>
            {conversation.totalMessages > 0 && (
              <span className="text-xs text-muted-foreground/70 font-medium">
                {conversation.totalMessages} tin nhắn
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa cuộc trò chuyện?</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa cuộc trò chuyện "
              {conversation.title || "Cuộc trò chuyện"}"? Hành động này không
              thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Đang xóa..." : "Xóa"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
