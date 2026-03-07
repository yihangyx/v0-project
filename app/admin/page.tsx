'use client'

import { useState, useEffect } from 'react'
import { Files, Download, HardDrive, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { FileList } from '@/components/file-list'
import { formatFileSize } from '@/lib/file-utils'
import type { FileItem } from '@/lib/types'

export default function AdminDashboard() {
  const [files, setFiles] = useState<FileItem[]>([])
  const [loading, setLoading] = useState(true)

  const fetchFiles = async () => {
    setLoading(true)
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

  const handleDelete = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id))
  }

  const totalSize = files.reduce((acc, file) => acc + file.size, 0)
  const totalDownloads = files.reduce((acc, file) => acc + file.download_count, 0)

  const stats = [
    { 
      label: '文件总数', 
      value: files.length, 
      icon: Files,
      color: 'text-primary'
    },
    { 
      label: '总下载次数', 
      value: totalDownloads, 
      icon: Download,
      color: 'text-accent'
    },
    { 
      label: '存储空间', 
      value: formatFileSize(totalSize), 
      icon: HardDrive,
      color: 'text-muted-foreground'
    },
  ]

  return (
    <div className="p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">仪表盘</h1>
            <p className="text-muted-foreground mt-1">管理您的文件和查看统计数据</p>
          </div>
          <Button
            variant="outline"
            onClick={fetchFiles}
            disabled={loading}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            刷新
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <div 
                key={stat.label}
                className="bg-card border rounded-xl p-6"
              >
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl bg-muted ${stat.color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* File List */}
        <div className="bg-card border rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-foreground">所有文件</h2>
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
        </div>
      </div>
    </div>
  )
}
