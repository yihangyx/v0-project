import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import bcrypt from 'bcryptjs'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ shareId: string }> }
) {
  try {
    const { shareId } = await params
    const supabase = await createClient()

    const { data: file, error } = await supabase
      .from('files')
      .select('id, original_name, size, mime_type, download_count, description, is_protected, created_at, blob_url')
      .eq('share_id', shareId)
      .single()

    if (error || !file) {
      return NextResponse.json({ success: false, error: '文件不存在或已被删除' }, { status: 404 })
    }

    return NextResponse.json({ 
      success: true, 
      file: {
        ...file,
        blob_url: file.is_protected ? null : file.blob_url,
      }
    })
  } catch (error) {
    console.error('Share info error:', error)
    return NextResponse.json({ success: false, error: '获取分享信息失败' }, { status: 500 })
  }
}

// Verify password for protected files
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ shareId: string }> }
) {
  try {
    const { shareId } = await params
    const { password } = await request.json()
    const supabase = await createClient()

    const { data: file, error } = await supabase
      .from('files')
      .select('id, blob_url, password_hash, is_protected, download_count')
      .eq('share_id', shareId)
      .single()

    if (error || !file) {
      return NextResponse.json({ success: false, error: '文件不存在或已被删除' }, { status: 404 })
    }

    if (!file.is_protected) {
      return NextResponse.json({ success: true, blob_url: file.blob_url })
    }

    if (!password || !file.password_hash) {
      return NextResponse.json({ success: false, error: '请输入密码' }, { status: 400 })
    }

    const isValid = await bcrypt.compare(password, file.password_hash)
    if (!isValid) {
      return NextResponse.json({ success: false, error: '密码错误' }, { status: 401 })
    }

    // Increment download count
    await supabase
      .from('files')
      .update({ download_count: file.download_count + 1 })
      .eq('id', file.id)

    return NextResponse.json({ success: true, blob_url: file.blob_url })
  } catch (error) {
    console.error('Password verify error:', error)
    return NextResponse.json({ success: false, error: '验证失败' }, { status: 500 })
  }
}
