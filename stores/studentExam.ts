import { create } from "zustand";
import { persist } from "zustand/middleware";
import { StartExamResponse, StudentAnswer, ExamResult } from "@/types/student/exam";

interface StudentExamState {
  // Current exam data
  currentExam: StartExamResponse | null;
  answers: Record<string, StudentAnswer>;
  timeRemaining: number;
  isExamActive: boolean;
  
  // Tracking data
  tabSwitchCount: number;
  copyPasteCount: number;
  rightClickCount: number;
  
  // Actions
  setCurrentExam: (exam: StartExamResponse | null) => void;
  setAnswer: (questionId: string, answer: StudentAnswer) => void;
  setTimeRemaining: (seconds: number) => void;
  setExamActive: (active: boolean) => void;
  incrementTabSwitch: () => void;
  incrementCopyPaste: () => void;
  incrementRightClick: () => void;
  clearExamData: () => void;
}

export const useStudentExamStore = create<StudentExamState>()(
  persist(
    (set, get) => ({
      currentExam: null,
      answers: {},
      timeRemaining: 0,
      isExamActive: false,
      tabSwitchCount: 0,
      copyPasteCount: 0,
      rightClickCount: 0,

      setCurrentExam: (exam) => set({ currentExam: exam }),
      
      setAnswer: (questionId, answer) => set((state) => ({
        answers: {
          ...state.answers,
          [questionId]: answer
        }
      })),
      
      setTimeRemaining: (seconds) => set({ timeRemaining: seconds }),
      setExamActive: (active) => set({ isExamActive: active }),
      incrementTabSwitch: () => set((state) => ({ tabSwitchCount: state.tabSwitchCount + 1 })),
      incrementCopyPaste: () => set((state) => ({ copyPasteCount: state.copyPasteCount + 1 })),
      incrementRightClick: () => set((state) => ({ rightClickCount: state.rightClickCount + 1 })),
      
      clearExamData: () => set({
        currentExam: null,
        answers: {},
        timeRemaining: 0,
        isExamActive: false,
        tabSwitchCount: 0,
        copyPasteCount: 0,
        rightClickCount: 0,
      }),
    }),
    {
      name: "student-exam-storage",
      partialize: (state) => ({
        currentExam: state.currentExam,
        answers: state.answers,
        timeRemaining: state.timeRemaining,
        isExamActive: state.isExamActive,
        tabSwitchCount: state.tabSwitchCount,
        copyPasteCount: state.copyPasteCount,
        rightClickCount: state.rightClickCount,
      }),
    }
  )
);