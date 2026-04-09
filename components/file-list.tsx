'use client'

import { useState } from 'react'
import { 
  Copy, 
  Download, 
  Trash2, 
  ExternalLink,
  CheckCircle,
  MoreVertical,
  Eye
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { FileIcon } from '@/components/file-icon'
import { formatFileSize, formatDate } from '@/lib/file-utils'
import type { FileItem } from '@/lib/types'

interface FileListProps {
  files: FileItem[]
  onDelete?: (id: string) => void
  showActions?: boolean
}

export function FileList({ files, onDelete, showActions = true }: FileListProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const getShareUrl = (shareId: string) => {
    if (typeof window !== 'undefined') {
      return `${window.location.origin}/s/${shareId}`
    }
    return `/s/${shareId}`
  }

  const getDownloadUrl = (shareId: string) => {
    if (typeof window !== 'undefined') {
      return `${window.location.origin}/api/download/${shareId}`
    }
    return `/api/download/${shareId}`
  }

  const copyToClipboard = async (shareId: string) => {
    const url = getDownloadUrl(shareId)
    await navigator.clipboard.writeText(url)
    setCopiedId(shareId)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleDelete = async () => {
    if (!deleteId || !onDelete) return
    
    setDeleting(true)
    try {
      const response = await fetch(`/api/files/${deleteId}`, {
        method: 'DELETE',
      })
      
      if (response.ok) {
        onDelete(deleteId)
      }
    } catch (error) {
      console.error('Delete error:', error)
    } finally {
      setDeleting(false)
      setDeleteId(null)
    }
  }

  if (files.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="p-4 rounded-full bg-muted inline-block mb-4">
          <Download className="h-8 w-8 text-muted-foreground" />
        </div>
        <p className="text-lg font-medium text-foreground">暂无文件</p>
        <p className="text-sm text-muted-foreground mt-1">
          上传文件后会显示在这里
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-3">
        {files.map((file) => (
          <div
            key={file.id}
            className="bg-card border rounded-xl p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-primary/10 flex-shrink-0">
                <FileIcon mimeType={file.mime_type} className="h-6 w-6 text-primary" />
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground truncate">
                  {file.original_name}
                </p>
                <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                  <span>{formatFileSize(file.size)}</span>
                  <span>·</span>
                  <span>{formatDate(file.created_at)}</span>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <Eye className="h-3 w-3" />273
                    {file.download_count} 次下载
                  </span>
                </div>
                {file.description && (
                  <p className="text-sm text-muted-foreground mt-2 line-clamp-1">
                    {file.description}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(file.share_id)}
                  className="hidden sm:flex"
                >
                  {copiedId === file.share_id ? (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4 text-accent" />
                      已复制
                    </>
                  ) : (
                    <>
                      <Copy className="mr-2 h-4 w-4" />
                      复制链接
                    </>
                  )}
                </Button>

                {showActions && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => copyToClipboard(file.share_id)}
                        className="sm:hidden"
                      >
                        <Copy className="mr-2 h-4 w-4" />
                        复制下载链接
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <a href={getShareUrl(file.share_id)} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="mr-2 h-4 w-4" />
                          查看分享页
                        </a>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <a href={getDownloadUrl(file.share_id)} download>
                          <Download className="mr-2 h-4 w-4" />
                          下载文件
                        </a>
                      </DropdownMenuItem>
                      {onDelete && (
                        <DropdownMenuItem
                          onClick={() => setDeleteId(file.id)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          删除文件
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              此操作将永久删除该文件，删除后无法恢复。确定要继续吗？
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? '删除中...' : '确认删除'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
