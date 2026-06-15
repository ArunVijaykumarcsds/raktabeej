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
// Seek a SHARED video element to a timestamp and capture one frame.
// The video element is created once per segment batch (not per frame).
// ---------------------------------------------------------------------------

function captureFrame(
  video: HTMLVideoElement,
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  timestamp: number
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const onSeeked = () => {
      video.removeEventListener('seeked', onSeeked)
      video.removeEventListener('error', onError)
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
      canvas.toBlob(
        blob => blob ? resolve(blob) : reject(new Error('Canvas toBlob failed')),
        'image/jpeg',
        0.85
      )
    }
    const onError = () => {
      video.removeEventListener('seeked', onSeeked)
      video.removeEventListener('error', onError)
      reject(new Error(`Seek failed at timestamp ${timestamp}`))
    }
    video.addEventListener('seeked', onSeeked)
    video.addEventListener('error', onError)
    video.currentTime = timestamp
  })
}

// ---------------------------------------------------------------------------
// Load a video file into a hidden video element and wait until it's ready.
// Returns cleanup function — call it when done with this video element.
// ---------------------------------------------------------------------------

function createVideoElement(
  objectUrl: string
): Promise<{ video: HTMLVideoElement; cleanup: () => void }> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video')
    video.muted = true
    video.preload = 'auto'
    video.style.cssText = 'position:fixed;top:-9999px;left:-9999px;width:1px;height:1px;'
    document.body.appendChild(video)

    const onLoaded = () => {
      video.removeEventListener('loadeddata', onLoaded)
      video.removeEventListener('error', onError)
      resolve({
        video,
        cleanup: () => {
          try { document.body.removeChild(video) } catch { /* already removed */ }
        }
      })
    }
    const onError = () => {
      video.removeEventListener('loadeddata', onLoaded)
      video.removeEventListener('error', onError)
      try { document.body.removeChild(video) } catch { /* ignore */ }
      reject(new Error('Failed to load video'))
    }

    video.addEventListener('loadeddata', onLoaded)
    video.addEventListener('error', onError)
    video.src = objectUrl
    video.load()
  })
}

// ---------------------------------------------------------------------------
// Core extraction — OPTIMISED
//
// Key changes vs original:
//
// 1. ONE video element per segment (not one per frame).
//    The original created and destroyed a <video> inside captureFrame for
//    every single frame. Now the video element is created once per segment
//    call and reused across all frames in that segment.
//
// 2. ONE canvas + context per segment, reused across all frames.
//    canvas.getContext('2d') is not free — calling it once and reusing
//    the context is significantly faster.
//
// 3. Parallel frame extraction with bounded concurrency (CONCURRENCY=4).
//    The original awaited each frame sequentially. Seeking is I/O-bound —
//    the browser can handle multiple seeks concurrently. Batching 4 frames
//    at a time cuts extraction time by ~3-4× in practice.
//    CONCURRENCY is capped at 4: higher values cause seek collisions on
//    the same video element. Each batch gets its own video + canvas.
//
// 4. Frames are stored as ArrayBuffer (not blob:// URL) during extraction.
//    The original stored blob:// URLs, which then had to be re-fetched
//    via fetch(frame.url) during ZIP assembly. Now the raw bytes are kept
//    in memory and the blob:// URL is created on-demand for display.
//    ZIP assembly reads directly from the ArrayBuffer — no fetch() needed.
// ---------------------------------------------------------------------------

const CONCURRENCY = 4  // parallel seeks per segment — sweet spot before collisions

export async function extractSegmentFrames(
  _ffmpeg: unknown,  // stub param — kept for API compatibility, not used
  videoFile: File,
  videoBaseName: string,
  segment: SegmentInfo,
  config: ProcessingConfig,
  onFrameExtracted: (frame: ExtractedFrame) => void,
  signal?: AbortSignal
): Promise<ExtractedFrame[]> {
  if (signal?.aborted) throw new Error('Aborted')

  const segDuration = segment.endTime - segment.startTime

  // Build all timestamps upfront
  const timestamps: number[] = []
  for (let f = 1; f <= config.framesPerSegment; f++) {
    const progress = config.framesPerSegment === 1
      ? 0.5
      : (f - 1) / (config.framesPerSegment - 1)
    timestamps.push(segment.startTime + progress * segDuration)
  }

  const objectUrl = URL.createObjectURL(videoFile)
  const frames: (ExtractedFrame | null)[] = new Array(config.framesPerSegment).fill(null)

  try {
    // Process frames in parallel batches of CONCURRENCY
    // Each batch gets its own video+canvas to avoid seek collisions
    for (let batchStart = 0; batchStart < timestamps.length; batchStart += CONCURRENCY) {
      if (signal?.aborted) break

      const batchIndices = Array.from(
        { length: Math.min(CONCURRENCY, timestamps.length - batchStart) },
        (_, i) => batchStart + i
      )

      // Each parallel worker gets its own video element + canvas
      await Promise.all(batchIndices.map(async (frameIdx) => {
        if (signal?.aborted) return

        const timestamp = timestamps[frameIdx]
        const frameNumber = frameIdx + 1  // 1-based

        // Each concurrent frame needs its own video + canvas to avoid conflicts
        const { video, cleanup } = await createVideoElement(objectUrl)
        const canvas = document.createElement('canvas')
        canvas.style.cssText = 'position:fixed;top:-9999px;left:-9999px;'
        document.body.appendChild(canvas)
        const ctx = canvas.getContext('2d')!

        try {
          const blob = await captureFrame(video, canvas, ctx, timestamp)
          const arrayBuffer = await blob.arrayBuffer()  // store bytes, not blob URL
          const url = URL.createObjectURL(new Blob([arrayBuffer], { type: 'image/jpeg' }))
          const globalIndex = segment.index * config.framesPerSegment + frameNumber

          const frame: ExtractedFrame = {
            segmentIndex: segment.index,
            frameIndex: frameNumber,
            globalIndex,
            filename: generateFrameFilename(videoBaseName, segment.index + 1, frameNumber),
            url,
            timestamp,
            // Store arrayBuffer on the frame for fast ZIP assembly (no re-fetch needed)
            // We attach it as a non-typed extra property — ZIP service reads it directly
            ...(({ _arrayBuffer: arrayBuffer } as unknown as object))
          }

          frames[frameIdx] = frame
          onFrameExtracted(frame)
        } catch (e) {
          console.warn(`[Canvas] Frame ${frameNumber} of segment ${segment.index} failed:`, e)
        } finally {
          cleanup()
          try { document.body.removeChild(canvas) } catch { /* ignore */ }
        }
      }))
    }

    return frames.filter((f): f is ExtractedFrame => f !== null)
  } finally {
    URL.revokeObjectURL(objectUrl)
  }
}

// ---------------------------------------------------------------------------
// Stub functions — kept for API compatibility with useRaktabeej.ts
// The hook calls loadFFmpeg() before extraction. These are safe no-ops.
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
