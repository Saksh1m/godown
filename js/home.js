import { fetchFullLineage } from "./api.js";
import { $, formatDate, formatCurrency } from "./utils.js";

function formatQuantity(quantity, unitType) {
  return `${parseFloat(quantity).toLocaleString("en-IN")} ${unitType === "units" ? "units" : "m"}`;
}

async function init() {
  const { rawMaterials, processDispatches, receivedEntries } = await fetchFullLineage();

  renderHeroStats(rawMaterials, processDispatches, receivedEntries);
  renderSummaryCards(rawMaterials, processDispatches, receivedEntries);
  renderProductionHistory(rawMaterials, processDispatches, receivedEntries);
  renderLineage(rawMaterials, processDispatches, receivedEntries);
}

function renderHeroStats(rm, pd, re) {
  const container = $("#hero-stats");
  const totalMeters = rm.flatMap((r) => r.material_items || []).filter((i) => i.unit_type === "meters").reduce((s, i) => s + parseFloat(i.quantity), 0);
  const activeDispatches = pd.filter((d) => d.status === "dispatched").length;
  const totalPieces = re.filter((r) => r.output_type === "pieces").reduce((s, r) => s + parseFloat(r.output_quantity), 0);

  container.innerHTML = `
    <div class="stat"><span>Total Raw Material</span><strong>${totalMeters.toLocaleString("en-IN")} m</strong></div>
    <div class="stat" style="margin-top:16px;"><span>Active Dispatches</span><strong>${activeDispatches}</strong></div>
    <div class="stat" style="margin-top:16px;"><span>Finished Pieces</span><strong>${Math.floor(totalPieces)}</strong></div>
  `;
}

function renderSummaryCards(rm, pd, re) {
  const container = $("#summary-cards");
  const totalRawRate = rm.reduce((s, r) => s + parseFloat(r.rate), 0);
  const remainingMeters = rm.flatMap((r) => r.material_items || []).filter((i) => i.unit_type === "meters").reduce((s, i) => s + parseFloat(i.remaining_quantity), 0);
  const completedDispatches = pd.filter((d) => d.status === "received").length;

  container.innerHTML = `
    <div class="card">
      <div class="stat"><span>Raw Material Batches</span><strong>${rm.length}</strong></div>
       <p style="margin-top:8px;">${remainingMeters.toLocaleString("en-IN")} m available &middot; ${formatCurrency(totalRawRate)} rate value</p>
    </div>
    <div class="card">
      <div class="stat"><span>Process Dispatches</span><strong>${pd.length}</strong></div>
      <p style="margin-top:8px;">${pd.filter((d) => d.status === "dispatched").length} active &middot; ${completedDispatches} completed</p>
    </div>
    <div class="card">
      <div class="stat"><span>Received Entries</span><strong>${re.length}</strong></div>
      <p style="margin-top:8px;">${re.filter((r) => r.output_type === "pieces").length} piece batches &middot; ${re.filter((r) => r.output_type === "length").length} length batches</p>
    </div>
  `;
}

function renderProductionHistory(rm, pd, re) {
  const body = $("#history-body");
  const countEl = $("#history-count");

  const allBatches = [
    ...rm.map((r) => ({
      batch: r.batch_number,
      type: "Raw Material",
      typeClass: "rm",
      date: r.entry_date,
      details: `${r.color} &middot; ${(r.material_items || []).map((i) => `${i.material_type} (${formatQuantity(i.quantity, i.unit_type)})`).join(", ")} &middot; ${r.vendor_name}`,
      parent: "—",
      status: `${(r.material_items || []).length} material types`,
    })),
    ...pd.map((p) => ({
      batch: p.batch_number,
      type: "Dispatch",
      typeClass: "pd",
      date: p.dispatch_date,
      details: `${p.dispatch_type && p.dispatch_type !== "legacy" ? p.dispatch_type.toUpperCase() + " | " : ""}${p.material_type} &middot; ${formatQuantity(p.quantity_sent, p.unit_type)} &middot; ${p.vendor_name}${p.design_number ? " [" + p.design_number + "]" : ""}`,
      parent: p.parent_batch_number,
      status: p.status,
      statusClass: p.status,
    })),
    ...re.map((r) => ({
      batch: r.batch_number,
      type: "Received",
      typeClass: "re",
      date: r.received_date,
      details: `${r.description} &middot; ${r.output_quantity} ${r.output_unit}`,
      parent: r.parent_batch_number,
      status: "completed",
      statusClass: "received",
    })),
  ].sort((a, b) => new Date(b.date) - new Date(a.date));

  countEl.textContent = `${allBatches.length} entries`;

  if (allBatches.length === 0) {
    body.innerHTML = '<tr><td colspan="6" class="empty-state"><h3>No entries yet</h3><p>Start by adding a raw material entry.</p></td></tr>';
    return;
  }

  body.innerHTML = allBatches
    .map(
      (b) => `
    <tr>
      <td><span class="batch-pill ${b.typeClass}">${b.batch}</span></td>
      <td>${b.type}</td>
      <td>${formatDate(b.date)}</td>
      <td>${b.details}</td>
      <td>${b.parent !== "—" ? `<span class="batch-pill ${b.parent.startsWith("PT-RM") ? "rm" : "pd"}">${b.parent}</span>` : "—"}</td>
      <td>${b.statusClass ? `<span class="status-badge ${b.statusClass}">${b.status}</span>` : b.status}</td>
    </tr>
  `
    )
    .join("");
}

function renderLineage(rm, pd, re) {
  const container = $("#lineage-container");

  if (rm.length === 0) {
    container.innerHTML = '<div class="empty-state"><h3>No batches yet</h3><p>Add raw materials to see batch lineage.</p></div>';
    return;
  }

  const lineageHtml = rm
    .map((raw) => {
      const dispatches = pd.filter((d) => d.raw_material_id === raw.id);
      const dispatchHtml = dispatches
        .map((d) => {
          const received = re.filter((r) => r.process_dispatch_id === d.id);
          const receivedHtml = received
            .map(
              (r) =>
                `<div class="lineage-grandchild">
              <span class="batch-pill re">${r.batch_number}</span>
              ${r.description} &middot; ${r.output_quantity} ${r.output_unit} &middot; ${formatDate(r.received_date)}
            </div>`
            )
            .join("");

          return `<div class="lineage-child">
            <span class="batch-pill pd">${d.batch_number}</span>
            ${d.material_type} (${formatQuantity(d.quantity_sent, d.unit_type)}) to ${d.vendor_name} for ${d.dispatch_type && d.dispatch_type !== "legacy" ? d.dispatch_type : d.purpose}
            <span class="status-badge ${d.status}">${d.status}</span>
            ${receivedHtml}
          </div>`;
        })
        .join("");

      return `<div class="lineage-group">
        <h4><span class="batch-pill rm">${raw.batch_number}</span> ${raw.color} &middot; ${(raw.material_items || []).map((i) => `${i.material_type} (${formatQuantity(i.quantity, i.unit_type)})`).join(", ")} from ${raw.vendor_name}</h4>
        ${dispatches.length > 0 ? `<div class="lineage-children">${dispatchHtml}</div>` : '<p style="color:var(--ash);margin-top:8px;">No dispatches yet</p>'}
      </div>`;
    })
    .join("");

  container.innerHTML = lineageHtml;
}

init();
