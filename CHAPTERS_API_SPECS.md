# Đặc Tả API Quản Lý Chương Học (Chapters Management)

Tài liệu này mô tả các API cần thiết để hỗ trợ tính năng quản lý chương và bài học (Drag & Drop) cho giảng viên.

## 1. Data Models

### Section (Chương)

```json
{
  "id": "uuid",
  "title": "Tên chương",
  "position": 0, // Thứ tự hiển thị (integer)
  "lessons": [] // Danh sách bài học trong chương
}
```

### Lesson (Bài học)

```json
{
  "id": "uuid",
  "title": "Tên bài học",
  "lesson_type": "video | quiz | code | info | article",
  "position": 0, // Thứ tự trong chương
  "section_id": "uuid" // Thuộc chương nào
}
```

---

## 2. API Endpoints

### A. Quản lý Chương (Sections)

#### 1. Lấy danh sách chương (kèm bài học)

- **Endpoint**: `GET /api/v1/lecturer/courses/{courseId}/chapters`
- **Response**:
  ```json
  [
    {
      "id": "sec-1",
      "title": "Chương 1",
      "position": 0,
      "lessons": [
        {
          "id": "les-1",
          "title": "Bài 1",
          "lesson_type": "video",
          "position": 0
        },
        {
          "id": "les-2",
          "title": "Bài 2",
          "lesson_type": "quiz",
          "position": 1
        }
      ]
    }
    // ...
  ]
  ```

#### 2. Tạo chương mới

- **Endpoint**: `POST /api/v1/lecturer/courses/{courseId}/sections`
- **Body**:
  ```json
  {
    "title": "Tên chương mới"
  }
  ```
- **Response**: Trả về object `Section` vừa tạo (kèm ID mới). Backend tự gán `position` là cuối cùng.

#### 3. Cập nhật tên chương

- **Endpoint**: `PUT /api/v1/lecturer/sections/{sectionId}`
- **Body**:
  ```json
  {
    "title": "Tên chương mới"
  }
  ```

#### 4. Xóa chương

- **Endpoint**: `DELETE /api/v1/lecturer/sections/{sectionId}`
- **Logic**: Chỉ cho phép xóa nếu chương rỗng (không có bài học). Hoặc cung cấp tùy chọn xóa cascade (FE hiện tại đang block xóa nếu có bài).

#### 5. Sắp xếp lại thứ tự chương (Reorder Sections)

- **Endpoint**: `PUT /api/v1/lecturer/courses/{courseId}/sections/reorder`
- **Body**: Gửi lên danh sách ID theo thứ tự mới.
  ```json
  {
    "section_ids": ["sec-3", "sec-1", "sec-2"]
  }
  ```
- **Logic Backend**: Cập nhật lại field `position` cho các chương dựa theo index trong mảng gửi lên.

---

### B. Quản lý Bài học (Lessons)

#### 6. Tạo bài học mới

- **Endpoint**: `POST /api/v1/lecturer/sections/{sectionId}/lessons`
- **Body**:
  ```json
  {
    "title": "Tên bài học",
    "lesson_type": "video" // Default
  }
  ```
- **Response**: Trả về object `Lesson` vừa tạo. Backend tự gán `position` là cuối cùng trong section đó.

#### 7. Cập nhật tên bài học

- **Endpoint**: `PUT /api/v1/lecturer/lessons/{lessonId}`
- **Body**:
  ```json
  {
    "title": "Tên mới"
  }
  ```

#### 8. Xóa bài học

- **Endpoint**: `DELETE /api/v1/lecturer/lessons/{lessonId}`

#### 9. Di chuyển bài học (Move & Reorder)

- **Endpoint**: `PUT /api/v1/lecturer/lessons/{lessonId}/move`
- **Desc**: Dùng cho cả việc sắp xếp lại trong cùng 1 chương HOẶC kéo sang chương khác.
- **Body**:
  ```json
  {
    "target_section_id": "sec-2", // ID chương đích (có thể là chương cũ hoặc mới)
    "new_index": 1 // Vị trí (index) mới trong danh sách bài học của chương đích
  }
  ```
- **Logic Backend**:
  1. Nếu `target_section_id` khác section hiện tại -> Move lesson sang section mới.
  2. Chèn lesson vào vị trí `new_index`.
  3. Cập nhật lại `position` của tất cả lesson trong `target_section_id` (và cả section cũ nếu move sang chương khác) để đảm bảo thứ tự liên tục 0, 1, 2...

---

## 3. Lưu ý Frontend Logic (Hiện tại)

- Frontend đang dùng **Optimistic UI**: Khi user kéo thả, FE cập nhật giao diện ngay lập tức mà chưa chờ Server.
- API `move` cần phản hồi nhanh để đồng bộ hóa nếu có lỗi.
- Field `lesson_type` hiện tại FE hỗ trợ: `video`, `quiz`, `code`, `info`, `article`. Backend cần lưu enum string này dưới DB.
