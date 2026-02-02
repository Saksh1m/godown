-- Seed data for Paridhi TextileOS
-- Run this AFTER schema.sql in the Supabase SQL editor

-- Insert batch
INSERT INTO batches (id, batch_id, page_title, footer, summary_title, summary_subtitle, summary_description, ctas, hero_stats)
VALUES (
  'a1b2c3d4-0000-0000-0000-000000000001',
  'PAR-TX-2025-0196',
  'Paridhi TextileOS · Enterprise Textile Management',
  'Paridhi TextileOS · Enterprise control for women''s ethnic wear fabric lifecycle, vendor performance, and quality excellence.',
  'Paridhi TextileOS',
  'Enterprise Textile Management',
  'Enterprise-grade textile management for Paridhi, tracking every roll from procurement to finished women''s ethnic wear with live stock, vendor workflows, and quality intelligence.',
  '{"primary": {"label": "View Textile Story", "href": "#textile-story"}, "secondary": {"label": "Explore Modules", "href": "#modules"}}',
  '[{"label": "Active Textile Batches", "value": "146"}, {"label": "Live Stock Coverage", "value": "21,380 m"}, {"label": "On-Time Job Work", "value": "96%"}]'
);

-- Modules
INSERT INTO modules (batch_id, title, description, sort_order) VALUES
  ('a1b2c3d4-0000-0000-0000-000000000001', 'Procurement Intake', 'Capture supplier, origin, batch ID, rolls, meterage, storage location, and initial fabric condition at the gate.', 0),
  ('a1b2c3d4-0000-0000-0000-000000000001', 'Real-Time Stock Ledger', 'Monitor available meters, reserved stock, waste, and damaged fabric with continuous reconciliation.', 1),
  ('a1b2c3d4-0000-0000-0000-000000000001', 'Process Timeline', 'Chronological tracking for dyeing, printing, cutting, stitching, finishing, and QC with quantities, losses, and costs.', 2),
  ('a1b2c3d4-0000-0000-0000-000000000001', 'Cutting & Conversion', 'Convert meters to pieces with expected vs actual yield, pattern references, and variance reasons per cut batch.', 3),
  ('a1b2c3d4-0000-0000-0000-000000000001', 'Vendor & Job Work', 'Manage dyers, printers, tailors, and finishers with job orders, rates, due dates, and payment status.', 4),
  ('a1b2c3d4-0000-0000-0000-000000000001', 'Photo Evidence', 'Attach tagged photos to any process step with captions, timestamps, and batch links.', 5);

-- Batch details
INSERT INTO batch_details (batch_id, label, value, sort_order) VALUES
  ('a1b2c3d4-0000-0000-0000-000000000001', 'Supplier & Origin', 'PariTex Weaves, Bhiwandi · 80s Cotton Mulmul', 0),
  ('a1b2c3d4-0000-0000-0000-000000000001', 'Incoming Shipment', '32 rolls · 4,480 meters · Received 12 Jan 2025', 1),
  ('a1b2c3d4-0000-0000-0000-000000000001', 'Storage Location', 'Warehouse B · Aisle 4 · Rack D2 · Bin 09', 2),
  ('a1b2c3d4-0000-0000-0000-000000000001', 'Initial Condition', 'Grade A · Moisture 7.6% · Visual defects: 3 minor slubs', 3),
  ('a1b2c3d4-0000-0000-0000-000000000001', 'Color & Dye Profile', 'Family: Maroon · Shade Code: MR-328 · Dye Lot: DL-902 · Match Quality: 98.6%', 4),
  ('a1b2c3d4-0000-0000-0000-000000000001', 'Reservation & Demand', '1,520 meters reserved for PO #PAR-WE-514 · 2 styles in plan', 5),
  ('a1b2c3d4-0000-0000-0000-000000000001', 'Compliance & Docs', 'Supplier COA, shrinkage report, and GSM report attached to batch', 6);

