import { useState } from 'react'
import { Settings, Layers, Film } from 'lucide-react'
import type { ProcessingConfig } from '../types'

interface ConfigPanelProps {
  config: ProcessingConfig
  onChange: (c: ProcessingConfig) => void
  expectedSegments: number
  expectedFrames: number
  videoDuration: number
}

const SEGMENT_PRESETS = [0.5, 1, 2, 5, 10] as const
const FRAME_PRESETS = [10, 25, 50, 100] as const

export function ConfigPanel({ config, onChange, expectedSegments, expectedFrames, videoDuration }: ConfigPanelProps) {
  const [customSegment, setCustomSegment] = useState('')
  const [customFrames, setCustomFrames] = useState('')
  const [segmentMode, setSegmentMode] = useState<'preset' | 'custom'>('preset')
  const [frameMode, setFrameMode] = useState<'preset' | 'custom'>('preset')

  const handleSegmentPreset = (v: number) => {
    setSegmentMode('preset')
    onChange({ ...config, segmentSize: v })
  }

  const handleFramePreset = (v: number) => {
    setFrameMode('preset')
    onChange({ ...config, framesPerSegment: v })
  }

  const handleCustomSegment = (val: string) => {
    setCustomSegment(val)
    const n = parseFloat(val)
    if (n > 0 && n <= videoDuration) onChange({ ...config, segmentSize: n })
  }

  const handleCustomFrames = (val: string) => {
    setCustomFrames(val)
    const n = parseInt(val, 10)
    if (n > 0 && n <= 500) onChange({ ...config, framesPerSegment: n })
  }

  const formatCount = (n: number) =>
    n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n)

  return (
    <div className="panel p-6 space-y-6">
      <div className="flex items-center gap-2">
        <Settings size={16} className="text-blood-600" />
        <h2 className="section-title text-sm text-stone-300 uppercase tracking-widest">Extraction Configuration</h2>
      </div>

      {/* Segment Size */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Layers size={14} className="text-stone-500" />
          <label className="text-sm text-stone-400 font-sans">Segment Size</label>
          <span className="text-xs text-stone-600 font-mono ml-auto">
            → {expectedSegments} segment{expectedSegments !== 1 ? 's' : ''}
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {SEGMENT_PRESETS.map(v => (
            <button
              key={v}
              onClick={() => handleSegmentPreset(v)}
              className={`cfg-btn ${segmentMode === 'preset' && config.segmentSize === v ? 'active' : ''}`}
            >
              {v < 1 ? `${v * 1000}ms` : `${v}s`}
            </button>
          ))}
          <button
            onClick={() => setSegmentMode(segmentMode === 'custom' ? 'preset' : 'custom')}
            className={`cfg-btn ${segmentMode === 'custom' ? 'active' : ''}`}
          >
            Custom
          </button>
        </div>
        {segmentMode === 'custom' && (
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="0.1"
              max={videoDuration}
              step="0.1"
              value={customSegment}
              onChange={e => handleCustomSegment(e.target.value)}
              placeholder="e.g. 3.5"
              className="w-28 bg-charcoal-900 border border-stone-700 rounded px-3 py-1.5 text-sm font-mono text-stone-200 focus:border-blood-700 outline-none"
            />
            <span className="text-xs text-stone-500">seconds (max {videoDuration.toFixed(1)}s)</span>
          </div>
        )}
      </div>

      {/* Frames per segment */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Film size={14} className="text-stone-500" />
          <label className="text-sm text-stone-400 font-sans">Frames per Segment</label>
          <span className="text-xs text-stone-600 font-mono ml-auto">
            → {config.framesPerSegment} / seg
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {FRAME_PRESETS.map(v => (
            <button
              key={v}
              onClick={() => handleFramePreset(v)}
              className={`cfg-btn ${frameMode === 'preset' && config.framesPerSegment === v ? 'active' : ''}`}
            >
              {v}
            </button>
          ))}
          <button
            onClick={() => setFrameMode(frameMode === 'custom' ? 'preset' : 'custom')}
            className={`cfg-btn ${frameMode === 'custom' ? 'active' : ''}`}
          >
            Custom
          </button>
        </div>
        {frameMode === 'custom' && (
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="1"
              max="500"
              step="1"
              value={customFrames}
              onChange={e => handleCustomFrames(e.target.value)}
              placeholder="e.g. 75"
              className="w-28 bg-charcoal-900 border border-stone-700 rounded px-3 py-1.5 text-sm font-mono text-stone-200 focus:border-blood-700 outline-none"
            />
            <span className="text-xs text-stone-500">frames (max 500)</span>
          </div>
        )}
      </div>

      {/* Summary */}
      <div className="border-t border-stone-800/60 pt-4">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-xl font-serif font-semibold text-blood-400">{expectedSegments}</div>
            <div className="text-xs text-stone-500 mt-0.5">Segments</div>
          </div>
          <div>
            <div className="text-xl font-serif font-semibold text-stone-300">{config.framesPerSegment}</div>
            <div className="text-xs text-stone-500 mt-0.5">Per segment</div>
          </div>
          <div>
            <div className="text-xl font-serif font-semibold text-copper">{formatCount(expectedFrames)}</div>
            <div className="text-xs text-stone-500 mt-0.5">Total frames</div>
          </div>
        </div>
      </div>
    </div>
  )
}
