'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, X, Loader2, CheckCircle, AlertCircle, Lock, Unlock, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { formatFileSize, MAX_FILE_SIZE } from '@/lib/file-utils'
import type { FileItem } from '@/lib/types'

interface FileUploadProps {
  onUploadComplete?: (file: FileItem) => void
}

export function FileUpload({ onUploadComplete }: FileUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [description, setDescription] = useState('')
  const [isProtected, setIsProtected] = useState(false)
  const [password, setPassword] = useState('')
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setError(null)
    setSuccess(false)
    
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0]
      
      if (file.size > MAX_FILE_SIZE) {
        setError('文件大小不能超过1GB')
        return
      }
      
      setSelectedFile(file)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
  })

  const handleUpload = async () => {
    if (!selectedFile) return

    if (isProtected && !password.trim()) {
      setError('请设置下载密码')
      return
    }

    setUploading(true)
    setProgress(0)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('file', selectedFile)
      if (description) {
        formData.append('description', description)
      }
      formData.append('isProtected', isProtected.toString())
      if (isProtected && password) {
        formData.append('password', password)
      }

      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90))
      }, 200)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      clearInterval(progressInterval)
      setProgress(100)

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || '上传失败')
      }

      setSuccess(true)
      setSelectedFile(null)
      setDescription('')
      setIsProtected(false)
      setPassword('')
      
      if (onUploadComplete && data.file) {
        onUploadComplete(data.file)
      }

      setTimeout(() => {
        setSuccess(false)
        setProgress(0)
      }, 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : '上传失败')
    } finally {
      setUploading(false)
    }
  }

  const clearSelection = () => {
    setSelectedFile(null)
    setDescription('')
    setIsProtected(false)
    setPassword('')
    setError(null)
    setSuccess(false)
    setProgress(0)
  }

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer
          transition-all duration-300
          ${isDragActive 
            ? 'border-primary bg-primary/5 scale-[1.02]' 
            : 'border-border hover:border-primary/50 hover:bg-muted/50'
          }
        `}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
            <Upload className="w-8 h-8 text-primary" />
          </div>
          {isDragActive ? (
            <div className="space-y-1">
              <p className="text-lg font-semibold text-primary">释放文件以上传</p>
              <Sparkles className="w-5 h-5 text-primary mx-auto animate-pulse" />
            </div>
          ) : (
            <>
              <div className="space-y-1">
                <p className="text-lg font-semibold text-foreground">
                  拖拽文件到此处
                </p>
                <p className="text-sm text-muted-foreground">
                  或点击选择文件
                </p>
              </div>
              <p className="text-xs text-muted-foreground bg-muted px-3 py-1.5 rounded-full">
                支持所有文件格式，单次最大 1GB
              </p>
            </>
          )}
        </div>
      </div>

      {selectedFile && (
        <div className="bg-card border border-border/50 rounded-2xl p-6 space-y-5 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                <Upload className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-foreground truncate max-w-xs">
                  {selectedFile.name}
                </p>
                <p className="text-sm text-muted-foreground">
                  {formatFileSize(selectedFile.size)}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={clearSelection}
              disabled={uploading}
              className="rounded-xl"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          <Textarea
            placeholder="添加文件描述（可选）"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={uploading}
            className="resize-none rounded-xl border-border/50"
            rows={2}
          />

          {/* Password Protection Toggle */}
          <div className="p-4 rounded-xl bg-muted/50 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {isProtected ? (
                  <Lock className="w-5 h-5 text-amber-500" />
                ) : (
                  <Unlock className="w-5 h-5 text-muted-foreground" />
                )}
                <Label htmlFor="protected" className="font-medium cursor-pointer">
                  密码保护
                </Label>
              </div>
              <Switch
                id="protected"
                checked={isProtected}
                onCheckedChange={setIsProtected}
                disabled={uploading}
              />
            </div>
            
            {isProtected && (
              <div className="space-y-2">
                <Input
                  type="password"
                  placeholder="设置下载密码"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={uploading}
                  className="rounded-xl border-amber-500/30 focus:border-amber-500"
                />
                <p className="text-xs text-muted-foreground">
                  开启后，下载此文件需要输入密码
                </p>
              </div>
            )}
          </div>

          {uploading && (
            <div className="space-y-2">
              <Progress value={progress} className="h-2 rounded-full" />
              <p className="text-xs text-center text-muted-foreground">
                上传中 {progress}%
              </p>
            </div>
          )}

          <Button
            onClick={handleUpload}
            disabled={uploading}
            className="w-full h-12 rounded-xl text-base font-semibold bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity"
          >
            {uploading ? (
              <>
                <Loader2 className="mr-2 w-5 h-5 animate-spin" />
                上传中...
              </>
            ) : (
              <>
                <Upload className="mr-2 w-5 h-5" />
                开始上传
              </>
            )}
          </Button>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-3 p-4 bg-destructive/10 text-destructive rounded-xl border border-destructive/20">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="font-medium">{error}</p>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-3 p-4 bg-green-500/10 text-green-600 rounded-xl border border-green-500/20">
          <CheckCircle className="w-5 h-5 flex-shrink-0" />
          <p className="font-medium">文件上传成功！</p>
        </div>
      )}
    </div>
  )
}