-- Stock
INSERT INTO stock (batch_id, title, tag, stats, conversion) VALUES (
  'a1b2c3d4-0000-0000-0000-000000000001',
  'Real-Time Stock',
  'Auto-reconciled',
  '[{"label": "Available Meters", "value": "2,580 m"}, {"label": "Reserved Stock", "value": "1,520 m"}, {"label": "Damaged", "value": "110 m"}, {"label": "Waste & Loss", "value": "86 m"}]',
  '{"title": "Cutting Conversion Snapshot", "summary": "Expected output: 680 kurtas · Actual output: 652 kurtas · Variance: 4.1%", "details": ["Design: Meher A-line Kurta · Pattern Code: PAR-AL-11", "Marker efficiency: 84% · Fabric shrinkage allowance: 1.8%", "Discrepancy reason: dye shade variation on 24 meters", "Corrective action: re-layout for panels and supplier claim logged"]}'
);

-- Timeline entries
INSERT INTO timeline_entries (batch_id, code, tone, title, points, sort_order) VALUES
  ('a1b2c3d4-0000-0000-0000-000000000001', 'IN', 'primary', 'Intake & Inspection · 12 Jan 2025', '["Received 4,480 meters from PariTex Weaves · GRN #GRN-1186", "Inspection: 3 minor slubs · Defects logged in QC-RAW-22", "Initial cost: ₹112/m · Storage assigned to Warehouse B"]', 0),
  ('a1b2c3d4-0000-0000-0000-000000000001', 'DY', 'mint', 'Sent to Dyer · 16 Jan 2025', '["Vendor: Rangshree Dyers · Job Order JO-984 · 4,200 meters dispatched", "Expected return: 4,140 meters after shrinkage · Target match 98%+", "Rate: ₹46/m · Transport cost: ₹8,400"]', 1),
  ('a1b2c3d4-0000-0000-0000-000000000001', 'RD', 'accent', 'Received from Dyer · 23 Jan 2025', '["4,120 meters received · Loss: 80 meters (shade correction)", "Match quality achieved: 98.6% · Dye lot DL-902 confirmed", "Payment status: 50% released · Balance due after rework"]', 2),
  ('a1b2c3d4-0000-0000-0000-000000000001', 'PR', 'rose', 'Printing & Embellishment · 27 Jan 2025', '["Vendor: KalaPrint Studio · Job Order JO-1014 · 3,980 meters sent", "Process: block print + foil accents · Expected return: 3,920 meters", "Cost: ₹22/m · Rejection threshold: 2% max"]', 3),
  ('a1b2c3d4-0000-0000-0000-000000000001', 'CT', 'primary', 'Cutting & Bundling · 02 Feb 2025', '["Pattern: Meher A-line · Marker efficiency 84%", "Expected pieces: 680 · Actual pieces: 652", "Discrepancy: print misalignment on 24 meters"]', 4),
  ('a1b2c3d4-0000-0000-0000-000000000001', 'ST', 'mint', 'Stitching & Finishing · 10 Feb 2025', '["Vendor: Asha Tailors · Job Order JO-1098 · 652 pieces issued", "Finishing loss: 11 pieces (needle marks) · Rework in progress", "Rate: ₹110/piece · Due date: 18 Feb 2025"]', 5);

-- Story
INSERT INTO story (batch_id, pill, title, overview, metrics, highlights_title, highlights) VALUES (
  'a1b2c3d4-0000-0000-0000-000000000001',
  'Textile Story',
  'PAR-TX-2025-0196 · Maroon Mulmul',
  'This batch moved through 5 vendors and 4 QC gates, delivering a 95.9% yield for Paridhi''s winter kurta line. Every step—from intake to finishing—is logged with quantities, costs, and evidence.',
  '[{"tag": "Yield", "value": "95.9%", "caption": "After cutting & finishing"}, {"tag": "Cost", "value": "₹7.1L", "caption": "Total batch spend"}, {"tag": "Timeline", "value": "29 days", "caption": "Procurement to finish"}, {"tag": "QC", "value": "Pass", "caption": "Last checkpoint"}]',
  'Textile Story Highlights',
  '["Origin: Bhiwandi mills with compliance docs attached at intake", "Process history covers dyeing, printing, cutting, stitching, and finishing", "Current stock: 2,580 meters available with live reservation sync", "Yield analysis captured against expected pieces and variance reasons", "Photo evidence linked to every process step and QC checkpoint"]'
);

