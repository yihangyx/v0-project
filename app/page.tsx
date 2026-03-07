'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FileIcon } from '@/components/file-icon'
import { formatFileSize, formatDate } from '@/lib/file-utils'
import { FileItem } from '@/lib/types'
import { Cloud, Search, FileText, Lock, Download, ExternalLink, Sparkles } from 'lucide-react'
import Link from 'next/link'

export default function HomePage() {
  const [files, setFiles] = useState<FileItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchFiles()
  }, [])

  const fetchFiles = async () => {
    try {
      const res = await fetch('/api/files')
      const data = await res.json()
      if (data.success) {
        setFiles(data.files || [])
      }
    } catch (error) {
      console.error('Error fetching files:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredFiles = files.filter(file => 
    file.original_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (file.description && file.description.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
              <Cloud className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              CloudDrive
            </span>
          </Link>
          <Link href="/admin/login">
            <Button variant="outline" size="sm" className="rounded-full">
              管理后台
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="animate-float inline-block mb-6">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
            <Sparkles className="w-10 h-10 text-primary" />
          </div>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold mb-4 text-balance">
          <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            文件资源中心
          </span>
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-8 text-pretty">
          浏览和下载分享的文件资源，安全快速，简单便捷
        </p>

        {/* Search */}
        <div className="max-w-md mx-auto relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="搜索文件..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-12 h-12 rounded-full border-2 border-border/50 focus:border-primary/50 bg-card shadow-lg"
          />
        </div>
      </section>

      {/* Files Grid */}
      <section className="container mx-auto px-4 pb-16">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        ) : filteredFiles.length === 0 ? (
          <Card className="max-w-md mx-auto border-dashed border-2 bg-card/50">
            <CardContent className="py-16 text-center">
              <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
              <h3 className="text-lg font-medium text-muted-foreground mb-2">
                {searchTerm ? '没有找到匹配的文件' : '暂无文件'}
              </h3>
              <p className="text-sm text-muted-foreground/70">
                {searchTerm ? '尝试其他关键词' : '请等待管理员上传文件'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFiles.map((file) => (
              <Card 
                key={file.id} 
                className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-card/80 backdrop-blur-sm border-border/50 overflow-hidden"
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                      <FileIcon mimeType={file.mime_type} className="w-7 h-7 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground truncate mb-1 group-hover:text-primary transition-colors">
                        {file.original_name}
                      </h3>
                      {file.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                          {file.description}
                        </p>
                      )}
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          {formatFileSize(file.size)}
                        </span>
                        <span className="w-1 h-1 rounded-full bg-border" />
                        <span className="flex items-center gap-1">
                          <Download className="w-3 h-3" />
                          {file.download_count}
                        </span>
                        {file.is_protected && (
                          <>
                            <span className="w-1 h-1 rounded-full bg-border" />
                            <span className="flex items-center gap-1 text-amber-600">
                              <Lock className="w-3 h-3" />
                              密码
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-border/50 flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      {formatDate(file.created_at)}
                    </span>
                    <Link href={`/s/${file.share_id}`}>
                      <Button size="sm" className="rounded-full gap-2 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                        <ExternalLink className="w-4 h-4" />
                        查看详情
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Stats */}
        {files.length > 0 && (
          <div className="mt-12 text-center">
            <p className="text-sm text-muted-foreground">
              共 <span className="font-semibold text-primary">{files.length}</span> 个文件
            </p>
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-card/50 py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>CloudDrive - 安全便捷的文件分享平台</p>
        </div>
      </footer>
    </div>
  )
}
