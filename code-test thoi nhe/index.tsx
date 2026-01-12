"use client";

import api from "@/lib/utils/fetcher/client/axios";
import { triggerCelebration } from "@/lib/utils/helpers/effects";
import { ActiveLessonResponse } from "@/types/user/activeLesson";
import { CodeExercise, TestResult } from "@/types/user/learning";
import confetti from "canvas-confetti";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { HiChatAlt2 } from "react-icons/hi";
import CodeEditorPanel from "./code-editor-panel";
import ExerciseTabs from "./exercise-tabs";
import InfoPanel from "./info-panel";
import TestResults from "./test-results";

const getMonacoLanguage = (languageName: string): string => {
  const mapping: Record<string, string> = {
    python: "python",
    javascript: "javascript",
    typescript: "typescript",
    java: "java",
    "c++": "cpp",
    cpp: "cpp",
    c: "c",
    go: "go",
    rust: "rust",
    php: "php",
    ruby: "ruby",
    kotlin: "kotlin",
    bash: "shell",
    fortran: "fortran",
    d: "d",
  };
  return mapping[languageName.toLowerCase()] || "plaintext";
};

interface CodeLessonProps {
  lesson: ActiveLessonResponse;
  onMarkCompleted?: (lessonId: string) => void;
  completedLessons?: Set<string>;
  accessToken?: string;
}

