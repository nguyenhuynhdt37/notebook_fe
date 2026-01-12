"use client";

import { HiCheckCircle } from "react-icons/hi";

interface ExerciseTabsProps {
  exercises: Array<{ id: string; is_pass?: boolean }>;
  currentIndex: number;
  onSelectExercise: (index: number) => void;
}

export default function ExerciseTabs({
  exercises,
  currentIndex,
  onSelectExercise,
}: ExerciseTabsProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-2 shadow-sm">
      <div className="flex items-center gap-2 overflow-x-auto">
        {exercises.map((ex, index) => (
          <button
            key={ex.id}
            onClick={() => onSelectExercise(index)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all flex-shrink-0 min-w-[120px] ${
              index === currentIndex
                ? "bg-green-500 text-white shadow-md"
                : "bg-gray-50 text-gray-700 hover:bg-gray-100"
            }`}
          >
            <span className="text-xs font-semibold">Bài {index + 1}</span>
            {ex.is_pass && (
              <HiCheckCircle className="w-4 h-4 flex-shrink-0" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

