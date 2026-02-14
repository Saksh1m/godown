import * as api from "./api.js";
import { $, $$, showStatus, clearStatus, formatMeters, formatCurrency } from "./utils.js";

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
async function loadRawMaterialOptions() {
  const { data } = await api.fetchAvailableRawMaterials();
  const select = $("#rm-select");
  select.innerHTML = '<option value="">Select a raw material batch...</option>';
  if (!data || data.length === 0) {
    select.innerHTML = '<option value="">No raw materials available</option>';
    return;
  }
  data.forEach((rm) => {
    const opt = document.createElement("option");
    opt.value = rm.id;
    opt.textContent = `${rm.batch_number} — ${rm.color} ${rm.material_type} (${formatMeters(rm.remaining_meters)} available)`;
    opt.dataset.json = JSON.stringify(rm);
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
    opt.textContent = `${pd.batch_number} — ${pd.length_sent}m to ${pd.vendor_name} (${pd.purpose})`;
    opt.dataset.json = JSON.stringify(pd);
    select.append(opt);
  });
}

// === Detail Preview Cards ===
function showRmDetail(rm) {
  const card = $("#rm-detail-card");
  card.style.display = "grid";
  card.innerHTML = `
    <div class="stat"><span>Batch</span><strong>${rm.batch_number}</strong></div>
    <div class="stat"><span>Material</span><strong>${rm.color} ${rm.material_type}</strong></div>
    <div class="stat"><span>Available</span><strong>${formatMeters(rm.remaining_meters)}</strong></div>
    <div class="stat"><span>Total</span><strong>${formatMeters(rm.length_meters)}</strong></div>
    <div class="stat"><span>Cost</span><strong>${formatCurrency(rm.cost)}</strong></div>
    <div class="stat"><span>Vendor</span><strong>${rm.vendor_name}</strong></div>
  `;
}

function showPdDetail(pd) {
  const card = $("#pd-detail-card");
  card.style.display = "grid";
  card.innerHTML = `
    <div class="stat"><span>Batch</span><strong>${pd.batch_number}</strong></div>
    <div class="stat"><span>From</span><strong>${pd.parent_batch_number}</strong></div>
    <div class="stat"><span>Vendor</span><strong>${pd.vendor_name}</strong></div>
    <div class="stat"><span>Purpose</span><strong>${pd.purpose}</strong></div>
    <div class="stat"><span>Length Sent</span><strong>${formatMeters(pd.length_sent)}</strong></div>
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
    const length = parseFloat($("#rm-length").value);
    const { data: batchNumber, error: batchErr } = await api.getNextBatchNumber("PT-RM");
    if (batchErr) throw batchErr;

    const { error } = await api.insertRawMaterial({
      batch_number: batchNumber,
      entry_date: $("#rm-date").value,
      length_meters: length,
      remaining_meters: length,
      cost: parseFloat($("#rm-cost").value),
      material_type: $("#rm-material").value,
      color: $("#rm-color").value,
      vendor_name: $("#rm-vendor").value,
      notes: $("#rm-notes").value || null,
    });

    if (error) throw error;
    showStatus(status, `Recorded as ${batchNumber}`, "success");
    e.target.reset();
    $("#rm-date").valueAsDate = new Date();
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
    const selectedOption = $("#rm-select").selectedOptions[0];
    if (!selectedOption?.dataset?.json) throw new Error("Please select a raw material batch");
    const rm = JSON.parse(selectedOption.dataset.json);
    const lengthSent = parseFloat($("#pd-length").value);

    if (lengthSent > parseFloat(rm.remaining_meters)) {
      throw new Error(`Cannot send ${lengthSent}m. Only ${rm.remaining_meters}m available.`);
    }

    const { data: batchNumber, error: batchErr } = await api.getNextBatchNumber("PT-PD");
    if (batchErr) throw batchErr;

    const { error: insertErr } = await api.insertProcessDispatch({
      batch_number: batchNumber,
      raw_material_id: rm.id,
      parent_batch_number: rm.batch_number,
      dispatch_date: $("#pd-date").value,
      vendor_name: $("#pd-vendor").value,
      purpose: $("#pd-purpose").value,
      length_sent: lengthSent,
      notes: $("#pd-notes").value || null,
    });

    if (insertErr) throw insertErr;

    const newRemaining = parseFloat(rm.remaining_meters) - lengthSent;
    await api.updateRawMaterialRemaining(rm.id, newRemaining);

    showStatus(status, `Dispatched as ${batchNumber} (linked to ${rm.batch_number})`, "success");
    e.target.reset();
    $("#pd-date").valueAsDate = new Date();
    $("#rm-detail-card").style.display = "none";
    await loadRawMaterialOptions();
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
  $$('input[name="output-type"]').forEach((radio) => {
    radio.addEventListener("change", () => {
      const isPieces = $('input[name="output-type"]:checked').value === "pieces";
      $("#re-unit-group").style.display = isPieces ? "flex" : "none";
    });
  });
}

init();
