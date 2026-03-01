import { supabase } from "../data/supabase.js";

// === Batch Numbers ===
export async function getNextBatchNumber(prefix) {
  return supabase.rpc("next_batch_number", { p_prefix: prefix });
}

// === Raw Materials ===
export async function insertRawMaterial(record) {
  return supabase.from("raw_materials").insert(record).select().single();
}

export async function insertRawMaterialItems(records) {
  return supabase.from("raw_material_items").insert(records).select();
}

export async function fetchRawMaterials() {
  const [rmRes, itemsRes] = await Promise.all([
    supabase.from("raw_materials").select("*").order("created_at", { ascending: false }),
    supabase.from("raw_material_items").select("*").order("created_at", { ascending: false }),
  ]);

  return {
    data: attachItems(rmRes.data || [], itemsRes.data || []),
    error: rmRes.error || itemsRes.error,
  };
}

export async function fetchAvailableRawMaterials() {
  const [rmRes, itemsRes] = await Promise.all([
    supabase.from("raw_materials").select("*").order("created_at", { ascending: false }),
    supabase
      .from("raw_material_items")
      .select("*")
      .gt("remaining_quantity", 0)
      .order("created_at", { ascending: false }),
  ]);

  const materials = attachItems(rmRes.data || [], itemsRes.data || []).filter((rm) => rm.material_items.length > 0);
  return {
    data: materials,
    error: rmRes.error || itemsRes.error,
  };
}

export async function updateRawMaterialItemRemaining(id, newRemaining) {
  return supabase.from("raw_material_items").update({ remaining_quantity: newRemaining }).eq("id", id);
}

// === Process Dispatches (Point 2) ===
export async function insertProcessDispatch(record) {
  return supabase.from("process_dispatches").insert(record).select().single();
}

export async function fetchProcessDispatches() {
  return supabase.from("process_dispatches").select("*").order("created_at", { ascending: false });
}

export async function fetchPendingDispatches() {
  return supabase.from("process_dispatches").select("*").eq("status", "dispatched").order("created_at", { ascending: false });
}

export async function updateDispatchStatus(id, status) {
  return supabase.from("process_dispatches").update({ status }).eq("id", id);
}

export async function markDispatchReceived(id) {
  return supabase
    .from("process_dispatches")
    .update({ status: "received" })
    .eq("id", id);
    return updateDispatchStatus(id, "received");
}

// === Received Entries (Point 3) ===
export async function insertReceivedEntry(record) {
  return supabase.from("received_entries").insert(record).select().single();
}

export async function fetchReceivedEntries() {
  return supabase.from("received_entries").select("*").order("created_at", { ascending: false });
}

// === Deletes ===
export async function deleteRawMaterial(id) {
  return supabase.from("raw_materials").delete().eq("id", id);
}

export async function deleteProcessDispatch(id) {
  return supabase.from("process_dispatches").delete().eq("id", id);
}

export async function deleteReceivedEntry(id) {
  return supabase.from("received_entries").delete().eq("id", id);
}

// === Aggregated Queries ===
export async function fetchFullLineage() {
  const [rm, items, pd, re] = await Promise.all([
    supabase.from("raw_materials").select("*").order("created_at", { ascending: false }),
    supabase.from("raw_material_items").select("*").order("created_at", { ascending: false }),
    supabase.from("process_dispatches").select("*").order("created_at", { ascending: false }),
    supabase.from("received_entries").select("*").order("created_at", { ascending: false }),
  ]);
  return {
    rawMaterials: attachItems(rm.data || [], items.data || []),
    rawMaterialItems: items.data || [],
    processDispatches: pd.data || [],
    receivedEntries: re.data || [],
  };
}
function attachItems(rawMaterials, items) {
  const itemsByRawId = items.reduce((acc, item) => {
    if (!acc[item.raw_material_id]) acc[item.raw_material_id] = [];
    acc[item.raw_material_id].push(item);
    return acc;
  }, {});

  return rawMaterials.map((rm) => ({
    ...rm,
    material_items: itemsByRawId[rm.id] || [],
  }));
}