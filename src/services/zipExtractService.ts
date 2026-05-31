import JSZip from 'jszip'
import { isVideoFile } from '../utils/format'

export async function extractVideoFromZip(zipFile: File): Promise<File> {
  const zip = await JSZip.loadAsync(zipFile)

  const videoEntries = Object.entries(zip.files).filter(([name, entry]) => {
    if (entry.dir) return false
    const mockFile = new File([], name)
    return isVideoFile(mockFile)
  })

  if (videoEntries.length === 0) {
    throw new Error('No supported video file found inside the ZIP archive. Supported formats: MP4, MOV, AVI, MKV, WEBM, MPEG, M4V')
  }

  if (videoEntries.length > 1) {
    throw new Error(`Multiple video files found in ZIP (${videoEntries.length}). Please include only one video per archive.`)
  }

  const [name, entry] = videoEntries[0]
  const blob = await entry.async('blob')
  const ext = name.split('.').pop() ?? 'mp4'
  const mimeMap: Record<string, string> = {
    mp4: 'video/mp4', mov: 'video/quicktime', avi: 'video/x-msvideo',
    mkv: 'video/x-matroska', webm: 'video/webm', mpeg: 'video/mpeg',
    mpg: 'video/mpeg', m4v: 'video/x-m4v',
  }
  const type = mimeMap[ext.toLowerCase()] ?? 'video/mp4'
  return new File([blob], name.split('/').pop() ?? name, { type })
}
