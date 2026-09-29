import { defineStore } from "pinia";
import { invoke } from "@tauri-apps/api/core";
import type { HikvisionStatus, TtsParams } from "../types";
import { convertAudioBytesToHikvision } from "../utils/hikvisionConverter";
import { useVoicesStore } from "./voices";
import { useSettingsStore } from "./settings";

const EDGE_TTS_OUTPUT_FORMAT = "audio-24khz-48kbitrate-mono-mp3";

interface TtsState {
  text: string;
  converting: boolean;
  progress: number;
  audioUrl: string | null;
  audioBytes: Uint8Array | null;
  error: string | null;
  currentTaskId: string | null;
  rate: number;
  pitch: number;
  volume: number;
  requestVersion: number;
  hikvisionStatus: HikvisionStatus | null;
  hikvisionBytes: Uint8Array | null;
  hikvisionSizeKB: number | null;
  hikvisionWarning: string | null;
  hikvisionError: string | null;
}

const HIKVISION_IDLE_STATE = {
  hikvisionStatus: null,
  hikvisionBytes: null,
  hikvisionSizeKB: null,
  hikvisionWarning: null,
  hikvisionError: null,
};

function toSignedString(value: number, suffix: string): string {
  return `${value >= 0 ? "+" : ""}${value}${suffix}`;
}

function toErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function revokeAudioUrl(audioUrl: string | null): void {
  if (audioUrl) {
    URL.revokeObjectURL(audioUrl);
  }
}

export const useTtsStore = defineStore("tts", {
  state: (): TtsState => ({
    text: "",
    converting: false,
    progress: 0,
    audioUrl: null,
    audioBytes: null,
    error: null,
    currentTaskId: null,
    rate: 0,
    pitch: 0,
    volume: 0,
    requestVersion: 0,
    ...HIKVISION_IDLE_STATE,
  }),

  getters: {
    rateString(state): string {
      return toSignedString(state.rate, "%");
    },
    pitchString(state): string {
      return toSignedString(state.pitch, "Hz");
    },
    volumeString(state): string {
      return toSignedString(state.volume, "%");
    },
    charCount(state): number {
      return state.text.length;
    },
    byteCount(state): number {
      return new TextEncoder().encode(state.text).length;
    },
  },

  actions: {
    setText(text: string) {
      this.$patch({ text });
    },

    async convert() {
      if (this.converting || !this.text.trim()) {
        return;
      }

      const voicesStore = useVoicesStore();
      const settingsStore = useSettingsStore();
      const taskId = crypto.randomUUID();
      const requestVersion = this.requestVersion + 1;
      const params: TtsParams = {
        text: this.text,
        voice: voicesStore.selectedVoice,
        rate: this.rateString,
        pitch: this.pitchString,
        volume: this.volumeString,
        format: EDGE_TTS_OUTPUT_FORMAT,
        task_id: taskId,
        max_retries: settingsStore.maxRetries,
      };

      revokeAudioUrl(this.audioUrl);
      this.$patch({
        converting: true,
        progress: 0,
        error: null,
        currentTaskId: taskId,
        audioUrl: null,
        audioBytes: null,
        requestVersion,
        hikvisionStatus: settingsStore.hikvisionMode ? "pending" : null,
        hikvisionBytes: null,
        hikvisionSizeKB: null,
        hikvisionWarning: null,
        hikvisionError: null,
      });

      try {
        const audioData = await invoke<number[]>("tts_convert", { params });
        if (this.requestVersion !== requestVersion) {
          return;
        }

        const audioBytes = new Uint8Array(audioData);
        const audioBlob = new Blob([audioBytes], { type: "audio/mpeg" });
        const audioUrl = URL.createObjectURL(audioBlob);

        this.$patch({
          audioBytes,
          audioUrl,
          progress: 100,
          error: null,
        });

        if (settingsStore.hikvisionMode) {
          await this.convertToHikvisionFormat();
        }
      } catch (error) {
        if (this.requestVersion !== requestVersion) {
          return;
        }

        this.$patch({
          error: toErrorMessage(error),
          audioBytes: null,
          audioUrl: null,
        });
      } finally {
        if (this.requestVersion !== requestVersion) {
          return;
        }

        this.$patch({
          converting: false,
          currentTaskId: null,
        });
      }
    },

    /**
     * Converts the current generated audio into the Hikvision WAV format.
     * Runs after a successful `convert()` when hikvisionMode is enabled; a
     * failure here never touches the original audio.
     */
    async convertToHikvisionFormat() {
      const settingsStore = useSettingsStore();
      if (!settingsStore.hikvisionMode || !this.audioBytes) {
        return;
      }

      const requestVersion = this.requestVersion;
      this.$patch({
        hikvisionStatus: "converting",
        hikvisionBytes: null,
        hikvisionSizeKB: null,
        hikvisionWarning: null,
        hikvisionError: null,
      });

      try {
        const result = await convertAudioBytesToHikvision(this.audioBytes, {
          sampleRate: settingsStore.hikvisionSampleRate,
          normalize: settingsStore.hikvisionNormalize,
        });
        if (this.requestVersion !== requestVersion) {
          return;
        }

        this.$patch({
          hikvisionStatus: result.warning ? "oversize" : "success",
          hikvisionBytes: result.bytes,
          hikvisionSizeKB: result.sizeKB,
          hikvisionWarning: result.warning,
          hikvisionError: null,
        });
      } catch (error) {
        if (this.requestVersion !== requestVersion) {
          return;
        }

        this.$patch({
          hikvisionStatus: "failed",
          hikvisionBytes: null,
          hikvisionSizeKB: null,
          hikvisionWarning: null,
          hikvisionError: toErrorMessage(error),
        });
      }
    },

    async stop() {
      if (!this.currentTaskId) {
        return;
      }

      try {
        await invoke("tts_stop", { taskId: this.currentTaskId });
      } catch {
        return;
      }
    },

    clear() {
      revokeAudioUrl(this.audioUrl);
      this.$patch({
        text: "",
        converting: false,
        audioUrl: null,
        audioBytes: null,
        error: null,
        progress: 0,
        currentTaskId: null,
        requestVersion: this.requestVersion + 1,
        ...HIKVISION_IDLE_STATE,
      });
    },
  },
});
