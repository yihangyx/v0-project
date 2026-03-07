'use client'

import { useState, useEffect } from 'react'
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const fontOptions = [
  { value: 'Geist', label: 'Geist (默认)' },
  { value: 'Inter', label: 'Inter' },
  { value: 'Roboto', label: 'Roboto' },
  { value: 'Noto Sans SC', label: 'Noto Sans SC (思源黑体)' },
  { value: 'LXGW WenKai', label: 'LXGW WenKai (霞鹜文楷)' },
  { value: 'Source Han Sans CN', label: 'Source Han Sans (思源黑体)' },
]

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState({
    site_title: '',
    site_description: '',
    custom_font: 'Geist',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/admin/settings')
      const data = await response.json()
      if (data.success && data.settings) {
        setSettings({
          site_title: data.settings.site_title || '',
          site_description: data.settings.site_description || '',
          custom_font: data.settings.custom_font || 'Geist',
        })
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)
    setSaving(true)

    try {
      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      })

      const data = await response.json()

      if (data.success) {
        setMessage({ type: 'success', text: '设置已保存' })
      } else {
        setMessage({ type: 'error', text: data.error || '保存失败' })
      }
    } catch {
      setMessage({ type: 'error', text: '保存失败，请重试' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="p-6 lg:p-8">
        <div className="max-w-2xl mx-auto flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">站点设置</h1>
          <p className="text-muted-foreground mt-1">自定义您的网盘外观和介绍</p>
        </div>

        {/* Settings Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-card border rounded-xl p-6 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="site_title">站点名称</Label>
              <Input
                id="site_title"
                value={settings.site_title}
                onChange={(e) => setSettings({ ...settings, site_title: e.target.value })}
                placeholder="CloudDrive"
              />
              <p className="text-xs text-muted-foreground">
                显示在网站标题和页面顶部
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="site_description">站点描述</Label>
              <Textarea
                id="site_description"
                value={settings.site_description}
                onChange={(e) => setSettings({ ...settings, site_description: e.target.value })}
                placeholder="您的个人云存储服务"
                rows={3}
              />
              <p className="text-xs text-muted-foreground">
                用于SEO和分享时显示的描述
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="custom_font">显示字体</Label>
              <Select
                value={settings.custom_font}
                onValueChange={(value) => setSettings({ ...settings, custom_font: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择字体" />
                </SelectTrigger>
                <SelectContent>
                  {fontOptions.map((font) => (
                    <SelectItem key={font.value} value={font.value}>
                      {font.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                选择网站使用的字体（需要刷新页面生效）
              </p>
            </div>
          </div>

          {message && (
            <div className={`
              flex items-center gap-2 p-4 rounded-xl text-sm
              ${message.type === 'success' 
                ? 'bg-accent/20 text-accent-foreground' 
                : 'bg-destructive/10 text-destructive'
              }
            `}>
              {message.type === 'success' 
                ? <CheckCircle className="h-4 w-4 flex-shrink-0" />
                : <AlertCircle className="h-4 w-4 flex-shrink-0" />
              }
              <span>{message.text}</span>
            </div>
          )}

          <Button type="submit" disabled={saving} className="w-full">
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                保存中...
              </>
            ) : (
              '保存设置'
            )}
          </Button>
        </form>
      </div>
    </div>
  )
}