-- Quality checkpoints
INSERT INTO quality_checkpoints (batch_id, stage, status, defects, action, sort_order) VALUES
  ('a1b2c3d4-0000-0000-0000-000000000001', 'Raw Fabric', 'Pass', '3 minor slubs', 'End-cut and tagged for recheck', 0),
  ('a1b2c3d4-0000-0000-0000-000000000001', 'Post Dye', 'Pass', 'Shade variance within tolerance', 'Approved for printing', 1),
  ('a1b2c3d4-0000-0000-0000-000000000001', 'Post Print', 'Conditional', '2% foil smudge', 'Rework panels before cutting', 2),
  ('a1b2c3d4-0000-0000-0000-000000000001', 'Final Finish', 'Pass', 'None', 'Ready for packing and dispatch', 3);

-- Photos
INSERT INTO photos (batch_id, title, caption, meta, sort_order) VALUES
  ('a1b2c3d4-0000-0000-0000-000000000001', 'Raw Fabric Intake', 'Roll labels and initial defects captured at dock inspection.', '["Batch: PAR-TX-2025-0196", "Stage: Intake & Inspection", "Timestamp: 12 Jan 2025 · 10:42 IST", "Tags: roll label, defects, moisture"]', 0),
  ('a1b2c3d4-0000-0000-0000-000000000001', 'Post Dye Shade Match', 'Dye lot verification with match card and shade approval.', '["Batch: PAR-TX-2025-0196", "Stage: Dyeing Return", "Timestamp: 23 Jan 2025 · 17:05 IST", "Tags: dye lot DL-902, shade match"]', 1),
  ('a1b2c3d4-0000-0000-0000-000000000001', 'Printing Preview', 'Block print alignment and foil accents review before cutting.', '["Batch: PAR-TX-2025-0196", "Stage: Printing", "Timestamp: 27 Jan 2025 · 15:12 IST", "Tags: block print, foil, alignment"]', 2),
  ('a1b2c3d4-0000-0000-0000-000000000001', 'Cutting Layout', 'Marker layout with piece count verification on cutting floor.', '["Batch: PAR-TX-2025-0196", "Stage: Cutting & Bundling", "Timestamp: 02 Feb 2025 · 12:26 IST", "Tags: marker efficiency, yield"]', 3),
  ('a1b2c3d4-0000-0000-0000-000000000001', 'Final QC', 'Finished kurtas checked for stitch quality and finishing.', '["Batch: PAR-TX-2025-0196", "Stage: Final QC", "Timestamp: 18 Feb 2025 · 18:08 IST", "Tags: finishing, stitch quality"]', 4);

-- Vendors
INSERT INTO vendors (batch_id, vendor, work, rate, due_date, payment_status, sort_order) VALUES
  ('a1b2c3d4-0000-0000-0000-000000000001', 'Rangshree Dyers', 'Dyeing · JO-984', '₹46/m', '23 Jan 2025', '50% paid', 0),
  ('a1b2c3d4-0000-0000-0000-000000000001', 'KalaPrint Studio', 'Printing · JO-1014', '₹22/m', '29 Jan 2025', 'Pending', 1),
  ('a1b2c3d4-0000-0000-0000-000000000001', 'Asha Tailors', 'Stitching · JO-1098', '₹110/piece', '18 Feb 2025', 'Scheduled', 2),
  ('a1b2c3d4-0000-0000-0000-000000000001', 'Vastra Finishers', 'Finishing · JO-1122', '₹14/piece', '20 Feb 2025', 'On hold', 3);
