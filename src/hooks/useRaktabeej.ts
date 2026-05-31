import { useState, useCallback, useRef } from 'react'
import { loadFFmpeg, getVideoDuration, extractSegmentFrames, destroyFFmpeg } from '../services/ffmpegService'
import { extractVideoFromZip } from '../services/zipExtractService'
import { computeSegmentCount } from '../utils/format'
import type {
  VideoInfo, SegmentInfo, ExtractedFrame,
  ProcessingConfig, ProcessingState, ProcessingPhase
} from '../types'

interface UseRaktabeejReturn {
  videoInfo: VideoInfo | null
  segments: SegmentInfo[]
  processingState: ProcessingState
  config: ProcessingConfig
  setConfig: (c: ProcessingConfig) => void
  handleFile: (file: File, isZip: boolean) => Promise<void>
  startExtraction: () => Promise<void>
  reset: () => void
  abort: () => void
  expectedFrameCount: number
  expectedSegmentCount: number
}

const initialState: ProcessingState = {
  phase: 'idle',
  currentSegment: 0,
  totalSegments: 0,
  currentFrameInSegment: 0,
  totalFramesExtracted: 0,
  totalFramesExpected: 0,
  message: '',
}

const initialConfig: ProcessingConfig = {
  segmentSize: 2,
  framesPerSegment: 50,
}

export function useRaktabeej(): UseRaktabeejReturn {
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null)
  const [segments, setSegments] = useState<SegmentInfo[]>([])
  const [processingState, setProcessingState] = useState<ProcessingState>(initialState)
  const [config, setConfig] = useState<ProcessingConfig>(initialConfig)

  const abortRef = useRef<AbortController | null>(null)
  const videoFileRef = useRef<File | null>(null)

  const setState = useCallback((phase: ProcessingPhase, message: string, extra?: Partial<ProcessingState>) => {
    setProcessingState(prev => ({ ...prev, phase, message, ...extra }))
  }, [])

  const handleFile = useCallback(async (file: File, isZip: boolean) => {
    setState('loading', isZip ? 'Extracting video from ZIP archive…' : 'Reading video metadata…')
    try {
      let videoFile = file
      if (isZip) {
        setState('loading', 'Scanning ZIP archive for video file…')
        videoFile = await extractVideoFromZip(file)
        setState('loading', `Found: ${videoFile.name}. Reading metadata…`)
      }

      const duration = await getVideoDuration(videoFile)
      if (!isFinite(duration) || duration <= 0) throw new Error('Could not determine video duration.')

      videoFileRef.current = videoFile
      setVideoInfo({
        name: videoFile.name,
        size: videoFile.size,
        duration,
        type: videoFile.type,
      })
      setState('idle', '')
    } catch (err) {
      setState('error', '', { error: err instanceof Error ? err.message : 'Failed to load video.' })
    }
  }, [setState])

  const startExtraction = useCallback(async () => {
    const videoFile = videoFileRef.current
    if (!videoFile || !videoInfo) return

    abortRef.current = new AbortController()
    const signal = abortRef.current.signal

    const segCount = computeSegmentCount(videoInfo.duration, config.segmentSize)
    const totalExpected = segCount * config.framesPerSegment

    setSegments([])
    setState('loading', 'Initializing FFmpeg engine…', {
      totalSegments: segCount,
      totalFramesExpected: totalExpected,
      currentSegment: 0,
      totalFramesExtracted: 0,
    })

    try {
      const ffmpeg = await loadFFmpeg()

      if (signal.aborted) return

      // Build initial segment list
      const initialSegments: SegmentInfo[] = Array.from({ length: segCount }, (_, i) => ({
        index: i,
        startTime: i * config.segmentSize,
        endTime: Math.min((i + 1) * config.segmentSize, videoInfo.duration),
        frameCount: config.framesPerSegment,
        frames: [],
        status: 'pending',
      }))
      setSegments(initialSegments)

      const videoBaseName = videoInfo.name.replace(/\.[^/.]+$/, '')
      let totalExtracted = 0

      for (let i = 0; i < segCount; i++) {
        if (signal.aborted) break

        setState('extracting', `Processing segment ${i + 1} of ${segCount}…`, {
          currentSegment: i + 1,
          totalSegments: segCount,
          totalFramesExtracted: totalExtracted,
        })

        setSegments(prev => prev.map(s =>
          s.index === i ? { ...s, status: 'processing' } : s
        ))

        const segment = initialSegments[i]
        const extractedFrames: ExtractedFrame[] = []

        try {
          await extractSegmentFrames(
            ffmpeg,
            videoFile,
            videoBaseName,
            segment,
            config,
            (frame) => {
              extractedFrames.push(frame)
              totalExtracted++
              setSegments(prev => prev.map(s =>
                s.index === i ? { ...s, frames: [...extractedFrames] } : s
              ))
              setProcessingState(prev => ({ ...prev, totalFramesExtracted: totalExtracted }))
            },
            signal
          )

          setSegments(prev => prev.map(s =>
            s.index === i ? { ...s, frames: extractedFrames, status: 'done' } : s
          ))
        } catch {
          setSegments(prev => prev.map(s =>
            s.index === i ? { ...s, status: 'error' } : s
          ))
        }
      }

      if (!signal.aborted) {
        setState('done', `Extraction complete. ${totalExtracted} frames generated.`, {
          totalFramesExtracted: totalExtracted,
          currentSegment: segCount,
        })
      }
    } catch (err) {
      setState('error', '', { error: err instanceof Error ? err.message : 'Extraction failed.' })
    }
  }, [videoInfo, config, setState])

  const abort = useCallback(() => {
    abortRef.current?.abort()
    setState('idle', '')
  }, [setState])

  const reset = useCallback(() => {
    abortRef.current?.abort()
    destroyFFmpeg()
    videoFileRef.current = null
    setVideoInfo(null)
    setSegments([])
    setProcessingState(initialState)
  }, [])

  const expectedSegmentCount = videoInfo
    ? computeSegmentCount(videoInfo.duration, config.segmentSize)
    : 0
  const expectedFrameCount = expectedSegmentCount * config.framesPerSegment

  return {
    videoInfo,
    segments,
    processingState,
    config,
    setConfig,
    handleFile,
    startExtraction,
    reset,
    abort,
    expectedFrameCount,
    expectedSegmentCount,
  }
}
