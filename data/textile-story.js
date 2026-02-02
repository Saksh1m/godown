import { supabase } from "./supabase.js";

export async function fetchTextileBatch(batchId) {
  const { data: batch, error } = await supabase
    .from("batches")
    .select("*")
    .eq("batch_id", batchId)
    .single();

  if (error) throw new Error(`Failed to load batch: ${error.message}`);

  const id = batch.id;

  const [modules, details, stock, timeline, story, quality, photos, vendors] =
    await Promise.all([
      supabase.from("modules").select("*").eq("batch_id", id).order("sort_order"),
      supabase.from("batch_details").select("*").eq("batch_id", id).order("sort_order"),
      supabase.from("stock").select("*").eq("batch_id", id).single(),
      supabase.from("timeline_entries").select("*").eq("batch_id", id).order("sort_order"),
      supabase.from("story").select("*").eq("batch_id", id).single(),
      supabase.from("quality_checkpoints").select("*").eq("batch_id", id).order("sort_order"),
      supabase.from("photos").select("*").eq("batch_id", id).order("sort_order"),
      supabase.from("vendors").select("*").eq("batch_id", id).order("sort_order"),
    ]);

  return {
    pageTitle: batch.page_title,
    summary: {
      title: batch.summary_title,
      subtitle: batch.summary_subtitle,
      description: batch.summary_description,
      batchId: batch.batch_id,
    },
    ctas: batch.ctas,
    heroStats: batch.hero_stats,
    modules: modules.data,
    sections: {
      batchControl: {
        title: "Batch Control Center",
        tag: "Unique Batch ID:",
        columns: ["Attribute", "Details"],
        details: details.data,
      },
      stock: {
        title: stock.data.title,
        tag: stock.data.tag,
        stats: stock.data.stats,
        conversion: stock.data.conversion,
      },
      timeline: {
        title: "Process Timeline",
        tag: "Full Audit Trail",
        entries: timeline.data,
      },
      story: {
        pill: story.data.pill,
        title: story.data.title,
        overview: story.data.overview,
        metrics: story.data.metrics,
        highlightsTitle: story.data.highlights_title,
        highlights: story.data.highlights,
      },
      quality: {
        title: "Quality Control Checkpoints",
        columns: ["Stage", "Status", "Defects Logged", "Corrective Action"],
        checkpoints: quality.data,
      },
      photos: {
        title: "Photo Attachments",
        tag: "Tagged & Timestamped",
        items: photos.data,
      },
      vendors: {
        title: "Vendor & Job Orders",
        columns: ["Vendor", "Job Work", "Rate", "Due Date", "Payment Status"],
        items: vendors.data.map((v) => ({
          vendor: v.vendor,
          work: v.work,
          rate: v.rate,
          due: v.due_date,
          payment: v.payment_status,
        })),
      },
    },
    footer: batch.footer,
  };
}
