import { invoke } from "@tauri-apps/api/core";
import i18n from "../plugins/i18n";
import type { HikvisionSampleRate } from "../types";

export const HIKVISION_MAX_SIZE_KB = 512;
export const HIKVISION_SAMPLE_RATES: readonly HikvisionSampleRate[] = [8000, 16000];

export interface HikvisionConvertOptions {
  sampleRate: HikvisionSampleRate;
  normalize: boolean;
}

export interface HikvisionConvertResult {
  success: boolean;
  outputPath: string;
  sizeKB: number;
  warning: string | null;
}

export interface HikvisionBytesResult {
  bytes: Uint8Array;
  sizeKB: number;
  warning: string | null;
}

function toErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function toSizeKB(sizeBytes: number): number {
  return Math.round(sizeBytes / 1024);
}

function toOversizeWarning(sizeKB: number): string | null {
  if (sizeKB <= HIKVISION_MAX_SIZE_KB) {
    return null;
  }

  return i18n.global.t("hikvision.messages.oversizeWarning", { sizeKB });
}

function toHikvisionFileName(inputPath: string): string {
  const segments = inputPath.split(/[\\/]/);
  const fileName = segments[segments.length - 1] || inputPath;
  const baseName = fileName.replace(/\.[^.]+$/, "") || fileName;
  return `${baseName}_hikvision.wav`;
}

function joinPath(directory: string, fileName: string): string {
  if (!directory) {
    return fileName;
  }

  const separator = directory.includes("\\") && !directory.includes("/") ? "\\" : "/";
  return `${directory.replace(/[\\/]+$/, "")}${separator}${fileName}`;
}

function resolveOutputDirectory(inputPath: string, outputDir: string): string {
  if (outputDir) {
    return outputDir;
  }

  const segments = inputPath.split(/[\\/]/);
  if (segments.length <= 1) {
    return "";
  }

  return inputPath
    .slice(0, inputPath.length - segments[segments.length - 1].length)
    .replace(/[\\/]+$/, "");
}

export function buildHikvisionOutputPath(inputPath: string, outputDir: string): string {
  return joinPath(resolveOutputDirectory(inputPath, outputDir), toHikvisionFileName(inputPath));
}

function wrapError(error: unknown): Error {
  return new Error(i18n.global.t("hikvision.messages.failed", { message: toErrorMessage(error) }));
}

/**
 * Converts an on-disk audio file into the Hikvision face-terminal WAV format
 * ({原名}_hikvision.wav) and returns its size plus an oversize warning when
 * the 512KB limit is exceeded. Throws an Error when conversion fails.
 */
export async function convertToHikvision(
  inputPath: string,
  outputDir: string,
  options: HikvisionConvertOptions,
): Promise<HikvisionConvertResult> {
  const outputPath = buildHikvisionOutputPath(inputPath, outputDir);

  try {
    const sizeBytes = await invoke<number>("convert_audio_to_hikvision", {
      inputPath,
      outputPath,
      sampleRate: options.sampleRate,
      normalize: options.normalize,
    });

    const sizeKB = toSizeKB(sizeBytes);
    return {
      success: true,
      outputPath,
      sizeKB,
      warning: toOversizeWarning(sizeKB),
    };
  } catch (error) {
    throw wrapError(error);
  }
}

/**
 * Converts in-memory TTS output (mp3 bytes) into the Hikvision WAV format via
 * a temporary file managed by the Rust backend. Returns the WAV bytes, its
 * size, and an oversize warning when applicable.
 */
export async function convertAudioBytesToHikvision(
  audioBytes: Uint8Array,
  options: HikvisionConvertOptions,
): Promise<HikvisionBytesResult> {
  try {
    const data = await invoke<number[]>("convert_audio_bytes_to_hikvision", {
      audioData: Array.from(audioBytes),
      sampleRate: options.sampleRate,
      normalize: options.normalize,
    });

    const bytes = new Uint8Array(data);
    const sizeKB = toSizeKB(bytes.byteLength);
    return {
      bytes,
      sizeKB,
      warning: toOversizeWarning(sizeKB),
    };
  } catch (error) {
    throw wrapError(error);
  }
}

/**
 * Reports whether the bundled/configured FFmpeg sidecar is available. Any
 * failure to evaluate readiness counts as "not ready".
 */
export async function checkFfmpegReady(): Promise<boolean> {
  try {
    return (await invoke<boolean>("is_ffmpeg_ready")) === true;
  } catch {
    return false;
  }
}
