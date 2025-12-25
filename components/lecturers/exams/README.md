# Exam Management Components

Hệ thống quản lý đề thi trực tuyến cho giảng viên, tuân thủ theo `EXAM_FRONTEND_PROMPT.md`.

## 🏗️ Cấu trúc Components

### Core Components

- **`ExamDashboard`** - Trang chính quản lý đề thi
- **`ExamCard`** - Card hiển thị thông tin đề thi
- **`ExamPreview`** - Xem trước đề thi với đáp án
- **`ExamByClass`** - Danh sách đề thi theo lớp

### Modal Components

- **`CreateExamModal`** - Form tạo đề thi mới
- **`GenerateQuestionsModal`** - Tạo câu hỏi tự động bằng AI

### Utility Components

- **`ExamStatusManager`** - Quản lý trạng thái đề thi
- **`ExamStats`** - Thống kê đề thi

## 🔄 Luồng hoạt động

### 1. Tạo đề thi mới
```
ExamDashboard → CreateExamModal → API: POST /api/exams
```

### 2. Tạo câu hỏi AI
```
ExamPreview → GenerateQuestionsModal → API: POST /api/exams/{id}/generate
```

### 3. Quản lý trạng thái
```
ExamCard → ExamStatusManager → API: PUT /api/exams/{id}/{action}
```

## 📊 Trạng thái đề thi

| Status | Mô tả | Actions |
|--------|-------|---------|
| `DRAFT` | Đang soạn thảo | Xuất bản, Xóa |
| `PUBLISHED` | Đã xuất bản | Kích hoạt |
| `ACTIVE` | Đang diễn ra | Dừng thi |
| `CANCELLED` | Đã hủy | - |

## 🎨 Design System

- **Colors**: Chỉ đen/trắng/xám + red/yellow cho trạng thái
- **UI Library**: 100% shadcn/ui components
- **Spacing**: Generous whitespace, không chật chội
- **Typography**: Clear hierarchy với font weights
- **Interactions**: Smooth transitions, subtle hover states

## 📱 Routes

- `/exams` - Dashboard chính
- `/exams/[id]/preview` - Xem trước đề thi
- `/classes/[id]/exams` - Đề thi theo lớp

## 🔧 API Integration

Tất cả components tự quản lý state và API calls:

```typescript
// Pattern chuẩn
const [data, setData] = useState<T | null>(null);
const [isLoading, setIsLoading] = useState(true);

useEffect(() => {
  loadData();
}, [dependencies]);

const loadData = async () => {
  setIsLoading(true);
  try {
    const response = await api.get<T>("/endpoint");
    setData(response.data);
  } catch (error) {
    toast.error("Error message");
  } finally {
    setIsLoading(false);
  }
};
```

## ✅ Features

- [x] Dashboard với thống kê
- [x] Tạo đề thi với form validation
- [x] Tạo câu hỏi AI từ notebook
- [x] Quản lý trạng thái đề thi
- [x] Xem trước đề thi với đáp án
- [x] Responsive design
- [x] Loading states với skeleton
- [x] Error handling với toast
- [x] Pagination
- [x] Search & filter

## 🚀 Performance

- Server Components cho initial data
- Client Components cho interactivity
- Efficient re-renders
- Skeleton loading states
- Optimistic updates