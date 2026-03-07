-- Create files table for storing file metadata
CREATE TABLE IF NOT EXISTS files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  filename TEXT NOT NULL,
  original_name TEXT NOT NULL,
  size BIGINT NOT NULL,
  mime_type TEXT,
  blob_url TEXT NOT NULL,
  share_id TEXT UNIQUE NOT NULL,
  download_count INTEGER DEFAULT 0,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create admin_settings table for storing admin password
CREATE TABLE IF NOT EXISTS admin_settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  password_hash TEXT NOT NULL,
  site_title TEXT DEFAULT 'CloudDrive',
  site_description TEXT DEFAULT 'Your Personal Cloud Storage',
  custom_font TEXT DEFAULT 'Geist',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for share_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_files_share_id ON files(share_id);

-- Insert default admin settings with password 'admin123' (bcrypt hash)
INSERT INTO admin_settings (id, password_hash, site_title, site_description, custom_font)
VALUES (1, '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZRGdjGj/6sW.MxkHpCoQy6RmOqk7e', 'CloudDrive', 'Your Personal Cloud Storage', 'Geist')
ON CONFLICT (id) DO NOTHING;
