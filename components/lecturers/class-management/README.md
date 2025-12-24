# Class Management - Quản lý Lớp học phần

## Tổng quan
Tính năng **Quản lý Lớp học phần** cho phép giảng viên:
- **Tạo lớp từ Excel**: Tạo lớp mới và import danh sách sinh viên từ file Excel
- **Import sinh viên từ Excel**: Thêm sinh viên vào lớp có sẵn từ file Excel
- **Tạo lớp thủ công**: Tạo lớp học phần mới không cần file Excel
- **Thêm sinh viên thủ công**: Thêm sinh viên từng người vào lớp
- Xem trước dữ liệu trước khi import
- Theo dõi kết quả import với thống kê chi tiết

## Cấu trúc Components

### 1. Main Components
- `class-management-view.tsx` - Trang chính với 4 luồng
- `create-class-flow.tsx` - Luồng tạo lớp từ Excel
- `import-students-flow.tsx` - Luồng import sinh viên từ Excel
- `manual-create-class-flow.tsx` - Luồng tạo lớp thủ công
- `manual-add-student-flow.tsx` - Luồng thêm sinh viên thủ công

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

### Excel-based Operations
- Base URL: `http://localhost:8386`
- Preview: `POST /api/lecturer/class-management/preview-excel`
- Create Class: `POST /api/lecturer/class-management/create-with-students`
- Import Students: `POST /api/lecturer/class-management/import-students`

### Manual Operations
- Create Class: `POST /api/lecturer/manual-class-management/create-class`
- Add Student: `POST /api/lecturer/manual-class-management/add-student`

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
- [x] Giao diện chính với 4 card chính
- [x] Luồng A: Tạo lớp mới từ Excel
- [x] Luồng B: Import sinh viên vào lớp có sẵn từ Excel
- [x] **Luồng C: Tạo lớp thủ công** (mới)
- [x] **Luồng D: Thêm sinh viên thủ công** (mới)
- [x] File upload với drag & drop
- [x] Preview modal với validation
- [x] Kết quả import với thống kê
- [x] Progress steps indicator
- [x] Error handling và toast notifications
- [x] Responsive design
- [x] Dark mode support
- [x] **API Integration**: Thay thế mock data bằng API thật
- [x] **Real-time Stats**: Thống kê từ dữ liệu thật
- [x] **Recent Activity**: Hoạt động gần đây từ API
- [x] **Dynamic Selects**: Subject và Assignment select từ API
- [x] **Manual Class Creation**: Form tạo lớp với validation
- [x] **Manual Student Addition**: Form thêm sinh viên với email validation

### 🔄 Cần cải thiện
- [ ] Authentication với X-User-Id header (hiện dùng mock)
- [ ] Loading states cho API calls
- [ ] Pagination cho preview table
- [ ] Export kết quả import
- [ ] Real-time updates khi có class mới

## Usage

### Truy cập
- URL: `/lecturer/class-management`
- Navigation: Sidebar > "Quản lý lớp"

### Luồng tạo lớp từ Excel
1. Click "Tạo lớp từ Excel"
2. Điền thông tin lớp và upload file
3. Xem trước dữ liệu
4. Xác nhận tạo lớp
5. Xem kết quả

### Luồng import sinh viên từ Excel
1. Click "Import từ Excel"
2. Chọn lớp và upload file
3. Xem trước dữ liệu (highlight trùng lặp)
4. Xác nhận import
5. Xem kết quả

### Luồng tạo lớp thủ công
1. Click "Tạo lớp thủ công"
2. Điền thông tin lớp (tên, môn học, phòng, thời gian)
3. Xác nhận tạo lớp
4. Hệ thống tự động tạo notebook cộng đồng

### Luồng thêm sinh viên thủ công
1. Click "Thêm sinh viên"
2. Chọn lớp học phần
3. Điền thông tin sinh viên (mã SV, tên, ngày sinh, email)
4. Hệ thống kiểm tra trùng lặp và tạo tài khoản nếu cần
5. Gửi email thông báo cho sinh viên mới

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