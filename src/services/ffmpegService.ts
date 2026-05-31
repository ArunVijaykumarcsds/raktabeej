import { generateFrameFilename } from '../utils/format'
import type { ExtractedFrame, SegmentInfo, ProcessingConfig } from '../types'

// ---------------------------------------------------------------------------
// Video duration helper
// ---------------------------------------------------------------------------

export function getVideoDuration(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video')
    video.preload = 'metadata'
    const url = URL.createObjectURL(file)
    video.onloadedmetadata = () => { URL.revokeObjectURL(url); resolve(video.duration) }
    video.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Failed to read video metadata')) }
    video.src = url
  })
}

// ---------------------------------------------------------------------------
// Seek video to exact timestamp and capture frame
// ---------------------------------------------------------------------------

function captureFrame(
  video: HTMLVideoElement,
  canvas: HTMLCanvasElement,
  timestamp: number
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const onSeeked = () => {
      video.removeEventListener('seeked', onSeeked)
      const ctx = canvas.getContext('2d')
      if (!ctx) return reject(new Error('Canvas context unavailable'))
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
      canvas.toBlob(
        blob => blob ? resolve(blob) : reject(new Error('Canvas toBlob failed')),
        'image/jpeg',
        0.85
      )
    }
    video.addEventListener('seeked', onSeeked)
    video.currentTime = timestamp
  })
}

// ---------------------------------------------------------------------------
// Core frame extraction — Canvas + HTML5 Video approach
// No WASM, no CDN, no memory issues. Uses the browser's native video decoder.
// ---------------------------------------------------------------------------

export async function extractSegmentFrames(
  _ffmpeg: unknown,
  videoFile: File,
  videoBaseName: string,
  segment: SegmentInfo,
  config: ProcessingConfig,
  onFrameExtracted: (frame: ExtractedFrame) => void,
  signal?: AbortSignal
): Promise<ExtractedFrame[]> {
  if (signal?.aborted) throw new Error('Aborted')

  // Create a hidden video element and canvas
  const video = document.createElement('video')
  video.muted = true
  video.preload = 'auto'
  video.style.display = 'none'
  document.body.appendChild(video)

  const canvas = document.createElement('canvas')
  canvas.style.display = 'none'
  document.body.appendChild(canvas)

  const objectUrl = URL.createObjectURL(videoFile)

  try {
    // Load the video
    await new Promise<void>((resolve, reject) => {
      video.onloadeddata = () => resolve()
      video.onerror = () => reject(new Error('Failed to load video'))
      video.src = objectUrl
      video.load()
    })

    const segDuration = segment.endTime - segment.startTime
    const frames: ExtractedFrame[] = []

    // Calculate evenly spaced timestamps within the segment
    for (let f = 1; f <= config.framesPerSegment; f++) {
      if (signal?.aborted) break

      // Distribute frames evenly across the segment
      const progress = config.framesPerSegment === 1
        ? 0.5
        : (f - 1) / (config.framesPerSegment - 1)
      const timestamp = segment.startTime + progress * segDuration

      try {
        const blob = await captureFrame(video, canvas, timestamp)
        const url = URL.createObjectURL(blob)
        const globalIndex = segment.index * config.framesPerSegment + f
        const filename = generateFrameFilename(videoBaseName, segment.index + 1, f)

        const frame: ExtractedFrame = {
          segmentIndex: segment.index,
          frameIndex: f,
          globalIndex,
          filename,
          url,
          timestamp,
        }

        frames.push(frame)
        onFrameExtracted(frame)
      } catch (e) {
        console.warn(`[Canvas] Frame ${f} of segment ${segment.index} failed:`, e)
      }
    }

    return frames
  } finally {
    // Clean up
    URL.revokeObjectURL(objectUrl)
    document.body.removeChild(video)
    document.body.removeChild(canvas)
  }
}

// ---------------------------------------------------------------------------
// Stub functions — kept for API compatibility with the rest of the codebase
// FFmpeg is no longer used, these are no-ops
// ---------------------------------------------------------------------------

export async function loadFFmpeg(): Promise<unknown> {
  return null
}

export async function getFFmpegForSegment(): Promise<{ ffmpeg: unknown; needsFileUpload: boolean }> {
  return { ffmpeg: null, needsFileUpload: false }
}

export function destroyFFmpeg(): void {
  // no-op
}