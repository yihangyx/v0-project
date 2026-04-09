import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ shareId: string }> }
) {
  try {
    const { shareId } = await params
    const supabase = await createClient()

    // 获取文件信息
    const { data: file, error } = await supabase
      .from('files')
      .select('*')
      .eq('share_id', shareId)
      .single()

    if (error || !file) {
      return NextResponse.json({ success: false, error: '文件不存在或已被删除' }, { status: 404 })
    }

    // 密码保护
    if (file.is_protected) {
      return NextResponse.json({ success: false, error: '此文件需要密码才能下载' }, { status: 403 })
    }

    // 下载次数 +1
    await supabase
      .from('files')
      .update({ download_count: file.download_count + 1 })
      .eq('id', file.id)

    // ==============================================
    // 🔥 核心修复：不是 redirect，而是返回带下载头的响应
    // ==============================================
    const headers = new Headers()
    
    // 强制浏览器下载（关键！）
    headers.set('Content-Disposition', `attachment; filename*=UTF-8''${encodeURIComponent(file.original_name)}`)
    
    // 跳转到真实文件地址（不会再当成JS了）
    const response = await fetch(file.blob_url)
    const blob = await response.blob()

    return new NextResponse(blob, {
      headers: headers,
      status: 200,
    })

  } catch (error) {
    console.error('Download error:', error)
    return NextResponse.json({ success: false, error: '下载失败' }, { status: 500 })
  }
}
