"use client";

import { useState, useCallback } from "react";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  PanelRightClose,
  PanelRight,
  Mic,
  BookOpen,
  FileText,
  Lightbulb,
  ListChecks,
  Video,
  Sparkles,
  Network,
  MessageSquare,
} from "lucide-react";
import FeatureList from "./feature-list";
import GeneratedContent from "./generated-content";
import QuizGenerateModal from "./quiz-generate-modal";
import FlashcardGenerateModal from "./flashcard-generate-modal";
import AudioOverviewModal from "./audio-overview-modal";
import AudioPlayer from "./audio-player";
import MindmapGenerateModal from "./mindmap-generate-modal";
import SuggestionGenerateModal from "./suggestion-generate-modal";
import VideoGenerateModal from "./video-generate-modal";

interface AudioInfo {
  id: string;
  url: string;
  title: string;
}

interface AIFeaturesPanelProps {
  notebookId: string;
  selectedFileIds?: string[];
  collapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
}

const COLLAPSED_FEATURES = [
  { id: "audio-overview", icon: Mic, title: "Audio Overview" },
  { id: "study-guide", icon: BookOpen, title: "Study Guide" },
  { id: "briefing-doc", icon: FileText, title: "Briefing Doc" },
  { id: "flashcards", icon: Lightbulb, title: "Flashcards" },
  { id: "quiz", icon: ListChecks, title: "Quiz" },
  { id: "mindmap", icon: Network, title: "Mindmap" },
  { id: "discuss", icon: MessageSquare, title: "Câu hỏi gợi mở" },
  { id: "video-summary", icon: Video, title: "Video Summary" },
];

