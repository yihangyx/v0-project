import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('files')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ success: false, error: '获取文件列表失败' }, { status: 500 })
    }

    return NextResponse.json({ success: true, files: data })
  } catch (error) {
    console.error('Error fetching files:', error)
    return NextResponse.json({ success: false, error: '获取文件列表失败' }, { status: 500 })
  }
}
