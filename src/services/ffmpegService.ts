import { FFmpeg } from '@ffmpeg/ffmpeg'
import { fetchFile, toBlobURL } from '@ffmpeg/util'
import { generateFrameFilename } from '../utils/format'
import type { ExtractedFrame, SegmentInfo, ProcessingConfig } from '../types'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const FFMPEG_CORE_BASE = 'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.6/dist/esm'

const RECYCLE_AFTER_SEGMENTS = 5

// ---------------------------------------------------------------------------
// Module-level state
// ---------------------------------------------------------------------------

let ffmpegInstance: FFmpeg | null = null
let isLoaded = false
let currentInputName: string | null = null
let execCallCount = 0

/**
 * Whether the current video is MJPEG (AVI container with MJPEG codec).
 * MJPEG frames can be demuxed with -c:v copy.
 * All other codecs (H.264, VP9, HEVC, etc.) need -vf fps + -q:v encode.
 */
let isMjpeg = false

// ---------------------------------------------------------------------------
// Lifecycle helpers
// ---------------------------------------------------------------------------

async function createAndLoadFFmpeg(
  onProgress?: (ratio: number) => void
): Promise<FFmpeg> {
  const ffmpeg = new FFmpeg()
  ffmpeg.on('log', ({ message }) => console.log('[FFmpeg]', message))
  if (onProgress) {
    ffmpeg.on('progress', ({ progress }) => onProgress(progress))
  }
  await ffmpeg.load({
    coreURL: await toBlobURL(`${FFMPEG_CORE_BASE}/ffmpeg-core.js`, 'text/javascript'),
    wasmURL: await toBlobURL(`${FFMPEG_CORE_BASE}/ffmpeg-core.wasm`, 'application/wasm'),
  })
  return ffmpeg
}