export default function AIFeaturesPanel({
  notebookId,
  selectedFileIds = [],
  collapsed = false,
  onCollapsedChange,
}: AIFeaturesPanelProps) {
  const [quizModalOpen, setQuizModalOpen] = useState(false);
  const [flashcardModalOpen, setFlashcardModalOpen] = useState(false);
  const [mindmapModalOpen, setMindmapModalOpen] = useState(false);
  const [suggestionGenerateModalOpen, setSuggestionGenerateModalOpen] =
    useState(false);
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [audioModalOpen, setAudioModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [currentAudio, setCurrentAudio] = useState<AudioInfo | null>(null);

  const handleAudioPlay = useCallback((audio: AudioInfo | null) => {
    setCurrentAudio(audio);
  }, []);

  const handleFeatureClick = useCallback((featureId: string) => {
    switch (featureId) {
      case "audio-overview":
        setAudioModalOpen(true);
        break;
      case "quiz":
        setQuizModalOpen(true);
        break;
      case "flashcards":
        setFlashcardModalOpen(true);
        break;
      case "mindmap":
        setMindmapModalOpen(true);
        break;
      case "discuss":
        setSuggestionGenerateModalOpen(true);
        break;
      case "video":
        setVideoModalOpen(true);
        break;
      default:
        console.log(`Feature clicked: ${featureId}`);
    }
  }, []);

  const handleGenerateSuccess = useCallback(() => {
    // Refresh generated content list
    setRefreshKey((prev) => prev + 1);
  }, []);

  // Collapsed state - thin sidebar with icons
  if (collapsed) {
    return (
      <div className="h-full w-12 flex flex-col bg-background border-l border-border/50">
        {/* Toggle button */}
        <div className="p-2 border-b border-border/50">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onCollapsedChange?.(false)}
                  className="size-8"
                >
                  <PanelRight className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left">
                <p>Mở rộng panel</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* Feature icons */}
        <div className="flex-1 overflow-y-auto py-2 flex flex-col items-center gap-1">
          {COLLAPSED_FEATURES.map((feature) => (
            <TooltipProvider key={feature.id}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleFeatureClick(feature.id)}
                    className="size-8"
                  >
                    <feature.icon className="size-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="left">
                  <p>{feature.title}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
        </div>

        {/* AI Studio indicator */}
        <div className="p-2 border-t border-border/50">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="size-8 flex items-center justify-center">
                  <Sparkles className="size-4 text-muted-foreground" />
                </div>
              </TooltipTrigger>
              <TooltipContent side="left">
                <p>AI Studio</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* Modals still work in collapsed mode */}
        <QuizGenerateModal
          open={quizModalOpen}
          onOpenChange={setQuizModalOpen}
          notebookId={notebookId}
          selectedFileIds={selectedFileIds}
          onSuccess={handleGenerateSuccess}
        />
        <FlashcardGenerateModal
          open={flashcardModalOpen}
          onOpenChange={setFlashcardModalOpen}
          notebookId={notebookId}
          selectedFileIds={selectedFileIds}
          onSuccess={handleGenerateSuccess}
        />
        <MindmapGenerateModal
          open={mindmapModalOpen}
          onOpenChange={setMindmapModalOpen}
          notebookId={notebookId}
          selectedFileIds={selectedFileIds}
          onSuccess={handleGenerateSuccess}
        />
        <AudioOverviewModal
          open={audioModalOpen}
          onOpenChange={setAudioModalOpen}
          notebookId={notebookId}
          selectedFileIds={selectedFileIds}
          onSuccess={handleGenerateSuccess}
        />
        <VideoGenerateModal
          open={videoModalOpen}
          onOpenChange={setVideoModalOpen}
          notebookId={notebookId}
          selectedFileIds={selectedFileIds}
          onSuccess={handleGenerateSuccess}
        />
      </div>
    );
  }

  // Expanded state - full panel
  return (
    <div className="h-full flex flex-col bg-background overflow-x-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
        <div className="flex items-center gap-2">
          <Sparkles className="size-4" />
          <span className="font-semibold text-sm">Studio</span>
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onCollapsedChange?.(true)}
                className="size-8"
              >
                <PanelRightClose className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Thu gọn panel</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        <FeatureList onFeatureClick={handleFeatureClick} />

        <Separator className="mx-4" />

        <GeneratedContent
          key={refreshKey}
          notebookId={notebookId}
          onAudioPlay={handleAudioPlay}
        />
      </div>

      {/* Audio Player - hiển thị ở chân panel */}
      {currentAudio && (
        <AudioPlayer
          audioUrl={currentAudio.url}
          title={currentAudio.title}
          onClose={() => setCurrentAudio(null)}
        />
      )}

      {/* Quiz Generate Modal */}
      <QuizGenerateModal
        open={quizModalOpen}
        onOpenChange={setQuizModalOpen}
        notebookId={notebookId}
        selectedFileIds={selectedFileIds}
        onSuccess={handleGenerateSuccess}
      />

      {/* Flashcard Generate Modal */}
      <FlashcardGenerateModal
        open={flashcardModalOpen}
        onOpenChange={setFlashcardModalOpen}
        notebookId={notebookId}
        selectedFileIds={selectedFileIds}
        onSuccess={handleGenerateSuccess}
      />

      {/* Audio Overview Modal */}
      <AudioOverviewModal
        open={audioModalOpen}
        onOpenChange={setAudioModalOpen}
        notebookId={notebookId}
        selectedFileIds={selectedFileIds}
        onSuccess={handleGenerateSuccess}
      />

      {/* Mindmap Generate Modal */}
      <MindmapGenerateModal
        open={mindmapModalOpen}
        onOpenChange={setMindmapModalOpen}
        notebookId={notebookId}
        selectedFileIds={selectedFileIds}
        onSuccess={handleGenerateSuccess}
      />
      <SuggestionGenerateModal
        open={suggestionGenerateModalOpen}
        onOpenChange={setSuggestionGenerateModalOpen}
        notebookId={notebookId}
        selectedFileIds={selectedFileIds}
        onSuccess={handleGenerateSuccess}
      />
      <VideoGenerateModal
        open={videoModalOpen}
        onOpenChange={setVideoModalOpen}
        notebookId={notebookId}
        selectedFileIds={selectedFileIds}
        onSuccess={handleGenerateSuccess}
      />
    </div>
  );
}
