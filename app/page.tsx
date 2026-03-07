'use client'

import { useState, useEffect } from 'react'
import { Cloud, Settings, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { FileUpload } from '@/components/file-upload'
import { FileList } from '@/components/file-list'
import type { FileItem } from '@/lib/types'
import Link from 'next/link'

export default function HomePage() {
  const [files, setFiles] = useState<FileItem[]>([])
  const [loading, setLoading] = useState(true)

  const fetchFiles = async () => {
    try {
      const response = await fetch('/api/files')
      const data = await response.json()
      if (data.success) {
        setFiles(data.files)
      }
    } catch (error) {
      console.error('Error fetching files:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFiles()
  }, [])

  const handleUploadComplete = (file: FileItem) => {
    setFiles(prev => [file, ...prev])
  }

  const handleDelete = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id))
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-card/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-primary/10">
              <Cloud className="h-6 w-6 text-primary" />
            </div>
            <span className="text-xl font-semibold text-foreground">CloudDrive</span>
          </Link>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={fetchFiles}
              disabled={loading}
            >
              <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
            </Button>
            <Link href="/admin">
              <Button variant="outline" size="icon">
                <Settings className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Hero Section */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold text-foreground text-balance">
              安全、快速的云端存储
            </h1>
            <p className="text-lg text-muted-foreground text-pretty max-w-2xl mx-auto">
              上传文件，获取真实下载链接，轻松分享给任何人
            </p>
          </div>

          {/* Upload Section */}
          <section className="bg-card border rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-foreground mb-4">上传文件</h2>
            <FileUpload onUploadComplete={handleUploadComplete} />
          </section>

          {/* File List Section */}
          <section className="bg-card border rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">我的文件</h2>
              <span className="text-sm text-muted-foreground">
                共 {files.length} 个文件
              </span>
            </div>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <FileList 
                files={files} 
                onDelete={handleDelete}
                showActions={true}
              />
            )}
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t mt-12">
        <div className="container mx-auto px-4 py-6">
          <p className="text-center text-sm text-muted-foreground">
            CloudDrive - 您的个人云存储
          </p>
        </div>
      </footer>
    </div>
  )
}
