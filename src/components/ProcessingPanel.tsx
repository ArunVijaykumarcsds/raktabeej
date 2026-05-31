import { XCircle } from 'lucide-react'
import type { ProcessingState } from '../types'

interface ProcessingPanelProps {
  state: ProcessingState
  onAbort: () => void
}

export function ProcessingPanel({ state, onAbort }: ProcessingPanelProps) {
  const { phase, currentSegment, totalSegments, totalFramesExtracted, totalFramesExpected, message } = state

  const segProgress = totalSegments > 0 ? (currentSegment / totalSegments) * 100 : 0
  const frameProgress = totalFramesExpected > 0 ? (totalFramesExtracted / totalFramesExpected) * 100 : 0

  const isActive = phase === 'loading' || phase === 'extracting' || phase === 'zipping'

  return (
    <div className="panel p-6 space-y-6">

      {/* Central animation */}
      <div className="flex flex-col items-center gap-4">
        {/* Expanding pulse rings */}
        <div className="relative flex items-center justify-center w-20 h-20">
          {isActive && (
            <>
              <div className="ring-pulse" />
              <div className="ring-pulse" style={{ animationDelay: '0.7s' }} />
              <div className="ring-pulse" style={{ animationDelay: '1.4s' }} />
            </>
          )}
          <div className={`
            w-14 h-14 rounded-full border-2 flex items-center justify-center
            ${isActive ? 'border-blood-700 bg-blood-950/60' : 'border-stone-700 bg-charcoal-850'}
          `}>
            <svg viewBox="0 0 32 32" className={`w-8 h-8 ${isActive ? 'animate-pulse-blood' : ''}`}>
              <path
                d="M16 4 C16 4, 8 14, 8 20 C8 24.4 11.6 28 16 28 C20.4 28 24 24.4 24 20 C24 14 16 4 16 4Z"
                className={isActive ? 'fill-blood-600' : 'fill-stone-600'}
              />
            </svg>
          </div>
        </div>

        {/* Status message */}
        <div className="text-center space-y-1">
          <p className="text-sm text-stone-300 font-sans">{message || 'Preparing…'}</p>
          {phase === 'extracting' && (
            <p className="text-xs text-stone-600 font-mono">
              Segment {currentSegment} of {totalSegments} · {totalFramesExtracted} frames generated
            </p>
          )}
        </div>
      </div>

      {/* Segment progress bar */}
      {totalSegments > 0 && (
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-stone-600 font-mono">
            <span>Segments</span>
            <span>{currentSegment} / {totalSegments}</span>
          </div>
          <div className="h-1.5 rounded-full bg-charcoal-900 overflow-hidden">
            <div
              className="h-full rounded-full bg-blood-700 transition-all duration-500"
              style={{ width: `${segProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Frame progress bar */}
      {totalFramesExpected > 0 && (
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-stone-600 font-mono">
            <span>Frames</span>
            <span>{totalFramesExtracted} / {totalFramesExpected}</span>
          </div>
          <div className="h-1.5 rounded-full bg-charcoal-900 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${frameProgress}%`,
                background: 'linear-gradient(90deg, #7f1d1d, #c81e1e)',
              }}
            />
          </div>
        </div>
      )}

      {/* Segment dots visualizer */}
      {totalSegments > 0 && totalSegments <= 60 && (
        <div className="flex flex-wrap gap-1 justify-center">
          {Array.from({ length: totalSegments }, (_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                i < currentSegment - 1
                  ? 'bg-blood-700'
                  : i === currentSegment - 1
                  ? 'bg-blood-400 animate-pulse-blood scale-125'
                  : 'bg-charcoal-800 border border-stone-700'
              }`}
            />
          ))}
        </div>
      )}

      {/* Abort */}
      {isActive && (
        <div className="flex justify-center">
          <button onClick={onAbort} className="btn-secondary text-red-400 border-red-900/50 hover:border-red-800">
            <XCircle size={14} />
            Abort
          </button>
        </div>
      )}
    </div>
  )
}
