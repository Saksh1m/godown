import { fetchFullLineage, deleteRawMaterial, deleteProcessDispatch, deleteReceivedEntry, updateRawMaterialItemRemaining, updateDispatchStatus } from "./api.js";
import { $, formatDate, formatCurrency } from "./utils.js";

const DELETE_PASSWORD = "dataentry";
let cache;

function formatQuantity(quantity, unitType) {
  return `${parseFloat(quantity).toLocaleString("en-IN")} ${unitType === "units" ? "units" : "m"}`;
}

async function init() {
  cache = await fetchFullLineage();

  renderSummary(cache.rawMaterials, cache.processDispatches, cache.receivedEntries);
  renderBreakdown(cache.rawMaterials);
  renderRawStock(cache.rawMaterials);
  renderPendingDispatches(cache.processDispatches);
  renderFinishedGoods(cache.receivedEntries);
}

function renderSummary(rm, pd, re) {
  const container = $("#inv-summary");
  const meterStock = rm
    .flatMap((r) => r.material_items || [])
    .filter((i) => i.unit_type === "meters")
    .reduce((s, i) => s + parseFloat(i.remaining_quantity), 0);
  const unitStock = rm
    .flatMap((r) => r.material_items || [])
    .filter((i) => i.unit_type === "units")
    .reduce((s, i) => s + parseFloat(i.remaining_quantity), 0);

  const inProcessing = pd.filter((d) => d.status === "dispatched").length;
  const totalFinished = re.length;

  container.innerHTML = `
    <div class="card">
      <div class="stat"><span>Available Raw Material</span><strong>${meterStock.toLocaleString("en-IN")} m</strong></div>
      <p style="margin-top:8px;">${unitStock.toLocaleString("en-IN")} units also in stock</p>
    </div>
    <div class="card">
      <div class="stat"><span>In Processing</span><strong>${inProcessing}</strong></div>
    </div>
    <div class="card">
      <div class="stat"><span>Finished Goods Entries</span><strong>${totalFinished}</strong></div>
      ${totalProcessedLength > 0 ? `<p style="margin-top:8px;">${formatMeters(totalProcessedLength)} processed fabric</p>` : ""}
    </div>
  `;
}

function renderBreakdown(rm) {
  // By material
  const byMaterial = {};
  rm.forEach((r) => {
    (r.material_items || []).forEach((item) => {
      const key = item.material_type;
      const suffix = item.unit_type === "units" ? " units" : " m";
      byMaterial[key] = byMaterial[key] || { meters: 0, units: 0 };
      byMaterial[key][item.unit_type] += parseFloat(item.remaining_quantity);
      byMaterial[key].suffix = suffix;
    });
  });
  const materialList = $("#breakdown-material");
  const entries = Object.entries(byMaterial);
  materialList.innerHTML = entries.length
    ? entries
        .map(([type, q]) => `<li class="breakdown-item"><span>${type}</span><strong>${q.meters.toLocaleString("en-IN")} m / ${q.units.toLocaleString("en-IN")} units</strong></li>`)
        .join("")
    : '<li class="breakdown-item" style="color:var(--ash);">No raw materials yet</li>';

  // By color
  const byColor = {};
  rm.forEach((r) => {
    const meters = (r.material_items || [])
      .filter((i) => i.unit_type === "meters")
      .reduce((s, i) => s + parseFloat(i.remaining_quantity), 0);
    byColor[r.color] = (byColor[r.color] || 0) + meters;
  });
  const colorList = $("#breakdown-color");
  const colorEntries = Object.entries(byColor).sort((a, b) => b[1] - a[1]);
  colorList.innerHTML = colorEntries.length
    ? colorEntries.map(([color, meters]) => `<li class="breakdown-item"><span>${color}</span><strong>${meters.toLocaleString("en-IN")} m</strong></li>`).join("")
    : '<li class="breakdown-item" style="color:var(--ash);">No raw materials yet</li>';
}

