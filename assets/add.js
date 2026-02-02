import { supabase } from "../data/supabase.js";

// --- Repeatable row helpers ---

const getTemplate = (container) => {
  const first = container.querySelector(".repeatable-row");
  return first.cloneNode(true);
};

document.addEventListener("click", (e) => {
  // Add row
  if (e.target.closest(".add-row-btn")) {
    const btn = e.target.closest(".add-row-btn");
    const container = document.getElementById(btn.dataset.target);
    const template = getTemplate(container);
    template.querySelectorAll("input, textarea, select").forEach((el) => (el.value = ""));
    // Reset nested repeatable lists to a single input
    template.querySelectorAll(".tl-points, .photo-metas").forEach((wrap) => {
      const first = wrap.querySelector("input").cloneNode(true);
      first.value = "";
      wrap.innerHTML = "";
      wrap.append(first);
    });
    container.append(template);
    return;
  }

  // Remove row
  if (e.target.closest(".remove-row-btn")) {
    const row = e.target.closest(".repeatable-row");
    if (row.parentElement.children.length > 1) {
      row.remove();
    }
    return;
  }

  // Add timeline point
  if (e.target.closest(".add-point-btn")) {
    const wrap = e.target.closest(".tl-points-wrap").querySelector(".tl-points");
    const input = document.createElement("input");
    input.type = "text";
    input.placeholder = "Point";
    input.className = "tl-point";
    wrap.append(input);
    return;
  }

  // Add photo meta
  if (e.target.closest(".add-meta-btn")) {
    const wrap = e.target.closest(".photo-meta-wrap").querySelector(".photo-metas");
    const input = document.createElement("input");
    input.type = "text";
    input.placeholder = "Meta line";
    input.className = "photo-meta";
    wrap.append(input);
    return;
  }
});

// --- Collect values from repeatable rows ---

const collectRows = (containerId, mapper) => {
  const rows = document.querySelectorAll(`#${containerId} .repeatable-row`);
  const result = [];
  rows.forEach((row, i) => {
    const data = mapper(row, i);
    if (data) result.push(data);
  });
  return result;
};

const val = (id) => document.getElementById(id)?.value.trim() ?? "";

// --- Form submit ---

