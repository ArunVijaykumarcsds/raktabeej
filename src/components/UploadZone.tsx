import { useRef } from 'react'
import { Upload, Archive, Film } from 'lucide-react'
import { useDropZone } from '../hooks/useDropZone'

interface UploadZoneProps {
  onFile: (file: File, isZip: boolean) => void
}

export function UploadZone({ onFile }: UploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const { isDragging, dragError, onDragOver, onDragLeave, onDrop, onFileSelect, clearError } = useDropZone(onFile)

  return (
    <div className="relative">
      {/* Outer decorative frame */}
      <div className="absolute -inset-px rounded-xl border border-blood-900/40 pointer-events-none" />

      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        className={`
          relative rounded-xl border-2 border-dashed cursor-pointer
          flex flex-col items-center justify-center gap-6 py-16 px-8
          transition-all duration-300 group
          ${isDragging
            ? 'border-blood-600 bg-blood-950/30'
            : 'border-stone-700 hover:border-blood-800 bg-charcoal-850/50 hover:bg-charcoal-850/80'
          }
        `}
      >
        {/* Central icon cluster */}
        <div className="relative">
          {isDragging && (
            <>
              <div className="ring-pulse" />
              <div className="ring-pulse" style={{ animationDelay: '0.5s' }} />
            </>
          )}
          <div className={`
            w-20 h-20 rounded-full flex items-center justify-center
            border transition-all duration-300
            ${isDragging ? 'border-blood-600 bg-blood-950/60' : 'border-stone-700 bg-charcoal-850 group-hover:border-blood-800'}
          `}>
            <Upload
              size={32}
              className={`transition-colors duration-300 ${isDragging ? 'text-blood-400' : 'text-stone-500 group-hover:text-blood-600'}`}
            />
          </div>
        </div>

        {/* Text content */}
        <div className="text-center space-y-2">
          <h3 className="font-serif text-xl font-semibold text-stone-200 group-hover:text-stone-100 transition-colors">
            {isDragging ? 'Release to begin' : 'Offer your video'}
          </h3>
          <p className="text-stone-500 text-sm font-sans max-w-sm">
            Drop a video file to generate your dataset. All processing occurs locally — nothing leaves your device.
          </p>
        </div>

        {/* Format badges */}
        <div className="flex flex-wrap justify-center gap-2">
          {['MP4', 'MOV', 'AVI', 'MKV', 'WEBM', 'MPEG', 'M4V'].map(fmt => (
            <span
              key={fmt}
              className="px-2 py-0.5 rounded text-xs font-mono text-stone-500 bg-charcoal-900/80 border border-stone-800/60"
            >
              {fmt}
            </span>
          ))}
        </div>

        {/* Large file note */}
        <div className="flex items-center gap-2 text-xs text-stone-600 font-sans">
          <Film size={12} className="text-blood-800" />
          <span>Up to 2 GB direct upload</span>
          <span className="text-stone-700">•</span>
          <Archive size={12} className="text-blood-800" />
          <span>ZIP archive for larger files</span>
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="video/mp4,video/quicktime,video/x-msvideo,video/x-matroska,video/webm,video/mpeg,video/x-m4v,.mp4,.mov,.avi,.mkv,.webm,.mpeg,.mpg,.m4v,.zip"
          className="hidden"
          onChange={onFileSelect}
        />
      </div>

      {/* Error state */}
      {dragError && (
        <div className="mt-3 flex items-start gap-2 p-3 rounded-lg bg-blood-950/50 border border-blood-900/60">
          <span className="text-blood-400 text-sm flex-1 font-sans">{dragError}</span>
          <button onClick={clearError} className="text-stone-500 hover:text-stone-300 text-xs shrink-0">✕</button>
        </div>
      )}
    </div>
  )
}
