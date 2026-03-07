import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ shareId: string }> }
) {
  try {
    const { shareId } = await params
    const supabase = await createClient()

    // Get file info
    const { data: file, error } = await supabase
      .from('files')
      .select('*')
      .eq('share_id', shareId)
      .single()

    if (error || !file) {
      return NextResponse.json({ success: false, error: '文件不存在或已被删除' }, { status: 404 })
    }

    // If file is protected, don't allow direct download
    if (file.is_protected) {
      return NextResponse.json({ success: false, error: '此文件需要密码才能下载' }, { status: 403 })
    }

    // Increment download count
    await supabase
      .from('files')
      .update({ download_count: file.download_count + 1 })
      .eq('id', file.id)

    // Redirect to the actual file URL for direct download
    return NextResponse.redirect(file.blob_url)
  } catch (error) {
    console.error('Download error:', error)
    return NextResponse.json({ success: false, error: '下载失败' }, { status: 500 })
  }
}
