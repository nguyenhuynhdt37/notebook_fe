# API Backend - Tạo Câu Hỏi Bằng AI

## Tổng Quan
Hệ thống backend Spring Boot đã được triển khai đầy đủ cho tính năng tạo câu hỏi thi bằng AI. Frontend Next.js cần tích hợp với các API endpoints sau để hoàn thiện tính năng.

## Base URL
```
http://localhost:8386
```

## Authentication
Tất cả API đều yêu cầu JWT token trong header:
```
Authorization: Bearer <jwt-token>
```

---

## 1. API Lấy Danh Sách Notebooks (Lecturer)

### Endpoint
```http
GET /lecturer/notebooks/accessible
```

### Mô tả
Lấy danh sách notebooks mà lecturer có quyền truy cập để chọn nguồn files.

### Response
```json
[
  {
    "id": "notebook-uuid-1",
    "title": "Java Programming Course",
    "description": "Materials for Java programming course",
    "type": "class",
    "totalFiles": 15,
    "readyFiles": 12,
    "classId": "class-uuid",
    "className": "IT001.01",
    "subjectCode": "IT001",
    "subjectName": "Java Programming"
  }
]
```

---

## 2. API Upload Files (Lecturer)

### Option A: Simple Upload (Khuyến nghị)

#### Endpoint
```http
POST /lecturer/notebooks/{notebookId}/files/simple
```

#### Mô tả
Upload files với cấu hình mặc định (đơn giản, không cần config).

#### Request Body (multipart/form-data)
- `files` (MultipartFile[], required): Danh sách files cần upload

#### Frontend Implementation
```javascript
const uploadFilesSimple = async (notebookId, files) => {
  const formData = new FormData();
  
  // Chỉ cần thêm files
  files.forEach(file => {
    formData.append('files', file);
  });
  
  const response = await fetch(`/lecturer/notebooks/${notebookId}/files/simple`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Lỗi upload files');
  }
  
  return response.json();
};
```

### Option B: Advanced Upload (Cho người dùng nâng cao)

#### Endpoint
```http
POST /lecturer/notebooks/{notebookId}/files
```

#### Mô tả
Upload files với cấu hình tùy chỉnh cho AI processing.

#### Request Body (multipart/form-data)
- `request` (JSON string, required): Cấu hình upload
- `files` (MultipartFile[], required): Danh sách files cần upload

#### Request Structure
```javascript
// Part 1: request (JSON string)
{
  "chunkSize": 3000,      // 3000-5000, default: 3000
  "chunkOverlap": 250     // 200-500, default: 250
}

// Part 2: files (MultipartFile array)
// Actual file binaries
```

#### Configuration Explained
- **chunkSize**: Kích thước mỗi đoạn text khi xử lý AI (3000-5000 ký tự)
  - 3000: Xử lý nhanh, phù hợp file ngắn
  - 4000-5000: Hiểu context tốt hơn, phù hợp file dài
- **chunkOverlap**: Số ký tự chồng lấp giữa các đoạn (200-500 ký tự)
  - Giúp AI không bị mất thông tin ở ranh giới

#### Frontend Implementation
```javascript
const uploadFilesAdvanced = async (notebookId, files, config = {}) => {
  const formData = new FormData();
  
  // Part 1: Thêm request config (JSON string)
  const requestConfig = {
    chunkSize: config.chunkSize || 3000,
    chunkOverlap: config.chunkOverlap || 250
  };
  formData.append('request', JSON.stringify(requestConfig));
  
  // Part 2: Thêm files vào FormData
  files.forEach(file => {
    formData.append('files', file);
  });
  
  const response = await fetch(`/lecturer/notebooks/${notebookId}/files`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Lỗi upload files');
  }
  
  return response.json();
};
```

---

## 3. API Xóa File (Lecturer)

### Endpoint
```http
DELETE /lecturer/notebooks/{notebookId}/files/{fileId}
```

### Mô tả
Xóa file khỏi notebook.

### Parameters
- `notebookId` (UUID, required): ID của notebook
- `fileId` (UUID, required): ID của file cần xóa

### Response
- Status: 204 No Content

