"use client";

import { useState, useEffect, useRef } from "react";
import { Search, X, Check, User } from "lucide-react";
import api from "@/api/client/axios";
import { ContributorInfo } from "@/types/admin/notebook-file";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface ContributorFilterPendingProps {
  notebookId?: string;
  value: string;
  onChange: (value: string) => void;
}

export default function ContributorFilterPending({
  notebookId,
  value,
  onChange,
}: ContributorFilterPendingProps) {
  const [contributors, setContributors] = useState<ContributorInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState<string>("");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedContributor, setSelectedContributor] =
    useState<ContributorInfo | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (notebookId) {
      loadContributors();
    } else {
      setContributors([]);
      setIsLoading(false);
    }
  }, [notebookId]);

  useEffect(() => {
    if (value && value !== "ALL") {
      const contributor = contributors.find((c) => c.id === value);
      setSelectedContributor(contributor || null);
      if (contributor) {
        setSearch(contributor.fullName);
      }
    } else {
      setSelectedContributor(null);
      setSearch("");
    }
  }, [value, contributors]);

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

  const loadContributors = async () => {
    setIsLoading(true);
    try {
      if (notebookId) {
        const response = await api.get<ContributorInfo[]>(
          `/admin/notebooks/${notebookId}/files/contributors`
        );
        setContributors(response.data);
      } else {
        setContributors([]);
      }
    } catch (error) {
      console.error("Error fetching contributors:", error);
      setContributors([]);
    } finally {
      setIsLoading(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const filteredContributors = contributors.filter(
    (contributor) =>
      contributor.fullName.toLowerCase().includes(search.toLowerCase()) ||
      contributor.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (contributor: ContributorInfo | null) => {
    if (contributor) {
      setSelectedContributor(contributor);
      setSearch(contributor.fullName);
      onChange(contributor.id);
    } else {
      setSelectedContributor(null);
      setSearch("");
      onChange("ALL");
    }
    setIsOpen(false);
  };

  const handleClear = () => {
    setSelectedContributor(null);
    setSearch("");
    onChange("ALL");
    setIsOpen(false);
  };

  if (!notebookId) {
    return (
      <div className="w-56">
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Chọn notebook trước"
            className="w-full pl-9 h-9"
            disabled
          />
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative w-56">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
        <Input
          placeholder="Tìm người đóng góp..."
          className="w-full pl-9 pr-8 h-9"
          value={search ?? ""}
          onChange={(e) => {
            setSearch(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
        />
        {selectedContributor && (
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
                  !selectedContributor && "bg-accent"
                )}
              >
                {!selectedContributor && <Check className="size-4" />}
                <span>Tất cả người đóng góp</span>
              </button>
              {filteredContributors.length > 0 ? (
                filteredContributors.map((contributor) => (
                  <button
                    key={contributor.id}
                    onClick={() => handleSelect(contributor)}
                    className={cn(
                      "w-full text-left px-3 py-2 text-sm hover:bg-accent flex items-center gap-2",
                      selectedContributor?.id === contributor.id && "bg-accent"
                    )}
                  >
                    {selectedContributor?.id === contributor.id && (
                      <Check className="size-4" />
                    )}
                    <Avatar className="h-5 w-5">
                      {contributor.avatarUrl && (
                        <AvatarImage
                          src={contributor.avatarUrl}
                          alt={contributor.fullName}
                        />
                      )}
                      <AvatarFallback className="bg-muted text-xs">
                        {getInitials(contributor.fullName)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="truncate">{contributor.fullName}</div>
                      <div className="text-xs text-muted-foreground">
                        {contributor.filesCount} files
                      </div>
                    </div>
                  </button>
                ))
              ) : (
                <div className="px-3 py-2 text-sm text-muted-foreground">
                  Không tìm thấy người đóng góp
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
