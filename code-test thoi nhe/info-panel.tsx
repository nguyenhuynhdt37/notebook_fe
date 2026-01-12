"use client";

import MarkdownRenderer from "@/components/shared/markdown-renderer";
import { ActiveLessonResponse } from "@/types/user/activeLesson";
import { CodeExercise, TestResult } from "@/types/user/learning";
import { useRef, useEffect } from "react";
import { HiCheckCircle, HiXCircle } from "react-icons/hi";
import QASection from "../qa";

interface InfoPanelProps {
  lesson: ActiveLessonResponse;
  infoTab: "info" | "qa";
  setInfoTab: (tab: "info" | "qa") => void;
  currentExercise: CodeExercise | undefined;
  testResult: TestResult | null;
  accessToken?: string;
}

export default function InfoPanel({
  lesson,
  infoTab,
  setInfoTab,
  currentExercise,
  testResult,
  accessToken,
}: InfoPanelProps) {
  const qaSectionRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (infoTab === "qa") {
      const timeout = setTimeout(() => {
        qaSectionRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 100);
      return () => clearTimeout(timeout);
    }
  }, [infoTab]);

  const passPercentage =
    testResult && testResult.total > 0
      ? Math.round((testResult.passed / testResult.total) * 100)
      : 0;

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm flex flex-col flex-1 min-h-0 overflow-hidden">
      <div className="border-b border-gray-200 bg-green-50 flex-shrink-0">
        <div className="flex">
          <button
            onClick={() => setInfoTab("info")}
            className={`flex-1 px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors ${
              infoTab === "info"
                ? "border-green-500 text-green-600 bg-white"
                : "border-transparent text-gray-600 hover:text-green-600"
            }`}
          >
            Thông tin
          </button>
          <button
            onClick={() => setInfoTab("qa")}
            className={`flex-1 px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors ${
              infoTab === "qa"
                ? "border-green-500 text-green-600 bg-white"
                : "border-transparent text-gray-600 hover:text-green-600"
            }`}
          >
            Hỏi đáp
          </button>
        </div>
      </div>

      <div className="p-4 flex-1 overflow-y-auto">
        {infoTab === "info" ? (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-1">
                Tiêu đề
              </h3>
              <p className="text-gray-900 font-bold">{lesson.title}</p>
            </div>

            {currentExercise && (
              <>
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">
                    Mô tả bài tập
                  </h3>
                  {currentExercise.description ? (
                    <div className="prose prose-sm max-w-none text-gray-700">
                      <MarkdownRenderer
                        content={currentExercise.description}
                        isHtml={false}
                        className="prose prose-sm max-w-none"
                      />
                    </div>
                  ) : (
                    <p className="text-gray-400 italic text-sm">
                      Chưa có mô tả
                    </p>
                  )}
                </div>

                <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600">Ngôn ngữ:</span>
                    <span className="font-medium text-gray-900">
                      {currentExercise.language.name} (
                      {currentExercise.language.version})
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600">Time Limit:</span>
                    <span className="font-medium text-yellow-600">
                      {(currentExercise.time_limit / 1000).toFixed(2)}s
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600">Memory Limit:</span>
                    <span className="font-medium text-yellow-600">
                      {(currentExercise.memory_limit / (1024 * 1024)).toFixed(
                        0
                      )}{" "}
                      MB
                    </span>
                  </div>
                </div>

                {testResult && (
                  <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-gray-700">
                        Kết quả
                      </span>
                      <span className="text-xs font-bold text-green-600">
                        {passPercentage}%
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs">
                      <div className="flex items-center gap-1">
                        <HiCheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-gray-700">{testResult.passed}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <HiXCircle className="w-4 h-4 text-red-600" />
                        <span className="text-gray-700">{testResult.failed}</span>
                      </div>
                      <span className="text-gray-500">/ {testResult.total}</span>
                    </div>
                    <div className="mt-2 bg-gray-200 rounded-full h-1.5">
                      <div
                        className="bg-green-500 h-1.5 rounded-full transition-all"
                        style={{ width: `${passPercentage}%` }}
                      />
                    </div>
                  </div>
                )}
              </>
            )}

            {lesson.resources && lesson.resources.length > 0 && (
              <div className="pt-4 border-t border-gray-200">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">
                  Tài nguyên
                </h3>
                <div className="space-y-1.5">
                  {lesson.resources.map((resource) => (
                    <a
                      key={resource.id}
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-2 rounded-lg border border-gray-200 hover:border-green-300 hover:bg-green-50 transition-colors text-sm"
                    >
                      <span className="font-medium text-gray-900 truncate pr-2">
                        {resource.title || resource.url}
                      </span>
                      <span className="text-green-600 font-medium text-xs flex-shrink-0">
                        Mở
                      </span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div
            ref={qaSectionRef}
            className="relative -m-4 h-full overflow-hidden rounded-lg border border-gray-200"
          >
            <QASection
              lessonId={lesson.id}
              accessToken={accessToken}
              containerClassName="w-full bg-white px-4 sm:px-6 lg:px-8 py-4"
            />
          </div>
        )}
      </div>
    </div>
  );
}

