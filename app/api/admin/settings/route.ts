import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: settings, error } = await supabase
      .from('admin_settings')
      .select('id, site_title, site_description, custom_font, created_at, updated_at')
      .single()

    if (error || !settings) {
      return NextResponse.json({ 
        success: true, 
        settings: {
          site_title: 'CloudDrive',
          site_description: '您的个人云存储',
          custom_font: 'Geist'
        }
      })
    }

    return NextResponse.json({ success: true, settings })
  } catch (error) {
    console.error('Settings fetch error:', error)
    return NextResponse.json({ success: false, error: '获取设置失败' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const session = cookieStore.get('admin_session')

    if (!session || session.value !== 'authenticated') {
      return NextResponse.json({ success: false, error: '未授权' }, { status: 401 })
    }

    const { site_title, site_description, custom_font } = await request.json()

    const supabase = await createClient()
    
    // Check if settings exist
    const { data: existing } = await supabase
      .from('admin_settings')
      .select('id')
      .single()

    if (existing) {
      const { error } = await supabase
        .from('admin_settings')
        .update({ 
          site_title, 
          site_description, 
          custom_font,
          updated_at: new Date().toISOString() 
        })
        .eq('id', existing.id)

      if (error) {
        return NextResponse.json({ success: false, error: '更新设置失败' }, { status: 500 })
      }
    } else {
      const { error } = await supabase
        .from('admin_settings')
        .insert({ 
          site_title, 
          site_description, 
          custom_font,
          password_hash: await (await import('bcryptjs')).hash('admin123', 10)
        })

      if (error) {
        return NextResponse.json({ success: false, error: '创建设置失败' }, { status: 500 })
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Settings update error:', error)
    return NextResponse.json({ success: false, error: '更新设置失败' }, { status: 500 })
  }
}
