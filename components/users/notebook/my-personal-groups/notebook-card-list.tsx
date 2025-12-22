"use client";

import { PersonalNotebookResponse } from "@/types/user/notebook";
import NotebookCardItem from "./notebook-card-item";

interface NotebookCardListProps {
  notebooks: PersonalNotebookResponse[];
  onNotebookDeleted?: () => void;
}

export default function NotebookCardList({
  notebooks,
  onNotebookDeleted,
}: NotebookCardListProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
      {notebooks.map((notebook) => (
        <NotebookCardItem
          key={notebook.id}
          notebook={notebook}
          onDeleted={onNotebookDeleted}
        />
      ))}
    </div>
  );
}
