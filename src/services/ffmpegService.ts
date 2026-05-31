import { FFmpeg } from '@ffmpeg/ffmpeg'
import { fetchFile, toBlobURL } from '@ffmpeg/util'
import { generateFrameFilename } from '../utils/format'
import type { ExtractedFrame, SegmentInfo, ProcessingConfig } from '../types'

let ffmpegInstance: FFmpeg | null = null
let isLoaded = false

export async function loadFFmpeg(
  onProgress?: (ratio: number) => void
): Promise<FFmpeg> {
  if (ffmpegInstance && isLoaded) return ffmpegInstance

  const ffmpeg = new FFmpeg()

  if (onProgress) {
    ffmpeg.on('progress', ({ progress }) => onProgress(progress))
  }

  const baseURL = 'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.6/dist/esm'
  await ffmpeg.load({
    coreURL:   await toBlobURL(`${baseURL}/ffmpeg-core.js`,   'text/javascript'),
    wasmURL:   await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
    workerURL: await toBlobURL(`${baseURL}/ffmpeg-core.worker.js`, 'text/javascript'),
  })

  ffmpegInstance = ffmpeg
  isLoaded = true
  return ffmpeg
}

export async function getVideoDuration(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video')
    video.preload = 'metadata'
    const url = URL.createObjectURL(file)
    video.onloadedmetadata = () => {
      URL.revokeObjectURL(url)
      resolve(video.duration)
    }
    video.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Failed to read video metadata'))
    }
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

  const inputName = `input_seg${segment.index}.${videoFile.name.split('.').pop() ?? 'mp4'}`
  const frames: ExtractedFrame[] = []

  await ffmpeg.writeFile(inputName, await fetchFile(videoFile))

  const segDuration = segment.endTime - segment.startTime
  const fps = config.framesPerSegment / segDuration
  const outputPattern = `frame_s${segment.index}_%03d.jpg`

  await ffmpeg.exec([
    '-ss', String(segment.startTime),
    '-i', inputName,
    '-t', String(segDuration),
    '-vf', `fps=${fps}`,
    '-frames:v', String(config.framesPerSegment),
    '-q:v', '2',
    '-f', 'image2',
    outputPattern,
  ])

  for (let f = 1; f <= config.framesPerSegment; f++) {
    if (signal?.aborted) break

    const frameName = `frame_s${segment.index}_${String(f).padStart(3, '0')}.jpg`
    try {
      const data = await ffmpeg.readFile(frameName)
      const bytes = data instanceof Uint8Array ? data : new TextEncoder().encode(data as string)
      const copy = new Uint8Array(bytes.length)
        copy.set(bytes)
      const blob = new Blob([copy], { type: 'image/jpeg' })
      
      const url = URL.createObjectURL(blob)
      const globalIndex = segment.index * config.framesPerSegment + f
      const filename = generateFrameFilename(videoBaseName, segment.index + 1, f)

      const frame: ExtractedFrame = {
        segmentIndex: segment.index,
        frameIndex: f,
        globalIndex,
        filename,
        url,
        timestamp: segment.startTime + (f / config.framesPerSegment) * segDuration,
      }

      frames.push(frame)
      onFrameExtracted(frame)
      await ffmpeg.deleteFile(frameName)
    } catch {
      // Frame may not have been generated if video is shorter than expected
    }
  }

  // Cleanup
  try { await ffmpeg.deleteFile(inputName) } catch { /* ignore */ }

  return frames
}

export function destroyFFmpeg() {
  if (ffmpegInstance) {
    try { ffmpegInstance.terminate() } catch { /* ignore */ }
    ffmpegInstance = null
    isLoaded = false
  }
}
