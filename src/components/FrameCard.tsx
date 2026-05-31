import { Download, Expand } from 'lucide-react'
import { formatTimestamp } from '../utils/format'
import type { ExtractedFrame } from '../types'

interface FrameCardProps {
  frame: ExtractedFrame
  isNew?: boolean
  onDownload: (frame: ExtractedFrame) => void
  onPreview: (frame: ExtractedFrame) => void
}

export function FrameCard({ frame, isNew, onDownload, onPreview }: FrameCardProps) {
  return (
    <div className={`frame-card group ${isNew ? 'new' : ''}`}>
      {/* Thumbnail */}
      <div className="aspect-video bg-charcoal-900 overflow-hidden">
        <img
          src={frame.url}
          alt={frame.filename}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>

      {/* Overlay on hover */}
      <div className="absolute inset-0 bg-charcoal-900/80 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2">
        <button
          onClick={() => onPreview(frame)}
          className="p-2 rounded-lg bg-charcoal-800 border border-stone-700 hover:border-blood-700 text-stone-300 hover:text-stone-100 transition-all"
          title="Preview"
        >
          <Expand size={14} />
        </button>
        <button
          onClick={() => onDownload(frame)}
          className="p-2 rounded-lg bg-blood-950 border border-blood-800 hover:border-blood-600 text-blood-400 hover:text-blood-300 transition-all"
          title="Download"
        >
          <Download size={14} />
        </button>
      </div>

      {/* Footer info */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-charcoal-900/95 to-transparent px-2 py-1.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono text-stone-500">
            {formatTimestamp(frame.timestamp)}
          </span>
          <span className="text-xs font-mono text-blood-700">
            F{String(frame.frameIndex).padStart(3, '0')}
          </span>
        </div>
      </div>
    </div>
  )
}
