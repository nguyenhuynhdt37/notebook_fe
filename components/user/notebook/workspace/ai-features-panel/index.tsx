"use client";

import { useState, useCallback } from "react";
import { Separator } from "@/components/ui/separator";
import StudioHeader from "./studio-header";
import FeatureList from "./feature-list";
import GeneratedContent from "./generated-content";
import QuizGenerateModal from "./quiz-generate-modal";

interface AIFeaturesPanelProps {
  notebookId: string;
  selectedFileIds?: string[];
}

export default function AIFeaturesPanel({
  notebookId,
  selectedFileIds = [],
}: AIFeaturesPanelProps) {
  const [quizModalOpen, setQuizModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleFeatureClick = useCallback((featureId: string) => {
    switch (featureId) {
      case "quiz":
        setQuizModalOpen(true);
        break;
      // TODO: Add other feature modals
      default:
        console.log(`Feature clicked: ${featureId}`);
    }
  }, []);

  const handleQuizSuccess = useCallback(() => {
    // Refresh generated content list
    setRefreshKey((prev) => prev + 1);
  }, []);

  return (
    <div className="h-full flex flex-col bg-background">
      <StudioHeader />

      <div className="flex-1 overflow-y-auto">
        <FeatureList onFeatureClick={handleFeatureClick} />

        <Separator className="mx-4" />

        <GeneratedContent key={refreshKey} notebookId={notebookId} />
      </div>

      {/* Quiz Generate Modal */}
      <QuizGenerateModal
        open={quizModalOpen}
        onOpenChange={setQuizModalOpen}
        notebookId={notebookId}
        selectedFileIds={selectedFileIds}
        onSuccess={handleQuizSuccess}
      />
    </div>
  );
}
