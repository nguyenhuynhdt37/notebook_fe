"use client";

import {
  Mic,
  FileText,
  ListChecks,
  Lightbulb,
  Network,
  MessageSquare,
  Clock,
  Target,
  Languages,
  ShieldAlert,
  PenLine,
  GitCompare,
  ClipboardList,
  StickyNote,
  Video,
} from "lucide-react";
import FeatureCard from "./feature-card";

const AI_FEATURES = [
  {
    id: "audio-overview",
    icon: Mic,
    title: "Podcast",
    description: "Tạo podcast thảo luận về nội dung tài liệu",
  },
  {
    id: "video",
    icon: Video,
    title: "Video",
    description: "Tạo video tự động với hình ảnh AI và giọng đọc",
  },
  {
    id: "flashcards",
    icon: Lightbulb,
    title: "Flashcards",
    description: "Thẻ ghi nhớ để ôn tập từ vựng và khái niệm",
  },
  {
    id: "quiz",
    icon: ListChecks,
    title: "Quiz",
    description: "Bài kiểm tra trắc nghiệm để đánh giá kiến thức",
  },
  {
    id: "mindmap",
    icon: Network,
    title: "Mindmap",
    description: "Sơ đồ tư duy hệ thống hóa nội dung",
  },
  {
    id: "summary",
    icon: FileText,
    title: "Tóm tắt",
    description: "Tóm tắt các điểm chính của tài liệu",
  },
  {
    id: "key-concepts",
    icon: Target,
    title: "Khái niệm",
    description: "Các khái niệm và thuật ngữ quan trọng",
  },
  {
    id: "timeline",
    icon: Clock,
    title: "Timeline",
    description: "Dòng thời gian các sự kiện và mốc quan trọng",
  },
  {
    id: "discuss",
    icon: MessageSquare,
    title: "Câu hỏi gợi mở",
    description: "Các điểm gợi mở và câu hỏi mở rộng",
  },
  {
    id: "translate",
    icon: Languages,
    title: "Dịch thuật",
    description: "Dịch nội dung sang ngôn ngữ khác",
  },
  {
    id: "critic",
    icon: ShieldAlert,
    title: "Phản biện",
    description: "Tìm lỗ hổng và phản biện lại nội dung",
  },
  {
    id: "essay",
    icon: PenLine,
    title: "Viết luận",
    description: "Tạo bài luận hoặc bài văn từ tài liệu",
  },
  {
    id: "compare",
    icon: GitCompare,
    title: "So sánh",
    description: "So sánh và đối chiếu các khái niệm",
  },
  {
    id: "practice",
    icon: ClipboardList,
    title: "Bài tập",
    description: "Tạo bài tập thực hành từ nội dung",
  },
  {
    id: "notes",
    icon: StickyNote,
    title: "Ghi chú",
    description: "Tạo ghi chú thông minh từ tài liệu",
  },
] as const;

interface FeatureListProps {
  onFeatureClick: (featureId: string) => void;
}

export default function FeatureList({ onFeatureClick }: FeatureListProps) {
  return (
    <div className="grid grid-cols-3 gap-2 px-4 py-3 overflow-hidden">
      {AI_FEATURES.map((feature) => (
        <FeatureCard
          key={feature.id}
          icon={feature.icon}
          title={feature.title}
          description={feature.description}
          onClick={() => onFeatureClick(feature.id)}
        />
      ))}
    </div>
  );
}
