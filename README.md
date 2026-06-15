<!--
═══════════════════════════════════════════════════════════════════════════════
  RAKTABEEJ — DATASET GENERATION ENGINE
  Flagship README · Ancient Blood Chronicle Edition
═══════════════════════════════════════════════════════════════════════════════
-->

<div align="center">

<!--
┌─────────────────────────────────────────────────────────────────────────────┐
│  HERO BANNER — INSERT BEFORE PUBLISHING                                      │
│                                                                              │
│  Recommended dimensions : 1280 × 400 px                                     │
│  Visual concept                                                              │
│    · Matte charcoal background  (#0d0d0d)                                    │
│    · Aged parchment texture overlay  (opacity ~0.08)                         │
│    · Centred Sanskrit glyph रक्तबीज at ~180 px, opacity 0.12               │
│    · Below glyph: "RAKTABEEJ" in serif letterpress, copper tone (#cd7f32)    │
│    · Tagline beneath: "Dataset Generation Engine"                            │
│    · No gradients · No glow · No neon · Matte only                          │
│                                                                              │
│  Replace this block with:                                                    │
│  <img src="assets/banner.png" width="1280" alt="Raktabeej Banner" />        │
└─────────────────────────────────────────────────────────────────────────────┘
-->

# RAKTABEEJ

### रक्तबीज · Dataset Generation Engine

## 🌐 Live Demo
👉 [Click here to view the live project](https://raktabeej-5mbx.onrender.com/)

*One video. Countless frames. Structured lineage — entirely in your browser.*

<br>

![React](https://img.shields.io/badge/React-18.3-20232A?style=flat-square&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-5.2-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5.3-646CFF?style=flat-square&logo=vite&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind-3.4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)
![Deployed on Render](https://img.shields.io/badge/Deployed-Render-46E3B7?style=flat-square&logo=render&logoColor=white)
![Browser Only](https://img.shields.io/badge/Runs-Browser%20Only-8B6914?style=flat-square)
![Zero Backend](https://img.shields.io/badge/Backend-None-5C3D2E?style=flat-square)
![License](https://img.shields.io/badge/License-MIT-6B6B6B?style=flat-square)

<br>

---

*"As each drop of Raktabeej's blood fell, another arose equal in power."*
<br>— Devi Mahatmya, Markandeya Purana

---

**[🩸 Try it live →](https://raktabeej-5mbx.onrender.com)**

</div>

<br>

## Contents

<div align="center">

| § | Section | § | Section |
|:---:|---------|:---:|---------|
| [01](#01--what-is-raktabeej) | What Is Raktabeej? | [10](#10--tech-stack) | Tech Stack |
| [02](#02--screenshots) | Screenshots | [11](#11--project-structure) | Project Structure |
| [03](#03--the-bloodline--pipeline-overview) | The Bloodline — Pipeline Overview | [12](#12--local-development) | Local Development |
| [04](#04--the-multiplication--scale) | The Multiplication — Scale | [13](#13--deployment-on-render) | Deployment on Render |
| [05](#05--how-it-actually-works) | How It Actually Works | [14](#14--design-system) | Design System |
| [06](#06--features) | Features | [15](#15--use-cases) | Use Cases |
| [07](#07--supported-formats) | Supported Formats | [16](#16--the-legend) | The Legend |
| [08](#08--configuration-options) | Configuration Options | [17](#17--future-vision--raktabeej-ai) | Future Vision — Raktabeej AI |
| [09](#09--output-format) | Output Format | [18](#18--developer) | Developer |

</div>

<br>

---

<br>

<!--
═══════════════════════════════════════════════════════════════════════════════
  01 · WHAT IS RAKTABEEJ
═══════════════════════════════════════════════════════════════════════════════
-->

## 01 · What Is Raktabeej?

Raktabeej is a **browser-based video-to-image-dataset engine**. Drop in a video, configure how you want it sliced, and it produces hundreds or thousands of named, timestamped JPEG frames organised by segment — ready for annotation pipelines, computer vision training, or research.

Everything runs locally. No server. No upload. No data ever leaves the browser tab.

<br>

> **Core Lineage Concept**
>
> ```
> One Source  ──►  Segments  ──►  Frames  ──►  Manifest  ──►  Dataset
> (Video)          (Slices)       (JPEGs)       (JSON)         (Archive)
> ```
>
> Each frame carries its lineage in its filename.
> Each filename encodes its ancestry.
> Nothing is anonymous. Everything is traceable.

<br>

---

<br>

<!--
═══════════════════════════════════════════════════════════════════════════════
  02 · SCREENSHOTS
═══════════════════════════════════════════════════════════════════════════════
-->

## 02 · Screenshots

<br>

> **To display screenshots on GitHub:** save your UI captures to `assets/screenshots/` and replace the placeholder paths below. Recommended tool: browser full-page screenshot or `playwright screenshot`.

<br>

**Upload Zone** — Drag-drop interface with format badges, pulse animation on drag-over

<!--
┌──────────────────────────────────────────────────────────────────────────────┐
│  Replace with:                                                               │
│  <img src="assets/screenshots/01-upload.png"                                 │
│       width="900" alt="Raktabeej — Upload Zone" />                          │
└──────────────────────────────────────────────────────────────────────────────┘
-->

<br>

**Configuration Panel** — Segment size presets + frames-per-segment presets with live extraction summary

<!--
┌──────────────────────────────────────────────────────────────────────────────┐
│  Replace with:                                                               │
│  <img src="assets/screenshots/02-config.png"                                 │
│       width="900" alt="Raktabeej — Configuration Panel" />                  │
└──────────────────────────────────────────────────────────────────────────────┘
-->

<br>

**Processing Panel** — Blood-drop SVG, 3-ring pulse, dual progress bars, dot-grid segment visualiser

<!--
┌──────────────────────────────────────────────────────────────────────────────┐
│  Replace with:                                                               │
│  <img src="assets/screenshots/03-processing.png"                             │
│       width="900" alt="Raktabeej — Processing Panel" />                     │
└──────────────────────────────────────────────────────────────────────────────┘
-->

<br>

**Live Frame Gallery** — Real-time thumbnail grid with per-segment accordion, ZIP and manifest export controls

<!--
┌──────────────────────────────────────────────────────────────────────────────┐
│  Replace with:                                                               │
│  <img src="assets/screenshots/04-gallery.png"                                │
│       width="900" alt="Raktabeej — Live Frame Gallery" />                   │
└──────────────────────────────────────────────────────────────────────────────┘
-->

<br>

| Screen | Description | Suggested dimensions |
|--------|-------------|:--------------------:|
| Upload Zone | Drop zone · format badges · 2-ring pulse on drag | 900 × 500 |
| Configuration Panel | Segment + frame presets · live segment count | 900 × 500 |
| Processing Panel | 3-ring pulse · dual bars · dot-grid visualiser | 900 × 500 |
| Live Frame Gallery | Accordion segments · grid thumbnails · export toolbar | 900 × 700 |

<br>

---

<br>

<!--
═══════════════════════════════════════════════════════════════════════════════
  03 · THE BLOODLINE — PIPELINE OVERVIEW
═══════════════════════════════════════════════════════════════════════════════
-->

## 03 · The Bloodline — Pipeline Overview

> *In myth, one drop of blood became an army. In engineering, one video becomes a dataset.*

<br>

```mermaid
flowchart TD
    A([Video File — MP4 MOV AVI MKV WEBM MPEG M4V]) --> B

    B{File Size} -->|≤ 2 GB — Direct Upload| C
    B -->|> 2 GB — ZIP Archive| Z[ZIP Extract Service\nextractVideoFromZip]
    Z --> C

    C[Duration Detection\nHTML5 video preload=metadata\nonloadedmetadata → video.duration] --> D

    D[Configuration\nSegment Size · Frames per Segment] --> E

    E[Segment Builder\nMath.ceil duration ÷ segmentSize\nendTime clamped to duration] --> F

    F[[Sequential Extraction Loop\nOne segment at a time]] --> G

    G[Hidden video + canvas\nappended to document.body] --> H

    H[Seek to timestamp\nvideo.currentTime = ts\nAwait seeked event] --> I

    I[Canvas Capture\nctx.drawImage at native resolution\ntoBlob — JPEG · quality 0.85] --> J

    J[Blob URL\nURL.createObjectURL] --> K

    K[onFrameExtracted callback\nReal-time gallery update] --> L{More frames\nin segment?}

    L -->|Yes| H
    L -->|No| M[Cleanup\nrevokeObjectURL\nremoveChild video + canvas]

    M --> N{More\nsegments?}
    N -->|Yes| F
    N -->|No| O

    O([Dataset Complete\nAll frames as Blob URLs in memory]) --> P

    P{Export} -->|Full ZIP| Q[downloadCompleteDataset\nframes/ flat + manifest.json\nDEFLATE level 6]
    P -->|Segment ZIP| R[downloadSegmentZip\nsegment subfolder\nDEFLATE level 6]
    P -->|Manifest only| S[downloadManifestOnly\nraktabeej_manifest_*.json]
    P -->|Single frame| T[downloadSingleFrame\nSynthetic anchor click]
```

<br>

---

<br>

<!--
═══════════════════════════════════════════════════════════════════════════════
  04 · THE MULTIPLICATION — SCALE
═══════════════════════════════════════════════════════════════════════════════
-->

## 04 · The Multiplication — Scale

> *Every seed equal in strength to the source.*

<br>

### Lineage at Scale

```
1 Video (120 seconds)
│
├─── Segment Size: 2s
│    └─── 60 Segments generated
│
├─── Frames per Segment: 50
│    └─── 3,000 Frames extracted
│
├─── Each frame:
│    ├─── Named:        drone_footage_segment_01_frame_001.jpg
│    ├─── Timestamped:  00:00.000 → 02:00.000
│    └─── Encoded:      JPEG · 0.85 quality · native resolution
│
└─── Output:
     ├─── frames/             (3,000 JPEG files)
     ├─── manifest.json       (machine-readable lineage)
     └─── raktabeej_dataset_drone_footage.zip
```

<br>

### Scale Reference Table

| Video Duration | Segment Size | Segments | Frames/Seg | Total Frames |
|:--------------:|:------------:|:--------:|:----------:|:------------:|
| 30 s | 2 s | 15 | 50 | 750 |
| 60 s | 2 s | 30 | 50 | 1,500 |
| 120 s | 2 s | 60 | 50 | **3,000** |
| 120 s | 1 s | 120 | 50 | **6,000** |
| 300 s | 2 s | 150 | 100 | **15,000** |

<br>

---

<br>

<!--
═══════════════════════════════════════════════════════════════════════════════
  05 · HOW IT ACTUALLY WORKS
═══════════════════════════════════════════════════════════════════════════════
-->

## 05 · How It Actually Works

> **⚠ Implementation Note on FFmpeg**
>
> Despite `@ffmpeg/ffmpeg` being listed in `package.json` and the UI briefly showing *"Initializing FFmpeg engine…"*, **FFmpeg WebAssembly is not used** for frame extraction. The `loadFFmpeg`, `getFFmpegForSegment`, and `destroyFFmpeg` exports in `ffmpegService.ts` are explicit no-op stubs kept for API compatibility only. Frame extraction runs entirely on the browser's native **HTML5 `<video>` element and Canvas API**.

<br>

---

### Video Duration Detection · `ffmpegService.ts → getVideoDuration`

1. A temporary `<video>` element is created with `preload='metadata'`.
2. The video `File` is converted to an object URL and assigned as `video.src`.
3. On `onloadedmetadata`, `video.duration` is read and the object URL immediately revoked.

<br>

---

### Frame Extraction · `ffmpegService.ts → extractSegmentFrames`

For each segment, a fresh `<video>` (muted, `preload='auto'`) and `<canvas>` are created and appended to `document.body`. Then:

1. The video file is loaded via an object URL and awaited on `onloadeddata`.
2. For each frame `f` from `1` to `framesPerSegment`:
   - **Timestamp calculation** — frames distributed evenly across the segment:
     - Single frame → midpoint (`progress = 0.5`)
     - Multiple frames → `progress = (f - 1) / (framesPerSegment - 1)`, so frame 1 lands at `startTime`, last frame at `endTime`
     - `timestamp = segment.startTime + progress × (segment.endTime − segment.startTime)`
   - `video.currentTime = timestamp` — seek to that moment.
   - On `seeked` event, the frame is painted to canvas at native resolution via `ctx.drawImage`.
   - `canvas.toBlob(...)` encodes as **JPEG at 0.85 quality**.
   - Blob → object URL → emitted via `onFrameExtracted` callback for real-time gallery update.
   - Failed frame captures are silently skipped (warned to console) — the loop continues.
3. After all frames in the segment complete: object URL revoked, `<video>` and `<canvas>` removed from DOM.
4. `AbortSignal` is checked before every frame — abort exits the loop immediately.

**`globalIndex`** per frame: `segment.index × framesPerSegment + f` (1-based `f`).

<br>

---

### ZIP Input for Large Files · `zipExtractService.ts → extractVideoFromZip`

1. JSZip loads the archive in-memory.
2. All non-directory entries are filtered via `isVideoFile()` (checks MIME type then extension).
3. Throws if zero or more than one video file is found.
4. Extracts the single video as a `Blob`, re-wraps as a `File` with correct MIME type from a hardcoded lookup (`mp4`, `mov`, `avi`, `mkv`, `webm`, `mpeg`/`mpg`, `m4v` → correct MIME; anything else defaults to `video/mp4`).
5. Only the basename (after last `/`) is used as the `File` name.

<br>

---

### Orchestration · `useRaktabeej.ts`

The `useRaktabeej` hook is the central state machine. Runtime phase transitions:

```
idle → loading → extracting → done
               ↘            ↘ (on abort → idle)
                error         error
```

> **Note:** `'segmenting'` and `'zipping'` are defined in `ProcessingPhase` and checked by UI guards (`isProcessing` / `isActive`), but the hook never sets them at runtime. They are reserved for future use.

On `startExtraction`:
1. Builds `SegmentInfo[]` with `status: 'pending'`, computing `endTime = Math.min((i+1) × segmentSize, videoDuration)` to clip the last segment correctly.
2. `videoBaseName` is `videoInfo.name` with extension stripped via `replace(/\.[^/.]+$/, '')`.
3. Loops through segments **sequentially** — one at a time, never in parallel.
4. `onFrameExtracted` callback updates the segment frame array and `totalFramesExtracted` counter in real time.
5. After each segment completes, its `status` becomes `'done'`. On throw, `'error'` — loop continues to next segment.
6. Final phase: `'done'` with message `"Extraction complete. N frames generated."`.

**Abort** — calls `AbortController.abort()`, immediately resets phase to `'idle'`.

**Reset** — aborts any running extraction, clears `videoFileRef`, resets all state. Does **not** call `revokeFrameUrls` — that function exists in `downloadService.ts` but is never called anywhere in the app.

<br>

---

### Data Flow — Frame Extraction

```mermaid
sequenceDiagram
    participant UI as HomePage
    participant Hook as useRaktabeej
    participant Svc as ffmpegService
    participant DOM as document.body

    UI->>Hook: startExtraction()
    Hook->>Hook: Build SegmentInfo[]
    loop For each segment
        Hook->>Svc: extractSegmentFrames(stub, file, baseName, segment, config, cb, signal)
        Svc->>DOM: createElement video + canvas, appendChild
        Svc->>DOM: video.src = objectURL, video.load()
        DOM-->>Svc: onloadeddata
        loop For each frame f
            Svc->>DOM: video.currentTime = timestamp
            DOM-->>Svc: seeked event
            Svc->>DOM: ctx.drawImage(video, 0, 0, w, h)
            Svc->>DOM: canvas.toBlob — JPEG 0.85
            DOM-->>Svc: Blob
            Svc->>Svc: URL.createObjectURL(blob)
            Svc-->>Hook: onFrameExtracted(frame)
            Hook-->>UI: setSegments() — real-time update
        end
        Svc->>DOM: revokeObjectURL · removeChild video + canvas
        Svc-->>Hook: ExtractedFrame[]
        Hook->>Hook: segment.status = 'done'
    end
    Hook-->>UI: phase = 'done'
```

<br>

---

<br>

<!--
═══════════════════════════════════════════════════════════════════════════════
  06 · FEATURES
═══════════════════════════════════════════════════════════════════════════════
-->

## 06 · Features

| Feature | Detail |
|---------|--------|
| **Configurable segment duration** | Presets: 500ms, 1s, 2s, 5s, 10s · Custom: `min 0.1s` → full video duration |
| **Configurable frames per segment** | Presets: 10, 25, 50, 100 · Custom: integers 1–500 |
| **Live extraction progress** | Two progress bars (segments + frames), dot-grid visualiser (≤60 segs), real-time frame counter |
| **Grid view** | 5 columns → 8 at `sm` → 10 at `md`. Skeleton shimmer placeholders for pending frames |
| **Timeline view** | List layout: 64×36px thumbnail · timestamp `MM:SS.mmm` · filename · hover-reveal Preview + Download |
| **Per-segment ZIP export** | `{videoBaseName}_segment_NN.zip` containing `segment_NN/` subfolder with frames |
| **Full dataset ZIP export** | `raktabeej_dataset_{sanitizedName}.zip` · `frames/` flat + `manifest.json` · DEFLATE level 6 |
| **Manifest-only download** | `raktabeej_manifest_{videoBaseName}.json` — metadata JSON, no images |
| **Frame lightbox** | Full-screen modal, `max-h-[75vh]` object-contain · `←` `→` `Escape` keyboard nav · Download |
| **Abort mid-extraction** | `AbortController` signal checked before every frame. Resets to `idle`. |
| **Large file support** | Up to 2 GB direct upload · ZIP archive for larger files |
| **Zero server dependency** | All processing via native browser HTML5 Video + Canvas API |

<br>

---

<br>

<!--
═══════════════════════════════════════════════════════════════════════════════
  07 · SUPPORTED FORMATS
═══════════════════════════════════════════════════════════════════════════════
-->

## 07 · Supported Formats

**Direct upload — up to 2 GB:**

| Format | MIME Type |
|--------|-----------|
| MP4 | `video/mp4` |
| MOV | `video/quicktime` |
| AVI | `video/x-msvideo` |
| MKV | `video/x-matroska` |
| WEBM | `video/webm` |
| MPEG / MPG | `video/mpeg` |
| M4V | `video/x-m4v` |

> **Note on `video/MP2T`:** Present in `SUPPORTED_VIDEO_TYPES` in `format.ts` and passes `isVideoFile()` validation — but `.ts` is not in `SUPPORTED_EXTENSIONS`, not in the `<input accept>` attribute, and not shown in the UI badge list. It works only if the browser supplies the correct MIME type automatically.

**For files over 2 GB:** Wrap in a **ZIP archive** containing exactly one video file and upload the `.zip`.

<br>

---

<br>

<!--
═══════════════════════════════════════════════════════════════════════════════
  08 · CONFIGURATION OPTIONS
═══════════════════════════════════════════════════════════════════════════════
-->

## 08 · Configuration Options

### Segment Size

| Preset | Value | Behaviour |
|--------|-------|-----------|
| `500ms` | 0.5 s | Very fine-grained |
| `1s` | 1 s | Fine |
| `2s` | 2 s | **Default** |
| `5s` | 5 s | Medium |
| `10s` | 10 s | Coarse |
| Custom | `min="0.1"` · `max=videoDuration` · `step="0.1"` | Any positive float |

Total segments = `Math.ceil(videoDuration / segmentSize)`.

<br>

### Frames per Segment

| Preset | Value | Behaviour |
|--------|-------|-----------|
| `10` | 10 frames | Sparse |
| `25` | 25 frames | Light |
| `50` | 50 frames | **Default** |
| `100` | 100 frames | Dense |
| Custom | `min="1"` · `max="500"` · `step="1"` | Integer only |

Frames are distributed evenly across the segment's time range. Frame 1 lands at `startTime`, last frame at `endTime` (for multi-frame segments).

### Recommended Density by Use Case

| Use Case | Frames/Segment | Why |
|----------|:--------------:|-----|
| Object detection | 10–15 | Sparse coverage sufficient; annotation is the bottleneck |
| Action recognition | 25 | Captures motion without redundancy |
| Optical flow | 50 | Dense consecutive frames needed |
| Full frame-rate coverage | 50 at 2s | Matches 25fps video rate |

<br>

---

<br>

<!--
═══════════════════════════════════════════════════════════════════════════════
  09 · OUTPUT FORMAT
═══════════════════════════════════════════════════════════════════════════════
-->

## 09 · Output Format

### File Naming Convention

```
{sanitizedBaseName}_segment_{NN}_frame_{NNN}.jpg
```

`sanitizedBaseName` is produced by `sanitizeFilename(videoBaseName)`:
- Strips the file extension.
- Replaces any character outside `[a-zA-Z0-9._-]` with `_`.
- Collapses consecutive underscores into one.

`NN` = segment index — 1-based, 2-digit zero-padded.
`NNN` = frame index within segment — 1-based, 3-digit zero-padded.

**Example:**
```
drone footage 2024.mp4  →  drone_footage_2024_segment_01_frame_001.jpg
                            drone_footage_2024_segment_01_frame_002.jpg
                            drone_footage_2024_segment_02_frame_001.jpg
```

**Ancestry encoded in every filename:**
```
{video}  →  _segment_{NN}  →  _frame_{NNN}.jpg
 Origin       Generation         Descendant
```

Zero-padding guarantees correct sort order in file browsers, Python `glob()`, and ML dataset loaders.

<br>

---

### Dataset Manifest (`manifest.json`)

Generated for full ZIP export and manifest-only download:

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
        "drone_footage_segment_01_frame_002.jpg"
      ]
    }
  ]
}
```

> **Note:** `index` is 1-based. `start`/`end` are in seconds. `total_frames` reflects frames actually extracted — silently skipped frames (canvas failures) are not counted.

<br>

---

### ZIP Structures

**Per-segment ZIP** — `{videoBaseName}_segment_NN.zip`:

```
segment_01/
  video_segment_01_frame_001.jpg
  video_segment_01_frame_002.jpg
  ...
```

**Full dataset ZIP** — `raktabeej_dataset_{sanitizedBaseName}.zip`:

```
frames/
  video_segment_01_frame_001.jpg
  video_segment_01_frame_002.jpg
  ...
  video_segment_NN_frame_NNN.jpg
manifest.json
```

<br>

---

### Using the Manifest — PyTorch Example

```python
import json, glob

with open('dataset/manifest.json') as f:
    manifest = json.load(f)

# Correct order guaranteed by zero-padded filenames
all_frames = []
for seg in manifest['segments']:
    all_frames.extend(seg['frames'])

# Load into PyTorch ImageFolder or a custom Dataset
print(f"{manifest['total_frames']} frames across {manifest['total_segments']} segments")
print(f"Segment duration: {manifest['segment_size_seconds']}s")
```

<br>

---

<br>

<!--
═══════════════════════════════════════════════════════════════════════════════
  10 · TECH STACK
═══════════════════════════════════════════════════════════════════════════════
-->

## 10 · Tech Stack

| Layer | Technology | Version | Notes |
|-------|-----------|---------|-------|
| Framework | React (StrictMode) | 18.3.1 | |
| Language | TypeScript | 5.2.2 | |
| Build Tool | Vite | 5.3.1 | Manual Rollup chunking |
| Styling | Tailwind CSS | 3.4.4 | Custom "Ancient Blood Chronicle" theme |
| Frame Extraction | HTML5 `<video>` + Canvas API | Native browser | Zero npm packages in critical path |
| ZIP Generation | JSZip | 3.10.1 | DEFLATE level 6 for all ZIPs |
| Icons | Lucide React | 0.395.0 | |
| Fonts | Playfair Display · DM Sans · JetBrains Mono | — | Google Fonts |
| Deployment | Render (Static Site) | — | `render.yaml` zero-config |

> **On `@ffmpeg/ffmpeg` (0.12.10) and `@ffmpeg/util` (0.12.2):** Both are in `package.json` and bundled into their own Rollup chunk — but **not used at runtime**. The `SharedArrayBuffer` / COOP / COEP headers in `vite.config.ts` and `render.yaml` are therefore not strictly required but are kept as legacy configuration.

<br>

---

<br>

<!--
═══════════════════════════════════════════════════════════════════════════════
  11 · PROJECT STRUCTURE
═══════════════════════════════════════════════════════════════════════════════
-->

## 11 · Project Structure

```
src/
├── main.tsx                      # React root, mounts <App> in StrictMode
├── App.tsx                       # Renders <Header> + <HomePage> in <main>
├── index.css                     # Tailwind layers, all custom component classes, keyframes
│
├── pages/
│   └── HomePage.tsx              # Full page: phase routing, gallery, lightbox state
│
├── components/
│   ├── index.ts                  # Barrel exports for all 11 components
│   ├── Header.tsx                # Top bar: SVG blood-drop logo, title, GitHub link, dev credit
│   ├── UploadZone.tsx            # Drag-drop zone, format badges, 2-ring pulse on drag, error display
│   ├── ConfigPanel.tsx           # Segment + frame preset buttons; custom number inputs with constraints
│   ├── VideoInfoPanel.tsx        # Shows filename, duration, file size; Reset button
│   ├── ProcessingPanel.tsx       # 3-ring pulse, blood-drop SVG, dual progress bars, dot grid, Abort
│   ├── GalleryToolbar.tsx        # Frame count, Grid/Timeline toggle, Export ZIP, Manifest JSON
│   ├── SegmentAccordion.tsx      # Collapsible segment row; auto-opens on 'processing' or 'done'
│   ├── FrameCard.tsx             # Thumbnail: timestamp + frame index footer; hover: Preview + Download
│   │                             # .new class triggers seed-expand animation (0.4s CSS)
│   ├── FramePreviewModal.tsx     # Full-screen lightbox (75vh max), ←/→/Escape, Download
│   ├── RaktabeejLore.tsx         # Mythology section, 9-item use-case grid
│   └── Footer.tsx                # Brand tagline, email / LinkedIn / GitHub icon links
│
├── hooks/
│   ├── useRaktabeej.ts           # State machine: file loading, segment building, sequential extraction
│   │                             # Runtime phases: idle · loading · extracting · done · error
│   ├── useDropZone.ts            # Drag events with ref counter; validates type + 2 GB size limit
│   └── useDownload.ts            # Progress-tracked wrappers: single frame · segment ZIP · full ZIP · manifest
│
├── services/
│   ├── ffmpegService.ts          # getVideoDuration() via <video preload='metadata'>
│   │                             # extractSegmentFrames() via hidden <video>+<canvas>, JPEG 0.85
│   │                             # loadFFmpeg / getFFmpegForSegment / destroyFFmpeg → no-op stubs
│   ├── downloadService.ts        # downloadSingleFrame · downloadSegmentZip · downloadCompleteDataset
│   │                             # downloadManifestOnly · revokeFrameUrls (exported, never called)
│   └── zipExtractService.ts      # extractVideoFromZip: validates exactly 1 video, MIME lookup, basename
│
├── utils/
│   └── format.ts                 # formatDuration · formatFileSize · formatTimestamp (MM:SS.mmm)
│                                 # sanitizeFilename · isVideoFile · isZipFile
│                                 # computeSegmentCount · computeTotalFrames
│                                 # generateFrameFilename · clamp
│
└── types/
    └── index.ts                  # ProcessingConfig · VideoInfo · SegmentInfo · ExtractedFrame
                                  # DatasetManifest · ProcessingPhase (7 values) · ProcessingState
                                  # GalleryView ('grid' | 'timeline')
```

<br>

---

<br>

<!--
═══════════════════════════════════════════════════════════════════════════════
  12 · LOCAL DEVELOPMENT
═══════════════════════════════════════════════════════════════════════════════
-->

## 12 · Local Development

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

Dev server starts at `http://localhost:5173`. `Cross-Origin-Opener-Policy` and `Cross-Origin-Embedder-Policy` headers are applied automatically by `vite.config.ts`.

### Scripts

| Script | Command | Description |
|--------|---------|-------------|
| Dev server | `npm run dev` | Vite HMR dev server at :5173 |
| Build | `npm run build` | `tsc` + `vite build` → `dist/` |
| Preview | `npm run preview` | Serve `dist/` locally |
| Lint | `npm run lint` | `@typescript-eslint` · zero warnings |

### Rollup Chunks

The build splits output into three browser-cached chunks:

```js
manualChunks: {
  react:  ['react', 'react-dom'],
  ffmpeg: ['@ffmpeg/ffmpeg', '@ffmpeg/util'],  // bundled but unused at runtime
  jszip:  ['jszip'],
}
```

<br>

---

<br>

<!--
═══════════════════════════════════════════════════════════════════════════════
  13 · DEPLOYMENT ON RENDER
═══════════════════════════════════════════════════════════════════════════════
-->

## 13 · Deployment on Render

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

**Steps:** Push to GitHub → New Static Site on [Render](https://render.com) → Connect repo → Deploy. `render.yaml` is auto-detected — no manual configuration required.

> COOP/COEP headers are a legacy of the original FFmpeg WASM architecture. The SPA rewrite sends all paths to `index.html` for client-side routing. No cold starts. No backend cost.

<br>

---

<br>

<!--
═══════════════════════════════════════════════════════════════════════════════
  14 · DESIGN SYSTEM
═══════════════════════════════════════════════════════════════════════════════
-->

## 14 · Design System

Defined in `tailwind.config.js` (custom theme tokens) and `index.css` (component classes and keyframes).

### Color Palette — "Ancient Blood Chronicle"

| Token | Key Values | Purpose |
|-------|-----------|---------|
| `blood` | `600: #c81e1e` · `700: #9b1c1c` · `800: #771d1d` · `950: #3b0a0a` | Primary accent — buttons, active states, progress bars, borders |
| `charcoal` | `800: #1a1a1a` · `850: #141414` · `900: #0d0d0d` · `950: #080808` | All background surfaces |
| `copper` | `400: #cd7f32` | Developer name highlight; `.text-copper` CSS class |
| `parchment` | `100–900` warm scale | Available in palette, sparsely used in UI |
| `stone` | Tailwind built-in | Secondary text, borders, muted labels |

### Typography

| Token | Font | Weights | Used for |
|-------|------|---------|---------|
| `font-serif` | Playfair Display | 400, 600, 700 (+ italics) | Headings, logo, lore text, large stat numbers |
| `font-sans` | DM Sans | 300, 400, 500 | Body, labels, descriptions, buttons |
| `font-mono` | JetBrains Mono | 400, 500 | Timestamps, filenames, counters, config values |

### Key CSS Classes

| Class | Description |
|-------|-------------|
| `.rb-bg` | Fixed full-viewport background. `::before` = red radial glow (animated, 8s). `::after` = Sanskrit watermark `रक्तबीज` at `clamp(120px, 20vw, 260px)`, opacity 0.03 |
| `.panel` | Card base: `bg-charcoal-850/80 border border-stone-800/50 rounded-lg backdrop-blur-sm` |
| `.btn-primary` | Blood-red filled button (`bg-blood-800`, hover `bg-blood-700`) |
| `.btn-secondary` | Dark outlined button (`bg-charcoal-850`, stone border) |
| `.cfg-btn` | Config preset toggle. `.active`: `border-blood-600 bg-blood-950/60` |
| `.frame-card` | Thumbnail card with hover lift (`translateY(-2px)`). `.new` triggers `seed-expand` |
| `.skeleton` | Shimmer placeholder for pending frames during extraction |
| `.ring-pulse` | Expanding ring: `border: 1px solid rgba(155,28,28,0.5)`, `ring-expand` keyframe, 2s infinite |

### Keyframe Animations

| Name | Effect | Duration |
|------|--------|----------|
| `pulse-blood` | Opacity 1↔0.7 + scale 1↔1.04 | 2s infinite |
| `seed-expand` | Scale 0.4→1.03→1.0, opacity 0→1 — `.frame-card.new` via CSS at **0.4s** | 0.4s |
| `diffuse` | Opacity 0.6↔1.0 on `.rb-bg::before` | **8s** infinite (CSS overrides Tailwind config's 3s) |
| `shimmer` | Background-position sweep on `.skeleton` | 1.8s infinite |
| `ring-expand` | Scale 1→2.5, opacity 0.6→0 on `.ring-pulse` | 2s infinite |

<br>

---

<br>

<!--
═══════════════════════════════════════════════════════════════════════════════
  15 · USE CASES
═══════════════════════════════════════════════════════════════════════════════
-->

## 15 · Use Cases

> *Datasets generated by Raktabeej serve as structured input to downstream research and production pipelines.*

<br>

| Domain | Application |
|--------|-------------|
| Computer Vision | Training image classifiers and feature extractors |
| Object Detection | Frame sequences for bounding-box annotation (Roboflow, CVAT, LabelStudio) |
| Action Recognition | Dense frames from sports or gesture videos for VideoMAE, SlowFast |
| Medical Imaging | Frames from endoscopy or surgical video — fully offline, nothing leaves the device |
| Remote Sensing | Aerial and satellite video frame extraction |
| Content Moderation | Frame sampling from uploads → classifier pipeline, no server required |
| Optical Flow | Consecutive frames from the same segment for flow estimation training |
| Anomaly Detection | Generating labelled normal/anomaly frame sets from CCTV or sensor footage |
| Research & Academia | Reproducible dataset generation with machine-readable manifest for publications |

<br>

---

<br>

<!--
═══════════════════════════════════════════════════════════════════════════════
  16 · THE LEGEND
═══════════════════════════════════════════════════════════════════════════════
-->

## 16 · The Legend

### Who Was Raktabeej?

Raktabeej (रक्तबीज) — Sanskrit for *"blood-seed"* or *"he whose seeds are drops of blood"* — is a general from the *Devi Mahatmya* (Markandeya Purana). He possessed a boon from Brahma: every drop of his blood touching the earth instantly created a new warrior of equal strength. This made him impossible to defeat — every wound only multiplied him.

The goddess Kali resolved the paradox by consuming every drop before it could reach the earth, cutting the multiplication off at its source.

> *"As each drop of blood fell from Raktabeej's body, another Raktabeej equal in valour and prowess arose. The gods were filled with great fear at this sight."*
> — Devi Mahatmya, Markandeya Purana

<br>

### The Bloodline Philosophy

This project harnesses that multiplication deliberately — not as chaos, but as structured lineage.

| Mythological Element | Engineering Equivalent |
|---------------------|------------------------|
| **Origin** — Raktabeej himself | The source video file |
| **Generation** — the wound | The segment extraction event |
| **Descendant** — each blood-drop warrior | Each extracted JPEG frame |
| **Army** — the multiplied force | The assembled dataset |
| **Multiplication Complete** | The training-ready archive |

Every frame carries its lineage in its name. Every filename encodes its ancestry:

```
{video}  →  _segment_{NN}  →  _frame_{NNN}.jpg
 Origin       Generation         Descendant
```

The multiplication is not random. It is governed, structured, and purposeful. One source. Countless descendants. Each equal in resolution and quality to the origin frame.

<br>

> *The account of Raktabeej presented here is drawn from the* Devi Mahatmya *and is included as the cultural and philosophical inspiration behind the project's name. It is not intended as a theological or academic claim.*

<br>

---

<br>

<!--
═══════════════════════════════════════════════════════════════════════════════
  17 · FUTURE VISION — RAKTABEEJ AI
═══════════════════════════════════════════════════════════════════════════════
-->

## 17 · Future Vision — Raktabeej AI

> **This section describes future capabilities. None of the following exists in the current release.**

The current engine produces raw, unnamed frames. A future evolution — **Raktabeej AI** — would extend the pipeline to produce *semantically annotated*, training-ready datasets automatically.

<br>

```mermaid
flowchart TD
    A([Video Input]) --> B[Frame Extraction\ncurrent capability]
    B --> C([Raw JPEG Frames])

    C --> D[AI Captioning\nAutomatic scene descriptions per frame\nfuture]
    D --> E[Object Detection\nBounding box inference per frame\nfuture]
    E --> F[Auto Annotation\nLabel assignment from detection results\nfuture]
    F --> G[Training-Ready Dataset\nFrames + captions + annotations + manifest\nfuture]

    style B fill:#1a1a1a,color:#c8a882,stroke:#3a3a3a
    style C fill:#141414,color:#cd7f32,stroke:#5a1515
    style D fill:#0d0d0d,color:#6b6b6b,stroke:#2a2a2a,stroke-dasharray: 4 4
    style E fill:#0d0d0d,color:#6b6b6b,stroke:#2a2a2a,stroke-dasharray: 4 4
    style F fill:#0d0d0d,color:#6b6b6b,stroke:#2a2a2a,stroke-dasharray: 4 4
    style G fill:#0d0d0d,color:#6b6b6b,stroke:#2a2a2a,stroke-dasharray: 4 4
```

<br>

### Roadmap

| Stage | Status | Description |
|-------|:------:|-------------|
| Frame Extraction | ✅ **Current** | HTML5 Video + Canvas · JPEG 0.85 · named frames |
| Dataset Manifest | ✅ **Current** | Machine-readable JSON lineage |
| AI Captioning | 🔮 Future | Per-frame scene descriptions from vision-language models |
| Object Detection | 🔮 Future | Bounding box inference over extracted frames |
| Auto Annotation | 🔮 Future | Structured label assignment from detection outputs |
| Training-Ready Export | 🔮 Future | Frames + captions + annotations + manifest in one archive |

<br>

---

<br>

<!--
═══════════════════════════════════════════════════════════════════════════════
  18 · DEVELOPER
═══════════════════════════════════════════════════════════════════════════════
-->

## 18 · Developer

<div align="center">

<br>

**Arun VK**

[arunvk.tech@gmail.com](mailto:arunvk.tech@gmail.com) · [LinkedIn](https://www.linkedin.com/in/arunvk2004/) · [GitHub](https://github.com/ArunVijaykumarcsds)

<br>

</div>

---

## License

MIT — free to use, modify, and distribute.

<br>

---

<div align="center">

<br>

*Built with HTML5 Video · Canvas API · React · TypeScript · Tailwind CSS · Vite · JSZip*

<br>

**रक्तबीज**

*One seed. Countless descendants.*

<br>

</div>
