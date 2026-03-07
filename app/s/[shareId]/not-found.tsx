import { Cloud, FileX } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function ShareNotFound() {
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
        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <div className="p-6 rounded-2xl bg-muted">
              <FileX className="h-16 w-16 text-muted-foreground" />
            </div>
          </div>
          
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold text-foreground">
              文件不存在
            </h1>
            <p className="text-muted-foreground">
              该文件可能已被删除或链接无效
            </p>
          </div>

          <Button asChild>
            <Link href="/">
              返回首页
            </Link>
          </Button>
        </div>
      </main>
    </div>
  )
}