function renderRawStock(rm) {
  const body = $("#rm-stock-body");
  const countEl = $("#rm-stock-count");
    const rows = rm.flatMap((r) => (r.material_items || []).map((item) => ({ ...item, raw: r }))).filter((entry) => parseFloat(entry.remaining_quantity) > 0);

  countEl.textContent = `${rows.length} material rows with stock`;
  if (!rows.length) {
    body.innerHTML = '<tr><td colspan="9" class="empty-state"><h3>No stock available</h3></td></tr>';
    return;
  }

  body.innerHTML = rows
    .map((entry) => {
      const pct = Math.round((parseFloat(entry.remaining_quantity) / parseFloat(entry.quantity)) * 100);
      return `<tr>
        <td><span class="batch-pill rm">${entry.raw.batch_number}</span></td>
        <td>${entry.material_type}</td>
        <td>${entry.raw.color}</td>
        <td>${entry.raw.vendor_name}</td>
        <td>${formatQuantity(entry.quantity, entry.unit_type)}</td>
        <td>${formatQuantity(entry.remaining_quantity, entry.unit_type)}</td>
        <td>${formatCurrency(entry.raw.rate)}</td>
        <td style="min-width:80px;">
          <div class="stock-bar"><div class="stock-bar-fill" style="width:${pct}%"></div></div>
          <span style="font-size:0.75rem;color:var(--ash);">${pct}%</span>
        </td>
        <td><button class="button secondary delete-btn" data-type="raw" data-id="${entry.raw.id}">Delete</button></td>
      </tr>`;
    })
    .join("");
}

function renderPendingDispatches(pd) {
  const body = $("#pending-body");
  const countEl = $("#pending-count");
  const pending = pd.filter((d) => d.status === "dispatched");
  countEl.textContent = `${pending.length} pending`;

  if (!pending.length) {
    body.innerHTML = '<tr><td colspan="8" class="empty-state"><h3>No pending dispatches</h3></td></tr>';
    return;
  }

  body.innerHTML = pending
    .map(
      (d) => `<tr>
      <td><span class="batch-pill pd">${d.batch_number}</span></td>
      <td><span class="batch-pill rm">${d.parent_batch_number}</span></td>
      <td>${d.material_type}</td>
      <td>${d.vendor_name}</td>
      <td>${d.purpose}</td>
      <td>${formatQuantity(d.quantity_sent, d.unit_type)}</td>
      <td>${formatDate(d.dispatch_date)}</td>
      <td><button class="button secondary delete-btn" data-type="dispatch" data-id="${d.id}">Delete</button></td>
    </tr>`
    )
    .join("");
}

function renderFinishedGoods(re) {
  const body = $("#finished-body");
  const countEl = $("#finished-count");
  countEl.textContent = `${re.length} entries`;

  if (!re.length) {
    body.innerHTML = '<tr><td colspan="6" class="empty-state"><h3>No finished goods yet</h3></td></tr>';
    return;
  }

  body.innerHTML = re
    .map(
      (r) => `<tr>
      <td><span class="batch-pill re">${r.batch_number}</span></td>
      <td>${r.description}</td>
      <td>${r.output_quantity} ${r.output_unit}</td>
      <td><span class="batch-pill pd">${r.parent_batch_number}</span></td>
      <td>${formatDate(r.received_date)}</td>
      <td><button class="button secondary delete-btn" data-type="received" data-id="${r.id}">Delete</button></td>
    </tr>`
    )
    .join("");
}
function checkPassword() {
  const entered = window.prompt("Enter delete password");
  if (entered !== DELETE_PASSWORD) {
    window.alert("Invalid password.");
    return false;
  }
  return true;
}

async function handleDelete(type, id) {
  if (!checkPassword()) return;

  if (type === "raw") {
    await deleteRawMaterial(id);
  }

  if (type === "dispatch") {
    const dispatch = cache.processDispatches.find((d) => d.id === id);
    if (dispatch?.raw_material_item_id) {
      const item = cache.rawMaterialItems.find((i) => i.id === dispatch.raw_material_item_id);
      if (item) {
        await updateRawMaterialItemRemaining(item.id, parseFloat(item.remaining_quantity) + parseFloat(dispatch.quantity_sent));
      }
    }
    await deleteProcessDispatch(id);
  }

  if (type === "received") {
    const entry = cache.receivedEntries.find((r) => r.id === id);
    await deleteReceivedEntry(id);
    if (entry?.process_dispatch_id) {
      await updateDispatchStatus(entry.process_dispatch_id, "dispatched");
    }
  }

  await init();
}

document.addEventListener("click", (e) => {
  const btn = e.target.closest(".delete-btn");
  if (!btn) return;
  handleDelete(btn.dataset.type, btn.dataset.id);
});

init();
