"use client";

import { useEffect, useRef } from "react";
import Editor, { OnMount } from "@monaco-editor/react";
import { Loader2, Play, RefreshCw, Wand2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CodeFile } from "@/types/user/ai-task";

interface Props {
  files: CodeFile[];
  activeFile: CodeFile;
  language: string;
  isRunning: boolean;
  onSelectFile: (filename: string) => void;
  onUpdateContent: (content: string) => void;
  onRunCode: () => void;
  onGetSolution: () => void;
}

export default function CodeEditorPanel({
  files,
  activeFile,
  language,
  isRunning,
  onSelectFile,
  onUpdateContent,
  onRunCode,
  onGetSolution,
}: Props) {
  const editorRef = useRef<any>(null);

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
  };

  // Map backend language names to monaco language IDs
  const getMonacoLang = (lang: string) => {
    const map: Record<string, string> = {
      python: "python",
      javascript: "javascript",
      typescript: "typescript",
      java: "java",
      cpp: "cpp",
      c: "c",
    };
    return map[lang.toLowerCase()] || "plaintext";
  };

  return (
    <div className="flex flex-col h-full border rounded-xl overflow-hidden bg-background">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b bg-muted/30">
        <div className="flex items-center gap-2">
          <Select
            value={activeFile.filename}
            onValueChange={onSelectFile}
            disabled={files.length <= 1}
          >
            <SelectTrigger className="w-[180px] h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {files.map((f) => (
                <SelectItem key={f.filename} value={f.filename}>
                  {f.filename}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onGetSolution}
            className="h-8 gap-1.5"
            title="Xem gợi ý / đáp án"
          >
            <Wand2 className="size-3.5" />
            <span className="hidden sm:inline">Gợi ý</span>
          </Button>

          <Button
            size="sm"
            onClick={onRunCode}
            disabled={isRunning}
            className="h-8 gap-1.5 bg-green-600 hover:bg-green-700 text-white"
          >
            {isRunning ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Play className="size-3.5" />
            )}
            Run Code
          </Button>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 min-h-0 relative">
        <Editor
          height="100%"
          language={getMonacoLang(language)}
          value={activeFile.content}
          onChange={(value) => onUpdateContent(value || "")}
          onMount={handleEditorDidMount}
          theme="vs-dark"
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: "on",
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
            padding: { top: 16, bottom: 16 },
            fontFamily:
              "JetBrains Mono, Menlo, Monaco, 'Courier New', monospace",
          }}
        />
      </div>
    </div>
  );
}
