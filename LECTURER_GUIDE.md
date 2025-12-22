# 📚 EduGenius - Nền tảng Học tập Thông minh

> Nền tảng AI hỗ trợ giảng dạy và học tập cho Đại học Vinh

## 🚀 Công nghệ

- **Framework**: Next.js 16 (App Router)
- **UI**: shadcn/ui + TailwindCSS
- **Font**: Inter (Google Fonts)
- **State**: React hooks (không Redux)
- **API**: Axios client-side fetch

---

## 👨‍🏫 Module Giảng viên (`/lecturer`)

### 1. Dashboard

- Tổng quan thống kê
- Quick actions

### 2. Môn phân công (`/lecturer/assignments`)

#### Danh sách môn học

- Hiển thị dạng card grid 4 cột
- Dot pattern background premium
- Filter theo học kỳ, trạng thái duyệt
- Pagination

#### Chi tiết môn (`/lecturer/assignments/[id]`)

- Header với badges trạng thái
- Stats grid: lớp, sinh viên, tài liệu, quiz, flashcard, video...
- Notebook card liên kết
- Recent classes preview

#### Lớp học phần (`/lecturer/assignments/[id]/classes`)

- Danh sách lớp dạng cards
- Search + Add button
- Thông tin: mã lớp, phòng, thứ, tiết, số SV

#### Sinh viên (`/lecturer/assignments/[id]/students`)

- Table view với avatar
- Filter theo lớp cụ thể
- Search mã SV, họ tên
- Pagination

### 3. Yêu cầu dạy môn (`/lecturer/assignments/request`)

- Form chọn học kỳ, ngành, môn học
- Ghi chú bổ sung

---

## 🎨 Design System

### Màu sắc

- **Palette chính**: Đen / Trắng / Xám
- **Destructive**: Đỏ (xóa, lỗi)
- **Warning**: Vàng (cảnh báo)

### Components Pattern

```
component-folder/
├── main-component.tsx    # Component chính
├── component-filter.tsx  # Filter/Search
├── component-pagination.tsx
└── component-row.tsx     # Row item
```

### Premium UI Elements

- Dot pattern backgrounds
- Backdrop blur effects
- Hover transitions
- Icon watermarks

---

## 📁 Cấu trúc thư mục

```
components/lecturers/
├── assignments/          # Môn phân công
│   ├── detail/          # Chi tiết môn
│   ├── students/        # Sinh viên trong môn
│   ├── classes/         # Lớp học phần (wrapper)
│   └── request/         # Form yêu cầu dạy
├── classes/             # Module lớp học
│   ├── members/         # Thành viên lớp
│   └── class-*.tsx      # Card, List, Filter, Pagination
├── shared/              # Components dùng chung
│   ├── lecturer-term-select.tsx
│   ├── lecturer-major-select.tsx
│   ├── lecturer-subject-select.tsx
│   └── lecturer-class-select.tsx
└── layout/              # Sidebar, Header
```

---

## 🔌 API Endpoints

### Assignments

| Method | Endpoint                                       | Mô tả                   |
| ------ | ---------------------------------------------- | ----------------------- |
| GET    | `/lecturer/teaching-assignments`               | Danh sách môn phân công |
| GET    | `/lecturer/teaching-assignments/{id}`          | Chi tiết môn            |
| GET    | `/lecturer/teaching-assignments/{id}/classes`  | Lớp học phần            |
| GET    | `/lecturer/teaching-assignments/{id}/students` | Sinh viên trong môn     |
| POST   | `/lecturer/teaching-assignments/request`       | Yêu cầu dạy môn         |

### Classes

| Method | Endpoint                         | Mô tả          |
| ------ | -------------------------------- | -------------- |
| GET    | `/lecturer/classes/{id}/members` | Thành viên lớp |

### Reference Data

| Method | Endpoint             | Mô tả             |
| ------ | -------------------- | ----------------- |
| GET    | `/lecturer/terms`    | Danh sách học kỳ  |
| GET    | `/lecturer/majors`   | Danh sách ngành   |
| GET    | `/lecturer/subjects` | Danh sách môn học |

---

## 🛠️ Chạy dự án

```bash
# Cài đặt
pnpm install

# Development
pnpm dev

# Build
pnpm build

# Start production
pnpm start
```

---

## 📝 Quy tắc Code

1. **Component**: Tối đa 150 dòng, tách nhỏ nếu dài hơn
2. **Props**: Tối đa 3 props, dùng object nếu nhiều hơn
3. **Naming**: `kebab-case.tsx` cho files, `PascalCase` cho components
4. **API**: Gọi trực tiếp trong component, không tạo file service riêng
5. **UI**: 100% shadcn/ui, không tự tạo component UI
