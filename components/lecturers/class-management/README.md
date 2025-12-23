# Class Management - Quản lý Lớp học phần

## Tổng quan
Tính năng **Quản lý Lớp học phần** cho phép giảng viên:
- Tạo lớp mới từ file Excel
- Import sinh viên vào lớp có sẵn
- Xem trước dữ liệu trước khi import
- Theo dõi kết quả import với thống kê chi tiết

## Cấu trúc Components

### 1. Main Components
- `class-management-view.tsx` - Trang chính với 2 luồng
- `create-class-flow.tsx` - Luồng tạo lớp mới
- `import-students-flow.tsx` - Luồng import vào lớp có sẵn

### 2. Form Components
- `create-class-form.tsx` - Form tạo lớp với thông tin cơ bản
- `import-students-form.tsx` - Form chọn lớp và upload file

### 3. Preview Components
- `preview-modal.tsx` - Preview cho luồng tạo lớp mới
- `preview-import-modal.tsx` - Preview cho luồng import

### 4. Result Components
- `import-result.tsx` - Hiển thị kết quả import với thống kê

### 5. Shared Components
- `file-upload-zone.tsx` - Component upload file với drag & drop
- `progress-steps.tsx` - Progress indicator cho các bước
- `stats-card.tsx` - Card thống kê đẹp

## API Endpoints

### Backend URLs
- Base URL: `http://localhost:8386`
- Preview: `POST /api/lecturer/class-management/preview-excel`
- Create Class: `POST /api/lecturer/class-management/create-with-students`
- Import Students: `POST /api/lecturer/class-management/import-students`

### Request Format
```typescript
// Preview Excel
FormData {
  excelFile: File,
  classId?: string // Optional cho luồng B
}

// Create Class
FormData {
  excelFile: File,
  className: string,
  subjectId: string,
  teachingAssignmentId: string
}

// Import Students
FormData {
  excelFile: File,
  classId: string
}
```

### Response Format
```typescript
interface StudentImportResult {
  totalRows: number;
  successCount: number;
  duplicateCount: number;
  errorCount: number;
  duplicates: StudentImportError[];
  errors: StudentImportError[];
}
```

## File Excel Format
- **Định dạng**: .xlsx only
- **Kích thước**: Tối đa 10MB
- **Cấu trúc**: Mã SV | Họ và tên | Ngày sinh
- **Header**: Tự động detect

## Features

### ✅ Đã hoàn thành
- [x] Giao diện chính với 2 card chính
- [x] Luồng A: Tạo lớp mới từ Excel
- [x] Luồng B: Import sinh viên vào lớp có sẵn
- [x] File upload với drag & drop
- [x] Preview modal với validation
- [x] Kết quả import với thống kê
- [x] Progress steps indicator
- [x] Error handling và toast notifications
- [x] Responsive design
- [x] Dark mode support

### 🔄 Cần cải thiện
- [ ] Kết nối API thật (hiện tại dùng mock data)
- [ ] Authentication với X-User-Id header
- [ ] Fetch danh sách subjects và teaching assignments
- [ ] Fetch danh sách classes cho import
- [ ] Loading states cho API calls
- [ ] Pagination cho preview table
- [ ] Export kết quả import

## Usage

### Truy cập
- URL: `/lecturer/class-management`
- Navigation: Sidebar > "Quản lý lớp"

### Luồng tạo lớp mới
1. Click "Tạo lớp mới từ Excel"
2. Điền thông tin lớp và upload file
3. Xem trước dữ liệu
4. Xác nhận tạo lớp
5. Xem kết quả

### Luồng import sinh viên
1. Click "Import sinh viên vào lớp có sẵn"
2. Chọn lớp và upload file
3. Xem trước dữ liệu (highlight trùng lặp)
4. Xác nhận import
5. Xem kết quả

## Styling
- **Design System**: shadcn/ui components
- **Colors**: Đen/trắng/xám chủ đạo, red/yellow cho alerts
- **Spacing**: Generous whitespace
- **Animation**: Subtle transitions
- **Typography**: Clear hierarchy

## Error Handling
- Client-side validation (file type, size)
- Server-side error display
- Toast notifications
- Loading states
- Empty states