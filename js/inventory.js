import { fetchFullLineage } from "./api.js";
import { $, formatDate, formatMeters, formatCurrency } from "./utils.js";

async function init() {
  const { rawMaterials, processDispatches, receivedEntries } = await fetchFullLineage();

  renderSummary(rawMaterials, processDispatches, receivedEntries);
  renderBreakdown(rawMaterials);
  renderRawStock(rawMaterials);
  renderPendingDispatches(processDispatches);
  renderFinishedGoods(receivedEntries);
}

function renderSummary(rm, pd, re) {
  const container = $("#inv-summary");
  const availableMeters = rm.reduce((s, r) => s + parseFloat(r.remaining_meters), 0);
  const inProcessing = pd
    .filter((d) => d.status === "dispatched")
    .reduce((s, d) => s + parseFloat(d.length_sent), 0);
  const totalPieces = re
    .filter((r) => r.output_type === "pieces")
    .reduce((s, r) => s + parseFloat(r.output_quantity), 0);
  const totalProcessedLength = re
    .filter((r) => r.output_type === "length")
    .reduce((s, r) => s + parseFloat(r.output_quantity), 0);

  container.innerHTML = `
    <div class="card">
      <div class="stat"><span>Available Raw Material</span><strong>${formatMeters(availableMeters)}</strong></div>
    </div>
    <div class="card">
      <div class="stat"><span>In Processing</span><strong>${formatMeters(inProcessing)}</strong></div>
    </div>
    <div class="card">
      <div class="stat"><span>Finished Goods</span><strong>${Math.floor(totalPieces)} pieces</strong></div>
      ${totalProcessedLength > 0 ? `<p style="margin-top:8px;">${formatMeters(totalProcessedLength)} processed fabric</p>` : ""}
    </div>
  `;
}

function renderBreakdown(rm) {
  // By material
  const byMaterial = {};
  rm.forEach((r) => {
    const key = r.material_type;
    byMaterial[key] = (byMaterial[key] || 0) + parseFloat(r.remaining_meters);
  });
  const materialList = $("#breakdown-material");
  const materialEntries = Object.entries(byMaterial).sort((a, b) => b[1] - a[1]);
  if (materialEntries.length === 0) {
    materialList.innerHTML = '<li class="breakdown-item" style="color:var(--ash);">No raw materials yet</li>';
  } else {
    materialList.innerHTML = materialEntries
      .map(([type, meters]) => `<li class="breakdown-item"><span>${type}</span><strong>${formatMeters(meters)}</strong></li>`)
      .join("");
  }

  // By color
  const byColor = {};
  rm.forEach((r) => {
    const key = r.color;
    byColor[key] = (byColor[key] || 0) + parseFloat(r.remaining_meters);
  });
  const colorList = $("#breakdown-color");
  const colorEntries = Object.entries(byColor).sort((a, b) => b[1] - a[1]);
  if (colorEntries.length === 0) {
    colorList.innerHTML = '<li class="breakdown-item" style="color:var(--ash);">No raw materials yet</li>';
  } else {
    colorList.innerHTML = colorEntries
      .map(([color, meters]) => `<li class="breakdown-item"><span>${color}</span><strong>${formatMeters(meters)}</strong></li>`)
      .join("");
  }
}

function renderRawStock(rm) {
  const body = $("#rm-stock-body");
  const countEl = $("#rm-stock-count");
  const withStock = rm.filter((r) => parseFloat(r.remaining_meters) > 0);
  countEl.textContent = `${withStock.length} batches with stock`;

  if (withStock.length === 0) {
    body.innerHTML = '<tr><td colspan="8" class="empty-state"><h3>No stock available</h3></td></tr>';
    return;
  }

  body.innerHTML = withStock
    .map((r) => {
      const pct = Math.round((parseFloat(r.remaining_meters) / parseFloat(r.length_meters)) * 100);
      return `<tr>
        <td><span class="batch-pill rm">${r.batch_number}</span></td>
        <td>${r.material_type}</td>
        <td>${r.color}</td>
        <td>${r.vendor_name}</td>
        <td>${formatMeters(r.length_meters)}</td>
        <td>${formatMeters(r.remaining_meters)}</td>
        <td>${formatCurrency(r.cost)}</td>
        <td style="min-width:80px;">
          <div class="stock-bar"><div class="stock-bar-fill" style="width:${pct}%"></div></div>
          <span style="font-size:0.75rem;color:var(--ash);">${pct}%</span>
        </td>
      </tr>`;
    })
    .join("");
}

function renderPendingDispatches(pd) {
  const body = $("#pending-body");
  const countEl = $("#pending-count");
  const pending = pd.filter((d) => d.status === "dispatched");
  countEl.textContent = `${pending.length} pending`;

  if (pending.length === 0) {
    body.innerHTML = '<tr><td colspan="6" class="empty-state"><h3>No pending dispatches</h3></td></tr>';
    return;
  }

  body.innerHTML = pending
    .map(
      (d) => `<tr>
      <td><span class="batch-pill pd">${d.batch_number}</span></td>
      <td><span class="batch-pill rm">${d.parent_batch_number}</span></td>
      <td>${d.vendor_name}</td>
      <td>${d.purpose}</td>
      <td>${formatMeters(d.length_sent)}</td>
      <td>${formatDate(d.dispatch_date)}</td>
    </tr>`
    )
    .join("");
}

function renderFinishedGoods(re) {
  const body = $("#finished-body");
  const countEl = $("#finished-count");
  countEl.textContent = `${re.length} entries`;

  if (re.length === 0) {
    body.innerHTML = '<tr><td colspan="6" class="empty-state"><h3>No finished goods yet</h3></td></tr>';
    return;
  }

  body.innerHTML = re
    .map(
      (r) => `<tr>
      <td><span class="batch-pill re">${r.batch_number}</span></td>
      <td>${r.description}</td>
      <td>${r.output_quantity}</td>
      <td>${r.output_unit}</td>
      <td><span class="batch-pill pd">${r.parent_batch_number}</span></td>
      <td>${formatDate(r.received_date)}</td>
    </tr>`
    )
    .join("");
}

init();
