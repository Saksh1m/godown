import * as api from "./api.js";
import { $, $$, showStatus, clearStatus, formatCurrency } from "./utils.js";

let cachedRawMaterials = [];

function formatQuantity(quantity, unitType) {
  return `${parseFloat(quantity).toLocaleString("en-IN")} ${unitType === "units" ? "units" : "m"}`;
}

// === Tab Switching ===
function initTabs() {
  $$(".tab-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      $$(".tab-btn").forEach((b) => b.classList.remove("active"));
      $$(".tab-panel").forEach((p) => p.classList.remove("active"));
      btn.classList.add("active");
      $(`.tab-panel[data-tab="${btn.dataset.tab}"]`).classList.add("active");

      if (btn.dataset.tab === "process-dispatch") loadRawMaterialOptions();
      if (btn.dataset.tab === "received-entry") loadDispatchOptions();
    });
  });
}

// === Populate Dropdowns ===
function createMaterialRow() {
  const row = document.createElement("div");
  row.className = "material-row";
  row.innerHTML = `
    <input type="text" class="rm-material-type" required placeholder="Material type (e.g. Mulmul)" />
    <select class="rm-input-mode" required>
      <option value="meters">Metres</option>
      <option value="units">Pieces (units)</option>
    </select>
    <input type="number" class="rm-quantity" step="0.01" min="0.01" required placeholder="Quantity" />
    <button type="button" class="button secondary rm-remove-row">Remove</button>
  `;

  row.querySelector(".rm-remove-row").addEventListener("click", () => {
    if ($$(".material-row").length > 1) row.remove();
  });

  return row;
}

function initMaterialRows() {
  const container = $("#rm-material-rows");
  const addBtn = $("#add-material-row");
  if (!container || !addBtn) return;

  const ensureFirstRow = () => {
    if (container.querySelectorAll(".material-row").length === 0) {
      container.appendChild(createMaterialRow());
    }
  };

  ensureFirstRow();

  addBtn.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    container.appendChild(createMaterialRow());
  });
}

async function loadRawMaterialOptions() {
  const { data } = await api.fetchAvailableRawMaterials();
  cachedRawMaterials = data || [];

  const select = $("#rm-select");
  select.innerHTML = '<option value="">Select a raw material batch...</option>';
  if (cachedRawMaterials.length === 0) {
    select.innerHTML = '<option value="">No raw materials available</option>';
    $("#rm-material-item").innerHTML = '<option value="">No materials available</option>';
    return;
  }
  cachedRawMaterials.forEach((rm) => {
    const opt = document.createElement("option");
    opt.value = rm.id;
    opt.textContent = `${rm.batch_number} — ${rm.color} (${rm.material_items.length} material type${rm.material_items.length > 1 ? "s" : ""})`;
    select.append(opt);
  });
}

function loadMaterialItemOptions(rawMaterialId) {
  const select = $("#rm-material-item");
  const rm = cachedRawMaterials.find((x) => x.id === rawMaterialId);

  select.innerHTML = '<option value="">Select material type...</option>';
  if (!rm) return;

  rm.material_items.forEach((item) => {
    const opt = document.createElement("option");
    opt.value = item.id;
    opt.dataset.json = JSON.stringify({ ...item, batch_number: rm.batch_number, rate: rm.rate, vendor_name: rm.vendor_name, color: rm.color });
    opt.textContent = `${item.material_type} — ${formatQuantity(item.remaining_quantity, item.unit_type)} available`;
    select.append(opt);
  });
}

async function loadDispatchOptions() {
  const { data } = await api.fetchPendingDispatches();
  const select = $("#pd-select");
  select.innerHTML = '<option value="">Select a dispatch batch...</option>';
  if (!data || data.length === 0) {
    select.innerHTML = '<option value="">No pending dispatches</option>';
    return;
  }
  data.forEach((pd) => {
    const opt = document.createElement("option");
    opt.value = pd.id;
    opt.textContent = `${pd.batch_number} — ${pd.material_type} (${formatQuantity(pd.quantity_sent, pd.unit_type)}) to ${pd.vendor_name}`;
    opt.dataset.json = JSON.stringify(pd);
    select.append(opt);
  });
}

