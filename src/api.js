// src/api.js — strict minimal update to match backend/routes/views.py
// No env vars changed. No default export. Named exports only.
// Base URL comes from Connect tab via localStorage('backend_url'); if absent, uses relative paths.

function viewsPath(p){
  let base = "";
  try {
    base = (localStorage.getItem("backend_url") || "").replace(/\/+$/,"");
  } catch(_) { base = ""; }
  return base ? (base + "/views" + p) : ("/views" + p);
}

async function getJSON(path){
  const r = await fetch(viewsPath(path), { credentials: "same-origin" });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return r.json();
}

async function postJSON(path, body){
  const r = await fetch(viewsPath(path), {
    method: "POST",
    headers: { "Content-Type":"application/json" },
    credentials: "same-origin",
    body: JSON.stringify(body || {}),
  });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return r.json();
}

// Keep original function names used by tabs:

// returns [{ id, name }]
export async function listForecastIds(/* opts */){
  const arr = await getJSON("/forecasts");
  return (Array.isArray(arr) ? arr : []).map(v => ({ id: String(v), name: String(v) }));
}

// Supports both old and new payload shapes
export async function queryView(payload){
  payload = payload || {};

  // New shape: { forecast_name, month: 'YYYY-MM', span }
  if (payload.forecast_name && payload.month){
    return postJSON("/query", {
      forecast_name: String(payload.forecast_name),
      month: String(payload.month).slice(0,7),
      span: Number(payload.span || 1),
    });
  }

  // Old shape: { forecast_id, date_from:'YYYY-MM-DD', date_to:'YYYY-MM-DD' }
  if (payload.forecast_id && payload.date_from){
    const forecast_name = String(payload.forecast_id);
    const month = String(payload.date_from).slice(0,7);
    let span = 1;
    if (payload.date_to){
      const [y1,m1] = month.split("-").map(Number);
      const mstr = String(payload.date_to).slice(0,7);
      const [y2,m2] = mstr.split("-").map(Number);
      const calc = (y2 - y1) * 12 + (m2 - m1) + 1;
      if (Number.isFinite(calc) && calc >= 1) span = calc;
    }
    return postJSON("/query", { forecast_name, month, span });
  }

  // Fallback: pass through to /views/query
  return postJSON("/query", payload);
}
