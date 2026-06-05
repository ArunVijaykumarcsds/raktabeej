# RAKTABEEJ — Dataset Generation Engine

> *"As each drop of Raktabeej's blood fell, another arose equal in power."*  
> — Devi Mahatmya, Markandeya Purana

**One video. Countless frames. Generate large-scale image datasets for AI, ML, and Computer Vision — entirely in your browser.**

---

## Table of Contents

- [What Is Raktabeej?](#what-is-raktabeej)
- [How It Actually Works](#how-it-actually-works)
- [Features](#features)
- [Supported Input Formats](#supported-input-formats)
- [Configuration Options](#configuration-options)
- [Output Format](#output-format)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Local Development](#local-development)
- [Deployment on Render](#deployment-on-render)
- [Design System](#design-system)
- [Use Cases](#use-cases)
- [The Legend](#the-legend)
- [Developer](#developer)
- [License](#license)

---

## What Is Raktabeej?

Raktabeej is a **browser-based video-to-image-dataset engine**. Drop in a video, configure how you want it sliced, and it produces hundreds or thousands of named, timestamped JPEG frames organised by segment — ready for annotation pipelines, computer vision training, or research.

Everything runs locally. No server. No upload. No data ever leaves the browser tab.

---

## How It Actually Works

> **Note on FFmpeg:** Despite `@ffmpeg/ffmpeg` being listed in `package.json` and the UI showing the message "Initializing FFmpeg engine…", **FFmpeg WebAssembly is not used** for frame extraction. The `loadFFmpeg`, `getFFmpegForSegment`, and `destroyFFmpeg` exports in `ffmpegService.ts` are all explicit no-op stubs kept purely for API compatibility. Frame extraction is done entirely with the browser's native **HTML5 `<video>` element and Canvas API**.

---

### Video Duration Detection (`ffmpegService.ts` → `getVideoDuration`)

1. A temporary `<video>` element is created with `preload='metadata'`.
2. The video `File` is turned into an object URL and assigned as `video.src`.
3. On the `onloadedmetadata` event, `video.duration` is read and the object URL is immediately revoked.

---

### Frame Extraction (`ffmpegService.ts` → `extractSegmentFrames`)

For each segment, a brand new `<video>` (muted, `preload='auto'`) and a `<canvas>` are created and appended to `document.body`. Then:

1. The video file is loaded via an object URL and awaited on `onloadeddata`.
2. For each frame `f` from `1` to `framesPerSegment`:
   - **Timestamp calculation** — frames are distributed evenly across the segment:
     - Single frame: captures the midpoint (`progress = 0.5`)
     - Multiple frames: `progress = (f - 1) / (framesPerSegment - 1)`, so frame 1 lands at `startTime`, the last frame lands at `endTime`
     - `timestamp = segment.startTime + progress × (segment.endTime − segment.startTime)`
   - The video element is seeked to that timestamp (`video.currentTime = timestamp`).
   - On the `seeked` event, the frame is drawn to canvas at the video's native resolution via `ctx.drawImage(video, 0, 0, canvas.width, canvas.height)`.
   - `canvas.toBlob(...)` encodes as **JPEG at 0.85 quality**.
   - The blob is converted to a blob URL and emitted via the `onFrameExtracted` callback.
   - If a frame capture fails, it is silently skipped (logged as a warning) and the loop continues.
3. After all frames in the segment are done, the object URL is revoked and both the `<video>` and `<canvas>` elements are removed from `document.body`.
4. The `AbortSignal` is checked before every frame — if aborted, the loop breaks early.

**`globalIndex`** for each frame is calculated as: `segment.index × framesPerSegment + f` (where `f` is 1-based).

---

### ZIP Input for Large Files (`zipExtractService.ts` → `extractVideoFromZip`)

The 2 GB upload limit is enforced in `useDropZone`. For larger files, upload a ZIP. The service:

1. Loads the ZIP with JSZip.
2. Scans all non-directory entries and filters them using `isVideoFile()` (checks MIME type then extension).
3. Throws an error if zero video files are found, or if more than one is found.
4. Extracts the single video as a blob, re-wraps it as a `File` with the correct MIME type from a hardcoded lookup table (`mp4`, `mov`, `avi`, `mkv`, `webm`, `mpeg`/`mpg`, `m4v` → correct MIME; anything else defaults to `video/mp4`).
5. The filename used for the `File` is only the basename (anything after the last `/` in the path).

---

### Orchestration (`useRaktabeej.ts`)

The `useRaktabeej` hook is the central state machine. It drives the app through these `ProcessingPhase` values (as actually set by the hook at runtime):

```
idle → loading → extracting → done
               ↘            ↘ (on abort → idle)
                error         error
```

> `'segmenting'` and `'zipping'` are defined in the `ProcessingPhase` type and checked in the UI's `isProcessing` / `isActive` guards, but the hook never sets them at runtime. They are placeholder phases for possible future use.

On `startExtraction`:
1. Builds an array of `SegmentInfo` objects with `status: 'pending'`, computing `endTime = Math.min((i+1) × segmentSize, videoDuration)` so the last segment clips correctly.
2. The `videoBaseName` used for filenames is the `videoInfo.name` with its extension stripped (via `replace(/\.[^/.]+$/, '')`).
3. Loops through segments **sequentially** — one at a time, never parallel.
4. For each segment, the `onFrameExtracted` callback updates the segment's frame array and the global `totalFramesExtracted` counter in real time.
5. After each segment completes, its status is set to `'done'`. If it throws, status becomes `'error'` and the loop continues to the next segment.
6. If not aborted, the final phase is `'done'` with a message of `"Extraction complete. N frames generated."`.

**Abort** calls `AbortController.abort()` and immediately resets the phase back to `'idle'`.

**Reset** aborts any running extraction, clears `videoFileRef`, and resets all state to initial values. It does **not** explicitly revoke any blob URLs — the `revokeFrameUrls` function exists in `downloadService.ts` but is exported and never called anywhere in the app.

---

## Features

- **Configurable segment duration** — presets: 500ms, 1s, 2s, 5s, 10s. Custom: any float from 0.1s up to the full video duration.
- **Configurable frames per segment** — presets: 10, 25, 50, 100. Custom: integers from 1 to 500.
- **Live extraction progress** — two progress bars (segments and frames), a dot-grid visualiser showing up to 60 segments, and a real-time frame count. Each frame card appears the moment it is extracted.
- **Grid view** — responsive thumbnail grid: 5 columns by default, 8 at `sm`, 10 at `md` breakpoints. Skeleton shimmer placeholders fill pending frame slots during active extraction.
- **Timeline view** — list layout showing each frame's thumbnail (64×36px), timestamp (`MM:SS.mmm`), and filename, with hover-reveal Preview and Download buttons.
- **Per-segment ZIP export** — downloads a ZIP named `{videoBaseName}_segment_NN.zip` containing a subfolder `segment_NN/` with that segment's frames inside it.
- **Full dataset ZIP export** — all frames stored flat under `frames/`, plus `manifest.json` at the root, named `raktabeej_dataset_{sanitizedBaseName}.zip`. Uses DEFLATE compression at level 6.
- **Manifest-only download** — downloads just the JSON file, named `raktabeej_manifest_{videoBaseName}.json` (unsanitised, extension stripped).
- **Frame lightbox** — click any thumbnail to open a full-screen modal (`max-h-[75vh]`, `object-contain`). Keyboard navigation: `←` / `→` between frames, `Escape` to close. Download button inside the modal.
- **Abort mid-extraction** — shown only while `isActive` (`loading` | `extracting` | `zipping`). Stops after the current frame and resets to `idle`.
- **Zero server dependency** — all processing is native browser APIs.

---

## Supported Input Formats

Direct upload (up to 2 GB):

| Format | MIME Type checked |
|--------|-------------------|
| MP4 | `video/mp4` |
| MOV | `video/quicktime` |
| AVI | `video/x-msvideo` |
| MKV | `video/x-matroska` |
| WEBM | `video/webm` |
| MPEG / MPG | `video/mpeg` |
| M4V | `video/x-m4v` |

> `video/MP2T` (MPEG-2 Transport Stream) is present in `SUPPORTED_VIDEO_TYPES` in `format.ts` and would pass `isVideoFile()` validation, but `.ts` is **not** listed in `SUPPORTED_EXTENSIONS`, not in the `<input accept>` attribute, and not shown in the UI badge list — so it works only if the browser supplies the correct MIME type automatically.

For files over 2 GB: wrap the video in a **ZIP archive** containing exactly one video file and upload the `.zip`.

---

## Configuration Options

### Segment Size

| Preset | Value |
|--------|-------|
| `500ms` | 0.5 s |
| `1s` | 1 s |
| `2s` *(default)* | 2 s |
| `5s` | 5 s |
| `10s` | 10 s |
| Custom | `min="0.1"`, `max=videoDuration`, `step="0.1"` |

Total segments = `Math.ceil(videoDuration / segmentSize)`.

### Frames per Segment

| Preset | Value |
|--------|-------|
| `10` | 10 frames |
| `25` | 25 frames |
| `50` *(default)* | 50 frames |
| `100` | 100 frames |
| Custom | `min="1"`, `max="500"`, `step="1"` |

Frames are distributed evenly across the segment's time range. Frame 1 always lands at `startTime` (for multi-frame segments), the last frame at `endTime`.

---

## Output Format

### File Naming

```
{sanitizedBaseName}_segment_{NN}_frame_{NNN}.jpg
```

`sanitizedBaseName` is produced by `sanitizeFilename(videoBaseName)`:
- Strips the file extension.
- Replaces any character outside `[a-zA-Z0-9._-]` with `_`.
- Collapses consecutive underscores into one.

`NN` = segment index (1-based, 2-digit zero-padded).  
`NNN` = frame index within segment (1-based, 3-digit zero-padded).

### Dataset Manifest (`manifest.json`)

Generated for both the full ZIP export and the manifest-only download:

```json
{
  "video_name": "drone_footage.mp4",
  "duration": 120.5,
  "total_segments": 60,
  "frames_per_segment": 50,
  "total_frames": 3000,
  "segment_size_seconds": 2,
  "generated_at": "2025-01-15T10:30:00.000Z",
  "segments": [
    {
      "index": 1,
      "start": 0,
      "end": 2,
      "frames": [
        "drone_footage_segment_01_frame_001.jpg",
        "..."
      ]
    }
  ]
}
```

`index` in the manifest is 1-based. `start` and `end` are in seconds. `total_frames` reflects frames actually extracted (not the configured target — some frames can be silently skipped if capture fails).

### ZIP Structures

**Per-segment ZIP** (`{videoBaseName}_segment_NN.zip`):
```
segment_01/
  video_segment_01_frame_001.jpg
  video_segment_01_frame_002.jpg
  ...
```

**Full dataset ZIP** (`raktabeej_dataset_{sanitizedBaseName}.zip`):
```
frames/
  video_segment_01_frame_001.jpg
  video_segment_01_frame_002.jpg
  ...
  video_segment_NN_frame_NNN.jpg
manifest.json
```

---

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | React (StrictMode) | 18.3.1 |
| Language | TypeScript | 5.2.2 |
| Build Tool | Vite | 5.3.1 |
| Styling | Tailwind CSS | 3.4.4 |
| Frame Extraction | HTML5 `<video>` + Canvas API | Native browser |
| ZIP Generation | JSZip | 3.10.1 |
| Icons | Lucide React | 0.395.0 |
| Fonts | Playfair Display, DM Sans, JetBrains Mono | Google Fonts |
| Deployment | Render (Static Site) | — |

> `@ffmpeg/ffmpeg` (0.12.10) and `@ffmpeg/util` (0.12.2) are in `package.json` and bundled into their own Rollup chunk, but **not used at runtime**. The `SharedArrayBuffer` / COOP / COEP headers in `vite.config.ts` and `render.yaml` are therefore not strictly required but remain in place.

---

## Project Structure

```
src/
├── main.tsx                      # React root, mounts <App> in StrictMode
├── App.tsx                       # Renders <Header> (no props) + <HomePage> in <main>
├── index.css                     # Tailwind layers, all custom component classes, keyframes
│
├── pages/
│   └── HomePage.tsx              # Full page: phase routing, gallery, lightbox state
│
├── components/
│   ├── index.ts                  # Barrel exports for all 11 components
│   ├── Header.tsx                # Top bar: SVG blood-drop logo, title, GitHub link, dev credit
│   │                             # Accepts onReset/showReset props but App.tsx calls it with no props
│   ├── UploadZone.tsx            # Drag-drop zone, format badges, 2-ring pulse on drag, error display
│   ├── ConfigPanel.tsx           # Segment + frame preset buttons; custom number inputs with constraints
│   ├── VideoInfoPanel.tsx        # Shows filename, duration, file size (not MIME type); Reset button
│   ├── ProcessingPanel.tsx       # 3-ring pulse, blood-drop SVG, two progress bars, dot grid (≤60 segs), Abort
│   ├── GalleryToolbar.tsx        # Frame count, Grid/Timeline toggle, Export ZIP button, Manifest JSON button
│   ├── SegmentAccordion.tsx      # Collapsible segment row with status icon; per-segment ZIP button (done only)
│   │                             # Auto-opens when segment.status is 'processing' or 'done'
│   ├── FrameCard.tsx             # Thumbnail with timestamp + frame index footer; hover overlay: Preview + Download
│   │                             # .new class triggers seed-expand animation (0.4s, defined in CSS, not Tailwind)
│   ├── FramePreviewModal.tsx     # Full-screen lightbox (75vh max), ←/→/Escape keyboard nav, Download
│   ├── RaktabeejLore.tsx         # Mythology section, use-case grid (9 items)
│   └── Footer.tsx                # Brand tagline, email / LinkedIn / GitHub icon links
│
├── hooks/
│   ├── useRaktabeej.ts           # State machine: file loading, segment building, sequential extraction loop
│   │                             # Phases actually used at runtime: idle, loading, extracting, done, error
│   ├── useDropZone.ts            # Drag events with ref counter; validates type + 2 GB size limit
│   └── useDownload.ts            # Progress-tracked wrappers: single frame, segment ZIP, full ZIP, manifest
│
├── services/
│   ├── ffmpegService.ts          # getVideoDuration() via <video preload='metadata'>
│   │                             # extractSegmentFrames() via hidden <video>+<canvas>, JPEG 0.85 quality
│   │                             # loadFFmpeg / getFFmpegForSegment / destroyFFmpeg → all no-ops
│   ├── downloadService.ts        # downloadSingleFrame (synthetic <a> click)
│   │                             # downloadSegmentZip (JSZip with segment_NN/ subfolder, DEFLATE level 6)
│   │                             # downloadCompleteDataset (frames/ flat + manifest.json, DEFLATE level 6)
│   │                             # downloadManifestOnly (Blob JSON download)
│   │                             # revokeFrameUrls — exported but never called anywhere in the app
│   └── zipExtractService.ts      # extractVideoFromZip: validates exactly 1 video, MIME lookup, basename only
│
├── utils/
│   └── format.ts                 # formatDuration, formatFileSize, formatTimestamp (MM:SS.mmm / H:MM:SS.mmm)
│                                 # sanitizeFilename, isVideoFile, isZipFile
│                                 # computeSegmentCount (Math.ceil), computeTotalFrames
│                                 # generateFrameFilename, clamp
│
└── types/
    └── index.ts                  # ProcessingConfig, VideoInfo, SegmentInfo, ExtractedFrame
                                  # DatasetManifest, ProcessingPhase (7 values), ProcessingState
                                  # GalleryView ('grid' | 'timeline')
                                  # SegmentSize, FramesPerSegment (exported but unused at runtime)
```

---

## Local Development

### Prerequisites

- Node.js 18+
- npm 9+

### Setup

```bash
git clone https://github.com/ArunVijaykumarcsds/raktabeej
cd raktabeej
npm install
npm run dev
```

Dev server starts at `http://localhost:5173`.

### Build

```bash
npm run build       # tsc + vite build → dist/
npm run preview     # serve dist/ locally
npm run lint        # @typescript-eslint + react-hooks + react-refresh
```

The build splits output into three Rollup chunks:

```js
manualChunks: {
  react:  ['react', 'react-dom'],
  ffmpeg: ['@ffmpeg/ffmpeg', '@ffmpeg/util'],  // bundled but unused at runtime
  jszip:  ['jszip'],
}
```

---

## Deployment on Render

The repo includes `render.yaml` for zero-config static site deployment:

```yaml
services:
  - type: web
    name: raktabeej
    env: static
    buildCommand: npm install && npm run build
    staticPublishPath: dist
    headers:
      - path: /*
        name: Cross-Origin-Opener-Policy
        value: same-origin
      - path: /*
        name: Cross-Origin-Embedder-Policy
        value: require-corp
    routes:
      - type: rewrite
        source: /*
        destination: /index.html
```

Steps: Push to GitHub → New Static Site on [Render](https://render.com) → connect repo → deploy. `render.yaml` is auto-detected.

The COOP/COEP headers are a legacy of when FFmpeg WASM was active. The SPA rewrite rule sends all paths to `index.html`.

---

## Design System

Defined in `tailwind.config.js` (custom theme tokens) and `index.css` (component classes and keyframes).

### Color Palette ("Ancient Blood Chronicle")

| Token | Key values | Purpose |
|-------|-----------|---------|
| `blood` | `600: #c81e1e` · `700: #9b1c1c` · `800: #771d1d` · `950: #3b0a0a` | Primary accent — buttons, active states, progress bars, borders |
| `charcoal` | `800: #1a1a1a` · `850: #141414` · `900: #0d0d0d` · `950: #080808` | All background surfaces |
| `copper` | `400: #cd7f32` | Developer name highlight (also `.text-copper` CSS class) |
| `parchment` | `100–900` warm scale | Available in palette, not heavily used in UI |
| `stone` | Tailwind built-in | All secondary text, borders, muted labels |

### Typography

| Token | Font | Weights loaded | Used for |
|-------|------|---------------|---------|
| `font-serif` | Playfair Display | 400, 600, 700 (+ italics) | Headings, logo, lore text, large stat numbers |
| `font-sans` | DM Sans | 300, 400, 500 | Body, labels, descriptions, buttons |
| `font-mono` | JetBrains Mono | 400, 500 | Timestamps, filenames, counters, config values |

### Custom CSS Classes (`index.css`)

| Class | Description |
|-------|-------------|
| `.rb-bg` | Fixed full-viewport element. `::before` = red radial glow (animated by `diffuse`). `::after` = Sanskrit watermark `रक्तबीज` at `clamp(120px, 20vw, 260px)`, opacity 0.03 |
| `.panel` | Card base: `bg-charcoal-850/80 border border-stone-800/50 rounded-lg backdrop-blur-sm` |
| `.btn-primary` | Blood-red filled button (`bg-blood-800`, hover `bg-blood-700`) |
| `.btn-secondary` | Dark outlined button (`bg-charcoal-850`, stone border) |
| `.cfg-btn` | Compact config preset toggle; `.active` variant uses `border-blood-600 bg-blood-950/60` |
| `.frame-card` | Thumbnail card with `border-stone-800/60`, hover lift (`translateY(-2px)`) and border highlight; `.new` variant triggers `seed-expand` |
| `.skeleton` | Shimmer placeholder for pending frames during extraction |
| `.ornament` | Decorative horizontal rule with centred text, blood-coloured lines |
| `.section-title` | `font-serif font-semibold` with `letter-spacing: 0.08em` |
| `.text-blood-accent` | `text-blood-500` + red text-shadow glow |
| `.text-copper` / `.border-copper` | Exact copper colour `#cd7f32` |
| `.ring-pulse` | Expanding ring circle (absolute positioned, `border: 1px solid rgba(155,28,28,0.5)`, `ring-expand` keyframe). Used in UploadZone (2 rings on drag), ProcessingPanel (3 rings during active), Header logo (1 ring, only when `showReset` is true — which App.tsx never passes) |
| `.progress-pulse` | Alias for `pulse-blood` animation — defined but not visibly used in current components |

### Keyframe Animations

| Name | Effect | Duration |
|------|--------|----------|
| `pulse-blood` | Opacity 1↔0.7 + scale 1↔1.04 | 2s infinite |
| `seed-expand` | Scale 0.4→1.03→1.0, opacity 0→1 | **0.4s** (CSS class) / 1.5s (Tailwind `animate-seed-expand` — Tailwind version not used on `.frame-card.new`) |
| `diffuse` | Opacity 0.6↔1.0 on `.rb-bg::before` | 8s infinite |
| `shimmer` | Background-position sweep on `.skeleton` | 1.8s infinite |
| `ring-expand` | Scale 1→2.5, opacity 0.6→0 on `.ring-pulse` | 2s infinite |

---

## Use Cases

Datasets generated by Raktabeej are used for (as listed in `RaktabeejLore.tsx`):

Computer Vision Training · Object Detection · SAR Image Analysis · Remote Sensing · Surveillance Analytics · Temporal Sequence Learning · Scene Understanding · Anomaly Detection · Research & Academia

---

## The Legend

Raktabeej (रक्तबीज) — Sanskrit for *"blood-seed"* — is a general from the *Devi Mahatmya* (Markandeya Purana). He possessed a boon from Brahma: every drop of his blood touching the earth instantly created a new warrior of equal strength. This made him impossible to defeat through ordinary combat — every wound only multiplied him.

The goddess Kali resolved the paradox by consuming every drop before it could reach the earth, cutting off the multiplication at its source.

This project harnesses that multiplication deliberately. One video seeds the engine; the engine propagates it into hundreds or thousands of structured, named frames — each carrying its lineage in its filename: which video, which segment, which position.

> *"As each drop of blood fell from Raktabeej's body, another Raktabeej equal in valour and prowess arose. The gods were filled with great fear at this sight."*  
> — Devi Mahatmya, Markandeya Purana

The account of Raktabeej presented here is drawn from the *Devi Mahatmya* as the cultural and philosophical inspiration behind the project's name. It is not intended as a theological or academic claim.

---

## Developer

**Arun VK**  
[arunvk.tech@gmail.com](mailto:arunvk.tech@gmail.com)  
[LinkedIn](https://www.linkedin.com/in/arunvk2004/) · [GitHub](https://github.com/ArunVijaykumarcsds)

---

## License

MIT — free to use, modify, and distribute.
