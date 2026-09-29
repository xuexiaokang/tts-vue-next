export interface Voice {
  Name: string;
  ShortName: string;
  Gender: string;
  Locale: string;
  SuggestedCodec: string;
  FriendlyName: string;
  Status: string;
  VoiceTag: {
    ContentCategories: string[];
    VoicePersonalities: string[];
  };
}

export interface TtsParams {
  text: string;
  voice: string;
  rate: string;
  pitch: string;
  volume: string;
  format: string;
  task_id: string;
  max_retries: number;
}

export interface BatchFile {
  id: string;
  name: string;
  path: string;
  size: number;
  status: "pending" | "processing" | "done" | "error";
  progress: number;
  error?: string;
  outputPath?: string;
  hikvisionStatus?: HikvisionStatus;
  hikvisionOutputPath?: string;
  hikvisionSizeKB?: number;
  hikvisionError?: string;
}

export interface TtsSettings {
  savePath: string;
  outputFormat: OutputFormat;
  maxRetries: number;
  fileConcurrency: number;
  chunkConcurrency: number;
  autoplay: boolean;
  language: AppLanguage;
  themeMode: ThemeMode;
  hikvisionMode: boolean;
  hikvisionSampleRate: HikvisionSampleRate;
  hikvisionNormalize: boolean;
}

export type OutputFormat = "mp3" | "wav" | "ogg" | "flac";
export type AppLanguage = "zh-CN" | "en-US";
export type ThemeMode = "system" | "light" | "dark";
export type HikvisionSampleRate = 8000 | 16000;
export type HikvisionStatus =
  | "pending"
  | "converting"
  | "success"
  | "failed"
  | "oversize";
