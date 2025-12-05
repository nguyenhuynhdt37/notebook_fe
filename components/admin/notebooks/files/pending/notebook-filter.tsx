"use client";

import { useState, useEffect, useRef } from "react";
import { Search, X, Check } from "lucide-react";
import api from "@/api/client/axios";
import { NotebookAdminResponse } from "@/types/admin/notebook";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface NotebookFilterProps {
  value: string;
  onChange: (value: string) => void;
}

export default function NotebookFilter({
  value,
  onChange,
}: NotebookFilterProps) {
  const [notebooks, setNotebooks] = useState<NotebookAdminResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState<string>("");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedNotebook, setSelectedNotebook] =
    useState<NotebookAdminResponse | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadNotebooks();
  }, []);

  useEffect(() => {
    if (value && value !== "ALL") {
      const notebook = notebooks.find((n) => n.id === value);
      setSelectedNotebook(notebook || null);
      if (notebook) {
        setSearch(notebook.title);
      }
    } else {
      setSelectedNotebook(null);
      setSearch("");
    }
  }, [value, notebooks]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const loadNotebooks = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: "0",
        size: "100",
        sortBy: "createdAt",
        sortDir: "desc",
      });

      const response = await api.get(`/admin/community?${params}`);

      setNotebooks(response.data.items || []);
    } catch (error) {
      console.error("Error fetching notebooks:", error);
      setNotebooks([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredNotebooks = notebooks.filter((notebook) =>
    notebook.title.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (notebook: NotebookAdminResponse | null) => {
    if (notebook) {
      setSelectedNotebook(notebook);
      setSearch(notebook.title);
      onChange(notebook.id);
    } else {
      setSelectedNotebook(null);
      setSearch("");
      onChange("ALL");
    }
    setIsOpen(false);
  };

  const handleClear = () => {
    setSelectedNotebook(null);
    setSearch("");
    onChange("ALL");
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative w-56">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
        <Input
          placeholder="Tìm notebook..."
          className="w-full pl-9 pr-8 h-9"
          value={search ?? ""}
          onChange={(e) => {
            setSearch(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
        />
        {selectedNotebook && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
            onClick={handleClear}
          >
            <X className="size-3.5" />
          </Button>
        )}
      </div>
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-popover border rounded-md shadow-md max-h-60 overflow-auto">
          {isLoading ? (
            <div className="px-3 py-2 text-sm text-muted-foreground">
              Đang tải...
            </div>
          ) : (
            <>
              <button
                onClick={() => handleSelect(null)}
                className={cn(
                  "w-full text-left px-3 py-2 text-sm hover:bg-accent flex items-center gap-2",
                  !selectedNotebook && "bg-accent"
                )}
              >
                {!selectedNotebook && <Check className="size-4" />}
                <span>Tất cả notebooks</span>
              </button>
              {filteredNotebooks.length > 0 ? (
                filteredNotebooks.map((notebook) => (
                  <button
                    key={notebook.id}
                    onClick={() => handleSelect(notebook)}
                    className={cn(
                      "w-full text-left px-3 py-2 text-sm hover:bg-accent flex items-center gap-2",
                      selectedNotebook?.id === notebook.id && "bg-accent"
                    )}
                  >
                    {selectedNotebook?.id === notebook.id && (
                      <Check className="size-4" />
                    )}
                    <span className="truncate">{notebook.title}</span>
                  </button>
                ))
              ) : (
                <div className="px-3 py-2 text-sm text-muted-foreground">
                  Không tìm thấy notebook
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
