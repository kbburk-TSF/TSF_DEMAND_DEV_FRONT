// src/api.js — minimal shim to new /views endpoints ONLY.
// No environment variables. Uses backend_url from localStorage if present.

function base() {
  const b = (typeof localStorage !== "undefined" ? (localStorage.getItem("backend_url") || "") : "").replace(/\/+$/,"");
  return b || "";
}
function url(path){ const b = base(); return (b ? (b + path) : path); }

async function getJSON(path){
  const r = await fetch(url(path), { credentials: "same-origin" });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return r.json();
}
async function postJSON(path, body){
  const r = await fetch(url(path), {
    method: "POST",
    headers: { "Content-Type":"application/json" },
    credentials: "same-origin",
    body: JSON.stringify(body||{}),
  });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return r.json();
}

// ===== Public, backward-compatible surface =====

// Older tabs call this with an options object we ignore.
// We must return [{id,name}] even though /views/forecasts returns [string].
export async function listForecastIds(/*opts*/){
  const arr = await getJSON("/views/forecasts");
  return (Array.isArray(arr) ? arr : []).map(v => ({ id: String(v), name: String(v) }));
}

/**
 * queryView(payload)
 * Supports both the new payload { forecast_name, month:"YYYY-MM", span }
 * and the old payload { forecast_id, date_from:"YYYY-MM-DD", date_to:"YYYY-MM-DD" }.
 * In the old shape, we translate to month/span to hit /views/query.
 */
export async function queryView(payload){
  if (!payload || typeof payload !== "object") payload = {};
  // New shape straight-through
  if (payload.forecast_name && payload.month){
    return postJSON("/views/query", {
      forecast_name: String(payload.forecast_name),
      month: String(payload.month).slice(0,7),
      span: Number(payload.span || 1)
    });
  }
  // Old shape translation
  if (payload.forecast_id && payload.date_from){
    const fname = String(payload.forecast_id);
    const m = String(payload.date_from).slice(0,7);
    let span = 1;
    if (payload.date_to){
      const [y1,m1] = m.split("-").map(Number);
      const m2 = String(payload.date_to).slice(0,7);
      const [y2,m22] = m2.split("-").map(Number);
      span = (y2 - y1) * 12 + (m22 - m1) + 1;
      if (!Number.isFinite(span) || span < 1) span = 1;
    }
    return postJSON("/views/query", { forecast_name: fname, month: m, span });
  }
  // Fallback: try POSTing to /views/query with whatever fields we received.
  return postJSON("/views/query", payload);
}

export default { listForecastIds, queryView };
