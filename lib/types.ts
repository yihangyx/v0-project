export interface FileItem {
  id: string
  filename: string
  original_name: string
  size: number
  mime_type: string | null
  blob_url: string
  share_id: string
  download_count: number
  description: string | null
  created_at: string
  updated_at: string
}

export interface AdminSettings {
  id: number
  password_hash: string
  site_title: string
  site_description: string
  custom_font: string
  created_at: string
  updated_at: string
}

export interface UploadResponse {
  success: boolean
  file?: FileItem
  error?: string
}

export interface ShareInfo {
  file: FileItem
  download_url: string
}
