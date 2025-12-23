# Prompt Tạo Giao Diện Frontend Next.js - Quản Lý Lớp Học Phần

## Yêu Cầu Tổng Quan
Tạo giao diện Next.js cho tính năng **Quản lý Lớp học phần** với 2 luồng chính và 1 tính năng preview.

## Backend API Đã Có Sẵn
- Base URL: `http://localhost:8386`
- 3 endpoints hoạt động hoàn chỉnh:
  - `POST /api/lecturer/class-management/preview-excel`
  - `POST /api/lecturer/class-management/create-with-students` 
  - `POST /api/lecturer/class-management/import-students`

## Luồng Giao Diện Cần Thiết

### 🎯 Trang Chính: Class Management Dashboard
- **Header**: "Quản lý Lớp học phần"
- **2 Card chính**:
  1. **"Tạo lớp mới từ Excel"** → Luồng A
  2. **"Import sinh viên vào lớp có sẵn"** → Luồng B
- **Danh sách lớp đã tạo** (optional - có thể để sau)

### 🔄 Luồng A: Tạo Lớp Mới + Import Sinh Viên

#### Bước 1: Form Tạo Lớp
- **Upload Excel**: Drag & drop hoặc browse file (.xlsx)
- **Tên lớp**: Input text (required)
- **Môn học**: Dropdown select (cần API lấy danh sách subjects)
- **Phân công giảng dạy**: Dropdown select (cần API lấy teaching assignments)
- **Button "Preview Excel"** → Hiển thị modal preview

#### Bước 2: Preview Modal
- **Bảng preview** dữ liệu Excel:
  - Cột: STT, Mã SV, Họ và tên, Ngày sinh
  - Hiển thị validation status (✅ hợp lệ, ❌ lỗi)
- **Thống kê**: Tổng số dòng, hợp lệ, lỗi
- **Danh sách lỗi** (nếu có): Dòng X - Lý do lỗi
- **Button**: "Đóng", "Tiếp tục tạo lớp"

#### Bước 3: Xác Nhận & Kết Quả
- **Loading state** khi đang tạo lớp
- **Kết quả import**:
  - ✅ Thành công: X sinh viên
  - ⚠️ Trùng lặp: Y sinh viên (hiển thị danh sách)
  - ❌ Lỗi: Z sinh viên (hiển thị lý do)
- **Button**: "Tạo lớp khác", "Xem danh sách lớp"

### 🔄 Luồng B: Import Vào Lớp Có Sẵn

#### Bước 1: Chọn Lớp
- **Dropdown "Chọn lớp"**: Danh sách các lớp đã tạo
- **Thông tin lớp được chọn**: Tên lớp, môn học, số sinh viên hiện tại

#### Bước 2: Upload & Preview
- **Upload Excel**: Tương tự Luồng A
- **Preview Modal**: Tương tự Luồng A
- **Kiểm tra trùng lặp**: Highlight sinh viên đã có trong lớp

#### Bước 3: Import & Kết Quả
- **Kết quả tương tự Luồng A**
- **Button**: "Import lớp khác", "Xem chi tiết lớp"

## Yêu Cầu Kỹ Thuật

### UI/UX Requirements
- **Design**: Modern, clean, responsive
- **Styling**: Tailwind CSS hoặc tương đương
- **Components**: Sử dụng UI library (shadcn/ui)
- **File Upload**: Drag & drop với progress bar
- **Loading States**: Skeleton loading, spinners
- **Error Handling**: Toast notifications, error boundaries

### API Integration
- **File Upload**: FormData với multipart/form-data
- **Error Handling**: Hiển thị lỗi từ backend response
- **Loading States**: Disable buttons, show progress
- **Success Feedback**: Toast notifications, redirect

### Validation & Error Handling
- **Client-side**: Validate file type (.xlsx), file size
- **Server-side**: Hiển thị lỗi từ API response
- **User Feedback**: Clear error messages, success confirmations

## Data Models Cần Biết

### StudentImportResult (API Response)
```typescript
interface StudentImportResult {
  totalRows: number;
  successCount: number;
  duplicateCount: number;
  errorCount: number;
  duplicates: StudentImportError[];
  errors: StudentImportError[];
}

interface StudentImportError {
  rowNumber: number;
  studentCode: string;
  fullName: string;
  reason: string;
}
```

### Request Models
```typescript
// Luồng A
interface CreateClassRequest {
  excelFile: File;
  className: string;
  subjectId: string;
  teachingAssignmentId: string;
}

// Luồng B  
interface ImportStudentsRequest {
  excelFile: File;
  classId: string;
}

// Preview
interface PreviewRequest {
  excelFile: File;
  classId?: string; // Optional cho Luồng B
}
```

## Ghi Chú Quan Trọng
- **Authentication**: Cần header `X-User-Id` cho API calls
- **File Format**: Chỉ hỗ trợ .xlsx, cấu trúc linh hoạt (header tự động detect)
- **Error Messages**: Hiển thị user-friendly, không show technical details
- **Responsive**: Hoạt động tốt trên mobile và desktop
- **Accessibility**: Tuân thủ WCAG guidelines cơ bản

## Mục Tiêu Cuối
Tạo ra giao diện trực quan, dễ sử dụng cho giảng viên upload Excel và quản lý danh sách sinh viên lớp học phần một cách hiệu quả.