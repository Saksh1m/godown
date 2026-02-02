-- Supabase schema for Paridhi TextileOS

CREATE TABLE batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id TEXT UNIQUE NOT NULL,
  page_title TEXT NOT NULL,
  footer TEXT,
  summary_title TEXT NOT NULL,
  summary_subtitle TEXT,
  summary_description TEXT,
  ctas JSONB DEFAULT '{}',
  hero_stats JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id UUID REFERENCES batches(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  sort_order INT DEFAULT 0
);

CREATE TABLE batch_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id UUID REFERENCES batches(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  value TEXT NOT NULL,
  sort_order INT DEFAULT 0
);

CREATE TABLE stock (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id UUID REFERENCES batches(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  tag TEXT,
  stats JSONB DEFAULT '[]',
  conversion JSONB DEFAULT '{}'
);

CREATE TABLE timeline_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id UUID REFERENCES batches(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  tone TEXT DEFAULT 'primary',
  title TEXT NOT NULL,
  points JSONB DEFAULT '[]',
  sort_order INT DEFAULT 0
);

CREATE TABLE story (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id UUID REFERENCES batches(id) ON DELETE CASCADE,
  pill TEXT,
  title TEXT NOT NULL,
  overview TEXT,
  metrics JSONB DEFAULT '[]',
  highlights_title TEXT,
  highlights JSONB DEFAULT '[]'
);

CREATE TABLE quality_checkpoints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id UUID REFERENCES batches(id) ON DELETE CASCADE,
  stage TEXT NOT NULL,
  status TEXT NOT NULL,
  defects TEXT,
  action TEXT,
  sort_order INT DEFAULT 0
);

CREATE TABLE photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id UUID REFERENCES batches(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  caption TEXT,
  meta JSONB DEFAULT '[]',
  sort_order INT DEFAULT 0
);

CREATE TABLE vendors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id UUID REFERENCES batches(id) ON DELETE CASCADE,
  vendor TEXT NOT NULL,
  work TEXT,
  rate TEXT,
  due_date TEXT,
  payment_status TEXT,
  sort_order INT DEFAULT 0
);

-- Enable RLS on all tables
ALTER TABLE batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE batch_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock ENABLE ROW LEVEL SECURITY;
ALTER TABLE timeline_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE story ENABLE ROW LEVEL SECURITY;
ALTER TABLE quality_checkpoints ENABLE ROW LEVEL SECURITY;
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;

-- Allow anonymous read access
CREATE POLICY "Allow anonymous read" ON batches FOR SELECT USING (true);
CREATE POLICY "Allow anonymous read" ON modules FOR SELECT USING (true);
CREATE POLICY "Allow anonymous read" ON batch_details FOR SELECT USING (true);
CREATE POLICY "Allow anonymous read" ON stock FOR SELECT USING (true);
CREATE POLICY "Allow anonymous read" ON timeline_entries FOR SELECT USING (true);
CREATE POLICY "Allow anonymous read" ON story FOR SELECT USING (true);
CREATE POLICY "Allow anonymous read" ON quality_checkpoints FOR SELECT USING (true);
CREATE POLICY "Allow anonymous read" ON photos FOR SELECT USING (true);
CREATE POLICY "Allow anonymous read" ON vendors FOR SELECT USING (true);
