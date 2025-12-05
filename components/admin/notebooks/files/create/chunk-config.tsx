"use client";

import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

interface ChunkConfigProps {
  onConfigChange: (chunkSize: number, chunkOverlap: number) => void;
  disabled?: boolean;
}

export default function ChunkConfig({
  onConfigChange,
  disabled,
}: ChunkConfigProps) {
  const [chunkSize, setChunkSize] = useState(3000);
  const [chunkOverlap, setChunkOverlap] = useState(200);

  useEffect(() => {
    onConfigChange(chunkSize, chunkOverlap);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChunkSizeChange = (value: number[]) => {
    const newChunkSize = value[0];
    setChunkSize(newChunkSize);
    onConfigChange(newChunkSize, chunkOverlap);
  };

  const handleChunkOverlapChange = (value: number[]) => {
    const newOverlap = value[0];
    setChunkOverlap(newOverlap);
    onConfigChange(chunkSize, newOverlap);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Chunk Size</Label>
          <span className="text-sm text-muted-foreground">{chunkSize}</span>
        </div>
        <Slider
          value={[chunkSize]}
          onValueChange={handleChunkSizeChange}
          min={3000}
          max={5000}
          step={100}
          disabled={disabled}
        />
        <p className="text-xs text-muted-foreground">
          Range: 3000 - 5000 (default: 3000)
        </p>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Chunk Overlap</Label>
          <span className="text-sm text-muted-foreground">
            {chunkOverlap}
          </span>
        </div>
        <Slider
          value={[chunkOverlap]}
          onValueChange={handleChunkOverlapChange}
          min={200}
          max={500}
          step={10}
          disabled={disabled}
        />
        <p className="text-xs text-muted-foreground">
          Range: 200 - 500 (default: 200)
        </p>
      </div>
    </div>
  );
}

