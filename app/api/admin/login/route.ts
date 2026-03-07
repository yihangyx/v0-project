import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json()

    if (!password) {
      return NextResponse.json({ success: false, error: '请输入密码' }, { status: 400 })
    }

    const supabase = await createClient()
    const { data: settings, error } = await supabase
      .from('admin_settings')
      .select('*')
      .single()

    // If no settings exist, create default (first time setup)
    if (error || !settings) {
      const defaultHash = await bcrypt.hash('admin123', 10)
      await supabase.from('admin_settings').insert({
        password_hash: defaultHash,
        site_title: 'CloudDrive',
        site_description: '您的个人云存储',
        custom_font: 'Geist'
      })
      
      if (password === 'admin123') {
        const cookieStore = await cookies()
        cookieStore.set('admin_session', 'authenticated', {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 // 24 hours
        })
        return NextResponse.json({ success: true })
      }
      return NextResponse.json({ success: false, error: '密码错误' }, { status: 401 })
    }

    const isValid = await bcrypt.compare(password, settings.password_hash)

    if (!isValid) {
      return NextResponse.json({ success: false, error: '密码错误' }, { status: 401 })
    }

    const cookieStore = await cookies()
    cookieStore.set('admin_session', 'authenticated', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 // 24 hours
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ success: false, error: '登录失败' }, { status: 500 })
  }
}
