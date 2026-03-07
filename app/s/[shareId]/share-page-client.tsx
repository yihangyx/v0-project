'use client'

import { useState } from 'react'
import { Cloud, Download, Copy, CheckCircle, Eye, HardDrive, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { FileIcon } from '@/components/file-icon'
import { formatFileSize, formatDate } from '@/lib/file-utils'
import type { FileItem } from '@/lib/types'
import Link from 'next/link'

interface SharePageClientProps {
  file: FileItem
  shareId: string
}

export function SharePageClient({ file, shareId }: SharePageClientProps) {
  const [copied, setCopied] = useState(false)

  const downloadUrl = `/api/download/${shareId}`

  const copyLink = async () => {
    const fullUrl = `${window.location.origin}${downloadUrl}`
    await navigator.clipboard.writeText(fullUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b bg-card/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 h-16 flex items-center">
          <Link href="/" className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-primary/10">
              <Cloud className="h-6 w-6 text-primary" />
            </div>
            <span className="text-xl font-semibold text-foreground">CloudDrive</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-card border rounded-2xl p-8 shadow-lg space-y-6">
            {/* File Icon */}
            <div className="flex justify-center">
              <div className="p-6 rounded-2xl bg-primary/10">
                <FileIcon mimeType={file.mime_type} className="h-16 w-16 text-primary" />
              </div>
            </div>

            {/* File Info */}
            <div className="text-center space-y-2">
              <h1 className="text-xl font-semibold text-foreground break-all">
                {file.original_name}
              </h1>
              {file.description && (
                <p className="text-muted-foreground text-sm">
                  {file.description}
                </p>
              )}
            </div>

            {/* File Stats */}
            <div className="grid grid-cols-3 gap-4 py-4 border-y">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                  <HardDrive className="h-4 w-4" />
                </div>
                <p className="text-sm font-medium text-foreground">{formatFileSize(file.size)}</p>
                <p className="text-xs text-muted-foreground">文件大小</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                  <Eye className="h-4 w-4" />
                </div>
                <p className="text-sm font-medium text-foreground">{file.download_count}</p>
                <p className="text-xs text-muted-foreground">下载次数</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                  <Calendar className="h-4 w-4" />
                </div>
                <p className="text-sm font-medium text-foreground">
                  {new Date(file.created_at).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })}
                </p>
                <p className="text-xs text-muted-foreground">上传时间</p>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <Button asChild className="w-full" size="lg">
                <a href={downloadUrl}>
                  <Download className="mr-2 h-5 w-5" />
                  立即下载
                </a>
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full" 
                size="lg"
                onClick={copyLink}
              >
                {copied ? (
                  <>
                    <CheckCircle className="mr-2 h-5 w-5 text-accent" />
                    链接已复制
                  </>
                ) : (
                  <>
                    <Copy className="mr-2 h-5 w-5" />
                    复制下载链接
                  </>
                )}
              </Button>
            </div>

            {/* Direct Link Info */}
            <div className="bg-muted/50 rounded-xl p-4">
              <p className="text-xs text-muted-foreground mb-2">直接下载链接:</p>
              <code className="text-xs text-foreground break-all bg-background px-2 py-1 rounded block">
                {typeof window !== 'undefined' ? `${window.location.origin}${downloadUrl}` : downloadUrl}
              </code>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t">
        <div className="container mx-auto px-4 py-4">
          <p className="text-center text-sm text-muted-foreground">
            由 CloudDrive 提供支持
          </p>
        </div>
      </footer>
    </div>
  )
}
