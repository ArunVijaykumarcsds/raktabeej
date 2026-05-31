import { LayoutGrid, AlignLeft, Download, FileJson, Loader } from 'lucide-react'
import type { GalleryView, SegmentInfo, VideoInfo } from '../types'

interface GalleryToolbarProps {
  view: GalleryView
  onViewChange: (v: GalleryView) => void
  segments: SegmentInfo[]
  videoInfo: VideoInfo
  config: { segmentSize: number; framesPerSegment: number }
  totalFrames: number
  isDownloading: boolean
  downloadProgress: number
  onDownloadAll: () => void
  onDownloadManifest: () => void
}

export function GalleryToolbar({
  view, onViewChange, totalFrames,
  isDownloading, downloadProgress,
  onDownloadAll, onDownloadManifest,
}: GalleryToolbarProps) {
  return (
    <div className="flex items-center justify-between gap-4 flex-wrap">
      {/* Left: frame count + view toggle */}
      <div className="flex items-center gap-3">
        <span className="font-serif text-lg text-stone-300">
          <span className="text-blood-400 font-semibold">{totalFrames.toLocaleString()}</span>
          {' '}frames generated
        </span>
        <div className="flex rounded overflow-hidden border border-stone-700">
          <button
            onClick={() => onViewChange('grid')}
            className={`p-1.5 transition-colors ${view === 'grid' ? 'bg-blood-950 text-blood-400' : 'text-stone-500 hover:text-stone-300 hover:bg-charcoal-800'}`}
            title="Grid view"
          >
            <LayoutGrid size={15} />
          </button>
          <button
            onClick={() => onViewChange('timeline')}
            className={`p-1.5 transition-colors ${view === 'timeline' ? 'bg-blood-950 text-blood-400' : 'text-stone-500 hover:text-stone-300 hover:bg-charcoal-800'}`}
            title="Timeline view"
          >
            <AlignLeft size={15} />
          </button>
        </div>
      </div>

      {/* Right: export buttons */}
      <div className="flex items-center gap-2">
        <button onClick={onDownloadManifest} className="btn-secondary">
          <FileJson size={14} />
          Manifest JSON
        </button>
        <button
          onClick={onDownloadAll}
          disabled={isDownloading}
          className="btn-primary"
        >
          {isDownloading ? (
            <>
              <Loader size={14} className="animate-spin" />
              {downloadProgress > 0 ? `${Math.round(downloadProgress)}%` : 'Building…'}
            </>
          ) : (
            <>
              <Download size={14} />
              Export Dataset ZIP
            </>
          )}
        </button>
      </div>
    </div>
  )
}
