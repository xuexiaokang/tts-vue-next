import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

const { invokeMock } = vi.hoisted(() => ({
  invokeMock: vi.fn(),
}));

vi.mock("@tauri-apps/api/core", () => ({
  invoke: invokeMock,
}));

import i18n from "../plugins/i18n";
import {
  buildHikvisionOutputPath,
  checkFfmpegReady,
  convertAudioBytesToHikvision,
  convertToHikvision,
  HIKVISION_MAX_SIZE_KB,
} from "./hikvisionConverter";

describe("hikvisionConverter", () => {
  beforeEach(() => {
    invokeMock.mockReset();
  });

  afterEach(() => {
    i18n.global.locale.value = "zh";
  });

  test("builds the hikvision output path next to the input by default", () => {
    expect(buildHikvisionOutputPath("C:/out/语音输出.mp3", "")).toBe(
      "C:/out/语音输出_hikvision.wav",
    );
    expect(buildHikvisionOutputPath("C:/out/语音输出.mp3", "D:/hik")).toBe(
      "D:/hik/语音输出_hikvision.wav",
    );
  });

  test("converts a file and reports size without warning under the limit", async () => {
    invokeMock.mockResolvedValue(300 * 1024);

    const result = await convertToHikvision("C:/out/voice.mp3", "", {
      sampleRate: 8000,
      normalize: true,
    });

    expect(result).toEqual({
      success: true,
      outputPath: "C:/out/voice_hikvision.wav",
      sizeKB: 300,
      warning: null,
    });
    expect(invokeMock).toHaveBeenCalledWith("convert_audio_to_hikvision", {
      inputPath: "C:/out/voice.mp3",
      outputPath: "C:/out/voice_hikvision.wav",
      sampleRate: 8000,
      normalize: true,
    });
  });

  test("returns an oversize warning above 512KB", async () => {
    invokeMock.mockResolvedValue(600 * 1024);

    const result = await convertToHikvision("C:/out/voice.mp3", "", {
      sampleRate: 16000,
      normalize: false,
    });

    expect(result.sizeKB).toBe(600);
    expect(result.warning).toContain("600");
    expect(result.warning).toContain("512");
    expect(invokeMock).toHaveBeenCalledWith(
      "convert_audio_to_hikvision",
      expect.objectContaining({ sampleRate: 16000, normalize: false }),
    );
  });

  test("throws a localized error when the conversion fails", async () => {
    invokeMock.mockRejectedValue("ffmpeg error: boom");

    await expect(
      convertToHikvision("C:/out/voice.mp3", "", {
        sampleRate: 8000,
        normalize: true,
      }),
    ).rejects.toThrow("boom");
  });

  test("converts in-memory bytes and reports oversize warnings", async () => {
    const wavBytes = new Uint8Array(520 * 1024).fill(1);
    invokeMock.mockResolvedValue(Array.from(wavBytes));

    const result = await convertAudioBytesToHikvision(new Uint8Array([1, 2, 3]), {
      sampleRate: 8000,
      normalize: true,
    });

    expect(result.bytes).toEqual(wavBytes);
    expect(result.sizeKB).toBe(520);
    expect(result.warning).toContain("520");
    expect(invokeMock).toHaveBeenCalledWith("convert_audio_bytes_to_hikvision", {
      audioData: [1, 2, 3],
      sampleRate: 8000,
      normalize: true,
    });
    expect(520).toBeGreaterThan(HIKVISION_MAX_SIZE_KB);
  });

  test("throws a localized error when byte conversion fails", async () => {
    invokeMock.mockRejectedValue("Audio data is empty");

    await expect(
      convertAudioBytesToHikvision(new Uint8Array([1]), {
        sampleRate: 8000,
        normalize: false,
      }),
    ).rejects.toThrow("Audio data is empty");
  });

  test("checkFfmpegReady returns the backend verdict", async () => {
    invokeMock.mockResolvedValue(true);
    expect(await checkFfmpegReady()).toBe(true);

    invokeMock.mockResolvedValue(false);
    expect(await checkFfmpegReady()).toBe(false);

    invokeMock.mockRejectedValue(new Error("missing"));
    expect(await checkFfmpegReady()).toBe(false);
  });
});
