# 📚 EduGenius - Intelligent Learning Platform

> An AI-powered educational platform designed for Vinh University, facilitating seamless interaction between lecturers and students with advanced learning assistants.

![Project Status](https://img.shields.io/badge/status-active-success.svg)
![Next.js](https://img.shields.io/badge/Next.js-16-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.0-38bdf8)

---

## 🚀 Overview

EduGenius is a modern web application built with the latest web technologies to provide a premium user experience. It integrates AI capabilities to assist in teaching (Lecturer) and learning (Students), featuring a clean, minimal, and high-performance interface.

### Key Highlights

- **Premium UI/UX**: Built with `shadcn/ui` and heavily customized Tailwind CSS for a sleek, modern look.
- **AI-First**: Integrated "Notebook" system for intelligent content management.
- **Role-Based**: Distinct modules for Lecturers and Students.
- **Performance**: Optimized Server Components and client-side interactions.

---

## 🛠 Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **State Management**: React Hooks (No external state libraries like Redux)
- **Data Fetching**: Axios (Client-side) & Native Fetch (Server-side)
- **Font**: Inter (Google Fonts)

---

## 👨‍🏫 Lecturer Module

Comprehensive tools for faculty members to manage their teaching assignments effectively.

### 1. Dashboard (`/lecturer`)

- **Overview Stats**: Quick summary of classes, students, and materials.
- **Quick Actions**: Fast access to common tasks.

### 2. Teaching Assignments (`/lecturer/assignments`)

- **Assignment Grid**: Premium card view of assigned subjects.
- **Filtering**: Filter by Term, status, and search capabilities.
- **Pagination**: Efficient data handling.

### 3. Assignment Details (`/lecturer/assignments/[id]`)

A central hub for managing a specific subject:

- **Premium Header**: Dynamic background patterns, status badges, and term info.
- **Statistics**: Real-time counts of classes, students, documents, quizzes, etc.
- **Notebook Integration**: Direct link to the AI-powered Notebook for the subject.
- **Recent Classes**: Preview of upcoming or recent class sections.

### 4. Class Management

- **Class List** (`/lecturer/assignments/[id]/classes`):
  - View all class sections for a subject.
  - Search and filter classes.
  - **Add Class**: Interface to create new class sections.
- **Student Management** (`/lecturer/assignments/[id]/students`):
  - Comprehensive student list.
  - **Filtering**: Filter by specific class section.
  - **Search**: Find students by ID or name.
  - **Detailed View**: View student info including DOB and class codes.

### 5. Teaching Requests (`/lecturer/assignments/request`)

- Form to submit teaching preferences for upcoming terms.
- Selection of Majors, Subjects, and customizable notes.

---

## 🎓 Student Module (Overview)

_Pending detailed documentation._
Connects students to their enrolled courses, AI tutors, and learning materials.

---

## 📂 Project Structure

```bash
notebook_fe/
├── app/                    # Next.js App Router
│   ├── (auth)/             # Authentication routes
│   ├── (main)/             # Main application layout
│   │   ├── lecturer/       # Lecturer specific routes
│   │   └── student/        # Student specific routes
│   └── globals.css         # Global styles & Tailwind
├── components/             # React Components
│   ├── ui/                 # shadcn/ui base components
│   ├── lecturers/          # Lecturer specific components
│   │   ├── assignments/    # Assignment module
│   │   ├── classes/        # Class management
│   │   └── shared/         # Shared lecturer selectors
│   └── shared/             # Global shared components
├── types/                  # TypeScript definitions
│   └── lecturer/           # Lecturer API types
├── public/                 # Static assets
└── api/                    # API client configuration
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js (Lateats LTS recommended)
- pnpm (Package manager)

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/nguyenhuynhdt37/notebook_fe.git
   cd notebook_fe
   ```

2. **Install dependencies:**

   ```bash
   pnpm install
   ```

3. **Set up Environment Variables:**
   Create a `.env.local` file in the root directory:

   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8386
   ```

4. **Run the development server:**

   ```bash
   pnpm dev
   ```

5. **Open browser:**
   Navigate to [http://localhost:3000](http://localhost:3000).

---

## 📝 Coding Guidelines

We follow strict "Senior Engineer" standards:

1.  **Clean Code**:

    - No `any` type (unless absolutely necessary).
    - Components under 150 lines.
    - Minimal prop drilling (max 3 props or use config object).

2.  **UI/UX**:

    - **100% shadcn/ui**: Do not build custom UI components from scratch if a shadcn alternative exists.
    - **Aesthetics**: sleek, black/white/gray scale palette. Colors reserved for semantic meaning (Red=Error, Yellow=Warning).

3.  **Architecture**:
    - **Feature-Based**: Group components by feature (e.g., `components/lecturers/assignments`).
    - **Composition**: Use small, focused components (`*-filter`, `*-list`, `*-row`).
    - **Direct Imports**: Avoid circular dependencies and overuse of barrel files (`index.ts`) in complex modules.

---

## 🤝 Contributing

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

**Built with ❤️ for Vinh University**
