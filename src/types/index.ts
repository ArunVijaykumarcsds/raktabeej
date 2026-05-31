export type SegmentSize = 0.5 | 1 | 2 | 5 | 10 | 'custom'
export type FramesPerSegment = 10 | 25 | 50 | 100 | 'custom'

export interface ProcessingConfig {
  segmentSize: number        // in seconds
  framesPerSegment: number
}

export interface VideoInfo {
  name: string
  size: number
  duration: number
  type: string
}

export interface SegmentInfo {
  index: number              // 0-based
  startTime: number          // seconds
  endTime: number            // seconds
  frameCount: number
  frames: ExtractedFrame[]
  status: 'pending' | 'processing' | 'done' | 'error'
}

export interface ExtractedFrame {
  segmentIndex: number
  frameIndex: number         // within segment, 1-based
  globalIndex: number        // across all segments, 1-based
  filename: string           // video_segment_01_frame_001.jpg
  url: string                // blob URL
  timestamp: number          // seconds in original video
}

export interface DatasetManifest {
  video_name: string
  duration: number
  total_segments: number
  frames_per_segment: number
  total_frames: number
  segment_size_seconds: number
  generated_at: string
  segments: {
    index: number
    start: number
    end: number
    frames: string[]
  }[]
}

export type ProcessingPhase =
  | 'idle'
  | 'loading'
  | 'segmenting'
  | 'extracting'
  | 'zipping'
  | 'done'
  | 'error'

export interface ProcessingState {
  phase: ProcessingPhase
  currentSegment: number
  totalSegments: number
  currentFrameInSegment: number
  totalFramesExtracted: number
  totalFramesExpected: number
  message: string
  error?: string
}

export type GalleryView = 'grid' | 'timeline'