### Frontend Implementation
```javascript
const deleteFile = async (notebookId, fileId) => {
  const response = await fetch(`/lecturer/notebooks/${notebookId}/files/${fileId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Lỗi xóa file');
  }
};
```

---

## 4. API Lấy Files Theo Notebook (Lecturer)

### Endpoint
```http
GET /lecturer/notebooks/{notebookId}/files
```

### Mô tả
Lấy danh sách files đã xử lý xong từ notebook để tạo câu hỏi.

### Parameters
- `notebookId` (UUID, required): ID của notebook
- `search` (String, optional): Tìm kiếm theo tên file

### Response
```json
[
  {
    "id": "file-uuid-1",
    "originalFilename": "Java_Programming_Chapter1.pdf",
    "mimeType": "application/pdf",
    "fileSize": 2048576,
    "status": "done",
    "ocrDone": true,
    "embeddingDone": true,
    "createdAt": "2024-12-30T10:00:00",
    "notebookId": "notebook-uuid-1",
    "notebookTitle": "Java Programming Course",
    "notebookType": "class",
    "uploadedBy": {
      "id": "user-uuid",
      "fullName": "Nguyễn Văn A",
      "email": "user@example.com"
    },
    "chunksCount": 45,
    "contentPreview": "Chương 1: Giới thiệu về Java\nJava là một ngôn ngữ lập trình hướng đối tượng được phát triển bởi Sun Microsystems..."
  }
]
```

---

## 5. API Lấy Tất Cả Files Accessible (Lecturer)

### Endpoint
```http
GET /lecturer/notebooks/files
```

### Mô tả
Lấy tất cả files mà lecturer có thể truy cập từ nhiều notebooks.

### Parameters
- `search` (String, optional): Tìm kiếm theo tên file
- `notebookId` (UUID, optional): Lọc theo notebook cụ thể
- `limit` (Integer, optional, default=100): Giới hạn số kết quả

### Response
Giống như API trên nhưng bao gồm files từ nhiều notebooks.

### Frontend Implementation
```javascript
// Lấy danh sách notebooks
const fetchAccessibleNotebooks = async () => {
  const response = await fetch('/lecturer/notebooks/accessible', {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  return response.json();
};

// Lấy files theo notebook
const fetchNotebookFiles = async (notebookId, search = '') => {
  const response = await fetch(`/lecturer/notebooks/${notebookId}/files?search=${search}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  return response.json();
};

// Lấy tất cả files accessible
const fetchAllAccessibleFiles = async (search = '', notebookId = null) => {
  let url = `/lecturer/notebooks/files?search=${search}`;
  if (notebookId) url += `&notebookId=${notebookId}`;
  
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  return response.json();
};
```

---

## 6. API Xem Chi Tiết File (Lecturer)

### Endpoint
```http
GET /lecturer/notebooks/{notebookId}/files/{fileId}
```

### Mô tả
Lấy thông tin chi tiết của file để preview nội dung.

### Response
```json
{
  "id": "file-uuid-1",
  "originalFilename": "Java_Programming_Chapter1.pdf",
  "mimeType": "application/pdf",
  "fileSize": 2048576,
  "status": "done",
  "ocrDone": true,
  "embeddingDone": true,
  "createdAt": "2024-12-30T10:00:00",
  "notebookId": "notebook-uuid-1",
  "notebookTitle": "Java Programming Course",
  "uploadedBy": {
    "id": "user-uuid",
    "fullName": "Nguyễn Văn A",
    "email": "user@example.com"
  },
  "contentSummary": "Chương 1: Giới thiệu về Java\n\nJava là một ngôn ngữ lập trình hướng đối tượng...",
  "totalChunks": 45,
  "firstChunkContent": "Chương 1: Giới thiệu về Java\nJava là một ngôn ngữ lập trình hướng đối tượng được phát triển bởi Sun Microsystems vào năm 1995...",
  "chunkSize": 3000,
  "chunkOverlap": 250
}
```

---

## 7. API Tạo Exam

### Endpoint
```http
POST /api/exams
```

### Mô tả
Tạo exam mới trước khi generate câu hỏi.

### Request Body
```json
{
  "classId": "class-uuid",
  "title": "Bài Kiểm Tra Java Programming",
  "description": "Kiểm tra kiến thức Java cơ bản",
  "startTime": "2024-12-30T09:00:00",
  "endTime": "2024-12-30T12:00:00",
  "durationMinutes": 120,
  "passingScore": 60.0,
  "shuffleQuestions": true,
  "shuffleOptions": true,
  "showResultsImmediately": false,
  "allowReview": true,
  "maxAttempts": 1,
  "enableProctoring": false,
  "enableLockdown": false,
  "enablePlagiarismCheck": false
}
```

### Response
```json
{
  "id": "exam-uuid",
  "classId": "class-uuid",
  "className": "IT001.01",
  "title": "Bài Kiểm Tra Java Programming",
  "description": "Kiểm tra kiến thức Java cơ bản",
  "status": "DRAFT",
  "totalQuestions": 0,
  "totalPoints": 0.0,
  "createdAt": "2024-12-30T10:00:00"
}
```

---

## 8. API Tạo Câu Hỏi Bằng AI (Chính)

### Endpoint
```http
POST /api/exams/{examId}/generate
```

### Mô tả
Generate câu hỏi từ files đã chọn bằng AI.

### Parameters
- `examId` (UUID, required): ID của exam đã tạo

### Request Body
```json
{
  "notebookFileIds": ["file-uuid-1", "file-uuid-2"],
  "numberOfQuestions": 20,
  "questionTypes": "MCQ,TRUE_FALSE",
  "difficultyLevel": "MEDIUM",
  "mcqOptionsCount": 4,
  "includeExplanation": true,
  "generateImages": false,
  "aiModel": "gpt-4",
  "language": "vi",
  "easyPercentage": 30,
  "mediumPercentage": 50,
  "hardPercentage": 20
}
```

### Request Fields Validation

#### notebookFileIds
- **Type**: Array of UUID
- **Required**: Yes
- **Validation**: Ít nhất 1 file
- **Description**: Danh sách ID của files làm nguồn tạo câu hỏi

#### numberOfQuestions
- **Type**: Integer
- **Required**: Yes
- **Range**: 1-100
- **Default**: 10
- **Description**: Số lượng câu hỏi cần tạo

#### questionTypes
- **Type**: String
- **Required**: Yes
- **Pattern**: `MCQ|TRUE_FALSE|ESSAY|CODING|FILL_BLANK|MATCHING`
- **Example**: `"MCQ,TRUE_FALSE"` hoặc `"MCQ"`
- **Description**: Loại câu hỏi (có thể kết hợp nhiều loại)

#### difficultyLevel
- **Type**: String
- **Required**: Yes
- **Values**: `EASY|MEDIUM|HARD|MIXED`
- **Default**: `MEDIUM`
- **Description**: Độ khó câu hỏi

#### mcqOptionsCount
- **Type**: Integer
- **Range**: 2-6
- **Default**: 4
- **Description**: Số lựa chọn cho câu hỏi trắc nghiệm

#### includeExplanation
- **Type**: Boolean
- **Default**: true
- **Description**: Có tạo giải thích cho đáp án không

#### language
- **Type**: String
- **Values**: `vi|en`
- **Default**: `vi`
- **Description**: Ngôn ngữ tạo câu hỏi

#### Phân bổ độ khó (chỉ khi difficultyLevel = "MIXED")
- **easyPercentage**: 0-100
- **mediumPercentage**: 0-100  
- **hardPercentage**: 0-100
- **Validation**: Tổng 3 giá trị phải = 100

### Response
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
      "options": [
        {
          "id": "option-uuid-1",
          "optionText": "Ngôn ngữ hướng đối tượng",
          "orderIndex": 1,
          "isCorrect": true
        },
        {
          "id": "option-uuid-2", 
          "optionText": "Ngôn ngữ thủ tục",
          "orderIndex": 2,
          "isCorrect": false
        }
      ]
    }
  ],
  "createdAt": "2024-12-30T10:00:00"
}
```

### Frontend Implementation
```javascript
const generateQuestions = async (examId, requestData) => {
  const response = await fetch(`/api/exams/${examId}/generate`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(requestData)
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Lỗi tạo câu hỏi');
  }
  
  return response.json();
};
```

---

## 9. API Xem Trước Exam

### Endpoint
```http
GET /api/exams/{examId}/preview
```

### Mô tả
Xem trước exam với đầy đủ câu hỏi và đáp án (chỉ dành cho giảng viên).

### Response
```json
{
  "exam": {
    "id": "exam-uuid",
    "title": "Bài Kiểm Tra Java Programming",
    "totalQuestions": 20,
    "totalPoints": 20.0
  },
  "questions": [
    {
      "id": "question-uuid-1",
      "questionText": "Java là ngôn ngữ lập trình gì?",
      "questionType": "MCQ",
      "points": 1.0,
      "explanation": "Giải thích chi tiết...",
      "options": [
        {
          "optionText": "Ngôn ngữ hướng đối tượng",
          "isCorrect": true,
          "feedback": "Đúng! Java là ngôn ngữ OOP"
        }
      ]
    }
  ]
}
```

---

## 10. API Publish Exam

### Endpoint
```http
PUT /api/exams/{examId}/publish
```

### Mô tả
Publish exam để học sinh có thể thấy và làm bài.

### Response
```json
{
  "id": "exam-uuid",
  "status": "PUBLISHED",
  "message": "Exam published successfully"
}
```

---

## Error Handling

### Common Error Responses
```json
{
  "status": 400,
  "message": "Validation failed",
  "errors": [
    {
      "field": "numberOfQuestions",
      "message": "Must generate at least 1 question"
    }
  ],
  "timestamp": "2024-12-30T10:00:00"
}
```

### Error Codes
- **400**: Bad Request - Validation errors
- **401**: Unauthorized - Token invalid/missing
- **403**: Forbidden - Insufficient permissions
- **404**: Not Found - Resource not found
- **500**: Internal Server Error - AI generation failed

---

## Frontend Integration Flow

### 1. Trang Tạo Câu Hỏi AI - Complete Flow
```javascript
// 1. Load danh sách notebooks accessible
const notebooks = await fetchAccessibleNotebooks();

// 2. Chọn notebook và load files
const files = await fetchNotebookFiles(selectedNotebookId);

// 3. Upload thêm files nếu cần (với cấu hình tùy chỉnh)
const uploadedFiles = await uploadFiles(selectedNotebookId, newFiles, {
  chunkSize: 3500,
  chunkOverlap: 300
});

// 4. Hoặc load tất cả files accessible
const allFiles = await fetchAllAccessibleFiles(searchTerm);

// 5. Tạo exam trước
const exam = await createExam(examData);

// 6. Generate câu hỏi
const examWithQuestions = await generateQuestions(exam.id, {
  notebookFileIds: selectedFileIds,
  numberOfQuestions: 20,
  questionTypes: "MCQ,TRUE_FALSE",
  difficultyLevel: "MEDIUM",
  includeExplanation: true,
  language: "vi"
});

// 7. Preview exam
const preview = await previewExam(exam.id);

// 8. Publish exam
await publishExam(exam.id);
```

### 2. File Management Component
```javascript
const FileManager = ({ notebookId }) => {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadConfig, setUploadConfig] = useState({
    chunkSize: 3000,
    chunkOverlap: 250
  });

  const handleUpload = async (selectedFiles) => {
    setUploading(true);
    try {
      const uploadedFiles = await uploadFiles(notebookId, selectedFiles, uploadConfig);
      setFiles(prev => [...prev, ...uploadedFiles]);
      showSuccess(`Đã upload ${uploadedFiles.length} file(s)`);
    } catch (error) {
      showError(error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (fileId) => {
    try {
      await deleteFile(notebookId, fileId);
      setFiles(prev => prev.filter(f => f.id !== fileId));
      showSuccess('Đã xóa file');
    } catch (error) {
      showError(error.message);
    }
  };

  return (
    <div>
      <UploadConfig 
        config={uploadConfig} 
        onChange={setUploadConfig} 
      />
      <FileUploader 
        onUpload={handleUpload} 
        loading={uploading} 
        config={uploadConfig}
      />
      <FileList 
        files={files} 
        onDelete={handleDelete}
        onSelect={handleFileSelect}
      />
    </div>
  );
};

// Upload Config Component
const UploadConfig = ({ config, onChange }) => (
  <div className="upload-config">
    <label>
      Chunk Size (3000-5000):
      <input 
        type="number" 
        min="3000" 
        max="5000"
        value={config.chunkSize}
        onChange={e => onChange({...config, chunkSize: parseInt(e.target.value)})}
      />
    </label>
    <label>
      Chunk Overlap (200-500):
      <input 
        type="number" 
        min="200" 
        max="500"
        value={config.chunkOverlap}
        onChange={e => onChange({...config, chunkOverlap: parseInt(e.target.value)})}
      />
    </label>
  </div>
);
```

### 2. Form Validation
```javascript
const validateGenerateRequest = (data) => {
  const errors = [];
  
  if (!data.notebookFileIds?.length) {
    errors.push("Vui lòng chọn ít nhất 1 file");
  }
  
  if (!data.numberOfQuestions || data.numberOfQuestions < 1 || data.numberOfQuestions > 100) {
    errors.push("Số câu hỏi phải từ 1-100");
  }
  
  if (data.difficultyLevel === 'MIXED') {
    const total = data.easyPercentage + data.mediumPercentage + data.hardPercentage;
    if (total !== 100) {
      errors.push("Tổng phần trăm độ khó phải bằng 100%");
    }
  }
  
  return errors;
};
```

### 3. Loading States
```javascript
const [isGenerating, setIsGenerating] = useState(false);
const [progress, setProgress] = useState(0);

const handleGenerate = async () => {
  setIsGenerating(true);
  try {
    // Simulate progress
    setProgress(25); // Đang xử lý files...
    setProgress(50); // Đang tạo câu hỏi...
    setProgress(75); // Đang xử lý kết quả...
    
    const result = await generateQuestions(examId, requestData);
    setProgress(100);
    
    // Success handling
  } catch (error) {
    // Error handling
  } finally {
    setIsGenerating(false);
    setProgress(0);
  }
};
```

---

## Notes

1. **File Status**: Chỉ files có `status: "done"` mới có thể dùng để tạo câu hỏi
2. **AI Processing**: Quá trình tạo câu hỏi có thể mất 30-60 giây tùy số lượng
3. **Token Expiry**: Xử lý refresh token khi API trả về 401
4. **Rate Limiting**: Giới hạn 1 request generate/phút để tránh spam
5. **File Size**: Files lớn hơn 10MB có thể làm chậm quá trình generate

Backend đã sẵn sàng, frontend chỉ cần tích hợp theo đúng API specification trên.