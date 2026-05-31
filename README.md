# RAKTABEEJ — Dataset Generation Engine

> *"As each drop of Raktabeej's blood fell, another arose equal in power."*  
> — Devi Mahatmya, Markandeya Purana

**One video. Countless frames. Large-scale image datasets for AI, ML, and Computer Vision — entirely in your browser.**

---

## What Is Raktabeej?

Raktabeej is a browser-based video-to-dataset engine inspired by the Hindu mythological demon Raktabeej, whose every drop of blood generated a complete duplicate of himself.

This project follows the same philosophy:

```
1 Video
  ↓
Split into N equal segments
  ↓
Extract F frames from each segment
  ↓
N × F structured image samples
```

A 2-minute video with 2-second segments and 50 frames per segment produces **3,000 labeled, named frames** — ready for AI training pipelines, computer vision annotation, remote sensing analysis, or academic research.

All processing happens locally via **FFmpeg WebAssembly**. Nothing is uploaded. Nothing leaves your device.

---

## Features

- **Configurable segmentation** — 0.5s, 1s, 2s, 5s, 10s, or custom segment sizes
- **Configurable frame density** — 10, 25, 50, 100, or custom frames per segment
- **Live extraction preview** — frames appear in real-time as they are extracted
- **Grid and Timeline views** — inspect your dataset visually
- **Per-segment ZIP export** — download individual segments independently
- **Full dataset ZIP export** — single archive with all frames + manifest
- **Dataset manifest JSON** — machine-readable metadata for every frame
- **Large file support** — direct upload up to 2 GB; ZIP archive for larger files
- **Frame lightbox** — keyboard-navigable full-screen preview
- **Zero server dependency** — pure browser, pure privacy

### Supported Input Formats

`MP4` `MOV` `AVI` `MKV` `WEBM` `MPEG` `M4V` — and ZIP archives containing any of the above for files over 2 GB.

---

## Output Naming Convention

```
{video_name}_segment_{NN}_frame_{NNN}.jpg

Example:
drone_footage_segment_01_frame_001.jpg
drone_footage_segment_01_frame_002.jpg
drone_footage_segment_02_frame_001.jpg
```

### Dataset Manifest (`manifest.json`)

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
      "frames": ["drone_footage_segment_01_frame_001.jpg", "..."]
    }
  ]
}
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 18 + TypeScript 5 |
| Build | Vite 5 |
| Styling | Tailwind CSS 3 |
| Video Processing | FFmpeg WebAssembly (`@ffmpeg/ffmpeg` v0.12) |
| ZIP Generation | JSZip |
| Icons | Lucide React |
| Fonts | Playfair Display, DM Sans, JetBrains Mono |
| Deployment | Render Static Site |

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

The dev server starts at `http://localhost:5173`.

> **Important:** FFmpeg WebAssembly requires `SharedArrayBuffer`, which requires two HTTP security headers: `Cross-Origin-Opener-Policy: same-origin` and `Cross-Origin-Embedder-Policy: require-corp`. These are set automatically by the Vite dev server config and the `render.yaml` for production.

### Build

```bash
npm run build
```

Output is in `dist/`. Preview with:

```bash
npm run preview
```

---

## Deployment on Render

1. Push to GitHub
2. Create a new **Static Site** on [Render](https://render.com)
3. Connect your repository
4. Render auto-detects `render.yaml` — no manual configuration needed

The `render.yaml` sets all required headers:
- `Cross-Origin-Opener-Policy: same-origin`
- `Cross-Origin-Embedder-Policy: require-corp`
- Full Content Security Policy with `wasm-unsafe-eval`
- SPA routing (all paths → `index.html`)

---

## Architecture

```
src/
├── components/
│   ├── Header.tsx           # Branding + developer credit
│   ├── UploadZone.tsx       # Drag-drop + file validation
│   ├── ConfigPanel.tsx      # Segment/frame configuration
│   ├── VideoInfoPanel.tsx   # Video metadata display
│   ├── ProcessingPanel.tsx  # Live extraction progress
│   ├── FrameCard.tsx        # Individual frame thumbnail
│   ├── SegmentAccordion.tsx # Per-segment frame gallery
│   ├── FramePreviewModal.tsx# Lightbox with keyboard nav
│   ├── GalleryToolbar.tsx   # View toggle + export controls
│   ├── RaktabeejLore.tsx    # Mythology + project philosophy
│   ├── Footer.tsx           # Developer links
│   └── index.ts             # Barrel exports
├── hooks/
│   ├── useRaktabeej.ts      # Core processing orchestration
│   ├── useDropZone.ts       # Drag-drop file handling
│   └── useDownload.ts       # ZIP + single frame downloads
├── services/
│   ├── ffmpegService.ts     # FFmpeg WASM integration
│   ├── downloadService.ts   # ZIP generation + manifest
│   └── zipExtractService.ts # ZIP input for large files
├── utils/
│   └── format.ts            # Formatting + validation helpers
├── types/
│   └── index.ts             # All TypeScript types
└── pages/
    └── HomePage.tsx         # Main page orchestration
```

---

## Performance Notes

- FFmpeg processes one segment at a time, with explicit file cleanup after each segment to prevent memory buildup
- Frames are stored as blob URLs (in-memory) — for very large datasets (5,000+ frames), browser memory usage will scale accordingly
- Manual chunk splitting separates React, FFmpeg WASM, and JSZip into separate browser cache entries
- Lazy image loading in the gallery prevents DOM overload

---

## The Legend

Raktabeej (रक्तबीज) was a general in the army of the demon kings Shumbha and Nishumbha, described in the *Devi Mahatmya* within the Markandeya Purana. He possessed a divine boon: every drop of his blood that touched the ground would instantly create an exact, full-strength duplicate of himself. In battle, this made him effectively indestructible — every wound multiplied him.

The goddess Kali resolved the paradox by consuming each blood-drop before it could reach the earth, preventing the multiplication at its source.

This project takes the opposite approach: it *harnesses* the multiplication. One video, seeded into the engine, propagates into a structured army of frames — each carrying its origin in its name, each ready to serve a purpose in AI research and machine learning pipelines.

---

## Developer

**Arun VK**  
[arunvk.tech@gmail.com](mailto:arunvk.tech@gmail.com)  
[LinkedIn](https://www.linkedin.com/in/arunvk2004/) · [GitHub](https://github.com/ArunVijaykumarcsds)

---

## License

MIT — free to use, modify, and distribute.
