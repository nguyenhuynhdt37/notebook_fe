export interface TtsVoice {
  id: string;
  voiceId: string;
  voiceName: string;
  description: string;
  provider: string;
  gender: "male" | "female" | "neutral";
  language: string;
  accent: string | null;
  style: string | null;
  ageGroup: string | null;
  useCase: string | null;
  sampleAudioUrl: string;
  sampleText: string;
  sampleDurationMs: number | null;
  defaultSpeed: number;
  defaultPitch: number;
  isActive: boolean;
  isPremium: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}
