import * as api from "./api.js";
import { $, $$, showStatus, clearStatus, formatCurrency } from "./utils.js";

let cachedRawMaterials = [];
let lastSubmission = null; // stores data for PDF print

const DISPATCH_TYPES = [
  { key: "karigar", label: "Karigar", desc: "Dispatch materials to a karigar for processing." },
  { key: "dyer", label: "Dyer", desc: "Dispatch materials to a dyer for processing." },
  { key: "stitch", label: "Stitch", desc: "Dispatch materials for stitching." },
  { key: "false", label: "False", desc: "Dispatch materials for false work." },
];

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

      if (DISPATCH_TYPES.some((t) => t.key === btn.dataset.tab)) {
        loadRawMaterialOptions();
      }
      if (btn.dataset.tab === "received-entry") loadDispatchOptions();
    });
  });
}

// === Raw Material Form ===
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

// === Populate Dropdowns ===
async function loadRawMaterialOptions() {
  const { data } = await api.fetchAvailableRawMaterials();
  cachedRawMaterials = data || [];

  // Refresh all batch dropdowns in dispatch forms
  document.querySelectorAll(".rm-batch-select").forEach((sel) => {
    const currentVal = sel.value;
    populateBatchDropdown(sel);
    if (currentVal) sel.value = currentVal;
  });
}

function populateBatchDropdown(selectEl) {
  selectEl.innerHTML = '<option value="">Select batch...</option>';
  cachedRawMaterials.forEach((rm) => {
    const opt = document.createElement("option");
    opt.value = rm.id;
    opt.textContent = `${rm.batch_number} — ${rm.color} (${rm.material_items.length} type${rm.material_items.length !== 1 ? "s" : ""})`;
    selectEl.append(opt);
  });
}

function populateItemDropdown(selectEl, rawMaterialId) {
  selectEl.innerHTML = '<option value="">Select material...</option>';
  const rm = cachedRawMaterials.find((x) => x.id === rawMaterialId);
  if (!rm) return;

  rm.material_items.forEach((item) => {
    const opt = document.createElement("option");
    opt.value = item.id;
    opt.dataset.json = JSON.stringify({
      ...item,
      batch_number: rm.batch_number,
      rate: rm.rate,
      vendor_name: rm.vendor_name,
      color: rm.color,
    });
    opt.textContent = `${item.material_type} — ${formatQuantity(item.remaining_quantity, item.unit_type)} available`;
    selectEl.append(opt);
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
    const typeLabel = pd.dispatch_type && pd.dispatch_type !== "legacy" ? pd.dispatch_type.toUpperCase() + " | " : "";
    const designLabel = pd.design_number ? ` [Design: ${pd.design_number}]` : "";
    opt.textContent = `${pd.batch_number} — ${typeLabel}${pd.material_type} (${formatQuantity(pd.quantity_sent, pd.unit_type)}) to ${pd.vendor_name}${designLabel}`;
    opt.dataset.json = JSON.stringify(pd);
    select.append(opt);
  });
}

// === Dispatch Form Generation ===
function initDispatchForms() {
  const container = $("#dispatch-panels");
  if (!container) return;

  DISPATCH_TYPES.forEach((type) => {
    const section = document.createElement("section");
    section.className = "tab-panel";
    section.dataset.tab = type.key;

    section.innerHTML = `
      <form id="form-${type.key}" class="card">
        <h2>${type.label} Dispatch</h2>
        <p style="color:var(--ash);margin-bottom:16px;">${type.desc}</p>
        <div class="form-grid">
          <div class="form-group">
            <label for="${type.key}-date">Dispatch Date</label>
            <input type="date" id="${type.key}-date" required />
          </div>
          <div class="form-group">
            <label for="${type.key}-vendor">Worker / Vendor Name</label>
            <input type="text" id="${type.key}-vendor" required placeholder="Worker name" />
          </div>
          <div class="form-group full-width">
            <label>Design Groups</label>
            <div class="design-groups-container"></div>
            <button type="button" class="button secondary add-design-btn" style="width:max-content;margin-top:8px;">+ Add Design</button>
          </div>
        </div>
        <div class="form-actions">
          <button type="submit" class="button primary">Dispatch to ${type.label}</button>
          <button type="button" class="button secondary print-dispatch-btn" style="display:none;">Print / Save PDF</button>
          <span class="dispatch-status"></span>
        </div>
      </form>
    `;

    const designContainer = section.querySelector(".design-groups-container");
    designContainer.appendChild(createDesignGroup());

    section.querySelector(".add-design-btn").addEventListener("click", (e) => {
      e.preventDefault();
      designContainer.appendChild(createDesignGroup());
    });

    section.querySelector("form").addEventListener("submit", (e) => handleNewDispatchSubmit(e, type.key));

    section.querySelector(".print-dispatch-btn").addEventListener("click", () => {
      handlePrintDispatch();
    });

    container.appendChild(section);
  });
}

