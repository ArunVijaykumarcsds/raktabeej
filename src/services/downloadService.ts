import JSZip from 'jszip'
import type { ExtractedFrame, SegmentInfo, DatasetManifest, VideoInfo } from '../types'
import { sanitizeFilename } from '../utils/format'

// ---------------------------------------------------------------------------
// Helper: get raw bytes from a frame.
//
// During extraction, ffmpegService now attaches `_arrayBuffer` directly on
// the frame object to avoid re-fetching. If it's present, use it directly.
// If not (e.g. frames extracted by an older code path), fall back to fetch().
//
// This eliminates the biggest bottleneck in the original downloadService:
// a sequential fetch() loop over thousands of blob:// URLs at ZIP time.
// ---------------------------------------------------------------------------

async function getFrameBytes(frame: ExtractedFrame): Promise<ArrayBuffer> {
  const cached = (frame as unknown as Record<string, unknown>)['_arrayBuffer']
  if (cached instanceof ArrayBuffer) return cached
  // Fallback: fetch the blob:// URL (slower, but safe for any frame source)
  const response = await fetch(frame.url)
  return response.arrayBuffer()
}

// ---------------------------------------------------------------------------
// Helper: parallel ArrayBuffer reads with bounded concurrency.
// Prevents memory spikes from loading all frames at once.
// ---------------------------------------------------------------------------

async function readFramesParallel(
  frames: ExtractedFrame[],
  concurrency = 8,
  onProgress?: (done: number, total: number) => void
): Promise<Map<string, ArrayBuffer>> {
  const results = new Map<string, ArrayBuffer>()
  let done = 0

  for (let i = 0; i < frames.length; i += concurrency) {
    const batch = frames.slice(i, i + concurrency)
    const buffers = await Promise.all(batch.map(f => getFrameBytes(f)))
    batch.forEach((frame, idx) => {
      results.set(frame.filename, buffers[idx])
      done++
      onProgress?.(done, frames.length)
    })
  }

  return results
}

// ---------------------------------------------------------------------------
// Build manifest object — shared between full dataset and manifest-only export
// ---------------------------------------------------------------------------

function buildManifest(
  segments: SegmentInfo[],
  videoInfo: VideoInfo,
  config: { segmentSize: number; framesPerSegment: number }
): DatasetManifest {
  const allFrames = segments.flatMap(s => s.frames)
  return {
    video_name: videoInfo.name,
    duration: videoInfo.duration,
    total_segments: segments.length,
    frames_per_segment: config.framesPerSegment,
    total_frames: allFrames.length,
    segment_size_seconds: config.segmentSize,
    generated_at: new Date().toISOString(),
    segments: segments.map(s => ({
      index: s.index + 1,
      start: s.startTime,
      end: s.endTime,
      frames: s.frames.map(f => f.filename),
    })),
  }
}

// ---------------------------------------------------------------------------
// Single frame download — unchanged, already optimal
// ---------------------------------------------------------------------------

export async function downloadSingleFrame(frame: ExtractedFrame): Promise<void> {
  const a = document.createElement('a')
  a.href = frame.url
  a.download = frame.filename
  a.click()
}

// ---------------------------------------------------------------------------
// Segment ZIP download — OPTIMISED
//
// Original: sequential fetch() per frame — O(N) sequential async calls.
// Now: parallel ArrayBuffer reads (concurrency=8) then synchronous ZIP file()
// calls. No await inside the ZIP assembly loop = much faster.
// ---------------------------------------------------------------------------

