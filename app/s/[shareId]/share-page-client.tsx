'use client'

import { useState, useEffect } from 'react'
import { Cloud, Download, Copy, CheckCircle, Eye, HardDrive, Calendar, Lock, Unlock, Sparkles, Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FileIcon } from '@/components/file-icon'
import { formatFileSize } from '@/lib/file-utils'
import type { FileItem } from '@/lib/types'
import Link from 'next/link'

interface SharePageClientProps {
  file: FileItem
  shareId: string
}

export function SharePageClient({ file, shareId }: SharePageClientProps) {
  const [copied, setCopied] = useState(false)
  const [password, setPassword] = useState('')
  const [unlocked, setUnlocked] = useState(!file.is_protected)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [unlockedUrl, setUnlockedUrl] = useState<string | null>(file.is_protected ? null : file.blob_url)

  const downloadUrl = `/api/download/${shareId}`

  // Auto download for non-protected files
  useEffect(() => {
    if (!file.is_protected && file.blob_url) {
      const timer = setTimeout(() => {
        window.location.href = downloadUrl
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [file.is_protected, file.blob_url, downloadUrl])

  const copyLink = async () => {
    const fullUrl = `${window.location.origin}/s/${shareId}`
    await navigator.clipboard.writeText(fullUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const verifyPassword = async () => {
    if (!password.trim()) {
      setError('请输入密码')
      return
    }

    setLoading(true)
    setError('')

    try {
      const res = await fetch(`/api/share/${shareId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      
      const data = await res.json()
      
      if (data.success && data.blob_url) {
        setUnlocked(true)
        setUnlockedUrl(data.blob_url)
        // Auto download after unlock
        setTimeout(() => {
          window.location.href = data.blob_url
        }, 1000)
      } else {
        setError(data.error || '密码错误')
      }
    } catch {
      setError('验证失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background flex flex-col">
      {/* Decorative elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-accent/5 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="border-b border-border/50 bg-card/80 backdrop-blur-sm relative z-10">
        <div className="container mx-auto px-4 py-4 flex items-center">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
              <Cloud className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              CloudDrive
            </span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4 relative z-10">
        <div className="w-full max-w-lg">
          <div className="bg-card/90 backdrop-blur-sm border border-border/50 rounded-3xl p-8 shadow-2xl space-y-6">
            {/* File Icon */}
            <div className="flex justify-center">
              <div className="relative">
                <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center animate-float">
                  <FileIcon mimeType={file.mime_type} className="w-12 h-12 text-primary" />
                </div>
                {file.is_protected && !unlocked && (
                  <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center shadow-lg">
                    <Lock className="w-5 h-5 text-white" />
                  </div>
                )}
                {unlocked && file.is_protected && (
                  <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-green-500 flex items-center justify-center shadow-lg">
                    <Unlock className="w-5 h-5 text-white" />
                  </div>
                )}
              </div>
            </div>

            {/* File Info */}
            <div className="text-center space-y-2">
              <h1 className="text-2xl font-bold text-foreground break-all text-balance">
                {file.original_name}
              </h1>
              {file.description && (
                <p className="text-muted-foreground text-sm text-pretty">
                  {file.description}
                </p>
              )}
            </div>

            {/* File Stats */}
            <div className="grid grid-cols-3 gap-4 py-6">
              <div className="text-center p-3 rounded-2xl bg-muted/50">
                <div className="w-10 h-10 mx-auto rounded-xl bg-primary/10 flex items-center justify-center mb-2">
                  <HardDrive className="w-5 h-5 text-primary" />
                </div>
                <p className="text-sm font-semibold text-foreground">{formatFileSize(file.size)}</p>
                <p className="text-xs text-muted-foreground">文件大小</p>
              </div>
              <div className="text-center p-3 rounded-2xl bg-muted/50">
                <div className="w-10 h-10 mx-auto rounded-xl bg-accent/10 flex items-center justify-center mb-2">
                  <Eye className="w-5 h-5 text-accent" />
                </div>
                <p className="text-sm font-semibold text-foreground">{file.download_count}</p>
                <p className="text-xs text-muted-foreground">下载次数</p>
              </div>
              <div className="text-center p-3 rounded-2xl bg-muted/50">
                <div className="w-10 h-10 mx-auto rounded-xl bg-primary/10 flex items-center justify-center mb-2">
                  <Calendar className="w-5 h-5 text-primary" />
                </div>
                <p className="text-sm font-semibold text-foreground">
                  {new Date(file.created_at).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })}
                </p>
                <p className="text-xs text-muted-foreground">上传时间</p>
              </div>
            </div>

            {/* Password Input for protected files */}
            {file.is_protected && !unlocked && (
              <div className="space-y-4 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20">
                <div className="flex items-center gap-2 text-amber-600">
                  <Lock className="w-5 h-5" />
                  <span className="font-medium">此文件已加密保护</span>
                </div>
                <div className="space-y-3">
                  <Input
                    type="password"
                    placeholder="请输入下载密码"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && verifyPassword()}
                    className="h-12 rounded-xl border-amber-500/30 focus:border-amber-500"
                  />
                  {error && (
                    <p className="text-sm text-destructive">{error}</p>
                  )}
                  <Button 
                    className="w-full h-12 rounded-xl bg-amber-500 hover:bg-amber-600 text-white"
                    onClick={verifyPassword}
                    disabled={loading}
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <Unlock className="w-5 h-5 mr-2" />
                        验证密码
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}

            {/* Download Actions */}
            {(!file.is_protected || unlocked) && (
              <div className="space-y-3">
                {!file.is_protected && (
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-2">
                    <Sparkles className="w-4 h-4 text-primary animate-pulse" />
                    <span>文件将在 2 秒后自动下载...</span>
                  </div>
                )}
                
                <Button 
                  asChild 
                  className="w-full h-14 rounded-2xl text-lg font-semibold bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity shadow-lg"
                  size="lg"
                >
                  <a href={unlockedUrl || downloadUrl}>
                    <Download className="mr-2 w-6 h-6" />
                    立即下载
                  </a>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full h-12 rounded-xl border-2" 
                  size="lg"
                  onClick={copyLink}
                >
                  {copied ? (
                    <>
                      <CheckCircle className="mr-2 w-5 h-5 text-green-500" />
                      链接已复制
                    </>
                  ) : (
                    <>
                      <Copy className="mr-2 w-5 h-5" />
                      复制分享链接
                    </>
                  )}
                </Button>
              </div>
            )}

            {/* Direct Link Info */}
            {(!file.is_protected || unlocked) && (
              <div className="bg-muted/50 rounded-2xl p-4">
                <p className="text-xs text-muted-foreground mb-2 font-medium">直接下载链接:</p>
                <code className="text-xs text-foreground break-all bg-background px-3 py-2 rounded-xl block border border-border/50">
                  {unlockedUrl || (typeof window !== 'undefined' ? `${window.location.origin}${downloadUrl}` : downloadUrl)}
                </code>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-card/50 relative z-10">
        <div className="container mx-auto px-4 py-6">
          <p className="text-center text-sm text-muted-foreground flex items-center justify-center gap-1">
            Made with <Heart className="w-4 h-4 text-primary fill-primary" /> by CloudDrive
          </p>
        </div>
      </footer>
    </div>
  )
}
