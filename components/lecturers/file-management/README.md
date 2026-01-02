# Quản lý Files - Lecturer (Theo Pattern Admin)

Tính năng quản lý files cho phép giảng viên quản lý tài liệu trong notebooks để tạo câu hỏi AI, được thiết kế theo pattern của Admin Notebook Files Management.

## Cấu trúc Components

### 1. **file-management-page.tsx** - Component chính
- Layout tương tự admin files management
- Thống kê files (Tổng, Sẵn sàng, Đang xử lý)
- Chọn notebook hoặc xem tất cả files
- Tích hợp search, filter, pagination
- Upload files với dialog modal

### 2. **file-table.tsx** - Bảng hiển thị files
- Table layout giống admin với các cột:
  - Tên file, Notebook (nếu xem tất cả), Loại, Kích thước
  - Trạng thái, OCR, Embedding, Chunks
  - Người upload, Ngày tạo, Hành động
- File preview dialog
- Delete confirmation
- Status badges và icons

### 3. **file-filter.tsx** - Bộ lọc files
- Tìm kiếm theo tên file
- Lọc theo trạng thái (pending, processing, done, failed)
- Lọc theo loại file (PDF, Word, PowerPoint, Text)
- Lọc theo OCR/Embedding status
- Sắp xếp theo ngày tạo, tên file

### 4. **file-pagination.tsx** - Phân trang
- Pagination với số trang hiển thị thông minh
- Hiển thị thông tin "X-Y trong tổng Z files"
- Navigation buttons (Trước/Sau)

### 5. **file-upload.tsx** - Upload files
- Drag & drop interface
- File validation (type, size)
- Progress indicator
- Batch upload support
- Error handling

### 6. **file-preview-dialog.tsx** - Preview chi tiết file
- Thông tin file đầy đủ
- Trạng thái xử lý (OCR, Embedding)
- Content preview
- Notebook information
- Upload information

## Tính năng chính

### 📊 **Dashboard với Thống kê**
```
┌─────────────────────────────────────────────────────────────┐
│ Quản lý Files                                               │
│ Quản lý files trong notebooks để tạo câu hỏi AI            │
├─────────────────────────────────────────────────────────────┤
│ [Tổng Files: 25] [Files Sẵn Sàng: 20] [Đang Xử Lý: 5]     │
├─────────────────────────────────────────────────────────────┤
│ [📁 Chọn notebook...] [Upload Files]                       │
├─────────────────────────────────────────────────────────────┤
│ [🔍 Search] [Status] [Type] [OCR] [Embedding] [Sort]       │
├─────────────────────────────────────────────────────────────┤
│ File Table with Pagination                                 │
└─────────────────────────────────────────────────────────────┘
```

### 🗂️ **Quản lý Files theo Notebook**
- **Chọn notebook cụ thể**: Upload và quản lý files trong notebook
- **Xem tất cả files**: Overview files từ tất cả notebooks có quyền truy cập
- **Upload restriction**: Chỉ có thể upload khi chọn notebook cụ thể

### 🔍 **Tìm kiếm và Lọc Mạnh mẽ**
- **Search**: Tìm kiếm theo tên file
- **Status Filter**: pending, processing, done, failed
- **File Type Filter**: PDF, Word, PowerPoint, Text
- **Processing Filter**: OCR done/not done, Embedding done/not done
- **Sorting**: Ngày tạo, tên file (A-Z, Z-A)

### 📋 **Bảng Files Chi tiết**
- **File Information**: Tên, loại, kích thước, trạng thái
- **Processing Status**: OCR, Embedding với icons trực quan
- **Content Info**: Số chunks, content preview
- **User Info**: Người upload với avatar
- **Actions**: Xem chi tiết, xóa file

