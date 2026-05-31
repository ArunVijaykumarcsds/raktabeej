import { useState, useCallback } from 'react'
import {
  downloadSingleFrame,
  downloadSegmentZip,
  downloadCompleteDataset,
  downloadManifestOnly,
} from '../services/downloadService'
import type { ExtractedFrame, SegmentInfo, VideoInfo } from '../types'

interface UseDownloadReturn {
  isDownloading: boolean
  downloadProgress: number
  downloadFrame: (frame: ExtractedFrame) => Promise<void>
  downloadSegment: (segment: SegmentInfo, videoBaseName: string) => Promise<void>
  downloadAll: (segments: SegmentInfo[], videoInfo: VideoInfo, config: { segmentSize: number; framesPerSegment: number }) => Promise<void>
  downloadManifest: (segments: SegmentInfo[], videoInfo: VideoInfo, config: { segmentSize: number; framesPerSegment: number }) => void
}

export function useDownload(): UseDownloadReturn {
  const [isDownloading, setIsDownloading] = useState(false)
  const [downloadProgress, setDownloadProgress] = useState(0)

  const downloadFrame = useCallback(async (frame: ExtractedFrame) => {
    await downloadSingleFrame(frame)
  }, [])

  const downloadSegment = useCallback(async (segment: SegmentInfo, videoBaseName: string) => {
    setIsDownloading(true)
    setDownloadProgress(0)
    try {
      await downloadSegmentZip(segment, videoBaseName, setDownloadProgress)
    } finally {
      setIsDownloading(false)
      setDownloadProgress(0)
    }
  }, [])

  const downloadAll = useCallback(async (
    segments: SegmentInfo[],
    videoInfo: VideoInfo,
    config: { segmentSize: number; framesPerSegment: number }
  ) => {
    setIsDownloading(true)
    setDownloadProgress(0)
    try {
      await downloadCompleteDataset(segments, videoInfo, config, setDownloadProgress)
    } finally {
      setIsDownloading(false)
      setDownloadProgress(0)
    }
  }, [])

  const downloadManifest = useCallback((
    segments: SegmentInfo[],
    videoInfo: VideoInfo,
    config: { segmentSize: number; framesPerSegment: number }
  ) => {
    downloadManifestOnly(segments, videoInfo, config)
  }, [])

  return { isDownloading, downloadProgress, downloadFrame, downloadSegment, downloadAll, downloadManifest }
}
