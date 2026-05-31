export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds.toFixed(1)}s`
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  if (m < 60) return `${m}m ${s}s`
  const h = Math.floor(m / 60)
  const rm = m % 60
  return `${h}h ${rm}m ${s}s`
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`
}

export function formatTimestamp(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  const ms = Math.floor((seconds % 1) * 1000)
  if (h > 0) return `${h}:${pad(m)}:${pad(s)}.${pad3(ms)}`
  return `${pad(m)}:${pad(s)}.${pad3(ms)}`
}

function pad(n: number) { return String(n).padStart(2, '0') }
function pad3(n: number) { return String(n).padStart(3, '0') }

export function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, '_').replace(/_{2,}/g, '_')
}

const SUPPORTED_VIDEO_TYPES = [
  'video/mp4', 'video/quicktime', 'video/x-msvideo',
  'video/x-matroska', 'video/webm', 'video/mpeg',
  'video/x-m4v', 'video/MP2T',
]

const SUPPORTED_EXTENSIONS = ['.mp4', '.mov', '.avi', '.mkv', '.webm', '.mpeg', '.mpg', '.m4v']

export function isVideoFile(file: File): boolean {
  if (SUPPORTED_VIDEO_TYPES.includes(file.type)) return true
  const ext = '.' + file.name.split('.').pop()?.toLowerCase()
  return SUPPORTED_EXTENSIONS.includes(ext)
}

export function isZipFile(file: File): boolean {
  return file.type === 'application/zip' ||
    file.type === 'application/x-zip-compressed' ||
    file.name.toLowerCase().endsWith('.zip')
}

export function computeSegmentCount(duration: number, segmentSize: number): number {
  return Math.ceil(duration / segmentSize)
}

export function computeTotalFrames(segmentCount: number, framesPerSegment: number): number {
  return segmentCount * framesPerSegment
}

export function generateFrameFilename(
  videoBaseName: string,
  segmentIndex: number,
  frameIndex: number
): string {
  const base = sanitizeFilename(videoBaseName.replace(/\.[^/.]+$/, ''))
  const seg = String(segmentIndex).padStart(2, '0')
  const frm = String(frameIndex).padStart(3, '0')
  return `${base}_segment_${seg}_frame_${frm}.jpg`
}

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}
