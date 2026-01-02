# AI Question Generation - Frontend Implementation

This directory contains the frontend implementation for AI-powered question generation according to the API specification in `AI_QUESTION_GENERATION_API_GUIDE.md`.

## Components Overview

### 1. `generate-questions-modal.tsx`
Main modal component for AI question generation workflow.

**Features:**
- Notebook selection from accessible notebooks
- File management with upload/delete capabilities
- Question generation configuration
- Progress tracking during AI processing
- Form validation and error handling

**Key Updates:**
- Updated to use new API endpoints (`/lecturer/notebooks/accessible`)
- Added support for new question types (CODING, FILL_BLANK, MATCHING)
- Integrated with FileManager component for better file handling
- Improved UI with better progress indicators

### 2. `file-manager.tsx`
Reusable component for managing notebook files.

**Features:**
- Simple file upload (recommended approach)
- File listing with status indicators
- File selection for question generation
- File deletion with confirmation
- Real-time file status updates

**Usage:**
```tsx
<FileManager
  notebookId={selectedNotebook}
  files={files}
  selectedFiles={selectedFiles}
  onFilesChange={setFiles}
  onSelectionChange={setSelectedFiles}
  allowUpload={true}
  allowDelete={true}
  allowSelection={true}
/>
```

### 3. `exam-preview.tsx`
Enhanced exam preview component with support for new question types.

**New Features:**
- Support for CODING, FILL_BLANK, MATCHING question types
- Better question display with type-specific rendering
- Improved file information display
- Enhanced status management

### 4. `ai-question-demo.tsx`
Complete demo component showing the entire AI question generation workflow.

**Demonstrates:**
- Step-by-step workflow from notebook selection to exam publishing
- All API endpoints integration
- Error handling and user feedback
- Best practices for using the new APIs

## API Integration

### Updated API Client (`api/client/exam.ts`)

**New Methods:**
- `getAccessibleNotebooks()` - Get notebooks lecturer can access
- `uploadFilesSimple()` - Simple file upload (recommended)
- `uploadFilesAdvanced()` - Advanced upload with custom config
- `deleteFile()` - Delete file from notebook
- `getAllAccessibleFiles()` - Get all accessible files across notebooks
- `getFileDetail()` - Get detailed file information

**Updated Endpoints:**
- Changed from `/user/notebooks` to `/lecturer/notebooks/accessible`
- Added file management endpoints
- Enhanced error handling

### Updated Types (`types/lecturer/exam.ts`)

**New Types:**
- Added CODING, FILL_BLANK, MATCHING to QuestionType
- Enhanced NotebookFile with new fields (chunksCount, contentPreview)
- Updated Notebook structure to match API response
- Added UploadFilesRequest and FileDetailResponse types

## Usage Examples

### Basic Question Generation
```tsx
// 1. Load accessible notebooks
const notebooks = await examApi.getAccessibleNotebooks();

// 2. Select notebook and load files
const files = await examApi.getNotebookFiles(notebookId);

// 3. Upload additional files if needed
const uploadedFiles = await examApi.uploadFilesSimple(notebookId, newFiles);

// 4. Create exam
const exam = await examApi.createExam(examData);

// 5. Generate questions
const examWithQuestions = await examApi.generateQuestions(exam.id, {
  notebookFileIds: selectedFileIds,
  numberOfQuestions: 20,
  questionTypes: "MCQ,TRUE_FALSE",
  difficultyLevel: "MEDIUM",
  includeExplanation: true,
  language: "vi"
});

// 6. Publish exam
await examApi.publishExam(exam.id);
```

### File Upload with Configuration
```tsx
// Simple upload (recommended)
const uploadedFiles = await examApi.uploadFilesSimple(notebookId, files);

// Advanced upload (for developers)
const uploadedFiles = await examApi.uploadFilesAdvanced(notebookId, files, {
  chunkSize: 3500,
  chunkOverlap: 300
});
```

