import { FFmpeg } from '@ffmpeg/ffmpeg'
import { fetchFile, toBlobURL } from '@ffmpeg/util'
import { generateFrameFilename } from '../utils/format'
import type { ExtractedFrame, SegmentInfo, ProcessingConfig } from '../types'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const FFMPEG_CORE_BASE = 'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.6/dist/esm'

/**
 * How many segments to process before we recycle the FFmpeg WASM instance.
 * The WASM heap leaks internal codec state on every exec() call; recycling
 * every N segments prevents the "memory access out of bounds" crash that
 * otherwise reliably appears after ~6–8 segments of MJPEG processing.
 */
const RECYCLE_AFTER_SEGMENTS = 5

// ---------------------------------------------------------------------------
// Module-level state
// ---------------------------------------------------------------------------

let ffmpegInstance: FFmpeg | null = null
let isLoaded = false

/**
 * Name of the input file currently written into the WASM virtual FS.
 * Kept so we can skip re-uploading the same video across consecutive segments
 * within the same FFmpeg lifecycle, and so we can clean it up on recycle.
 */
let currentInputName: string | null = null

/** Monotonic counter of exec() calls on the current instance. */
let execCallCount = 0

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

/**
 * Terminate the current FFmpeg instance and fully reset module state.
 * Must be called before creating a new one to avoid double-loading.
 */
function _destroyInstance() {
  if (ffmpegInstance) {
    try { ffmpegInstance.terminate() } catch { /* ignore */ }
    ffmpegInstance = null
  }
  isLoaded = false
  currentInputName = null
  execCallCount = 0
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Load (or return) the shared FFmpeg WASM instance.
 * Callers that drive a long extraction loop should prefer
 * `getFFmpegForSegment()` which handles lifecycle recycling automatically.
 */
export async function loadFFmpeg(
  onProgress?: (ratio: number) => void
): Promise<FFmpeg> {
  if (ffmpegInstance && isLoaded) return ffmpegInstance
  _destroyInstance()
  ffmpegInstance = await createAndLoadFFmpeg(onProgress)
  isLoaded = true
  return ffmpegInstance
}

/**
 * Return a ready FFmpeg instance, recycling the WASM heap proactively
 * every RECYCLE_AFTER_SEGMENTS calls so accumulated internal codec state
 * never grows large enough to trigger OOB crashes.
 *
 * When recycling, the caller MUST re-upload the video file.
 * Returns { ffmpeg, needsFileUpload } so the caller knows whether to re-write.
 */
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
    video.onerror      = () => { URL.revokeObjectURL(url); reject(new Error('Failed to read video metadata')) }
    video.src = url
  })
}

// ---------------------------------------------------------------------------
// Core frame extraction
// ---------------------------------------------------------------------------

