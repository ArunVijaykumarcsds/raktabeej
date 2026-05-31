import JSZip from 'jszip'
import type { ExtractedFrame, SegmentInfo, DatasetManifest, VideoInfo } from '../types'

export async function downloadSingleFrame(frame: ExtractedFrame): Promise<void> {
  const a = document.createElement('a')
  a.href = frame.url
  a.download = frame.filename
  a.click()
}

export async function downloadSegmentZip(
  segment: SegmentInfo,
  videoBaseName: string,
  onProgress?: (pct: number) => void
): Promise<void> {
  const zip = new JSZip()
  const folder = zip.folder(`segment_${String(segment.index + 1).padStart(2, '0')}`)!

  for (let i = 0; i < segment.frames.length; i++) {
    const frame = segment.frames[i]
    const response = await fetch(frame.url)
    const blob = await response.blob()
    folder.file(frame.filename, blob)
    onProgress?.((i + 1) / segment.frames.length * 100)
  }

  const blob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 6 } })
  triggerDownload(blob, `${videoBaseName}_segment_${String(segment.index + 1).padStart(2, '0')}.zip`)
}

export async function downloadCompleteDataset(
  segments: SegmentInfo[],
  videoInfo: VideoInfo,
  config: { segmentSize: number; framesPerSegment: number },
  onProgress?: (pct: number) => void
): Promise<void> {
  const zip = new JSZip()
  const baseName = videoInfo.name.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9._-]/g, '_')

  const allFrames = segments.flatMap(s => s.frames)
  let processed = 0

  for (const frame of allFrames) {
    const response = await fetch(frame.url)
    const blob = await response.blob()
    zip.file(`frames/${frame.filename}`, blob)
    processed++
    onProgress?.((processed / allFrames.length) * 90)
  }

  // Build manifest
  const manifest: DatasetManifest = {
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

  zip.file('manifest.json', JSON.stringify(manifest, null, 2))
  onProgress?.(95)

  const blob = await zip.generateAsync(
    { type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 6 } },
    (meta) => onProgress?.(90 + meta.percent * 0.1)
  )

  triggerDownload(blob, `raktabeej_dataset_${baseName}.zip`)
}

export function downloadManifestOnly(
  segments: SegmentInfo[],
  videoInfo: VideoInfo,
  config: { segmentSize: number; framesPerSegment: number }
): void {
  const allFrames = segments.flatMap(s => s.frames)
  const manifest: DatasetManifest = {
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
  const blob = new Blob([JSON.stringify(manifest, null, 2)], { type: 'application/json' })
  triggerDownload(blob, `raktabeej_manifest_${videoInfo.name.replace(/\.[^/.]+$/, '')}.json`)
}

function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 5000)
}

export function revokeFrameUrls(frames: ExtractedFrame[]): void {
  for (const frame of frames) {
    try { URL.revokeObjectURL(frame.url) } catch { /* ignore */ }
  }
}