### Question Generation Configuration
```tsx
const generateRequest: GenerateQuestionsRequest = {
  notebookFileIds: ["file-1", "file-2"],
  numberOfQuestions: 20,
  questionTypes: "MCQ,TRUE_FALSE,CODING", // Multiple types
  difficultyLevel: "MIXED", // Mixed difficulty
  mcqOptionsCount: 4,
  includeExplanation: true,
  language: "vi",
  // For mixed difficulty
  easyPercentage: 30,
  mediumPercentage: 50,
  hardPercentage: 20
};
```

## Key Features Implemented

### ✅ API Integration
- [x] All new API endpoints integrated
- [x] Proper error handling and validation
- [x] JWT authentication support
- [x] File upload with progress tracking

### ✅ UI Components
- [x] Modern, responsive design
- [x] File management interface
- [x] Progress indicators for AI processing
- [x] Form validation and user feedback
- [x] Support for all question types

### ✅ File Management
- [x] Simple upload (recommended)
- [x] Advanced upload with configuration
- [x] File deletion and management
- [x] Status indicators (OCR, embedding done)
- [x] Content preview

### ✅ Question Generation
- [x] Multiple question types support
- [x] Difficulty level configuration
- [x] Mixed difficulty with percentage distribution
- [x] Explanation generation
- [x] Language selection (Vietnamese/English)

### ✅ Error Handling
- [x] Comprehensive error messages
- [x] Form validation
- [x] Network error handling
- [x] User-friendly feedback

## Best Practices

### 1. File Upload
- **Use Simple Upload**: For most cases, use `uploadFilesSimple()` as recommended
- **Advanced Upload**: Only for developers who need custom chunk configuration
- **File Validation**: Check file types and sizes before upload
- **Progress Feedback**: Show upload progress to users

### 2. Question Generation
- **File Selection**: Only use files with `status: "done"` and `ocrDone: true`
- **Validation**: Validate all form inputs before submission
- **Progress Tracking**: Show AI processing progress to users
- **Error Recovery**: Handle AI generation failures gracefully

### 3. Performance
- **Lazy Loading**: Load files only when notebook is selected
- **Debounced Search**: Implement search debouncing for file filtering
- **Caching**: Cache notebook and file data when appropriate
- **Pagination**: Consider pagination for large file lists

### 4. User Experience
- **Clear Feedback**: Provide clear success/error messages
- **Loading States**: Show loading indicators during API calls
- **Form Validation**: Validate inputs before submission
- **Responsive Design**: Ensure mobile compatibility

## Configuration

### Environment Variables
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8386
```

### API Base URL
The backend API is expected to run on `http://localhost:8386` as specified in the API guide.

## Testing

### Manual Testing Checklist
- [ ] Load accessible notebooks
- [ ] Select notebook and view files
- [ ] Upload new files (simple method)
- [ ] Delete files
- [ ] Select files for question generation
- [ ] Configure question generation parameters
- [ ] Generate questions with AI
- [ ] Preview generated exam
- [ ] Publish exam

### Error Scenarios
- [ ] Network errors during API calls
- [ ] Invalid file uploads
- [ ] AI generation failures
- [ ] Form validation errors
- [ ] Authentication failures

## Future Enhancements

### Planned Features
- [ ] Advanced upload configuration UI
- [ ] File preview modal
- [ ] Batch file operations
- [ ] Question editing after generation
- [ ] Export/import functionality
- [ ] Analytics and reporting

### Performance Improvements
- [ ] Virtual scrolling for large file lists
- [ ] Image optimization for file previews
- [ ] Background file processing status
- [ ] Offline support for drafts

## Troubleshooting

### Common Issues

**1. Files not showing as "ready"**
- Check if OCR and embedding processing is complete
- Verify file format is supported
- Check backend processing logs

**2. AI generation fails**
- Verify selected files are valid
- Check question generation parameters
- Ensure backend AI service is running

**3. Upload failures**
- Check file size limits
- Verify file format support
- Check network connectivity

**4. Authentication errors**
- Verify JWT token is valid
- Check token expiration
- Ensure proper authorization headers

### Debug Mode
Enable debug logging by setting:
```javascript
localStorage.setItem('debug', 'exam-api');
```

This implementation provides a complete, production-ready solution for AI-powered question generation with excellent user experience and robust error handling.