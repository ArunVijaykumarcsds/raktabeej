import { useState } from 'react'
import { ChevronDown, Download, Clock, CheckCircle, Loader, AlertCircle } from 'lucide-react'
import { FrameCard } from './FrameCard'
import { formatTimestamp } from '../utils/format'
import type { SegmentInfo, ExtractedFrame, GalleryView } from '../types'

interface SegmentAccordionProps {
  segment: SegmentInfo
  videoBaseName: string
  view: GalleryView
  onDownloadFrame: (frame: ExtractedFrame) => void
  onPreviewFrame: (frame: ExtractedFrame) => void
  onDownloadSegment: (segment: SegmentInfo) => void
  recentFrameIds: Set<number>
}

const statusIcons = {
  pending:    <div className="w-2 h-2 rounded-full bg-stone-700" />,
  processing: <Loader size={14} className="text-blood-500 animate-spin" />,
  done:       <CheckCircle size={14} className="text-emerald-700" />,
  error:      <AlertCircle size={14} className="text-red-700" />,
}

export function SegmentAccordion({
  segment, videoBaseName, view,
  onDownloadFrame, onPreviewFrame, onDownloadSegment, recentFrameIds
}: SegmentAccordionProps) {
  const [open, setOpen] = useState(segment.status === 'processing' || segment.status === 'done')

  const isActive = segment.status === 'processing'

  return (
    <div className={`
      panel overflow-hidden transition-all duration-300
      ${isActive ? 'border-blood-900/60' : ''}
    `}>
      {/* Header */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-charcoal-800/40 transition-colors"
      >
        <div className="w-5 flex items-center justify-center shrink-0">
          {statusIcons[segment.status]}
        </div>

        <div className="flex-1 min-w-0 flex items-center gap-3 flex-wrap">
          <span className="font-mono text-sm text-stone-300">
            Seg {String(segment.index + 1).padStart(2, '0')}
          </span>
          <span className="flex items-center gap-1 text-xs text-stone-600 font-mono">
            <Clock size={10} />
            {formatTimestamp(segment.startTime)} → {formatTimestamp(segment.endTime)}
          </span>
          <span className="text-xs text-stone-600">
            {segment.frames.length} / {segment.frameCount} frames
          </span>
        </div>

        {segment.status === 'done' && (
          <button
            onClick={e => { e.stopPropagation(); onDownloadSegment(segment) }}
            className="flex items-center gap-1 text-xs text-stone-500 hover:text-blood-400 transition-colors font-sans px-2 py-1 rounded hover:bg-blood-950/40"
            title={`Download ${videoBaseName} segment ${segment.index + 1}`}
          >
            <Download size={12} />
            ZIP
          </button>
        )}

        <ChevronDown
          size={14}
          className={`text-stone-600 transition-transform duration-200 shrink-0 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Frame grid / timeline */}
      {open && segment.frames.length > 0 && (
        <div className="border-t border-stone-800/40 p-3">
          {view === 'grid' ? (
            <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-1.5">
              {segment.frames.map(frame => (
                <FrameCard
                  key={frame.globalIndex}
                  frame={frame}
                  isNew={recentFrameIds.has(frame.globalIndex)}
                  onDownload={onDownloadFrame}
                  onPreview={onPreviewFrame}
                />
              ))}
              {/* Skeleton placeholders for pending frames */}
              {segment.status === 'processing' &&
                Array.from({ length: segment.frameCount - segment.frames.length }, (_, i) => (
                  <div key={`sk-${i}`} className="skeleton aspect-video rounded" />
                ))
              }
            </div>
          ) : (
            /* Timeline view */
            <div className="space-y-1">
              {segment.frames.map(frame => (
                <div
                  key={frame.globalIndex}
                  className="flex items-center gap-3 p-2 rounded hover:bg-charcoal-800/40 group transition-colors"
                >
                  <img
                    src={frame.url}
                    alt={frame.filename}
                    loading="lazy"
                    className="w-16 h-9 object-cover rounded border border-stone-800/60"
                  />
                  <span className="font-mono text-xs text-stone-500 w-20 shrink-0">{formatTimestamp(frame.timestamp)}</span>
                  <span className="font-mono text-xs text-stone-600 flex-1 truncate">{frame.filename}</span>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => onPreviewFrame(frame)} className="btn-secondary p-1.5 !gap-0">
                      <span className="sr-only">Preview</span>↗
                    </button>
                    <button onClick={() => onDownloadFrame(frame)} className="btn-secondary p-1.5 !gap-0">
                      <Download size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Processing active indicator */}
      {isActive && open && segment.frames.length === 0 && (
        <div className="border-t border-stone-800/40 p-4 flex items-center justify-center gap-2">
          <Loader size={14} className="text-blood-600 animate-spin" />
          <span className="text-xs text-stone-500 font-sans">Extracting frames…</span>
        </div>
      )}
    </div>
  )
}
