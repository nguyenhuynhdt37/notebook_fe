# AI Question Generation - Implementation Guide

## Overview
This guide shows how to implement the AI question generation feature according to the API specification in `AI_QUESTION_GENERATION_API_GUIDE.md`.

## What's Been Implemented

### 1. Updated Type Definitions (`types/lecturer/exam.ts`)
- Fixed `NotebookFile` interface to match API response
- Added `Notebook` interface for notebook selection
- Updated `GenerateQuestionsRequest` with all required fields
- Updated `Question` interface to match API response structure

### 2. API Client Service (`api/client/exam.ts`)
- Complete API client with all endpoints from the guide
- Proper error handling and TypeScript types
- Centralized API calls for better maintainability

### 3. Enhanced Generate Questions Modal (`components/lecturers/exams/generate-questions-modal.tsx`)
- Two-step process: Select notebook → Select files
- File filtering (only shows ready files with OCR and embedding done)
- Search functionality for files
- Comprehensive form validation
- Progress tracking during generation
- Better error handling with specific error messages

### 4. Updated Exam Preview (`components/lecturers/exams/exam-preview.tsx`)
- Fixed field names to match API response
- Better question display for different types
- Proper handling of MCQ options structure

### 5. Exam Status Manager (`components/lecturers/exams/exam-status-manager.tsx`)
- Status management (Draft → Published → Active)
- Confirmation dialogs for destructive actions
- Proper error handling

### 6. Create Exam Form (`components/lecturers/exams/create-exam-form.tsx`)
- Complete form for creating new exams
- Validation and error handling
- Integration with API

## Usage Examples

### 1. Creating a New Exam and Generating Questions

```typescript
// In your page component
import { CreateExamForm } from "@/components/lecturers/exams/create-exam-form";
import { ExamPreview } from "@/components/lecturers/exams/exam-preview";

export default function CreateExamPage({ params }: { params: { classId: string } }) {
  const [examId, setExamId] = useState<string | null>(null);

  if (examId) {
    return <ExamPreview examId={examId} />;
  }

  return (
    <CreateExamForm 
      classId={params.classId} 
      onSuccess={setExamId}
    />
  );
}
```

### 2. Using the API Client Directly

```typescript
import examApi from "@/api/client/exam";

// Create exam
const exam = await examApi.createExam({
  classId: "class-uuid",
  title: "Java Programming Test",
  description: "Basic Java concepts",
  startTime: "2024-12-30T09:00:00",
  endTime: "2024-12-30T12:00:00",
  durationMinutes: 120,
  passingScore: 60,
  shuffleQuestions: true,
  shuffleOptions: true,
  maxAttempts: 1,
});

// Generate questions
const examWithQuestions = await examApi.generateQuestions(exam.id, {
  notebookFileIds: ["file-uuid-1", "file-uuid-2"],
  numberOfQuestions: 20,
  questionTypes: "MCQ,TRUE_FALSE",
  difficultyLevel: "MEDIUM",
  mcqOptionsCount: 4,
  includeExplanation: true,
  language: "vi",
  easyPercentage: 30,
  mediumPercentage: 50,
  hardPercentage: 20,
});

// Publish exam
await examApi.publishExam(exam.id);
```

### 3. Error Handling Pattern

```typescript
try {
  const result = await examApi.generateQuestions(examId, requestData);
  toast.success(`Generated ${result.totalQuestions} questions successfully`);
} catch (error: any) {
  const errorMessage = error.response?.data?.message || "Failed to generate questions";
  
  // Handle specific error cases
  if (error.response?.status === 400) {
    // Validation errors
    const errors = error.response.data.errors || [];
    errors.forEach((err: any) => toast.error(err.message));
  } else if (error.response?.status === 404) {
    toast.error("Exam or files not found");
  } else {
    toast.error(errorMessage);
  }
}
```

## Key Features Implemented

### 1. Notebook and File Selection
- Dropdown to select notebook
- File list with search functionality
- Only shows files that are ready (status: "done", ocrDone: true, embeddingDone: true)
- File metadata display (size, upload date, uploader)

### 2. Question Configuration
- Number of questions (1-100)
- Question types (MCQ, TRUE_FALSE, ESSAY, CODING, FILL_BLANK)
- Difficulty levels (EASY, MEDIUM, HARD, MIXED)
- MCQ options count (2-6)
- Difficulty distribution for MIXED mode
- Include explanation option

### 3. Form Validation
- At least 1 file must be selected
- Question count must be 1-100
- At least 1 question type must be selected
- For MIXED difficulty, percentages must sum to 100%

### 4. Progress Tracking
- Visual progress bar during generation
- Step-by-step status messages
- Proper loading states

### 5. Error Handling
- Network errors
- Validation errors
- API errors with specific messages
- User-friendly error display

## Integration Checklist

- [x] Update type definitions to match API
- [x] Create API client service
- [x] Implement notebook/file selection
- [x] Add form validation
- [x] Add progress tracking
- [x] Implement error handling
- [x] Update question display
- [x] Add status management
- [x] Create example components

## Next Steps

1. **Authentication**: Ensure JWT tokens are properly handled in API requests
2. **Notebook API**: Implement the `/user/notebooks` endpoint if not available
3. **Testing**: Test with actual backend API
4. **UI Polish**: Add loading skeletons, better animations
5. **Accessibility**: Add proper ARIA labels and keyboard navigation

## Notes

- The implementation follows the exact API specification from the guide
- All field names and structures match the backend expectations
- Error handling covers all specified error codes (400, 401, 403, 404, 500)
- The UI is responsive and user-friendly
- TypeScript ensures type safety throughout the application

The frontend is now ready to integrate with the backend API as specified in the guide.