function createDesignGroup() {
  const group = document.createElement("div");
  group.className = "design-group";

  group.innerHTML = `
    <div class="design-group-header">
      <h4>Design</h4>
      <button type="button" class="button secondary remove-design-btn" style="padding:6px 10px;font-size:0.8rem;color:var(--rose);">Remove</button>
    </div>
    <div class="form-grid" style="margin-top:0;">
      <div class="form-group">
        <label>Design Number</label>
        <input type="text" class="design-number" required placeholder="Design number" />
      </div>
      <div class="form-group">
        <label>Pieces Expected</label>
        <input type="number" class="pieces-expected" step="1" min="1" required placeholder="10" />
      </div>
    </div>
    <div class="form-group full-width" style="margin-top:12px;">
      <label>Raw Materials (max 10 per design)</label>
      <div class="rm-selections"></div>
      <button type="button" class="button secondary add-rm-btn" style="width:max-content;margin-top:4px;padding:6px 12px;font-size:0.8rem;">+ Add Raw Material</button>
    </div>
  `;

  const rmContainer = group.querySelector(".rm-selections");
  rmContainer.appendChild(createRmSelectionRow());

  group.querySelector(".add-rm-btn").addEventListener("click", (e) => {
    e.preventDefault();
    if (rmContainer.querySelectorAll(".rm-selection-row").length >= 10) {
      alert("Maximum 10 raw materials per design.");
      return;
    }
    rmContainer.appendChild(createRmSelectionRow());
  });

  group.querySelector(".remove-design-btn").addEventListener("click", () => {
    const container = group.parentElement;
    if (container.querySelectorAll(".design-group").length > 1) {
      group.remove();
    }
  });

  return group;
}

function createRmSelectionRow() {
  const row = document.createElement("div");
  row.className = "rm-selection-row";

  row.innerHTML = `
    <select class="rm-batch-select" required>
      <option value="">Select batch...</option>
    </select>
    <select class="rm-item-select" required>
      <option value="">Select material...</option>
    </select>
    <input type="number" class="rm-qty-sent" step="0.01" min="0.01" required placeholder="Qty" />
    <input type="text" class="rm-row-notes" placeholder="Notes" />
    <button type="button" class="button secondary rm-remove-sel" style="padding:6px 10px;font-size:0.8rem;">Remove</button>
  `;

  const batchSel = row.querySelector(".rm-batch-select");
  const itemSel = row.querySelector(".rm-item-select");

  populateBatchDropdown(batchSel);

  batchSel.addEventListener("change", () => {
    populateItemDropdown(itemSel, batchSel.value);
  });

  row.querySelector(".rm-remove-sel").addEventListener("click", () => {
    const container = row.parentElement;
    if (container.querySelectorAll(".rm-selection-row").length > 1) {
      row.remove();
    }
  });

  return row;
}

