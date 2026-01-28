export const textileBatch = {
  summary: {
    title: "GoDown TextileOS",
    subtitle: "Enterprise Textile Management",
    description:
      "Track every meter of women’s ethnic wear fabrics from procurement to finished product with live stock, vendor coordination, and quality analytics.",
    batchId: "TW-2024-0958",
  },
  heroStats: [
    { label: "Active Batches", value: "128" },
    { label: "Available Stock", value: "18,460 m" },
    { label: "Yield Efficiency", value: "93.4%" },
  ],
  modules: [
    {
      title: "Procurement Intake",
      description:
        "Capture supplier, origin, batch ID, rolls, meterage, storage location, and initial condition in a single intake flow.",
    },
    {
      title: "Live Stock Ledger",
      description:
        "Always know available meters, reserved stock, waste, and damaged fabric with automated reconciliations.",
    },
    {
      title: "Process Timeline",
      description:
        "Chronological tracking of dyeing, printing, cutting, stitching, finishing, and QC with quantities, losses, and costs.",
    },
    {
      title: "Cutting & Conversion",
      description:
        "Convert meters to pieces with expected vs actual yields, pattern codes, and discrepancy reasons for every cut batch.",
    },
    {
      title: "Vendor & Job Work",
      description:
        "Manage dyers, tailors, printers, and embroiders with job orders, rates, due dates, delivery status, and payments.",
    },
    {
      title: "Photo Evidence",
      description:
        "Upload photos at intake, post-dye, cutting, stitching, and final QC with captions, tags, and timestamps.",
    },
  ],
  batchDetails: [
    { label: "Supplier & Origin", value: "Shakti Mills, Surat · 60s Cotton Cambric" },
    { label: "Intake Summary", value: "28 rolls · 3,920 meters · Condition: Grade A" },
    { label: "Storage Location", value: "Warehouse A · Rack C4 · Bin 12" },
    { label: "Color & Dye", value: "Family: Plum · Shade: PM-214 · Dye Lot: DL-775 · Match: 98%" },
    { label: "Reservations", value: "1,140 meters reserved for PO #WE-2081" },
    { label: "Alerts", value: "Pending QC at finishing · 2 rolls marked for re-dye" },
  ],
  stock: [
    { label: "Available Meters", value: "2,210 m" },
    { label: "Reserved", value: "1,140 m" },
    { label: "Damaged", value: "120 m" },
    { label: "Waste & Loss", value: "86 m" },
  ],
  conversion: {
    title: "Cutting Conversion Snapshot",
    summary: "Expected: 640 kurtas · Actual: 612 kurtas · Discrepancy: 4.4% (print misalignment)",
  },
  timeline: [
    {
      code: "IN",
      tone: "primary",
      title: "Intake & Inspection · 02 Aug 2024",
      points: [
        "Received 3,920 meters · Initial moisture 8% · Supplier COA attached",
        "QC result: 2 minor defects logged · Corrective action: end-cut rework",
        "Photo set: raw fabric, roll labels, yardage counter",
      ],
    },
    {
      code: "DY",
      tone: "mint",
      title: "Sent to Dyer · 06 Aug 2024",
      points: [
        "Vendor: Rangshree Dyers · Job Order JO-772 · 3,600 meters dispatched",
        "Cost: ₹48/m · Expected return: 3,560 meters after shrinkage",
        "Dye lot DL-775 · Match quality target 97%+",
      ],
    },
    {
      code: "RD",
      tone: "accent",
      title: "Received from Dyer · 14 Aug 2024",
      points: [
        "3,540 meters received · 60 meters loss · Loss reason: shade correction",
        "QC: match quality 98% · Defects logged: 4 smudged panels",
        "Payment status: 60% released · Balance due on rework completion",
      ],
    },
    {
      code: "CT",
      tone: "rose",
      title: "Cutting & Bundling · 19 Aug 2024",
      points: [
        "Pattern: Gulbahar A-line · Marker efficiency 83%",
        "Expected pieces: 640 · Actual pieces: 612",
        "Discrepancy reason: print misalignment on 22 meters",
      ],
    },
  ],
  story: {
    title: "TW-2024-0958 · Plum Cambric",
    overview:
      "From Surat procurement to finished kurtas, this batch travelled across 4 vendors, passed 3 QC gates, and delivered a 93.4% yield. All photos, documents, and costs are linked to each step for instant audits.",
    metrics: [
      { tag: "Yield", value: "93.4%", caption: "Efficiency after cutting" },
      { tag: "Cost", value: "₹6.2L", caption: "Total batch spend" },
      { tag: "Timeline", value: "26 days", caption: "Procurement to finish" },
      { tag: "QC", value: "Pass", caption: "Last checkpoint" },
    ],
  },
  qc: [
    { stage: "Raw Fabric", status: "Pass", defects: "2 minor snags", action: "End-cut & marked" },
    { stage: "Post Dye", status: "Conditional", defects: "4 smudged panels", action: "Re-dye scheduled" },
    { stage: "Finishing", status: "Pass", defects: "None", action: "Ready to dispatch" },
  ],
  photos: [
    { title: "Raw Fabric Intake", meta: "02 Aug 2024 · Tags: roll label, defects" },
    { title: "Post Dye Shade Match", meta: "14 Aug 2024 · Tags: dye lot DL-775" },
    { title: "Cutting Layout", meta: "19 Aug 2024 · Tags: marker efficiency" },
    { title: "Final QC", meta: "28 Aug 2024 · Tags: finish, accessories" },
  ],
  vendors: [
    { vendor: "Rangshree Dyers", order: "JO-772", rate: "₹48/m", due: "14 Aug 2024", payment: "60% paid" },
    { vendor: "Kalini Printers", order: "JO-801", rate: "₹18/m", due: "22 Aug 2024", payment: "Pending" },
    { vendor: "Asha Tailors", order: "JO-846", rate: "₹95/piece", due: "30 Aug 2024", payment: "Scheduled" },
  ],
};