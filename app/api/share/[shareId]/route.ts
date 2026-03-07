import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ shareId: string }> }
) {
  try {
    const { shareId } = await params
    const supabase = await createClient()

    const { data: file, error } = await supabase
      .from('files')
      .select('*')
      .eq('share_id', shareId)
      .single()

    if (error || !file) {
      return NextResponse.json({ success: false, error: '文件不存在或已被删除' }, { status: 404 })
    }

    return NextResponse.json({ 
      success: true, 
      file,
      download_url: `/api/download/${shareId}`
    })
  } catch (error) {
    console.error('Share info error:', error)
    return NextResponse.json({ success: false, error: '获取分享信息失败' }, { status: 500 })
  }
}
