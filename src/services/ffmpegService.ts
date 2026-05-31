import { FFmpeg } from '@ffmpeg/ffmpeg'
import { fetchFile, toBlobURL } from '@ffmpeg/util'
import { generateFrameFilename } from '../utils/format'
import type { ExtractedFrame, SegmentInfo, ProcessingConfig } from '../types'

const FFMPEG_CORE_BASE = 'https://cdn.jsdelivr.net/npm/@ffmpeg/core-mt@0.12.6/dist/esm'
const RECYCLE_AFTER_SEGMENTS = 5

let ffmpegInstance: FFmpeg | null = null
let isLoaded = false
let currentInputName: string | null = null
let execCallCount = 0

async function createAndLoadFFmpeg(onProgress?: (ratio: number) => void): Promise<FFmpeg> {
  const ffmpeg = new FFmpeg()
  ffmpeg.on('log', ({ message }) => console.log('[FFmpeg]', message))
  if (onProgress) ffmpeg.on('progress', ({ progress }) => onProgress(progress))
  await ffmpeg.load({
    coreURL: '/ffmpeg-core.js',
    wasmURL: '/ffmpeg-core.wasm',
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
}

export async function loadFFmpeg(onProgress?: (ratio: number) => void): Promise<FFmpeg> {
  if (ffmpegInstance && isLoaded) return ffmpegInstance
  _destroyInstance()
  ffmpegInstance = await createAndLoadFFmpeg(onProgress)
  isLoaded = true
  return ffmpegInstance
}

export async function getFFmpegForSegment(
  onProgress?: (ratio: number) => void
): Promise<{ ffmpeg: FFmpeg; needsFileUpload: boolean }> {
  const shouldRecycle = !ffmpegInstance || !isLoaded || execCallCount >= RECYCLE_AFTER_SEGMENTS
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

  const ext = videoFile.name.split('.').pop()?.toLowerCase() ?? 'mp4'
  const inputName = `input_video.${ext}`

  if (currentInputName !== inputName) {
    if (currentInputName) {
      try { await ffmpeg.deleteFile(currentInputName) } catch { /* ignore */ }
    }
    console.log(`[FFmpeg] Writing video to WASM FS: ${inputName} (${(videoFile.size / 1024 / 1024).toFixed(1)} MB)`)
    await ffmpeg.writeFile(inputName, await fetchFile(videoFile))
    currentInputName = inputName
  }

  const segDuration = segment.endTime - segment.startTime
  const framePrefix = `frm_s${segment.index}_`
  const outputPattern = `${framePrefix}%03d.jpg`

  const args = [
    '-ss', String(segment.startTime),
    '-i', inputName,
    '-t', String(segDuration),
    '-an',
    '-frames:v', String(config.framesPerSegment),
    '-c:v', 'copy',
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

      const validBytes = ensureValidJpeg(bytes, segment.index, f)
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

function ensureValidJpeg(bytes: Uint8Array<ArrayBuffer>, segIdx: number, frameIdx: number): Uint8Array<ArrayBuffer> | null {
  if (bytes.length < 3) return null
  if (bytes[0] === 0xFF && bytes[1] === 0xD8 && bytes[2] === 0xFF) return bytes
  if (bytes[0] === 0xD8 && bytes[1] === 0xFF) {
    console.warn(`[FFmpeg] Seg ${segIdx} frame ${frameIdx}: prepending missing SOI 0xFF`)
    const fixed = new Uint8Array(bytes.length + 1) as Uint8Array<ArrayBuffer>
    fixed[0] = 0xFF
    fixed.set(bytes, 1)
    return fixed
  }
  if (bytes[0] === 0xFF && bytes[1] === 0xD8) return bytes
  return null
}

export function destroyFFmpeg() {
  _destroyInstance()
}