// === Dispatch Submission ===
async function handleNewDispatchSubmit(e, dispatchType) {
  e.preventDefault();
  const form = e.target;
  const statusEl = form.querySelector(".dispatch-status");
  const submitBtn = form.querySelector('button[type="submit"]');
  const printBtn = form.querySelector(".print-dispatch-btn");
  submitBtn.disabled = true;
  printBtn.style.display = "none";
  clearStatus(statusEl);

  try {
    const date = form.querySelector(`#${dispatchType}-date`).value;
    const vendor = form.querySelector(`#${dispatchType}-vendor`).value.trim();
    if (!date || !vendor) throw new Error("Please fill date and vendor name.");

    const designGroups = form.querySelectorAll(".design-group");
    if (designGroups.length === 0) throw new Error("Add at least one design group.");

    const dispatchGroupId = crypto.randomUUID();
    const records = [];
    const quantityByItem = {}; // track cumulative quantities per raw_material_item_id

    // Collect submission data for PDF
    const pdfDesigns = [];

    for (const group of designGroups) {
      const designNumber = group.querySelector(".design-number").value.trim();
      const piecesExpected = parseFloat(group.querySelector(".pieces-expected").value);

      if (!designNumber) throw new Error("Please fill all design numbers.");
      if (!piecesExpected || piecesExpected <= 0) throw new Error("Please fill pieces expected for all designs.");

      const rmRows = group.querySelectorAll(".rm-selection-row");
      if (rmRows.length === 0) throw new Error(`Design "${designNumber}" needs at least one raw material.`);

      const pdfMaterials = [];

      for (const row of rmRows) {
        const itemSelect = row.querySelector(".rm-item-select");
        const selectedOpt = itemSelect.selectedOptions[0];
        if (!selectedOpt?.dataset?.json) throw new Error(`Please select a material for design "${designNumber}".`);

        const item = JSON.parse(selectedOpt.dataset.json);
        const qtySent = parseFloat(row.querySelector(".rm-qty-sent").value);
        const notes = row.querySelector(".rm-row-notes").value.trim() || null;

        if (!qtySent || qtySent <= 0) throw new Error("Quantity must be greater than 0.");

        // Track cumulative quantity per item
        quantityByItem[item.id] = (quantityByItem[item.id] || 0) + qtySent;
        if (quantityByItem[item.id] > parseFloat(item.remaining_quantity)) {
          throw new Error(
            `Total quantity for ${item.material_type} (${item.batch_number}) exceeds available ${item.remaining_quantity}. You're trying to send ${quantityByItem[item.id]}.`
          );
        }

        records.push({
          raw_material_id: item.raw_material_id,
          raw_material_item_id: item.id,
          parent_batch_number: item.batch_number,
          dispatch_date: date,
          vendor_name: vendor,
          purpose: dispatchType,
          material_type: item.material_type,
          unit_type: item.unit_type,
          quantity_sent: qtySent,
          dispatch_type: dispatchType,
          dispatch_group_id: dispatchGroupId,
          design_number: designNumber,
          pieces_expected: piecesExpected,
          notes: notes,
        });

        pdfMaterials.push({
          batch: item.batch_number,
          color: item.color,
          material: item.material_type,
          unitType: item.unit_type,
          qtySent,
          notes,
        });
      }

      pdfDesigns.push({ designNumber, piecesExpected, materials: pdfMaterials });
    }

    // Get batch numbers for all records
    const batchNumbers = [];
    for (let i = 0; i < records.length; i++) {
      const { data: batchNumber, error: batchErr } = await api.getNextBatchNumber("PT-PD");
      if (batchErr) throw batchErr;
      batchNumbers.push(batchNumber);
    }

    // Assign batch numbers
    records.forEach((r, i) => (r.batch_number = batchNumbers[i]));

    // Insert all dispatch records
    const { error: insertErr } = await api.insertProcessDispatchBatch(records);
    if (insertErr) throw insertErr;

    // Update remaining quantities
    const itemUpdates = {};
    for (const record of records) {
      const item = cachedRawMaterials
        .flatMap((rm) => rm.material_items)
        .find((i) => i.id === record.raw_material_item_id);
      if (item) {
        if (!itemUpdates[item.id]) {
          itemUpdates[item.id] = parseFloat(item.remaining_quantity);
        }
        itemUpdates[item.id] -= record.quantity_sent;
      }
    }

    await Promise.all(
      Object.entries(itemUpdates).map(([id, newRemaining]) =>
        api.updateRawMaterialItemRemaining(id, newRemaining)
      )
    );

    // Store for PDF
    lastSubmission = {
      dispatchType,
      date,
      vendor,
      batchNumbers,
      designs: pdfDesigns,
      groupId: dispatchGroupId,
    };

    showStatus(statusEl, `Dispatched ${records.length} item(s) as ${batchNumbers[0]}${batchNumbers.length > 1 ? " ... " + batchNumbers[batchNumbers.length - 1] : ""}`, "success");
    printBtn.style.display = "inline-flex";

    // Reset form
    form.reset();
    form.querySelector(`#${dispatchType}-date`).valueAsDate = new Date();
    const designContainer = form.querySelector(".design-groups-container");
    designContainer.innerHTML = "";
    designContainer.appendChild(createDesignGroup());

    await loadRawMaterialOptions();
  } catch (err) {
    showStatus(statusEl, `Error: ${err.message}`, "error");
  } finally {
    submitBtn.disabled = false;
  }
}