function _destroyInstance() {
  if (ffmpegInstance) {
    try { ffmpegInstance.terminate() } catch { /* ignore */ }
    ffmpegInstance = null
  }
  isLoaded = false
  currentInputName = null
  execCallCount = 0
  isMjpeg = false
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export async function loadFFmpeg(
  onProgress?: (ratio: number) => void
): Promise<FFmpeg> {
  if (ffmpegInstance && isLoaded) return ffmpegInstance
  _destroyInstance()
  ffmpegInstance = await createAndLoadFFmpeg(onProgress)
  isLoaded = true
  return ffmpegInstance
}

export async function getFFmpegForSegment(
  onProgress?: (ratio: number) => void
): Promise<{ ffmpeg: FFmpeg; needsFileUpload: boolean }> {
  const shouldRecycle =
    !ffmpegInstance ||
    !isLoaded ||
    execCallCount >= RECYCLE_AFTER_SEGMENTS

  if (shouldRecycle) {
    console.log(`[FFmpeg] Recycling WASM instance (execCallCount=${execCallCount})`)
    _destroyInstance()
    ffmpegInstance = await createAndLoadFFmpeg(onProgress)
    isLoaded = true
    return { ffmpeg: ffmpegInstance, needsFileUpload: true }
  }

  return { ffmpeg: ffmpegInstance!, needsFileUpload: false }
}

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
// Codec detection
// ---------------------------------------------------------------------------

/**
 * Detect if the video file is MJPEG by checking the file extension.
 * MJPEG is almost exclusively found in .avi files.
 * MP4, MOV, MKV, WEBM are always H.264/H.265/VP9 — never MJPEG.
 *
 * For .avi files we conservatively assume MJPEG and let ensureValidJpeg()
 * catch any frames that turn out not to be valid JPEGs.
 */
function detectIsMjpeg(file: File): boolean {
  const ext = file.name.split('.').pop()?.toLowerCase() ?? ''
  // Only AVI containers typically carry MJPEG codec
  return ext === 'avi'
}

// ---------------------------------------------------------------------------
// Core frame extraction
// ---------------------------------------------------------------------------

export async function extractSegmentFrames(
  ffmpeg: FFmpeg,
  videoFile: File,
  videoBaseName: string,
  segment: SegmentInfo,
  config: ProcessingConfig,
  onFrameExtracted: (frame: ExtractedFrame) => void,
  signal?: AbortSignal
): Promise<ExtractedFrame[]> {
  if (signal?.aborted) throw new Error('Aborted')

  // -------------------------------------------------------------------------
  // 1. Ensure the video file is in the WASM virtual FS
  // -------------------------------------------------------------------------
  const ext = videoFile.name.split('.').pop()?.toLowerCase() ?? 'mp4'
  const inputName = `input_video.${ext}`

  if (currentInputName !== inputName) {
    if (currentInputName) {
      try { await ffmpeg.deleteFile(currentInputName) } catch { /* ignore */ }
    }
    console.log(`[FFmpeg] Writing video to WASM FS: ${inputName} (${(videoFile.size / 1024 / 1024).toFixed(1)} MB)`)
    await ffmpeg.writeFile(inputName, await fetchFile(videoFile))
    currentInputName = inputName

    // Detect codec once per file upload
    isMjpeg = detectIsMjpeg(videoFile)
    console.log(`[FFmpeg] Codec mode: ${isMjpeg ? 'MJPEG (-c:v copy)' : 'Standard (-vf fps, JPEG encode)'}`)
  }

  // -------------------------------------------------------------------------
  // 2. Build and run the ffmpeg command
  // -------------------------------------------------------------------------
  const segDuration = segment.endTime - segment.startTime
  const framePrefix = `frm_s${segment.index}_`
  const outputPattern = `${framePrefix}%03d.jpg`

  // Calculate fps needed to get exactly framesPerSegment frames from segDuration
  const fps = config.framesPerSegment / segDuration

  /**
   * TWO MODES:
   *
   * MJPEG (.avi): Use -c:v copy to demux raw JPEG packets directly.
   *   Fast, zero re-encode, but only valid for MJPEG sources.
   *
   * Standard (mp4, mov, mkv, webm, etc.): Use -vf fps filter to sample
   *   frames at the right rate, then encode each as JPEG with -q:v 2
   *   (high quality). This is the correct approach for H.264/H.265/VP9.
   *   Without this, -c:v copy just dumps raw H.264 NAL units into .jpg
   *   files which are not valid JPEGs at all.
   */
  const args = isMjpeg
    ? [
        '-ss', String(segment.startTime),
        '-i', inputName,
        '-t', String(segDuration),
        '-an',
        '-frames:v', String(config.framesPerSegment),
        '-c:v', 'copy',
        '-f', 'image2',
        outputPattern,
      ]
    : [
        '-ss', String(segment.startTime),
        '-i', inputName,
        '-t', String(segDuration),
        '-an',
        '-vf', `fps=${fps.toFixed(6)}`,   // sample exactly N frames over the segment
        '-frames:v', String(config.framesPerSegment),
        '-q:v', '2',                       // JPEG quality 2 = high quality (~95%)
        '-f', 'image2',
        outputPattern,
      ]

  try {
    await ffmpeg.exec(args)
    execCallCount++
  } catch (err) {
    execCallCount++
    console.error('[FFmpeg] exec failed for segment', segment.index, err)
    throw err
  }

  // -------------------------------------------------------------------------
  // 3. Collect output frames
  // -------------------------------------------------------------------------
  const frames: ExtractedFrame[] = []

  for (let f = 1; f <= config.framesPerSegment; f++) {
    if (signal?.aborted) break

    const frameName = `${framePrefix}${String(f).padStart(3, '0')}.jpg`

    try {
      const data = await ffmpeg.readFile(frameName)

      const raw: Uint8Array = data instanceof Uint8Array
        ? data
        : new TextEncoder().encode(data as string)
      const bytes = new Uint8Array(
        raw.buffer.slice(raw.byteOffset, raw.byteOffset + raw.byteLength)
      ) as Uint8Array<ArrayBuffer>

      // For standard video, frames are always valid JPEGs (we encoded them).
      // For MJPEG, still validate/repair the SOI marker.
      const validBytes = isMjpeg
        ? ensureValidJpeg(bytes, segment.index, f)
        : bytes  // already valid JPEG — we just encoded it

      if (!validBytes) {
        console.warn(`[FFmpeg] Segment ${segment.index} frame ${f}: not a valid JPEG, skipping`)
        await ffmpeg.deleteFile(frameName).catch(() => { /* ignore */ })
        continue
      }

      const blob = new Blob([validBytes], { type: 'image/jpeg' })
      const url = URL.createObjectURL(blob)

      const globalIndex = segment.index * config.framesPerSegment + f
      const filename = generateFrameFilename(videoBaseName, segment.index + 1, f)
      const timestamp = segment.startTime + ((f - 1) / config.framesPerSegment) * segDuration

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
      await ffmpeg.deleteFile(frameName).catch(() => { /* ignore */ })
    } catch (e) {
      console.warn(`[FFmpeg] Frame ${f} of segment ${segment.index} missing or unreadable:`, e)
    }
  }

  return frames
}

// ---------------------------------------------------------------------------
// JPEG validation / repair (MJPEG only)
// ---------------------------------------------------------------------------

function ensureValidJpeg(bytes: Uint8Array<ArrayBuffer>, segIdx: number, frameIdx: number): Uint8Array<ArrayBuffer> | null {
  if (bytes.length < 3) return null

  if (bytes[0] === 0xFF && bytes[1] === 0xD8 && bytes[2] === 0xFF) {
    return bytes
  }

  if (bytes[0] === 0xD8 && bytes[1] === 0xFF) {
    console.warn(`[FFmpeg] Seg ${segIdx} frame ${frameIdx}: prepending missing SOI 0xFF`)
    const fixed = new Uint8Array(bytes.length + 1) as Uint8Array<ArrayBuffer>
    fixed[0] = 0xFF
    fixed.set(bytes, 1)
    return fixed
  }

  if (bytes[0] === 0xFF && bytes[1] === 0xD8) {
    return bytes
  }

  return null
}

// ---------------------------------------------------------------------------
// Public teardown
// ---------------------------------------------------------------------------

export function destroyFFmpeg() {
  _destroyInstance()
}
