import { put } from '@vercel/blob'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateShareId, MAX_FILE_SIZE } from '@/lib/file-utils'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const description = formData.get('description') as string | null

    if (!file) {
      return NextResponse.json({ success: false, error: '请选择文件' }, { status: 400 })
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ success: false, error: '文件大小不能超过1GB' }, { status: 400 })
    }

    // Upload to Vercel Blob
    const blob = await put(file.name, file, {
      access: 'public',
    })

    // Generate unique share ID
    const shareId = generateShareId()

    // Save file metadata to Supabase
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('files')
      .insert({
        filename: file.name,
        original_name: file.name,
        size: file.size,
        mime_type: file.type || null,
        blob_url: blob.url,
        share_id: shareId,
        description: description || null,
      })
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ success: false, error: '保存文件信息失败' }, { status: 500 })
    }

    return NextResponse.json({ success: true, file: data })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ success: false, error: '上传失败' }, { status: 500 })
  }
}
