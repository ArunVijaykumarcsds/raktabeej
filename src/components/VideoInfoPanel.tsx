import { Film, RotateCcw } from 'lucide-react'
import { formatDuration, formatFileSize } from '../utils/format'
import type { VideoInfo } from '../types'

interface VideoInfoPanelProps {
  video: VideoInfo
  onReset: () => void
}

export function VideoInfoPanel({ video, onReset }: VideoInfoPanelProps) {
  const stats = [
    { label: 'File', value: video.name, mono: true },
    { label: 'Duration', value: formatDuration(video.duration), mono: true },
    { label: 'Size', value: formatFileSize(video.size), mono: true },
  ]

  return (
    <div className="panel p-5 flex items-center gap-4 flex-wrap">
      <div className="w-10 h-10 rounded-lg bg-blood-950/60 border border-blood-900/50 flex items-center justify-center shrink-0">
        <Film size={18} className="text-blood-500" />
      </div>

      <div className="flex-1 min-w-0 flex flex-wrap gap-x-8 gap-y-2">
        {stats.map(({ label, value, mono }) => (
          <div key={label} className="flex flex-col">
            <span className="text-xs text-stone-600 font-sans">{label}</span>
            <span className={`text-sm text-stone-300 truncate max-w-[200px] ${mono ? 'font-mono' : ''}`} title={value}>
              {value}
            </span>
          </div>
        ))}
      </div>

      <button
        onClick={onReset}
        className="flex items-center gap-1.5 text-xs text-stone-500 hover:text-stone-300 transition-colors shrink-0 font-sans"
      >
        <RotateCcw size={12} />
        Reset
      </button>
    </div>
  )
}
