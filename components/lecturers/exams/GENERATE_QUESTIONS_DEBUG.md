# Debug Generate Questions Issue

## Vấn đề
- Khi tạo câu hỏi xong, hệ thống báo "Không thành công" 
- Nhưng câu hỏi vẫn được tạo đầy đủ và hiển thị lên giao diện
- Có thể do response structure hoặc status code không như mong đợi

## Nguyên nhân có thể

### 1. **Status Code khác 200**
- Backend có thể trả về 201 Created thay vì 200 OK
- Axios mặc định chỉ coi 200-299 là success
- Nhưng có thể có interceptor xử lý khác

### 2. **Response Structure khác**
- Backend có thể wrap response trong object khác
- Hoặc có thêm metadata không mong đợi
- Type definition không khớp với actual response

### 3. **Error Handling Logic**
- Try-catch block có thể catch success response
- Error message hiển thị không đúng context
- Promise rejection xảy ra dù operation thành công

## Cải thiện đã thực hiện

### 1. **Enhanced API Client Logging**
```typescript
// api/client/exam.ts - generateQuestions method
try {
  const response = await api.post<ExamDetailResponse>(`/api/exams/${examId}/generate`, data);
  console.log("Generate questions response:", {
    status: response.status,
    statusText: response.statusText,
    data: response.data
  });
  return response.data;
} catch (error: any) {
  console.error("Generate questions error:", {
    message: error.message,
    status: error.response?.status,
    statusText: error.response?.statusText,
    data: error.response?.data
  });
  
  // If it's a 201 Created or other success status, treat as success
  if (error.response?.status >= 200 && error.response?.status < 300) {
    console.log("Treating as success due to 2xx status code");
    return error.response.data;
  }
  
  throw error;
}
```

### 2. **Improved Modal Error Handling**
```typescript
// components/lecturers/exams/generate-questions-modal.tsx
try {
  const result = await examApi.generateQuestions(examId, requestData);
  console.log("Generate questions result:", result);
  
  // Validate response structure
  if (!result || typeof result !== 'object') {
    console.error("Invalid response structure:", result);
    toast.error("Phản hồi từ server không hợp lệ");
    return;
  }

  // Check for questions
  const questionCount = result.totalQuestions || result.questions?.length || 0;
  
  if (questionCount > 0) {
    toast.success(`Đã tạo thành công ${questionCount} câu hỏi`);
    onSuccess();
    onOpenChange(false);
  } else {
    console.warn("No questions generated:", result);
    toast.warning("Không có câu hỏi nào được tạo. Vui lòng thử lại với files khác.");
  }
} catch (error: any) {
  // Enhanced error handling with detailed logging
  // Check for success responses with non-200 status codes
  // Provide specific error messages based on status codes
}
```

### 3. **Debug Component**
```typescript
// components/lecturers/exams/debug-generate-questions.tsx
// Component để test API call trực tiếp
// Hiển thị raw response và error details
// Chỉ hiển thị trong development mode
```

## Cách debug

### 1. **Kiểm tra Console Logs**
```javascript
// Trong browser console, tìm:
"Generate questions response:" // Success case
"Generate questions error:"    // Error case
"Generate questions result:"   // Modal processing
```

### 2. **Sử dụng Debug Component**
- Component debug sẽ hiển thị ở cuối trang exam preview (chỉ trong dev mode)
- Click "Test API Call" để test trực tiếp API
- Xem raw response và error details

### 3. **Network Tab**
- Mở Developer Tools > Network
- Tìm request đến `/api/exams/{examId}/generate`
- Kiểm tra:
  - Status code (200, 201, etc.)
  - Response headers
  - Response body structure

## Expected Response Structure

Theo API Guide, response should be:
```json
{
  "id": "exam-uuid",
  "title": "Bài Kiểm Tra Java Programming",
  "status": "DRAFT",
  "totalQuestions": 20,
  "totalPoints": 20.0,
  "questions": [
    {
      "id": "question-uuid-1",
      "questionText": "Java là ngôn ngữ lập trình gì?",
      "questionType": "MCQ",
      "orderIndex": 1,
      "points": 1.0,
      "difficultyLevel": "MEDIUM",
      "explanation": "Java là ngôn ngữ lập trình hướng đối tượng...",
      "options": [...]
    }
  ],
  "createdAt": "2024-12-30T10:00:00"
}
```

## Troubleshooting Steps

### 1. **Kiểm tra Status Code**
```javascript
// Nếu thấy log: "Treating as success due to 2xx status code"
// Có nghĩa là backend trả về 201/202 thay vì 200
```

### 2. **Kiểm tra Response Structure**
```javascript
// Nếu thấy: "Invalid response structure"
// Backend có thể wrap response trong object khác
// Ví dụ: { data: {...}, message: "success" }
```

### 3. **Kiểm tra Network Errors**
```javascript
// Nếu thấy: "Lỗi kết nối mạng"
// Có thể do timeout hoặc CORS issues
```

## Next Steps

1. **Test với Debug Component** để xem exact response
2. **Kiểm tra Backend logs** để confirm operation success
3. **Adjust error handling** based on actual response pattern
4. **Remove debug component** sau khi fix xong

## Temporary Workaround

Nếu vấn đề vẫn tồn tại:
1. Ignore error message nếu questions được tạo thành công
2. Check `result.totalQuestions > 0` thay vì rely on try-catch
3. Add manual refresh sau khi generate để ensure UI update