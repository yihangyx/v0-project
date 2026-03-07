import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const session = cookieStore.get('admin_session')

    if (!session || session.value !== 'authenticated') {
      return NextResponse.json({ success: false, error: '未授权' }, { status: 401 })
    }

    const { currentPassword, newPassword } = await request.json()

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ success: false, error: '请填写所有字段' }, { status: 400 })
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ success: false, error: '新密码至少需要6个字符' }, { status: 400 })
    }

    const supabase = await createClient()
    const { data: settings, error } = await supabase
      .from('admin_settings')
      .select('*')
      .single()

    if (error || !settings) {
      return NextResponse.json({ success: false, error: '设置不存在' }, { status: 404 })
    }

    const isValid = await bcrypt.compare(currentPassword, settings.password_hash)

    if (!isValid) {
      return NextResponse.json({ success: false, error: '当前密码错误' }, { status: 401 })
    }

    const newHash = await bcrypt.hash(newPassword, 10)

    const { error: updateError } = await supabase
      .from('admin_settings')
      .update({ password_hash: newHash, updated_at: new Date().toISOString() })
      .eq('id', settings.id)

    if (updateError) {
      return NextResponse.json({ success: false, error: '更新密码失败' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Password change error:', error)
    return NextResponse.json({ success: false, error: '更改密码失败' }, { status: 500 })
  }
}
