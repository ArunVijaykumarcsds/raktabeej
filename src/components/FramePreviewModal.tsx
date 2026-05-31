import { useEffect, useCallback } from 'react'
import { X, ChevronLeft, ChevronRight, Download } from 'lucide-react'
import { formatTimestamp } from '../utils/format'
import type { ExtractedFrame } from '../types'

interface FramePreviewModalProps {
  frame: ExtractedFrame | null
  allFrames: ExtractedFrame[]
  onClose: () => void
  onDownload: (frame: ExtractedFrame) => void
  onNavigate: (frame: ExtractedFrame) => void
}

export function FramePreviewModal({ frame, allFrames, onClose, onDownload, onNavigate }: FramePreviewModalProps) {
  const currentIdx = frame ? allFrames.findIndex(f => f.globalIndex === frame.globalIndex) : -1

  const goNext = useCallback(() => {
    if (currentIdx < allFrames.length - 1) onNavigate(allFrames[currentIdx + 1])
  }, [currentIdx, allFrames, onNavigate])

  const goPrev = useCallback(() => {
    if (currentIdx > 0) onNavigate(allFrames[currentIdx - 1])
  }, [currentIdx, allFrames, onNavigate])

  useEffect(() => {
    if (!frame) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight') goNext()
      if (e.key === 'ArrowLeft') goPrev()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [frame, onClose, goNext, goPrev])

  if (!frame) return null

  return (
    <div
      className="fixed inset-0 z-50 bg-charcoal-900/95 backdrop-blur-md flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="relative max-w-5xl w-full panel overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Top bar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-stone-800/60">
          <div className="font-mono text-xs text-stone-500">
            Frame {frame.globalIndex} · Seg {frame.segmentIndex + 1} · {formatTimestamp(frame.timestamp)}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onDownload(frame)}
              className="btn-secondary py-1"
            >
              <Download size={13} />
              Download
            </button>
            <button onClick={onClose} className="p-1.5 rounded hover:bg-charcoal-800 text-stone-500 hover:text-stone-300 transition-colors">
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Image */}
        <div className="relative bg-charcoal-900">
          <img
            src={frame.url}
            alt={frame.filename}
            className="w-full max-h-[75vh] object-contain"
          />

          {/* Navigation arrows */}
          {currentIdx > 0 && (
            <button
              onClick={goPrev}
              className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-charcoal-900/80 border border-stone-700 hover:border-blood-700 text-stone-400 hover:text-stone-200 transition-all"
            >
              <ChevronLeft size={20} />
            </button>
          )}
          {currentIdx < allFrames.length - 1 && (
            <button
              onClick={goNext}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-charcoal-900/80 border border-stone-700 hover:border-blood-700 text-stone-400 hover:text-stone-200 transition-all"
            >
              <ChevronRight size={20} />
            </button>
          )}
        </div>

        {/* Bottom filename */}
        <div className="px-4 py-2 border-t border-stone-800/40">
          <p className="font-mono text-xs text-stone-600 truncate">{frame.filename}</p>
        </div>
      </div>
    </div>
  )
}
