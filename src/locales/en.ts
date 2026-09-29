export default {
  common: {
    appName: "TTS Vue Next",
    formats: {
      mp3: "MP3",
      wav: "WAV",
      ogg: "OGG",
      flac: "FLAC",
    },
  },
  nav: {
    textToSpeech: "TTS",
    batchConvert: "Batch Convert",
    settings: "Settings",
    versionCurrent: "Version {version}",
    versionUpdateAvailable: "Version {current} → {latest}",
  },
  titleBar: {
    openRepository: "Open GitHub repository",
    openRepositoryFailed: "Failed to open repository. Please try again.",
    toggleTheme: "Toggle theme",
    minimize: "Minimize window",
    toggleMaximize: "Toggle maximize window",
    close: "Close window",
    windowActionFailed: "Window action failed. Please try again.",
  },
  tts: {
    textInput: {
      title: "Text Input",
      placeholder: "Enter text to convert to speech...",
      clearInput: "Clear text input",
    },
    options: {
      title: "Voice Control Dock",
      language: "Language",
      voice: "Voice",
      rate: "Rate",
      pitch: "Pitch",
      volume: "Volume",
      outputFormat: "Output Format",
      generate: "Generate Speech",
      generating: "Generating...",
      stop: "Stop",
    },
    audioPlayer: {
      title: "Playback Console",
      togglePlayback: "Toggle playback",
      saveGeneratedAudio: "Save generated audio",
      saveFilterName: "Audio",
      defaultFileName: "tts-output.{ext}",
      defaultHikvisionFileName: "tts-output_hikvision.wav",
    },
  },
  batch: {
    hero: {
      overline: "Batch Workflow Studio",
      title: "Batch Workflow Studio",
      description:
        "Queue text files, review progress per item, and export audio with controlled concurrency.",
    },
    options: {
      title: "Batch Control Panel",
    },
    actions: {
      startAll: "Start All",
      clear: "Clear",
      concurrency: "Concurrency",
    },
    upload: {
      title: "Drop text files into the queue",
      description:
        "Click to browse, or drop `.txt`, `.md`, `.markdown`, and `.docx` files here.",
      chooseFiles: "Choose Files",
      unsupportedFileTypes: "Unsupported file types: {files}",
      filePickerFilterName: "Text Files",
    },
    list: {
      title: "Queue Progress",
      columns: {
        file: "File",
        status: "Status",
        progress: "Progress",
        actions: "Actions",
      },
      emptyTitle: "No files queued yet",
      emptyDescription:
        "You can drag and drop files here, or use the button below to select files.",
      status: {
        completed: "Completed",
        failed: "Failed",
        processing: "Processing",
        queued: "Queued",
      },
    },
    errors: {
      failedToRemoveTempFile:
        "Failed to remove temporary file {path}: {message}",
    },
  },
  settings: {
    hero: {
      overline: "Preferences",
      title: "Tune output and processing behavior",
      description:
        "Choose where converted audio is saved and how aggressively batch jobs should run.",
    },
    sections: {
      output: "Output",
      processing: "Processing",
      about: "About",
    },
    fields: {
      savePath: "Save Path",
      savePathPlaceholder: "Click to select...",
      defaultFormat: "Default Format",
      displayLanguage: "Display Language",
      autoplay: "Auto-play after conversion",
      maxRetries: "Max Retries",
      fileConcurrency: "File Concurrency",
      chunkConcurrency: "Chunk Concurrency",
    },
    languages: {
      zh: "Simplified Chinese",
      en: "English",
    },
    about: {
      description:
        "A desktop TTS application powered by Microsoft Edge TTS service and built with Vue 3, Vuetify, and Tauri.",
    },
  },
  hikvision: {
    sectionTitle: "Hikvision Face Terminal Output",
    description:
      "When enabled, generated speech is automatically converted to the WAV format required by Hikvision face recognition terminals.",
    modeLabel: "Hikvision face terminal format",
    enableOutput: "Enable Hikvision output",
    sampleRate: "Sample Rate",
    normalize: "Volume Normalization",
    normalizeHint: "Automatically adjust to -3dB (recommended)",
    ffmpegNotReady: "FFmpeg is not ready; Hikvision output is unavailable",
    noAudio: "Please generate audio first",
    saveAudio: "Save Hikvision format audio",
    listColumn: "Hikvision",
    spec: {
      container: "Container",
      containerValue: "WAV",
      codec: "Codec",
      codecValue: "PCM (uncompressed)",
      channels: "Channels",
      channelsValue: "Mono",
      sampleRate: "Sample Rate",
      sampleRateValue: "8000 / 16000 Hz",
      bitDepth: "Bit Depth",
      bitDepthValue: "16 bit",
      amplitude: "Amplitude",
      amplitudeValue: "≤ -3dB (auto-normalized)",
      fileSize: "File Size",
      fileSizeValue: "≤ 512 KB",
    },
    status: {
      pending: "Pending",
      converting: "Converting",
      success: "Success",
      failed: "Failed",
      oversize: "Over 512KB",
    },
    messages: {
      converted: "Hikvision audio generated ({sizeKB}KB)",
      oversizeWarning: "File is {sizeKB}KB, exceeding the Hikvision 512KB limit",
      oversizeTooltip: "{sizeKB}KB exceeds the Hikvision 512KB limit",
      failed: "Hikvision conversion failed: {message}",
    },
  },
} as const;
