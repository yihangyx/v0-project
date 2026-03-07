'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, X, Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import { formatFileSize, MAX_FILE_SIZE } from '@/lib/file-utils'
import type { FileItem } from '@/lib/types'

interface FileUploadProps {
  onUploadComplete?: (file: FileItem) => void
}

export function FileUpload({ onUploadComplete }: FileUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [description, setDescription] = useState('')
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

    setUploading(true)
    setProgress(0)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('file', selectedFile)
      if (description) {
        formData.append('description', description)
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
    setError(null)
    setSuccess(false)
    setProgress(0)
  }

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-xl p-8 text-center cursor-pointer
          transition-all duration-200
          ${isDragActive 
            ? 'border-primary bg-primary/5' 
            : 'border-border hover:border-primary/50 hover:bg-muted/50'
          }
        `}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-3">
          <div className="p-4 rounded-full bg-primary/10">
            <Upload className="h-8 w-8 text-primary" />
          </div>
          {isDragActive ? (
            <p className="text-lg font-medium text-primary">释放文件以上传</p>
          ) : (
            <>
              <p className="text-lg font-medium text-foreground">
                拖拽文件到此处或点击选择
              </p>
              <p className="text-sm text-muted-foreground">
                支持所有文件格式，单次最大1GB
              </p>
            </>
          )}
        </div>
      </div>

      {selectedFile && (
        <div className="bg-card border rounded-xl p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Upload className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-foreground truncate max-w-xs">
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
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <Textarea
            placeholder="添加文件描述（可选）"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={uploading}
            className="resize-none"
            rows={2}
          />

          {uploading && (
            <Progress value={progress} className="h-2" />
          )}

          <Button
            onClick={handleUpload}
            disabled={uploading}
            className="w-full"
          >
            {uploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                上传中...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                开始上传
              </>
            )}
          </Button>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 p-4 bg-destructive/10 text-destructive rounded-xl">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 p-4 bg-accent/20 text-accent-foreground rounded-xl">
          <CheckCircle className="h-5 w-5 flex-shrink-0 text-accent" />
          <p>文件上传成功！</p>
        </div>
      )}
    </div>
  )
}
