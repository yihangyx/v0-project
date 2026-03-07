import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { SharePageClient } from './share-page-client'
import type { Metadata } from 'next'

interface SharePageProps {
  params: Promise<{ shareId: string }>
}

export async function generateMetadata({ params }: SharePageProps): Promise<Metadata> {
  const { shareId } = await params
  const supabase = await createClient()
  
  const { data: file } = await supabase
    .from('files')
    .select('original_name, description')
    .eq('share_id', shareId)
    .single()

  if (!file) {
    return {
      title: '文件不存在 - CloudDrive',
    }
  }

  return {
    title: `${file.original_name} - CloudDrive`,
    description: file.description || '点击下载文件',
  }
}

export default async function SharePage({ params }: SharePageProps) {
  const { shareId } = await params
  const supabase = await createClient()

  const { data: file, error } = await supabase
    .from('files')
    .select('*')
    .eq('share_id', shareId)
    .single()

  if (error || !file) {
    notFound()
  }

  return <SharePageClient file={file} shareId={shareId} />
}