// === PDF / Print ===
function showPrintView(data) {
  const container = $("#print-dispatch-view");
  if (!data) return;

  const designsHtml = data.designs
    .map(
      (d) => `
    <div class="print-design-title">Design: ${d.designNumber} &mdash; ${d.piecesExpected} pieces expected</div>
    <table class="print-table">
      <thead>
        <tr>
          <th>Batch</th>
          <th>Color</th>
          <th>Material</th>
          <th>Qty Sent</th>
          <th>Notes</th>
        </tr>
      </thead>
      <tbody>
        ${d.materials
          .map(
            (m) => `<tr>
          <td>${m.batch}</td>
          <td>${m.color}</td>
          <td>${m.material}</td>
          <td>${formatQuantity(m.qtySent, m.unitType)}</td>
          <td>${m.notes || "—"}</td>
        </tr>`
          )
          .join("")}
      </tbody>
    </table>
  `
    )
    .join("");

  container.innerHTML = `
    <div class="print-header">
      <h2>PARIDHI SAREES PVT. LTD.</h2>
      <p>30A, BURTOLLA STREET, BURA BAZAR</p>
      <p>KOLKATA-700 007. WEST BENGAL</p>
      <p>Gstin: 19AABCP5456B1ZJ &nbsp;&middot;&nbsp; Ph No: +91 8017077485</p>
    </div>
    <div class="print-meta">
      <div><strong>Type:</strong> ${data.dispatchType.toUpperCase()}</div>
      <div><strong>Date:</strong> ${data.date}</div>
      <div><strong>Vendor:</strong> ${data.vendor}</div>
    </div>
    ${designsHtml}
  `;
}

function handlePrintDispatch() {
  if (!lastSubmission) return;
  showPrintView(lastSubmission);
  window.print();
}

// === Received Entry ===
function showPdDetail(pd) {
  const card = $("#pd-detail-card");
  card.style.display = "grid";
  const typeLabel = pd.dispatch_type && pd.dispatch_type !== "legacy" ? pd.dispatch_type.toUpperCase() : "";
  card.innerHTML = `
    <div class="stat"><span>Batch</span><strong>${pd.batch_number}</strong></div>
    <div class="stat"><span>From</span><strong>${pd.parent_batch_number}</strong></div>
    ${typeLabel ? `<div class="stat"><span>Type</span><strong>${typeLabel}</strong></div>` : ""}
    <div class="stat"><span>Material</span><strong>${pd.material_type}</strong></div>
    <div class="stat"><span>Vendor</span><strong>${pd.vendor_name}</strong></div>
    <div class="stat"><span>Purpose</span><strong>${pd.purpose}</strong></div>
    <div class="stat"><span>Sent</span><strong>${formatQuantity(pd.quantity_sent, pd.unit_type)}</strong></div>
    ${pd.design_number ? `<div class="stat"><span>Design</span><strong>${pd.design_number}</strong></div>` : ""}
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

    const { data: rawMaterial, error } = await api.insertRawMaterial({
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
  initDispatchForms();

  // Default dates to today
  $$('input[type="date"]').forEach((el) => (el.valueAsDate = new Date()));

  // Load dropdowns
  loadRawMaterialOptions();
  loadDispatchOptions();

  // Bind form submits
  $("#form-raw-material").addEventListener("submit", handleRawMaterialSubmit);
  $("#form-received-entry").addEventListener("submit", handleReceivedSubmit);

  // Show detail card when dispatch batch is selected (received entry tab)
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
