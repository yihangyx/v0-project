'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { FileUpload } from '@/components/file-upload'
import type { FileItem } from '@/lib/types'

export default function AdminUploadPage() {
  const [recentFiles, setRecentFiles] = useState<FileItem[]>([])
  const router = useRouter()

  const handleUploadComplete = (file: FileItem) => {
    setRecentFiles(prev => [file, ...prev])
    // Optionally redirect to dashboard after upload
    setTimeout(() => {
      router.push('/admin')
    }, 2000)
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">上传文件</h1>
          <p className="text-muted-foreground mt-1">上传文件到您的云存储</p>
        </div>

        {/* Upload Area */}
        <div className="bg-card border rounded-xl p-6">
          <FileUpload onUploadComplete={handleUploadComplete} />
        </div>

        {/* Recent Uploads */}
        {recentFiles.length > 0 && (
          <div className="bg-card border rounded-xl p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">刚刚上传</h2>
            <div className="space-y-2">
              {recentFiles.map((file) => (
                <div 
                  key={file.id}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                >
                  <span className="text-sm font-medium text-foreground truncate">
                    {file.original_name}
                  </span>
                  <a 
                    href={`/s/${file.share_id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline"
                  >
                    查看
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