export async function downloadSegmentZip(
  segment: SegmentInfo,
  videoBaseName: string,
  onProgress?: (pct: number) => void
): Promise<void> {
  const zip = new JSZip()
  const folderName = `segment_${String(segment.index + 1).padStart(2, '0')}`
  const folder = zip.folder(folderName)!

  // Read all frame bytes in parallel
  const bufferMap = await readFramesParallel(
    segment.frames,
    8,
    (done, total) => onProgress?.(done / total * 80)
  )

  // Add to ZIP synchronously — no awaiting inside this loop
  for (const frame of segment.frames) {
    const buf = bufferMap.get(frame.filename)
    if (buf) folder.file(frame.filename, buf)
  }

  onProgress?.(85)

  const blob = await zip.generateAsync(
    { type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 6 } },
    meta => onProgress?.(85 + meta.percent * 0.15)
  )

  triggerDownload(
    blob,
    `${sanitizeFilename(videoBaseName)}_segment_${String(segment.index + 1).padStart(2, '0')}.zip`
  )
}

// ---------------------------------------------------------------------------
// Complete dataset ZIP download — OPTIMISED
//
// Original bottlenecks:
//   1. Sequential fetch() for each frame blob (O(N) sequential await)
//   2. Progress callback inside the frame loop blocked ZIP generation start
//
// Now:
//   1. All frame bytes read in parallel batches (concurrency=8)
//   2. All zip.file() calls are synchronous — no await in the assembly loop
//   3. Progress phases: 0-75% reading frames, 75-90% adding to zip, 90-100% generating
// ---------------------------------------------------------------------------

export async function downloadCompleteDataset(
  segments: SegmentInfo[],
  videoInfo: VideoInfo,
  config: { segmentSize: number; framesPerSegment: number },
  onProgress?: (pct: number) => void
): Promise<void> {
  const zip = new JSZip()
  const baseName = sanitizeFilename(videoInfo.name.replace(/\.[^/.]+$/, ''))
  const allFrames = segments.flatMap(s => s.frames)

  // Phase 1: Read all frame bytes in parallel (0–75%)
  const bufferMap = await readFramesParallel(
    allFrames,
    8,
    (done, total) => onProgress?.(done / total * 75)
  )

  // Phase 2: Add all files to ZIP synchronously (75–90%)
  // zip.file() is synchronous — no await, just loop
  let added = 0
  for (const frame of allFrames) {
    const buf = bufferMap.get(frame.filename)
    if (buf) {
      zip.file(`frames/${frame.filename}`, buf)
      added++
      // Report progress every 100 frames to avoid blocking
      if (added % 100 === 0) onProgress?.(75 + (added / allFrames.length) * 15)
    }
  }

  // Add manifest
  const manifest = buildManifest(segments, videoInfo, config)
  zip.file('manifest.json', JSON.stringify(manifest, null, 2))

  onProgress?.(90)

  // Phase 3: Generate ZIP (90–100%)
  const blob = await zip.generateAsync(
    { type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 6 } },
    meta => onProgress?.(90 + meta.percent * 0.10)
  )

  triggerDownload(blob, `raktabeej_dataset_${baseName}.zip`)
}

// ---------------------------------------------------------------------------
// Manifest-only download — unchanged, already optimal
// ---------------------------------------------------------------------------

export function downloadManifestOnly(
  segments: SegmentInfo[],
  videoInfo: VideoInfo,
  config: { segmentSize: number; framesPerSegment: number }
): void {
  const manifest = buildManifest(segments, videoInfo, config)
  const blob = new Blob([JSON.stringify(manifest, null, 2)], { type: 'application/json' })
  triggerDownload(blob, `raktabeej_manifest_${videoInfo.name.replace(/\.[^/.]+$/, '')}.json`)
}

// ---------------------------------------------------------------------------
// Blob URL cleanup utility — call when discarding a segment's frames
// ---------------------------------------------------------------------------

export function revokeFrameUrls(frames: ExtractedFrame[]): void {
  for (const frame of frames) {
    try { URL.revokeObjectURL(frame.url) } catch { /* ignore */ }
  }
}

// ---------------------------------------------------------------------------
// Internal: trigger a file download via a temporary <a> element
// ---------------------------------------------------------------------------

function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  setTimeout(() => URL.revokeObjectURL(url), 5000)
}
