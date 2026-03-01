-- ============================================================
-- Paridhi Textile — Schema
-- Run in Supabase SQL Editor (drop old tables first)
-- ============================================================

-- Drop new tables if re-running
DROP TABLE IF EXISTS received_entries CASCADE;
DROP TABLE IF EXISTS process_dispatches CASCADE;
DROP TABLE IF EXISTS raw_material_items CASCADE;
DROP TABLE IF EXISTS raw_materials CASCADE;
DROP TABLE IF EXISTS batch_counters CASCADE;

-- ============================================================
-- Batch counter for auto-incrementing batch numbers
-- ============================================================
CREATE TABLE batch_counters (
  prefix TEXT PRIMARY KEY,
  current_value INT NOT NULL DEFAULT 0
);

INSERT INTO batch_counters (prefix, current_value) VALUES
  ('PT-RM', 0),
  ('PT-PD', 0),
  ('PT-RE', 0);

-- ============================================================
-- Function: next_batch_number(prefix) -> 'PT-RM-0001'
-- ============================================================
CREATE OR REPLACE FUNCTION next_batch_number(p_prefix TEXT)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  v_next INT;
BEGIN
  UPDATE batch_counters
  SET current_value = current_value + 1
  WHERE prefix = p_prefix
  RETURNING current_value INTO v_next;

  IF v_next IS NULL THEN
    RAISE EXCEPTION 'Unknown batch prefix: %', p_prefix;
  END IF;

  RETURN p_prefix || '-' || LPAD(v_next::TEXT, 4, '0');
END;
$$;

-- ============================================================
-- Point 1: Raw Materials
-- ============================================================
CREATE TABLE raw_materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_number TEXT UNIQUE NOT NULL,
  entry_date DATE NOT NULL,
  rate NUMERIC(12,2) NOT NULL,
  color TEXT NOT NULL,
  vendor_name TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- Point 2: Process Dispatches
-- ============================================================
CREATE TABLE raw_material_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  raw_material_id UUID NOT NULL REFERENCES raw_materials(id) ON DELETE CASCADE,
  material_type TEXT NOT NULL,
  unit_type TEXT NOT NULL CHECK (unit_type IN ('meters', 'units')),
  quantity NUMERIC(10,2) NOT NULL,
  remaining_quantity NUMERIC(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE process_dispatches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_number TEXT UNIQUE NOT NULL,
  raw_material_id UUID NOT NULL REFERENCES raw_materials(id) ON DELETE CASCADE,
  raw_material_item_id UUID NOT NULL REFERENCES raw_material_items(id),
  parent_batch_number TEXT NOT NULL,
  dispatch_date DATE NOT NULL,
  vendor_name TEXT NOT NULL,
  purpose TEXT NOT NULL CHECK (purpose IN ('dyeing', 'printing', 'stitching', 'finishing',
                                           'karigar', 'dyer', 'stitch', 'false')),
  material_type TEXT NOT NULL,
  unit_type TEXT NOT NULL CHECK (unit_type IN ('meters', 'units')),
  quantity_sent NUMERIC(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'dispatched' CHECK (status IN ('dispatched', 'received')),
  dispatch_type TEXT NOT NULL DEFAULT 'legacy'
    CHECK (dispatch_type IN ('karigar', 'dyer', 'stitch', 'false', 'legacy')),
  dispatch_group_id UUID,
  design_number TEXT,
  pieces_expected NUMERIC(10,2),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- Point 3: Received Entries
-- ============================================================
CREATE TABLE received_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_number TEXT UNIQUE NOT NULL,
  process_dispatch_id UUID NOT NULL REFERENCES process_dispatches(id) ON DELETE CASCADE,
  parent_batch_number TEXT NOT NULL,
  received_date DATE NOT NULL,
  output_type TEXT NOT NULL CHECK (output_type IN ('pieces', 'length')),
  output_quantity NUMERIC(10,2) NOT NULL,
  output_unit TEXT NOT NULL,
  description TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- RLS Policies
-- ============================================================
ALTER TABLE batch_counters ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_read_counters" ON batch_counters FOR SELECT USING (true);
CREATE POLICY "anon_update_counters" ON batch_counters FOR UPDATE USING (true) WITH CHECK (true);

ALTER TABLE raw_materials ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_select_rm" ON raw_materials FOR SELECT USING (true);
CREATE POLICY "anon_insert_rm" ON raw_materials FOR INSERT WITH CHECK (true);
CREATE POLICY "anon_update_rm" ON raw_materials FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "anon_delete_rm" ON raw_materials FOR DELETE USING (true);

ALTER TABLE raw_material_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_select_rmi" ON raw_material_items FOR SELECT USING (true);
CREATE POLICY "anon_insert_rmi" ON raw_material_items FOR INSERT WITH CHECK (true);
CREATE POLICY "anon_update_rmi" ON raw_material_items FOR UPDATE USING (true) WITH CHECK (true);

ALTER TABLE process_dispatches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_select_pd" ON process_dispatches FOR SELECT USING (true);
CREATE POLICY "anon_insert_pd" ON process_dispatches FOR INSERT WITH CHECK (true);
CREATE POLICY "anon_update_pd" ON process_dispatches FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "anon_delete_pd" ON process_dispatches FOR DELETE USING (true);

ALTER TABLE received_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_select_re" ON received_entries FOR SELECT USING (true);
CREATE POLICY "anon_insert_re" ON received_entries FOR INSERT WITH CHECK (true);
CREATE POLICY "anon_update_re" ON received_entries FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "anon_delete_re" ON received_entries FOR DELETE USING (true);

-- ============================================================
-- Grant RPC access
-- ============================================================
GRANT EXECUTE ON FUNCTION next_batch_number(TEXT) TO anon;

-- ============================================================
-- Indexes
-- ============================================================
CREATE INDEX idx_rmi_raw_material_id ON raw_material_items(raw_material_id);
CREATE INDEX idx_rmi_material_type ON raw_material_items(material_type);
CREATE INDEX idx_pd_raw_material_id ON process_dispatches(raw_material_id);
CREATE INDEX idx_pd_status ON process_dispatches(status);
CREATE INDEX idx_pd_dispatch_group_id ON process_dispatches(dispatch_group_id);
CREATE INDEX idx_pd_dispatch_type ON process_dispatches(dispatch_type);
CREATE INDEX idx_re_process_dispatch_id ON received_entries(process_dispatch_id);
