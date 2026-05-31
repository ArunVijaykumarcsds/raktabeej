import { useState, useCallback, useRef } from 'react'
import { isVideoFile, isZipFile } from '../utils/format'

interface UseDropZoneReturn {
  isDragging: boolean
  dragError: string | null
  onDragOver: (e: React.DragEvent) => void
  onDragLeave: (e: React.DragEvent) => void
  onDrop: (e: React.DragEvent) => void
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void
  clearError: () => void
}

const MAX_DIRECT_SIZE = 2 * 1024 * 1024 * 1024 // 2 GB

export function useDropZone(onFile: (file: File, isZip: boolean) => void): UseDropZoneReturn {
  const [isDragging, setIsDragging] = useState(false)
  const [dragError, setDragError] = useState<string | null>(null)
  const dragCounter = useRef(0)

  const validate = useCallback((file: File): boolean => {
    if (isZipFile(file)) {
      return true
    }
    if (!isVideoFile(file)) {
      setDragError(`Unsupported format: "${file.name}". Supported: MP4, MOV, AVI, MKV, WEBM, MPEG, M4V, or ZIP archive.`)
      return false
    }
    if (file.size > MAX_DIRECT_SIZE) {
      setDragError(`File exceeds 2 GB limit. Please compress it into a ZIP archive and upload that instead.`)
      return false
    }
    return true
  }, [])

  const handleFile = useCallback((file: File) => {
    if (validate(file)) {
      setDragError(null)
      onFile(file, isZipFile(file))
    }
  }, [validate, onFile])

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    dragCounter.current++
    setIsDragging(true)
  }, [])

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    dragCounter.current--
    if (dragCounter.current === 0) setIsDragging(false)
  }, [])

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    dragCounter.current = 0
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }, [handleFile])

  const onFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
    e.target.value = ''
  }, [handleFile])

  return {
    isDragging,
    dragError,
    onDragOver,
    onDragLeave,
    onDrop,
    onFileSelect,
    clearError: () => setDragError(null),
  }
}
