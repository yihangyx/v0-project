'use client'

import { 
  File, 
  Image, 
  Video, 
  Music, 
  FileText, 
  Archive, 
  FileSpreadsheet, 
  Presentation,
  FileCode
} from 'lucide-react'
import { getFileIcon } from '@/lib/file-utils'

interface FileIconProps {
  mimeType: string | null
  className?: string
}

export function FileIcon({ mimeType, className = 'h-6 w-6' }: FileIconProps) {
  const iconType = getFileIcon(mimeType)
  
  const iconMap = {
    file: File,
    image: Image,
    video: Video,
    audio: Music,
    pdf: FileText,
    archive: Archive,
    document: FileText,
    spreadsheet: FileSpreadsheet,
    presentation: Presentation,
    text: FileCode,
  }

  const IconComponent = iconMap[iconType as keyof typeof iconMap] || File

  return <IconComponent className={className} />
}
