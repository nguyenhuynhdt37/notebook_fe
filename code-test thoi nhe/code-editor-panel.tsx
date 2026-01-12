"use client";

import CodeEditor from "@/components/shared/code-editor";
import { CodeExercise } from "@/types/user/learning";
import { HiPlay, HiRefresh } from "react-icons/hi";
import FileExplorer from "./file-explorer";

interface File {
  id: string;
  filename: string;
  content: string;
  is_main: boolean;
  role?: string;
}

interface CodeEditorPanelProps {
  currentExercise: CodeExercise | undefined;
  files: File[];
  activeFileId: string | null;
  language: string;
  isRunning: boolean;
  onSelectFile: (fileId: string) => void;
  onUpdateFileContent: (fileId: string, content: string) => void;
  onTestCode: () => void;
  onResetCode: () => void;
  onSaveFile: () => void;
}

export default function CodeEditorPanel({
  currentExercise,
  files,
  activeFileId,
  language,
  isRunning,
  onSelectFile,
  onUpdateFileContent,
  onTestCode,
  onResetCode,
  onSaveFile,
}: CodeEditorPanelProps) {
  const activeFile = files.find((f) => f.id === activeFileId);

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm flex flex-col flex-1 min-h-0 overflow-hidden">
      {/* Header */}
      <div className="border-b border-gray-200 bg-green-50 px-4 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-bold text-gray-900">
            {currentExercise?.title || "Luyện tập code"}
          </h2>
          {currentExercise?.language && (
            <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded font-medium">
              {currentExercise.language.name} {currentExercise.language.version}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onTestCode}
            disabled={
              isRunning || !files.length || currentExercise?.is_pass
            }
            className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            {isRunning ? (
              <>
                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Đang test...</span>
              </>
            ) : (
              <>
                <HiPlay className="w-4 h-4" />
                <span>Chạy</span>
              </>
            )}
          </button>
          <button
            onClick={onResetCode}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-500 hover:bg-gray-600 text-white rounded-lg text-sm font-medium transition-colors"
          >
            <HiRefresh className="w-4 h-4" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>
      </div>

      {/* Code Editor */}
      <div className="flex flex-1 min-h-0">
        <FileExplorer
          files={files}
          activeFileId={activeFileId}
          onSelectFile={onSelectFile}
        />

        {/* Editor */}
        <div className="flex-1 flex flex-col bg-white min-w-0">
          <div className="px-4 py-2 bg-gray-50 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
            <span className="text-xs text-gray-600 font-medium truncate">
              {activeFile?.filename || "No file selected"}
            </span>
            {activeFile?.role === "starter" && (
              <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded">
                Starter
              </span>
            )}
          </div>
          {activeFile && (
            <div className="flex-1 min-h-[300px]">
              <CodeEditor
                key={`code-${activeFile.id}-${language}`}
                height="100%"
                language={language}
                value={activeFile.content || ""}
                onChange={(value) => {
                  onUpdateFileContent(activeFile.id, value || "");
                }}
                onBlur={onSaveFile}
                options={{ minimap: { enabled: false } }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

