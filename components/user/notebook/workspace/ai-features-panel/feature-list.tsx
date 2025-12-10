"use client";

import {
  Mic,
  FileText,
  ListChecks,
  Lightbulb,
  Video,
  BookOpen,
} from "lucide-react";
import FeatureCard from "./feature-card";

const AI_FEATURES = [
  {
    id: "audio-overview",
    icon: Mic,
    title: "Audio Overview",
    description: "Tạo podcast thảo luận về nội dung",
    action: "Tạo",
  },
  {
    id: "study-guide",
    icon: BookOpen,
    title: "Study Guide",
    description: "Hướng dẫn học tập chi tiết",
    action: "Tạo",
  },
  {
    id: "briefing-doc",
    icon: FileText,
    title: "Briefing Doc",
    description: "Tài liệu tóm tắt ngắn gọn",
    action: "Tạo",
  },
  {
    id: "flashcards",
    icon: Lightbulb,
    title: "Flashcards",
    description: "Thẻ ghi nhớ học từ vựng",
    action: "Tạo",
  },
  {
    id: "quiz",
    icon: ListChecks,
    title: "Quiz",
    description: "Bài kiểm tra trắc nghiệm",
    action: "Tạo",
  },
  {
    id: "video-summary",
    icon: Video,
    title: "Video Summary",
    description: "Tóm tắt video ngắn",
    action: "Tạo",
  },
] as const;

interface FeatureListProps {
  onFeatureClick: (featureId: string) => void;
}

export default function FeatureList({ onFeatureClick }: FeatureListProps) {
  return (
    <div className="p-4 space-y-2">
      {AI_FEATURES.map((feature) => (
        <FeatureCard
          key={feature.id}
          icon={feature.icon}
          title={feature.title}
          description={feature.description}
          actionLabel={feature.action}
          onClick={() => onFeatureClick(feature.id)}
        />
      ))}
    </div>
  );
}
