"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Send,
  Loader2,
  BookOpen,
  Search,
  Sparkles,
  FileText,
  Image as ImageIcon,
  X,
  Paperclip,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import api from "@/api/client/axios";
import {
  ChatMessage,
  ChatResponse,
  ChatConversation,
  FileResponse,
} from "@/types/user/chatbot";
import { LlmModel } from "@/types/user/chatbot";
import { mapChatResponseToChatMessage } from "./utils";

interface ChatInputProps {
  notebookId: string;
  selectedFileIds?: string[];
  selectedConversationId?: string | null;
}

export default function ChatInput({
  notebookId,
  selectedFileIds = [],
  selectedConversationId,
}: ChatInputProps) {
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<"document" | "web" | "both" | "model">(
    "document"
  );
  const [models, setModels] = useState<LlmModel[]>([]);
  const [selectedModelId, setSelectedModelId] = useState<string | undefined>();
  const [images, setImages] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const modelsLoadingRef = useRef(false);
  const lastNotebookIdRef = useRef<string | null>(null);

  // Derive askDocument and searchWeb from mode
  const askDocument = mode === "document" || mode === "both";
  const searchWeb = mode === "web" || mode === "both";

  // Load models
  useEffect(() => {
    // Prevent duplicate calls for the same notebook
    if (lastNotebookIdRef.current === notebookId && modelsLoadingRef.current) {
      return;
    }

    if (modelsLoadingRef.current) return;

    const load = async () => {
      try {
        modelsLoadingRef.current = true;
        lastNotebookIdRef.current = notebookId;
        const response = await api.get<LlmModel[]>(
          `/user/notebooks/${notebookId}/bot-chat/models`
        );
        setModels(response.data);
        if (response.data.length > 0) {
          const defaultModel =
            response.data.find((m) => m.isDefault) || response.data[0];
          setSelectedModelId(defaultModel.id);
        }
      } catch (error) {
        console.error("Error loading models:", error);
      } finally {
        modelsLoadingRef.current = false;
      }
    };
    load();
  }, [notebookId]);

  // Auto resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);

  // Cleanup image URLs
  useEffect(() => {
    return () => {
      images.forEach((image) =>
        URL.revokeObjectURL(URL.createObjectURL(image))
      );
    };
  }, [images]);

  const canSend = () => {
    if (isLoading) return false;
    // Message is required (API requirement)
    if (!input.trim()) return false;
    if (!selectedModelId) return false;

    // Mode "model" and "web" don't need files
    if (mode === "model" || mode === "web") return true;

    // RAG and HYBRID modes need at least 1 file or image
    if (mode === "document" || mode === "both") {
      if (selectedFileIds.length === 0 && images.length === 0) return false;
    }

    return true;
  };

  const canType = () => {
    if (isLoading) return false;
    if (!selectedModelId) return false;

    // Mode "model" and "web" always allow typing
    if (mode === "model" || mode === "web") return true;

    // RAG and HYBRID modes need at least 1 file or image
    if (mode === "document" || mode === "both") {
      if (selectedFileIds.length === 0 && images.length === 0) return false;
    }

    return true;
  };

  // Listen for set-input event
  useEffect(() => {
    const handleSetInput = (e: CustomEvent<string>) => {
      setInput(e.detail);
      // Auto focus
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    };

    window.addEventListener(
      "chatbot:set-input",
      handleSetInput as EventListener
    );

    return () => {
      window.removeEventListener(
        "chatbot:set-input",
        handleSetInput as EventListener
      );
    };
  }, []);

  // Create conversation if not exists
  const ensureConversation = async (): Promise<string> => {
    if (selectedConversationId) return selectedConversationId;

    try {
      const response = await api.post<ChatConversation>(
        `/user/notebooks/${notebookId}/bot-chat/conversations?title=New%20chat`,
        {}
      );

      // Dispatch event to update parent
      window.dispatchEvent(
        new CustomEvent("chatbot:conversation-created", {
          detail: response.data.id,
        })
      );

      return response.data.id;
    } catch (error) {
      console.error("Error creating conversation:", error);
      throw error;
    }
  };

  // Map UI mode to API mode
  const mapModeToApi = (): "RAG" | "WEB" | "HYBRID" | "LLM_ONLY" => {
    switch (mode) {
      case "document":
        return "RAG";
      case "web":
        return "WEB";
      case "both":
        return "HYBRID";
      case "model":
        return "LLM_ONLY";
      default:
        return "RAG";
    }
  };

  const handleSend = async () => {
    if (!canSend()) return;

    // Ensure conversation exists
    let conversationId = selectedConversationId;
    if (!conversationId) {
      try {
        conversationId = await ensureConversation();
      } catch (error) {
        console.error("Error creating conversation:", error);
        return;
      }
    }

    const currentInput = input.trim();
    const currentImages = [...images];
    const apiMode = mapModeToApi();

    // Convert File[] to FileResponse[] for user message display
    const fileResponses: FileResponse[] = currentImages.map((file, index) => ({
      id: `temp-${Date.now()}-${index}`,
      fileType: "image" as const,
      fileUrl: URL.createObjectURL(file),
      mimeType: file.type,
      fileName: file.name,
      ocrText: null,
      caption: null,
      metadata: null,
    }));

    // Create user message and dispatch immediately
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: currentInput,
      createdAt: new Date().toISOString(),
      files: fileResponses.length > 0 ? fileResponses : undefined,
    };

    window.dispatchEvent(
      new CustomEvent("chatbot:new-message", { detail: userMessage })
    );

    // Dispatch loading message for assistant
    const loadingMessageId = `loading-${Date.now()}`;
    const loadingMessage: ChatMessage = {
      id: loadingMessageId,
      role: "assistant",
      content: "",
      createdAt: new Date().toISOString(),
    };
    window.dispatchEvent(
      new CustomEvent("chatbot:loading-message", { detail: loadingMessage })
    );

    // Clear input and images
    setInput("");
    setImages([]);
    setIsLoading(true);
    if (textareaRef.current) textareaRef.current.style.height = "auto";

    try {
      // Create FormData
      const formData = new FormData();

      // Create request object
      const request: {
        message: string;
        modelId: string;
        mode: "RAG" | "WEB" | "HYBRID" | "LLM_ONLY" | "AUTO";
        ragFileIds?: string[];
      } = {
        message: currentInput || "",
        modelId: selectedModelId!,
        mode: apiMode,
      };

      // Add ragFileIds for RAG and HYBRID modes
      if (apiMode === "RAG" || apiMode === "HYBRID") {
        if (selectedFileIds.length > 0) {
          request.ragFileIds = selectedFileIds;
        }
      }

      // Add request JSON to FormData
      formData.append("request", JSON.stringify(request));

      // Add images if any
      if (currentImages.length > 0) {
        currentImages.forEach((image) => {
          formData.append("images", image);
        });
      }

      // Send request with FormData
      const response = await api.post<ChatResponse>(
        `/user/notebooks/${notebookId}/bot-chat/conversations/${conversationId}/chat`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      // Remove loading message first
      window.dispatchEvent(
        new CustomEvent("chatbot:remove-loading", { detail: loadingMessageId })
      );

      // Map response to ChatMessage
      const assistantMessage = mapChatResponseToChatMessage(response.data);

      // Dispatch assistant message
      window.dispatchEvent(
        new CustomEvent("chatbot:new-message", { detail: assistantMessage })
      );
    } catch (error: any) {
      console.error("Error sending message:", error);

      // Remove loading message
      window.dispatchEvent(
        new CustomEvent("chatbot:remove-loading", { detail: loadingMessageId })
      );

      // Handle specific errors
      if (error.response?.status === 401) {
        window.location.href = "/login";
        return;
      }

      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        role: "assistant",
        content:
          error.response?.data?.message ||
          "Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại.",
        createdAt: new Date().toISOString(),
      };

      window.dispatchEvent(
        new CustomEvent("chatbot:new-message", { detail: errorMessage })
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = useCallback((files: FileList | null) => {
    if (!files) return;

    // Validate file types: only images (jpg, jpeg, png, gif)
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif"];

    const validExtensions = [".jpg", ".jpeg", ".png", ".gif"];

    const validFiles = Array.from(files).filter((file) => {
      const isValidType = validTypes.includes(file.type);
      const isValidExtension = validExtensions.some((ext) =>
        file.name.toLowerCase().endsWith(ext)
      );
      return isValidType || isValidExtension;
    });

    if (validFiles.length !== files.length) {
      console.warn(
        "Một số file không hợp lệ. Chỉ chấp nhận ảnh: jpg, jpeg, png, gif"
      );
    }

    setImages((prev) => [...prev, ...validFiles]);
  }, []);

  const removeImage = useCallback((index: number) => {
    setImages((prev) => {
      const image = prev[index];
      if (image) URL.revokeObjectURL(URL.createObjectURL(image));
      return prev.filter((_, i) => i !== index);
    });
  }, []);

  // Handle paste image
  const handlePaste = useCallback(
    (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
      if (isLoading || !selectedModelId) return;

      // Mode "model" and "web" always allow pasting
      if (mode !== "model" && mode !== "web") {
        // RAG and HYBRID modes need at least 1 file or image
        if (mode === "document" || mode === "both") {
          if (selectedFileIds.length === 0 && images.length === 0) return;
        }
      }

      const items = e.clipboardData.items;
      const imageFiles: File[] = [];

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.type.indexOf("image") !== -1) {
          const file = item.getAsFile();
          if (file) {
            // Validate file type
            const validTypes = [
              "image/jpeg",
              "image/jpg",
              "image/png",
              "image/gif",
            ];
            const validExtensions = [".jpg", ".jpeg", ".png", ".gif"];
            const isValidType = validTypes.includes(file.type);
            const isValidExtension = validExtensions.some((ext) =>
              file.name.toLowerCase().endsWith(ext)
            );

            if (isValidType || isValidExtension || !file.name) {
              // If no name, create a default name
              if (!file.name) {
                const extension = file.type.split("/")[1] || "png";
                const blob = file.slice(0, file.size, file.type);
                const newFile = new File(
                  [blob],
                  `pasted-image-${Date.now()}.${extension}`,
                  {
                    type: file.type,
                  }
                );
                imageFiles.push(newFile);
              } else {
                imageFiles.push(file);
              }
            }
          }
        }
      }

      if (imageFiles.length > 0) {
        e.preventDefault();
        setImages((prev) => [...prev, ...imageFiles]);
      }
    },
    [isLoading, selectedModelId, mode, selectedFileIds.length, images.length]
  );

  return (
    <div className="border-t border-border/50 shrink-0">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
        {/* Options */}
        <div className="mb-3 flex items-center gap-2.5 flex-wrap">
          <Select
            value={mode}
            onValueChange={(value) => setMode(value as typeof mode)}
            disabled={isLoading}
          >
            <SelectTrigger className="h-8 text-xs border-border/50 min-w-[140px] transition-colors">
              <div className="flex items-center gap-1.5">
                {mode === "document" && (
                  <BookOpen className="size-3.5 text-muted-foreground" />
                )}
                {mode === "web" && (
                  <Search className="size-3.5 text-muted-foreground" />
                )}
                {mode === "both" && (
                  <div className="flex items-center gap-0.5">
                    <BookOpen className="size-3 text-muted-foreground" />
                    <Search className="size-3 text-muted-foreground" />
                  </div>
                )}
                {mode === "model" && (
                  <Sparkles className="size-3.5 text-muted-foreground" />
                )}
                <SelectValue>
                  {mode === "document" && "HỎI TÀI LIỆU"}
                  {mode === "web" && "TÌM KIẾM WEB"}
                  {mode === "both" && "KẾT HỢP"}
                  {mode === "model" && "CHỈ MODEL"}
                </SelectValue>
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="document" className="text-xs">
                <div className="flex items-center gap-2">
                  <BookOpen className="size-3.5" />
                  HỎI TÀI LIỆU
                </div>
              </SelectItem>
              <SelectItem value="web" className="text-xs">
                <div className="flex items-center gap-2">
                  <Search className="size-3.5" />
                  TÌM KIẾM WEB
                </div>
              </SelectItem>
              <SelectItem value="both" className="text-xs">
                <div className="flex items-center gap-2">
                  <BookOpen className="size-3" />
                  <Search className="size-3" />
                  KẾT HỢP
                </div>
              </SelectItem>
              <SelectItem value="model" className="text-xs">
                <div className="flex items-center gap-2">
                  <Sparkles className="size-3.5" />
                  CHỈ MODEL
                </div>
              </SelectItem>
            </SelectContent>
          </Select>

          {selectedFileIds.length > 0 && (
            <Badge
              variant="outline"
              className="text-xs font-medium gap-1.5 px-3 py-1 h-8 border-primary/30 bg-primary/5 text-primary"
            >
              <FileText className="size-3.5" />
              {selectedFileIds.length} tài liệu
            </Badge>
          )}

          <Select
            value={selectedModelId}
            onValueChange={setSelectedModelId}
            disabled={isLoading || models.length === 0}
          >
            <SelectTrigger className="h-8 text-xs border-border/50 min-w-[110px] transition-colors">
              <div className="flex items-center gap-1.5">
                <Sparkles className="size-3.5 text-muted-foreground" />
                <SelectValue placeholder="Model...">
                  {models.find((m) => m.id === selectedModelId)?.displayName ||
                    "Model..."}
                </SelectValue>
              </div>
            </SelectTrigger>
            <SelectContent>
              {models.map((model) => (
                <SelectItem key={model.id} value={model.id} className="text-xs">
                  {model.displayName} {model.isDefault && "(Mặc định)"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Image Previews */}
        {images.length > 0 && (
          <div className="mb-2.5 flex items-start gap-2 flex-wrap">
            {images.map((image, index) => (
              <div
                key={index}
                className="relative group rounded-md overflow-hidden border border-border/60 bg-muted/30"
              >
                <img
                  src={URL.createObjectURL(image)}
                  alt={`Preview ${index + 1}`}
                  className="w-16 h-16 object-cover"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-0.5 right-0.5 size-5 bg-background/90 hover:bg-background opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => removeImage(index)}
                >
                  <X className="size-3" />
                </Button>
                <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[10px] px-1 py-0.5 truncate">
                  {image.name}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Input Container */}
        <div
          className={cn(
            "relative rounded-2xl border-2 transition-all",
            isDragging
              ? "border-primary bg-primary/10"
              : "border-border/50 hover:border-primary/30"
          )}
          onDragOver={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (canType()) {
              setIsDragging(true);
            }
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsDragging(false);
          }}
          onDrop={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsDragging(false);
            if (canType() && e.dataTransfer.files.length > 0) {
              handleFileSelect(e.dataTransfer.files);
            }
          }}
        >
          {isDragging && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-primary/15 rounded-2xl backdrop-blur-sm">
              <div className="flex flex-col items-center gap-2 text-primary">
                <ImageIcon className="size-8 animate-pulse" />
                <p className="text-sm font-semibold">Thả ảnh vào đây</p>
              </div>
            </div>
          )}

          <div className="flex items-center gap-2 p-2.5">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => handleFileSelect(e.target.files)}
            />

            <Button
              variant="ghost"
              size="icon"
              className="shrink-0 size-9 rounded-xl hover:bg-muted/80 transition-all flex items-center justify-center"
              onClick={() => fileInputRef.current?.click()}
              disabled={!canType()}
              title="Tải lên ảnh"
            >
              <Paperclip className="size-4.5 text-muted-foreground" />
            </Button>

            <div className="flex-1 relative min-h-[48px] flex items-center">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onPaste={handlePaste}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder={
                  !canType()
                    ? (mode === "document" || mode === "both") &&
                      selectedFileIds.length === 0 &&
                      images.length === 0
                      ? "Chọn ít nhất 1 tài liệu hoặc ảnh..."
                      : !selectedModelId
                      ? "Chọn model..."
                      : !selectedConversationId
                      ? "Đang tạo conversation..."
                      : "Nhập câu hỏi..."
                    : images.length > 0
                    ? "Nhập câu hỏi về ảnh/tài liệu..."
                    : mode === "document"
                    ? "Hỏi về tài liệu..."
                    : mode === "web"
                    ? "Tìm kiếm trên web..."
                    : mode === "both"
                    ? "Hỏi tài liệu và tìm kiếm web..."
                    : "Nhập câu hỏi..."
                }
                disabled={!canType()}
                rows={1}
                className={cn(
                  "w-full min-h-[48px] max-h-[180px] resize-none",
                  "bg-transparent px-3 py-3.5 text-sm leading-relaxed",
                  "focus-visible:outline-none",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                  "placeholder:text-muted-foreground/60"
                )}
              />
            </div>

            <Button
              onClick={handleSend}
              disabled={!canSend()}
              size="icon"
              className={cn(
                "shrink-0 size-9 rounded-xl transition-all flex items-center justify-center",
                canSend()
                  ? "bg-primary hover:bg-primary/90 text-primary-foreground hover:scale-105"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {isLoading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Send className="size-4" />
              )}
            </Button>
          </div>
        </div>

        {images.length > 0 && (
          <p className="mt-2 text-xs text-muted-foreground/70 font-medium">
            Đã chọn {images.length} file{images.length > 1 ? "" : ""}
          </p>
        )}
      </div>
    </div>
  );
}
