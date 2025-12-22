# Implementation Plan: Lecturer Class Detail Enhancement

## Overview

This plan refactors the monolithic class detail view into a well-organized folder structure with focused components, displaying all API data in a premium interface. Tasks are organized to build incrementally, with testing integrated throughout.

## Tasks

- [x] 1. Update type definitions and create folder structure
  - Update `types/lecturer/reference.ts` to add missing fields to LecturerClassResponse
  - Create `components/lecturers/classes/detail/` folder
  - _Requirements: 1.1, 1.5, 2.1-2.5_

- [ ] 2. Create shared components and utilities
  - [x] 2.1 Create ClassDetailSkeleton component
    - Implement loading skeleton matching final layout
    - Use shadcn/ui Skeleton components
    - _Requirements: 5.1, 5.4_

  - [x] 2.2 Create ClassHeader component
    - Implement back button with router.back()
    - Add page title with proper typography
    - _Requirements: 7.3, 8.1_

- [ ] 3. Create information display components
  - [x] 3.1 Create ClassInfoCard component
    - Display classCode, subjectCode, subjectName, termName
    - Show isActive status badge
    - Display studentCount
    - Use generous spacing and premium styling
    - _Requirements: 2.1, 3.2, 3.3, 8.3_

  - [x] 3.2 Create ClassScheduleGrid component
    - Display dayOfWeek, periods, room, studentCount in grid
    - Use icon + label + value pattern
    - Implement responsive grid (2 cols mobile, 4 cols desktop)
    - _Requirements: 2.2, 3.6, 4.2_

  - [x] 3.3 Create ClassDatesCard component
    - Display startDate and endDate with formatting
    - Show note field if present
    - Handle null values gracefully
    - _Requirements: 2.3_

- [ ] 4. Create content and integration components
  - [x] 4.1 Create ClassContentStats component
    - Display fileCount, quizCount, flashcardCount, summaryCount, videoCount
    - Use grid layout with icons
    - Show zero values (don't hide)
    - _Requirements: 2.3, 9.1, 9.2, 9.4_

  - [ ]* 4.2 Write property test for ClassContentStats
    - **Property 3: Statistics Display Completeness**
    - **Validates: Requirements 9.1, 9.2, 9.4**

  - [x] 4.3 Create ClassNotebookCard component
    - Display notebookTitle with link when notebookId exists
    - Show "Chưa có notebook" when null
    - Use button/link with appropriate styling
    - _Requirements: 2.4, 10.1, 10.2_

  - [x] 4.4 Create ClassAssignmentInfo component
    - Display assignmentId and assignmentStatus
    - Use status badge
    - Hide section if assignmentId is null
    - _Requirements: 2.5_

- [ ] 5. Checkpoint - Ensure all sub-components work independently
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 6. Create main orchestrator component
  - [x] 6.1 Create ClassDetailView (index.tsx)
    - Implement data fetching with useEffect + api.get
    - Manage loading and error states
    - Compose all sub-components
    - Pass only necessary props (≤ 3 per component)
    - Integrate with existing StudentList
    - _Requirements: 1.2, 1.4, 2.1-2.5, 6.1, 6.2, 7.1_

  - [ ]* 6.2 Write property test for field rendering completeness
    - **Property 1: Field Rendering Completeness**
    - **Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5**

  - [ ]* 6.3 Write property test for error resilience
    - **Property 2: Error Resilience**
    - **Validates: Requirements 5.2, 6.3**

  - [ ]* 6.4 Write unit tests for ClassDetailView
    - Test loading state renders skeleton
    - Test empty state when classInfo is null
    - Test error state displays message
    - Test StudentList integration
    - Test back button navigation

- [ ] 7. Update page component to use new structure
  - [x] 7.1 Update `app/(main)/lecturer/classes/[id]/page.tsx`
    - Import from new location: `@/components/lecturers/classes/detail`
    - Verify routing still works
    - _Requirements: 7.4_

  - [x] 7.2 Delete old component file
    - Remove `components/lecturers/classes/lecturer-class-detail-view.tsx`
    - Verify no other files import from old location

- [ ] 8. Final checkpoint - Integration testing
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties
- Unit tests validate specific examples and edge cases
- All components must follow project rules: ≤ 150 lines, ≤ 3 props, shadcn/ui only
- Use only black/white/gray colors (red/yellow for warnings)
- Ensure premium visual design matching Vercel/Cal.com standards