// === Detail Preview Cards ===
function showRmDetail(item) {
  const card = $("#rm-detail-card");
  card.style.display = "grid";
  card.innerHTML = `
    <div class="stat"><span>Batch</span><strong>${item.batch_number}</strong></div>
    <div class="stat"><span>Material</span><strong>${item.color} ${item.material_type}</strong></div>
    <div class="stat"><span>Available</span><strong>${formatQuantity(item.remaining_quantity, item.unit_type)}</strong></div>
    <div class="stat"><span>Total</span><strong>${formatQuantity(item.quantity, item.unit_type)}</strong></div>
    <div class="stat"><span>Rate</span><strong>${formatCurrency(item.rate)}</strong></div>
    <div class="stat"><span>Vendor</span><strong>${item.vendor_name}</strong></div>
  `;
  $("#pd-quantity-label").textContent = `Quantity to Send (${item.unit_type === "units" ? "units" : "metres"})`;
}

function showPdDetail(pd) {
  const card = $("#pd-detail-card");
  card.style.display = "grid";
  card.innerHTML = `
    <div class="stat"><span>Batch</span><strong>${pd.batch_number}</strong></div>
    <div class="stat"><span>From</span><strong>${pd.parent_batch_number}</strong></div>
    <div class="stat"><span>Material</span><strong>${pd.material_type}</strong></div>
    <div class="stat"><span>Vendor</span><strong>${pd.vendor_name}</strong></div>
    <div class="stat"><span>Purpose</span><strong>${pd.purpose}</strong></div>
    <div class="stat"><span>Sent</span><strong>${formatQuantity(pd.quantity_sent, pd.unit_type)}</strong></div>
  `;
}

// === Form Handlers ===
async function handleRawMaterialSubmit(e) {
  e.preventDefault();
  const status = $("#rm-status");
  const btn = e.target.querySelector('button[type="submit"]');
  btn.disabled = true;
  clearStatus(status);

  try {
    const materialRows = Array.from($$(".material-row"));
    const materials = materialRows.map((row) => ({
      material_type: row.querySelector(".rm-material-type").value.trim(),
      unit_type: row.querySelector(".rm-input-mode").value,
      quantity: parseFloat(row.querySelector(".rm-quantity").value),
    }));

    if (materials.some((m) => !m.material_type || Number.isNaN(m.quantity) || m.quantity <= 0)) {
      throw new Error("Please fill all material rows correctly.");
    }

    const { data: batchNumber, error: batchErr } = await api.getNextBatchNumber("PT-RM");
    if (batchErr) throw batchErr;

    const { data: rawMaterial,error } = await api.insertRawMaterial({
      batch_number: batchNumber,
      entry_date: $("#rm-date").value,
      rate: parseFloat($("#rm-rate").value),
      color: $("#rm-color").value,
      vendor_name: $("#rm-vendor").value,
      notes: $("#rm-notes").value || null,
    });

    if (error) throw error;
    const payload = materials.map((m) => ({
      raw_material_id: rawMaterial.id,
      material_type: m.material_type,
      unit_type: m.unit_type,
      quantity: m.quantity,
      remaining_quantity: m.quantity,
    }));

    const { error: itemsErr } = await api.insertRawMaterialItems(payload);
    if (itemsErr) throw itemsErr;

    showStatus(status, `Recorded as ${batchNumber}`, "success");
    e.target.reset();
    $("#rm-date").valueAsDate = new Date();
    $("#rm-material-rows").innerHTML = "";
    $("#rm-material-rows").appendChild(createMaterialRow());
  } catch (err) {
    showStatus(status, `Error: ${err.message}`, "error");
  } finally {
    btn.disabled = false;
  }
}