### 📤 **Upload Files Dễ dàng**
- **Drag & Drop**: Kéo thả files vào vùng upload
- **File Validation**: Kiểm tra loại file và kích thước
- **Batch Upload**: Upload nhiều files cùng lúc
- **Progress Tracking**: Hiển thị tiến trình upload
- **Auto Processing**: Files tự động được xử lý OCR và embedding

## API Integration

### Endpoints được sử dụng
```typescript
// Notebooks
GET /lecturer/notebooks/accessible

// Files by notebook
GET /lecturer/notebooks/{notebookId}/files

// All accessible files  
GET /lecturer/notebooks/files

// Upload files (Simple method)
POST /lecturer/notebooks/{notebookId}/files/simple

// Delete file
DELETE /lecturer/notebooks/{notebookId}/files/{fileId}
```

### Client-side Filtering & Pagination
- **Frontend filtering**: Áp dụng filters trên client để giảm API calls
- **Client pagination**: Phân trang trên frontend với performance tốt
- **Smart caching**: Cache notebooks và files data

## Workflow sử dụng

### 1. **Xem tổng quan files**
```
1. Vào "Quản lý Files" từ sidebar
2. Chọn "Tất cả notebooks" để xem overview
3. Sử dụng search/filter để tìm files
4. Xem thống kê và trạng thái files
```

### 2. **Upload files mới**
```
1. Chọn notebook cụ thể từ dropdown
2. Click "Upload Files"
3. Kéo thả hoặc chọn files
4. Xem progress và đợi xử lý hoàn thành
```

### 3. **Quản lý files**
```
1. Sử dụng filters để tìm files cần quản lý
2. Click vào tên file để xem chi tiết
3. Sử dụng actions menu để xóa files
4. Theo dõi trạng thái xử lý (OCR, Embedding)
```

### 4. **Tạo câu hỏi từ files**
```
1. Tìm files có trạng thái "Sẵn sàng"
2. Click "Tạo câu hỏi AI" từ header
3. Hoặc đi đến "Bài kiểm tra" > "Tạo đề thi mới"
```

## So sánh với Admin Pattern

### ✅ **Giống Admin**
- Layout và cấu trúc components
- Table design với đầy đủ thông tin
- Filter và search functionality
- Pagination pattern
- File upload modal
- Preview dialog design
- Status badges và icons

### 🔄 **Khác biệt cho Lecturer**
- **Notebook selection**: Lecturer chọn notebook, Admin xem theo notebook ID
- **Simplified permissions**: Lecturer chỉ xem files có quyền truy cập
- **Upload restrictions**: Phải chọn notebook cụ thể để upload
- **AI integration**: Tích hợp với workflow tạo câu hỏi AI
- **Simplified actions**: Ít actions hơn Admin (không có approve/reject)

## Best Practices

### 1. **Performance**
- Client-side filtering giảm API calls
- Pagination để handle large datasets
- Lazy loading cho file previews
- Debounced search input

### 2. **User Experience**
- Clear status indicators
- Intuitive file upload flow
- Comprehensive error messages
- Loading states cho tất cả operations

### 3. **File Management**
- Validation trước khi upload
- Clear processing status
- Easy file discovery với search/filter
- Safe delete với confirmation

## Troubleshooting

### Files không hiển thị "Sẵn sàng"
- Kiểm tra status = "done" AND ocrDone = true AND embeddingDone = true
- Đợi quá trình xử lý hoàn thành
- Refresh trang để cập nhật status

### Upload thất bại
- Kiểm tra file type được hỗ trợ
- Kiểm tra file size < 10MB
- Đảm bảo đã chọn notebook
- Kiểm tra kết nối mạng

### Không tìm thấy files
- Kiểm tra quyền truy cập notebook
- Thử search với keywords khác
- Reset filters về "ALL"
- Kiểm tra notebook selection

Tính năng quản lý files này cung cấp trải nghiệm tương tự Admin nhưng được tối ưu cho workflow của Lecturer, đặc biệt là tích hợp với tính năng tạo câu hỏi AI.