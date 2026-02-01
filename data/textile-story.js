export const textileBatch = {
    pageTitle: "Paridhi TextileOS · Enterprise Textile Management",
  summary: {
    title: "Paridhi TextileOS",
    subtitle: "Enterprise Textile Management",
    description:
      "Enterprise-grade textile management for Paridhi, tracking every roll from procurement to finished women’s ethnic wear with live stock, vendor workflows, and quality intelligence.",
    batchId: "PAR-TX-2025-0196",
  },
  ctas: {
    primary: { label: "View Textile Story", href: "#textile-story" },
    secondary: { label: "Explore Modules", href: "#modules" },
  },
  heroStats: [
    { label: "Active Textile Batches", value: "146" },
    { label: "Live Stock Coverage", value: "21,380 m" },
    { label: "On-Time Job Work", value: "96%" },
  ],
  modules: [
    {
      title: "Procurement Intake",
      description:
        "Capture supplier, origin, batch ID, rolls, meterage, storage location, and initial fabric condition at the gate.",
    },
    {
      title: "Real-Time Stock Ledger",
      description:
        "Monitor available meters, reserved stock, waste, and damaged fabric with continuous reconciliation.",
    },
    {
      title: "Process Timeline",
      description:
        "Chronological tracking for dyeing, printing, cutting, stitching, finishing, and QC with quantities, losses, and costs.",
    },
    {
      title: "Cutting & Conversion",
      description:
        "Convert meters to pieces with expected vs actual yield, pattern references, and variance reasons per cut batch.",
    },
    {
      title: "Vendor & Job Work",
      description:
        "Manage dyers, printers, tailors, and finishers with job orders, rates, due dates, and payment status.",
    },
    {
      title: "Photo Evidence",
      description:
        "Attach tagged photos to any process step with captions, timestamps, and batch links.",
    },
  ],
  sections: {
    batchControl: {
      title: "Batch Control Center",
      tag: "Unique Batch ID:",
      columns: ["Attribute", "Details"],
      details: [
        {
          label: "Supplier & Origin",
          value: "PariTex Weaves, Bhiwandi · 80s Cotton Mulmul",
        },
        {
          label: "Incoming Shipment",
          value: "32 rolls · 4,480 meters · Received 12 Jan 2025",
        },
        {
          label: "Storage Location",
          value: "Warehouse B · Aisle 4 · Rack D2 · Bin 09",
        },
        {
          label: "Initial Condition",
          value: "Grade A · Moisture 7.6% · Visual defects: 3 minor slubs",
        },
        {
          label: "Color & Dye Profile",
          value: "Family: Maroon · Shade Code: MR-328 · Dye Lot: DL-902 · Match Quality: 98.6%",
        },
        {
          label: "Reservation & Demand",
          value: "1,520 meters reserved for PO #PAR-WE-514 · 2 styles in plan",
        },
        {
          label: "Compliance & Docs",
          value: "Supplier COA, shrinkage report, and GSM report attached to batch",
        },
      ],
    },
    stock: {
      title: "Real-Time Stock",
      tag: "Auto-reconciled",
      stats: [
        { label: "Available Meters", value: "2,580 m" },
        { label: "Reserved Stock", value: "1,520 m" },
        { label: "Damaged", value: "110 m" },
        { label: "Waste & Loss", value: "86 m" },
      ],
      conversion: {
        title: "Cutting Conversion Snapshot",
        summary:
          "Expected output: 680 kurtas · Actual output: 652 kurtas · Variance: 4.1%",
        details: [
          "Design: Meher A-line Kurta · Pattern Code: PAR-AL-11",
          "Marker efficiency: 84% · Fabric shrinkage allowance: 1.8%",
          "Discrepancy reason: dye shade variation on 24 meters",
          "Corrective action: re-layout for panels and supplier claim logged",
        ],
      },
    },
    timeline: {
      title: "Process Timeline",
      tag: "Full Audit Trail",
      entries: [
        {
          code: "IN",
          tone: "primary",
          title: "Intake & Inspection · 12 Jan 2025",
          points: [
            "Received 4,480 meters from PariTex Weaves · GRN #GRN-1186",
            "Inspection: 3 minor slubs · Defects logged in QC-RAW-22",
            "Initial cost: ₹112/m · Storage assigned to Warehouse B",
          ],
        },
        {
          code: "DY",
          tone: "mint",
          title: "Sent to Dyer · 16 Jan 2025",
          points: [
            "Vendor: Rangshree Dyers · Job Order JO-984 · 4,200 meters dispatched",
            "Expected return: 4,140 meters after shrinkage · Target match 98%+",
            "Rate: ₹46/m · Transport cost: ₹8,400",
          ],
        },
        {
          code: "RD",
          tone: "accent",
          title: "Received from Dyer · 23 Jan 2025",
          points: [
            "4,120 meters received · Loss: 80 meters (shade correction)",
            "Match quality achieved: 98.6% · Dye lot DL-902 confirmed",
            "Payment status: 50% released · Balance due after rework",
          ],
        },
        {
          code: "PR",
          tone: "rose",
          title: "Printing & Embellishment · 27 Jan 2025",
          points: [
            "Vendor: KalaPrint Studio · Job Order JO-1014 · 3,980 meters sent",
            "Process: block print + foil accents · Expected return: 3,920 meters",
            "Cost: ₹22/m · Rejection threshold: 2% max",
          ],
        },
        {
          code: "CT",
          tone: "primary",
          title: "Cutting & Bundling · 02 Feb 2025",
          points: [
            "Pattern: Meher A-line · Marker efficiency 84%",
            "Expected pieces: 680 · Actual pieces: 652",
            "Discrepancy: print misalignment on 24 meters",
          ],
        },
        {
          code: "ST",
          tone: "mint",
          title: "Stitching & Finishing · 10 Feb 2025",
          points: [
            "Vendor: Asha Tailors · Job Order JO-1098 · 652 pieces issued",
            "Finishing loss: 11 pieces (needle marks) · Rework in progress",
            "Rate: ₹110/piece · Due date: 18 Feb 2025",
          ],
        },
      ],
    },
    story: {
      pill: "Textile Story",
      title: "PAR-TX-2025-0196 · Maroon Mulmul",
      overview:
        "This batch moved through 5 vendors and 4 QC gates, delivering a 95.9% yield for Paridhi’s winter kurta line. Every step—from intake to finishing—is logged with quantities, costs, and evidence.",
      metrics: [
        { tag: "Yield", value: "95.9%", caption: "After cutting & finishing" },
        { tag: "Cost", value: "₹7.1L", caption: "Total batch spend" },
        { tag: "Timeline", value: "29 days", caption: "Procurement to finish" },
        { tag: "QC", value: "Pass", caption: "Last checkpoint" },
      ],
      highlightsTitle: "Textile Story Highlights",
      highlights: [
        "Origin: Bhiwandi mills with compliance docs attached at intake",
        "Process history covers dyeing, printing, cutting, stitching, and finishing",
        "Current stock: 2,580 meters available with live reservation sync",
        "Yield analysis captured against expected pieces and variance reasons",
        "Photo evidence linked to every process step and QC checkpoint",
      ],
    },
    quality: {
      title: "Quality Control Checkpoints",
      columns: ["Stage", "Status", "Defects Logged", "Corrective Action"],
      checkpoints: [
        {
          stage: "Raw Fabric",
          status: "Pass",
          defects: "3 minor slubs",
          action: "End-cut and tagged for recheck",
        },
        {
          stage: "Post Dye",
          status: "Pass",
          defects: "Shade variance within tolerance",
          action: "Approved for printing",
        },
        {
          stage: "Post Print",
          status: "Conditional",
          defects: "2% foil smudge",
          action: "Rework panels before cutting",
        },
        {
          stage: "Final Finish",
          status: "Pass",
          defects: "None",
          action: "Ready for packing and dispatch",
        },
      ],
    },
    photos: {
      title: "Photo Attachments",
      tag: "Tagged & Timestamped",
      items: [
        {
          title: "Raw Fabric Intake",
          caption: "Roll labels and initial defects captured at dock inspection.",
          meta: [
            "Batch: PAR-TX-2025-0196",
            "Stage: Intake & Inspection",
            "Timestamp: 12 Jan 2025 · 10:42 IST",
            "Tags: roll label, defects, moisture",
          ],
        },
        {
          title: "Post Dye Shade Match",
          caption: "Dye lot verification with match card and shade approval.",
          meta: [
            "Batch: PAR-TX-2025-0196",
            "Stage: Dyeing Return",
            "Timestamp: 23 Jan 2025 · 17:05 IST",
            "Tags: dye lot DL-902, shade match",
          ],
        },
        {
          title: "Printing Preview",
          caption: "Block print alignment and foil accents review before cutting.",
          meta: [
            "Batch: PAR-TX-2025-0196",
            "Stage: Printing",
            "Timestamp: 27 Jan 2025 · 15:12 IST",
            "Tags: block print, foil, alignment",
          ],
        },
        {
          title: "Cutting Layout",
          caption: "Marker layout with piece count verification on cutting floor.",
          meta: [
            "Batch: PAR-TX-2025-0196",
            "Stage: Cutting & Bundling",
            "Timestamp: 02 Feb 2025 · 12:26 IST",
            "Tags: marker efficiency, yield",
          ],
        },
        {
          title: "Final QC",
          caption: "Finished kurtas checked for stitch quality and finishing.",
          meta: [
            "Batch: PAR-TX-2025-0196",
            "Stage: Final QC",
            "Timestamp: 18 Feb 2025 · 18:08 IST",
            "Tags: finishing, stitch quality",
          ],
        },
      ],
    },
    vendors: {
      title: "Vendor & Job Orders",
      columns: ["Vendor", "Job Work", "Rate", "Due Date", "Payment Status"],
      items: [
        {
          vendor: "Rangshree Dyers",
          work: "Dyeing · JO-984",
          rate: "₹46/m",
          due: "23 Jan 2025",
          payment: "50% paid",
        },
        {
          vendor: "KalaPrint Studio",
          work: "Printing · JO-1014",
          rate: "₹22/m",
          due: "29 Jan 2025",
          payment: "Pending",
        },
        {
          vendor: "Asha Tailors",
          work: "Stitching · JO-1098",
          rate: "₹110/piece",
          due: "18 Feb 2025",
          payment: "Scheduled",
        },
        {
          vendor: "Vastra Finishers",
          work: "Finishing · JO-1122",
          rate: "₹14/piece",
          due: "20 Feb 2025",
          payment: "On hold",
        },
      ],
    },
  },
  footer:
    "Paridhi TextileOS · Enterprise control for women’s ethnic wear fabric lifecycle, vendor performance, and quality excellence.",
};