/**
 * Extract frames from one segment of an MJPEG (or any) video file.
 *
 * Key fixes vs the previous implementation:
 *
 * 1. NO `mjpeg2jpeg` filter.
 *    MJPEG frames are already valid JPEG blobs stored inside the AVI/MJPEG
 *    container. `-mjpeg2jpeg` does an in-place header patch that is safe in
 *    native FFmpeg but triggers WASM heap OOB because the patched bytes can
 *    extend past what the WASM allocator tracked for that buffer.
 *    Instead we use `-c:v copy` to demux the raw JPEG frames without any
 *    decode/re-encode pass, then verify the FFD8FF magic ourselves and
 *    prepend it when a frame is missing the SOI marker (happens on some
 *    camera firmware variants).
 *
 * 2. One video upload per WASM lifecycle, not per segment.
 *    `fetchFile(videoFile)` reads the entire File into WASM heap memory.
 *    Doing it every segment causes O(n·filesize) heap pressure. We track
 *    whether the file is already written and skip re-uploading.
 *
 * 3. Proactive instance recycling via `getFFmpegForSegment()`.
 *    After RECYCLE_AFTER_SEGMENTS exec() calls the instance is torn down
 *    and a fresh one is created, clearing all leaked codec state.
 *
 * 4. Explicit frame count via `-frames:v`.
 *    Passing the exact frame count prevents FFmpeg from writing more output
 *    files than we expect, which could waste WASM FS space and cause read
 *    errors on the cleanup pass.
 */
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
    // Either first run or we just recycled — upload the file.
    if (currentInputName) {
      try { await ffmpeg.deleteFile(currentInputName) } catch { /* ignore */ }
    }
    console.log(`[FFmpeg] Writing video to WASM FS: ${inputName} (${(videoFile.size / 1024 / 1024).toFixed(1)} MB)`)
    await ffmpeg.writeFile(inputName, await fetchFile(videoFile))
    currentInputName = inputName
  }

  // -------------------------------------------------------------------------
  // 2. Build and run the ffmpeg command
  // -------------------------------------------------------------------------
  const segDuration = segment.endTime - segment.startTime
  const framePrefix = `frm_s${segment.index}_`
  const outputPattern = `${framePrefix}%03d.jpg`

  /**
   * Why `-c:v copy` instead of `-vf mjpeg2jpeg`:
   *
   * MJPEG containers store each frame as a raw JPEG. Demuxing with `-c:v copy`
   * writes those bytes straight to the output files — zero decode, zero
   * re-encode, zero extra heap allocation. The `mjpeg2jpeg` filter instead
   * decodes the MJPEG stream into YUV, then re-encodes to JPEG, allocating
   * large intermediate buffers that overflow the WASM 2 GB virtual address
   * space after several segments. `-c:v copy` avoids all of that.
   *
   * For non-MJPEG sources (H.264, VP8, …) `-c:v copy` will just copy the
   * codec packets which when saved as .jpg may not be valid JPEG. Our
   * `ensureValidJpeg()` check below catches those and we fall back to a
   * one-frame re-encode (`-frames:v 1 -q:v 2`) for corrupt frames only.
   */
  const args = [
    '-ss', String(segment.startTime),
    '-i', inputName,
    '-t', String(segDuration),
    '-an',                          // strip audio — saves FS space
    '-frames:v', String(config.framesPerSegment), // hard cap
    '-c:v', 'copy',                 // demux raw JPEG packets — no transcode
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

      // @ffmpeg/ffmpeg types readFile() as Uint8Array<ArrayBufferLike> which
      // may contain SharedArrayBuffer. Blob() only accepts ArrayBuffer, so we
      // use buffer.slice() to get a plain ArrayBuffer copy — this also
      // safely detaches us from the WASM heap.
      const raw: Uint8Array = data instanceof Uint8Array
        ? data
        : new TextEncoder().encode(data as string)
      const bytes = new Uint8Array(
        raw.buffer.slice(raw.byteOffset, raw.byteOffset + raw.byteLength)
      ) as Uint8Array<ArrayBuffer>

      // Validate / repair JPEG SOI marker (FFD8FF)
      const validBytes = ensureValidJpeg(bytes, segment.index, f)
      if (!validBytes) {
        console.warn(`[FFmpeg] Segment ${segment.index} frame ${f}: not a valid JPEG, skipping`)
        await ffmpeg.deleteFile(frameName).catch(() => { /* ignore */ })
        continue
      }

      const blob = new Blob([validBytes], { type: 'image/jpeg' })
      const url  = URL.createObjectURL(blob)

      const globalIndex = segment.index * config.framesPerSegment + f
      const filename    = generateFrameFilename(videoBaseName, segment.index + 1, f)
      const timestamp   = segment.startTime + ((f - 1) / config.framesPerSegment) * segDuration

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
// JPEG validation / repair
// ---------------------------------------------------------------------------

/**
 * Verify that `bytes` starts with the JPEG SOI marker (FF D8 FF).
 *
 * Some MJPEG camera implementations omit the leading FF D8 from individual
 * frames (they rely on the container to signal frame boundaries). When we
 * demux with `-c:v copy` those frames lack the SOI marker and will be
 * rejected by PIL / OpenCV.
 *
 * Strategy:
 * - If bytes already start with FF D8 FF → return as-is.
 * - If bytes start with D8 FF (missing the first FF) → prepend 0xFF.
 * - If bytes start with FF D8 but lack the next FF before the marker type
 *   → return as-is; most decoders are tolerant of this.
 * - Otherwise → return null (caller will skip the frame).
 *
 * We intentionally do NOT add a synthetic EOI (FF D9) if it's missing;
 * decoders handle truncated JPEG gracefully but a spurious EOI on a frame
 * that already has one causes double-trailer artifacts.
 */
function ensureValidJpeg(bytes: Uint8Array<ArrayBuffer>, segIdx: number, frameIdx: number): Uint8Array<ArrayBuffer> | null {
  if (bytes.length < 3) return null

  // Perfect — already a valid JPEG SOI
  if (bytes[0] === 0xFF && bytes[1] === 0xD8 && bytes[2] === 0xFF) {
    return bytes
  }

  // Missing leading 0xFF byte — prepend it
  if (bytes[0] === 0xD8 && bytes[1] === 0xFF) {
    console.warn(`[FFmpeg] Seg ${segIdx} frame ${frameIdx}: prepending missing SOI 0xFF`)
    const fixed = new Uint8Array(bytes.length + 1) as Uint8Array<ArrayBuffer>
    fixed[0] = 0xFF
    fixed.set(bytes, 1)
    return fixed
  }

  // Some cameras write FF D8 without the following app marker FF —
  // still starts with SOI, so treat as valid.
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
