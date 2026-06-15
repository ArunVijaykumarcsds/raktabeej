<div align="center">

<img src="https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=white" />
<img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white" />
<img src="https://img.shields.io/badge/Vite-5-646CFF?style=flat-square&logo=vite&logoColor=white" />
<img src="https://img.shields.io/badge/Tailwind-3-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white" />
<img src="https://img.shields.io/badge/Zero%20Server-100%25%20Browser-E53E3E?style=flat-square" />
<img src="https://img.shields.io/badge/License-MIT-green?style=flat-square" />

<br /><br />

```
रक्तबीज
```

# RAKTABEEJ
### Dataset Generation Engine

*"As each drop of Raktabeej's blood fell, another arose equal in power."*
— Devi Mahatmya, Markandeya Purana

**One video. Countless frames. A structured, labeled image dataset — generated entirely in your browser.**

[**🚀 Try it live →**](https://raktabeej-5mbx.onrender.com)&nbsp;&nbsp;|&nbsp;&nbsp;[**GitHub →**](https://github.com/ArunVijaykumarcsds/raktabeej)

</div>

---

## What It Does

Drop any video. Configure how you want it sliced. Get thousands of structured, named image frames — ready for ML pipelines, annotation tools, and computer vision research.

```
1 Video  →  N Segments  →  F Frames each  →  N×F labeled images + manifest.json
```

A 2-minute video at 2-second segments with 50 frames per segment yields **3,000 production-ready frames.** Everything runs locally — the video never leaves your device.

---

## Screenshots

<table>
<tr>
<td width="50%">

**Drop zone & hero**

![Upload screen showing the Raktabeej drop zone with "One Video. Countless Frames." headline](https://raw.githubusercontent.com/ArunVijaykumarcsds/raktabeej/main/public/screenshot-upload.png)

</td>
<td width="50%">

**Extraction configuration**

![Config panel showing segment size and frames-per-segment controls with extraction summary](https://raw.githubusercontent.com/ArunVijaykumarcsds/raktabeej/main/public/screenshot-config.png)

</td>
</tr>
<tr>
<td width="50%">

**Live extraction in progress**

![Processing panel showing dual progress bars — segments and frames — with live frame count](https://raw.githubusercontent.com/ArunVijaykumarcsds/raktabeej/main/public/screenshot-processing.png)

</td>
<td width="50%">

**Per-segment gallery**

![Gallery showing extracted frames from a coral reef video in accordion view with ZIP export](https://raw.githubusercontent.com/ArunVijaykumarcsds/raktabeej/main/public/screenshot-gallery.png)

</td>
</tr>
</table>

> **Note:** To display screenshots on GitHub, add your UI screenshots to `/public/` and rename them to match the paths above — or update the `src` attributes to point to your actual image paths.

---

## Features

| | Feature | Detail |
|---|---|---|
| 🎬 | **Configurable segments** | 500ms · 1s · 2s · 5s · 10s · custom |
| 🖼️ | **Configurable frame density** | 10 · 25 · 50 · 100 · custom per segment |
| ⚡ | **Live gallery** | Frames appear in real-time during extraction |
| 📁 | **Four export modes** | Single frame · segment ZIP · full dataset ZIP · manifest-only |
| 🗂️ | **`manifest.json`** | Machine-readable metadata — timestamps, filenames, segment boundaries |
| 📦 | **Large file support** | Up to 2 GB direct; ZIP archive for larger files |
| 🔍 | **Frame lightbox** | Full-screen preview with keyboard navigation |
| 🔒 | **Zero server** | Pure browser — no upload, no API, no data leaves the device |

### Supported formats
`MP4` · `MOV` · `AVI` · `MKV` · `WEBM` · `MPEG` · `M4V` · `.zip` archives containing any of the above

---

## How It Works

Frame extraction uses **three native browser APIs** — no FFmpeg WASM, no npm packages in the critical path, no 10 MB binary to download.

| API | Role |
|---|---|
| `HTMLVideoElement` | Decodes video using the browser's own codec engine; seeks to exact timestamps via `currentTime` |
| `Canvas API` | Paints each decoded frame via `ctx.drawImage()`; exports as JPEG at 85% quality via `canvas.toBlob()` |
| `Blob / URL API` | Stores frames as in-memory `blob://` URLs for display; raw bytes cached as `ArrayBuffer` for fast ZIP assembly |

**Parallel extraction** runs 4 frames concurrently per segment — each worker gets its own `<video>` + `<canvas>` pair to avoid seek collisions. The `Page Visibility API` pauses extraction when you switch tabs and retries on return, so background-tab throttling never silently drops frames.

### Performance

| Stage | Naïve sequential | Current (parallel) |
|---|---|---|
| 1,500-frame extraction | ~5–10 min | ~1.5–3 min |
| ZIP assembly | ~1–2 min | ~10–20 sec |

---

## Output

### Naming convention

```
{video_name}_segment_{NN}_frame_{FFF}.jpg

drone_footage_segment_01_frame_001.jpg
drone_footage_segment_01_frame_002.jpg
...
drone_footage_segment_60_frame_050.jpg
```

Zero-padded indices guarantee correct sort order in file browsers, Python `glob()`, and dataset loaders.

### `manifest.json`

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
      "start": 0.0,
      "end": 2.0,
      "frames": [
        "drone_footage_segment_01_frame_001.jpg",
        "drone_footage_segment_01_frame_002.jpg"
      ]
    }
  ]
}
```

The manifest maps every frame to its exact timestamp — enabling annotation pipelines, DVC/MLflow integration, and video reconstruction from the ZIP.

### Scale reference

| Video length | Segment size | Frames/segment | Total frames |
|---|---|---|---|
| 30 seconds | 2s | 25 | 375 |
| 1 minute | 2s | 50 | **1,500** |
| 2 minutes | 2s | 50 | **3,000** |
| 5 minutes | 1s | 50 | **15,000** |

---

## Local Development

**Requirements:** Node.js 18+, npm 9+

```bash
git clone https://github.com/ArunVijaykumarcsds/raktabeej
cd raktabeej
npm install
npm run dev
```

Dev server starts at `http://localhost:5173`. `Cross-Origin-Opener-Policy` and `Cross-Origin-Embedder-Policy` headers are applied automatically by `vite.config.ts`.

| Script | Command |
|---|---|
| Dev server | `npm run dev` |
| Production build | `npm run build` |
| Preview build | `npm run preview` |
| Lint | `npm run lint` |

---

## Deployment

Deploy as a static site on [Render](https://render.com) in three steps:

1. Push the repo to GitHub
2. Create a new **Static Site** on Render → connect the repository
3. Render auto-detects `render.yaml` — no manual configuration needed

The `render.yaml` sets all required security headers (`COOP`, `COEP`, `CSP`) and configures SPA routing so page refreshes don't 404.

---

## Project Structure

```
src/
├── components/
│   ├── UploadZone.tsx         # Drag-drop + file type validation
│   ├── ConfigPanel.tsx        # Segment + frame density controls
│   ├── ProcessingPanel.tsx    # Live progress — dual bars + dot indicators
│   ├── SegmentAccordion.tsx   # Per-segment expandable gallery
│   ├── FramePreviewModal.tsx  # Lightbox with keyboard navigation
│   ├── GalleryToolbar.tsx     # Grid/timeline toggle + export controls
│   └── ...
├── hooks/
│   ├── useRaktabeej.ts        # Core state machine — all processing + orchestration
│   ├── useDropZone.ts         # Drag-drop event handling
│   ├── useDownload.ts         # ZIP + single-frame download triggers
│   └── useTabWarning.ts       # Page Visibility API — pauses when tab hidden
├── services/
│   ├── ffmpegService.ts       # Canvas + Video extractor, parallel batching, retry logic
│   ├── downloadService.ts     # JSZip assembly, manifest builder, parallel reads
│   └── zipExtractService.ts   # Input ZIP extraction for large files (>2 GB)
├── utils/
│   └── format.ts              # Filename sanitization, duration/size formatting
└── types/
    └── index.ts               # All shared TypeScript interfaces
```

UI components never touch canvas, video, or blob URLs. All processing is encapsulated in `ffmpegService.ts` and orchestrated through `useRaktabeej`.

---

## Use Cases

**Object detection** — extract frames from drone or surveillance footage → annotate in Roboflow / CVAT → train YOLO or DETR

**Action recognition** — dense frames from sports or gesture videos → VideoMAE, SlowFast, CNN-LSTM

**Medical imaging** — frames from endoscopy or surgical video for diagnostic model training — fully offline, nothing leaves the device

**Content moderation** — sample frames from uploaded videos at regular intervals → pass through a classifier, no server required

**Optical flow** — consecutive frames from the same segment are ideal for flow estimation training

**Privacy-sensitive domains** — medical, legal, industrial footage that cannot be uploaded to any server-based tool

---

## The Legend

**Raktabeej** (रक्तबीज) was a general in the army of the demon kings Shumbha and Nishumbha, described in the *Devi Mahatmya* of the Markandeya Purana. He possessed a divine boon: every drop of his blood that touched the ground would instantly create a full-strength duplicate of himself — making him effectively indestructible in battle.

The goddess Kali resolved the paradox by consuming each drop before it could reach the earth.

This project takes the opposite approach: it *harnesses* the multiplication. One video, seeded into the engine, propagates into a structured army of frames — each carrying its origin in its name, each ready to serve a purpose in AI and computer vision pipelines.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 + TypeScript 5 |
| Build tool | Vite 5 |
| Styling | Tailwind CSS 3 (class-based dark mode) |
| Frame extraction | `HTMLVideoElement` + `Canvas API` + `Blob API` — zero npm packages |
| ZIP generation | JSZip 3 |
| Icons | Lucide React |
| Fonts | Playfair Display · DM Sans · JetBrains Mono |
| Deployment | Render Static Site |

---

## Developer

**Arun VK**
[arunvk.tech@gmail.com](mailto:arunvk.tech@gmail.com) · [LinkedIn](https://www.linkedin.com/in/arunvk2004/) · [GitHub](https://github.com/ArunVijaykumarcsds)

---

## License

MIT — free to use, modify, and distribute.