async function handleDispatchSubmit(e) {
  e.preventDefault();
  const status = $("#pd-status");
  const btn = e.target.querySelector('button[type="submit"]');
  btn.disabled = true;
  clearStatus(status);

  try {
    const selectedOption = $("#rm-material-item").selectedOptions[0];
    if (!selectedOption?.dataset?.json) throw new Error("Please select a material type");
    const item = JSON.parse(selectedOption.dataset.json);
    const qtySent = parseFloat($("#pd-quantity").value);

    if (qtySent > parseFloat(item.remaining_quantity)) {
      throw new Error(`Cannot send ${qtySent}. Only ${item.remaining_quantity} available.`);
    }

    const { data: batchNumber, error: batchErr } = await api.getNextBatchNumber("PT-PD");
    if (batchErr) throw batchErr;

    const { error: insertErr } = await api.insertProcessDispatch({
      batch_number: batchNumber,
      raw_material_id: item.raw_material_id,
      raw_material_item_id: item.id,
      parent_batch_number: item.batch_number,
      dispatch_date: $("#pd-date").value,
      vendor_name: $("#pd-vendor").value,
      purpose: $("#pd-purpose").value,
      material_type: item.material_type,
      unit_type: item.unit_type,
      quantity_sent: qtySent,
      notes: $("#pd-notes").value || null,
    });

    if (insertErr) throw insertErr;

    const newRemaining = parseFloat(item.remaining_quantity) - qtySent;
    await api.updateRawMaterialItemRemaining(item.id, newRemaining);

    showStatus(status, `Dispatched as ${batchNumber} (linked to ${item.batch_number})`, "success");
    e.target.reset();
    $("#pd-date").valueAsDate = new Date();
    $("#rm-detail-card").style.display = "none";
    await loadRawMaterialOptions();
    $("#rm-material-item").innerHTML = '<option value="">Select batch first...</option>';
  } catch (err) {
    showStatus(status, `Error: ${err.message}`, "error");
  } finally {
    btn.disabled = false;
  }
}

async function handleReceivedSubmit(e) {
  e.preventDefault();
  const status = $("#re-status");
  const btn = e.target.querySelector('button[type="submit"]');
  btn.disabled = true;
  clearStatus(status);

  try {
    const selectedOption = $("#pd-select").selectedOptions[0];
    if (!selectedOption?.dataset?.json) throw new Error("Please select a dispatch batch");
    const pd = JSON.parse(selectedOption.dataset.json);
    const outputType = $('input[name="output-type"]:checked').value;

    const { data: batchNumber, error: batchErr } = await api.getNextBatchNumber("PT-RE");
    if (batchErr) throw batchErr;

    const { error: insertErr } = await api.insertReceivedEntry({
      batch_number: batchNumber,
      process_dispatch_id: pd.id,
      parent_batch_number: pd.batch_number,
      received_date: $("#re-date").value,
      output_type: outputType,
      output_quantity: parseFloat($("#re-quantity").value),
      output_unit: outputType === "pieces" ? $("#re-unit").value : "meters",
      description: $("#re-description").value,
      notes: $("#re-notes").value || null,
    });

    if (insertErr) throw insertErr;
    await api.markDispatchReceived(pd.id);

    showStatus(status, `Received as ${batchNumber} (from ${pd.batch_number})`, "success");
    e.target.reset();
    $("#re-date").valueAsDate = new Date();
    $("#pd-detail-card").style.display = "none";
    await loadDispatchOptions();
  } catch (err) {
    showStatus(status, `Error: ${err.message}`, "error");
  } finally {
    btn.disabled = false;
  }
}

// === Init ===
function init() {
  initTabs();
  initMaterialRows();

  // Default dates to today
  $$('input[type="date"]').forEach((el) => (el.valueAsDate = new Date()));

  // Load dropdowns
  loadRawMaterialOptions();
  loadDispatchOptions();

  // Bind form submits
  $("#form-raw-material").addEventListener("submit", handleRawMaterialSubmit);
  $("#form-process-dispatch").addEventListener("submit", handleDispatchSubmit);
  $("#form-received-entry").addEventListener("submit", handleReceivedSubmit);

  // Show detail card when batch is selected
  $("#rm-select").addEventListener("change", (e) => {
    loadMaterialItemOptions(e.target.value);
    $("#rm-detail-card").style.display = "none";
  });

  $("#rm-material-item").addEventListener("change", (e) => {
    const opt = e.target.selectedOptions[0];
    if (opt?.dataset?.json) {
      showRmDetail(JSON.parse(opt.dataset.json));
    } else {
      $("#rm-detail-card").style.display = "none";
    }
  });

  $("#pd-select").addEventListener("change", (e) => {
    const opt = e.target.selectedOptions[0];
    if (opt?.dataset?.json) {
      showPdDetail(JSON.parse(opt.dataset.json));
    } else {
      $("#pd-detail-card").style.display = "none";
    }
  });

  // Toggle unit field based on output type
  $$("input[name='output-type']").forEach((radio) => {
    radio.addEventListener("change", () => {
      const isPieces = $('input[name="output-type"]:checked').value === "pieces";
      $("#re-unit-group").style.display = isPieces ? "flex" : "none";
    });
  });
}

init();
