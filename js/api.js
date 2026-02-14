import { supabase } from "../data/supabase.js";

// === Batch Numbers ===
export async function getNextBatchNumber(prefix) {
  return supabase.rpc("next_batch_number", { p_prefix: prefix });
}

// === Raw Materials (Point 1) ===
export async function insertRawMaterial(record) {
  return supabase.from("raw_materials").insert(record).select().single();
}

export async function fetchRawMaterials() {
  return supabase
    .from("raw_materials")
    .select("*")
    .order("created_at", { ascending: false });
}

export async function fetchAvailableRawMaterials() {
  return supabase
    .from("raw_materials")
    .select("*")
    .gt("remaining_meters", 0)
    .order("created_at", { ascending: false });
}

export async function updateRawMaterialRemaining(id, newRemaining) {
  return supabase
    .from("raw_materials")
    .update({ remaining_meters: newRemaining })
    .eq("id", id);
}

// === Process Dispatches (Point 2) ===
export async function insertProcessDispatch(record) {
  return supabase.from("process_dispatches").insert(record).select().single();
}

export async function fetchProcessDispatches() {
  return supabase
    .from("process_dispatches")
    .select("*")
    .order("created_at", { ascending: false });
}

export async function fetchPendingDispatches() {
  return supabase
    .from("process_dispatches")
    .select("*")
    .eq("status", "dispatched")
    .order("created_at", { ascending: false });
}

export async function markDispatchReceived(id) {
  return supabase
    .from("process_dispatches")
    .update({ status: "received" })
    .eq("id", id);
}

// === Received Entries (Point 3) ===
export async function insertReceivedEntry(record) {
  return supabase.from("received_entries").insert(record).select().single();
}

export async function fetchReceivedEntries() {
  return supabase
    .from("received_entries")
    .select("*")
    .order("created_at", { ascending: false });
}

// === Aggregated Queries ===
export async function fetchFullLineage() {
  const [rm, pd, re] = await Promise.all([
    supabase
      .from("raw_materials")
      .select("*")
      .order("created_at", { ascending: false }),
    supabase
      .from("process_dispatches")
      .select("*")
      .order("created_at", { ascending: false }),
    supabase
      .from("received_entries")
      .select("*")
      .order("created_at", { ascending: false }),
  ]);
  return {
    rawMaterials: rm.data || [],
    processDispatches: pd.data || [],
    receivedEntries: re.data || [],
  };
}
