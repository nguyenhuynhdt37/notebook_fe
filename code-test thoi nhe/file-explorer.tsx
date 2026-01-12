"use client";

import { HiCode } from "react-icons/hi";

interface File {
  id: string;
  filename: string;
  is_main: boolean;
}

interface FileExplorerProps {
  files: File[];
  activeFileId: string | null;
  onSelectFile: (fileId: string) => void;
}

export default function FileExplorer({
  files,
  activeFileId,
  onSelectFile,
}: FileExplorerProps) {
  return (
    <div className="w-48 bg-gray-50 border-r border-gray-200 flex flex-col flex-shrink-0">
      <div className="px-3 py-2 bg-white border-b border-gray-200">
        <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
          Files
        </span>
      </div>
      <div className="flex-1 overflow-y-auto py-1">
        {files.map((file) => (
          <button
            key={file.id}
            onClick={() => onSelectFile(file.id)}
            className={`w-full flex items-center gap-2 px-3 py-2 text-left transition-colors ${
              activeFileId === file.id
                ? "bg-green-50 text-gray-900 border-r-2 border-r-green-500"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <HiCode
              className={`w-4 h-4 flex-shrink-0 ${
                activeFileId === file.id
                  ? "text-green-600"
                  : "text-gray-400"
              }`}
            />
            <span className="text-sm truncate flex-1">{file.filename}</span>
            {file.is_main && (
              <span className="text-xs bg-green-500 text-white px-1 py-0.5 rounded flex-shrink-0">
                M
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

