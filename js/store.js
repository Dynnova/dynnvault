// ============================================================
// store.js — Supabase data layer (tools list + store settings)
// ============================================================

const { createClient } = supabase;
const db = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const DB = {
  // ---- Tools (sw_list table) ----
  async getTools(){
    const { data, error } = await db.from("sw_list").select("*").order("created_at", { ascending: true });
    if(error){ console.error("getTools:", error); return null; }
    return data;
  },
  async upsertTool(tool){
    const { error } = await db.from("sw_list").upsert(tool, { onConflict: "id" });
    if(error){ console.error("upsertTool:", error); return false; }
    return true;
  },
  async deleteTool(id){
    const { error } = await db.from("sw_list").delete().eq("id", id);
    if(error){ console.error("deleteTool:", error); return false; }
    return true;
  },

  // ---- Store settings (store_settings table, single row id=1) ----
  async getSettings(){
    const { data, error } = await db.from("store_settings").select("*").eq("id", 1).single();
    if(error){ console.error("getSettings:", error); return null; }
    return data;
  },
  async saveSettings(settings){
    const { error } = await db.from("store_settings").upsert({ id: 1, ...settings });
    if(error){ console.error("saveSettings:", error); return false; }
    return true;
  },

  // ---- Admin PIN (stored in store_settings row) ----
  async getPin(){
    const { data, error } = await db.from("store_settings").select("pin_hash, pin_salt").eq("id", 1).single();
    if(error) return null;
    return data;
  },
  async savePin(hash, salt){
    const { error } = await db.from("store_settings").upsert({ id: 1, pin_hash: hash, pin_salt: salt });
    if(error){ console.error("savePin:", error); return false; }
    return true;
  }
};