export default function CodeLesson({
  lesson,
  onMarkCompleted,
  completedLessons,
  accessToken,
}: CodeLessonProps) {
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [activeFileId, setActiveFileId] = useState<string | null>(null);
  const [userFiles, setUserFiles] = useState<
    Record<string, Record<string, string>>
  >({});
  const [initialFileContents, setInitialFileContents] = useState<
    Record<string, Record<string, string>>
  >({});
  const [savedFileContents, setSavedFileContents] = useState<
    Record<string, Record<string, string>>
  >({});
  const [isRunning, setIsRunning] = useState(false);
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [hasCompletedLesson, setHasCompletedLesson] = useState(false);
  const [infoTab, setInfoTab] = useState<"info" | "qa">("info");
  const prevFileIdRef = useRef<string | null>(null);
  const isSavingRef = useRef<boolean>(false);
  const hasCalledCompleteRef = useRef<boolean>(false);
  const [exercisePassStatus, setExercisePassStatus] = useState<
    Record<string, boolean>
  >({});

  const exercises: CodeExercise[] = lesson?.codes || [];

  useEffect(() => {
    if (exercises.length === 0) return;
    const initialStatus: Record<string, boolean> = {};
    exercises.forEach((ex) => {
      initialStatus[ex.id] = ex.is_pass ?? false;
    });
    setExercisePassStatus((prev) => {
      const hasChanges = exercises.some(
        (ex) => prev[ex.id] !== (ex.is_pass ?? false)
      );
      return hasChanges ? { ...prev, ...initialStatus } : prev;
    });
  }, [exercises]);

  useEffect(() => {
    hasCalledCompleteRef.current = false;
    setHasCompletedLesson(false);
  }, [lesson?.id]);

  const exercisesWithPassStatus = useMemo(() => {
    return exercises.map((ex) => ({
      ...ex,
      is_pass: exercisePassStatus[ex.id] ?? ex.is_pass ?? false,
    }));
  }, [exercises, exercisePassStatus]);

  const currentExercise = exercisesWithPassStatus[currentExerciseIndex];

  const activeFiles = useMemo(() => {
    if (!currentExercise) return [];
    return currentExercise.files || [];
  }, [currentExercise]);

  const currentUserFiles = useMemo(() => {
    if (!currentExercise) return [];
    const exerciseId = currentExercise.id;

    if (!userFiles[exerciseId]) {
      const initialFiles: Record<string, string> = {};
      activeFiles.forEach((file) => {
        initialFiles[file.id] = file.content;
      });
      setUserFiles((prev) => ({
        ...prev,
        [exerciseId]: initialFiles,
      }));
      setInitialFileContents((prev) => ({
        ...prev,
        [exerciseId]: { ...initialFiles },
      }));
      setSavedFileContents((prev) => ({
        ...prev,
        [exerciseId]: { ...initialFiles },
      }));
      return activeFiles.map((f) => ({
        ...f,
        content: f.content,
      }));
    }
    return activeFiles.map((f) => ({
      ...f,
      content: userFiles[exerciseId][f.id] ?? f.content,
    }));
  }, [currentExercise, activeFiles, userFiles]);

  useEffect(() => {
    if (currentExercise && currentUserFiles.length > 0) {
      const mainFile =
        currentUserFiles.find((f) => f.is_main) || currentUserFiles[0];
      if (mainFile) {
        setActiveFileId(mainFile.id);
      }
    }
  }, [currentExercise, currentUserFiles]);

  const playSuccessSound = useCallback(() => {
    if (typeof window === "undefined") return;
    try {
      const AudioCtx =
        window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const freqs = [523.25, 659.25, 783.99];
      freqs.forEach((f, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.setValueAtTime(f, ctx.currentTime);
        osc.type = "sine";
        gain.gain.setValueAtTime(0, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
        osc.start(ctx.currentTime + i * 0.1);
        osc.stop(ctx.currentTime + 0.5);
      });
    } catch {
      // Silent fail
    }
  }, []);

  useEffect(() => {
    if (exercisesWithPassStatus.length === 0) return;
    if (!onMarkCompleted || !lesson?.id) return;

    if (hasCalledCompleteRef.current) return;

    const allExercisesPassed = exercisesWithPassStatus.every(
      (ex) => ex.is_pass === true
    );

    if (!allExercisesPassed) return;

    const isCompletedFromAPI = lesson.is_completed || false;
    const isCompletedFromSet = completedLessons?.has(lesson.id) || false;
    const isCompleted = isCompletedFromAPI || isCompletedFromSet;

    if (!isCompleted && !hasCalledCompleteRef.current) {
      hasCalledCompleteRef.current = true;
      setHasCompletedLesson(true);

      if (typeof window !== "undefined") {
        playSuccessSound();
        triggerCelebration(3, 2);
        confetti({
          particleCount: 150,
          spread: 120,
          origin: { y: 0.6 },
          colors: ["#10b981", "#059669", "#34d399", "#6ee7b7", "#a7f3d0"],
          shapes: ["star", "circle"],
          scalar: 1.2,
        });
      }

      onMarkCompleted(lesson.id);
    }
  }, [
    exercisesWithPassStatus,
    hasCompletedLesson,
    onMarkCompleted,
    lesson?.id,
    lesson?.is_completed,
    completedLessons,
    playSuccessSound,
  ]);

  const language = useMemo(() => {
    if (!currentExercise?.language) return "plaintext";
    return getMonacoLanguage(currentExercise.language.name);
  }, [currentExercise]);

  const handleTestCode = async () => {
    if (!currentExercise || !currentUserFiles.length) {
      return;
    }

    setIsRunning(true);
    setTestResult(null);

    try {
      const payload = {
        language_id: currentExercise.language.id,
        files: currentUserFiles.map((f) => ({
          filename: f.filename,
          content: f.content || "",
          is_main: f.is_main,
        })),
      };

      const response = await api.post<TestResult>(
        `/learning/code/${currentExercise.id}/test`,
        payload
      );

      setTestResult(response.data);

      const passPercentage =
        response.data.total > 0
          ? Math.round((response.data.passed / response.data.total) * 100)
          : 0;
      if (passPercentage >= 85) {
        setExercisePassStatus((prev) => ({
          ...prev,
          [currentExercise.id]: true,
        }));
      }
    } catch (error: any) {
      console.error("Lỗi khi test code:", error);
    } finally {
      setIsRunning(false);
    }
  };

  const handleResetCode = () => {
    if (!currentExercise) return;
    const exerciseId = currentExercise.id;
    const resetFiles: Record<string, string> = {};
    const initialContents = initialFileContents[exerciseId] || {};
    activeFiles.forEach((file) => {
      resetFiles[file.id] = initialContents[file.id] ?? file.content;
    });
    setUserFiles((prev) => ({
      ...prev,
      [exerciseId]: resetFiles,
    }));
    setSavedFileContents((prev) => ({
      ...prev,
      [exerciseId]: { ...initialContents },
    }));
    setTestResult(null);
  };

  const updateFileContent = (fileId: string, content: string) => {
    if (!currentExercise) return;
    const exerciseId = currentExercise.id;
    setUserFiles((prev) => ({
      ...prev,
      [exerciseId]: {
        ...prev[exerciseId],
        [fileId]: content,
      },
    }));
  };

  const saveFile = useCallback(
    async (
      exerciseId: string,
      filename: string,
      content: string,
      isMain: boolean
    ) => {
      try {
        await api.post(`/learning/code/${exerciseId}/save`, {
          filename,
          content,
          is_main: isMain,
        });
        setExercisePassStatus((prev) => ({
          ...prev,
          [exerciseId]: false,
        }));
        setTestResult(null);
      } catch (error: any) {
        console.error("Lỗi khi lưu file:", error);
      }
    },
    []
  );

  const saveCurrentFileIfChanged = useCallback(() => {
    if (isSavingRef.current || !activeFileId || !currentExercise) return;

    const file = currentUserFiles.find((f) => f.id === activeFileId);
    if (!file) return;

    const exerciseId = currentExercise.id;
    const savedContent = savedFileContents[exerciseId]?.[activeFileId] ?? "";
    const currentContent = userFiles[exerciseId]?.[activeFileId] ?? "";

    if (currentContent !== savedContent && currentContent.trim() !== "") {
      isSavingRef.current = true;
      saveFile(exerciseId, file.filename, currentContent, file.is_main)
        .then(() => {
          setSavedFileContents((prev) => ({
            ...prev,
            [exerciseId]: {
              ...prev[exerciseId],
              [activeFileId]: currentContent,
            },
          }));
        })
        .finally(() => {
          isSavingRef.current = false;
        });
    }
  }, [
    activeFileId,
    currentExercise,
    currentUserFiles,
    userFiles,
    savedFileContents,
    saveFile,
  ]);

  useEffect(() => {
    if (prevFileIdRef.current && prevFileIdRef.current !== activeFileId) {
      const oldFileId = prevFileIdRef.current;
      const oldFile = currentUserFiles.find((f) => f.id === oldFileId);

      if (oldFile && currentExercise && !isSavingRef.current) {
        const exerciseId = currentExercise.id;
        const savedContent = savedFileContents[exerciseId]?.[oldFileId] ?? "";
        const currentContent = userFiles[exerciseId]?.[oldFileId] ?? "";

        if (currentContent !== savedContent && currentContent.trim() !== "") {
          isSavingRef.current = true;
          saveFile(
            exerciseId,
            oldFile.filename,
            currentContent,
            oldFile.is_main
          )
            .then(() => {
              setSavedFileContents((prev) => ({
                ...prev,
                [exerciseId]: {
                  ...prev[exerciseId],
                  [oldFileId]: currentContent,
                },
              }));
            })
            .finally(() => {
              isSavingRef.current = false;
            });
        }
      }
    }
    prevFileIdRef.current = activeFileId;
  }, [
    activeFileId,
    currentUserFiles,
    currentExercise,
    userFiles,
    savedFileContents,
    saveFile,
  ]);

  const handleSelectExercise = (index: number) => {
    saveCurrentFileIfChanged();
    setCurrentExerciseIndex(index);
    setTestResult(null);
  };

  if (exercisesWithPassStatus.length === 0) {
    return (
      <div className="w-full h-full bg-white rounded-xl shadow-sm p-8 flex items-center justify-center">
        <p className="text-gray-500">
          Không có bài tập code nào trong bài học này
        </p>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-gray-50 overflow-y-auto">
      <div className="w-full h-full p-4 md:p-6 flex flex-col gap-4 md:gap-6">
        <ExerciseTabs
          exercises={exercisesWithPassStatus}
          currentIndex={currentExerciseIndex}
          onSelectExercise={handleSelectExercise}
        />

        <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 min-h-0">
          {/* Cột trái: Thông tin */}
          <div className="lg:col-span-1 flex flex-col min-h-0">
            <InfoPanel
              lesson={lesson}
              infoTab={infoTab}
              setInfoTab={setInfoTab}
              currentExercise={currentExercise}
              testResult={testResult}
              accessToken={accessToken}
            />
          </div>

          {/* Cột phải: Code Editor */}
          <div className="lg:col-span-2 flex flex-col min-h-0">
            <CodeEditorPanel
              currentExercise={currentExercise}
              files={currentUserFiles}
              activeFileId={activeFileId}
              language={language}
              isRunning={isRunning}
              onSelectFile={setActiveFileId}
              onUpdateFileContent={updateFileContent}
              onTestCode={handleTestCode}
              onResetCode={handleResetCode}
              onSaveFile={saveCurrentFileIfChanged}
            />

            {/* Test Cases */}
            {currentExercise &&
              currentExercise.testcases &&
              currentExercise.testcases.length > 0 && (
                <TestResults
                  testcases={currentExercise.testcases}
                  testResult={testResult}
                />
              )}
          </div>
        </div>
      </div>

      <div className="fixed bottom-6 left-6 z-40">
        <button
          onClick={() => setInfoTab("qa")}
          disabled={infoTab === "qa"}
          className={`flex items-center gap-2 px-4 py-2 rounded-full shadow-lg transition-colors ${
            infoTab === "qa"
              ? "bg-gray-200 text-gray-500 cursor-default"
              : "bg-[#00bba7] text-white hover:bg-[#009b8a]"
          }`}
        >
          <HiChatAlt2 className="w-5 h-5" />
          <span>Hỏi đáp</span>
        </button>
      </div>
    </div>
  );
}

