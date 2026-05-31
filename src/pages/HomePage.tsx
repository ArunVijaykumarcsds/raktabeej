import { useState, useMemo } from 'react'
import { Play } from 'lucide-react'
import {
  UploadZone, ConfigPanel, VideoInfoPanel,
  ProcessingPanel, SegmentAccordion, FramePreviewModal,
  GalleryToolbar, RaktabeejLore, Footer,
} from '../components'
import { useRaktabeej } from '../hooks/useRaktabeej'
import { useDownload } from '../hooks/useDownload'
import type { ExtractedFrame, GalleryView } from '../types'

export function HomePage() {
  const {
    videoInfo, segments, processingState, config, setConfig,
    handleFile, startExtraction, reset, abort,
    expectedFrameCount, expectedSegmentCount,
  } = useRaktabeej()

  const { isDownloading, downloadProgress, downloadFrame, downloadSegment, downloadAll, downloadManifest } = useDownload()

  const [view, setView] = useState<GalleryView>('grid')
  const [previewFrame, setPreviewFrame] = useState<ExtractedFrame | null>(null)
  const [recentFrameIds] = useState<Set<number>>(new Set())

  const phase = processingState.phase
  const isIdle = phase === 'idle'
  const isProcessing = phase === 'loading' || phase === 'extracting' || phase === 'zipping'
  const isDone = phase === 'done'
  const isError = phase === 'error'

  const allFrames = useMemo(() => segments.flatMap(s => s.frames), [segments])
  const totalExtracted = allFrames.length

  const videoBaseName = videoInfo?.name.replace(/\.[^/.]+$/, '') ?? 'video'

  const handleDownloadAll = () => {
    if (!videoInfo) return
    downloadAll(segments, videoInfo, config)
  }

  const handleDownloadManifest = () => {
    if (!videoInfo) return
    downloadManifest(segments, videoInfo, config)
  }

  return (
    <div className="relative min-h-screen flex flex-col">
      {/* Ancient BG watermark */}
      <div className="rb-bg" aria-hidden="true" />

      <div className="relative z-10 flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">

          {/* ── UPLOAD PHASE ── */}
          {!videoInfo && (
            <div className="max-w-2xl mx-auto space-y-8">
              {/* Hero */}
              <div className="text-center space-y-4 py-8">
                <div className="ornament">
                  <span className="font-mono text-xs text-stone-600 tracking-widest uppercase">
                    Dataset Generation Engine
                  </span>
                </div>
                <h1 className="font-serif text-4xl sm:text-5xl font-bold text-stone-100 leading-tight">
                  One Video.<br />
                  <span className="text-blood-accent">Countless Frames.</span>
                </h1>
                <p className="text-stone-500 font-sans text-base max-w-lg mx-auto">
                  Upload any video. Configure extraction parameters. Generate thousands of structured image samples for AI training, computer vision, and research — entirely in your browser.
                </p>
              </div>

              <UploadZone onFile={handleFile} />

              {/* Formula visualization */}
              <div className="panel p-5">
                <div className="flex items-center justify-center gap-3 text-sm font-mono flex-wrap">
                  <span className="text-stone-400">1 video</span>
                  <span className="text-blood-800">→</span>
                  <span className="text-stone-400">N segments</span>
                  <span className="text-blood-800">→</span>
                  <span className="text-stone-400">50 frames / seg</span>
                  <span className="text-blood-800">→</span>
                  <span className="text-copper font-semibold">N × 50 frames</span>
                </div>
              </div>
            </div>
          )}

          {/* ── CONFIGURED / PROCESSING / DONE ── */}
          {videoInfo && (
            <div className="space-y-6">

              {/* Video info bar */}
              <VideoInfoPanel video={videoInfo} onReset={reset} />

              {/* Error state */}
              {isError && (
                <div className="panel p-5 border-red-900/50 bg-red-950/20 text-red-400 font-sans text-sm">
                  {processingState.error || 'An unexpected error occurred.'}
                </div>
              )}

              {/* Config + Start — only show when idle or error */}
              {(isIdle || isError) && (
                <div className="grid md:grid-cols-2 gap-6">
                  <ConfigPanel
                    config={config}
                    onChange={setConfig}
                    expectedSegments={expectedSegmentCount}
                    expectedFrames={expectedFrameCount}
                    videoDuration={videoInfo.duration}
                  />

                  {/* Launch panel */}
                  <div className="panel p-6 flex flex-col justify-between gap-6">
                    <div className="space-y-4">
                      <h2 className="section-title text-sm text-stone-300 uppercase tracking-widest">Extraction Summary</h2>
                      <div className="space-y-2 font-sans text-sm">
                        {[
                          ['Video duration', `${videoInfo.duration.toFixed(2)}s`],
                          ['Segment size', `${config.segmentSize}s`],
                          ['Segments', String(expectedSegmentCount)],
                          ['Frames / segment', String(config.framesPerSegment)],
                          ['Total frames', expectedFrameCount.toLocaleString()],
                        ].map(([label, value]) => (
                          <div key={label} className="flex justify-between items-center py-1 border-b border-stone-800/30">
                            <span className="text-stone-500">{label}</span>
                            <span className="font-mono text-stone-300">{value}</span>
                          </div>
                        ))}
                      </div>

                      <div className="text-xs text-stone-600 font-sans">
                        Processing occurs entirely in your browser via FFmpeg WebAssembly. No data leaves your device.
                      </div>
                    </div>

                    <button
                      onClick={startExtraction}
                      disabled={expectedFrameCount === 0}
                      className="btn-primary w-full justify-center text-base py-3.5"
                    >
                      <Play size={16} className="fill-current" />
                      Begin Extraction
                    </button>
                  </div>
                </div>
              )}

              {/* Processing panel */}
              {isProcessing && (
                <ProcessingPanel state={processingState} onAbort={abort} />
              )}

              {/* Segment gallery — show during processing and after done */}
              {segments.length > 0 && (
                <div className="space-y-4">
                  {(isDone || isProcessing) && (
                    <GalleryToolbar
                      view={view}
                      onViewChange={setView}
                      segments={segments}
                      videoInfo={videoInfo}
                      config={config}
                      totalFrames={totalExtracted}
                      isDownloading={isDownloading}
                      downloadProgress={downloadProgress}
                      onDownloadAll={handleDownloadAll}
                      onDownloadManifest={handleDownloadManifest}
                    />
                  )}

                  <div className="space-y-3">
                    {segments.map(segment => (
                      <SegmentAccordion
                        key={segment.index}
                        segment={segment}
                        videoBaseName={videoBaseName}
                        view={view}
                        recentFrameIds={recentFrameIds}
                        onDownloadFrame={downloadFrame}
                        onPreviewFrame={setPreviewFrame}
                        onDownloadSegment={seg => downloadSegment(seg, videoBaseName)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Lore section */}
        <RaktabeejLore />
      </div>

      <Footer />

      {/* Lightbox */}
      <FramePreviewModal
        frame={previewFrame}
        allFrames={allFrames}
        onClose={() => setPreviewFrame(null)}
        onDownload={downloadFrame}
        onNavigate={setPreviewFrame}
      />
    </div>
  )
}
