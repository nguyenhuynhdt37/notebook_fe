# Prompt Tạo Giao Diện Exam Online - Phần Giảng Viên

## Luồng Hoạt Động Chính

### 1. Tạo Đề Thi Mới
- **Endpoint**: `POST /api/exams`
- **Input**: Thông tin cơ bản (title, description, thời gian, cấu hình)
- **Output**: ExamResponse với status "DRAFT"

### 2. Tạo Câu Hỏi Tự Động
- **Endpoint**: `POST /api/exams/{examId}/generate`
- **Input**: File notebook, số lượng câu hỏi, loại câu hỏi, độ khó
- **Output**: ExamResponse với danh sách câu hỏi đã tạo

### 3. Quản Lý Trạng Thái Đề Thi
- **Chốt đề**: `PUT /api/exams/{examId}/publish` (DRAFT → PUBLISHED)
- **Cho phép làm**: `PUT /api/exams/{examId}/activate` (PUBLISHED → ACTIVE)
- **Hủy đề**: `PUT /api/exams/{examId}/cancel`

## API Endpoints Chính

```
GET /api/exams/lecturer - Danh sách đề thi của giảng viên
GET /api/exams/class/{classId} - Đề thi theo lớp
GET /api/exams/{examId} - Chi tiết đề thi
GET /api/exams/{examId}/preview - Xem trước đề thi (có đáp án)
DELETE /api/exams/{examId} - Xóa đề thi
```

## Cấu Trúc Dữ Liệu

### CreateExamRequest
```json
{
  "classId": "uuid",
  "title": "string",
  "description": "string", 
  "startTime": "datetime",
  "endTime": "datetime",
  "durationMinutes": "number",
  "passingScore": "number",
  "shuffleQuestions": "boolean",
  "shuffleOptions": "boolean",
  "maxAttempts": "number"
}
```

### GenerateQuestionsRequest
```json
{
  "notebookFileIds": ["uuid"],
  "numberOfQuestions": "number",
  "questionTypes": "MCQ,TRUE_FALSE,ESSAY",
  "difficultyLevel": "EASY|MEDIUM|HARD|MIXED",
  "mcqOptionsCount": "number",
  "easyPercentage": "number",
  "mediumPercentage": "number", 
  "hardPercentage": "number"
}
```

### ExamResponse
```json
{
  "id": "uuid",
  "title": "string",
  "status": "DRAFT|PUBLISHED|ACTIVE|CANCELLED",
  "totalQuestions": "number",
  "totalPoints": "number",
  "startTime": "datetime",
  "endTime": "datetime",
  "durationMinutes": "number"
}
```

## Trạng Thái Đề Thi
- **DRAFT**: Đang soạn thảo, có thể chỉnh sửa
- **PUBLISHED**: Đã chốt, không thể sửa, chưa cho phép làm
- **ACTIVE**: Đang cho phép sinh viên làm bài
- **CANCELLED**: Đã hủy

## Yêu Cầu Giao Diện
1. **Dashboard**: Hiển thị danh sách đề thi với trạng thái
2. **Form tạo đề**: Input thông tin cơ bản + cấu hình
3. **Tạo câu hỏi**: Chọn file notebook, cấu hình AI generation
4. **Xem trước đề**: Hiển thị câu hỏi + đáp án cho giảng viên
5. **Quản lý trạng thái**: Buttons chốt đề/kích hoạt/hủy

## Lưu Ý
- Pagination cho danh sách đề thi (page, size, sort)
- Validation form theo backend requirements
- Hiển thị loading states cho AI generation
- Error handling cho các API calls
- Responsive design cho mobile/tablet