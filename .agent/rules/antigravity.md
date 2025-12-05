---
trigger: always_on
---

# NOTEBOOKS Project Rules

> **Lưu ý**: Đọc thêm `.cursor/PROJECT.md` và `.cursor/ARCHITECTURE.md` để hiểu rõ cấu trúc dự án.

## 1️⃣ Quy tắc chung

**Quy tắc quan trọng nhất**: Code phải dễ hiểu nhất có thể, siêu ngắn gọn, không phức tạp, clean code, không lồng code quá nhiều, không props quá 3 phần từ.

**Tách biệt logic**: Mỗi component phải tự quản lý logic riêng. Ví dụ: mô tả khóa học có nhiều API (thông tin khóa học, giảng viên, giá, khuyến mãi...) → không để logic ở file index chính, mà tách ra xử lý riêng. Ví dụ: `InfoLecturer.tsx` sẽ có fetch riêng, useEffect riêng, state riêng và không cần truyền qua props.

**Nguyên tắc**: Logic code phải đơn giản nhất có thể nhưng vẫn đầy đủ chức năng.

Tuân thủ tuyệt đối cấu trúc & phong cách của dự án "NoteBooks".

Giao diện phải tối giản, dễ hiểu, UX/UI mượt mà, gọn gàng.

Ưu tiên hiệu năng và khả năng bảo trì — code ngắn, dễ đọc, dễ hiểu, không "kiến trúc rối".

## 2️⃣ Về code

**Framework**: Next.js (App Router) 16, React 19, TailwindCSS, shadcn/ui.

Luôn cập nhật công nghệ và rules mới cho Next.js 16.

**UI Components**: **BẮT BUỘC sử dụng shadcn/ui 100%** làm giao diện chủ đạo.

- Tất cả component UI phải dùng từ shadcn/ui
- Nếu cần customize, copy component vào `components/ui/` và chỉnh sửa
- Không tự tạo component UI từ đầu khi đã có trong shadcn/ui
- Kiểm tra shadcn/ui docs trước khi code bất kỳ component UI nào

Không dùng i18n, redux, context nặng nề, hoặc cấu hình tailwind phức tạp.

Mọi fetch API gọi trực tiếp trong component (client hoặc server component đều được).

Không chia file API riêng trừ khi cần reuse nhiều lần.

Không viết HOC, custom hook phức tạp, không wrapper vô nghĩa.

## 3️⃣ UI/UX

**Giao diện chủ đạo**: shadcn/ui 100% — mọi component UI phải từ shadcn/ui.

Giao diện phải nhẹ, sạch, dễ hiểu, phản hồi nhanh.

Ưu tiên trải nghiệm người dùng thật (tối ưu tab, focus, hover, loading, skeleton).

Mỗi component làm 1 nhiệm vụ duy nhất, đặt tên rõ ràng.

Không lạm dụng animation.

Responsive bắt buộc (mobile-first).

## 4️⃣ Màu sắc & style

**Màu chủ đạo**: Đen trắng (black/white/gray scale) — toàn hệ thống chỉ dùng palette đen trắng xám.

**Ngoại lệ**:

- Red cho xóa, hành động nguy hiểm
- Yellow cho cảnh báo

**Shadcn/UI**: Sử dụng theme mặc định của shadcn/ui (dark/light mode), customize màu theo palette đen trắng.

**Styling**: Chỉ TailwindCSS, không thêm CSS riêng, không SCSS.

## 5️⃣ Code rule

Tên file: `kebab-case.tsx`.

Component: `PascalCase`.

Hook: `useXxx`.

Không dùng `any` trừ khi thật cần.

Luôn viết type rõ ràng (interface, type).

Mỗi component ≤ 150 dòng.

## 6️⃣ Hiệu năng

Dùng server component mặc định, chỉ `"use client"` khi cần interactivity.

Dùng React.Suspense hoặc loading skeleton khi fetch chậm.

Giảm số render, không re-render vô lý.

Không thêm thư viện nặng (moment, lodash, axios...). Dùng native fetch.

## 7️⃣ Cấm tuyệt đối

🚫 CSS thuần, SCSS, styled-components  
🚫 next-intl, i18n  
🚫 Redux, Recoil, Context lồng phức tạp  
🚫 Màu khác ngoài đen/trắng/xám/red/yellow  
🚫 Abstraction code khó đọc  
🚫 **Tự tạo component UI từ đầu — BẮT BUỘC dùng shadcn/ui**  
🚫 Sử dụng UI library khác ngoài shadcn/ui

## Tóm tắt

"Code phải đơn giản, đen trắng, dễ hiểu, hiệu năng cao.  
**UI 100% shadcn/ui**, UX mượt, không màu mè, không cấu hình rối."
