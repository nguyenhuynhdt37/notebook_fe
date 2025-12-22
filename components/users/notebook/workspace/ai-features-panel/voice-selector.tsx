"use client";

import { useState, useEffect, useRef } from "react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Volume2 } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import api from "@/api/client/axios";
import type { TtsVoice } from "@/types/user/tts-voice";

interface VoiceSelectorProps {
  value: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
  label?: string;
  placeholder?: string;
}

export default function VoiceSelector({
  value,
  onValueChange,
  disabled = false,
  label = "Giọng đọc (Gemini TTS)",
  placeholder = "Chọn giọng đọc",
}: VoiceSelectorProps) {
  const [voices, setVoices] = useState<TtsVoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);
  const [currentAudioUrl, setCurrentAudioUrl] = useState<string>("");
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const fetchVoices = async () => {
      try {
        setLoading(true);
        const response = await api.get<TtsVoice[]>("/user/tts-voices");
        // Chỉ lấy voices đang active và sort theo sortOrder
        const activeVoices = response.data
          .filter((v) => v.isActive)
          .sort((a, b) => a.sortOrder - b.sortOrder);
        setVoices(activeVoices);
      } catch (err) {
        console.error("Error fetching TTS voices:", err);
        // Fallback to empty nếu API fail
        setVoices([]);
      } finally {
        setLoading(false);
      }
    };

    fetchVoices();
  }, []);

  // Play sample audio khi chọn voice
  const playSampleAudio = (voiceId: string) => {
    const voice = voices.find((v) => v.voiceId === voiceId);
    if (!voice?.sampleAudioUrl || !audioRef.current) return;

    console.log("Playing sample audio for:", voiceId, voice.sampleAudioUrl);

    // Set audio source và play
    setCurrentAudioUrl(voice.sampleAudioUrl);
    setPlayingVoiceId(voiceId);

    // Đợi audio load xong rồi mới play với delay nhỏ
    setTimeout(() => {
      if (audioRef.current) {
        audioRef.current.load();
        audioRef.current.play().catch((err) => {
          console.error("Failed to play audio:", err);
          setPlayingVoiceId(null);
        });
      }
    }, 100);
  };

  const handleValueChange = (newValue: string) => {
    onValueChange(newValue);
    // Tự động phát audio mẫu khi chọn
    playSampleAudio(newValue);
  };

  const handleAudioEnded = () => {
    setPlayingVoiceId(null);
  };

  const handleAudioError = () => {
    console.error("Error playing sample audio");
    setPlayingVoiceId(null);
  };

  // Format label cho voice option - với badge màu cho gender
  const getGenderBadge = (gender: string) => {
    switch (gender) {
      case "female":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-pink-500/10 text-pink-600 dark:bg-pink-500/20 dark:text-pink-400 border border-pink-500/20">
            Nữ
          </span>
        );
      case "male":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 border border-blue-500/20">
            Nam
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-500/10 text-gray-600 dark:bg-gray-500/20 dark:text-gray-400 border border-gray-500/20">
            Neutral
          </span>
        );
    }
  };

  const formatVoiceLabel = (voice: TtsVoice) => {
    // Rút ngắn description nếu quá dài
    const shortDesc =
      voice.description.length > 50
        ? voice.description.substring(0, 50) + "..."
        : voice.description;
    return { voice, shortDesc };
  };

  if (loading) {
    return (
      <div className="space-y-2">
        <Label>{label}</Label>
        <div className="flex items-center gap-2 p-3 rounded-lg border bg-muted/50">
          <Loader2 className="size-4 animate-spin" />
          <span className="text-sm text-muted-foreground">
            Đang tải danh sách giọng đọc...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Hidden audio element - luôn render để có ref */}
      <audio
        ref={audioRef}
        src={currentAudioUrl || undefined}
        onEnded={handleAudioEnded}
        onError={handleAudioError}
        className="hidden"
      />

      <div className="flex items-center justify-between">
        <Label htmlFor="voice">{label}</Label>
        {playingVoiceId && (
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-primary/10">
            <Volume2 className="size-3 text-primary animate-pulse" />
            <span className="text-xs font-medium text-primary">
              Đang phát mẫu
            </span>
          </div>
        )}
      </div>
      <TooltipProvider>
        <Select
          value={value}
          onValueChange={handleValueChange}
          disabled={disabled}
        >
          <Tooltip>
            <TooltipTrigger asChild>
              <SelectTrigger id="voice">
                <SelectValue placeholder={placeholder}>
                  {value && voices.find((v) => v.voiceId === value)?.voiceName}
                </SelectValue>
              </SelectTrigger>
            </TooltipTrigger>
            {value &&
              (() => {
                const selectedVoice = voices.find((v) => v.voiceId === value);
                if (!selectedVoice) return null;
                return (
                  <TooltipContent
                    side="right"
                    sideOffset={5}
                    className="max-w-sm bg-white text-white border border-gray-200 shadow-lg"
                  >
                    <div className="flex flex-col gap-2 p-1 text-gray-900">
                      <div className="flex items-center gap-2">
                        {getGenderBadge(selectedVoice.gender)}
                        <span className="font-semibold">
                          {selectedVoice.voiceName}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {selectedVoice.description}
                      </p>
                    </div>
                  </TooltipContent>
                );
              })()}
          </Tooltip>
          <SelectContent className="w-full">
            {voices.map((voice) => {
              const { shortDesc } = formatVoiceLabel(voice);
              return (
                <SelectItem key={voice.id} value={voice.voiceId}>
                  <div className="flex flex-col gap-1 py-0.5">
                    <div className="flex items-center gap-2">
                      {getGenderBadge(voice.gender)}
                      <span className="font-semibold text-sm">
                        {voice.voiceName}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">{shortDesc}</p>
                  </div>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </TooltipProvider>
      {voices.length === 0 && !loading && (
        <p className="text-xs text-muted-foreground">
          Không có giọng đọc khả dụng
        </p>
      )}
    </div>
  );
}