document.getElementById("batch-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const status = document.getElementById("form-status");
  const submitBtn = e.target.querySelector('button[type="submit"]');
  submitBtn.disabled = true;
  status.textContent = "Submitting...";
  status.className = "";

  try {
    // 1. Build hero stats JSONB
    const heroStats = collectRows("hero-stats-rows", (row) => {
      const label = row.querySelector(".hero-stat-label").value.trim();
      const value = row.querySelector(".hero-stat-value").value.trim();
      return label ? { label, value } : null;
    });

    // 2. Build CTAs JSONB
    const ctas = {
      primary: { label: val("cta_primary_label"), href: val("cta_primary_href") },
      secondary: { label: val("cta_secondary_label"), href: val("cta_secondary_href") },
    };

    // 3. Insert batch
    const { data: batch, error: batchErr } = await supabase
      .from("batches")
      .insert({
        batch_id: val("batch_id"),
        page_title: val("page_title"),
        summary_title: val("summary_title"),
        summary_subtitle: val("summary_subtitle"),
        summary_description: val("summary_description"),
        footer: val("footer"),
        ctas,
        hero_stats: heroStats,
      })
      .select()
      .single();

    if (batchErr) throw batchErr;
    const batchUuid = batch.id;

    // 4. Insert child tables in parallel
    const inserts = [];

    // Modules
    const modules = collectRows("modules-rows", (row, i) => {
      const title = row.querySelector(".module-title").value.trim();
      const description = row.querySelector(".module-desc").value.trim();
      return title ? { batch_id: batchUuid, title, description, sort_order: i } : null;
    });
    if (modules.length) inserts.push(supabase.from("modules").insert(modules));

    // Batch details
    const details = collectRows("details-rows", (row, i) => {
      const label = row.querySelector(".detail-label").value.trim();
      const value = row.querySelector(".detail-value").value.trim();
      return label ? { batch_id: batchUuid, label, value, sort_order: i } : null;
    });
    if (details.length) inserts.push(supabase.from("batch_details").insert(details));

    // Stock
    const stockStats = collectRows("stock-stats-rows", (row) => {
      const label = row.querySelector(".stock-stat-label").value.trim();
      const value = row.querySelector(".stock-stat-value").value.trim();
      return label ? { label, value } : null;
    });
    const convDetails = collectRows("conv-details-rows", (row) => {
      const text = row.querySelector(".conv-detail").value.trim();
      return text || null;
    });
    if (val("stock_title")) {
      inserts.push(
        supabase.from("stock").insert({
          batch_id: batchUuid,
          title: val("stock_title"),
          tag: val("stock_tag"),
          stats: stockStats,
          conversion: {
            title: val("conv_title"),
            summary: val("conv_summary"),
            details: convDetails,
          },
        })
      );
    }

    // Timeline
    const timeline = collectRows("timeline-rows", (row, i) => {
      const code = row.querySelector(".tl-code").value.trim();
      const title = row.querySelector(".tl-title").value.trim();
      if (!code) return null;
      const tone = row.querySelector(".tl-tone").value;
      const points = Array.from(row.querySelectorAll(".tl-point"))
        .map((el) => el.value.trim())
        .filter(Boolean);
      return { batch_id: batchUuid, code, tone, title, points, sort_order: i };
    });
    if (timeline.length) inserts.push(supabase.from("timeline_entries").insert(timeline));

    // Story
    const storyMetrics = collectRows("story-metrics-rows", (row) => {
      const tag = row.querySelector(".sm-tag").value.trim();
      const value = row.querySelector(".sm-value").value.trim();
      const caption = row.querySelector(".sm-caption").value.trim();
      return tag ? { tag, value, caption } : null;
    });
    const highlights = collectRows("highlights-rows", (row) => {
      const text = row.querySelector(".highlight-text").value.trim();
      return text || null;
    });
    if (val("story_title")) {
      inserts.push(
        supabase.from("story").insert({
          batch_id: batchUuid,
          pill: val("story_pill"),
          title: val("story_title"),
          overview: val("story_overview"),
          metrics: storyMetrics,
          highlights_title: val("highlights_title"),
          highlights,
        })
      );
    }

    // Quality checkpoints
    const qc = collectRows("qc-rows", (row, i) => {
      const stage = row.querySelector(".qc-stage").value.trim();
      if (!stage) return null;
      return {
        batch_id: batchUuid,
        stage,
        status: row.querySelector(".qc-status").value.trim(),
        defects: row.querySelector(".qc-defects").value.trim(),
        action: row.querySelector(".qc-action").value.trim(),
        sort_order: i,
      };
    });
    if (qc.length) inserts.push(supabase.from("quality_checkpoints").insert(qc));

    // Photos
    const photos = collectRows("photo-rows", (row, i) => {
      const title = row.querySelector(".photo-title").value.trim();
      if (!title) return null;
      const meta = Array.from(row.querySelectorAll(".photo-meta"))
        .map((el) => el.value.trim())
        .filter(Boolean);
      return {
        batch_id: batchUuid,
        title,
        caption: row.querySelector(".photo-caption").value.trim(),
        meta,
        sort_order: i,
      };
    });
    if (photos.length) inserts.push(supabase.from("photos").insert(photos));

    // Vendors
    const vendors = collectRows("vendor-rows", (row, i) => {
      const vendor = row.querySelector(".v-vendor").value.trim();
      if (!vendor) return null;
      return {
        batch_id: batchUuid,
        vendor,
        work: row.querySelector(".v-work").value.trim(),
        rate: row.querySelector(".v-rate").value.trim(),
        due_date: row.querySelector(".v-due").value.trim(),
        payment_status: row.querySelector(".v-payment").value.trim(),
        sort_order: i,
      };
    });
    if (vendors.length) inserts.push(supabase.from("vendors").insert(vendors));

    // Run all child inserts
    const results = await Promise.all(inserts);
    const failed = results.find((r) => r.error);
    if (failed) throw failed.error;

    status.textContent = `Batch ${val("batch_id")} created successfully!`;
    status.className = "status-success";
  } catch (err) {
    console.error("Submit failed:", err);
    status.textContent = `Error: ${err.message}`;
    status.className = "status-error";
  } finally {
    submitBtn.disabled = false;
  }
});
